import React, { useState } from 'react';
import AddBook from './AddBook';
import BookDetails from './BookDetails';

import BookList from './BookList';

const Books = () => {
  const [addBook, setAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');

  return (
    <div className='w-full h-full relative overflow-hidden'>
      {/* Book list */}
      <BookList
        {...{ selectedBook, addBook, setAddBook, setSelectedBook }}
      />

      {/* Book details */}
      <BookDetails
        {...{
          selectedBook,
          setSelectedBook,
        }}
      />

      {/* Add book section */}
      <AddBook
        {...{
          addBook,
          setAddBook,
        }}
      />
    </div>
  );
};

export default Books;
