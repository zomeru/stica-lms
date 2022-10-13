import React from 'react';
import ReactTooltip from 'react-tooltip';
import { collection, orderBy, query, where } from 'firebase/firestore';
import Image from 'next/image';

import { formatDate, navigateToBook } from '@src/utils';
import { pendingRequestTableHeaders } from '@src/constants';
import { cancelBorrowRequest, useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { db } from '@lms/db';
import { useUser } from '@src/contexts';

const PendingRequests = () => {
  const { user } = useUser();

  const [userBorrows, borrowLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', ['Pending', 'Approved']),
      orderBy('updatedAt', 'desc')
    )
  );

  return (
    <section
      className={`w-full h-full custom-scrollbar ${
        userBorrows && userBorrows.length > 0 && 'overflow-y-scroll'
      }`}
    >
      {!borrowLoading &&
        (!userBorrows || (userBorrows && userBorrows.length === 0)) && (
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
              You currently have no borrow request.
            </h1>
          </div>
        )}
      {userBorrows && userBorrows.length > 0 && (
        <table className='min-w-full leading-normal'>
          <thead>
            <tr>
              {pendingRequestTableHeaders.map((header) => (
                <th
                  key={header}
                  className='border-b-2 border-gray-200 bg-primary px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
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
            {userBorrows.map((borrow: IBorrowDoc) => {
              const requestDate = formatDate(borrow.requestDate.toDate());

              let pickupDueDate = 'N/A';

              if (borrow.pickUpDueDate) {
                pickupDueDate = formatDate(borrow.pickUpDueDate.toDate());
              }

              return (
                <React.Fragment key={borrow.id}>
                  <ReactTooltip id={borrow.title} />

                  <tr key={borrow.id} className='font-medium'>
                    {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {request.id}
                </p>
              </td> */}
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
                      <p className='w-max text-gray-900'>{borrow.isbn}</p>
                    </td>

                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p className='w-max text-gray-900'>
                        {borrow.accessionNumber}
                      </p>
                    </td>

                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p className='whitespace-no-wrap text-gray-900'>
                        {requestDate}
                      </p>
                    </td>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p
                        className={`whitespace-no-wrap ${
                          pickupDueDate !== 'N/A'
                            ? 'text-sky-600'
                            : 'text-gray-900 '
                        }`}
                      >
                        {pickupDueDate}
                      </p>
                    </td>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p
                        className={`whitespace-no-wrap ${
                          borrow.status === 'Pending'
                            ? 'text-orange-500'
                            : 'text-green-500'
                        }`}
                      >
                        {borrow.status}
                      </p>
                    </td>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-right text-sm relative'>
                      <button
                        type='button'
                        className='inline-block text-red-500 hover:text-red-600'
                        onClick={() => {
                          cancelBorrowRequest(borrow.id);
                        }}
                      >
                        Cancel request
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default PendingRequests;
