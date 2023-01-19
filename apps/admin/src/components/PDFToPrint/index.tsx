import React, { useRef, useState } from 'react';
import { AlgoBorrowDoc } from '@lms/types';
import { useReactToPrint } from 'react-to-print';
import { historyTableHeaders } from '@src/constants';
import { formatDate, simpleFormatDate } from '@src/utils';

interface PDFToPrintProps {
  books: AlgoBorrowDoc[];
  setViewPdf: React.Dispatch<React.SetStateAction<boolean>>;
  fromDate?: Date;
  toDate?: Date;
}

const PDFToPrint = ({
  books,
  setViewPdf,
  fromDate,
  toDate,
}: PDFToPrintProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => ref.current,
    documentTitle: `one_stica_lms_reports_${
      fromDate ? simpleFormatDate(fromDate) : 'oldest'
    }_to_${toDate ? simpleFormatDate(toDate) : 'latest'}`,
    onAfterPrint() {
      console.log('Printed');
      setIsPrinting(false);
    },
    pageStyle: 'p-[40px]',
  });

  return (
    <div className='h-full w-full'>
      <div className='mb-[15px] flex space-x-3'>
        <button
          type='button'
          className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
          onClick={() => setViewPdf(false)}
        >
          Go back
        </button>
        <button
          type='button'
          className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
          onClick={() => {
            setIsPrinting(true);
            setTimeout(() => {
              handlePrint();
            }, 200);
          }}
        >
          Print PDF
        </button>
      </div>
      <div className='h-full w-full' ref={ref}>
        <div
          className={`text-primary flex items-center space-x-2 ${
            isPrinting && 'mb-[20px]'
          }`}
        >
          <p>One STICA Library Management Reports: </p>
          <span className='text-sm text-neutral-700'>
            {fromDate ? simpleFormatDate(fromDate) : 'Oldest'} to{' '}
            {toDate ? simpleFormatDate(toDate) : 'Latest'}
          </span>
        </div>
        <div className='h-full w-full'>
          <div
            style={{
              height: `calc(100% - ${
                books && books.length > 0 ? 60 : 0
              }px)`,
            }}
            className={`${!isPrinting && 'custom-scrollbar w-full'} ${
              !isPrinting &&
              books &&
              books.length > 0 &&
              'overflow-y-scroll'
            }`}
          >
            {books && books.length > 0 && (
              <table className='min-w-full leading-normal'>
                <thead>
                  <tr>
                    {historyTableHeaders.map((header) => (
                      <th
                        key={header}
                        className='bg-primary truncate border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                      >
                        {' '}
                        {header}{' '}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='overflow-y-scroll'>
                  {books.length > 0 ? (
                    books.map((history) => {
                      let issuedDate = 'N/A';
                      let dueDate = 'N/A';
                      let returnedDate = 'N/A';

                      console.log(
                        'issuedDate',
                        new Date(history.issuedDate)
                      );

                      if (history.issuedDate)
                        issuedDate = formatDate(history.issuedDate);
                      if (history.dueDate)
                        dueDate = formatDate(history.dueDate);
                      if (history.returnedDate)
                        returnedDate = formatDate(history.returnedDate);

                      return (
                        <React.Fragment key={history.id}>
                          <tr key={history.id} className='font-medium'>
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <button type='button'>
                                <p className='line-clamp-2 text-primary max-w-[200px] overflow-hidden text-left'>
                                  {history.studentName}
                                </p>
                              </button>
                            </td>
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <button
                                type='button'
                                // onClick={() =>
                                //   navigateToBook(history.bookId)
                                // }
                              >
                                <p
                                  className='line-clamp-2 text-primary max-w-[250px] overflow-hidden text-left'
                                  data-for={history.title}
                                  data-tip={history.title}
                                >
                                  {history.title}
                                </p>
                              </button>
                            </td>
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <p className='w-max text-gray-900'>
                                {history.identifiers.accessionNumber}
                              </p>
                            </td>

                            {/* <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                <p className='whitespace-no-wrap text-gray-900'>
                  {issue.requestedDate}
                </p>
              </td> */}
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <p className='whitespace-no-wrap text-gray-900'>
                                {issuedDate}
                              </p>
                            </td>
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <p className='whitespace-no-wrap text-gray-900'>
                                {dueDate}
                              </p>
                            </td>
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <p className='whitespace-no-wrap text-gray-900'>
                                {returnedDate}
                              </p>
                            </td>
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
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
                            <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                              <p
                                className={`whitespace-no-wrap ${
                                  history.status === 'Returned'
                                    ? 'text-sky-600'
                                    : history.status === 'Issued'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {history.status}
                              </p>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <td
                      className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'
                      colSpan={8}
                    >
                      <p className='whitespace-no-wrap text-center text-gray-900'>
                        No data found
                      </p>
                    </td>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToPrint;
