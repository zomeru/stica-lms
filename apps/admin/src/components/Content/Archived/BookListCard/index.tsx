import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { AlgoBookDoc } from '@lms/types';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
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

  const handleUnarchive = async () => {
    const bookRef = doc(db, 'books', objectID);
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    setLoading(true);

    try {
      await updateDoc(bookRef, {
        isArchive: false,
        updatedAt: serverTimestamp(),
      });
      const filteredBooks = books.filter(
        (buk) => buk.objectID !== objectID
      );
      setAlgoBooks(filteredBooks);
      toast.success(
        'The book was successfully remove from archived books'
      );
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
            type='button'
            disabled={loading}
            className='font-medium text-orange-600'
            onClick={handleUnarchive}
          >
            Unarchive
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BookListCard;
