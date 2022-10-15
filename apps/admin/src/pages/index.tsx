import { FormEvent, useEffect, useState, useRef, Fragment } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { Layout, useNextQuery } from '@lms/ui';
import { useSidebar, useUser } from '@src/contexts';
import useAuth from '@src/hooks/useAuth';
import { adminSidebarItems } from '@src/constants';
import {
  Books,
  BorrowRequest,
  LoanedBooks,
  Users,
} from '@src/components/Content';

const Home: NextPage = () => {
  const { user, loading } = useUser();
  const { login, error, logout } = useAuth();
  const { sidebarOpen, showHideSidebar } = useSidebar();
  const router = useRouter();
  const page = useNextQuery('page');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [searchPlaceholder, setSearchPlaceholder] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(username, password);
  };

  const handleAdminSearch = () => {
    if (!searchInputRef.current) return;
    if (!searchInputRef.current.value) {
      toast.error('Please enter a search term');
      return;
    }

    const routerArg: any = {
      pathname: '/',
      query: {
        ...router.query,
      },
    };

    if (!page || page === 'books') {
      routerArg.query.bookSearchKey = encodeURIComponent(
        searchInputRef.current.value
      );
      router.push(routerArg, undefined, { shallow: true });
    }

    if (
      [
        'currently loaned books',
        'borrow requests',
        'renewal requests',
      ].some((el) => el === page)
    ) {
      if (page === 'currently loaned books') {
        routerArg.query.loanedSearchKey = encodeURIComponent(
          searchInputRef.current.value
        );
      }

      if (page === 'borrow requests') {
        routerArg.query.borrowSearchKey = encodeURIComponent(
          searchInputRef.current.value
        );
      }

      if (page === 'renewal requests') {
        routerArg.query.renewalSearchKey = encodeURIComponent(
          searchInputRef.current.value
        );
      }

      router.push(routerArg, undefined, { shallow: true });
    }
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }

    if (!page || page === 'books') {
      setSearchPlaceholder('Search for books');
    } else if (page === 'users') {
      setSearchPlaceholder('Search for users');
    } else if (
      ['borrow', 'loaned', 'renew'].some((p) => page.includes(p))
    ) {
      setSearchPlaceholder('Search for records');
    } else {
      setSearchPlaceholder('Search disabled');
    }
  }, [page]);

  const renderContent = () => {
    return (
      <>
        {(router.asPath === '/' ||
          router.asPath.includes('/?page=books') ||
          page === 'books' ||
          !page) && <Books />}
        {page === 'users' && <Users />}
        {page === 'currently loaned books' && <LoanedBooks />}
        {page === 'borrow requests' && <BorrowRequest />}
      </>
    );
  };

  if (!loading && user.uid) {
    return (
      <Layout
        sidebarOpen={sidebarOpen}
        showHideSidebar={showHideSidebar}
        isAuthenticated={!!user.uid}
        sidebarItems={adminSidebarItems}
        authAction={logout}
        username='Admin'
        onAdminSearch={handleAdminSearch}
        searchPlaceholder={searchPlaceholder}
        user='admin'
        userPhoto='/assets/images/STI_LOGO.png'
        adminInput={
          <input
            ref={searchInputRef}
            disabled={searchPlaceholder === 'Search disabled'}
            placeholder={searchPlaceholder}
            type='text'
            className={`w-full outline-none bg-neutral-200 py-3 pl-2 pr-4 rounded-full ${
              searchPlaceholder === 'Search disabled' &&
              'cursor-not-allowed'
            }`}
          />
        }
      >
        {renderContent()}
      </Layout>
    );
  }

  if (!loading && !user.uid) {
    return (
      <div className='flex flex-col min-h-screen min-w-screen items-center justify-center'>
        <form
          className='space-y-3 bg-primary rounded-lg p-10 max-w-[350px]'
          onSubmit={handleSubmit}
        >
          <div className='text-xl font-medium text-white text-center'>
            STICA LMS - Admin
          </div>
          <div className='flex flex-col space-y-2'>
            <input
              type='text'
              className='bg-white w-full outline-none px-3 py-2 rounded-lg'
              placeholder='Username'
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
            <input
              type='password'
              className='bg-white w-full outline-none px-3 py-2 rounded-lg'
              placeholder='Password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <button
              type='submit'
              className='text-primary font-medium w-full px-3 py-2 rounded-lg bg-white'
            >
              Login
            </button>
          </div>
          {error && (
            <div className='text-red-500 text-center'>{error}</div>
          )}
        </form>
      </div>
    );
  }

  return null;
};

export default Home;
