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

const Users = () => {
  const userSearchKey = useNextQuery('userSearchKey');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [users, setUsers, refreshUsers, userLoading] =
    useAlgoData<AlgoUserDoc>('users', userSearchKey);

  const [currentUsers, currentPage, next, prev] =
    useClientPagination<AlgoUserDoc>(users, ITEMS_PER_PAGE);

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshUsers();
    nProgress.done();
  };

  return (
    <section className='w-full h-full'>
      {users && users.length > 0 && (
        <div className='flex justify-between mb-[10px]'>
          <button
            type='button'
            className='bg-primary hover:bg-sky-800 duration-200 text-white text-sm px-3 py-1 rounded-md'
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
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage === 1 && 'opacity-40 cursor-not-allowed'
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
                  className={`px-[15px] text-xl rounded-md bg-neutral-200 text-textBlack ${
                    currentPage ===
                      Math.ceil(users.length / ITEMS_PER_PAGE) &&
                    'opacity-40 cursor-not-allowed'
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
        className={`w-full custom-scrollbar ${
          users && users.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!userLoading && (!users || (users && users.length === 0)) && (
          <div className='w-full h-full flex flex-col justify-center space-y-3'>
            <div className='relative w-[75%] h-[75%] mx-auto'>
              <Image
                src='/assets/images/empty.png'
                layout='fill'
                objectFit='contain'
                blurDataURL='/assets/images/empty.png'
                placeholder='blur'
                quality={50}
              />
            </div>
            <h1 className='text-cGray-300 text-2xl text-center'>
              {userSearchKey
                ? 'No users found'
                : 'There is currently no registered users.'}
            </h1>
            {!userSearchKey && (
              <button
                type='button'
                onClick={handleUpdate}
                className='text-sky-600 text-xl'
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
                    className='border-b-2 border-gray-200 bg-primary px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white truncate'
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
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <div className='relative w-[40px] h-[40px] rounded-full overflow-hidden'>
                          <Image src={user.photo.url} layout='fill' />
                        </div>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-primary'>
                            {user.displayName}
                          </p>
                        </button>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
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
                            className='text-left line-clamp-2 overflow-hidden text-neutral-900'
                          >
                            {user.email.replace('@alabang.sti.edu.ph', '')}
                          </p>
                          <AiOutlineCopy className='text-lg text-sky-600' />
                        </button>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {user.totalBorrowedBooks}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {user.totalRenewedBooks}
                        </p>
                      </td>
                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
                          {user.totalReturnedBooks}
                        </p>
                      </td>

                      <td className='border-b border-cGray-200 bg-white px-5 py-5 text-sm'>
                        <p className='max-w-[210px] text-left line-clamp-2 overflow-hidden text-neutral-900'>
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
