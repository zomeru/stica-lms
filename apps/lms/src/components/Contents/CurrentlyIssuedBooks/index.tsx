import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';
import { collection, orderBy, query, where } from 'firebase/firestore';

import { formatDate, navigateToBook, randNum } from '@src/utils';
import { issuedBooksTableHeaders } from '@src/constants';
import { useCol } from '@src/services';
import { IBorrowDoc } from '@lms/types';
import { useUser } from '@src/contexts';
import { db } from '@lms/db';

const CurrentlyIssuedBooks = () => {
  const { user } = useUser();

  const [issuedBooks, issueLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', '==', 'Issued'),
      orderBy('updatedAt', 'desc')
    )
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const issuedBooks_: IBorrowDoc[] = React.useMemo(() => {
    const newIssuedBooks: any = [];
    const daysDiff: any = [];

    new Array(10).fill(0).forEach((_, i) => {
      const date = new Date();
      const oneOrTwo = randNum(1, 2);

      // generated yester's date if oneOrTwo is 1 else generated the day before yesterday's date
      const issuedDate =
        oneOrTwo === 1
          ? new Date(date.getTime() - 24 * 60 * 60 * 1000)
          : new Date(date.getTime() - 48 * 60 * 60 * 1000);

      // generated todays's date if oneOrTwo is 1 else generated yesterday's date
      const dueDate =
        oneOrTwo === 1
          ? new Date(date.getTime())
          : new Date(date.getTime() - 24 * 60 * 60 * 1000);

      // difference
      const diff = dueDate.getTime() - date.getTime();
      const totalDays = Math.abs(diff / (1000 * 3600 * 24));
      daysDiff.push(totalDays);

      newIssuedBooks.push({
        id: `bookId-${1 + i}`,
        isbn: `${randNum(100, 999)}-${randNum(0, 9)}-${randNum(
          10,
          99
        )}-${randNum(100000, 999999)}-${randNum(0, 9)}`,
        title: `The Great Gatsby - ${1 + i}`,
        issuedDate: formatDate(issuedDate),
        dueDate: formatDate(dueDate),
        penalty: totalDays * 5,
      });
    });

    console.log('daysDiff', daysDiff);
    return newIssuedBooks;
  }, []);

  return (
    <section
      className={`w-full h-full custom-scrollbar ${
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
            {issuedBooks.map((issue) => (
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
                      {issue.issuedDate}
                    </p>
                  </td>
                  <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                    <p
                      className={`whitespace-no-wrap ${
                        issue.penalty > 0 ? 'text-red-500' : 'text-sky-600'
                      }`}
                    >
                      {issue.dueDate}
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
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default CurrentlyIssuedBooks;
