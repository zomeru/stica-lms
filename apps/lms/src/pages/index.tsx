import React from 'react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useUser } from '@src/hooks';

const Profile = dynamic(() => import('@src/components/profile'), {
  ssr: false,
});
const SignButton = dynamic(() => import('@src/components/signButton'), {
  ssr: false,
});

const Home: NextPage = () => {
  const { user } = useUser();
  console.log('user', user);

  return (
    <div className='bg-neutral-500 flex min-h-screen min-w-screen items-center justify-center flex-col space-y-3'>
      <Profile />
      <SignButton />
    </div>
  );
};

export default Home;
