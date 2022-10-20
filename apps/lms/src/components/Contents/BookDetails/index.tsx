import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  doc,
  increment,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { BsArrowLeft } from 'react-icons/bs';
import Image from 'next/image';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import ReactTooltip from 'react-tooltip';

import { db } from '@lms/db';
import {
  addToLikedBooks,
  borrowBook,
  cancelBorrowRequest,
  removeFromLikedBooks,
  useCol,
  useDoc,
} from '@src/services';
import {
  AlgoBookDoc,
  IBookDoc,
  IBorrowDoc,
  ILikedBookDoc,
} from '@lms/types';
import { useAuth } from '@src/contexts';

import { formatDate } from '@src/utils';
import { useNextQuery } from '@lms/ui';

const BookDetails = () => {
  const { user } = useAuth();
  const router = useRouter();
  const bookId = useNextQuery('bookId');

  const headerRef = useRef<HTMLDivElement>(null);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [viewAdded, setViewAdded] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const [bookData] = useDoc<IBookDoc>(doc(db, 'books', bookId || ''));
  const [userBorrow] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', ['Pending', 'Issued']),
      where('bookId', '==', bookId || '')
    )
  );
  const [myLikes] = useCol<ILikedBookDoc>(
    query(collection(db, `users/${user?.id || 'default'}/my-likes`))
  );

  useEffect(() => {
    const incrementViews = async () => {
      try {
        if (bookId) {
          const bookRef = doc(db, 'books', bookId as string);
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
  }, [bookId]);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, [headerHeight, headerRef]);

  const book = useMemo(
    () =>
      ({
        objectID: bookId,
        ...bookData,
      } as AlgoBookDoc),
    [bookData, bookId]
  );

  return (
    <section className='w-full h-full flex-col justify-center items-center space-y-[20px]'>
      <div className='flex space-x-3 items-center' ref={headerRef}>
        <button type='button' onClick={() => router.back()}>
          <BsArrowLeft className='h-8 w-8 text-primary' />
        </button>
        <div className='text-3xl font-semibold text-primary'>
          Book details
        </div>
      </div>
      <div
        style={{
          height: `calc(100% - (${headerHeight}px + 20px))`,
        }}
        className='flex'
      >
        <div className='relative h-full w-[260px] 2xl:w-[450px] rounded-2xl overflow-hidden mr-[40px]'>
          <Image
            src={bookData?.imageCover.url!}
            layout='fill'
            objectFit='cover'
            quality={35}
            blurDataURL={bookData?.imageCover.url!}
            placeholder='blur'
            objectPosition='center'
          />
        </div>
        <div className='w-[calc(100%-300px)] 2xl:w-[calc(100%-450px)] flex flex-col justify-between'>
          <div>
            <h1 className='text-primary text-2xl font-medium'>
              {bookData?.title}
            </h1>
            <p className='text-neutral-600 text-lg'>
              Author:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.author}
              </span>
            </p>
            <p className='text-neutral-600 text-lg'>
              Publisher:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.publisher}
              </span>
            </p>
            <p className='text-neutral-600 text-lg'>
              Genre:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.genre}
              </span>
            </p>
            <p className='text-neutral-600 text-lg'>
              Accession number:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.accessionNumber}
              </span>
            </p>
          </div>
          <div>
            <p className='text-neutral-600 text-lg'>
              Quantity:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.quantity}
              </span>
            </p>
            <p className='text-neutral-600 text-lg'>
              Available:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.available}
              </span>
            </p>
            <p className='text-neutral-600 text-lg'>
              Views:{' '}
              <span className='ml-2 text-neutral-900'>
                {bookData?.views}
              </span>
            </p>
          </div>
          <div className=''>
            <div className='flex items-center space-x-3'>
              <button
                disabled={
                  (userBorrow &&
                    userBorrow?.some((el) => el.bookId === bookId)) ||
                  isBorrowing
                }
                className={`text-white px-[20px] py-[8px] rounded-md ${
                  (userBorrow &&
                    userBorrow?.some((el) => el.bookId === bookId)) ||
                  isBorrowing
                    ? 'cursor-not-allowed bg-neutral-500'
                    : 'bg-primary'
                }`}
                type='button'
                onClick={() => {
                  borrowBook(book, user, setIsBorrowing);
                }}
              >
                {userBorrow?.some(
                  (el) => el.status === 'Pending' && el.bookId === bookId
                )
                  ? 'Pending'
                  : userBorrow?.some(
                      (el) =>
                        el.status === 'Issued' && el.bookId === bookId
                    )
                  ? 'Issued'
                  : 'Borrow'}
              </button>
              {userBorrow &&
                userBorrow?.some(
                  (el) =>
                    el.status === 'Pending' && el.bookId === bookData?.id
                ) && (
                  <button
                    type='button'
                    className='px-[18px] py-[6px] rounded-md border-2 text-orange-700 border-orange-700'
                    onClick={() => cancelBorrowRequest(userBorrow[0]?.id)}
                  >
                    Cancel
                  </button>
                )}
              <button
                type='button'
                onClick={() => {
                  if (
                    myLikes &&
                    myLikes.some((el) => el.bookId === bookId)
                  ) {
                    const likedBook = myLikes.find(
                      (el) => el.bookId === bookId
                    );

                    if (likedBook)
                      removeFromLikedBooks(
                        likedBook.id,
                        !!user,
                        user?.id || ''
                      );
                  } else if (bookId) {
                    addToLikedBooks(book, !!user, user?.id || '');
                  }
                }}
              >
                {myLikes && myLikes.some((el) => el.bookId === bookId) ? (
                  <AiFillHeart className='w-[40px] h-[40px] text-primary' />
                ) : (
                  <AiOutlineHeart className='w-[40px] h-[40px] text-blackText' />
                )}
              </button>
            </div>
            {userBorrow?.some(
              (el) => el.status === 'Pending' && el.bookId === bookId
            ) && (
              <>
                <ReactTooltip id={bookId} />
                <p
                  data-for={bookId}
                  data-tip='Library is open from Monday to Friday, 9:00 AM to 5:00 PM. Holidays are excluded.'
                  className='text-orange-600 flex mt-2 text-sm'
                >
                  Please pick up the book from the library before{' '}
                  {formatDate(userBorrow[0].pickUpDueDate.toDate(), true)}{' '}
                  or it will automatically be cancelled.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookDetails;
