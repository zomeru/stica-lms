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
  addDoc,
  collection,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

import { AlgoBorrowDoc, IBookDoc, Identifier } from '@lms/types';
import { db } from '@lms/db';
import { uniqueAcnCheck } from '@src/utils';

interface UpdateLostModalProps {
  isModalOpen: boolean;
  lostBooks: AlgoBorrowDoc[];
  setLostBooks: React.Dispatch<React.SetStateAction<AlgoBorrowDoc[]>>;
  setSelectedLostBook: React.Dispatch<React.SetStateAction<string>>;
  lostBookData: AlgoBorrowDoc | undefined;
  allBooks?: IBookDoc[];
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
  allBooks,
}: UpdateLostModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEditingPenalty, setIsEditingPenalty] = useState(false);
  const [penalty, setPenalty] = useState(lostBookData?.penalty || 0);
  const [newISBN, setNewISBN] = useState('');
  const [newAccessionNo, setNewAccessionNo] = useState('');

  const handleConfirmBookPickup = async () => {
    if (!newISBN.trim() || !newAccessionNo.trim()) {
      toast.error('Please enter the accession number and ISBN.');
      return;
    }

    // if (newISBN.trim() === lostBookData?.isbn) {
    //   toast.error(
    //     "The replacement book's ISBN cannot be the same as the lost book's ISBN"
    //   );
    //   return;
    // }

    if (!uniqueAcnCheck(allBooks || [], newAccessionNo)) {
      toast.error('Accession number already exists.');
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

      // const filteredIdentifiers = [...bookData.identifiers].filter(
      //   (el) => {
      //     const notSameIsbn = el.isbn !== lostBookData?.identifiers.isbn;
      //     const notSameAccession =
      //       el.accessionNumber !==
      //       lostBookData?.identifiers.accessionNumber;

      //     return notSameIsbn && notSameAccession;
      //   }
      // );

      const newBookIdentifiers: Identifier = {
        accessionNumber: newAccessionNo,
        status: 'Available',
        isbn: newISBN,
      };

      // const updatedIdentifiers = [
      //   ...filteredIdentifiers,
      //   updatedBorrowIdentifiers,
      // ];

      await updateDoc(bookRef, {
        identifiers: [...bookData.identifiers, newBookIdentifiers],
        available: increment(1),
      });

      await addDoc(collection(db, 'notifications'), {
        createdAt: timestamp,
        clicked: false,
        userId: lostBookData?.userId,
        borrowId: lostBookData?.objectID,
        bookTitle: lostBookData?.title,
        message: `You have successfully replaced ${lostBookData?.title} that you have lost with a new one.`,
        type: 'Replace',
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
      setNewAccessionNo('');
      nProgress.done();
      toast.success('Book has been replaced!');
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
          <BsArrowLeft className='text-primary h-8 w-8' />
        </button>
        <div className='text-primary text-center text-2xl font-semibold'>
          Are you sure the book has been replaced?
        </div>
        <div className='max-w-fit space-y-1 text-lg text-neutral-700'>
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
            <span className='text-sky-600'>
              {lostBookData?.identifiers.isbn}
            </span>
          </div>
          <div>
            Accession No.:{' '}
            <span className='text-sky-600'>
              {lostBookData?.identifiers.accessionNumber}
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
              Accession No.:
            </p>
            <input
              placeholder='Enter the accession number of the new book'
              className='focus:border-primary h-[40px] w-full max-w-[400px] rounded border border-neutral-300 px-[10px] outline-none'
              value={newAccessionNo}
              onChange={(e) => setNewAccessionNo(e.target.value)}
            />
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

export default UpdateLostModal;
