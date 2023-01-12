import React, { useMemo } from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';

import { AlgoBorrowDoc } from '@lms/types';
import {
  DEFAULT_SORT_ITEM,
  historyTableHeaders,
  ITEMS_PER_PAGE,
} from '@src/constants';
import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import { formatDate, navigateToBook } from '@src/utils';
import nProgress from 'nprogress';

const bookSearchQueryName = 'historyBookSearchKey';

const History = () => {
  const historyBookSearchKey = useNextQuery(bookSearchQueryName);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoHistoryBooks, _, refreshHistoryBooks, historyBooksLoading] =
    useAlgoData<AlgoBorrowDoc>(
      'borrows',
      bookSearchQueryName,
      historyBookSearchKey
    );

  // get Issued, Returned, Damaged, and Lost books
  const historyBooks: AlgoBorrowDoc[] = useMemo(
    () =>
      algoHistoryBooks?.filter((history) => {
        return (
          history.status === 'Issued' ||
          history.status === 'Returned' ||
          history.status === 'Damaged' ||
          history.status === 'Lost'
        );
      }),
    [algoHistoryBooks]
  );

  const [currentBorrowHistory, currentPage, next, prev] =
    useClientPagination(
      historyBooks || [],
      ITEMS_PER_PAGE,
      DEFAULT_SORT_ITEM
    );

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshHistoryBooks();
    nProgress.done();
  };

  return (
    <section className='h-full w-full'>
      {historyBooks && historyBooks.length > 0 && (
        <div className='mb-[10px] flex justify-between'>
          <button
            type='button'
            className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
            onClick={handleUpdate}
          >
            Refresh records
          </button>
          {historyBooks.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(historyBooks.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(historyBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(historyBooks.length / ITEMS_PER_PAGE) &&
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
            historyBooks && historyBooks.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          historyBooks && historyBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!historyBooksLoading &&
          (!historyBooks ||
            (historyBooks && historyBooks.length === 0)) && (
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
                {historyBookSearchKey
                  ? 'No results found'
                  : 'There is currently no borrow request.'}
              </h1>
              {!historyBookSearchKey && (
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
        {historyBooks && historyBooks.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {historyTableHeaders.map((header) => (
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
              {currentBorrowHistory.map((history) => {
                let issuedDate = 'N/A';
                let dueDate = 'N/A';
                let returnedDate = 'N/A';

                if (history.issuedDate)
                  issuedDate = formatDate(history.issuedDate);
                if (history.dueDate) dueDate = formatDate(history.dueDate);
                if (history.returnedDate)
                  returnedDate = formatDate(history.returnedDate);

                return (
                  <React.Fragment key={history.id}>
                    <ReactTooltip id={history.title} />

                    <tr key={history.id} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='line-clamp-2 text-primary max-w-[200px] overflow-hidden text-left'>
                            {history.studentName}
                          </p>
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(history.bookId)}
                        >
                          <p
                            className='line-clamp-2 text-primary max-w-[200px] overflow-hidden text-left'
                            data-for={history.title}
                            data-tip={history.title}
                          >
                            {history.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {history.identifiers.isbn}
                        </p>
                      </td>

                      {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {issue.requestedDate}
                </p>
              </td> */}
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {issuedDate}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {dueDate}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {returnedDate}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p
                          className={`whitespace-no-wrap ${
                            history.penalty > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          ₱{history.penalty}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p
                          className={`whitespace-no-wrap ${
                            history.status === 'Returned'
                              ? 'text-sky-600'
                              : history.status === 'Issued'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {history.status}
                        </p>
                      </td>
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

export default History;
