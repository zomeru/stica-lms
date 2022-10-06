import React from 'react';
import BookListCard from '../BookListCard';

interface BookListProps {
  selectedBook: string;
  addBook: boolean;
  setAddBook: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBook: React.Dispatch<React.SetStateAction<string>>;
}

const BookList = ({
  selectedBook,
  addBook,
  setAddBook,
  setSelectedBook,
}: BookListProps) => {
  const books = new Array(20).fill(0).map((_, i) => `book-${i + 1}`);

  return (
    <div
      className={`w-full h-full duration-300 transition-all space-y-4 ${
        selectedBook ? '-translate-x-[100%]' : 'translate-x-0'
      } ${addBook ? 'translate-y-[100%]' : 'translate-y-0'}`}
    >
      <div className='flex justify-between'>
        <div className='text-3xl font-semibold text-primary'>Books</div>
        <button
          type='button'
          className='px-3 text-sm font-medium text-white bg-primary rounded-md'
          onClick={() => setAddBook(true)}
        >
          + Add Book
        </button>
      </div>
      <div className='overflow-y-scroll w-full h-full custom-scrollbar'>
        <table className='min-w-full leading-normal overflow-y-scroll'>
          <thead>
            <tr>
              <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                Image
              </th>
              <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                Accession No
              </th>
              <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                Title
              </th>
              <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                Genre
              </th>
              <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                Quantity
              </th>
              <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700'>
                Available
              </th>
              {
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                <th className='border-b-2 border-gray-200 bg-gray-100 px-5 py-3' />
              }
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              return (
                <BookListCard
                  onEdit={() => setSelectedBook(book)}
                  key={book}
                  title={book}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookList;
