import { useState } from 'react';
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { BsArrowLeft } from 'react-icons/bs';
import Modal from 'react-modal';
import nProgress from 'nprogress';
import ReactTooltip from 'react-tooltip';

import { AlgoBorrowDoc, IBookDoc, Identifier } from '@lms/types';
import { db } from '@lms/db';
import { processHoliday } from '@src/utils/processHoliday';

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
    if (!borrowData) return;

    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIsConfirming(true);

      const userBorrowQuery = query(
        collection(db, 'borrows'),
        where('status', '==', 'Issued'),
        where('userId', '==', borrowData.userId)
      );
      const borrowQuerySnap = await getDocs(userBorrowQuery);

      if (!borrowQuerySnap.empty && borrowQuerySnap.size >= 5) {
        toast.error('Only maximun of 5 books can be borrowed at once.');
        nProgress.done();
        setIsConfirming(false);
        return;
      }

      const borrowRef = doc(db, 'borrows', borrowData.objectID);
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
      const bookRef = doc(db, 'books', borrowData.bookId);
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

      const filteredIdentifiers = [...bookData.identifiers].filter(
        (el) => {
          const notSameIsbn = el.isbn !== borrowData?.identifiers.isbn;
          const notSameAccession =
            el.accessionNumber !== borrowData?.identifiers.accessionNumber;

          return notSameIsbn && notSameAccession;
        }
      );

      const newIdentifiers: Identifier[] = [
        ...filteredIdentifiers,
        {
          isbn: borrowData.identifiers.isbn!,
          accessionNumber: borrowData.identifiers.accessionNumber!,
          status: 'Borrowed',
          borrowedBy: borrowData?.userId,
        },
      ];

      const finalDueDateTimestamp = await processHoliday(borrowData);

      // update 1 book isbn
      await updateDoc(bookRef, {
        identifiers: newIdentifiers,
        available: increment(-1),
        totalBorrow: increment(1),
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

      const userRef = doc(db, 'users', borrowData.userId);
      await updateDoc(userRef, {
        totalBorrowedBooks: increment(1),
      });

      await addDoc(collection(db, 'notifications'), {
        createdAt: timestamp,
        clicked: false,
        type: 'PickedUp',
        message: `You have picked up ${bookData.title}`,
        userId: borrowData.userId,
        borrowId: borrowData.objectID,
        bookTitle: bookData.title,
      });

      const newBorrows = borrows.filter(
        (borrow) => borrow.objectID !== borrowData.objectID
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
          <BsArrowLeft className='text-primary h-8 w-8' />
        </button>
        <div className='text-primary text-center text-2xl font-semibold'>
          Are you sure the book has been picked up?
        </div>
        <div className='max-w-[400px] space-y-1 text-lg text-neutral-700'>
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
            ISBN:{' '}
            <span className='text-sky-600'>
              {borrowData?.identifiers.isbn}
            </span>
          </div>
          <div>
            Accession No.:{' '}
            <span className='text-sky-600'>
              {borrowData?.identifiers.accessionNumber}
            </span>
          </div>
        </div>
        <div className='flex justify-end'>
          <button
            disabled={isConfirming}
            type='button'
            className={`rounded-lg px-3 py-2 text-white ${
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
