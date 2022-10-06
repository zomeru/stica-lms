import React from 'react';

interface BookDetailsProps {
  selectedBook: string;
  setSelectedBook: React.Dispatch<React.SetStateAction<string>>;
}

const BookDetails = ({
  selectedBook,
  setSelectedBook,
}: BookDetailsProps) => {
  return (
    <div
      className={`w-full h-full bg-red-400 absolute top-0 duration-300 transition-all ${
        selectedBook ? 'translate-x-0' : 'translate-x-[100%]'
      }`}
    >
      <div>Details</div>
      <button type='button' onClick={() => setSelectedBook('')}>
        Go back
      </button>
    </div>
  );
};

export default BookDetails;
