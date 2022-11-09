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
  },
};

interface MenuProps {
  sidebarItems: {
    name: string;
    Icon: IconType;
  }[];
}

const Menu = ({ sidebarItems }: MenuProps) => {
  const router = useRouter();

  const [burgerOpen, setBurgerOpen] = useState(false);

  useEffect(() => {
    if (burgerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  }, [burgerOpen]);

  const handleLinkClick = (link: string) => {
    router.push(link, undefined, { shallow: true });
  };

  return (
    <div className='md:hidden'>
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
          <div className='flex flex-col items-center space-y-3 px-5'></div>
          <button
            type='button'
            className='mb-10 text-center'
            onClick={() => setBurgerOpen(false)}
          >
            <AiOutlineClose className='h-[30px] w-[30px] text-neutral-800' />
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;
