import { IBookDoc } from '@lms/types';
import React from 'react';

interface BookDetailsProps {
  bookDetails: IBookDoc;
  selectedBook: string;
  setSelectedBook: React.Dispatch<React.SetStateAction<string>>;
}

const BookDetails = ({
  selectedBook,
  setSelectedBook,
  bookDetails,
}: BookDetailsProps) => {
  return (
    <div
      className={`w-full h-full absolute top-0 duration-300 transition-all ${
        selectedBook ? 'translate-x-0' : 'translate-x-[100%]'
      }`}
    >
      {bookDetails && (
        <div>
          <div>book ID: {bookDetails.id}</div>
          <div>Accession No: {bookDetails.accessionNumber}</div>
          <div>Title: {bookDetails.title}</div>
          <div>Author: {bookDetails.author}</div>
          <div>Publisher: {bookDetails.publisher}</div>
          <div>Genre Type: {bookDetails.genreType}</div>
          <div>Genre: {bookDetails.genre}</div>
          <div>Quantity: {bookDetails.quantity}</div>
        </div>
      )}
      <button
        className='bg-primary text-white px-3 py-1 rounded-md'
        type='button'
        onClick={() => setSelectedBook('')}
      >
        Go back
      </button>
    </div>
  );
};

export default BookDetails;
