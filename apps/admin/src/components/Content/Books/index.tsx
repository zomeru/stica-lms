import React, { useEffect, useState, useMemo } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';

import { db } from '@lms/db';
import { IBookDoc } from '@lms/types';
import { useCol } from '@src/services';
import { SORT_ITEMS } from '@src/constants';

import AddBook from './AddBook';
import BookDetails from './BookDetails';
import BookList from './BookList';

export type OrderType = 'asc' | 'desc';

const Books = () => {
  const [addBook, setAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  const [books, setBooks] = useState<IBookDoc[]>([]);

  const [bookData, bookLoading, bookError] = useCol<IBookDoc>(
    query(collection(db, 'books'), orderBy(sortBy, sortOrder))
  );

  useEffect(() => {
    const orderIndex = SORT_ITEMS.findIndex(
      (el) => el.sort.field === sortBy
    );
    setSortOrder(SORT_ITEMS[orderIndex].order[0].value as OrderType);
  }, [sortBy]);

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
        setSortBy={setSortBy}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Book details */}
      <BookDetails
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        bookDetails={selectedBookData!}
        books={books}
        setBooks={setBooks}
      />

      {/* Add book section */}
      <AddBook
        addBook={addBook}
        setAddBook={setAddBook}
        books={books}
        setBooks={setBooks}
      />
    </div>
  );
};

export default Books;
