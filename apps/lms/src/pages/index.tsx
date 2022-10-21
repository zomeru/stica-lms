import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import { Layout, NotFound, useNextQuery, LoaderModal } from '@lms/ui';
import {
  loggedInSidebarItems,
  loggedOutSidebarItems,
} from '@src/constants';
import {
  Home as HomeComp,
  Notifications,
  CurrentlyIssuedBooks,
  PendingRequests,
  History,
  Contact,
  Search,
  BookDetails,
  LikedBooks,
  About,
} from '@src/components/Contents';
import { useSidebar } from '@src/contexts/SidebarContext';
import { useAuth } from '@src/contexts';
import { AnimatePresence, motion } from 'framer-motion';
import IntroLoader from '@src/components/IntroLoader';
import LostBooks from '@src/components/Contents/LostBooks';

const sidebarItems = loggedInSidebarItems.map((item) =>
  item.name.toLowerCase()
);

const Home: NextPage = () => {
  const page = useNextQuery('page');
  const { sidebarOpen, showHideSidebar } = useSidebar();
  const router = useRouter();
  const { user, login, logout, loading } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const authenticatedPages = [
      'notifications',
      'currently issued books',
      'borrow requests',
      'history',
      'my likes',
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
        {!!user && page === 'notifications' && <Notifications />}
        {!!user && page === 'currently issued books' && (
          <CurrentlyIssuedBooks />
        )}
        {!!user && page === 'borrow requests' && <PendingRequests />}
        {!!user && page === 'history' && <History />}
        {!!user && page === 'my likes' && <LikedBooks />}
        {!!user && page === 'lost books' && <LostBooks />}
        {page === 'contact' && <Contact />}
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
            className='w-screen h-screen flex justify-center items-center overflow-hidden'
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
          hasNewNotification={false}
        >
          <LoaderModal isLoading={loading} />
          {renderContent()}
        </Layout>
      )}
    </>
  );
};

export default Home;
