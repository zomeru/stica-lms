import { FormEvent, useState } from 'react';
import type { NextPage } from 'next';

import { Layout } from 'ui';
import { useSidebar, useUser } from '@src/contexts';
import useAuth from '@src/hooks/useAuth';
import { adminSidebarItems } from '@src/constants';

const Home: NextPage = () => {
  const { user, loading } = useUser();
  const { login, error, logout } = useAuth();
  const { sidebarOpen, showHideSidebar } = useSidebar();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(username, password);
  };

  if (!loading && user.uid) {
    return (
      <Layout
        sidebarOpen={sidebarOpen}
        showHideSidebar={showHideSidebar}
        isAuthenticated={!!user.uid}
        sidebarItems={adminSidebarItems}
        authAction={logout}
        username='Admin'
        showSearch={false}
        userPhoto='/assets/images/STI_LOGO.png'
        topBar={<div>top bar</div>}
      >
        <div>asdasdasd</div>
      </Layout>
    );
  }

  if (!loading && !user.uid) {
    return (
      <div className='flex flex-col min-h-screen min-w-screen items-center justify-center'>
        <form
          className='space-y-3 bg-primary rounded-lg p-10 max-w-[350px]'
          onSubmit={handleSubmit}
        >
          <div className='text-xl font-medium text-white text-center'>
            STICA LMS - Admin
          </div>
          <div className='flex flex-col space-y-2'>
            <input
              type='text'
              className='bg-white w-full outline-none px-3 py-2 rounded-lg'
              placeholder='Username'
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
            <input
              type='password'
              className='bg-white w-full outline-none px-3 py-2 rounded-lg'
              placeholder='Password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <button
              type='submit'
              className='text-primary font-medium w-full px-3 py-2 rounded-lg bg-white'
            >
              Login
            </button>
          </div>
          {error && (
            <div className='text-red-500 text-center'>{error}</div>
          )}
        </form>
      </div>
    );
  }

  return null;
};

export default Home;
