import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { BsArrowLeft } from 'react-icons/bs';
import Modal from 'react-modal';

import {
  AlgoBorrowDoc,
  FictionType,
  IBookDoc,
  ISBNType,
} from '@lms/types';
import { addDays, DAYS, simpleFormatDate } from '@src/utils';
import { db } from '@lms/db';
import nProgress from 'nprogress';
import ReactTooltip from 'react-tooltip';
import { BOOK_GENRES_FICTION } from '@src/constants';
import { useState } from 'react';

interface PickedUpModalProps {
  isModalOpen: boolean;
  borrows: AlgoBorrowDoc[];
  setBorrows: React.Dispatch<React.SetStateAction<AlgoBorrowDoc[]>>;
  setSelectedBorrow: React.Dispatch<React.SetStateAction<string>>;
  borrowData: AlgoBorrowDoc | undefined;
}

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
}: PickedUpModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmBookPickup = async () => {
    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIsConfirming(true);

      const borrowRef = doc(db, 'borrows', borrowData?.objectID || '');
      const borrowSnap = await getDoc(borrowRef);

      // check if borrow request does not exist or has been cancelled
      if (
        !borrowSnap.exists() ||
        borrowSnap.data()?.status !== 'Pending'
      ) {
        toast.error('Borrow request no longer exists');
        nProgress.done();
        setIsConfirming(false);
        return;
      }

      // get book data
      const bookRef = doc(db, 'books', borrowData?.bookId || '');
      const bookSnap = await getDoc(bookRef);

      const bookData = {
        ...bookSnap.data(),
        id: bookSnap.id,
      } as IBookDoc;

      // check if the book is still available
      if (bookData.available === 0) {
        toast.error('There is currently no available copy of this book');
        nProgress.done();
        setIsConfirming(false);
        return;
      }

      const filteredISBNs = [...bookData.isbns].filter(
        (el) => el.isbn !== borrowData?.isbn
      );

      const newIsbn: ISBNType[] = [
        ...filteredISBNs,
        {
          isbn: borrowData?.isbn!,
          // isAvailable: false,
          status: 'Borrowed',
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
      let incrementDay = 0;

      while (true) {
        // check if holiday
        const currentDueDate = addDays(newDueDate, incrementDay);
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

        incrementDay += 1;
      }

      const finalDueDate = addDays(newDueDate, holidayDaysToAdd);
      finalDueDate.setHours(17, 0, 0, 0);
      const finalDueDateTimestamp = Timestamp.fromDate(finalDueDate);

      // TODO: do this in fast dev mode
      // const sampleDate = new Date();
      // sampleDate.setSeconds(sampleDate.getSeconds() + 10);
      // const sampleDueDateTimestamp = Timestamp.fromDate(sampleDate);
      // TODO: do this in fast dev mode

      // update 1 book isbn
      await updateDoc(bookRef, {
        isbns: newIsbn,
        available: increment(-1),
        totalBorrowed: increment(1),
      });

      // update borrow request
      const timestamp = serverTimestamp();
      await updateDoc(borrowRef, {
        status: 'Issued',
        dueDate: finalDueDateTimestamp,
        // dueDate: sampleDueDateTimestamp,
        issuedDate: timestamp,
        updatedAt: timestamp,
      });

      const userRef = doc(db, 'users', borrowData?.userId || '');
      await updateDoc(userRef, {
        totalBorrowedBooks: increment(1),
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

export default PickedUpModal;
