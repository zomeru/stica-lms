import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineClose } from 'react-icons/ai';
import { IconType } from 'react-icons';

import { useRouter } from 'next/router';

Modal.setAppElement('#__next');

const modalCustomStyle = {
  content: {
    top: '0',
    right: '0',
    bottom: '0',
    left: 'auto',
    zIndex: 999,
    width: 'auto',
    height: '100vh',
    backgroundColor: 'white',
    padding: '0',
  },
};

interface MenuProps {
  sidebarItems: {
    name: string;
    Icon: IconType;
  }[];
  handleSidebarItemClick: (name: string) => void;
}

const Menu = ({ sidebarItems, handleSidebarItemClick }: MenuProps) => {
  const router = useRouter();

  const [burgerOpen, setBurgerOpen] = useState(false);

  useEffect(() => {
    if (burgerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  }, [burgerOpen]);

  return (
    <div className='lg:hidden'>
      <button type='button' onClick={() => setBurgerOpen(true)}>
        <GiHamburgerMenu className='h-[30px] w-[30px] text-neutral-800' />
      </button>
      <Modal
        isOpen={burgerOpen}
        onRequestClose={() => setBurgerOpen(() => false)}
        contentLabel='Burger Menu'
        style={modalCustomStyle}
        closeTimeoutMS={200}
      >
        <div className='flex h-full flex-col items-center justify-between'>
          <div className='flex flex-col items-center'>
            {sidebarItems.map(({ name, Icon }) => {
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
                <button
                  type='button'
                  key={name}
                  className={`hover:bg-primary w-full py-4 px-10 transition-all ease-in-out hover:text-white ${
                    isActive ? 'bg-primary text-white' : 'text-neutral-600'
                  }`}
                  onClick={() => {
                    if (isActive && !router.query.bookId) return;
                    handleSidebarItemClick(name);
                    setBurgerOpen(false);
                  }}
                >
                  <div className='flex items-center space-x-3'>
                    <Icon className='text-lg' />
                    <p className='font-medium'>{name}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type='button'
            className='flex w-full items-center justify-center py-4 text-center text-neutral-800 transition-all hover:bg-red-600 hover:text-white'
            onClick={() => setBurgerOpen(false)}
          >
            <AiOutlineClose className='h-[30px] w-[30px]' />
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;
