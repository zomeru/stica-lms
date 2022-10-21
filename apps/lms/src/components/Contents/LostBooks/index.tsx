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

const LostBooks = () => {
  const { user } = useAuth();

  const [lostBorrows, borrowLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', '==', 'Lost'),
      orderBy('updatedAt', 'desc')
    )
  );

  const [currentLostBooks, currentPage, next, prev] = useClientPagination(
    lostBorrows || [],
    ITEMS_PER_PAGE
  );

  return (
    <section className='w-full h-full'>
      {lostBorrows &&
        lostBorrows.length > 0 &&
        lostBorrows.length / ITEMS_PER_PAGE > 1 && (
          <div className='flex justify-end mb-[10px]'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(lostBorrows.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(lostBorrows.length / ITEMS_PER_PAGE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(lostBorrows.length / ITEMS_PER_PAGE) &&
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
            lostBorrows &&
            lostBorrows.length > 0 &&
            lostBorrows.length / ITEMS_PER_PAGE > 1
              ? 28
              : 0
          }px)`,
        }}
        className={`w-full custom-scrollbar ${
          lostBorrows && lostBorrows.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!borrowLoading &&
          (!lostBorrows || (lostBorrows && lostBorrows.length === 0)) && (
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
                You currently have no borrow request.
              </h1>
            </div>
          )}
        {lostBorrows && lostBorrows.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {lostBooksTableHeaders.map((header) => (
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
              {currentLostBooks.map((borrow) => {
                return (
                  <React.Fragment key={borrow.id}>
                    <ReactTooltip id={borrow.title} />
                    <tr key={borrow.id} className='font-medium'>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(borrow.bookId)}
                        >
                          <p
                            className='max-w-[200px] overflow-hidden text-primary line-clamp-2 text-left'
                            data-for={borrow.title}
                            data-tip={borrow.title}
                          >
                            {borrow.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {borrow.author}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {borrow.isbn}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {borrow.accessionNumber}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
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
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
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

export default LostBooks;
