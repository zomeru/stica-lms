import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BiBook } from 'react-icons/bi';
import { useCol } from '@src/services';
import { db } from '@lms/db';
import { collection, query } from 'firebase/firestore';

type Category = {
  category: string;
  active: boolean;
  id: string;
};

type Genre = {
  categoryId: string;
  genre: string;
  id: string;
};

const Home = () => {
  const router = useRouter();

  const [newGenres, setNewGenres] = useState<Genre[]>([]);

  const [categories] = useCol<Category>(
    query(collection(db, 'categories'))
  );

  const [genres, genreLoading] = useCol<Genre>(
    query(collection(db, 'genres'))
  );

  useEffect(() => {
    if (genres) {
      const slicedGenres = genres.slice(0, 12);
      setNewGenres(slicedGenres);
    }
  }, [genreLoading]);

  const showMoreGenres = () => {
    if (genres) {
      const slicedGenres = genres.slice(0, newGenres.length + 12);
      setNewGenres(slicedGenres);
    }
  };

  const showLessGenres = () => {
    if (genres) {
      const slicedGenres = genres.slice(0, newGenres.length - 12);
      setNewGenres(slicedGenres);
    }
  };

  const handleSearchBtnClick = (key?: string) => {
    const allQueries = { ...router.query };
    delete allQueries.bookId;

    if (key) {
      allQueries.searchKeyword = encodeURIComponent(key);
    }

    router.push(
      {
        pathname: '/',
        query: {
          ...allQueries,
          page: 'search',
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <section className='custom-scrollbar h-full w-full overflow-y-scroll'>
      <div className='flex items-center'>
        <div className='space-y-3'>
          <div className='text-primary text-7xl font-semibold'>
            Discover the book treasure
          </div>
          <p className='w-[90%]'>
            Pick and borrow books according to your needs. From applied
            literature to education resources, we have a lot of textbooks
            to provide you.
          </p>
          <button
            className='hover:bg-primaryLight bg-primary rounded-lg px-5 py-2 text-white transition-colors duration-300'
            type='button'
            onClick={() => handleSearchBtnClick()}
          >
            Search books now
          </button>
        </div>
        <div className='relative h-[350px] w-[650px]'>
          <Image src='/assets/images/reading_book.jpg' layout='fill' />
        </div>
      </div>
      <div className='my-10 space-y-3'>
        <div className='text-primary text-center text-xl'>Categories</div>
        <div className='flex justify-center space-x-5'>
          {categories?.map((category) => (
            <button
              key={category.id}
              type='button'
              className='flex w-[150px] flex-col items-center rounded-lg border border-neutral-300 p-3'
              onClick={() => handleSearchBtnClick(category.category)}
            >
              <div>
                <BiBook className='text-primary h-[40px] w-[40px]' />
              </div>
              <div>{category.category}</div>
            </button>
          ))}
        </div>
      </div>
      <div className='my-10 space-y-3'>
        <div className='text-primary text-center text-xl'>Genres</div>
        <div className='flex flex-wrap justify-center'>
          {newGenres?.map((genre) => (
            <button
              key={genre.id}
              className='flex w-[150px] flex-col items-center rounded-lg  p-3'
              onClick={() => handleSearchBtnClick(genre.genre)}
              type='button'
            >
              <div>
                <BiBook className='text-primary h-[40px] w-[40px]' />
              </div>
              <div>{genre.genre}</div>
            </button>
          ))}
        </div>
        <div className='flex justify-center space-x-3'>
          {genres && newGenres.length < genres.length && (
            <button
              className='bg-primary rounded-md px-2 py-1 text-white'
              type='button'
              onClick={showMoreGenres}
            >
              Show more genres
            </button>
          )}
          {newGenres.length > 12 && (
            <button
              className='bg-primary rounded-md px-2 py-1 text-white'
              type='button'
              onClick={showLessGenres}
            >
              Show less genres
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
