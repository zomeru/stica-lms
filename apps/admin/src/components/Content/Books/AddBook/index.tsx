import React, { useRef, useState, useMemo } from 'react';
import { BsArrowLeft, BsCheckLg } from 'react-icons/bs';
import Image from 'next/image';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';

import { db } from '@lms/db';
import { useFileHandler, useUploadImage } from '@src/hooks';
import { Select, TextInput } from '@src/components/Inputs';
import {
  ADD_BOOK_TEXT_INPUTS,
  BOOK_GENRES_FICTION,
  BOOK_GENRES_NONFICTION,
  GENRE_TYPES,
} from '@src/constants';
import { GenreType, IBooks, GenreTypes, IISBN } from '@lms/types';
import { hasDuplicateString } from '@src/utils';
import nProgress from 'nprogress';
import Loader from '@src/components/Loader';

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

interface AddBookProps {
  addBook: boolean;
  setAddBook: React.Dispatch<React.SetStateAction<boolean>>;
}

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

const AddBook = ({ addBook, setAddBook }: AddBookProps) => {
  const [handleBookImage, bookFile, bookImage, clearImage] =
    useFileHandler();
  const { uploadImage } = useUploadImage();

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

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (quantity > ISBNs.length || ISBNs.some((isbn) => isbn === '')) {
      toast.error('Please fill in all ISBNs');
      return;
    }

    if (hasDuplicateString(ISBNs)) {
      toast.error('ISBNs must be unique');
      return;
    }

    if (!bookFile || !bookImage) {
      toast.error('Please upload a book cover');
      return;
    }

    try {
      setIsUploading(true);
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      const imageCover = await uploadImage('books', bookFile);

      if (imageCover) {
        const timestamp = serverTimestamp();

        const payload: IBooks = {
          title,
          author,
          publisher,
          accessionNumber,
          genreType,
          genre,
          quantity,
          available: quantity,
          createdAt: timestamp,
          updatedAt: timestamp,
          imageCover,
        };

        const bookAdded = await addDoc(collection(db, 'books'), payload);

        // Add ISBNs to isbn collection
        ISBNs.forEach(async (isbn) => {
          const isbnDoc: IISBN = {
            book: bookAdded.id,
            isbn,
            available: true,
          };

          await addDoc(collection(db, 'isbns'), isbnDoc);
        });

        setTitle('');
        setAuthor('');
        setPublisher('');
        setAccessionNumber('');
        setGenreType('' as GenreType);
        setGenre('' as GenreTypes);
        setQuantity(1);
        setISBNs([]);
        clearImage();

        toast.success('Book added successfully');
      }

      nProgress.done();
      setIsUploading(false);
    } catch (error) {
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
        addBook ? 'translate-y-0' : '-translate-y-[100%]'
      }`}
    >
      <div className='flex space-x-3 items-center'>
        <button type='button' onClick={() => setAddBook(false)}>
          <BsArrowLeft className='h-8 w-8 text-primary' />
        </button>
        <div className='text-3xl font-semibold text-primary'>Add book</div>
      </div>
      <div className='w-full min-h-auto flex space-x-10'>
        <form className='space-y-3' onSubmit={handleAddBook}>
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
            value={genreType}
            inputProps={{
              required: true,
            }}
          />
          <Select
            title='Genre'
            options={
              genreType === 'Fiction'
                ? BOOK_GENRES_FICTION
                : BOOK_GENRES_NONFICTION
            }
            value={genre}
            setValue={setGenre}
            inputProps={{
              disabled: !genreType,
              required: true,
            }}
            dep={genreType}
          />
          <TextInput
            title='Quantity'
            inputProps={{
              type: 'number',
              min: 1,
              // defaultValue: 1,
              required: true,
              value: quantity,
              onChange (e) {
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
            type='submit'
            className='bg-primary w-full mt-6 text-white rounded-lg px-5 py-3'
          >
            Add book
          </button>
          <Modal
            isOpen={isUploading}
            contentLabel='Modal - Add book'
            style={{
              content: {
                ...modalCustomStyle.content,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'transparent',
              },
            }}
            closeTimeoutMS={200}
          >
            <Loader message='Adding book' />
          </Modal>
        </form>
        <div>
          {bookImage ? (
            <div className='space-y-2'>
              <div className='relative h-[250px] w-[200px] rounded-xl overflow-hidden'>
                <Image
                  src={bookImage}
                  layout='fill'
                  objectFit='cover'
                  objectPosition='center'
                />
              </div>
              <button
                type='button'
                onClick={clearImage}
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

export default AddBook;
