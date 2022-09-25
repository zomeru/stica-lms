import React from 'react';
import ReactTooltip from 'react-tooltip';

import { formatDate, randNum } from '@src/utils';
import { issuedBooksTableHeaders } from '@src/constants';

const CurrentlyIssuedBooks = () => {
  const [actionShowId, setActionShowId] = React.useState('');

  const issuedBooks = React.useMemo(() => {
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
    <section className='w-full h-full overflow-y-scroll custom-scrollbar'>
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
          {issuedBooks.map((issue: any) => (
            <tr key={issue.id} className='font-medium'>
              {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {issue.id}
                </p>
              </td> */}
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='w-max text-gray-900'>{issue.isbn}</p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p
                  className='w-[150px] text-ellipsis overflow-hidden text-gray-600'
                  data-for={issue.title}
                  data-tip={issue.title}
                >
                  {issue.title}
                </p>
                <ReactTooltip id={issue.title} />
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
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-right text-sm relative'>
                <button
                  type='button'
                  className='inline-block text-gray-500 hover:text-gray-700'
                  onClick={() => {
                    if (actionShowId === issue.id) {
                      setActionShowId('');
                    } else {
                      setActionShowId(issue.id);
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
                {actionShowId === issue.id && (
                  <div className='flex flex-col absolute -top-[15px] left-0 -translate-x-[50px] 2xl:-translate-x-[20px] space-y-1'>
                    <button
                      disabled={issue.penalty > 0}
                      className={` text-white px-3 py-2 duration-300 transition-colors ${
                        issue.penalty > 0
                          ? 'cursor-not-allowed bg-cGray-300'
                          : 'bg-sky-500 hover:bg-sky-600'
                      }`}
                      type='button'
                      onClick={() => setActionShowId('')}
                    >
                      Renew
                    </button>
                    <button
                      className="text-white px-3 py-2 duration-300 transition-colors bg-red-500 hover:bg-red-600"
                      type='button'
                      onClick={() => setActionShowId('')}
                    >
                      Lost
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default CurrentlyIssuedBooks;
