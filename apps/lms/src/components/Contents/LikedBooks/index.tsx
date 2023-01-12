import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';
import { collection, query, orderBy } from 'firebase/firestore';

import { navigateToBook } from '@src/utils';
import { likedBooksTableHeaders, ITEMS_PER_PAGE } from '@src/constants';
import { removeFromLikedBooks, useCol , useClientPagination } from '@lms/ui';
import { ILikedBookDoc } from '@lms/types';
import { db } from '@lms/db';
import { useAuth } from '@src/contexts';

const History = () => {
  const { user } = useAuth();

  const [likedBooks, likeLoading] = useCol<ILikedBookDoc>(
    query(
      collection(db, `users/${user?.id || 'default'}/my-likes`),
      orderBy('createdAt', 'desc')
    )
  );

  const [currentLikedBooks, currentPage, next, prev] = useClientPagination(
    likedBooks || [],
    ITEMS_PER_PAGE
  );

  return (
    <section className='h-full w-full'>
      {likedBooks &&
        likedBooks.length > 0 &&
        likedBooks.length / ITEMS_PER_PAGE > 1 && (
          <div className='mb-[10px] flex justify-end'>
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/
                {Math.ceil(likedBooks.length / ITEMS_PER_PAGE)}
              </div>
              <div className='space-x-1'>
                <button
                  type='button'
                  disabled={currentPage === 1}
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage === 1 && 'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => prev()}
                >
                  {'<'}
                </button>
                <button
                  type='button'
                  disabled={
                    currentPage ===
                    Math.ceil(likedBooks.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(likedBooks.length / ITEMS_PER_PAGE) &&
                    'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => next()}
                >
                  {'>'}
                </button>
              </div>
            </div>
          </div>
        )}
      <div
        style={{
          height: `calc(100% - ${
            likedBooks &&
            likedBooks.length > 0 &&
            likedBooks.length / ITEMS_PER_PAGE > 1
              ? 28
              : 0
          }px)`,
        }}
        className={`custom-scrollbar w-full ${
          likedBooks && likedBooks.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!likeLoading &&
          (!likedBooks || (likedBooks && likedBooks.length === 0)) && (
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
                Your likes is currently empty.
              </h1>
            </div>
          )}
        {likedBooks && likedBooks.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {likedBooksTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='bg-primary truncate border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
                <th
                  className='bg-primary border-b-2 border-gray-200 px-5 py-5 '
                  aria-label='action'
                />
              </tr>
            </thead>
            <tbody>
              {currentLikedBooks.map((like) => {
                return (
                  <React.Fragment key={like.id}>
                    <ReactTooltip id={like.title} />

                    <tr key={like.id} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div
                          data-for={like.title}
                          data-tip={like.title}
                          className='relative h-[70px] w-[60px] overflow-hidden rounded-md'
                        >
                          <Image
                            layout='fill'
                            src={like.imageCover.url}
                            quality={5}
                            priority
                          />
                        </div>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          type='button'
                          onClick={() => navigateToBook(like.bookId)}
                        >
                          <p
                            className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'
                            data-for={like.title}
                            data-tip={like.title}
                          >
                            {like.title}
                          </p>
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='text-gray-900'>{like.author}</p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {like.genre}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='whitespace-no-wrap text-gray-900'>
                          {like.identifiers.accessionNumber}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div className='flex space-x-3'>
                          {/* <button
                            type='button'
                            className='text-sky-600'
                            onClick={() => navigateToBook(like.bookId)}
                          >
                            Details
                          </button> */}
                          <button
                            type='button'
                            className='text-red-600'
                            onClick={() => {
                              removeFromLikedBooks(
                                like.id,
                                !!user,
                                user?.id || ''
                              );
                            }}
                          >
                            Unlike
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default History;
