import React, { FormEvent, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  AiOutlineLogout,
  AiOutlineLogin,
  AiOutlineSearch,
  AiOutlineLeft,
} from 'react-icons/ai';
import { MdNotificationsNone } from 'react-icons/md';
import { IconType } from 'react-icons';
import { toast } from 'react-hot-toast';
import { motion, Variants } from 'framer-motion';
import {
  collection,
  query,
  doc,
  updateDoc,
  orderBy,
  where,
} from 'firebase/firestore';
import TimeAgo from 'javascript-time-ago';

import { db } from '@lms/db';
import { IAdminNotificationsDoc, INotificationsDoc } from '@lms/types';

import en from 'javascript-time-ago/locale/en';

import Menu from '../Menu';
import { useCol } from '../../services';

// English.
TimeAgo.addDefaultLocale(en);

interface LayoutProps {
  isAuthenticated: boolean;
  authAction: () => void;
  sidebarItems: {
    name: string;
    Icon: IconType;
  }[];
  sidebarOpen: boolean;
  showHideSidebar: () => void;
  username?: string;
  userPhoto?: string;
  children?: React.ReactNode;
  searchPlaceholder?: string;
  searchDisabled?: boolean;
  user?: 'user' | 'admin';
  onAdminSearch?: () => void;
  adminInput?: React.ReactNode;
  showNotification?: boolean;
  userId?: string;
}

export const Layout = ({
  isAuthenticated,
  authAction,
  username,
  userPhoto,
  children,
  sidebarItems,
  sidebarOpen = true,
  showHideSidebar,
  searchDisabled = false,
  searchPlaceholder = 'Search for books',
  user = 'user',
  onAdminSearch,
  adminInput,
  showNotification,
  userId,
}: LayoutProps) => {
  const router = useRouter();
  const timeAgo = new TimeAgo('en-US');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      console.log('Button clicked');
      setTimeout(() => {
        if (notifOpen) setNotifOpen(false);
      }, 50);
    };

    const element = layoutRef.current;

    element?.addEventListener('click', handleClick);

    return () => {
      element?.removeEventListener('click', handleClick);
    };
  }, [notifOpen]);

  const [notifs] = useCol<INotificationsDoc & IAdminNotificationsDoc>(
    query(
      collection(
        db,
        user === 'user' ? 'notifications' : 'admin-notifications'
      ),
      where(
        'userId',
        '==',
        user === 'user' ? userId || 'default' : 'admin'
      ),
      orderBy('createdAt', 'desc')
    )
  );

  const handleSearch = (keyword: string) => {
    const allQueries: any = {
      ...router.query,
      searchKeyword: encodeURIComponent(keyword),
    };
    delete allQueries.bookId;
    delete allQueries.chatId;

    if (keyword.length === 0) delete allQueries.searchKeyword;

    router.push(
      {
        pathname: '/',
        query: {
          ...allQueries,
          page: 'search',
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (user === 'admin') {
      if (onAdminSearch) onAdminSearch();

      return;
    }

    if (!searchInputRef.current) return;
    if (!searchInputRef.current.value) {
      toast.error('Please enter a search term');
      return;
    }

    if (
      router.query.searchKeyword === searchInputRef.current.value &&
      router.query.page === 'search'
    )
      return;

    handleSearch(searchInputRef.current.value.trim());
  };

  const handleSidebarItemClick = (name: string) => {
    const allQueries = { ...router.query };
    delete allQueries.bookId;
    delete allQueries.chatId;

    router.push(
      {
        pathname: '/',
        query: {
          ...allQueries,
          page: encodeURIComponent(name.toLowerCase()),
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to view notifications');
      return;
    }

    setNotifOpen((prev) => !prev);
  };

  const handleEachNotificationClick = async (
    notif: INotificationsDoc & IAdminNotificationsDoc
  ) => {
    const notifRef = doc(
      db,
      user === 'user' ? 'notifications' : 'admin-notifications',
      notif.id
    );
    await updateDoc(notifRef, {
      clicked: true,
    });

    setNotifOpen(false);

    if (notif.type === 'Borrow') {
      handleSidebarItemClick('borrow requests');
    }

    if (notif.type === 'Renew') {
      handleSidebarItemClick('renewal requests');
    }

    if (
      notif.type === 'PickedUp' ||
      notif.type === 'Penalty' ||
      notif.type === 'Renewed'
    ) {
      handleSidebarItemClick('currently issued books');
    }

    if (notif.type === 'Cancelled' || notif.type === 'Return') {
      handleSidebarItemClick('history');
    }

    if (notif.type === 'Damaged') {
      handleSidebarItemClick('damaged books');
    }

    if (notif.type === 'Lost') {
      handleSidebarItemClick('lost books');
    }

    if (notif.type === 'Replace') {
      if (notif.message.includes('damaged')) {
        handleSidebarItemClick('damaged books');
      }

      if (notif.message.includes('lost')) {
        handleSidebarItemClick('lost books');
      }
    }
  };

  //? ANIMATIONS
  const menuVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 1,
        staggerChildren: 0.1,
        when: 'beforeChildren',
      },
    },
  };

  const menuItemVariants: Variants = {
    hidden: {
      y: -20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeInOut',
        duration: 0.2,
      },
    },
  };

  return (
    <div
      ref={layoutRef}
      className='mx-auto h-[calc(100vh)] max-w-[1920px]'
    >
      {/* <div className='max-w-[1920px] mx-auto h-[calc(100vh-25px)]'> */}
      <motion.main
        variants={menuVariants}
        initial='hidden'
        animate='visible'
        className='flex h-full w-full'
      >
        {/* Separator */}
        <div className='bg-cGray-200 hidden h-full w-[1px] md:block' />
        <div
          style={{
            maxWidth: sidebarOpen ? '100%' : '0px',
            transform: sidebarOpen
              ? 'translateX(0)'
              : 'translateX(-320px)',
            transition:
              'max-width 0.2s ease-in-out, transform 0.3s ease-in-out',
          }}
          className={`hidden h-full md:block`}
        >
          <motion.div
            variants={menuItemVariants}
            className='flex h-[100px] items-center justify-center pb-[5px] italic duration-75'
          >
            <Link href='/'>
              <div
                className={`flex cursor-pointer flex-col items-center space-y-1`}
              >
                {/* <div className='h-[40px] w-[70px] relative'>
                  <Image
                    src={LOGO_URL}
                    layout='fill'
                    alt='STI LOGO'
                    objectFit='cover'
                    objectPosition='center'
                  />
                </div> */}
                <h1 className='text-primary w-[185px] px-[10px] text-3xl font-black'>
                  STICA LMS
                </h1>
              </div>
            </Link>
          </motion.div>
          <div
            className={`flex h-[calc(100%-100px)] w-full flex-col ${
              isAuthenticated && 'justify-between pb-[30px]'
            }`}
          >
            <div className='flex flex-col'>
              {sidebarItems &&
                sidebarItems.map(({ name, Icon }) => {
                  const isHome =
                    router.pathname === '/' &&
                    (router.asPath.includes('/?page=home') ||
                      router.query.page === 'home' ||
                      !router.query.page ||
                      router.query.page === 'books' ||
                      router.asPath.includes('/?page=books'));

                  const isActive =
                    name.toLowerCase() === 'home' ||
                    name.toLowerCase() === 'books'
                      ? isHome
                      : name.toLowerCase() ===
                        decodeURIComponent(router.query.page as string);

                  return (
                    <motion.button
                      variants={menuItemVariants}
                      type='button'
                      className={`before:ease-int-out relative h-[50px] pr-6 before:absolute before:top-0 before:left-0 before:w-full before:transition-all before:duration-300 before:content-[""] 2xl:h-[60px] ${
                        isActive
                          ? 'before:border-primary before:h-full before:border-l-[6px]'
                          : 'before:h-0'
                      } hover:text-primary text-cGray-300`}
                      key={name}
                      onClick={() => {
                        if (isActive && !router.query.bookId) return;
                        handleSidebarItemClick(name);
                      }}
                    >
                      <div className='flex h-[50px] w-full cursor-pointer items-center space-x-2 pl-6'>
                        <Icon
                          className={`${
                            isActive && 'text-primary'
                          } ease-int-out mb-[1px] h-[60px] text-lg transition-colors duration-300`}
                        />
                        <p
                          className={`${
                            isActive && 'text-primary'
                          } ease-int-out truncate text-base font-medium transition-colors duration-300`}
                        >
                          {name}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              <motion.button
                variants={menuItemVariants}
                type='button'
                className='h-[50px] 2xl:h-[60px]'
                onClick={authAction}
              >
                <div className='text-cGray-300 hover:text-primary ease-int-out flex w-full cursor-pointer items-center space-x-2 pl-6 transition-colors duration-300 2xl:hidden'>
                  {isAuthenticated ? (
                    <AiOutlineLogout className='mb-[1px] text-lg' />
                  ) : (
                    <AiOutlineLogin className='mb-[1px] text-lg' />
                  )}
                  <p className='text-base font-medium'>
                    {isAuthenticated ? 'Log out' : 'Log in'}
                  </p>
                </div>
              </motion.button>
            </div>
            <motion.button
              variants={menuItemVariants}
              type='button'
              className='h-[50px] 2xl:h-[60px]'
              onClick={authAction}
            >
              <div className='text-cGray-300 hover:text-primary ease-int-out hidden  w-full cursor-pointer items-center space-x-2 pl-6 transition-colors duration-300 2xl:flex'>
                {isAuthenticated ? (
                  <AiOutlineLogout className='mb-[1px] text-lg' />
                ) : (
                  <AiOutlineLogin className='mb-[1px] text-lg' />
                )}
                <p className='text-base font-medium'>
                  {isAuthenticated ? 'Log out' : 'Log in'}
                </p>
              </div>
            </motion.button>
          </div>
        </div>
        {/* Separator */}
        <div className='bg-cGray-200 relative h-full w-[1px]'>
          <button
            type='button'
            className={`bg-cGray-100 absolute top-[85px] hidden h-[30px] w-[30px] transform items-center justify-center  rounded-full  transition-all duration-300 ease-in-out md:flex ${
              sidebarOpen
                ? 'left-[50%] -translate-x-1/2 rotate-0'
                : 'rotate-180'
            }`}
            onClick={showHideSidebar}
          >
            <AiOutlineLeft className='text-blackText h-[20px] w-[20px]' />
          </button>
        </div>
        <motion.div
          variants={menuVariants}
          initial='hidden'
          animate='visible'
          className='h-full w-full'
        >
          <div className='flex h-[100px] w-full px-[40px]'>
            <form
              // onSubmit={onSearch}
              onSubmit={onSearch}
              className='flex h-full w-full items-center space-x-3'
            >
              <motion.div
                variants={menuItemVariants}
                className='flex w-full items-center rounded-full bg-neutral-200 pl-4'
              >
                <AiOutlineSearch className='text-cGray-300 text-2xl' />
                {user === 'admin' ? (
                  adminInput
                ) : (
                  <input
                    ref={searchInputRef}
                    disabled={searchDisabled}
                    placeholder={searchPlaceholder}
                    type='text'
                    className={`w-full rounded-full bg-neutral-200 py-3 pl-2 pr-4 outline-none ${
                      searchDisabled && 'cursor-not-allowed'
                    }`}
                  />
                )}
              </motion.div>
              {/* <button
                type='submit'
                className='bg-primary text-white py-3 px-10 rounded-full'
              >
                Search
              </button> */}
            </form>

            <div className='relative flex h-full w-[500px] items-center justify-end space-x-4'>
              {showNotification && (
                <motion.button
                  variants={menuItemVariants}
                  type='button'
                  className={`${
                    notifs &&
                    notifs.filter((notif) => !notif.clicked).length > 0 &&
                    'relative after:absolute after:top-[3px] after:right-[3px] after:h-[10px] after:w-[10px] after:rounded-full after:bg-red-600 after:content-[""]'
                  }`}
                  onClick={handleNotificationClick}
                >
                  <MdNotificationsNone className='text-blackText h-[25px] w-[25px]' />
                </motion.button>
              )}

              {notifOpen && (
                <div className='custom-scrollbar absolute top-[80px] right-[0px] z-[9999] max-h-[calc(100vh-100px)] w-[380px] space-y-2 overflow-y-scroll rounded-lg border-t border-neutral-200 bg-white py-2 px-3 shadow-lg shadow-gray-400 drop-shadow-md'>
                  {notifs && notifs.length > 0 && (
                    <h2 className='text-left text-lg'>Notifications</h2>
                  )}
                  {notifs && notifs.length > 0 ? (
                    <div className='space-y-3'>
                      {notifs.map((notif) => {
                        let message;
                        const createdAt = notif.createdAt
                          .toDate()
                          .toLocaleString();
                        const date = new Date(createdAt);
                        const ago = timeAgo.format(date);

                        const typeArrAdmin = ['Borrow', 'Renew'];
                        const typeArrUser = ['PickedUp'];

                        const typeArrUser2 = [
                          'Penalty',
                          'Renewed',
                          'Return',
                          'Damaged',
                          'Lost',
                          'Replace',
                          'Cancelled',
                        ];

                        if (
                          typeArrAdmin.some((type) => type === notif.type)
                        ) {
                          message = (
                            <p
                              className={`${
                                notif.clicked
                                  ? 'text-neutral-500'
                                  : 'text-neutral-800'
                              }`}
                            >
                              <span
                                className={`${
                                  notif.clicked
                                    ? 'text-neutral-500'
                                    : 'text-blackText'
                                } font-semibold`}
                              >
                                {notif.studentName}
                              </span>{' '}
                              {notif.message}{' '}
                              <span
                                className={`${
                                  notif.clicked
                                    ? 'text-neutral-500'
                                    : 'text-blackText'
                                } font-semibold`}
                              >
                                {notif.bookTitle}
                              </span>
                              .
                            </p>
                          );
                        }

                        if (
                          typeArrUser.some((type) => type === notif.type)
                        ) {
                          const newMessage = notif.message.replace(
                            notif.bookTitle as string,
                            ''
                          );
                          message = (
                            <p
                              className={`${
                                notif.clicked
                                  ? 'text-neutral-500'
                                  : 'text-neutral-800'
                              }`}
                            >
                              {newMessage}{' '}
                              <span
                                className={`${
                                  notif.clicked
                                    ? 'text-neutral-500'
                                    : 'text-blackText'
                                } font-semibold`}
                              >
                                {notif.bookTitle}
                              </span>
                              .
                            </p>
                          );
                        }

                        if (
                          typeArrUser2.some((type) => type === notif.type)
                        ) {
                          const messageSplit = notif.message.split(
                            notif.bookTitle as string
                          );

                          message = (
                            <p
                              className={`${
                                notif.clicked
                                  ? 'text-neutral-500'
                                  : 'text-neutral-800'
                              }`}
                            >
                              {messageSplit[0] || ''}
                              <span
                                className={`${
                                  notif.clicked
                                    ? 'text-neutral-500'
                                    : 'text-blackText'
                                } font-semibold`}
                              >
                                {notif.bookTitle}
                              </span>
                              {messageSplit[1] || ''}
                            </p>
                          );
                        }

                        return (
                          <button
                            className='flex items-center space-x-[10px]'
                            type='button'
                            onClick={() =>
                              handleEachNotificationClick(notif)
                            }
                          >
                            <div className='relative h-[50px] w-[50px] overflow-hidden rounded-full'>
                              <Image
                                src={
                                  user === 'admin'
                                    ? notif.studentPhoto!
                                    : 'https://firebasestorage.googleapis.com/v0/b/stica-lms.appspot.com/o/stica%2FSTI_LOGO.png?alt=media&token=2a5f406c-9e29-41de-be02-16f830682691'
                                }
                                layout='fill'
                                alt='student'
                              />
                            </div>
                            <div className='w-[calc(100%-60px)] text-left text-sm'>
                              {message}
                              <div
                                className={`text-left text-xs ${
                                  notif.clicked
                                    ? 'text-neutral-500'
                                    : 'font-semibold text-sky-600'
                                }`}
                              >
                                {ago}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-center text-xl'>No notifications</p>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <motion.div
                  variants={menuItemVariants}
                  className='flex items-center space-x-2'
                >
                  <div className='relative h-[40px] w-[40px] overflow-hidden rounded-full'>
                    <Image
                      src={userPhoto || 'https://i.imgur.com/N7EmcCY.jpg'}
                      objectFit='cover'
                      objectPosition='center'
                      alt='User avatar'
                      priority
                      quality={50}
                      layout='fill'
                    />
                  </div>
                  <div className='text-blackText font-medium'>
                    {username}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  variants={menuItemVariants}
                  type='button'
                  className='text-blackText links text-base font-medium'
                  onClick={authAction}
                >
                  Log in
                </motion.button>
              )}

              <Menu sidebarItems={sidebarItems} />
            </div>
          </div>
          {/* Separator */}
          <div className='bg-cGray-200 h-[1px] w-full' />
          <div className='h-[calc(100%-101px)] w-full overflow-hidden md:px-[40px] md:pt-[30px] md:pb-[40px]'>
            {children}
          </div>
        </motion.div>
        {/* Separator */}
        <div className='bg-cGray-200 h-full w-[1px]' />
      </motion.main>
      {/* <footer className='w-full h-[25px] bg-primary text-white flex justify-center items-center'>
        <p className='text-sm text-neutral-300'>
          <span className='font-medium text-white'>
            &copy; 2022 Stica LMS.
          </span>{' '}
          All rights reserved.
        </p>
      </footer> */}
    </div>
  );
};
