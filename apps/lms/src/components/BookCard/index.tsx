import React from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { collection, query, where } from 'firebase/firestore';

import { AlgoBookDoc, IBorrowDoc, ILikedBookDoc } from '@lms/types';
import { db } from '@lms/db';
import { useAuth } from '@src/contexts';
import { navigateToBook } from '@src/utils';
import {
  addToLikedBooks,
  borrowBook,
  removeFromLikedBooks,
  useCol,
} from '@lms/ui';

interface BookCardProps {
  book: AlgoBookDoc;
}

const BookCard = ({ book }: BookCardProps) => {
  const {
    // id,
    objectID,
    title,
    author,
    genre,
    available,
    views,
    imageCover,
  } = book;
  const { user } = useAuth();

  const [isBorrowing, setIsBorrowing] = React.useState(false);

  const [userBorrows] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', ['Pending', 'Issued'])
    )
  );

  const [myLikes] = useCol<ILikedBookDoc>(
    query(collection(db, `users/${user?.id || 'default'}/my-likes`))
  );

  return (
    <div className='before:border-cGray-200 relative flex h-[180px] w-[300px] overflow-hidden rounded-2xl before:absolute before:z-[-1] before:h-[calc(100%)] before:w-full before:rounded-2xl before:border before:content-[""]'>
      <ReactTooltip id={objectID} />
      <div
        data-tip={title}
        data-for={objectID}
        className='relative h-full w-[40%] overflow-hidden'
      >
        <Image
          src={imageCover.url}
          layout='fill'
          objectFit='cover'
          objectPosition='center'
          quality={10}
          blurDataURL={imageCover.url}
          placeholder='blur'
        />
      </div>
      <div className='flex h-full w-[60%] flex-col justify-between px-[5px] py-[8px]'>
        <div className='space-y-0'>
          {/* <h1 className='text-ellipsis overflow-hidden text-blackText truncate'>
            {title}
          </h1> */}
          <h1
            data-tip={title}
            data-for={objectID}
            className='line-clamp-2 text-blackText overflow-hidden'
          >
            {title}
          </h1>
          <h2 className='text-cGray-300 mb-[5px] text-sm'>{author}</h2>
          <p className='text-cGray-300 mb-[5px] text-sm'>Genre: {genre}</p>
        </div>
        <div>
          <div className='text-cGray-300 text-xs'>
            Available: {available}
          </div>
          <div className='text-cGray-300 text-xs'>Views: {views}</div>
        </div>

        <div className='flex items-center justify-evenly'>
          <button
            type='button'
            className='bg-cGray-200 text-blackText rounded-md px-2 py-1 text-xs transition-all duration-200 hover:bg-neutral-400'
            onClick={() => navigateToBook(objectID)}
          >
            Details
          </button>
          <button
            disabled={
              userBorrows?.some((el) => el.bookId === objectID) ||
              isBorrowing
            }
            onClick={() => {
              borrowBook(book, user, setIsBorrowing);
            }}
            type='button'
            className={` rounded-md px-2 py-1 text-xs text-white transition-all duration-200 ${
              userBorrows?.some((el) => el.bookId === objectID) ||
              isBorrowing
                ? 'cursor-not-allowed bg-neutral-500'
                : 'bg-primary hover:bg-[#004c95] '
            } `}
          >
            {userBorrows?.some(
              (el) => el.status === 'Pending' && el.bookId === objectID
            )
              ? 'Pending'
              : userBorrows?.some(
                  (el) => el.status === 'Issued' && el.bookId === objectID
                )
              ? 'Issued'
              : 'Borrow'}
          </button>
          <button
            type='button'
            className='mr-[10px]'
            onClick={() => {
              if (
                myLikes &&
                myLikes.some((el) => el.bookId === objectID)
              ) {
                const likedBook = myLikes.find(
                  (el) => el.bookId === objectID
                );

                if (likedBook)
                  removeFromLikedBooks(
                    likedBook.id,
                    !!user,
                    user?.id || ''
                  );
              } else {
                addToLikedBooks(book, !!user, user?.id || '');
              }
            }}
          >
            {myLikes && myLikes.some((el) => el.bookId === objectID) ? (
              <AiFillHeart className='text-primary h-[20px] w-[20px]' />
            ) : (
              <AiOutlineHeart className='text-blackText h-[20px] w-[20px]' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
