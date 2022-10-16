import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import nProgress from 'nprogress';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import {
  borrowRequestBooksTableHeaders,
  ITEMS_PER_PAGE,
} from '@src/constants';
import { AlgoBorrowDoc } from '@lms/types';
import PickedUpModal from './PickedUpModal';

const BorrowRequest = () => {
  const borrowSearchKey = useNextQuery('borrowSearchKey');

  const [algoBorrows, setBorrows, refreshBorrows, borrowLoading] =
    useAlgoData<AlgoBorrowDoc>('borrows', borrowSearchKey);

  const [selectedBorrow, setSelectedBorrow] = useState('');

  const pendingBorrows: AlgoBorrowDoc[] = useMemo(
    () => algoBorrows?.filter((borrow) => borrow.status === 'Pending'),
    [algoBorrows]
  );

  const [currentBorrows, currentPage, next, prev] = useClientPagination(
    pendingBorrows || [],
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
      <PickedUpModal
        isModalOpen={!!selectedBorrow}
        setSelectedBorrow={setSelectedBorrow}
        borrowData={pendingBorrows.find(
          (borrow) => borrow.objectID === selectedBorrow
        )}
        borrows={algoBorrows}
        setBorrows={setBorrows}
      />
      {pendingBorrows && pendingBorrows.length > 0 && (
        <div className='flex justify-between mb-[10px]'>
          <button
            type='button'
            className='bg-primary hover:bg-sky-800 duration-200 text-white text-sm px-3 py-1 rounded-md'
            onClick={handleUpdate}
          >
            Refresh records
          </button>
          {pendingBorrows.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(pendingBorrows.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(pendingBorrows.length / ITEMS_PER_PAGE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(pendingBorrows.length / ITEMS_PER_PAGE) &&
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
            pendingBorrows && pendingBorrows.length > 0 ? 30 : 0
          }px)`,
        }}
        className={`w-full custom-scrollbar ${
          pendingBorrows &&
          pendingBorrows.length > 0 &&
          'overflow-y-scroll'
        }`}
      >
        {!borrowLoading &&
          (!pendingBorrows ||
            (pendingBorrows && pendingBorrows.length === 0)) && (
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
                {borrowSearchKey
                  ? 'No results found'
                  : 'There is currently no borrow request.'}
              </h1>
              {!borrowSearchKey && (
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
        {pendingBorrows && pendingBorrows.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {borrowRequestBooksTableHeaders.map((header) => (
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
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {borrow.author}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
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
                        <div className='flex space-x-3'>
                          <button
                            type='button'
                            className='truncate bg-sky-600 text-white px-2 py-1 rounded-md text-xs'
                            onClick={() =>
                              setSelectedBorrow(borrow.objectID)
                            }
                          >
                            Picked up
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

export default BorrowRequest;
