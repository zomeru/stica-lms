import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import nProgress from 'nprogress';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import {
  DEFAULT_SORT_ITEM,
  ITEMS_PER_PAGE,
  loanedBooksTableHeaders,
} from '@src/constants';
import { AlgoBorrowDoc } from '@lms/types';
import { formatDate, navigateToBook } from '@src/utils';
import ReturnedModal from './ReturnedModal';
import LostModal from './LostModal';

const bookSearchQueryName = 'loanedSearchKey';

const LoanedBooks = () => {
  const loanedSearchKey = useNextQuery(bookSearchQueryName);

  const [selectedReturnBorrow, setSelectedReturnBorrow] = useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoBorrows, setBorrows, refreshBorrows, borrowLoading] =
    useAlgoData<AlgoBorrowDoc>(
      'borrows',
      bookSearchQueryName,
      loanedSearchKey
    );

  const issuedBorrows: AlgoBorrowDoc[] = useMemo(
    () => algoBorrows?.filter((borrow) => borrow.status === 'Issued'),

    [algoBorrows]
  );

  const [currentBorrows, currentPage, next, prev] = useClientPagination(
    issuedBorrows || [],
    ITEMS_PER_PAGE,
    DEFAULT_SORT_ITEM
  );

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshBorrows();
    nProgress.done();
  };

  return (
    <section className='h-full w-full'>
      <ReturnedModal
        isModalOpen={!!selectedReturnBorrow && isReturnModalOpen}
        setIsModalOpen={setIsReturnModalOpen}
        setSelectedBorrow={setSelectedReturnBorrow}
        borrowData={issuedBorrows.find(
          (borrow) => borrow.objectID === selectedReturnBorrow
        )}
        borrows={algoBorrows}
        setBorrows={setBorrows}
      />
      <LostModal
        isModalOpen={!!selectedReturnBorrow && isLostModalOpen}
        setIsModalOpen={setIsLostModalOpen}
        setSelectedBorrow={setSelectedReturnBorrow}
        borrowData={issuedBorrows.find(
          (borrow) => borrow.objectID === selectedReturnBorrow
        )}
        borrows={algoBorrows}
        setBorrows={setBorrows}
      />
      {issuedBorrows && issuedBorrows.length > 0 && (
        <div className='mb-[10px] flex justify-between'>
          <button
            type='button'
            className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
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
                    Math.ceil(issuedBorrows.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(issuedBorrows.length / ITEMS_PER_PAGE) &&
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
            issuedBorrows && issuedBorrows.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          issuedBorrows && issuedBorrows.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!borrowLoading &&
          (!issuedBorrows ||
            (issuedBorrows && issuedBorrows.length === 0)) && (
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
                {loanedSearchKey
                  ? 'No results found'
                  : 'There is currently no loaned book.'}
              </h1>
              {!loanedSearchKey && (
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
        {issuedBorrows && issuedBorrows.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {loanedBooksTableHeaders.map((header) => (
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
              {currentBorrows.map((borrow) => {
                const dueDate = formatDate(borrow.dueDate, true);

                return (
                  <React.Fragment key={borrow.objectID}>
                    <ReactTooltip id={borrow.objectID} />

                    <tr key={borrow.id} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'>
                            {borrow.studentName}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(borrow.bookId)}
                        >
                          <p
                            className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'
                            data-for={borrow.objectID}
                            data-tip={borrow.title}
                          >
                            {borrow.title}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {borrow.genre}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {borrow.identifiers.isbn}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {borrow.identifiers.accessionNumber}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {dueDate}
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
                        <div className='flex flex-col space-y-2'>
                          <button
                            type='button'
                            className='truncate rounded-md bg-sky-600 px-2 py-1 text-xs text-white'
                            onClick={() => {
                              setIsReturnModalOpen(true);
                              setSelectedReturnBorrow(borrow.objectID);
                            }}
                          >
                            Returned
                          </button>
                          <button
                            type='button'
                            className='truncate rounded-md bg-red-600 px-2 py-1 text-xs text-white'
                            onClick={() => {
                              setIsLostModalOpen(true);
                              setSelectedReturnBorrow(borrow.objectID);
                            }}
                          >
                            Lost
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
