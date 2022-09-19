import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  AiOutlineLogout,
  AiOutlineLogin,
  AiOutlineSearch,
} from 'react-icons/ai';
import { MdNotificationsNone } from 'react-icons/md';
import { IconType } from 'react-icons';

const LOGO_URL = '/assets/images/STI_LOGO.png';

interface LayoutProps {
  isAuthenticated: boolean;
  authAction: () => void;
  sidebarItems: {
    name: string;
    Icon: IconType;
  }[];
  username?: string;
  userPhoto?: string;
  children?: React.ReactNode;
}

export const Layout = ({
  isAuthenticated,
  authAction,
  username,
  userPhoto,
  children,
  sidebarItems,
}: LayoutProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchQuery.length < 1) return;

    router.push(
      {
        pathname: '/',
        query: { page: 'home', search: searchQuery },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className='max-w-[1920px] mx-auto h-[calc(100vh-25px)]'>
      <main className='flex w-full h-full'>
        {/* Separator */}
        <div className='h-full w-[1px] bg-cGray-200' />
        <div className='h-full w-[260px] pr-6'>
          <div className='h-[100px] w-full pl-6 flex justify-center items-end pb-[5px]'>
            <Link href='/'>
              <div className='cursor-pointer flex flex-col items-center space-y-1'>
                <div className='h-[40px] w-[70px] relative'>
                  <Image
                    src={LOGO_URL}
                    layout='fill'
                    alt='STI LOGO'
                    objectFit='cover'
                    objectPosition='center'
                  />
                </div>
                <h1 className='text-primary font-bold text-2xl'>
                  STICA LMS
                </h1>
              </div>
            </Link>
          </div>
          <div
            className={`h-[calc(100%-100px)] w-full flex flex-col ${
              isAuthenticated && 'justify-between pb-[30px]'
            }`}
          >
            <div className='flex flex-col'>
              {sidebarItems &&
                sidebarItems.map(({ name, Icon }) => {
                  const isHome =
                    router.asPath === '/' || router.query.page === 'home';
                  const isActive =
                    name.toLowerCase() === 'home'
                      ? isHome
                      : router.query.page ===
                        name.toLowerCase().replaceAll(' ', '-');

                  return (
                    <button
                      type='button'
                      className={`h-[60px] before:transition-all before:duration-300 before:ease-int-out before:content-[""] before:absolute before:top-0 before:left-0 before:w-full relative ${
                        isActive
                          ? 'before:h-full before:border-l-[6px] before:border-primary'
                          : 'before:h-0'
                      } hover:text-primary text-cGray-300`}
                      key={name}
                      onClick={() => {
                        router.push(
                          {
                            pathname: '/',
                            query: {
                              page: name
                                .toLowerCase()
                                .replaceAll(' ', '-'),
                            },
                          },
                          undefined,
                          { shallow: true }
                        );
                      }}
                    >
                      <div className='cursor-pointer h-[50px] w-full flex items-center pl-6 space-x-2'>
                        <Icon
                          className={`${
                            isActive ? 'text-primary' : ''
                          } text-lg transition-all h-[60px] duration-300 ease-int-out mb-[1px]`}
                        />
                        <p
                          className={`${
                            isActive ? 'text-primary' : ''
                          } transition-all duration-300 ease-int-out font-medium text-base`}
                        >
                          {name}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
            <button
              type='button'
              className='h-[60px]'
              onClick={authAction}
            >
              <div className='cursor-pointer w-full flex items-center pl-6 space-x-2 text-cGray-300 hover:text-primary transition-all duration-300 ease-int-out'>
                {isAuthenticated ? (
                  <AiOutlineLogout className='text-lg mb-[1px]' />
                ) : (
                  <AiOutlineLogin className='text-lg mb-[1px]' />
                )}
                <p className='font-medium text-base'>
                  {isAuthenticated ? 'Log out' : 'Log in'}
                </p>
              </div>
            </button>
          </div>
        </div>
        {/* Separator */}
        <div className='h-full w-[1px] bg-cGray-200' />
        <div className='w-[calc(100%-260px)] h-full'>
          <div className='w-full h-[100px] flex'>
            <form
              onSubmit={handleSearch}
              className='w-full h-full flex items-center px-[40px] space-x-3'
            >
              <div className='w-full flex items-center bg-cGray-100 pl-4 rounded-full'>
                <AiOutlineSearch className='text-2xl text-cGray-300' />
                <input
                  placeholder='Search for books'
                  type='text'
                  className='w-full outline-none bg-cGray-100 py-3 pl-2 pr-4 rounded-full'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.trim())}
                />
              </div>
              {/* <button
                type='submit'
                className='bg-primary text-white py-3 px-10 rounded-full'
              >
                Search
              </button> */}
            </form>
            <div className='w-[calc(400px-40px)] h-full flex items-center space-x-4 justify-end pr-[40px]'>
              <button type='button'>
                <MdNotificationsNone className='w-[25px] h-[25px] text-text' />
              </button>
              {isAuthenticated ? (
                <div className='flex items-center space-x-2'>
                  <div className='relative w-[40px] h-[40px] overflow-hidden rounded-full'>
                    <Image
                      src={userPhoto || 'https://i.imgur.com/N7EmcCY.jpg'}
                      layout='fill'
                      objectFit='cover'
                      objectPosition='center'
                      alt='User avatar'
                    />
                  </div>
                  <div className='text-text font-medium'>{username}</div>
                </div>
              ) : (
                <button
                  type='button'
                  className='text-base font-medium text-text links'
                  onClick={authAction}
                >
                  Log in
                </button>
              )}
            </div>
          </div>
          {/* Separator */}
          <div className='w-full h-[1px] bg-cGray-200' />
          <div className='w-full h-[calc(100%-101px)]'>{children}</div>
        </div>
        {/* Separator */}
        <div className='h-full w-[1px] bg-cGray-200' />
      </main>
      <footer className='w-full h-[25px] bg-primary text-white flex justify-center items-center'>
        <p className='text-sm text-neutral-300'>
          <span className='font-medium text-white'>
            &copy; 2022 Stica LMS.
          </span>{' '}
          All rights reserved.
        </p>
      </footer>
    </div>
  );
};
