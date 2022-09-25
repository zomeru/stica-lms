import React from 'react';
import ReactTooltip from 'react-tooltip';

import { formatDate, randNum } from '@src/utils';
import { historyStatus, historyTableHeaders } from '@src/constants';

function getRandomDate(from: Date, to: Date) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
}

const History = () => {
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

  return (
    <section className='h-full overflow-y-scroll custom-scrollbar'>
      <table>
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
          {bookHistory.map((issue: any) => (
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
              {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {issue.requestedDate}
                </p>
              </td> */}
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className="whitespace-no-wrap text-gray-600">
                  {issue.issuedDate}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className="whitespace-no-wrap text-gray-600">
                  {issue.dueDate}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className="whitespace-no-wrap text-gray-600">
                  {issue.returnedDate}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p
                  className={`whitespace-no-wrap ${
                    issue.penalty > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  ₱{issue.penalty}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p
                  className={`whitespace-no-wrap ${
                    issue.status === 'Returned'
                      ? 'text-sky-600'
                      : issue.status === 'Cancelled'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {issue.status}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default History;
