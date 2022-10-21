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
import UpdateLostModal from './UpdateLostModal';

const LostBooks = () => {
  const lostBookSearchKey = useNextQuery('lostBookSearchKey');

  const [algoLostBooks, setLostBooks, refreshLostBooks, lostBooksLoading] =
    useAlgoData<AlgoBorrowDoc>('borrows', lostBookSearchKey);

  const [selectedLostBook, setSelectedLostBook] = useState('');

  const lostBooks: AlgoBorrowDoc[] = useMemo(
    () => algoLostBooks?.filter((borrow) => borrow.status === 'Lost'),
    [algoLostBooks]
  );

  const [currentLostBooks, currentPage, next, prev] = useClientPagination(
    lostBooks || [],
    ITEMS_PER_PAGE,
    DEFAULT_SORT_ITEM
  );

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshLostBooks();
    nProgress.done();
  };

  return (
    <section className='w-full h-full'>
      <UpdateLostModal
        isModalOpen={!!selectedLostBook}
        setSelectedLostBook={setSelectedLostBook}
        lostBookData={lostBooks.find(
          (borrow) => borrow.objectID === selectedLostBook
        )}
        lostBooks={algoLostBooks}
        setLostBooks={setLostBooks}
      />
      {lostBooks && lostBooks.length > 0 && (
        <div className='flex justify-between mb-[10px]'>
          <button
            type='button'
            className='bg-primary hover:bg-sky-800 duration-200 text-white text-sm px-3 py-1 rounded-md'
            onClick={handleUpdate}
          >
            Refresh records
          </button>
          {lostBooks.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(lostBooks.length / ITEMS_PER_PAGE)}
              </div>
              <div className='space-x-1'>
                <button
                  type='button'
                  disabled={currentPage === 1}
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage === 1 && 'opacity-40 cursor-not-allowed'
                  }`}
                  onClick={() => prev()}
                >
                  {'<'}
                </button>
                <button
                  type='button'
                  disabled={
                    currentPage ===
                    Math.ceil(lostBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(lostBooks.length / ITEMS_PER_PAGE) &&
                    'opacity-40 cursor-not-allowed'
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
            lostBooks && lostBooks.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`w-full custom-scrollbar ${
          lostBooks && lostBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!lostBooksLoading &&
          (!lostBooks || (lostBooks && lostBooks.length === 0)) && (
            <div className='w-full h-full flex flex-col justify-center space-y-3'>
              <div className='relative w-[75%] h-[75%] mx-auto'>
                <Image
                  src='/assets/images/empty.png'
                  layout='fill'
                  objectFit='contain'
                  blurDataURL='/assets/images/empty.png'
                  placeholder='blur'
                  quality={50}
                />
              </div>
              <h1 className='text-cGray-300 text-2xl text-center'>
                {lostBookSearchKey
                  ? 'No results found'
                  : 'There is currently no borrow request.'}
              </h1>
              {!lostBookSearchKey && (
                <button
                  type='button'
                  onClick={handleUpdate}
                  className='text-sky-600 text-xl'
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        {lostBooks && lostBooks.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {lostBooksTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='border-b-2 border-gray-200 bg-primary px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white truncate'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
                <th
                  className='border-b-2 border-gray-200 bg-primary px-5 py-5 '
                  aria-label='action'
                />
              </tr>
            </thead>
            <tbody>
              {currentLostBooks.map((lostBook) => {
                return (
                  <React.Fragment key={lostBook.objectID}>
                    <ReactTooltip id={lostBook.objectID} />

                    <tr key={lostBook.id} className='font-medium'>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-primary'>
                            {lostBook.studentName}
                          </p>
                        </button>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(lostBook.bookId)}
                        >
                          <p
                            className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-primary'
                            data-for={lostBook.objectID}
                            data-tip={lostBook.title}
                          >
                            {lostBook.title}
                          </p>
                        </button>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {lostBook.isbn}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {lostBook.accessionNumber}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {lostBook.penalty}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p
                          className={`max-w-[210px] text-left line-clamp-2 overflow-hidden ${
                            lostBook.replaceStatus === 'Pending'
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {lostBook.replaceStatus}
                        </p>
                      </td>

                      {lostBook.replaceStatus === 'Pending' ? (
                        <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                          <div className='flex space-x-3'>
                            <button
                              type='button'
                              className='truncate bg-sky-600 text-white px-2 py-1 rounded-md text-xs'
                              onClick={() =>
                                setSelectedLostBook(lostBook.objectID)
                              }
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm' />
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

export default LostBooks;
