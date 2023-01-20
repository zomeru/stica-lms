import React, { useEffect, useState } from 'react';

import { AlgoBookDoc } from '@lms/types';
import { ITEMS_PER_PAGE, SORT_ITEMS } from '@src/constants';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';

import BookList from './BookList';

export type OrderType = 'asc' | 'desc';

const bookSearchQueryName = 'bookSearchKey';

const Archived = () => {
  const bookSearchKey = useNextQuery(bookSearchQueryName);

  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [algoBooks, setAlgoBooks, _, bookLoading] =
    useAlgoData<AlgoBookDoc>('books', bookSearchQueryName, bookSearchKey);

  console.log('algoBooks archvied', algoBooks);

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
    algoBooks.filter((book) => book.isArchive === true),
    ITEMS_PER_PAGE,
    {
      sortBy,
      sortOrder,
    }
  );

  return (
    <div className='relative h-full w-full overflow-hidden'>
      {/* Book list */}
      <BookList
        onNext={onNext}
        onPrev={onPrev}
        currentPage={currentPage}
        books={algoBooks.filter((book) => book.isArchive === true)}
        setAlgoBooks={setAlgoBooks}
        currentBooks={currentBooks}
        bookLoading={bookLoading}
        setSortBy={setSortBy}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  );
};

export default Archived;
