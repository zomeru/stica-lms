import React from 'react';
import toast from 'react-hot-toast';
import nProgress from 'nprogress';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import { AiOutlineCopy } from 'react-icons/ai';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import { ITEMS_PER_PAGE, userTableHeaders } from '@src/constants';
import { copyToClipboard } from '@src/utils';
import { AlgoUserDoc } from '@lms/types';

const userSearchQueryName = 'userSearchKey';

const Users = () => {
  const userSearchKey = useNextQuery(userSearchQueryName);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [users, setUsers, refreshUsers, userLoading] =
    useAlgoData<AlgoUserDoc>('users', userSearchQueryName, userSearchKey);

  const [currentUsers, currentPage, next, prev] =
    useClientPagination<AlgoUserDoc>(users, ITEMS_PER_PAGE);

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshUsers();
    nProgress.done();
  };

  console.log('users', users);

  return (
    <section className='h-full w-full'>
      {users && users.length > 0 && (
        <div className='mb-[10px] flex justify-between'>
          <button
            type='button'
            className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
            onClick={handleUpdate}
          >
            Refresh users
          </button>
          {users.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/{Math.ceil(users.length / ITEMS_PER_PAGE)}
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
                    Math.ceil(users.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(users.length / ITEMS_PER_PAGE) &&
                    'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => next()}
                >
                  {'>'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        style={{
          height: `calc(100% - ${users && users.length > 0 ? 30 : 0}px)`,
        }}
        className={`custom-scrollbar w-full ${
          users && users.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!userLoading && (!users || (users && users.length === 0)) && (
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
              {userSearchKey
                ? 'No users found'
                : 'There is currently no registered users.'}
            </h1>
            {!userSearchKey && (
              <button
                type='button'
                onClick={handleUpdate}
                className='text-xl text-sky-600'
              >
                Refresh
              </button>
            )}
          </div>
        )}
        {users && users.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {userTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='bg-primary truncate border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => {
                return (
                  <React.Fragment key={user.objectID}>
                    <ReactTooltip id={user.objectID} />

                    <tr key={user.objectID} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div className='relative h-[40px] w-[40px] overflow-hidden rounded-full'>
                          <Image
                            src={user.photo.url}
                            layout='fill'
                            quality={10}
                          />
                        </div>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'>
                            {user.displayName}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          className='flex items-center space-x-1'
                          type='button'
                          onClick={() => {
                            copyToClipboard(user.email);
                            toast.success('Email copied to clipboard');
                          }}
                        >
                          <p
                            data-for={user.objectID}
                            data-tip={user.email}
                            className='line-clamp-2 overflow-hidden text-left text-neutral-900'
                          >
                            {user.email.replace('@alabang.sti.edu.ph', '')}
                          </p>
                          <AiOutlineCopy className='text-lg text-sky-600' />
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalBorrowedBooks}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalRenewedBooks}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalReturnedBooks}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalLostBooks}
                        </p>
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

export default Users;
