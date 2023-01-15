import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import nProgress from 'nprogress';
import { useRouter } from 'next/router';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import {
  DEFAULT_SORT_ITEM,
  ITEMS_PER_PAGE,
  lostBooksTableHeaders,
} from '@src/constants';
import { AlgoBorrowDoc } from '@lms/types';
import { navigateToBook } from '@src/utils';
import UpdateLostModal from './UpdateLostModal';

const bookSearchQueryName = 'lostBookSearchKey';

const LostBooks = () => {
  const lostBookSearchKey = useNextQuery(bookSearchQueryName);
  const router = useRouter();

  const [algoLostBooks, setLostBooks, refreshLostBooks, lostBooksLoading] =
    useAlgoData<AlgoBorrowDoc>(
      'borrows',
      bookSearchQueryName,
      lostBookSearchKey
    );

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

  const handleRefresh = () => {
    router.push(
      {
        pathname: '/',
        query: {
          page: router.query.page,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <section className='h-full w-full'>
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
        <div className='mb-[10px] flex justify-between'>
          <div className='flex items-center space-x-2'>
            <button
              type='button'
              className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
              onClick={handleUpdate}
            >
              Refresh records
            </button>
            <div className='text-sm'>Results: {lostBooks.length}</div>
          </div>

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
                    Math.ceil(lostBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(lostBooks.length / ITEMS_PER_PAGE) &&
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
            lostBooks && lostBooks.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          lostBooks && lostBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!lostBooksLoading &&
          (!lostBooks || (lostBooks && lostBooks.length === 0)) && (
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
                {lostBookSearchKey
                  ? 'No results found'
                  : 'There is currently no borrow request.'}
              </h1>
              <button
                type='button'
                onClick={handleRefresh}
                className='text-xl text-sky-600'
              >
                Refresh
              </button>
            </div>
          )}
        {lostBooks && lostBooks.length > 0 && (
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
              {currentLostBooks.map((lostBook) => {
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
                          {lostBook.identifiers.isbn}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {lostBook.identifiers.accessionNumber}
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
                                setSelectedLostBook(lostBook.objectID)
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

export default LostBooks;
