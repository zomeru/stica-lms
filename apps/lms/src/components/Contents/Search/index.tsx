import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Configure } from 'react-instantsearch-hooks-web';

import { BookCard } from '@src/components';
import { useSidebar } from '@src/contexts';
import { SORT_ITEMS } from '@src/constants';
import { IBookDoc } from '@lms/types';
import { useNextQuery } from '@src/hooks';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY as string
);

const searchIndex = searchClient.initIndex('books');

const HITS_PER_PAGE = 12;

export type OrderType = 'asc' | 'desc';

export type ABookDoc = IBookDoc & { objectID: string };

const Search = () => {
  const router = useRouter();
  const { sidebarOpen } = useSidebar();
  const searchKeyword = useNextQuery('searchKeyword');
  const currentPage = useNextQuery('searchPage');

  const [books, setBooks] = useState<ABookDoc[]>([]);

  // TODO: comment this out later
  useEffect(() => {
    const getResult = async () => {
      const result = await searchIndex.search(searchKeyword || '');
      if (result.hits) {
        setBooks(result.hits as ABookDoc[]);
      }
    };

    getResult();
  }, [searchKeyword]);

  // const currentBooks = useClientPagination(
  //   books,
  //   currentPage ? Number(currentPage) : 1,
  //   HITS_PER_PAGE
  // );

  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  useEffect(() => {
    if (!router.query.sortBy) {
      setSortBy('totalBorrow');
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

    console.log('orderIndex', orderIndex);

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
      books
        .sort((a, b) => {
          const newA = a[sortBy as keyof ABookDoc];
          const newB = b[sortBy as keyof ABookDoc];
          if (newA > newB) return sortOrder === 'desc' ? -1 : 1;
          if (newA < newB) return sortOrder === 'desc' ? 1 : -1;
          return 0;
        })
        .slice(indexOfFirstItem, indexOfLastItem),
    [books, currentPage, sortBy, sortOrder]
  );

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
                        className={`px-3 py-2  rounded-lg text-sm ${
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
                    className='outline-none border-none rounded-lg text-cGray-300 bg-neutral-200 px-2 py-[3px] rounded'
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
            {books.length > 0 && books.length / HITS_PER_PAGE > 1 && (
              <div className='flex items-center space-x-3'>
                <div>
                  {Number(router.query.searchPage as string) || 1}/
                  {Math.round(books.length / HITS_PER_PAGE)}
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
                      Math.round(books.length / HITS_PER_PAGE)
                    }
                    className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                      Number(router.query.searchPage as string) ===
                        Math.round(books.length / HITS_PER_PAGE) &&
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
            className={`w-full grid gap-y-5 justify-between place-items-left overflow-y-scroll h-full place-content-start pt-1 pb-4 2xl:grid-cols-5 ${
              sidebarOpen ? 'grid-cols-3' : 'grid-cols-4'
            }`}
          >
            {currentBooks &&
              currentBooks.map((book) => (
                <BookCard key={book.objectID} {...book} />
              ))}
          </div>
        </div>
      </div>
    </InstantSearch>
  );
};

export default Search;
