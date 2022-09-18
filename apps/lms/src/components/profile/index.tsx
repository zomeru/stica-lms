import React from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { usePhoto } from '@src/hooks';

const Profile = () => {
  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { photo } = usePhoto();

  console.log('accounts', accounts);

  return (
    <div className='flex items-center justify-center flex-col space-y-3'>
      {isAuthenticated && (
        <>
          <div className='text-white font-medium text-3xl'>
            You are now signed in
          </div>
          <div className='text-white font-medium text-lg'>
            Name: {`${accounts[0].name?.replaceAll('(Student)', '')}`}
          </div>
          <div className='text-white font-medium text-lg'>
            Email: {accounts[0].username}
          </div>
          <img
            className='w-32 h-32 rounded-full'
            src={photo || 'https://i.imgur.com/N7EmcCY.jpg'}
            alt='User'
          />
        </>
      )}

      {!isAuthenticated && (
        <div className='text-white font-medium text-2xl'>
          Please sign in to see your profile
        </div>
      )}
    </div>
  );
};

export default Profile;
