import React, { useEffect, useState, useMemo } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';

import { db } from '@lms/db';
import { IBookDoc } from '@lms/types';
import { useCol } from '@src/services';
import AddBook from './AddBook';
import BookDetails from './BookDetails';

import BookList from './BookList';

const Books = () => {
  const [addBook, setAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');

  const [books, setBooks] = useState<IBookDoc[]>([]);

  const [bookData, bookLoading, bookError] = useCol<IBookDoc>(
    query(collection(db, 'books'), orderBy('updatedAt', 'desc'))
  );

  const selectedBookData = useMemo(() => {
    return books.find((book) => book.id === selectedBook);
  }, [books, selectedBook]);

  useEffect(() => {
    if (!bookLoading && bookData) {
      setBooks(bookData);
      
    }
  }, [bookLoading]);

  return (
    <div className='w-full h-full relative overflow-hidden'>
      {/* Book list */}
      <BookList
        books={books}
        bookLoading={bookLoading}
        bookError={bookError}
        selectedBook={selectedBook}
        addBook={addBook}
        setAddBook={setAddBook}
        setSelectedBook={setSelectedBook}
      />

      {/* Book details */}
      <BookDetails
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        bookDetails={selectedBookData!}
      />

      {/* Add book section */}
      <AddBook addBook={addBook} setAddBook={setAddBook} />
    </div>
  );
};

export default Books;
