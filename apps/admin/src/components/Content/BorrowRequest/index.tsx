import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import nProgress from 'nprogress';
import Modal from 'react-modal';
import { BsArrowLeft } from 'react-icons/bs';
import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import { addDays, DAYS, simpleFormatDate } from '@src/utils';
import {
  BOOK_GENRES_FICTION,
  borrowRequestBooksTableHeaders,
  ITEMS_PER_PAGE,
} from '@src/constants';
import {
  AlgoBorrowDoc,
  FictionType,
  IBookDoc,
  ISBNType,
} from '@lms/types';
import { db } from '@lms/db';

Modal.setAppElement('#__next');

const modalCustomStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
    borderRadius: '15px',
  },
};

const PickedUpModal = ({
  isModalOpen,
  setSelectedBorrow,
  borrowData,
  borrows,
  setBorrows,
}: {
  isModalOpen: boolean;
  borrows: AlgoBorrowDoc[];
  setBorrows: React.Dispatch<React.SetStateAction<AlgoBorrowDoc[]>>;
  setSelectedBorrow: React.Dispatch<React.SetStateAction<string>>;
  borrowData: AlgoBorrowDoc | undefined;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmBookPickup = async () => {
    try {
      // check if borrow request still exists in db
      const borrowRef = doc(db, 'borrows', borrowData?.objectID || '');
      const borrowSnap = await getDoc(borrowRef);

      if (!borrowSnap.exists()) {
        toast.error('Borrow request no longer exists');
        return;
      }

      nProgress.configure({ showSpinner: false });
      nProgress.start();
      setIsConfirming(true);

      // get book data
      const bookRef = doc(db, 'books', borrowData?.bookId || '');
      const bookSnap = await getDoc(bookRef);

      const bookData = {
        ...bookSnap.data(),
        id: bookSnap.id,
      } as IBookDoc;

      const filteredISBNs = [...bookData.isbns].filter(
        (el) => el.isbn !== borrowData?.isbn
      );

      const newIsbn: ISBNType[] = [
        ...filteredISBNs,
        {
          isbn: borrowData?.isbn!,
          isAvailable: false,
          issuedBy: borrowData?.userId,
        },
      ];

      const holidayApiUrl = `https://www.googleapis.com/calendar/v3/calendars/en.philippines%23holiday%40group.v.calendar.google.com/events?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

      const holRes = await fetch(holidayApiUrl);
      const holData = await holRes.json();
      const holidays = [...holData.items];
      const holidayItems: any = [];

      holidays.forEach((item) => {
        const calItems = {
          id: item.id,
          description: item.description,
          summary: item.summary,
          startDate: item.start.date,
          endDate: item.end.date,
        };

        holidayItems.push(calItems);
      });

      const timeApiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=${
        process.env.NEXT_PUBLIC_TIMEZONE_API_KEY as string
      }&location=Manila, Philippines`;

      const timeRes = await fetch(timeApiUrl);
      const timeData = await timeRes.json();

      const date = new Date(timeData.datetime);

      const daysToAddToDueDate = BOOK_GENRES_FICTION.includes(
        (borrowData?.genre as FictionType) || ('' as FictionType)
      )
        ? 7
        : 3;

      const dueDate = addDays(date, daysToAddToDueDate);

      const dueDateDay = DAYS[dueDate.getDay()];

      const daysToAddIfWeekends =
        dueDateDay === 'Saturday' ? 2 : dueDateDay === 'Sunday' ? 1 : 0;
      const newDueDate = addDays(dueDate, daysToAddIfWeekends);

      let holidayDaysToAdd = 0;
      let increment = 0;

      while (true) {
        // check if holiday
        const currentDueDate = addDays(newDueDate, increment);
        const newDueDateDay = DAYS[currentDueDate.getDay()];

        if (newDueDateDay !== 'Sunday' && newDueDateDay !== 'Saturday') {
          const simpleDueDate = simpleFormatDate(currentDueDate);

          const isHoliday = holidayItems.some(
            (item: any) => item.startDate === simpleDueDate
          );

          if (isHoliday) {
            holidayDaysToAdd = +1;
          } else {
            break;
          }
        }

        increment += 1;
      }

      const finalDueDate = addDays(newDueDate, holidayDaysToAdd);
      finalDueDate.setHours(17, 0, 0, 0);
      const finalDueDateTimestamp = Timestamp.fromDate(finalDueDate);

      // update 1 book isbn
      await updateDoc(bookRef, {
        isbns: newIsbn,
      });

      // update borrow request
      const timestamp = serverTimestamp();
      await updateDoc(borrowRef, {
        status: 'Issued',
        dueDate: finalDueDateTimestamp,
        issuedDate: timestamp,
        updatedAt: timestamp,
      });

      const newBorrows = borrows.filter(
        (borrow) => borrow.objectID !== borrowData?.objectID
      );
      setBorrows(newBorrows);
      toast.success('Book picked up successfully');
      setIsConfirming(false);
      setSelectedBorrow('');
      nProgress.done();
    } catch (error) {
      console.log('Error picking up book', error);
      toast.error('Something went wrong! Please try again.');
      setIsConfirming(false);
      setSelectedBorrow('');
      nProgress.done();
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={() => setSelectedBorrow('')}
      contentLabel='Picked up Modal'
      style={modalCustomStyle}
      closeTimeoutMS={200}
    >
      <div className='space-y-3'>
        <button type='button' onClick={() => setSelectedBorrow('')}>
          <BsArrowLeft className='h-8 w-8 text-primary' />
        </button>
        <div className='text-2xl font-semibold text-center text-primary'>
          Are you sure the book has been picked up?
        </div>
        <div className='max-w-[400px] text-neutral-700 text-lg space-y-1'>
          <div className='text-neutral-900'>
            Student name:{' '}
            <span className='text-sky-600'>{borrowData?.studentName}</span>
          </div>
          <ReactTooltip id={borrowData?.objectID} />
          <div
            className='line-clamp-2'
            data-for={borrowData?.objectID}
            data-tip={borrowData?.title}
          >
            Title:{' '}
            <span className='text-sky-600'>{borrowData?.title}</span>
          </div>
          <div>
            Author:{' '}
            <span className='text-sky-600'>{borrowData?.author}</span>
          </div>
          <div>
            Genre:{' '}
            <span className='text-sky-600'>{borrowData?.genre}</span>
          </div>
          <div>
            ISBN: <span className='text-sky-600'>{borrowData?.isbn}</span>
          </div>
          <div>
            Accession No.:{' '}
            <span className='text-sky-600'>
              {borrowData?.accessionNumber}
            </span>
          </div>
        </div>
        <div className='flex justify-end'>
          <button
            disabled={isConfirming}
            type='button'
            className={`text-white rounded-lg px-3 py-2 ${
              isConfirming
                ? 'cursor-not-allowed bg-neutral-500'
                : 'bg-primary'
            }`}
            onClick={handleConfirmBookPickup}
          >
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

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
