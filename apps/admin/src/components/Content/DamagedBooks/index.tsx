import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import nProgress from 'nprogress';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import {
  DEFAULT_SORT_ITEM,
  ITEMS_PER_PAGE,
  lostBooksTableHeaders,
} from '@src/constants';
import { AlgoBorrowDoc } from '@lms/types';
import { navigateToBook } from '@src/utils';
import UpdateDamagedModal from './UpdateDamagedModal';

const bookSearchQueryName = 'damagedBookSearchKey';

const DamagedBooks = () => {
  const damagedBookSearchKey = useNextQuery(bookSearchQueryName);

  const [
    algoDamagedBooks,
    setDamagedBooks,
    refreshDamagedBooks,
    damagedBooksLoading,
  ] = useAlgoData<AlgoBorrowDoc>(
    'borrows',
    bookSearchQueryName,
    damagedBookSearchKey
  );

  const [selectedDamagedBook, setSelectedDamagedBook] = useState('');

  const damagedBooks: AlgoBorrowDoc[] = useMemo(
    () =>
      algoDamagedBooks?.filter((borrow) => borrow.status === 'Damaged'),
    [algoDamagedBooks]
  );

  const [currentDamagedBooks, currentPage, next, prev] =
    useClientPagination(
      damagedBooks || [],
      ITEMS_PER_PAGE,
      DEFAULT_SORT_ITEM
    );

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshDamagedBooks();
    nProgress.done();
  };

  return (
    <section className='h-full w-full'>
      <UpdateDamagedModal
        isModalOpen={!!selectedDamagedBook}
        setSelectedDamagedBook={setSelectedDamagedBook}
        damagedBookData={damagedBooks.find(
          (borrow) => borrow.objectID === selectedDamagedBook
        )}
        damagedBooks={algoDamagedBooks}
        setDamagedBooks={setDamagedBooks}
      />
      {damagedBooks && damagedBooks.length > 0 && (
        <div className='mb-[10px] flex justify-between'>
          <button
            type='button'
            className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
            onClick={handleUpdate}
          >
            Refresh records
          </button>
          {damagedBooks.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(damagedBooks.length / ITEMS_PER_PAGE)}
              </div>
              <div className='space-x-1'>
                <button
                  type='button'
                  disabled={currentPage === 1}
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage === 1 && 'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => prev()}
                >
                  {'<'}
                </button>
                <button
                  type='button'
                  disabled={
                    currentPage ===
                    Math.ceil(damagedBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(damagedBooks.length / ITEMS_PER_PAGE) &&
                    'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => next()}
                >
                  {'>'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        style={{
          height: `calc(100% - ${
            damagedBooks && damagedBooks.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          damagedBooks && damagedBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!damagedBooksLoading &&
          (!damagedBooks ||
            (damagedBooks && damagedBooks.length === 0)) && (
            <div className='flex h-full w-full flex-col justify-center space-y-3'>
              <div className='relative mx-auto h-[75%] w-[75%]'>
                <Image
                  src='/assets/images/empty.png'
                  layout='fill'
                  objectFit='contain'
                  blurDataURL='/assets/images/empty.png'
                  placeholder='blur'
                  quality={50}
                />
              </div>
              <h1 className='text-cGray-300 text-center text-2xl'>
                {damagedBookSearchKey
                  ? 'No results found'
                  : 'There is currently no borrow request.'}
              </h1>
              {!damagedBookSearchKey && (
                <button
                  type='button'
                  onClick={handleUpdate}
                  className='text-xl text-sky-600'
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        {damagedBooks && damagedBooks.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {lostBooksTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='bg-primary truncate border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
                <th
                  className='bg-primary border-b-2 border-gray-200 px-5 py-5 '
                  aria-label='action'
                />
              </tr>
            </thead>
            <tbody>
              {currentDamagedBooks.map((lostBook) => {
                return (
                  <React.Fragment key={lostBook.objectID}>
                    <ReactTooltip id={lostBook.objectID} />

                    <tr key={lostBook.id} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'>
                            {lostBook.studentName}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(lostBook.bookId)}
                        >
                          <p
                            className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'
                            data-for={lostBook.objectID}
                            data-tip={lostBook.title}
                          >
                            {lostBook.title}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {lostBook.isbn}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {lostBook.accessionNumber}
                        </p>
                      </td>
                      {/* <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          ₱{lostBook.penalty}
                        </p>
                      </td> */}
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p
                          className={`line-clamp-2 max-w-[210px] overflow-hidden text-left ${
                            lostBook.replaceStatus === 'Pending'
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {lostBook.replaceStatus}
                        </p>
                      </td>

                      {lostBook.replaceStatus === 'Pending' ? (
                        <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                          <div className='flex space-x-3'>
                            <button
                              type='button'
                              className='truncate rounded-md bg-sky-600 px-2 py-1 text-xs text-white'
                              onClick={() =>
                                setSelectedDamagedBook(lostBook.objectID)
                              }
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm' />
                      )}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default DamagedBooks;
