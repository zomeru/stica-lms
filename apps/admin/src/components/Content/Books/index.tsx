import React, { useEffect, useState, useMemo } from 'react';

import { AlgoBookDoc, IBookDoc } from '@lms/types';
import { ITEMS_PER_PAGE, SORT_ITEMS } from '@src/constants';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import AddBook from './AddBook';
import BookDetails from './BookDetails';
import BookList from './BookList';

export type OrderType = 'asc' | 'desc';

const bookSearchQueryName = 'bookSearchKey';

const Books = ({ allBooks }: { allBooks?: IBookDoc[] }) => {
  const bookSearchKey = useNextQuery(bookSearchQueryName);
  const bookId = useNextQuery('bookId');

  const [addBook, setAddBook] = useState(false);

  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoBooks, setAlgoBooks, _, bookLoading] =
    useAlgoData<AlgoBookDoc>('books', bookSearchQueryName, bookSearchKey);

  console.log('algoBooks', algoBooks.length);
  console.log(
    'algoBooks ar',
    algoBooks.filter((book) => book.isArchive !== true).length
  );

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
    algoBooks.filter((book) => book.isArchive !== true),
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
        books={algoBooks.filter((book) => book.isArchive !== true)}
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
        books={algoBooks.filter((book) => book.isArchive !== true)}
        setBooks={setAlgoBooks}
      />

      {/* Add book section */}
      <AddBook
        addBook={addBook}
        setAddBook={setAddBook}
        books={algoBooks.filter((book) => book.isArchive !== true)}
        setBooks={setAlgoBooks}
        allBooks={allBooks}
      />
    </div>
  );
};

export default Books;
