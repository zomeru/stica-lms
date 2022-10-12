import React from 'react';
import ReactTooltip from 'react-tooltip';
import { collection, query, where } from 'firebase/firestore';

import { formatDate, navigateToBook } from '@src/utils';
import { pendingRequestTableHeaders } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { db } from '@lms/db';
import { useUser } from '@src/contexts';
import { cancelBorrowRequest } from '@src/utils/borrow';
import Image from 'next/image';

const PendingRequests = () => {
  const { user } = useUser();

  const [actionShowId, setActionShowId] = React.useState('');

  const [userBorrows, borrowLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      // orderBy('updatedAt', 'desc'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', ['Pending', 'Approved'])
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
                          className='w-[150px] overflow-hidden text-gray-600 line-clamp-2'
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
                        className='inline-block text-gray-500 hover:text-gray-700'
                        onClick={() => {
                          if (actionShowId === borrow.id) {
                            setActionShowId('');
                          } else {
                            setActionShowId(borrow.id);
                          }
                        }}
                      >
                        <svg
                          className='inline-block h-6 w-6 fill-current'
                          viewBox='0 0 24 24'
                        >
                          <path d='M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z' />
                        </svg>
                      </button>
                      {actionShowId === borrow.id && (
                        <button
                          className='bg-red-500 absolute text-white px-3 py-2 top-[10px] left-0 -translate-x-[50px] 2xl:-translate-x-[20px] hover:bg-red-600 duration-300 transition-colors truncate'
                          type='button'
                          onClick={() => {
                            cancelBorrowRequest(borrow.id, () =>
                              setActionShowId('')
                            );
                          }}
                        >
                          Cancel
                        </button>
                      )}
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
