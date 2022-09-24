import React, { useMemo } from 'react';

import { BookCard } from '@src/components';
import { useSidebar } from '@src/contexts';

function randNum(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const Home = () => {
  const { sidebarOpen } = useSidebar();

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

  return (
    <div className='w-full h-full flex justify-between'>
      <div className='w-[calc(100%)] 2xl:w-[calc(100%)] space-y-3 h-full'>
        <div className='flex justify-between'>
          <div>Sort</div>
          <div>Pagination</div>
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

export default Home;
