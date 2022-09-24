import React from 'react';
import type { NextPage } from 'next';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

import { usePhoto } from '@src/hooks';
import { loginRequest } from '@src/config';

const Home: NextPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();
  const { photo } = usePhoto();

  const loggedIn = isAuthenticated && accounts.length > 0;

  const loginHandler = () => {
    instance.loginRedirect(loginRequest);
  };

  const logoutHandler = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
    });
  };

  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center'>
      <h1 className='mb-[20px] text-xl font-bold'>
        STICA LMS - Mobile version
      </h1>

      {loggedIn && (
        <div className='flex flex-col items-center justify-center'>
          <img
            src={photo || 'https://i.imgur.com/N7EmcCY.jpg'}
            alt='Profile'
            className='w-20 h-20 rounded-full'
          />
          <p className='mt-2 text-lg font-semibold'>
            {accounts[0]?.name?.replace(' (Student)', '')}
          </p>
          <p className='mt-2 text-lg font-semibold'>
            {accounts[0].username}
          </p>
        </div>
      )}
      <button
        type='button'
        className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md'
        onClick={loggedIn ? logoutHandler : loginHandler}
      >
        {loggedIn ? 'Log out' : 'Log in'}
      </button>
    </div>
  );
};

export default Home;
