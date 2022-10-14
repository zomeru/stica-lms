import React, { useEffect, useState, useMemo } from 'react';
import algoliasearch from 'algoliasearch';

import { AlgoBookDoc } from '@lms/types';
import { SORT_ITEMS } from '@src/constants';

import { useNextQuery } from '@lms/ui';
import nProgress from 'nprogress';
import AddBook from './AddBook';
import BookDetails from './BookDetails';
import BookList from './BookList';

export type OrderType = 'asc' | 'desc';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY as string
);

const HITS_PER_PAGE = 10;

const searchIndex = searchClient.initIndex('books');

const Books = () => {
  const bookSearchKey = useNextQuery('bookSearchKey');

  const [addBook, setAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');

  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');
  const [bookLoading, setBookLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [algoBooks, setAlgoBooks] = useState<AlgoBookDoc[]>([]);

  useEffect(() => {
    const getBooks = async () => {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setBookLoading(true);
      if (!bookSearchKey) {
        let hits: AlgoBookDoc[] = [];

        await searchIndex
          .browseObjects({
            batch: (batch) => {
              hits = hits.concat(batch as AlgoBookDoc[]);
            },
          })
          .then(() => {
            setAlgoBooks(hits);
            setBookLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching books', err);
            setBookLoading(false);
          });
      }

      if (bookSearchKey) {
        setCurrentPage(1);
        const result = await searchIndex.search(bookSearchKey || '');

        if (result.hits) {
          setAlgoBooks(result.hits as AlgoBookDoc[]);
        }

        setBookLoading(false);
      }

      nProgress.done();
    };

    getBooks();
  }, [bookSearchKey]);

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
    () => (currentPage ? Number(currentPage) : 1) * HITS_PER_PAGE,
    [currentPage]
  );

  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - HITS_PER_PAGE,
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
    return algoBooks.find((book) => book.objectID === selectedBook);
  }, [algoBooks, selectedBook]);

  const onPrev = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const onNext = () => {
    if (
      algoBooks &&
      currentPage === Math.ceil(algoBooks.length / HITS_PER_PAGE)
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
