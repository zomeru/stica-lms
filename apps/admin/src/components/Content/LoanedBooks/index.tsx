import React, { useMemo } from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import nProgress from 'nprogress';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import { ITEMS_PER_PAGE, loanedBooksTableHeaders } from '@src/constants';
import { AlgoBorrowDoc } from '@lms/types';
import { formatDate } from '@src/utils';

const LoanedBooks = () => {
  const loanedSearchKey = useNextQuery('loanedSearchKey');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoBorrows, setBorrows, refreshBorrows, borrowLoading] =
    useAlgoData<AlgoBorrowDoc>('borrows', loanedSearchKey);

  const issuedBorrows: AlgoBorrowDoc[] = useMemo(
    () => algoBorrows?.filter((borrow) => borrow.status === 'Issued'),

    [algoBorrows]
  );

  const [currentBorrows, currentPage, next, prev] = useClientPagination(
    issuedBorrows || [],
    ITEMS_PER_PAGE
  );

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshBorrows();
    nProgress.done();
  };

  return (
    <section className='w-full h-full'>
      {issuedBorrows && issuedBorrows.length > 0 && (
        <div className='flex justify-between mb-[10px]'>
          <button
            type='button'
            className='bg-primary hover:bg-sky-800 duration-200 text-white text-sm px-3 py-1 rounded-md'
            onClick={handleUpdate}
          >
            Refresh records
          </button>
          {issuedBorrows.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(issuedBorrows.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(issuedBorrows.length / ITEMS_PER_PAGE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(issuedBorrows.length / ITEMS_PER_PAGE) &&
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
            issuedBorrows && issuedBorrows.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`w-full custom-scrollbar ${
          issuedBorrows && issuedBorrows.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!borrowLoading &&
          (!issuedBorrows ||
            (issuedBorrows && issuedBorrows.length === 0)) && (
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
                {loanedSearchKey
                  ? 'No results found'
                  : 'There is currently no loaned book.'}
              </h1>
            </div>
          )}
        {issuedBorrows && issuedBorrows.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {loanedBooksTableHeaders.map((header) => (
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
              {currentBorrows.map((borrow) => {
                const dueDate = formatDate(borrow.dueDate, true);

                return (
                  <React.Fragment key={borrow.objectID}>
                    <ReactTooltip id={borrow.objectID} />

                    <tr key={borrow.id} className='font-medium'>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-primary'>
                            {borrow.studentName}
                          </p>
                        </button>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p
                            className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-primary'
                            data-for={borrow.objectID}
                            data-tip={borrow.title}
                          >
                            {borrow.title}
                          </p>
                        </button>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left truncate overflow-hidden text-neutral-900'>
                          {borrow.genre}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {borrow.isbn}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {borrow.accessionNumber}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {dueDate}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <div className='flex space-x-3'>
                          <button
                            type='button'
                            className='text-red-600'
                            onClick={() => {}}
                          >
                            Returned
                          </button>
                        </div>
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

export default LoanedBooks;
