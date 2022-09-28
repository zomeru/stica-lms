import { FormEvent, useState } from 'react';
import type { NextPage } from 'next';

import { useUser } from '@src/contexts';
import useAuth from '@src/hooks/useAuth';

const Home: NextPage = () => {
  const { user, loading } = useUser();
  const { login, error } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(username, password);
  };

  if (!loading && !user.uid) {
    return (
      <div className='flex flex-col min-h-screen min-w-screen items-center justify-center space-y-3'>
        <div className='text-lg font-medium'>STICA LMS - Admin</div>
        <form className='flex flex-col space-y-2' onSubmit={handleSubmit}>
          <input
            type='text'
            className='bg-neutral-300 outline-none px-3 py-2'
            placeholder='Username'
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
          <input
            type='password'
            className='bg-neutral-300 outline-none px-3 py-2'
            placeholder='Password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <button
            type='submit'
            className='bg-primary text-white px-3 py-2'
          >
            Login
          </button>
        </form>
        {error && <div className='text-red-500'>{error}</div>}
      </div>
    );
  }

  return null;
};

export default Home;
