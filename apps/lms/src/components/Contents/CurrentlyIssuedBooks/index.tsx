import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';
import {
  collection,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { formatDate, navigateToBook } from '@src/utils';
import { issuedBooksTableHeaders, ITEMS_PER_PAGE } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { useAuth } from '@src/contexts';
import { db } from '@lms/db';
import { useClientPagination } from '@lms/ui';
import { toast } from 'react-hot-toast';
import nProgress from 'nprogress';

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

  const handleRenewRequest = async (borrowDoc: IBorrowDoc) => {
    if (borrowDoc.penalty > 0) return;

    nProgress.configure({ showSpinner: true });
    nProgress.start();

    const dueDate = new Date(borrowDoc.dueDate.toDate());

    const timeApiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=${
      process.env.NEXT_PUBLIC_TIMEZONE_API_KEY as string
    }&location=Manila, Philippines`;

    try {
      const timeRes = await fetch(timeApiUrl);
      const timeData = await timeRes.json();

      if (timeData) {
        const today = new Date(timeData.datetime);

        const diff = dueDate.getTime() - today.getTime();
        // const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const diffDays = diff / (1000 * 60 * 60 * 24);

        if (diffDays < 1) {
          const borrowRef = doc(db, 'borrows', borrowDoc.id);
          await updateDoc(borrowRef, {
            renewRequest: true,
          });
          toast.success('Renewal request sent!');
        } else {
          toast.error('You can only renew 24 hours before due date');
        }
      }

      nProgress.done();
    } catch (error) {
      console.log('renew error', error);
      nProgress.done();
      toast.error('Something went wrong! Please try again later.');
    }
  };

  return (
    <section className='h-full w-full'>
      {issuedBooks &&
        issuedBooks.length > 0 &&
        issuedBooks.length / ITEMS_PER_PAGE > 1 && (
          <div className='mb-[10px] flex justify-end'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(issuedBooks.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(issuedBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(issuedBooks.length / ITEMS_PER_PAGE) &&
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
            issuedBooks &&
            issuedBooks.length > 0 &&
            issuedBooks.length / ITEMS_PER_PAGE > 1
              ? 28
              : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          issuedBooks && issuedBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!issueLoading &&
          (!issuedBooks || (issuedBooks && issuedBooks.length === 0)) && (
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
                    className='bg-primary border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
                <th
                  className='bg-primary border-b-2 border-gray-200 px-5 py-5'
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
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(issue.bookId)}
                        >
                          <p
                            className='line-clamp-2 text-primary max-w-[200px] overflow-hidden text-left'
                            data-for={issue.title}
                            data-tip={issue.title}
                          >
                            {issue.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>{issue.isbn}</p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='w-max text-gray-900'>
                          {issue.accessionNumber}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {issuedDate}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
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
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
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
                      <td className='border-cGray-200 relative space-x-3 border-b bg-white pr-5 text-right text-sm'>
                        <ReactTooltip id={issue.id} />
                        <button
                          data-for={issue.id}
                          data-tip={
                            issue.penalty > 0
                              ? 'You can not renew this book because you have a penalty. Please settle the penalty.'
                              : ''
                          }
                          // disabled={
                          //   issue.penalty > 0 || issue.renewRequest
                          // }
                          className={`rounded-md px-2 py-1 text-xs transition-colors duration-300 ${
                            issue.penalty > 0
                              ? 'cursor-not-allowed bg-neutral-500 '
                              : 'bg-sky-600'
                          } ${
                            issue.renewRequest
                              ? 'bg-transparent text-sky-600'
                              : 'text-white'
                          }`}
                          type='button'
                          onClick={() => handleRenewRequest(issue)}
                        >
                          {issue.renewRequest
                            ? 'Renew Requested'
                            : 'Renew'}
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
