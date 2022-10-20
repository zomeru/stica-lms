import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';
import { collection, query, orderBy, where } from 'firebase/firestore';

import { formatDate, navigateToBook } from '@src/utils';
import { historyTableHeaders, ITEMS_PER_PAGE } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { db } from '@lms/db';
import { useAuth } from '@src/contexts';
import { useClientPagination } from '@lms/ui';

const History = () => {
  const { user } = useAuth();

  const [borrowHistory, historyLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', [
        'Cancelled',
        'Lost',
        'Returned',
        'Returned with damage',
      ]),
      orderBy('updatedAt', 'desc')
    )
  );

  const [currentBorrowHistory, currentPage, next, prev] =
    useClientPagination(borrowHistory || [], ITEMS_PER_PAGE);

  return (
    <section className='w-full h-full'>
      {borrowHistory &&
        borrowHistory.length > 0 &&
        borrowHistory.length / ITEMS_PER_PAGE > 1 && (
          <div className='flex justify-end mb-[10px]'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(borrowHistory.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(borrowHistory.length / ITEMS_PER_PAGE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(borrowHistory.length / ITEMS_PER_PAGE) &&
                    'opacity-40 cursor-not-allowed'
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
        className={`w-full custom-scrollbar ${
          borrowHistory && borrowHistory.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!historyLoading &&
          (!borrowHistory ||
            (borrowHistory && borrowHistory.length === 0)) && (
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
                    className='border-b-2 border-gray-200 bg-primary px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
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
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(history.bookId)}
                        >
                          <p
                            className='max-w-[200px] line-clamp-2 overflow-hidden text-primary text-left'
                            data-for={history.title}
                            data-tip={history.title}
                          >
                            {history.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {history.isbn}
                        </p>
                      </td>

                      {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {issue.requestedDate}
                </p>
              </td> */}
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {issuedDate}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {dueDate}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {returnedDate}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
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
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
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
