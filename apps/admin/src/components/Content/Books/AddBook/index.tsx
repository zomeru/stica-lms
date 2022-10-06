import React, { useRef, useState } from 'react';
import { BsArrowLeft } from 'react-icons/bs';
import Image from 'next/image';

import { useFileHandler } from '@src/hooks';
import { Select, TextInput } from '@src/components/Inputs';
import {
  ADD_BOOK_TEXT_INPUTS,
  BOOK_GENRES_FICTION,
  BOOK_GENRES_NONFICTION,
  GENRE_TYPES,
} from '@src/constants';

interface AddBookProps {
  addBook: boolean;
  setAddBook: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddBook = ({ addBook, setAddBook }: AddBookProps) => {
  const [handleBookImage, bookFile, bookImage, clearImage] =
    useFileHandler();

  const bookImageRef = useRef<HTMLInputElement>(null);

  const [genreType, setGenreType] = useState('');
  const [genre, setGenre] = useState('');

  console.log('genre', genre);
  console.log('bookFile', bookFile);

  return (
    <div
      className={`w-full h-full absolute top-0 duration-300 transition-all space-y-4 ${
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
        <div className='space-y-3'>
          {ADD_BOOK_TEXT_INPUTS.map((text) => (
            <TextInput
              key={text}
              title={text}
              inputProps={{
                type: 'text',
                placeholder: text,
                required: true,
              }}
            />
          ))}
          <Select
            title='Genre Type'
            options={GENRE_TYPES}
            setValue={setGenreType}
            value={genreType}
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
            }}
            dep={genreType}
          />
        </div>
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
                + Add Image
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
