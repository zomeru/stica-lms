import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { BookCard } from '@src/components';
import { useSidebar } from '@src/contexts';
import { SORT_ITEMS } from '@src/constants';
import { AlgoBookDoc } from '@lms/types';
import {
  useAlgoData,
  useClientPagination,
  useNextQuery,
  useWindowDimensions,
} from '@lms/ui';
import Image from 'next/image';

export type OrderType = 'asc' | 'desc';

const Search = () => {
  const router = useRouter();
  const { sidebarOpen } = useSidebar();
  const searchKeyword = useNextQuery('searchKeyword');
  const currentPage = useNextQuery('searchPage');

  const { width } = useWindowDimensions();

  const [books] = useAlgoData<AlgoBookDoc>('books', searchKeyword);

  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState<OrderType>('desc');

  const HITS_PER_PAGE = useMemo(
    () => (width < 1665 ? 12 : width < 1965 ? 20 : 30),
    [width]
  );

  const [currentBooks] = useClientPagination(
    books,
    HITS_PER_PAGE,
    {
      sortBy,
      sortOrder,
    },
    currentPage ? Number(currentPage) : 1
  );

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
      if (
        Number(router.query.searchPage) ===
        Math.ceil(books.length / HITS_PER_PAGE)
      )
        return;

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

  const rowSideOpen =
    width < 1330
      ? 'grid-cols-2'
      : width < 1665
      ? 'grid-cols-3'
      : width < 1965
      ? 'grid-cols-4'
      : 'grid-cols-5';

  const rowSideClose =
    width < 1000
      ? 'grid-cols-2'
      : width < 1330
      ? 'grid-cols-3'
      : width < 1665
      ? 'grid-cols-4'
      : width < 1965
      ? 'grid-cols-5'
      : 'grid-cols-6';

  return (
    <div className='flex h-full w-full justify-between'>
      {(!books || (books && books.length === 0)) && (
        <div className='flex h-full w-full flex-col justify-center space-y-3'>
          <div className='relative mx-auto h-[75%] w-[75%]'>
            <Image
              src='/assets/images/empty.png'
              layout='fill'
              objectFit='contain'
              blurDataURL='/assets/images/empty.png'
              placeholder='blur'
              quality={50}
            />
          </div>
          <h1 className='text-cGray-300 text-center text-2xl'>
            No books found.
          </h1>
        </div>
      )}
      {books && books.length > 0 && (
        <div className='h-full w-[calc(100%)] space-y-3 2xl:w-[calc(100%)]'>
          <div className='flex justify-between'>
            <div className='flex items-center space-x-5'>
              <div className='flex items-center space-x-3'>
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
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isActiveSort
                            ? 'bg-primary text-white'
                            : 'text-cGray-300 bg-neutral-200'
                        }`}
                        onClick={() => handleSort(sort.name)}
                      >
                        {sort.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <div className='text-cGray-300'>Order by:</div>
                <div className='rounded-lg bg-neutral-200 pr-3'>
                  <select
                    className='text-cGray-300 rounded-lg border-none bg-neutral-200 px-2 py-[3px] outline-none '
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
            {books.length / HITS_PER_PAGE > 1 && (
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
                    className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                      (!router.query.searchPage ||
                        Number(router.query.searchPage as string) === 1) &&
                      'cursor-not-allowed opacity-40'
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
                    className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                      Number(router.query.searchPage as string) ===
                        Math.ceil(books.length / HITS_PER_PAGE) &&
                      'cursor-not-allowed opacity-40'
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
            style={{
              height: `calc(100% - ${
                // books.length / HITS_PER_PAGE > 1 ? 36 : 0
                36
              }px)`,
            }}
            className={`place-items-left grid w-full place-content-start justify-between gap-y-5 pt-1 pb-4  ${
              sidebarOpen ? rowSideOpen : rowSideClose
            } ${
              currentBooks &&
              currentBooks.length > 0 &&
              'custom-scrollbar overflow-y-scroll'
            }`}
          >
            {currentBooks &&
              currentBooks.map((book) => (
                <BookCard key={book.objectID} book={book} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
