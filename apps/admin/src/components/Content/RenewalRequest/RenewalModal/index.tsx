import { useState } from 'react';
import {
  deleteField,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { BsArrowLeft } from 'react-icons/bs';
import Modal from 'react-modal';
import nProgress from 'nprogress';
import ReactTooltip from 'react-tooltip';

import { AlgoBorrowDoc } from '@lms/types';
import { db } from '@lms/db';
import { processHoliday } from '@src/utils/processHoliday';

interface RenewalProps {
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

const Renewal = ({
  isModalOpen,
  setSelectedBorrow,
  borrowData,
  borrows,
  setBorrows,
}: RenewalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmRenewalRequest = async () => {
    if (!borrowData) return;

    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIsConfirming(true);

      const borrowRef = doc(db, 'borrows', borrowData.objectID);
      const borrowSnap = await getDoc(borrowRef);

      // check if issued book has a penalty
      if (borrowSnap.exists() && borrowSnap.data()?.penalty > 0) {
        toast.error('This issued book already has a penalty.');
        await updateDoc(borrowRef, {
          renewRequest: deleteField(),
        });
        nProgress.done();
        setIsConfirming(false);
        return;
      }

      const finalDueDateTimestamp = await processHoliday(borrowData);
      const currentTimestamp = serverTimestamp();

      await updateDoc(borrowRef, {
        dueDate: finalDueDateTimestamp,
        renewRequest: deleteField(),
        renewRequestDate: deleteField(),
        updatedAt: currentTimestamp,
      });

      const userRef = doc(db, 'users', borrowData.userId);
      await updateDoc(userRef, {
        totalRenewedBooks: increment(1),
      });

      const newRenewalRequest = borrows.filter(
        (borrow) => borrow.objectID !== borrowData.objectID
      );
      setBorrows(newRenewalRequest);
      toast.success('Renewal request has been approved.');
      setIsConfirming(false);
      setSelectedBorrow('');
      nProgress.done();
    } catch (error) {
      console.log('Error approving renewal request', error);
      toast.error('Something went wrong! Please try again later.');
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
          Approve renewal request for this book?
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
            className={`rounded-lg px-3 py-2 text-white ${
              isConfirming
                ? 'cursor-not-allowed bg-neutral-500'
                : 'bg-primary'
            }`}
            onClick={handleConfirmRenewalRequest}
          >
            {isConfirming ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Renewal;
