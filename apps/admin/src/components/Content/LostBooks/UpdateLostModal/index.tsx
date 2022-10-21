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
} from 'firebase/firestore';

import { AlgoBorrowDoc, IBookDoc, ISBNType } from '@lms/types';
import { db } from '@lms/db';
import toast from 'react-hot-toast';

interface UpdateLostModalProps {
  isModalOpen: boolean;
  lostBooks: AlgoBorrowDoc[];
  setLostBooks: React.Dispatch<React.SetStateAction<AlgoBorrowDoc[]>>;
  setSelectedLostBook: React.Dispatch<React.SetStateAction<string>>;
  lostBookData: AlgoBorrowDoc | undefined;
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

const UpdateLostModal = ({
  isModalOpen,
  setSelectedLostBook,
  lostBookData,
  lostBooks,
  setLostBooks,
}: UpdateLostModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEditingPenalty, setIsEditingPenalty] = useState(false);
  const [penalty, setPenalty] = useState(lostBookData?.penalty || 0);
  const [newISBN, setNewISBN] = useState('');

  const handleConfirmBookPickup = async () => {
    if (!newISBN.trim()) {
      toast.error("Please enter the replacement book's ISBN");
      return;
    }

    if (newISBN.trim() === lostBookData?.isbn) {
      toast.error(
        "The replacement book's ISBN cannot be the same as the lost book's ISBN"
      );
      return;
    }

    setIsEditingPenalty(false);

    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIsConfirming(true);

      const borrowRef = doc(db, 'borrows', lostBookData?.objectID || '');

      const timestamp = serverTimestamp();

      await updateDoc(borrowRef, {
        penalty,
        status: 'Lost',
        updatedAt: timestamp,
        // returnedDate: timestamp,
        replaceStatus: 'Replaced',
      });

      const bookRef = doc(db, 'books', lostBookData?.bookId || '');
      const bookSnap = await getDoc(bookRef);
      const bookData = {
        ...bookSnap.data(),
        id: bookSnap.id,
      } as IBookDoc;

      const filteredISBNs = [...bookData.isbns].filter(
        (el) => el.isbn !== lostBookData?.isbn
      );

      const newISBNType: ISBNType = {
        isbn: newISBN,
        status: 'Available',
      };

      const updatedISBNs = [...filteredISBNs, newISBNType];

      await updateDoc(bookRef, {
        isbns: updatedISBNs,
        available: increment(1),
      });

      const newLostBooks = lostBooks.filter(
        (el) => el.objectID !== lostBookData?.objectID
      );

      const updatedLostBook = {
        ...lostBookData,
        penalty,
        // status: 'Lost',
        replaceStatus: 'Replaced',
        updatedAt: new Date().getTime(),
      } as AlgoBorrowDoc;

      setLostBooks([...newLostBooks, updatedLostBook]);

      setIsConfirming(false);
      setSelectedLostBook('');
      setNewISBN('');
      nProgress.done();
      toast.success('Book marked as lost');
    } catch (error) {
      console.log(error);
      nProgress.done();
      setIsConfirming(false);
      toast.error('Something went wrong! Please try again.');
    }
  };

  const handleBack = () => {
    setSelectedLostBook('');
    setTimeout(() => {
      setIsEditingPenalty(false);
      setPenalty(lostBookData?.penalty || 0);
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
        <div className='text-2xl font-semibold text-center text-primary'>
          Are you sure the book has been replaced?
        </div>
        <div className='max-w-fit text-neutral-700 text-lg space-y-1'>
          <div className='text-neutral-900'>
            Student name:{' '}
            <span className='text-sky-600'>
              {lostBookData?.studentName}
            </span>
          </div>
          <ReactTooltip id={lostBookData?.objectID} />
          <div
            className='line-clamp-2'
            data-for={lostBookData?.objectID}
            data-tip={lostBookData?.title}
          >
            Title:{' '}
            <span className='text-sky-600'>{lostBookData?.title}</span>
          </div>
          <div>
            Author:{' '}
            <span className='text-sky-600'>{lostBookData?.author}</span>
          </div>
          <div>
            Genre:{' '}
            <span className='text-sky-600'>{lostBookData?.genre}</span>
          </div>
          <div>
            Lost ISBN:{' '}
            <span className='text-sky-600'>{lostBookData?.isbn}</span>
          </div>
          <div>
            Accession No.:{' '}
            <span className='text-sky-600'>
              {lostBookData?.accessionNumber}
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

          <div className='flex flex-col w-full text-sm lg:items-center lg:flex-row lg:text-base space-x-2'>
            <p className='mb-2 font-normal lg:mb-0 flex-none'>ISBN:</p>
            <input
              placeholder='Enter the ISBN of the book'
              className="focus:border-primary max-w-[400px] w-full outline-none border h-[40px] px-[10px] rounded border-neutral-300"
              value={newISBN}
              onChange={(e) => setNewISBN(e.target.value)}
            />
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

export default UpdateLostModal;
