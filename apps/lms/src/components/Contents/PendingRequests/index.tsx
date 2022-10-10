import React from 'react';
import ReactTooltip from 'react-tooltip';

import { formatDate, randNum } from '@src/utils';
import { pendingRequestTableHeaders, requestStatus } from '@src/constants';

const PendingRequests = () => {
  const [actionShowId, setActionShowId] = React.useState('');

  const pendingRequests = React.useMemo(() => {
    const newPendingRequests: any = [];

    new Array(10).fill(0).forEach((_, i) => {
      const randomStatus = requestStatus[randNum(0, 1)];
      const today = formatDate(new Date());
      const tomorrow = formatDate(
        new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      );

      newPendingRequests.push({
        id: `bookId-${1 + i}`,
        isbn: `${randNum(100, 999)}-${randNum(0, 9)}-${randNum(
          10,
          99
        )}-${randNum(100000, 999999)}-${randNum(0, 9)}`,
        accessionNo: `${randNum(100, 999)}-${randNum(0, 9)}-${randNum(
          10,
          99
        )}-${randNum(100000, 999999)}-${randNum(0, 9)}`,
        title: `The Great Gatsby - ${1 + i}`,
        requestDate: today,
        pickupDueDate: randomStatus === 'Pending' ? 'N/A' : tomorrow,
        status: randomStatus,
      });
    });

    return newPendingRequests;
  }, []);

  return (
    <section className='w-full h-full overflow-y-scroll custom-scrollbar'>
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
          {pendingRequests.map((request: any) => (
            <tr key={request.id} className='font-medium'>
              {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {request.id}
                </p>
              </td> */}
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p
                  className='w-[150px] text-ellipsis overflow-hidden text-gray-600'
                  data-for={request.title}
                  data-tip={request.title}
                >
                  {request.title}
                </p>
                <ReactTooltip id={request.title} />
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='w-max text-gray-900'>{request.isbn}</p>
              </td>

              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='w-max text-gray-900'>
                  {request.accessionNo}
                </p>
              </td>

              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {request.requestDate}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p
                  className={`whitespace-no-wrap ${
                    request.pickupDueDate !== 'N/A'
                      ? 'text-sky-600'
                      : 'text-gray-900 '
                  }`}
                >
                  {request.pickupDueDate}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p
                  className={`whitespace-no-wrap ${
                    request.status === 'Pending'
                      ? 'text-orange-500'
                      : 'text-green-500'
                  }`}
                >
                  {request.status}
                </p>
              </td>
              <td className='border-b border-cGray-200 bg-white px-5 py-5 text-right text-sm relative'>
                <button
                  type='button'
                  className='inline-block text-gray-500 hover:text-gray-700'
                  onClick={() => {
                    if (actionShowId === request.id) {
                      setActionShowId('');
                    } else {
                      setActionShowId(request.id);
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
                {actionShowId === request.id && (
                  <button
                    className='bg-red-500 absolute text-white px-3 py-2 top-[10px] left-0 -translate-x-[50px] 2xl:-translate-x-[20px] hover:bg-red-600 duration-300 transition-colors'
                    type='button'
                    onClick={() => setActionShowId('')}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default PendingRequests;
