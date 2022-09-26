import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { BookCard } from '@src/components';
import { useSidebar } from '@src/contexts';
import { sortItems } from '@src/constants';

function randNum(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const Search = () => {
  const { sidebarOpen } = useSidebar();
  const router = useRouter();

  const books = useMemo(() => {
    const newBooks: any = [];

    new Array(10).fill(0).forEach((_, i) => {
      newBooks.push({
        id: `book-${1 + i}`,
        title: `The Great Gatsby ${1 + i}`,
        author: 'F. Scott Fitzgerald',
        genre: 'Fiction',
        available: randNum(5, 30),
        views: randNum(1, 999),
      });
    });

    return newBooks;
  }, []);

  const handleSort = (sortName: string) => {
    router.push(
      {
        pathname: '/',
        query: {
          ...router.query,
          sortBy: encodeURIComponent(sortName.toLowerCase()),
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

  if (!router.query.searchKeyword) {
    return (
      <section className='w-full h-full flex flex-col justify-center space-y-2'>
        <div className='w-[70%] h-[70%] 2xl:w-[45%] 2xl:h-[45%] relative mx-auto'>
          <Image
            src='/assets/images/person_search_2.jpg'
            layout='fill'
            objectPosition='center'
            objectFit='contain'
          />
        </div>
        <div className='text-center text-3xl font-medium text-cGray-300'>
          Please search for a book
        </div>
      </section>
    );
  }

  return (
    <div className='w-full h-full flex justify-between'>
      <div className='w-[calc(100%)] 2xl:w-[calc(100%)] space-y-3 h-full'>
        <div className='flex justify-between'>
          <div className='flex space-x-3 items-center'>
            <div className='text-cGray-300'>Sort by</div>
            <div className='flex space-x-2'>
              {sortItems.map((item) => {
                const isDefaultSort =
                  router.query.sortBy === undefined ||
                  router.query.sortBy === 'relevance';

                const isActiveSort =
                  item.toLowerCase() === 'relevance'
                    ? isDefaultSort
                    : item.toLowerCase() ===
                      decodeURIComponent(
                        (router.query.sortBy as string) || ''
                      );

                return (
                  <button
                    type='button'
                    key={item}
                    className={`px-3 py-2  rounded-lg text-sm ${
                      isActiveSort
                        ? 'bg-primary text-white'
                        : 'bg-neutral-200 text-cGray-300'
                    }`}
                    onClick={() => handleSort(item)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <div>
              {Number(router.query.searchPage as string) || 1}
              /10
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
                disabled={Number(router.query.searchPage as string) === 10}
                className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                  Number(router.query.searchPage as string) === 10 &&
                  'opacity-40 cursor-not-allowed'
                }`}
                onClick={() => handlePagination('next')}
              >
                {'>'}
              </button>
            </div>
          </div>
        </div>
        <div
          className={`w-full grid gap-y-5 justify-between place-items-left overflow-y-scroll h-full place-content-start pt-1 pb-4 2xl:grid-cols-5 ${
            sidebarOpen ? 'grid-cols-3' : 'grid-cols-4'
          }`}
        >
          {books.map((book: any) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>

      {/* <div className='w-[300px] h-full space-y-3'>
        <div className='h-1/2 w-full flex items-center justify-center bg-red-300 rounded-2xl'>
          Recommendations
        </div>
        <div className='h-1/2 w-full flex items-center justify-center bg-sky-300 rounded-2xl'>
          Newly added books
        </div>
      </div> */}
    </div>
  );
};

export default Search;
