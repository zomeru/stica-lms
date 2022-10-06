import React from 'react';
import Image from 'next/image';

const IMAGE_URL = 'https://i.imgur.com/01syuMU.jpg';

interface BookListCardProps {
  title: string;
  onEdit: () => void;
}

const BookListCard = ({ title, onEdit }: BookListCardProps) => {
  return (
    <tr>
      <td className='border-b border-gray-200 w-[70px] bg-white px-5 py-5 text-sm'>
        <div className='relative w-[60px] h-[70px]'>
          <Image layout='fill' src={IMAGE_URL} />
        </div>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>
          PR 8923 W6 L36 1990
        </p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-600 max-w-[200px] '>
          The Great Gatsby {title}
        </p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>
          Action and Adventure
        </p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>10</p>
      </td>
      <td className='border-b border-gray-200 bg-white px-5 py-5 text-sm'>
        <p className='whitespace-no-wrap text-gray-900'>4</p>
      </td>
      <td className='border-b space-x-4  border-gray-200 bg-white px-5 py-5 text-sm'>
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
        {/* <p className='whitespace-no-wrap text-gray-900'>asd</p> */}
      </td>
    </tr>
  );
};

export default BookListCard;
