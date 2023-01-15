import React, { useEffect, useState, useMemo } from 'react';

import { AlgoBookDoc } from '@lms/types';
import { ITEMS_PER_PAGE, SORT_ITEMS } from '@src/constants';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import AddBook from './AddBook';
import BookDetails from './BookDetails';
import BookList from './BookList';

export type OrderType = 'asc' | 'desc';

const bookSearchQueryName = 'bookSearchKey';

const Books = () => {
  const bookSearchKey = useNextQuery(bookSearchQueryName);
  const bookId = useNextQuery('bookId');

  const [addBook, setAddBook] = useState(false);

  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoBooks, setAlgoBooks, _, bookLoading] =
    useAlgoData<AlgoBookDoc>('books', bookSearchQueryName, bookSearchKey);

  useEffect(() => {
    const orderIndex = SORT_ITEMS.findIndex(
      (el) => el.sort.field === sortBy
    );

    setSortBy(SORT_ITEMS[orderIndex].sort.field);
  }, [sortBy]);

  useEffect(() => {
    const orderIndex = SORT_ITEMS.findIndex(
      (el) => el.sort.field === sortBy
    );

    const newOrder =
      orderIndex > -1
        ? (SORT_ITEMS[orderIndex].order[0].value as OrderType)
        : 'desc';

    setSortOrder(newOrder);
  }, [sortBy]);

  const [currentBooks, currentPage, onNext, onPrev] = useClientPagination(
    algoBooks,
    ITEMS_PER_PAGE,
    {
      sortBy,
      sortOrder,
    }
  );

  const selectedBookData = useMemo(() => {
    return algoBooks.find((book) => book.objectID === bookId);
  }, [algoBooks, bookId]);

  return (
    <div className='relative h-full w-full overflow-hidden'>
      {/* Book list */}
      <BookList
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        books={algoBooks}
        setAlgoBooks={setAlgoBooks}
        currentBooks={currentBooks}
        bookLoading={bookLoading}
        addBook={addBook}
        setAddBook={setAddBook}
        setSortBy={setSortBy}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Book details */}
      <BookDetails
        bookDetails={selectedBookData!}
        books={algoBooks}
        setBooks={setAlgoBooks}
      />

      {/* Add book section */}
      <AddBook
        addBook={addBook}
        setAddBook={setAddBook}
        books={algoBooks}
        setBooks={setAlgoBooks}
      />
    </div>
  );
};

export default Books;
