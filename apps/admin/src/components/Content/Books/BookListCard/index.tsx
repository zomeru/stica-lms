import React from 'react';
import Image from 'next/image';

interface BookListCardProps {
  title: string;
  imageUrl: string;
  accessionNumber: string;
  author: string;
  genre: string;
  quantity: number;
  available: number;
  onEdit: () => void;
}

const BookListCard = ({
  title,
  imageUrl,
  accessionNumber,
  author,
  genre,
  quantity,
  available,
  onEdit,
}: BookListCardProps) => {
  return (
    <tr>
      <td className='border-b border-gray-200 w-[70px] bg-white px-5 py-5 text-sm'>
        <div className='relative w-[60px] h-[70px] rounded-md overflow-hidden'>
          <Image layout='fill' src={imageUrl} quality={5} priority />
        </div>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>
          {accessionNumber}
        </p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-600'>{title}</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-600'>{author}</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>{genre}</p>
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
            onClick={onEdit}
            type='button'
            className='text-blue-600 font-medium'
          >
            Edit
          </button>
          <button type='button' className='text-red-600 font-medium'>
            Delete
          </button>
        </div>
        {/* <p className='whitespace-no-wrap text-gray-900'>asd</p> */}
      </td>
    </tr>
  );
};

export default BookListCard;
