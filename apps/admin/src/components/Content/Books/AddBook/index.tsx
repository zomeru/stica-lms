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
  AlgoBookDoc,
  GenreDoc,
  CategoryDoc,
  Identifier,
  IBookDoc,
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
    overflow: 'auto',
    maxHeight: '100vh',
  },
};

export const uniqueAcnCheck = (books: IBookDoc[], acn: string) => {
  let found = 0;

  books.forEach((book) => {
    book.identifiers.forEach((identifier) => {
      if (
        identifier.accessionNumber === acn &&
        identifier.status !== 'Lost' &&
        identifier.status !== 'Damaged'
      ) {
        found += 1;
      }
    });
  });

  return found === 0;
};

const ISBNModal = ({
  isModalOpen,
  setIsModalOpen,
  quantity,
  identifiers,
  setIdentifiers,
  allBooks,
}: {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  quantity: number;
  identifiers: Identifier[];
  setIdentifiers: React.Dispatch<React.SetStateAction<Identifier[]>>;
  allBooks?: IBookDoc[];
}) => {
  const inputs = useMemo(() => {
    return new Array(quantity).fill(0).map((_, i) => `isbn-${i + 1}`);
  }, [quantity]);

  const handleClose = () => {
    const accessionNumbers: string[] = [];
    let sameAcnFound = 0;

    identifiers.forEach((item) => {
      accessionNumbers.push(item.accessionNumber);

      if (!uniqueAcnCheck(allBooks || [], item.accessionNumber)) {
        sameAcnFound += 1;
      }
    });

    if (hasDuplicateString(accessionNumbers) || sameAcnFound > 0) {
      toast.error('Accession number must be unique');
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
          <div className='text-primary text-3xl font-semibold'>
            Identifiers
          </div>
        </div>
        <div className='space-y-3'>
          {inputs.map((input, i) => {
            return (
              <div className='flex flex-col space-y-1' key={input}>
                <div className='text-lg font-semibold'>Book {i + 1}: </div>
                <TextInput
                  title='ISBN'
                  inputProps={{
                    value: identifiers[i]?.isbn ? identifiers[i].isbn : '',
                    onChange: (e) => {
                      setIdentifiers((prev) => {
                        const newIdentifiers = [...prev];
                        newIdentifiers[i] = {
                          ...newIdentifiers[i],
                          isbn: e.target.value,
                        };
                        return newIdentifiers;
                      });
                    },
                    className: 'space-x-0',
                  }}
                />
                <TextInput
                  title='Accession no.'
                  inputStyle={`${
                    !uniqueAcnCheck(
                      allBooks || [],
                      identifiers[i]?.accessionNumber
                        ? identifiers[i].accessionNumber
                        : ''
                    ) && 'border-red-600 text-red-600'
                  }`}
                  inputProps={{
                    value: identifiers[i]?.accessionNumber
                      ? identifiers[i].accessionNumber
                      : '',
                    onChange: (e) => {
                      setIdentifiers((prev) => {
                        const newIdentifiers = [...prev];
                        newIdentifiers[i] = {
                          ...newIdentifiers[i],
                          accessionNumber: e.target.value,
                        };
                        return newIdentifiers;
                      });
                    },
                  }}
                />
                {!uniqueAcnCheck(
                  allBooks || [],
                  identifiers[i]?.accessionNumber
                    ? identifiers[i].accessionNumber
                    : ''
                ) && (
                  <div className='text-xs text-red-600'>
                    Accession number already taken.
                  </div>
                )}
              </div>
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
  // const [accessionNumber, setAccessionNumber] = useState('');
  const [copyright, setCopyright] = useState('');
  const [category, setCategory] = useState('');
  const [genre, setGenre] = useState('');
  const [quantity, setQuantity] = useState(1);
  // const [ISBNs, setISBNs] = useState<string[]>([]);
  const [identifiers, setIdentifiers] = useState<Identifier[]>([]);
  const [canBeBorrowed, setCanBeBorrowed] = useState(false);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomGenre, setIsCustomGenre] = useState(false);

  const [allGenres] = useCol<GenreDoc>(
    query(collection(db, 'genres'), orderBy('genre', 'asc'))
  );

  const [categories] = useCol<CategoryDoc>(
    query(collection(db, 'categories'), orderBy('category', 'asc'))
  );

  const [allBooks] = useCol<IBookDoc>(query(collection(db, 'books')));

  console.log('allBooks', allBooks);

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
      value: copyright,
      setValue: setCopyright,
    },
  ];

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasEmptyIdentifier = identifiers.some(
      (identifier) =>
        identifier.isbn === '' || identifier.accessionNumber === ''
    );

    if (quantity > identifiers.length || hasEmptyIdentifier) {
      toast.error('Please fill in all identifiers');
      return;
    }

    const accessionNumbers: string[] = [];

    identifiers.forEach((item) => {
      accessionNumbers.push(item.accessionNumber);
    });

    if (hasDuplicateString(accessionNumbers)) {
      toast.error('Accession number must be unique');
      return;
    }

    /* if (!bookFile || !bookImage) { */
    /*   toast.error('Please upload a book cover'); */
    /*   return; */
    /* } */

    try {
      setIsUploading(true);
      nProgress.configure({ showSpinner: true });
      nProgress.start();

      let imageCover;

      if (bookFile || bookImage) {
        imageCover = await uploadImage('books', bookFile);
      }

      const newIdentifiers: Identifier[] = [];

      identifiers.forEach((item) => {
        const newIdentifier: Identifier = {
          ...item,
          status: 'Available',
        } as Identifier;

        newIdentifiers.push(newIdentifier);
      });

      const defaultImageCover = {
        ref: 'books/default_book_cover.jpg',
        url: 'https://firebasestorage.googleapis.com/v0/b/stica-lms.appspot.com/o/books%2Fdefault_book_cover.jpg?alt=media&token=97f72be3-2a47-45ba-a455-b7b50fe79150',
      };

      if (!isCustomCategory && isCustomGenre) {
        if (categories) {
          const selectedCateg = categories.find(
            (categ) => categ.category === category
          );
          const newGenre = {
            categoryId: selectedCateg?.id,
            genre,
          };

          await addDoc(collection(db, 'genres'), newGenre);
        }
      }

      if (isCustomCategory) {
        const newCategory = {
          active: true,
          category,
          canBeBorrowed:
            category === 'Fiction' || category === 'Non-Fiction'
              ? true
              : canBeBorrowed,
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
        category: {
          category,
          canBeBorrowed:
            category === 'Fiction' || category === 'Non-fiction'
              ? true
              : canBeBorrowed,
        },
        copyright,
        genre,
        quantity,
        totalBorrow: 0,
        views: 0,
        available: quantity,
        createdAt: timestamp,
        updatedAt: timestamp,
        imageCover: imageCover || defaultImageCover,
        identifiers: newIdentifiers,
      };

      const bookAdded = await addDoc(collection(db, 'books'), payload);

      setTitle('');
      setAuthor('');
      setPublisher('');
      setCopyright('');
      setCategory('' as GenreType);
      setGenre('' as GenreTypes);
      setQuantity(1);
      setIdentifiers([]);
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

      nProgress.done();
      setIsUploading(false);
      setIsCustomCategory(false);
      setIsCustomGenre(false);
    } catch (error) {
      toast.error('Something went wrong! Please try again later.');
      nProgress.done();
      setIsUploading(false);
    }
  };

  const renderISBNerror = () => {
    const hasEmptyIdentifier = identifiers.some(
      ({ isbn, accessionNumber }) =>
        !isbn ||
        !accessionNumber ||
        isbn.trim() === '' ||
        accessionNumber.trim() === ''
    );

    if (quantity > identifiers.length || hasEmptyIdentifier) {
      return (
        <div className='text-sm text-red-500'>
          Please enter all identifiers
        </div>
      );
    }

    const accessionNumbers: string[] = [];

    identifiers.forEach((item) => {
      accessionNumbers.push(item.accessionNumber);
    });

    if (hasDuplicateString(accessionNumbers)) {
      return (
        <div className='text-sm text-red-500'>
          Accession number must be unique
        </div>
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
                onChange(e) {
                  textInputs[i].setValue(e.target.value);
                },
              }}
            />
          ))}
          {!isCustomCategory ? (
            <div className='flex space-x-2'>
              <Select
                title='Category'
                options={categories?.map((categ) => categ.category) || []}
                setValue={setCategory}
                inputProps={{
                  required: true,
                }}
                value={category}
              />
              <button
                type='button'
                onClick={() => {
                  setIsCustomCategory(true);
                  setCategory('');
                }}
              >
                <AiFillEdit className='h-[25px] w-[25px]' />
              </button>
            </div>
          ) : (
            <>
              <div className='flex space-x-2'>
                <TextInput
                  title='Category'
                  inputProps={{
                    type: 'text',
                    required: true,
                    value: category,
                    placeholder: 'Enter category',
                    onChange(e) {
                      setCategory(e.target.value);
                    },
                  }}
                />
                <button
                  type='button'
                  onClick={() => {
                    setIsCustomCategory(false);
                    setCategory('');
                    setCanBeBorrowed(false);
                  }}
                >
                  <AiOutlineClose className='h-[25px] w-[25px] text-red-600' />
                </button>
              </div>
              <div className='flex space-x-2'>
                <div className='mb-2 w-[120px] flex-none font-normal text-gray-500 lg:mb-0'>
                  Can be borrowed
                </div>
                <div className='flex items-center space-x-5'>
                  <button
                    type='button'
                    className='flex items-center space-x-1'
                    onClick={() => setCanBeBorrowed(true)}
                  >
                    <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-neutral-400 bg-neutral-300'>
                      <div
                        className={`h-[17px] w-[17px] rounded-full ${
                          canBeBorrowed ? 'bg-primary' : 'bg-neutral-300'
                        }`}
                      />
                    </div>
                    <div>Yes</div>
                  </button>
                  <button
                    type='button'
                    className='flex items-center space-x-1'
                    onClick={() => setCanBeBorrowed(false)}
                  >
                    <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-neutral-400 bg-neutral-300'>
                      <div
                        className={`h-[17px] w-[17px] rounded-full ${
                          !canBeBorrowed ? 'bg-primary' : 'bg-neutral-300'
                        }`}
                      />
                    </div>
                    <div>No</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {!isCustomCategory ? (
            <>
              {!isCustomGenre ? (
                <div className='flex space-x-2'>
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
                              (cate) => cate.category === category
                            )?.id
                        )
                        .map((gnre) => gnre.genre) || []
                    }
                    setValue={setGenre}
                    value={genre}
                    inputProps={{
                      disabled: !category,
                      required: true,
                    }}
                    dep={category}
                  />

                  <button
                    type='button'
                    onClick={() => {
                      setIsCustomGenre(true);
                      setGenre('');
                    }}
                  >
                    <AiFillEdit className='h-[25px] w-[25px]' />
                  </button>
                </div>
              ) : (
                <div className='flex space-x-2'>
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
                  <button
                    type='button'
                    onClick={() => {
                      setIsCustomGenre(false);
                    }}
                  >
                    <AiOutlineClose className='h-[25px] w-[25px] text-red-600' />
                  </button>
                </div>
              )}
            </>
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
                  setIdentifiers((prev) =>
                    prev.slice(0, Number(e.target.value))
                  );
                }

                setQuantity(Number(e.target.value));
              },
            }}
          />
          <div className='flex w-full flex-col text-sm lg:flex-row lg:items-center lg:space-x-3 lg:text-base'>
            <div className='mb-2 w-[120px] flex-none font-normal text-gray-500 lg:mb-0'>
              Identifiers
            </div>
            <button
              type='button'
              className='bg-primary rounded-lg px-3 py-1 text-white'
              onClick={() => setIsISBNModalOpen(true)}
            >
              Enter Identifiers
            </button>
            {renderISBNerror()}
            <ISBNModal
              allBooks={allBooks}
              identifiers={identifiers}
              setIdentifiers={setIdentifiers}
              isModalOpen={isISBNModalOpen}
              setIsModalOpen={setIsISBNModalOpen}
              quantity={quantity}
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
                /* required */
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBook;
