import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { AlgoBookDoc } from '@lms/types';

interface BookListCardProps {
  book: AlgoBookDoc;
  // onEdit: () => void;
}

const BookListCard = ({ book }: BookListCardProps) => {
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
    accessionNumber,
  } = book;

  const router = useRouter();

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

  return (
    <tr>
      <td className='border-b border-gray-200 w-[70px] bg-white px-5 py-5 text-sm'>
        <div className='relative w-[60px] h-[70px] rounded-md overflow-hidden'>
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
          {accessionNumber}
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
            className='text-blue-600 font-medium'
          >
            Edit
          </button>
          <button type='button' className='text-red-600 font-medium'>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BookListCard;
