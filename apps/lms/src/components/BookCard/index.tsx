import React from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { collection, query, where } from 'firebase/firestore';
import { useIsAuthenticated } from '@azure/msal-react';

import { AlgoBookDoc, IBorrowDoc, ILikedBookDoc } from '@lms/types';
import { db } from '@lms/db';
import { useUser } from '@src/contexts';
import {
  addToLikedBooks,
  borrowBook,
  removeFromLikedBooks,
  useCol,
} from '@src/services';
import { navigateToBook } from '@src/utils';

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
  const isAuthenticated = useIsAuthenticated();
  const { user } = useUser();

  const [tempRequestStatus] = React.useState(['Pending', 'Approved']);

  const [userBorrows] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      where('status', 'in', ['Pending', 'Approved', 'Issued'])
    )
  );

  const [myLikes] = useCol<ILikedBookDoc>(
    query(collection(db, `users/${user?.id || ''}/my-likes`))
  );

  return (
    <div className='relative w-[300px] h-[180px] flex rounded-2xl overflow-hidden before:content-[""] before:absolute before:border before:border-cGray-200 before:w-full before:h-[calc(100%)] before:rounded-2xl before:z-[-1]'>
      <ReactTooltip id={objectID} />
      <div
        data-tip={title}
        data-for={objectID}
        className='w-[40%] h-full relative overflow-hidden'
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
      <div className='w-[60%] h-full px-[5px] py-[8px] flex flex-col justify-between'>
        <div className='space-y-0'>
          {/* <h1 className='text-ellipsis overflow-hidden text-blackText truncate'>
            {title}
          </h1> */}
          <h1
            data-tip={title}
            data-for={objectID}
            className='line-clamp-2 overflow-hidden text-blackText'
          >
            {title}
          </h1>
          <h2 className='text-sm mb-[5px] text-cGray-300'>{author}</h2>
          <p className='text-sm mb-[5px] text-cGray-300'>Genre: {genre}</p>
        </div>
        <div>
          <div className='text-xs text-cGray-300'>
            Available: {available}
          </div>
          <div className='text-xs text-cGray-300'>Views: {views}</div>
        </div>

        <div className='flex justify-evenly items-center'>
          <button
            type='button'
            className='bg-cGray-200 px-2 py-1 rounded-md text-xs text-blackText hover:bg-neutral-400 duration-200 transition-all'
            onClick={() => navigateToBook(objectID)}
          >
            Details
          </button>
          <button
            disabled={userBorrows?.some((el) => el.bookId === objectID)}
            onClick={() =>
              borrowBook(book, isAuthenticated, user?.id || '')
            }
            type='button'
            className={` px-2 py-1 rounded-md text-white text-xs duration-200 transition-all ${
              userBorrows?.some((el) => el.bookId === objectID)
                ? 'bg-neutral-500 cursor-not-allowed'
                : 'bg-primary hover:bg-[#004c95] '
            } `}
          >
            {userBorrows?.some(
              (el) =>
                tempRequestStatus.includes(el.status) &&
                el.bookId === objectID
            )
              ? 'Requested'
              : userBorrows?.some(
                  (el) => el.status === 'Issued' && el.bookId === objectID
                )
              ? 'Borrowed'
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
                    isAuthenticated,
                    user?.id || ''
                  );
              } else {
                addToLikedBooks(book, isAuthenticated, user?.id || '');
              }
            }}
          >
            {myLikes && myLikes.some((el) => el.bookId === objectID) ? (
              <AiFillHeart className='w-[20px] h-[20px] text-primary' />
            ) : (
              <AiOutlineHeart className='w-[20px] h-[20px] text-blackText' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
