import React, { useRef, useState, useMemo, useEffect } from 'react';
import { BsArrowLeft, BsCheckLg } from 'react-icons/bs';
import Image from 'next/image';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import {
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import nProgress from 'nprogress';

import { db, storage } from '@lms/db';
import { useFileHandler, useUploadImage } from '@src/hooks';
import { Select, TextInput } from '@src/components/Inputs';
import {
  ADD_BOOK_TEXT_INPUTS,
  BOOK_GENRES_FICTION,
  BOOK_GENRES_NONFICTION,
  GENRE_TYPES,
} from '@src/constants';
import { AlgoBookDoc, GenreType, GenreTypes, ISBNType } from '@lms/types';
import { hasDuplicateString } from '@src/utils';
import Loader from '@src/components/Loader';
import { useNextQuery } from '@lms/ui';
import { useRouter } from 'next/router';

Modal.setAppElement('#__next');

const modalCustomStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
    borderRadius: '15px',
  },
};

const ISBNModal = ({
  isModalOpen,
  setIsModalOpen,
  quantity,
  ISBNs,
  setISBNs,
}: {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  quantity: number;
  ISBNs: string[];
  setISBNs: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const inputs = useMemo(() => {
    return new Array(quantity).fill(0).map((_, i) => `isbn-${i + 1}`);
  }, [quantity]);

  const handleClose = () => {
    if (hasDuplicateString(ISBNs)) {
      toast.error('ISBNs must be unique');
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={handleClose}
      contentLabel='ISBN Modal'
      style={modalCustomStyle}
      closeTimeoutMS={200}
    >
      <div className='space-y-3'>
        <div className='flex space-x-3 items-center'>
          <button type='button' onClick={handleClose}>
            <BsArrowLeft className='h-8 w-8 text-primary' />
          </button>
          <div className='text-3xl font-semibold text-primary'>ISBNs</div>
        </div>
        <div className='space-y-3'>
          {inputs.map((input, i) => {
            return (
              <TextInput
                key={input}
                title={`ISBN ${i + 1}`}
                inputProps={{
                  value: ISBNs[i],
                  onChange: (e) => {
                    setISBNs((prev) => {
                      const newISBNs = [...prev];
                      newISBNs[i] = e.target.value;
                      return newISBNs;
                    });
                  },
                }}
              />
            );
          })}
        </div>
        <div className='flex justify-end'>
          <button
            type='button'
            className='bg-primary text-white rounded-lg px-3 py-2'
            onClick={handleClose}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface AddBookProps {
  bookDetails: AlgoBookDoc;
  books: AlgoBookDoc[];
  setBooks: React.Dispatch<React.SetStateAction<AlgoBookDoc[]>>;
}

const BookDetails = ({ bookDetails, books, setBooks }: AddBookProps) => {
  const [handleBookImage, bookFile, bookImage, clearImage] =
    useFileHandler();
  const { uploadImage } = useUploadImage();
  const bookId = useNextQuery('bookId');
  const router = useRouter();

  const bookImageRef = useRef<HTMLInputElement>(null);

  const [isISBNModalOpen, setIsISBNModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [accessionNumber, setAccessionNumber] = useState('');
  const [genreType, setGenreType] = useState<GenreType>('' as GenreType);
  const [genre, setGenre] = useState<GenreTypes>('' as GenreTypes);
  const [quantity, setQuantity] = useState(1);
  const [ISBNs, setISBNs] = useState<string[]>([]);
  const [image, setImage] = useState('');

  useEffect(() => {
    const setDetails = () => {
      setTitle(bookDetails.title);
      setAuthor(bookDetails.author);
      setPublisher(bookDetails.publisher);
      setAccessionNumber(bookDetails.accessionNumber);
      setGenreType(bookDetails.genreType);
      setGenre(bookDetails.genre);
      setQuantity(bookDetails.quantity);
      setImage(bookDetails.imageCover.url);

      const newISBNs: string[] = [];
      bookDetails.isbns.forEach(({ isbn }) => {
        newISBNs.push(isbn);
      });

      setISBNs(newISBNs);
    };

    if (bookDetails) setDetails();
  }, [bookDetails]);

  const textInputs = [
    {
      value: title,
      setValue: setTitle,
    },
    {
      value: author,
      setValue: setAuthor,
    },
    {
      value: publisher,
      setValue: setPublisher,
    },
    {
      value: accessionNumber,
      setValue: setAccessionNumber,
    },
  ];

  const noChanges = () => {
    if (bookDetails) {
      return title === bookDetails.title &&
        author === bookDetails.author &&
        publisher === bookDetails.publisher &&
        accessionNumber === bookDetails.accessionNumber &&
        genreType === bookDetails.genreType &&
        genre === bookDetails.genre &&
        quantity === bookDetails.quantity &&
        image === bookDetails.imageCover.url &&
        bookDetails.isbns
        ? ISBNs.every(
            (isbn, i) => isbn === bookDetails.isbns[i]?.isbn || ''
          )
        : false;
    }

    return false;
  };

  const handleUpdateBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (noChanges()) {
      toast.error('No changes made');
      return;
    }

    if (quantity > ISBNs.length || ISBNs.some((isbn) => isbn === '')) {
      toast.error('Please fill in all ISBNs');
      return;
    }

    if (hasDuplicateString(ISBNs)) {
      toast.error('ISBNs must be unique');
      return;
    }

    const imageCheck = image ? !image : !bookFile || !bookImage;

    if (imageCheck) {
      toast.error('Please upload a book cover');
      return;
    }

    try {
      setIsUploading(true);
      nProgress.configure({ showSpinner: true });
      nProgress.start();

      const timestamp = serverTimestamp();
      const payload: any = {
        title,
        author,
        publisher,
        accessionNumber,
        genreType,
        genre,
        quantity: increment(quantity - bookDetails.quantity),
        available: increment(quantity - bookDetails.quantity),
        updatedAt: timestamp,
      };

      const newISBNsToAdd: ISBNType[] = [];

      if (quantity > bookDetails.quantity) {
        const addedISBNs = ISBNs.slice(bookDetails.quantity);

        addedISBNs.forEach((isbn) => {
          const newISBN = {
            isbn,
            // isAvailable: true,
            status: 'Available',
          } as ISBNType;

          newISBNsToAdd.push(newISBN);
        });

        payload.isbns = arrayUnion(...newISBNsToAdd);
      }

      if (bookFile) {
        const imageCover = await uploadImage('books', bookFile);
        if (imageCover) {
          payload.imageCover = imageCover;

          const imageRef = ref(storage, bookDetails.imageCover.url);
          await deleteObject(imageRef);
        }
      }

      const bookRef = doc(db, 'books', bookId || '');
      // const updatedBook = await updateDoc(bookRef, {...payload});
      await updateDoc(bookRef, { ...payload });

      const filteredBooks = books.filter(
        (book) => book.id !== bookId || ''
      );
      const updatedBooks = [
        {
          id: bookId || '',
          title,
          author,
          publisher,
          accessionNumber,
          genreType,
          genre,
          quantity,
          available:
            bookDetails.available + (quantity - bookDetails.quantity),
          imageCover: payload.imageCover || bookDetails.imageCover,
          isbns: [...bookDetails.isbns, ...newISBNsToAdd],
        },
        ...filteredBooks,
      ] as AlgoBookDoc[];
      setBooks(updatedBooks);

      toast.success('Book updated successfully');

      nProgress.done();
      setIsUploading(false);
    } catch (error) {
      console.log('error updating', error);
      toast.error('Something went wrong! Please try again later.');
      nProgress.done();
      setIsUploading(false);
    }
  };

  const renderISBNerror = () => {
    if (quantity > ISBNs.length || ISBNs.some((isbn) => isbn === '')) {
      return (
        <div className='text-sm text-red-500'>Please enter all ISBN</div>
      );
    }

    if (hasDuplicateString(ISBNs)) {
      return (
        <div className='text-sm text-red-500'>ISBNs must be unique</div>
      );
    }

    return <BsCheckLg className='text-green-500' />;
  };

  return (
    <div
      className={`w-full h-full absolute top-0 duration-300 overflow-y-scroll transition-all custom-scrollbar space-y-4 ${
        bookId ? 'translate-x-0' : 'translate-x-[100%]'
      }`}
    >
      <div className='flex space-x-3 items-center'>
        <button type='button' onClick={() => router.back()}>
          <BsArrowLeft className='h-8 w-8 text-primary' />
        </button>
        <div className='text-3xl font-semibold text-primary'>
          Book details
        </div>
      </div>
      <div className='w-full min-h-auto flex space-x-10'>
        <form className='space-y-3' onSubmit={handleUpdateBook}>
          {ADD_BOOK_TEXT_INPUTS.map((text, i) => (
            <TextInput
              key={text}
              title={text}
              inputProps={{
                type: 'text',
                placeholder: text,
                required: true,
                value: textInputs[i].value,
                onChange: (e) => textInputs[i].setValue(e.target.value),
              }}
            />
          ))}
          <Select
            title='Genre Type'
            options={GENRE_TYPES}
            setValue={setGenreType}
            inputProps={{
              required: true,
            }}
            value={genreType}
          />
          <Select
            title='Genre'
            options={
              genreType === 'Fiction'
                ? BOOK_GENRES_FICTION
                : BOOK_GENRES_NONFICTION
            }
            setValue={setGenre}
            inputProps={{
              disabled: !genreType,
              required: true,
            }}
            value={genre}
            // dep={genreType}
          />
          <TextInput
            title='Quantity'
            inputProps={{
              type: 'number',
              min: bookDetails?.quantity || 1,
              // defaultValue: 1,
              required: true,
              value: quantity,
              onChange(e) {
                if (Number(e.target.value) < quantity) {
                  setISBNs((prev) =>
                    prev.slice(0, Number(e.target.value))
                  );
                }

                setQuantity(Number(e.target.value));
              },
            }}
          />
          <div className='flex flex-col w-full text-sm lg:items-center lg:flex-row lg:text-base lg:space-x-3'>
            <div className='mb-2 font-normal lg:mb-0 w-[120px] flex-none text-gray-500'>
              ISBN
            </div>
            <button
              type='button'
              className='bg-primary text-white rounded-lg px-3 py-1'
              onClick={() => setIsISBNModalOpen(true)}
            >
              Enter ISBNs
            </button>
            {renderISBNerror()}
            <ISBNModal
              isModalOpen={isISBNModalOpen}
              setIsModalOpen={setIsISBNModalOpen}
              quantity={quantity}
              ISBNs={ISBNs}
              setISBNs={setISBNs}
            />
          </div>
          <button
            disabled={noChanges() || isUploading}
            type='submit'
            className={`w-full mt-6 text-white rounded-lg px-5 py-3 ${
              noChanges() || isUploading
                ? 'bg-neutral-600 cursor-not-allowed'
                : 'bg-primary'
            }`}
          >
            Update book
          </button>
          <Modal
            isOpen={isUploading}
            contentLabel='Modal - Update book'
            style={{
              content: {
                ...modalCustomStyle.content,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'transparent',
              },
            }}
            closeTimeoutMS={200}
          >
            <Loader message='Updating book' />
          </Modal>
        </form>
        <div>
          {bookImage || image ? (
            <div className='space-y-2'>
              <div className='relative h-[250px] w-[200px] rounded-xl overflow-hidden'>
                <Image
                  src={bookImage || image}
                  layout='fill'
                  objectFit='cover'
                  objectPosition='center'
                />
              </div>
              <button
                type='button'
                onClick={() => {
                  if (image) setImage('');
                  if (bookImage || bookFile) clearImage();
                }}
                className='bg-primary text-white w-full py-[2px] rounded-md'
              >
                Clear image
              </button>
            </div>
          ) : (
            <>
              <button
                type='button'
                className='w-[200px] h-[250px] bg-primary text-white rounded-2xl'
                onClick={() => bookImageRef.current?.click()}
              >
                + Add Book Cover
              </button>
              <input
                ref={bookImageRef}
                className='hidden'
                // accept only jpg, jpeg, png
                accept='image/jpeg, image/png, image/jpg'
                type='file'
                onChange={handleBookImage}
                required
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
