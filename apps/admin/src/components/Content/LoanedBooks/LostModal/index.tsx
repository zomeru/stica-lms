import { useState } from 'react';
import nProgress from 'nprogress';
import ReactTooltip from 'react-tooltip';
import { BsArrowLeft } from 'react-icons/bs';
import Modal from 'react-modal';
import { AiFillEdit } from 'react-icons/ai';
import { FaCheck } from 'react-icons/fa';
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { AlgoBorrowDoc, IBookDoc, ISBNType } from '@lms/types';
import { db } from '@lms/db';
import toast from 'react-hot-toast';

interface LostModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

const LostModal = ({
  isModalOpen,
  setSelectedBorrow,
  borrowData,
  borrows,
  setBorrows,
  setIsModalOpen,
}: LostModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEditingPenalty, setIsEditingPenalty] = useState(false);
  const [penalty, setPenalty] = useState(borrowData?.penalty || 0);

  const handleConfirmBookPickup = async () => {
    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIsConfirming(true);

      const borrowRef = doc(db, 'borrows', borrowData?.objectID || '');

      const timestamp = serverTimestamp();

      await updateDoc(borrowRef, {
        penalty,
        status: 'Lost',
        updatedAt: timestamp,
        returnedDate: timestamp,
      });

      const bookRef = doc(db, 'books', borrowData?.bookId || '');
      const bookSnap = await getDoc(bookRef);
      const bookData = {
        ...bookSnap.data(),
        id: bookSnap.id,
      } as IBookDoc;

      const filteredISBNs = [...bookData.isbns].filter(
        (el) => el.isbn !== borrowData?.isbn
      );

      const updatedBorrowISBN: ISBNType = {
        isbn: borrowData?.isbn!,
        // isAvailable: true,
        status: 'Lost',
      };

      const updatedISBNs = [...filteredISBNs, updatedBorrowISBN];

      await updateDoc(bookRef, {
        isbns: updatedISBNs,
        // available: increment(1), // Do not increment available since it is lost
      });

      const newBorrows = borrows.filter(
        (el) => el.objectID !== borrowData?.objectID
      );
      setBorrows(newBorrows);

      setIsConfirming(false);
      setSelectedBorrow('');
      nProgress.done();
      setIsModalOpen(false);
      toast.success('Book marked as lost');
    } catch (error) {
      console.log(error);
      nProgress.done();
      setIsConfirming(false);
      toast.error('Something went wrong! Please try again.');
    }
  };

  const handleBack = () => {
    setSelectedBorrow('');
    setIsModalOpen(false);
    setTimeout(() => {
      setIsEditingPenalty(false);
      setPenalty(borrowData?.penalty || 0);
    }, 200);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={handleBack}
      contentLabel='Picked up Modal'
      style={modalCustomStyle}
      closeTimeoutMS={200}
    >
      <div className='space-y-3'>
        <button type='button' onClick={handleBack}>
          <BsArrowLeft className='h-8 w-8 text-primary' />
        </button>
        <div className='text-2xl font-semibold text-center text-red-600'>
          Are you sure the book has been lost?
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
          <div className='flex items-center'>
            <p>
              Penalty:{' '}
              <span
                className={`${
                  penalty > 0 ? 'text-orange-600' : 'text-green-600'
                }`}
              >
                ₱{!isEditingPenalty && penalty}
              </span>
              {isEditingPenalty && (
                <input
                  className='w-[70px] outline-none border border-neutral-400'
                  type='number'
                  min={0}
                  value={penalty}
                  onChange={(e) => {
                    setPenalty(Number(e.target.value));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingPenalty(false);
                    }
                  }}
                />
              )}
            </p>
            {!isEditingPenalty && (
              <button
                type='button'
                className='ml-2 text-xs flex items-center space-x-1'
                onClick={() => setIsEditingPenalty(true)}
              >
                <AiFillEdit className='text-xl' />
                <p>Edit penalty</p>
              </button>
            )}

            {isEditingPenalty && (
              <button
                type='button'
                className='ml-4 text-lg flex items-center text-green-600 '
                onClick={() => setIsEditingPenalty(false)}
              >
                <FaCheck />
              </button>
            )}
          </div>
        </div>
        <div className='flex justify-end'>
          <button
            disabled={isConfirming}
            type='button'
            className={`text-white rounded-lg px-3 py-2 ${
              isConfirming
                ? 'cursor-not-allowed bg-neutral-500'
                : 'bg-red-600'
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

export default LostModal;
