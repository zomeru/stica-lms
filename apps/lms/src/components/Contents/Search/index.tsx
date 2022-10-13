import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import algoliasearch from 'algoliasearch';
import { InstantSearch, Configure } from 'react-instantsearch-hooks-web';

import { BookCard } from '@src/components';
import { useSidebar } from '@src/contexts';
import { SORT_ITEMS } from '@src/constants';
import { useNextQuery, useWindowDimensions } from '@src/hooks';
import { AlgoBookDoc } from '@lms/types';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY as string
);

const searchIndex = searchClient.initIndex('books');

// const HITS_PER_PAGE = 12;

export type OrderType = 'asc' | 'desc';

const Search = () => {
  const router = useRouter();
  const { sidebarOpen } = useSidebar();
  const searchKeyword = useNextQuery('searchKeyword');
  const currentPage = useNextQuery('searchPage');

  const { width } = useWindowDimensions();

  // const HITS_PER_PAGE = width < 1665 ? 12 : width < 1965 ? 20 : 30;

  const [books, setBooks] = useState<AlgoBookDoc[]>([]);

  // TODO: comment this out later
  useEffect(() => {
    const getResult = async () => {
      if (!searchKeyword) {
        let hits: AlgoBookDoc[] = [];

        await searchIndex
          .browseObjects({
            batch: (batch) => {
              hits = hits.concat(batch as AlgoBookDoc[]);
            },
          })
          .then(() => setBooks(hits));
      }

      if (searchKeyword) {
        const result = await searchIndex.search(searchKeyword || '');

        if (result.hits) {
          setBooks(result.hits as AlgoBookDoc[]);
        }
      }
    };

    getResult();
  }, [searchKeyword]);

  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  useEffect(() => {
    if (!router.query.sortBy) {
      setSortBy('views');
    } else {
      const orderIndex = SORT_ITEMS.findIndex(
        (el) => el.sort.name === router.query.sortBy
      );

      setSortBy(SORT_ITEMS[orderIndex].sort.field);
    }
  }, [router.query.sortBy]);

  useEffect(() => {
    const orderIndex = SORT_ITEMS.findIndex(
      (el) => el.sort.name === router.query.sortBy
    );

    const newOrder =
      orderIndex > -1
        ? (SORT_ITEMS[orderIndex].order[0].value as OrderType)
        : 'desc';

    setSortOrder(newOrder);
  }, [sortBy]);

  const HITS_PER_PAGE = useMemo(
    () => (width < 1665 ? 12 : width < 1965 ? 20 : 30),
    [width]
  );

  useEffect(() => {
    if (books && books.length > 0) {
      const numPages = Math.ceil(books.length / HITS_PER_PAGE);

      if (currentPage && Number(currentPage) > numPages) {
        router.push(
          {
            pathname: '/',
            query: {
              ...router.query,
              searchPage: 1,
            },
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [width, HITS_PER_PAGE, books, currentPage]);

  const indexOfLastItem = useMemo(
    () => (currentPage ? Number(currentPage) : 1) * HITS_PER_PAGE,
    [currentPage, width]
  );

  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - HITS_PER_PAGE,
    [indexOfLastItem, width]
  );

  const currentBooks = useMemo(
    () =>
      books
        .sort((a, b) => {
          const newA = a[sortBy as keyof AlgoBookDoc];
          const newB = b[sortBy as keyof AlgoBookDoc];
          if (newA > newB) return sortOrder === 'desc' ? -1 : 1;
          if (newA < newB) return sortOrder === 'desc' ? 1 : -1;
          return 0;
        })
        .slice(indexOfFirstItem, indexOfLastItem),
    [books, currentPage, sortBy, sortOrder]
  );

  console.log('currentBooks', currentBooks);

  const handleSort = (sortName: string) => {
    router.push(
      {
        pathname: '/',
        query: {
          ...router.query,
          sortBy: encodeURIComponent(sortName),
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handlePagination = (paginationType: 'prev' | 'next') => {
    if (paginationType === 'prev') {
      if (
        !router.query.searchPage ||
        Number(router.query.searchPage) === 1
      )
        return;

      router.push(
        {
          pathname: '/',
          query: {
            ...router.query,
            searchPage: Number(router.query.searchPage) - 1,
          },
        },
        undefined,
        { shallow: true }
      );
    } else {
      if (Number(router.query.searchPage) === 10) return;

      router.push(
        {
          pathname: '/',
          query: {
            ...router.query,
            searchPage: !router.query.searchPage
              ? 2
              : Number(router.query.searchPage) + 1,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const currentOrderItems = useMemo(
    () => SORT_ITEMS.find((el) => el.sort.field === sortBy)?.order,
    [sortBy]
  );

  // const row = `grid-cols-${width > 1966 ? 5 : width > 1664 ? 4 : 3}`;

  const rowSideOpen =
    width < 1665
      ? 'grid-cols-3'
      : width < 1965
      ? 'grid-cols-4'
      : 'grid-cols-5';

  const rowSideClose =
    width < 1665
      ? 'grid-cols-4'
      : width < 1965
      ? 'grid-cols-5'
      : 'grid-cols-6';

  return (
    <InstantSearch searchClient={searchClient} indexName='books'>
      <Configure hitsPerPage={HITS_PER_PAGE} />
      <div className='w-full h-full flex justify-between'>
        <div className='w-[calc(100%)] 2xl:w-[calc(100%)] space-y-3 h-full'>
          <div className='flex justify-between'>
            <div className='flex space-x-5 items-center'>
              <div className='flex space-x-3 items-center'>
                <div className='text-cGray-300'>Sort by:</div>
                <div className='flex space-x-2'>
                  {SORT_ITEMS.map(({ sort }) => {
                    const isDefaultSort =
                      router.query.sortBy === undefined ||
                      router.query.sortBy === 'Relevance';

                    const isActiveSort =
                      sort.name === 'Relevance'
                        ? isDefaultSort
                        : sort.name ===
                          decodeURIComponent(
                            (router.query.sortBy as string) || ''
                          );

                    return (
                      <button
                        type='button'
                        key={sort.name}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          isActiveSort
                            ? 'bg-primary text-white'
                            : 'bg-neutral-200 text-cGray-300'
                        }`}
                        onClick={() => handleSort(sort.name)}
                      >
                        {sort.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className='flex space-x-3 items-center'>
                <div className='text-cGray-300'>Order by:</div>
                <div className='pr-3 bg-neutral-200 rounded-lg'>
                  <select
                    className='outline-none border-none rounded-lg text-cGray-300 bg-neutral-200 px-2 py-[3px] '
                    onChange={(e) =>
                      setSortOrder(e.target.value as OrderType)
                    }
                    value={sortOrder}
                  >
                    {currentOrderItems &&
                      currentOrderItems.map((item) => (
                        <option key={item.name} value={item.value}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            {/* <Pagination
              showLast={false}
              showFirst={false}
              padding={1}
              totalPages={Math.round(books.length / HITS_PER_PAGE)}
            /> */}
            {books.length > 0 && books.length / HITS_PER_PAGE > 1 && (
              <div className='flex items-center space-x-3'>
                <div>
                  {Number(router.query.searchPage as string) || 1}/
                  {Math.ceil(books.length / HITS_PER_PAGE)}
                </div>
                <div className='space-x-1'>
                  <button
                    type='button'
                    disabled={
                      !router.query.searchPage ||
                      Number(router.query.searchPage as string) === 1
                    }
                    className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                      (!router.query.searchPage ||
                        Number(router.query.searchPage as string) === 1) &&
                      'opacity-40 cursor-not-allowed'
                    }`}
                    onClick={() => handlePagination('prev')}
                  >
                    {'<'}
                  </button>
                  <button
                    type='button'
                    disabled={
                      Number(router.query.searchPage as string) ===
                      Math.ceil(books.length / HITS_PER_PAGE)
                    }
                    className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                      Number(router.query.searchPage as string) ===
                        Math.ceil(books.length / HITS_PER_PAGE) &&
                      'opacity-40 cursor-not-allowed'
                    }`}
                    onClick={() => handlePagination('next')}
                  >
                    {'>'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className={`w-full grid gap-y-5 justify-between place-items-left h-full place-content-start pt-1 pb-4  ${
              sidebarOpen ? rowSideOpen : rowSideClose
            } ${
              currentBooks &&
              currentBooks.length > 0 &&
              'overflow-y-scroll custom-scrollbar'
            }`}
          >
            {currentBooks &&
              currentBooks.map((book) => (
                <BookCard key={book.objectID} book={book} />
              ))}
          </div>
        </div>
      </div>
    </InstantSearch>
  );
};

export default Search;
