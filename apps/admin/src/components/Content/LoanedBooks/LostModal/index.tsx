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
  increment,
  collection,
  addDoc,
} from 'firebase/firestore';

import { AlgoBorrowDoc, IBookDoc, Identifier } from '@lms/types';
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
  const [penalty, setPenalty] = useState(0);
  const [hasBeenReplaced, setHasBeenReplaced] = useState(false);
  const [newISBN, setNewISBN] = useState('');
  const [newAccessionNo, setNewAccessionNo] = useState('');

  const handleConfirmLostBook = async () => {
    if (hasBeenReplaced) {
      if (!newISBN) {
        toast.error("Please enter the replacement book's ISBN");
        return;
      }
    }

    setIsEditingPenalty(false);

    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIsConfirming(true);

      const borrowRef = doc(db, 'borrows', borrowData?.objectID || '');

      const timestamp = serverTimestamp();

      await updateDoc(borrowRef, {
        penalty: penalty > 0 ? penalty : borrowData?.penalty,
        status: 'Lost',
        updatedAt: timestamp,
        // returnedDate: timestamp,
        replaceStatus: hasBeenReplaced ? 'Replaced' : 'Pending',
      });

      const bookRef = doc(db, 'books', borrowData?.bookId || '');
      const bookSnap = await getDoc(bookRef);
      const bookData = {
        ...bookSnap.data(),
        id: bookSnap.id,
      } as IBookDoc;

      const filteredIdentifiers = [...bookData.identifiers].filter(
        (el) => {
          const notSameIsbn = el.isbn !== borrowData?.identifiers.isbn;
          const notSameAccession =
            el.accessionNumber !== borrowData?.identifiers.accessionNumber;

          return notSameIsbn && notSameAccession;
        }
      );

      const updatedBorrowIdentifiers: Identifier = {
        accessionNumber: borrowData?.identifiers.accessionNumber!,
        status: 'Lost',
        isbn: borrowData?.identifiers.isbn!,
      };

      const updatedIdentifiers = [
        ...filteredIdentifiers,
        updatedBorrowIdentifiers,
      ];

      if (hasBeenReplaced) {
        const newIdentifiers: Identifier = {
          isbn: newISBN,
          accessionNumber: newAccessionNo,
          status: 'Available',
        };

        updatedIdentifiers.push(newIdentifiers);
      }

      await updateDoc(bookRef, {
        identifiers: updatedIdentifiers,
        available: increment(hasBeenReplaced ? 1 : 0),
      });

      const userRef = doc(db, 'users', borrowData?.userId || '');
      await updateDoc(userRef, {
        totalLostBooks: increment(1),
      });

      const notifCol = collection(db, 'notifications');
      const notifPayload: any = {
        createdAt: timestamp,
        clicked: false,
        userId: borrowData?.userId,
        borrowId: borrowData?.objectID,
        bookTitle: borrowData?.title,
        type: 'Lost',
        message: `The ${borrowData?.title} you have borrowed was marked as Lost.`,
      };

      await addDoc(notifCol, notifPayload);

      if (hasBeenReplaced) {
        await addDoc(notifCol, {
          ...notifPayload,
          type: 'Replace',
          message: `You have successfully replaced ${borrowData?.title} that you have lost with a new one.`,
          createdAt: serverTimestamp(),
        });
      }

      const newBorrows = borrows.filter(
        (el) => el.objectID !== borrowData?.objectID
      );
      setBorrows(newBorrows);

      setIsConfirming(false);
      setSelectedBorrow('');

      nProgress.done();
      setIsModalOpen(false);
      toast.success('Book marked as "Lost"');
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
      setHasBeenReplaced(false);
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
          <BsArrowLeft className='text-primary h-8 w-8' />
        </button>
        <div className='text-center text-2xl font-semibold text-red-600'>
          Are you sure the book has been lost?
        </div>
        <div className='max-w-fit space-y-1 text-lg text-neutral-700'>
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
          <div className='flex items-center'>
            <p>
              Penalty:{' '}
              <span
                className={`${
                  (borrowData && borrowData.penalty > 0) || penalty > 0
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              >
                ₱
                {!isEditingPenalty &&
                  (penalty > 0 ? penalty : borrowData?.penalty)}
              </span>
              {isEditingPenalty && (
                <input
                  className='w-[70px] border border-neutral-400 outline-none'
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
                className='ml-2 flex items-center space-x-1 text-xs'
                onClick={() => setIsEditingPenalty(true)}
              >
                <AiFillEdit className='text-xl' />
                <p>Edit penalty</p>
              </button>
            )}

            {isEditingPenalty && (
              <button
                type='button'
                className='ml-4 flex items-center text-lg text-green-600 '
                onClick={() => setIsEditingPenalty(false)}
              >
                <FaCheck />
              </button>
            )}
          </div>
          <div className='space-y-1'>
            <div className='flex items-center'>
              <p>Has the book been replaced? </p>
              <div className='ml-1 flex items-center space-x-1'>
                <button
                  type='button'
                  className='flex items-center space-x-1 rounded-md border border-neutral-400 px-3 py-[3px] text-sm'
                  onClick={() => setHasBeenReplaced(false)}
                >
                  <div
                    className={`h-[14px] w-[14px] rounded-full  ${
                      !hasBeenReplaced
                        ? 'bg-primary'
                        : 'border-primary border'
                    }`}
                  />
                  <p>No</p>
                </button>
                <button
                  type='button'
                  className='flex items-center space-x-1 rounded-md border border-neutral-400 px-3 py-[3px] text-sm'
                  onClick={() => setHasBeenReplaced(true)}
                >
                  <div
                    className={`h-[14px] w-[14px] rounded-full  ${
                      hasBeenReplaced
                        ? 'bg-primary'
                        : 'border-primary border'
                    }`}
                  />
                  <p>Yes</p>
                </button>
              </div>
            </div>
            <p className='text-xs text-orange-500'>
              If no, the replacement status will be set to
              &quot;Pending&quot;
            </p>
          </div>
          {hasBeenReplaced && (
            <>
              <div className='flex w-full flex-col space-x-2 text-sm lg:flex-row lg:items-center lg:text-base'>
                <p className='mb-2 flex-none font-normal lg:mb-0'>ISBN:</p>
                <input
                  placeholder='Enter the ISBN of the book'
                  className='focus:border-primary h-[40px] w-full max-w-[400px] rounded border border-neutral-300 px-[10px] outline-none'
                  value={newISBN}
                  onChange={(e) => setNewISBN(e.target.value)}
                />
              </div>
              <div className='flex w-full flex-col space-x-2 text-sm lg:flex-row lg:items-center lg:text-base'>
                <p className='mb-2 flex-none font-normal lg:mb-0'>
                  Accession no.:
                </p>
                <input
                  placeholder='Enter the accession number of the new book'
                  className='focus:border-primary h-[40px] w-full max-w-[400px] rounded border border-neutral-300 px-[10px] outline-none'
                  value={newAccessionNo}
                  onChange={(e) => setNewAccessionNo(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <div className='flex justify-end'>
          <button
            disabled={isConfirming}
            type='button'
            className={`rounded-lg px-3 py-2 text-white ${
              isConfirming
                ? 'cursor-not-allowed bg-neutral-500'
                : 'bg-red-600'
            }`}
            onClick={handleConfirmLostBook}
          >
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LostModal;
