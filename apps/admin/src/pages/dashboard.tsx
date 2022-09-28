import React from 'react';

import { useUser } from '@src/contexts';
import useAuth from '@src/hooks/useAuth';

const Dashboard = () => {
  const { user } = useUser();
  const { logout } = useAuth();

  return (
    <div className='flex flex-col min-h-screen min-w-screen items-center justify-center space-y-3'>
      <h1>Dashboard</h1>
      <div>username: {user.email?.replace('@sticalms.com', '')}</div>
      <div>uid: {user.uid}</div>
      <button
        type='button'
        className='bg-primary text-white px-3 py-2'
        onClick={logout}
      >
        Sign out
      </button>
    </div>
  );
};

export default Dashboard;
