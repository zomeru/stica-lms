import React from 'react';
import ReactTooltip from 'react-tooltip';
import Image from 'next/image';
import { collection, query, orderBy } from 'firebase/firestore';
import { useIsAuthenticated } from '@azure/msal-react';

import { navigateToBook } from '@src/utils';
import { likedBooksTableHeaders } from '@src/constants';
import { removeFromLikedBooks, useCol } from '@src/services';
import { ILikedBookDoc } from '@lms/types';
import { db } from '@lms/db';
import { useUser } from '@src/contexts';

const History = () => {
  const isAuthenticated = useIsAuthenticated();
  const { user } = useUser();

  const [likedBooks, likeLoading] = useCol<ILikedBookDoc>(
    query(
      collection(db, `users/${user?.id || ''}/my-likes`),
      orderBy('createdAt', 'desc')
    )
  );

  return (
    <section
      className={`w-full h-full custom-scrollbar ${
        likedBooks && likedBooks.length > 0 && 'overflow-y-scroll'
      }`}
    >
      {!likeLoading &&
        (!likedBooks || (likedBooks && likedBooks.length === 0)) && (
          <div className='w-full h-full flex flex-col justify-center space-y-3'>
            <div className='relative w-[75%] h-[75%] mx-auto'>
              <Image
                src='/assets/images/books_empty.png'
                layout='fill'
                objectFit='contain'
                blurDataURL='/assets/images/books_empty.png'
                placeholder='blur'
              />
            </div>
            <h1 className='text-cGray-300 text-2xl text-center'>
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
                  className='border-b-2 border-gray-200 bg-primary px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                >
                  {' '}
                  {header}{' '}
                </th>
              ))}
              <th
                className='border-b-2 border-gray-200 bg-primary px-5 py-5 '
                aria-label='action'
              />
            </tr>
          </thead>
          <tbody>
            {likedBooks.map((like) => {
              return (
                <React.Fragment key={like.id}>
                  <ReactTooltip id={like.title} />

                  <tr key={like.id} className='font-medium'>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <div
                        data-for={like.title}
                        data-tip={like.title}
                        className='relative w-[60px] h-[70px] rounded-md overflow-hidden'
                      >
                        <Image
                          layout='fill'
                          src={like.imageCover.url}
                          quality={5}
                          priority
                        />
                      </div>
                    </td>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <button
                        type='button'
                        onClick={() => navigateToBook(like.bookId)}
                      >
                        <p
                          className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-primary'
                          data-for={like.title}
                          data-tip={like.title}
                        >
                          {like.title}
                        </p>
                      </button>
                    </td>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p className='text-gray-900'>{like.author}</p>
                    </td>

                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p className='whitespace-no-wrap text-gray-900'>
                        {like.genre}
                      </p>
                    </td>
                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <p className='whitespace-no-wrap text-gray-900'>
                        {like.accessionNumber}
                      </p>
                    </td>

                    <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                      <div className='flex space-x-3'>
                        <button
                          type='button'
                          className='text-sky-600'
                          onClick={() => navigateToBook(like.bookId)}
                        >
                          Details
                        </button>
                        <button
                          type='button'
                          className='text-red-600'
                          onClick={() => {
                            removeFromLikedBooks(
                              like.id,
                              isAuthenticated,
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
    </section>
  );
};

export default History;
