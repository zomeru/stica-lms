import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, increment, updateDoc } from 'firebase/firestore';

import { db } from '@lms/db';
import { useNextQuery } from '@src/hooks';
import { useDoc } from '@src/services';
import { IBookDoc } from '@lms/types';

const BookDetails = () => {
  const router = useRouter();
  const bookId = useNextQuery('bookId');

  console.log('bookId', bookId);

  const [viewAdded, setViewAdded] = useState(false);

  const [bookData] = useDoc<IBookDoc>(doc(db, 'books', bookId || ''));

  console.log('bookData', bookData);

  useEffect(() => {
    const incrementViews = async () => {
      try {
        if (bookId) {
          const bookRef = doc(db, 'books', bookId as string);
          await updateDoc(bookRef, {
            views: increment(1),
          });
          console.log('bookAdded');
          setViewAdded(true);
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    if (!viewAdded) incrementViews();
  }, [bookId]);

  const handleGoBack = () => {
    const newQuery = { ...router.query };
    delete newQuery.bookId;

    router.push(
      {
        pathname: '/',
        query: newQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  // const handleBorrow = () => {}

  return (
    <section className='w-full h-full flex-col justify-center items-center'>
      <h1 className='text-3xl font-medium'>Book Details</h1>
      <button type='button' onClick={handleGoBack}>
        Go back
      </button>
    </section>
  );
};

export default BookDetails;
