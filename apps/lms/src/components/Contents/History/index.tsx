import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';

import { formatDate, navigateToBook, randNum } from '@src/utils';
import { historyStatus, historyTableHeaders } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '@lms/db';
import { useUser } from '@src/contexts';
import { useClientPagination } from '@src/hooks';

function getRandomDate(from: Date, to: Date) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
}

const PAGE_SIZE = 10;

const History = () => {
  const { user } = useUser();

  const [borrowHistory, historyLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', [
        'Cancelled',
        'Lost',
        'Returned',
        'Returned with Damage',
      ]),
      orderBy('updatedAt', 'desc')
    )
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bookHistory = React.useMemo(() => {
    const newBookHistory: any = [];
    const daysDiff: any = [];

    new Array(10).fill(0).forEach((_, i) => {
      // generate random date between 1 to 10 days
      const today = new Date();
      // 7 days ago
      const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const status = historyStatus[randNum(0, 3)];

      const generatedDate = getRandomDate(from, today);

      const oneOrTwo = randNum(1, 2);

      // generated yester's date if oneOrTwo is 1 else generated the day before yesterday's date
      const issuedDate =
        oneOrTwo === 1
          ? new Date(generatedDate.getTime() - 24 * 60 * 60 * 1000)
          : new Date(generatedDate.getTime() - 48 * 60 * 60 * 1000);

      // generated todays's date if oneOrTwo is 1 else generated yesterday's date
      const dueDate =
        oneOrTwo === 1
          ? new Date(generatedDate.getTime())
          : new Date(generatedDate.getTime() - 24 * 60 * 60 * 1000);

      const rand = randNum(0, 2);
      const toMul = 24 * 60 * 60 * 1000 * rand;

      const returnedDate =
        rand === 0 ? dueDate : new Date(dueDate.getTime() + toMul);

      // difference
      const diff = dueDate.getTime() - returnedDate.getTime();
      const totalDays = Math.abs(diff / (1000 * 3600 * 24));
      daysDiff.push(totalDays);

      newBookHistory.push({
        id: `bookId-${1 + i}`,
        isbn: `${randNum(100, 999)}-${randNum(0, 9)}-${randNum(
          10,
          99
        )}-${randNum(100000, 999999)}-${randNum(0, 9)}`,
        title: `The Great Gatsby - ${1 + i}`,
        requestedDate: formatDate(generatedDate),
        issuedDate:
          status === 'Cancelled' ? 'N/A' : formatDate(issuedDate),
        dueDate: status === 'Cancelled' ? 'N/A' : formatDate(issuedDate),
        returnedDate:
          status === 'Lost' || status === 'Cancelled'
            ? 'N/A'
            : formatDate(returnedDate),
        penalty: status === 'Cancelled' ? '0' : totalDays * 5,
        status,
      });
    });

    console.log('daysDiff', daysDiff);
    return newBookHistory;
  }, []);

  const [currentBorrowHistory, currentPage, next, prev] =
    useClientPagination(borrowHistory || [], PAGE_SIZE);

  return (
    <section className='w-full h-full'>
      {borrowHistory &&
        borrowHistory.length > 0 &&
        borrowHistory.length / PAGE_SIZE > 1 && (
          <div className='flex justify-end mb-[10px]'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/{Math.ceil(borrowHistory.length / PAGE_SIZE)}
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
                    Math.ceil(borrowHistory.length / PAGE_SIZE)
                  }
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(borrowHistory.length / PAGE_SIZE) &&
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
            borrowHistory.length / PAGE_SIZE > 1
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
                  src='/assets/images/books_empty.png'
                  layout='fill'
                  objectFit='contain'
                  blurDataURL='/assets/images/books_empty.png'
                  placeholder='blur'
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
                  returnedDate = formatDate(history.returnedDate.toDate());

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
