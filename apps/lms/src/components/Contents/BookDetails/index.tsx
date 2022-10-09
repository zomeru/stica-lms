import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, increment, updateDoc } from 'firebase/firestore';

import { db } from '@lms/db';

const BookDetails = () => {
  const router = useRouter();

  console.log('router', router.query.bookId);
  const [viewAdded, setViewAdded] = useState(false);

  useEffect(() => {
    const incrementViews = async () => {
      try {
        if (router.query.bookId) {
          const bookRef = doc(db, 'books', router.query.bookId as string);
          await updateDoc(bookRef, {
            views: increment(1),
          });
          setViewAdded(true);
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    if (!viewAdded) incrementViews();
  }, [router.query.bookId]);

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
