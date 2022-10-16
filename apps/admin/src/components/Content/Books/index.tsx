import React, { useEffect, useState, useMemo } from 'react';

import { AlgoBookDoc } from '@lms/types';
import { ITEMS_PER_PAGE, SORT_ITEMS } from '@src/constants';

import { useAlgoData, useNextQuery } from '@lms/ui';
import AddBook from './AddBook';
import BookDetails from './BookDetails';
import BookList from './BookList';

export type OrderType = 'asc' | 'desc';

const Books = () => {
  const bookSearchKey = useNextQuery('bookSearchKey');
  const bookId = useNextQuery('bookId');

  const [addBook, setAddBook] = useState(false);

  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoBooks, setAlgoBooks, _, bookLoading] =
    useAlgoData<AlgoBookDoc>('books', bookSearchKey);

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

  const indexOfLastItem = useMemo(
    () => (currentPage ? Number(currentPage) : 1) * ITEMS_PER_PAGE,
    [currentPage]
  );

  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - ITEMS_PER_PAGE,
    [indexOfLastItem]
  );

  const currentBooks = useMemo(
    () =>
      algoBooks
        .sort((a, b) => {
          const newA = a[sortBy as keyof AlgoBookDoc];
          const newB = b[sortBy as keyof AlgoBookDoc];
          if (newA > newB) return sortOrder === 'desc' ? -1 : 1;
          if (newA < newB) return sortOrder === 'desc' ? 1 : -1;
          return 0;
        })
        .slice(indexOfFirstItem, indexOfLastItem),
    [algoBooks, currentPage, sortBy, sortOrder]
  );

  const selectedBookData = useMemo(() => {
    return algoBooks.find((book) => book.objectID === bookId);
  }, [algoBooks, bookId]);

  const onPrev = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const onNext = () => {
    if (
      algoBooks &&
      currentPage === Math.ceil(algoBooks.length / ITEMS_PER_PAGE)
    )
      return;

    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <div className='w-full h-full relative overflow-hidden'>
      {/* Book list */}
      <BookList
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        books={algoBooks}
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
