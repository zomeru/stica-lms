import React, { FormEvent, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  AiOutlineLogout,
  AiOutlineLogin,
  AiOutlineSearch,
} from 'react-icons/ai';
import { MdNotificationsNone } from 'react-icons/md';
import { AiOutlineLeft } from 'react-icons/ai';
import { IconType } from 'react-icons';
import { toast } from 'react-hot-toast';

// const LOGO_URL = '/assets/images/STI_LOGO.png';

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
}: LayoutProps) => {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchInputRef.current) return;
    if (!searchInputRef.current.value) {
      toast.error('Please enter a search term');
      return;
    }

    router.push(
      {
        pathname: '/',
        query: {
          page: 'home',
          search: encodeURIComponent(searchInputRef.current?.value.trim()),
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSidebarItemClick = (name: string) => {
    router.push(
      {
        pathname: '/',
        query: {
          page: name.toLowerCase().replace(/ /g, '-'),
        },
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
        <div
          style={{
            maxWidth: sidebarOpen ? '100%' : '0px',
            transform: sidebarOpen
              ? 'translateX(0)'
              : 'translateX(-320px)',
            transition:
              'max-width 0.2s ease-in-out, transform 0.3s ease-in-out',
          }}
          className={`h-full`}
        >
          <div className='h-[100px] flex justify-center items-center pb-[5px] italic duration-75'>
            <Link href='/'>
              <div
                className={`cursor-pointer flex flex-col items-center space-y-1`}
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
                <h1 className='text-primary font-black text-3xl w-[185px] px-[10px]'>
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
                    router.asPath === '/' ||
                    router.asPath.includes('/?page=home') ||
                    router.query.page === 'home' ||
                    !router.query.page;

                  const isActive =
                    name.toLowerCase() === 'home'
                      ? isHome
                      : name.toLowerCase().replace(/ /g, '-') ===
                        router.query.page;

                  return (
                    <button
                      type='button'
                      className={`h-[60px] pr-6 before:transition-all before:duration-300 before:ease-int-out before:content-[""] before:absolute before:top-0 before:left-0 before:w-full relative ${
                        isActive
                          ? 'before:h-full before:border-l-[6px] before:border-primary'
                          : 'before:h-0'
                      } hover:text-primary text-cGray-300`}
                      key={name}
                      onClick={() => {
                        if (isActive) return;
                        handleSidebarItemClick(name);
                      }}
                    >
                      <div className='cursor-pointer h-[50px] w-full flex items-center pl-6 space-x-2'>
                        <Icon
                          className={`${
                            isActive ? 'text-primary' : ''
                          } text-lg transition-colors h-[60px] duration-300 ease-int-out mb-[1px]`}
                        />
                        <p
                          className={`${
                            isActive ? 'text-primary' : ''
                          } transition-colors duration-300 ease-int-out font-medium text-base truncate`}
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
              <div className='cursor-pointer w-full flex items-center pl-6 space-x-2 text-cGray-300 hover:text-primary transition-colors duration-300 ease-int-out'>
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
        <div className='h-full w-[1px] bg-cGray-200 relative'>
          <button
            type='button'
            className={`bg-cGray-100 rounded-full h-[30px] w-[30px] flex items-center justify-center absolute top-[85px]  transform  duration-300 transition-all ease-in-out ${
              sidebarOpen
                ? 'rotate-0 left-[50%] -translate-x-1/2'
                : 'rotate-180'
            }`}
            onClick={showHideSidebar}
          >
            <AiOutlineLeft className='w-[20px] h-[20px] text-blackText' />
          </button>
        </div>
        <div className='h-full w-full'>
          <div className='w-full h-[100px] flex px-[40px]'>
            <form
              onSubmit={handleSearch}
              className='w-full h-full flex items-center space-x-3'
            >
              <div className='w-full flex items-center bg-neutral-200 pl-4 rounded-full'>
                <AiOutlineSearch className='text-2xl text-cGray-300' />
                <input
                  ref={searchInputRef}
                  placeholder='Search for books'
                  type='text'
                  className='w-full outline-none bg-neutral-200 py-3 pl-2 pr-4 rounded-full'
                />
              </div>
              {/* <button
                type='submit'
                className='bg-primary text-white py-3 px-10 rounded-full'
              >
                Search
              </button> */}
            </form>
            <div className='w-[500px] h-full flex items-center space-x-4 justify-end'>
              <button type='button'>
                <MdNotificationsNone className='w-[25px] h-[25px] text-blackText' />
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
                  <div className='text-blackText font-medium'>
                    {username}
                  </div>
                </div>
              ) : (
                <button
                  type='button'
                  className='text-base font-medium text-blackText links'
                  onClick={authAction}
                >
                  Log in
                </button>
              )}
            </div>
          </div>
          {/* Separator */}
          <div className='w-full h-[1px] bg-cGray-200' />
          <div className='w-full h-[calc(100%-101px)] px-[40px] pt-[30px] pb-[40px] overflow-hidden'>
            {children}
          </div>
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
