import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';

import { IBookDoc } from '@lms/types';
import { Loader } from '@src/components';
import { SORT_ITEMS } from '@src/constants';

import BookListCard from '../BookListCard';
import { OrderType } from '..';

interface BookListProps {
  books: IBookDoc[];
  bookLoading: boolean;
  bookError: any;
  selectedBook: string;
  addBook: boolean;
  setAddBook: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBook: React.Dispatch<React.SetStateAction<string>>;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortOrder: React.Dispatch<React.SetStateAction<OrderType>>;
  sortOrder: OrderType;
}

const BookList = ({
  books,
  bookLoading,
  bookError,
  selectedBook,
  addBook,
  setAddBook,
  setSelectedBook,
  setSortBy,
  sortBy,
  sortOrder,
  setSortOrder,
}: BookListProps) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, [headerHeight, headerRef]);

  const currentOrderItems = useMemo(
    () => SORT_ITEMS.find((el) => el.sort.field === sortBy)?.order,
    [sortBy]
  );

  return (
    <div
      className={`w-full h-full duration-300 transition-all space-y-4 ${
        selectedBook ? '-translate-x-[100%]' : 'translate-x-0'
      } ${addBook ? 'translate-y-[100%]' : 'translate-y-0'}`}
    >
      <div className='flex justify-between' ref={headerRef}>
        <div className='text-3xl font-semibold text-primary'>Books</div>
        <button
          type='button'
          className='px-3 text-sm font-medium text-white bg-primary rounded-md'
          onClick={() => setAddBook(true)}
        >
          + Add Book
        </button>
      </div>
      {bookLoading && (
        <div
          style={{ height: `calc(100% - ${headerHeight}px)` }}
          className='flex items-center'
        >
          <Loader message='Loading books' />
        </div>
      )}
      {bookError && (
        <div
          style={{ height: `calc(100% - ${headerHeight}px)` }}
          className='w-full flex items-center justify-center'
        >
          <div className='text-red-500 text-xl font-medium'>
            Loading books failed! Please try again later!
          </div>
        </div>
      )}

      {!bookLoading && books && books.length === 0 && (
        <div
          style={{ height: `calc(100% - ${headerHeight}px)` }}
          className='flex items-center justify-center flex-col space-y-3'
        >
          <div className='relative h-[70%] w-full'>
            <Image
              src='/assets/images/books_empty.png'
              layout='fill'
              objectFit='contain'
            />
          </div>
          <div className='text-xl text-neutral-600'>
            No books at the moment
          </div>
        </div>
      )}
      {!bookLoading && books && books.length > 0 && (
        <div
          style={{
            height: `calc(100% - ${headerHeight}px)`,
          }}
          className='overflow-y-scroll w-full custom-scrollbar'
        >
          <div className='flex space-x-5 items-center'>
            <div className='flex space-x-3 items-center'>
              <div className='text-cGray-300'>Sort by:</div>
              <select
                className='outline-none border border-cGray-200 px-2 py-[3px] rounded'
                onChange={(e) => setSortBy(e.target.value)}
                value={sortBy}
              >
                {SORT_ITEMS.map((item) => (
                  <option key={item.sort.field} value={item.sort.field}>
                    {item.sort.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex space-x-3 items-center'>
              <div className='text-cGray-300'>Order:</div>
              <select
                className='outline-none border border-cGray-200 px-2 py-[3px] rounded'
                onChange={(e) => setSortOrder(e.target.value as OrderType)}
                value={sortOrder}
              >
                {currentOrderItems &&
                  currentOrderItems.map((item) => (
                    <option key={item.name} value={item.value}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <table className='min-w-full leading-normal overflow-y-scroll'>
            <thead>
              <tr>
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Image
                </th>
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Accession No
                </th>
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Title
                </th>
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Author
                </th>

                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Genre
                </th>
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Quantity
                </th>
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                  Available
                </th>
                {
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3' />
                }
              </tr>
            </thead>

            <tbody>
              {books.map((book) => {
                return (
                  <BookListCard
                    key={book.id}
                    title={book.title}
                    imageUrl={book.imageCover.url}
                    accessionNumber={book.accessionNumber}
                    author={book.author}
                    genre={book.genre}
                    quantity={book.quantity}
                    available={book.available}
                    onEdit={() => setSelectedBook(book.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookList;