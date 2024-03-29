import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import {
  Layout,
  NotFound,
  useNextQuery,
  LoaderModal,
  useCol,
} from '@lms/ui';
import {
  loggedInSidebarItems,
  loggedOutSidebarItems,
} from '@src/constants';
import {
  Home as HomeComp,
  CurrentlyIssuedBooks,
  PendingRequests,
  History,
  Contact,
  Search,
  BookDetails,
  LikedBooks,
  About,
  DamagedBooks,
  Messages,
  FAQ,
} from '@src/components/Contents';
import { useSidebar } from '@src/contexts/SidebarContext';
import { useAuth } from '@src/contexts';
import { AnimatePresence, motion } from 'framer-motion';
import IntroLoader from '@src/components/IntroLoader';
import LostBooks from '@src/components/Contents/LostBooks';
import { IBorrowDoc } from '@lms/types';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { db } from '@lms/db';

const sidebarItems = loggedInSidebarItems.map((item) =>
  item.name.toLowerCase()
);

const Home: NextPage = () => {
  const page = useNextQuery('page');
  const { sidebarOpen, showHideSidebar } = useSidebar();
  const router = useRouter();
  const { user, login, logout, loading } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  console.log('user', user);

  const [allBorrows, borrowLoading] = useCol<IBorrowDoc>(
    query(
      collection(db, 'borrows'),
      where('userId', '==', user?.id || ''),
      orderBy('updatedAt', 'desc')
    )
  );

  console.log('allBorrows', allBorrows);
  // console.log('borrowLoading', borrowLoading);

  useEffect(() => {
    const authenticatedPages = [
      'message admin',
      'currently issued books',
      'borrow requests',
      'history',
      'my likes',
      'lost books',
      'damaged books',
    ];

    function checkPage() {
      if (authenticatedPages.includes(page || '')) {
        if (!user) {
          router.push(
            {
              pathname: '/',
              query: {
                ...router.query,
                page: 'home',
              },
            },
            undefined,
            { shallow: true }
          );
        }
      }
    }

    checkPage();
  }, [user, page]);

  // const loginHandler = () => {
  //   instance.loginRedirect(loginRequest);
  // };

  // const logoutHandler = () => {
  //   instance.logoutPopup({
  //     postLogoutRedirectUri: '/',
  //   });
  // };

  const renderContent = () => {
    if (page && !sidebarItems.includes(page)) {
      return <NotFound />;
    }

    return (
      <>
        {router.query.bookId && <BookDetails />}
        {(router.asPath === '/' ||
          router.asPath.includes('/?page=home') ||
          page === 'home' ||
          !router.query.page) && <HomeComp />}
        {page === 'search' && !router.query.bookId && <Search />}
        {!!user && page === 'message admin' && <Messages />}
        {!!user && page === 'currently issued books' && (
          <CurrentlyIssuedBooks
            borrows={(allBorrows || []).filter(
              (borrow) => borrow.status === 'Issued'
            )}
            borrowLoading={borrowLoading}
          />
        )}
        {!!user && page === 'borrow requests' && (
          <PendingRequests
            borrows={(allBorrows || []).filter(
              (borrow) => borrow.status === 'Pending'
            )}
            borrowLoading={borrowLoading}
          />
        )}
        {!!user && page === 'history' && (
          <History
            borrows={(allBorrows || []).filter(
              (borrow) => borrow.status !== 'Issued'
            )}
            borrowLoading={borrowLoading}
          />
        )}
        {!!user && page === 'my likes' && <LikedBooks />}
        {!!user && page === 'lost books' && (
          <LostBooks
            borrows={(allBorrows || []).filter(
              (borrow) => borrow.status === 'Lost'
            )}
            borrowLoading={borrowLoading}
          />
        )}
        {!!user && page === 'damaged books' && (
          <DamagedBooks
            borrows={(allBorrows || []).filter(
              (borrow) => borrow.status === 'Damaged'
            )}
            borrowLoading={borrowLoading}
          />
        )}
        {page === 'contact' && <Contact />}
        {page === 'faq' && <FAQ />}
        {page === 'about' && <About />}
      </>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            exit={{
              opacity: 0,
              transition: {
                ease: 'easeInOut',
                duration: 1,
              },
            }}
            className='flex h-screen w-screen items-center justify-center overflow-hidden'
          >
            <IntroLoader finishLoading={() => setIsLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {!isLoading && (
        <Layout
          sidebarOpen={sidebarOpen}
          showHideSidebar={showHideSidebar}
          isAuthenticated={!!user}
          sidebarItems={
            user ? loggedInSidebarItems : loggedOutSidebarItems
          }
          authAction={user ? logout : login}
          username={user?.displayName}
          userPhoto={user?.photo.url}
          showNotification
          // TODO: dynamic notification
          userId={user?.id}
        >
          <LoaderModal isLoading={loading} />
          {renderContent()}
        </Layout>
      )}
    </>
  );
};

export default Home;
