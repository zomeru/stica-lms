import React, { useRef, useState, useMemo } from 'react';
import { BsArrowLeft, BsCheckLg } from 'react-icons/bs';
import Image from 'next/image';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';
import {
  serverTimestamp,
  addDoc,
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import nProgress from 'nprogress';

import { db } from '@lms/db';
import { useFileHandler, useUploadImage } from '@src/hooks';
import { Select, TextInput } from '@src/components/Inputs';
import { ADD_BOOK_TEXT_INPUTS } from '@src/constants';
import {
  GenreType,
  IBooks,
  GenreTypes,
  ISBNType,
  AlgoBookDoc,
  GenreDoc,
  CategoryDoc,
} from '@lms/types';
import { hasDuplicateString } from '@src/utils';
import { AiFillEdit, AiOutlineClose } from 'react-icons/ai';
import { useCol } from '@lms/ui';
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
        <div className='flex items-center space-x-3'>
          <button type='button' onClick={handleClose}>
            <BsArrowLeft className='text-primary h-8 w-8' />
          </button>
          <div className='text-primary text-3xl font-semibold'>ISBNs</div>
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
            className='bg-primary rounded-lg px-3 py-2 text-white'
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
  addBook: boolean;
  setAddBook: React.Dispatch<React.SetStateAction<boolean>>;
  books: AlgoBookDoc[];
  setBooks: React.Dispatch<React.SetStateAction<AlgoBookDoc[]>>;
}

const AddBook = ({
  addBook,
  setAddBook,
  books,
  setBooks,
}: AddBookProps) => {
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
  const [genreType, setGenreType] = useState('');
  const [genre, setGenre] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ISBNs, setISBNs] = useState<string[]>([]);

  const [isCustomGenre, setIsCustomGenre] = useState(false);

  const [allGenres] = useCol<GenreDoc>(
    query(collection(db, 'genres'), orderBy('genre', 'asc'))
  );

  const [categories] = useCol<CategoryDoc>(
    query(collection(db, 'categories'), orderBy('category', 'asc'))
  );

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

      const newISBNs: ISBNType[] = [];

      ISBNs.forEach((isbn) => {
        const newISBN: ISBNType = {
          isbn,
          status: 'Available',
        } as ISBNType;

        newISBNs.push(newISBN);
      });

      if (imageCover) {
        if (isCustomGenre) {
          const newCategory = {
            active: true,
            category: genreType,
          };

          const categ = await addDoc(
            collection(db, 'categories'),
            newCategory
          );

          const newGenre = {
            categoryId: categ.id,
            genre,
          };

          await addDoc(collection(db, 'genres'), newGenre);
        }

        const timestamp = serverTimestamp();

        const payload: IBooks = {
          title,
          author,
          publisher,
          accessionNumber,
          genreType,
          genre,
          quantity,
          totalBorrowed: 0,
          views: 0,
          available: quantity,
          createdAt: timestamp,
          updatedAt: timestamp,
          imageCover,
          isbns: newISBNs,
        };

        const bookAdded = await addDoc(collection(db, 'books'), payload);

        setTitle('');
        setAuthor('');
        setPublisher('');
        setAccessionNumber('');
        setGenreType('' as GenreType);
        setGenre('' as GenreTypes);
        setQuantity(1);
        setISBNs([]);
        clearImage();

        const newBooks = [
          {
            id: bookAdded.id,
            ...payload,
          } as AlgoBookDoc,
          ...books,
        ];
        setBooks(newBooks);

        toast.success('Book added successfully');
      }

      nProgress.done();
      setIsUploading(false);
      setIsCustomGenre(false);
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
      className={`custom-scrollbar absolute top-0 h-full w-full space-y-4 overflow-y-scroll transition-all duration-300 ${
        addBook ? 'translate-y-0' : '-translate-y-[100%]'
      }`}
    >
      <div className='flex items-center space-x-3'>
        <button type='button' onClick={() => setAddBook(false)}>
          <BsArrowLeft className='text-primary h-8 w-8' />
        </button>
        <div className='text-primary text-3xl font-semibold'>Add book</div>
      </div>
      <div className='min-h-auto flex w-full space-x-10'>
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
          {!isCustomGenre ? (
            <div className='flex space-x-2'>
              <Select
                title='Category'
                options={
                  categories?.map((category) => category.category) || []
                }
                setValue={setGenreType}
                inputProps={{
                  required: true,
                }}
                value={genreType}
              />
              <button
                type='button'
                onClick={() => {
                  setIsCustomGenre(true);
                  setGenreType('');
                }}
              >
                <AiFillEdit className='h-[25px] w-[25px]' />
              </button>
            </div>
          ) : (
            <div className='flex space-x-2'>
              <TextInput
                title='Category'
                inputProps={{
                  type: 'text',
                  required: true,
                  value: genreType,
                  placeholder: 'Enter category',
                  onChange(e) {
                    setGenreType(e.target.value);
                  },
                }}
              />
              <button
                type='button'
                onClick={() => {
                  setIsCustomGenre(false);
                  setGenreType('');
                }}
              >
                <AiOutlineClose className='h-[25px] w-[25px] text-red-600' />
              </button>
            </div>
          )}

          {!isCustomGenre ? (
            <Select
              title='Genre'
              options={
                // genreType === 'Fiction'
                //   ? BOOK_GENRES_FICTION
                //   : BOOK_GENRES_NONFICTION

                allGenres
                  ?.filter(
                    (gnr) =>
                      gnr.categoryId ===
                      categories?.find(
                        (cate) => cate.category === genreType
                      )?.id
                  )
                  .map((gnre) => gnre.genre) || []
              }
              setValue={setGenre}
              value={genre}
              inputProps={{
                disabled: !genreType,
                required: true,
              }}
              dep={genreType}
            />
          ) : (
            <TextInput
              title='Genre'
              inputProps={{
                type: 'text',
                required: true,
                value: genre,
                placeholder: 'Enter genre',
                onChange(e) {
                  setGenre(e.target.value);
                },
              }}
            />
          )}

          <TextInput
            title='Quantity'
            inputProps={{
              type: 'number',
              min: 1,
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
          <div className='flex w-full flex-col text-sm lg:flex-row lg:items-center lg:space-x-3 lg:text-base'>
            <div className='mb-2 w-[120px] flex-none font-normal text-gray-500 lg:mb-0'>
              ISBN
            </div>
            <button
              type='button'
              className='bg-primary rounded-lg px-3 py-1 text-white'
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
            className='bg-primary mt-6 w-full rounded-lg px-5 py-3 text-white'
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
              <div className='relative h-[250px] w-[200px] overflow-hidden rounded-xl'>
                <Image
                  src={bookImage}
                  layout='fill'
                  objectFit='cover'
                  objectPosition='center'
                  quality={50}
                />
              </div>
              <button
                type='button'
                onClick={clearImage}
                className='bg-primary w-full rounded-md py-[2px] text-white'
              >
                Clear image
              </button>
            </div>
          ) : (
            <>
              <button
                type='button'
                className='bg-primary h-[250px] w-[200px] rounded-2xl text-white'
                onClick={() => bookImageRef.current?.click()}
              >
                + Add Book Cover
              </button>
              <input
                ref={bookImageRef}
                className='hidden'
                // accept only jpg, jpeg, png
                accept='image/jpeg, image/png, image/jpg, image/webp, image/svg'
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
