import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { AlgoBookDoc } from '@lms/types';
import {
  addDoc,
  collection,
  // deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@lms/db';
import toast from 'react-hot-toast';
import nProgress from 'nprogress';

interface BookListCardProps {
  book: AlgoBookDoc;
  // onEdit: () => void;
  books: AlgoBookDoc[];
  setAlgoBooks: React.Dispatch<React.SetStateAction<AlgoBookDoc[]>>;
}

const BookListCard = ({
  book,
  books,
  setAlgoBooks,
}: BookListCardProps) => {
  const {
    // id,
    objectID,
    title,
    author,
    genre,
    available,
    // views,
    quantity,
    imageCover,
    identifiers,
  } = book;

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    router.push(
      {
        pathname: '/',
        query: {
          ...router.query,
          bookId: objectID,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleDelete = async () => {
    const bookRef = doc(db, 'books', objectID);
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    setLoading(true);

    try {
      const borrowQuery = query(
        collection(db, 'borrows'),
        where('bookId', '==', objectID),
        where('status', '==', 'Issued')
      );
      const borrowSnapshot = await getDocs(borrowQuery);

      if (borrowSnapshot.size > 0) {
        toast.error('There is an issued book with this book');
        nProgress.done();
        setLoading(false);
        return;
      } else {
        await updateDoc(bookRef, {
          isArchive: true,
          updatedAt: serverTimestamp(),
        });
        // await deleteDoc(bookRef);
        const filteredBooks = books.filter(
          (buk) => buk.objectID !== objectID
        );
        setAlgoBooks(filteredBooks);
        const pendingBorrow = query(
          collection(db, 'borrows'),
          where('bookId', '==', objectID),
          where('status', '==', 'Pending')
        );

        const timestamp = serverTimestamp();

        const pendingSnapshot = await getDocs(pendingBorrow);

        if (pendingSnapshot.size > 0) {
          pendingSnapshot.forEach(async (pendingDoc) => {
            await updateDoc(pendingDoc.ref, {
              status: 'Cancelled',
              updatedAt: timestamp,
            });

            const borrowData = pendingDoc.data();

            await addDoc(collection(db, 'notifications'), {
              createdAt: timestamp,
              clicked: false,
              type: 'Cancelled',
              message: `Your borrow request on ${borrowData.title} was automatically cancelled because the book has been archived.`,
              borrowId: pendingDoc.id,
              userId: borrowData.userId,
              bookTitle: borrowData.title,
            });

            // const sendEmailData = await sendEmail({
            //   receiver: userData.email,
            //   subjectPurpose: 'Book Picked Up',
            //   message: `Hello ${userData.givenName} ${
            //     userData.surname
            //   }, you have picked up ${
            //     bookData.title
            //   }. Please return it on or before ${simpleFormatDate(
            //     dueDateEmail,
            //     undefined,
            //     true
            //   )} to avoid penalty. Thank you.`,
            //   messageTitle: 'Book Picked Up',
            // });
          });
        }
        toast.success('Book has been archived.');
      }
    } catch (e) {
      toast.error("Something wen't wrong.");
      console.log('error', e);
    } finally {
      nProgress.done();
      setLoading(false);
    }
  };

  return (
    <tr>
      <td className='w-[70px] border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <div className='relative h-[70px] w-[60px] overflow-hidden rounded-md'>
          <Image layout='fill' src={imageCover.url} quality={5} priority />
        </div>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <button
          data-for={objectID}
          data-tip={title}
          onClick={handleEdit}
          type='button'
        >
          <p className='line-clamp-2 text-primary text-left'>{title}</p>
        </button>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>{author}</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>{genre}</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>
          {identifiers.find(
            (identifier) => identifier.status === 'Available'
          )?.accessionNumber || 'No available'}
        </p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>{quantity}</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>{available}</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <div className='flex space-x-4'>
          <button
            onClick={handleEdit}
            type='button'
            className='font-medium text-blue-600'
          >
            Edit
          </button>
          <button
            type='button'
            disabled={loading}
            className='font-medium text-red-600'
            onClick={handleDelete}
          >
            Archive
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BookListCard;
