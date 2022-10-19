import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';
import { collection, orderBy, query, where } from 'firebase/firestore';

import { formatDate, navigateToBook } from '@src/utils';
import { issuedBooksTableHeaders, ITEMS_PER_PAGE } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { useAuth } from '@src/contexts';
import { db } from '@lms/db';
import { useClientPagination } from '@lms/ui';

const CurrentlyIssuedBooks = () => {
  const { user } = useAuth();

  const [issuedBooks, issueLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', '==', 'Issued'),
      orderBy('updatedAt', 'desc')
    )
  );

  const [currentIssuedBooks, currentPage, next, prev] =
    useClientPagination(issuedBooks || [], ITEMS_PER_PAGE);

  return (
    <section className='w-full h-full'>
      {issuedBooks &&
        issuedBooks.length > 0 &&
        issuedBooks.length / ITEMS_PER_PAGE > 1 && (
          <div className='flex justify-end mb-[10px]'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(issuedBooks.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(issuedBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(issuedBooks.length / ITEMS_PER_PAGE) &&
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
            issuedBooks &&
            issuedBooks.length > 0 &&
            issuedBooks.length / ITEMS_PER_PAGE > 1
              ? 28
              : 0
          }px)`,
        }}
        className={`w-full custom-scrollbar ${
          issuedBooks && issuedBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!issueLoading &&
          (!issuedBooks || (issuedBooks && issuedBooks.length === 0)) && (
            <div className='w-full h-full flex flex-col justify-center space-y-3'>
              <div className='relative w-[75%] h-[75%] mx-auto'>
                <Image
                  src='/assets/images/books_empty.png'
                  layout='fill'
                  objectFit='contain'
                  blurDataURL='/assets/images/books_empty.png'
                  placeholder='blur'
                />
              </div>
              <h1 className='text-cGray-300 text-2xl text-center'>
                You currently have no issued book.
              </h1>
            </div>
          )}

        {issuedBooks && issuedBooks.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {issuedBooksTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='border-b-2 border-gray-200 bg-primary px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
                <th
                  className='border-b-2 border-gray-200 bg-primary px-5 py-5'
                  aria-label='action'
                />
              </tr>
            </thead>
            <tbody>
              {currentIssuedBooks.map((issue) => {
                const issuedDate = formatDate(issue.issuedDate.toDate());
                const dueDate = formatDate(issue.dueDate.toDate(), true);

                return (
                  <React.Fragment key={issue.id}>
                    <ReactTooltip id={issue.title} />
                    <tr className='font-medium'>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(issue.bookId)}
                        >
                          <p
                            className='max-w-[200px] line-clamp-2 text-left overflow-hidden text-primary'
                            data-for={issue.title}
                            data-tip={issue.title}
                          >
                            {issue.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>{issue.isbn}</p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {issuedDate}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p
                          className={`whitespace-no-wrap ${
                            issue.penalty > 0
                              ? 'text-red-600'
                              : 'text-sky-600'
                          }`}
                        >
                          {dueDate}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p
                          className={`whitespace-no-wrap ${
                            issue.penalty > 0
                              ? 'text-orange-500'
                              : 'text-green-500'
                          }`}
                        >
                          ₱{issue.penalty}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 pr-5 space-x-3 bg-white text-right text-sm relative'>
                        <ReactTooltip id={issue.id} />
                        <button
                          data-for={issue.id}
                          data-tip={
                            issue.penalty > 0
                              ? 'You can not renew this book because you have a penalty.'
                              : ''
                          }
                          // disabled={issue.penalty > 0}
                          className={`duration-300 transition-colors ${
                            issue.penalty > 0
                              ? 'cursor-not-allowed text-neutral-500'
                              : 'text-sky-600'
                          }`}
                          type='button'
                          onClick={() => {
                            // if (issue.penalty > 0) return;
                          }}
                        >
                          Renew
                        </button>

                        {/* <button
                      className='text-red-600 duration-300 transition-colors'
                      type='button'
                      onClick={() => {}}
                    >
                      Lost
                    </button> */}
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

export default CurrentlyIssuedBooks;
