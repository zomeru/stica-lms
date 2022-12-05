import React from 'react';
import ReactTooltip from 'react-tooltip';
import { collection, orderBy, query, where } from 'firebase/firestore';
import Image from 'next/image';

import { navigateToBook } from '@src/utils';
import { ITEMS_PER_PAGE, lostBooksTableHeaders } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { db } from '@lms/db';
import { useAuth } from '@src/contexts';
import { useClientPagination } from '@lms/ui';

const DamagedBooks = () => {
  const { user } = useAuth();

  const [damagedBorrows, borrowLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', '==', 'Damaged'),
      orderBy('updatedAt', 'desc')
    )
  );

  const [currentDamagedBooks, currentPage, next, prev] =
    useClientPagination(damagedBorrows || [], ITEMS_PER_PAGE);

  return (
    <section className='h-full w-full'>
      {damagedBorrows &&
        damagedBorrows.length > 0 &&
        damagedBorrows.length / ITEMS_PER_PAGE > 1 && (
          <div className='mb-[10px] flex justify-end'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(damagedBorrows.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(damagedBorrows.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(damagedBorrows.length / ITEMS_PER_PAGE) &&
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
            damagedBorrows &&
            damagedBorrows.length > 0 &&
            damagedBorrows.length / ITEMS_PER_PAGE > 1
              ? 28
              : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          damagedBorrows &&
          damagedBorrows.length > 0 &&
          'overflow-y-scroll'
        }`}
      >
        {!borrowLoading &&
          (!damagedBorrows ||
            (damagedBorrows && damagedBorrows.length === 0)) && (
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
                You haven&apos;t lost any books yet.
              </h1>
            </div>
          )}
        {damagedBorrows && damagedBorrows.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {lostBooksTableHeaders.map((header) => (
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
              {currentDamagedBooks.map((borrow) => {
                return (
                  <React.Fragment key={borrow.id}>
                    <ReactTooltip id={borrow.title} />
                    <tr key={borrow.id} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(borrow.bookId)}
                        >
                          <p
                            className='text-primary line-clamp-2 max-w-[200px] overflow-hidden text-left'
                            data-for={borrow.title}
                            data-tip={borrow.title}
                          >
                            {borrow.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {borrow.author}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {borrow.isbn}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {borrow.accessionNumber}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p
                          className={`whitespace-no-wrap ${
                            borrow.penalty > 0
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          ₱{borrow.penalty}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p
                          className={`whitespace-no-wrap ${
                            borrow.replaceStatus === 'Pending'
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {borrow.replaceStatus}
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

export default DamagedBooks;
