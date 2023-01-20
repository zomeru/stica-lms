import { FormEvent, useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { useNextQuery, Layout, NotFound, useCol } from '@lms/ui';
import { useSidebar, useUser } from '@src/contexts';
import useAuth from '@src/hooks/useAuth';
import { adminSidebarItems } from '@src/constants';
import {
  Books,
  BorrowRequest,
  LoanedBooks,
  LostBooks,
  Users,
  DamagedBooks,
  RenewalRequest,
  History,
  Messages,
  WalkinRequest,
  Archived,
  /* SendNotification, */
} from '@src/components/Content';
import { IBookDoc } from '@lms/types';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '@lms/db';

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

  const [allBooks] = useCol<IBookDoc>(
    query(collection(db, 'books'), orderBy('title', 'asc'))
  );

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

    if (!page || page === 'users') {
      routerArg.query.userSearchKey = encodeURIComponent(
        searchInputRef.current.value
      );
      router.push(routerArg, undefined, { shallow: true });
    }

    if (
      [
        'currently loaned books',
        'borrow requests',
        'renewal requests',
        'lost books',
        'damaged books',
        'reports',
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

      if (page === 'lost books') {
        routerArg.query.lostBookSearchKey = encodeURIComponent(
          searchInputRef.current.value
        );
      }

      if (page === 'damaged books') {
        routerArg.query.damagedBookSearchKey = encodeURIComponent(
          searchInputRef.current.value
        );
      }

      if (page === 'reports') {
        routerArg.query.historyBookSearchKey = encodeURIComponent(
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
      ['borrow', 'loaned', 'renew', 'lost', 'reports', 'damaged'].some(
        (p) => page.includes(p)
      )
    ) {
      setSearchPlaceholder('Search for records');
    } else {
      setSearchPlaceholder('Search disabled');
    }
  }, [page]);

  const renderContent = () => {
    const sidebarItems = adminSidebarItems.map((item) =>
      item.name.toLowerCase()
    );

    if (page && !sidebarItems.includes(page)) {
      return <NotFound />;
    }

    return (
      <>
        {(router.asPath === '/' ||
          router.asPath.includes('/?page=books') ||
          page === 'books' ||
          !page) && <Books allBooks={allBooks} />}
        {page === 'users' && <Users />}
        {/* {page === 'send notifications' && <SendNotification/>} */}
        {page === 'messages' && <Messages />}
        {page === 'walk-in issuance' && (
          <WalkinRequest allBooks={allBooks} />
        )}
        {page === 'currently loaned books' && (
          <LoanedBooks allBooks={allBooks} />
        )}
        {page === 'borrow requests' && <BorrowRequest />}
        {page === 'renewal requests' && <RenewalRequest />}
        {page === 'lost books' && <LostBooks allBooks={allBooks} />}
        {page === 'damaged books' && <DamagedBooks allBooks={allBooks} />}
        {page === 'archived books' && <Archived />}
        {page === 'reports' && <History />}
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
        showNotification
        userId='admin'
        adminInput={
          <input
            ref={searchInputRef}
            disabled={searchPlaceholder === 'Search disabled'}
            placeholder={searchPlaceholder}
            type='text'
            className={`w-full rounded-full bg-neutral-200 py-3 pl-2 pr-4 outline-none ${
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
      <div className='min-w-screen flex min-h-screen flex-col items-center justify-center'>
        <form
          className='bg-primary max-w-[350px] space-y-3 rounded-lg p-10'
          onSubmit={handleSubmit}
        >
          <div className='text-center text-xl font-medium text-white'>
            STICA LMS - Admin
          </div>
          <div className='flex flex-col space-y-2'>
            <input
              type='text'
              className='w-full rounded-lg bg-white px-3 py-2 outline-none'
              placeholder='Username'
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
            <input
              type='password'
              className='w-full rounded-lg bg-white px-3 py-2 outline-none'
              placeholder='Password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <button
              type='submit'
              className='text-primary w-full rounded-lg bg-white px-3 py-2 font-medium'
            >
              Login
            </button>
          </div>
          {error && (
            <div className='text-center text-red-500'>{error}</div>
          )}
        </form>
      </div>
    );
  }

  return null;
};

export default Home;
