import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import nProgress from 'nprogress';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import { AiOutlineCopy } from 'react-icons/ai';
import { useRouter } from 'next/router';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import { ITEMS_PER_PAGE, masterTableHeaders } from '@src/constants';
import { copyToClipboard } from '@src/utils';
import { AlgoUserDoc } from '@lms/types';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@lms/db';
import { UserType, useUser } from '@src/contexts';
import { signOut } from 'firebase/auth';

const userSearchQueryName = 'userSearchKey';

const Masters = () => {
  const userSearchKey = useNextQuery(userSearchQueryName);
  const router = useRouter();
  const { user, setUser } = useUser();

  const [loading, setLoading] = React.useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_users, setUsers, refreshUsers, userLoading] =
    useAlgoData<AlgoUserDoc>('users', userSearchQueryName, userSearchKey);

  const users = useMemo(() => {
    return _users.filter(
      (userrrr) => userrrr.isAdmin === true && userrrr.terminated !== true
    );
  }, [_users]);

  const [currentUsers, currentPage, next, prev] =
    useClientPagination<AlgoUserDoc>(users, ITEMS_PER_PAGE);

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshUsers();
    nProgress.done();
  };

  const handleRefresh = () => {
    router.push(
      {
        pathname: '/',
        query: {
          page: router.query.page,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleRemovePrivileges = async (newU: AlgoUserDoc) => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', newU.objectID);

      await updateDoc(userRef, {
        isAdmin: false,
        adminRole: deleteField(),
        adminPrivileges: deleteField(),
      });

      const filteredUsers = users.filter(
        (newUse) => newUse.objectID !== newU.objectID
      );
      setUsers(filteredUsers);

      if (user?.email === newU.email) {
        signOut(auth).then(() => {
          setUser({} as UserType);
        });
      }

      toast.success('User privileges removed');
    } catch (err) {
      toast.error('Error removing user privileges');
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  return (
    <section className='h-full w-full'>
      {users && users.length > 0 && (
        <div className='mb-[10px] flex justify-between'>
          <div className='flex items-center space-x-2'>
            <button
              type='button'
              className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
              onClick={handleUpdate}
            >
              Refresh records
            </button>
            <div className='text-sm'>Results: {users.length}</div>
          </div>
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
                : 'There is currently no users with privileges.'}
            </h1>
            <button
              type='button'
              onClick={handleRefresh}
              className='text-xl text-sky-600'
            >
              Refresh
            </button>
          </div>
        )}
        {users && users.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {masterTableHeaders.map((header) => (
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
              {currentUsers.map((userD: AlgoUserDoc) => {
                return (
                  <React.Fragment key={userD.objectID}>
                    <ReactTooltip id={userD.objectID} />

                    <tr key={userD.objectID} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div className='relative h-[40px] w-[40px] overflow-hidden rounded-full'>
                          <Image
                            src={userD.photo.url}
                            layout='fill'
                            quality={10}
                          />
                        </div>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'>
                            {userD.displayName}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          className='flex items-center space-x-1'
                          type='button'
                          onClick={() => {
                            copyToClipboard(userD.email);
                            toast.success('Email copied to clipboard');
                          }}
                        >
                          <p
                            data-for={userD.objectID}
                            data-tip={userD.email}
                            className='line-clamp-2 overflow-hidden text-left text-neutral-900'
                          >
                            {userD.email.replace(
                              '@alabang.sti.edu.ph',
                              ''
                            )}
                          </p>
                          <AiOutlineCopy className='text-lg text-sky-600' />
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {userD.adminRole}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div className='flex flex-col space-y-2'>
                          <button
                            type='button'
                            disabled={loading}
                            className='truncate rounded-md bg-red-600 px-2 py-1 text-xs text-white'
                            onClick={() => {
                              handleRemovePrivileges(userD);
                            }}
                          >
                            Remove Privileges
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

export default Masters;
