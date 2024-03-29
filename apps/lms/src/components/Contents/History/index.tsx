import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';

import { formatDate, navigateToBook } from '@src/utils';
import { historyTableHeaders, ITEMS_PER_PAGE } from '@src/constants';
import { useClientPagination } from '@lms/ui';
import { BorrowProps } from '../CurrentlyIssuedBooks';

const History = ({
  borrows: borrowHistory,
  borrowLoading: historyLoading,
}: BorrowProps) => {
  // const { user } = useAuth();

  // const [borrowHistory, historyLoading] = useCol<IBorrowDoc>(
  //   query(
  //     collection(db, 'borrows'),
  //     where('userId', '==', user?.id || ''),
  //     where('status', 'in', ['Cancelled', 'Lost', 'Returned', 'Damaged']),
  //     orderBy('updatedAt', 'desc')
  //   )
  // );

  const [currentBorrowHistory, currentPage, next, prev] =
    useClientPagination(borrowHistory || [], ITEMS_PER_PAGE);

  return (
    <section className='h-full w-full'>
      {borrowHistory &&
        borrowHistory.length > 0 &&
        borrowHistory.length / ITEMS_PER_PAGE > 1 && (
          <div className='mb-[10px] flex justify-end'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(borrowHistory.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(borrowHistory.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(borrowHistory.length / ITEMS_PER_PAGE) &&
                    'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => next()}
                >
                  {'>'}
                </button>
              </div>
            </div>
          </div>
        )}
      <div
        style={{
          height: `calc(100% - ${
            borrowHistory &&
            borrowHistory.length > 0 &&
            borrowHistory.length / ITEMS_PER_PAGE > 1
              ? 28
              : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          borrowHistory && borrowHistory.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!historyLoading &&
          (!borrowHistory ||
            (borrowHistory && borrowHistory.length === 0)) && (
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
                Your history is currently empty.
              </h1>
            </div>
          )}
        {borrowHistory && borrowHistory.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {historyTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='bg-primary border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentBorrowHistory.map((history) => {
                let issuedDate = 'N/A';
                let dueDate = 'N/A';
                let returnedDate = 'N/A';

                if (history.issuedDate)
                  issuedDate = formatDate(history.issuedDate.toDate());
                if (history.dueDate)
                  dueDate = formatDate(history.dueDate.toDate());
                if (history.returnedDate)
                  returnedDate = formatDate(
                    history.returnedDate.toDate(),
                    true
                  );

                return (
                  <React.Fragment key={history.id}>
                    <ReactTooltip id={history.title} />

                    <tr key={history.id} className='font-medium'>
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
                              : history.status === 'Cancelled'
                              ? 'text-yellow-600'
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
