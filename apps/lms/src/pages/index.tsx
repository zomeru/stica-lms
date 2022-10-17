import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import { Layout } from '@lms/ui';
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
} from '@src/components/Contents';
import { useSidebar } from '@src/contexts/SidebarContext';
import { useAuth } from '@src/contexts';

const sidebarItems = loggedInSidebarItems.map((item) =>
  item.name.toLowerCase()
);

const Home: NextPage = () => {
  const { sidebarOpen, showHideSidebar } = useSidebar();
  const router = useRouter();
  const { user, login, logout } = useAuth();

  console.log('user asdadasd', user);

  useEffect(() => {
    const authenticatedPages = [
      'notifications',
      'currently issued books',
      'borrow requests',
      'history',
      'my likes',
    ];

    function checkPage() {
      if (
        authenticatedPages.includes(
          decodeURIComponent(router.query.page as string)
        )
      ) {
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
  }, [user, router.query]);

  // const loginHandler = () => {
  //   instance.loginRedirect(loginRequest);
  // };

  // const logoutHandler = () => {
  //   instance.logoutPopup({
  //     postLogoutRedirectUri: '/',
  //   });
  // };

  const renderContent = () => {
    if (
      router.query.page &&
      !sidebarItems.includes(
        decodeURIComponent(router.query.page as string)
      )
    ) {
      return (
        <section className='w-full h-full flex justify-center items-center'>
          <h1 className='text-3xl font-medium'>Page Not Found</h1>
        </section>
      );
    }

    const page = decodeURIComponent(router.query.page as string);

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
        {page === 'contact' && <Contact />}
      </>
    );
  };

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      showHideSidebar={showHideSidebar}
      isAuthenticated={!!user}
      sidebarItems={user ? loggedInSidebarItems : loggedOutSidebarItems}
      authAction={user ? logout : login}
      username={user?.displayName}
      userPhoto={user?.photo.url}
      showNotification
      // TODO: dynamic notification
      hasNewNotification={false}
    >
      {renderContent()}
    </Layout>
  );
};

export default Home;
