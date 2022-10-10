import React from 'react';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useRouter } from 'next/router';

import { IBookDoc } from '@lms/types';

const BookCard = ({
  // id,
  objectID,
  title,
  author,
  genre,
  available,
  views,
  imageCover,
}: IBookDoc & { objectID: string }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleBookDetailClick = (bookId: string) => {
    router.push(
      {
        pathname: '/',
        query: {
          ...router.query,
          bookId,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className='relative w-[300px] h-[180px] flex rounded-2xl overflow-hidden before:content-[""] before:absolute before:border before:border-cGray-200 before:w-full before:h-[calc(100%-2px)] before:top-[1px] before:rounded-2xl before:z-[-1]'>
      <div
        data-tip={title}
        data-for={objectID}
        className='w-[40%] h-full relative'
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
          <h1 className='text-ellipsis overflow-hidden text-blackText'>
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

        <div className='flex justify-between items-center'>
          <button
            type='button'
            className='bg-cGray-200 px-2 py-1 rounded-md text-sm text-blackText hover:bg-neutral-400 duration-200 transition-all'
            onClick={() => handleBookDetailClick(objectID)}
          >
            Details
          </button>
          <button
            type='button'
            className='bg-cGray-200 px-2 py-1 rounded-md bg-primary text-white text-sm hover:bg-[#004c95] duration-200 transition-all'
          >
            Borrow
          </button>
          <button
            type='button'
            className='mr-[10px]'
            onClick={() => setIsFavorite((prev) => !prev)}
          >
            {isFavorite ? (
              <AiFillHeart className='w-[20px] h-[20px] text-primary' />
            ) : (
              <AiOutlineHeart className='w-[20px] h-[20px] text-blackText' />
            )}
          </button>
        </div>
      </div>
      <ReactTooltip id={objectID} />
    </div>
  );
};

export default BookCard;
