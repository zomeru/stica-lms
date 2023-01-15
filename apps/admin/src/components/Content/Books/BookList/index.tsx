import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';

import { AlgoBookDoc } from '@lms/types';
import { Loader } from '@src/components';
import { SORT_ITEMS } from '@src/constants';

import ReactTooltip from 'react-tooltip';
import { useNextQuery } from '@lms/ui';
import BookListCard from '../BookListCard';
import { OrderType } from '..';

interface BookListProps {
  books: AlgoBookDoc[];
  setAlgoBooks: React.Dispatch<React.SetStateAction<AlgoBookDoc[]>>;
  currentBooks: AlgoBookDoc[];
  bookLoading: boolean;
  addBook: boolean;
  setAddBook: React.Dispatch<React.SetStateAction<boolean>>;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortOrder: React.Dispatch<React.SetStateAction<OrderType>>;
  sortOrder: OrderType;
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
}

const BookList = ({
  books,
  setAlgoBooks,
  bookLoading,
  addBook,
  setAddBook,
  setSortBy,
  sortBy,
  sortOrder,
  setSortOrder,
  currentPage,
  onPrev,
  onNext,
  currentBooks,
}: BookListProps) => {
  const bookSearchKey = useNextQuery('bookSearchKey');
  const bookId = useNextQuery('bookId');
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
      className={`h-full w-full space-y-2 transition-all duration-300 ${
        bookId ? '-translate-x-[100%]' : 'translate-x-0'
      } ${addBook ? 'translate-y-[100%]' : 'translate-y-0'}`}
    >
      <div className='flex justify-between' ref={headerRef}>
        <div className='text-primary text-3xl font-semibold'>Books</div>

        <div className='flex items-center space-x-3'>
          {books && books.length > 0 && books.length / 10 > 1 && (
            <div className='flex items-center space-x-3'>
              <button
                type='button'
                disabled={currentPage === 1}
                className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                  currentPage === 1 && 'cursor-not-allowed opacity-40'
                }`}
                onClick={onPrev}
              >
                {'<'}
              </button>
              <div>
                {currentPage}/{Math.ceil(books.length / 10)}
              </div>
              <button
                type='button'
                disabled={currentPage === Math.ceil(books.length / 10)}
                className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                  currentPage === Math.ceil(books.length / 10) &&
                  'cursor-not-allowed opacity-40'
                }`}
                onClick={onNext}
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
        <button
          type='button'
          className='bg-primary rounded-md px-3 text-sm font-medium text-white'
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

      {!bookLoading && books && books.length === 0 && (
        <div
          style={{ height: `calc(100% - ${headerHeight}px)` }}
          className='flex flex-col items-center justify-center space-y-3'
        >
          <div className='relative h-[70%] w-full'>
            <Image
              src='/assets/images/empty.png'
              layout='fill'
              objectFit='contain'
              blurDataURL='/assets/images/empty.png'
              placeholder='blur'
              quality={50}
            />
          </div>
          <div className='text-xl text-neutral-600'>
            {bookSearchKey ? 'No books found' : 'No books at the moment'}
          </div>
        </div>
      )}
      {!bookLoading && books && books.length > 0 && (
        <div
          style={{
            height: `calc(100% - ${headerHeight}px)`,
          }}
          className='custom-scrollbar w-full space-y-2 overflow-y-scroll'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-5'>
              <div className='flex items-center space-x-3'>
                <div className='text-cGray-300'>Sort by:</div>
                <select
                  className='border-cGray-200 rounded border px-2 py-[3px] outline-none'
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
              <div className='flex items-center space-x-3'>
                <div className='text-cGray-300'>Order:</div>
                <select
                  className='border-cGray-200 rounded border px-2 py-[3px] outline-none'
                  onChange={(e) =>
                    setSortOrder(e.target.value as OrderType)
                  }
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
            {/* <div>asdasdasd</div> */}
          </div>
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                <th className='bg-primary border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Image
                </th>

                <th className='bg-primary border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Title
                </th>
                <th className='bg-primary border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Author
                </th>

                <th className='bg-primary border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Genre
                </th>
                <th className='bg-primary truncate border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Accession No
                </th>
                <th className='bg-primary border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Quantity
                </th>
                <th className='bg-primary border-b-2 border-gray-200 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white'>
                  Available
                </th>
                {
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  <th className='bg-primary border-b-2 border-gray-200 px-5 py-3' />
                }
              </tr>
            </thead>

            <tbody>
              {currentBooks.map((book) => {
                return (
                  <React.Fragment key={book.objectID}>
                    <ReactTooltip id={book.objectID} />
                    <BookListCard
                      books={books}
                      setAlgoBooks={setAlgoBooks}
                      book={book}
                    />
                  </React.Fragment>
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
