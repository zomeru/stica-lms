import { useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from 'db';
import { useUser } from '@src/contexts';
import { useRouter } from 'next/router';

const useAuth = () => {
  const { setUser } = useUser();
  const router = useRouter();

  const [error, setError] = useState('');

  const login = (username: string, password: string) => {
    signInWithEmailAndPassword(
      auth,
      `${username.trim()}@sticalms.com`,
      password.trim()
    )
      .then((userCredential) => {
        const { user } = userCredential;
        setUser(user);
        // router.push('/dashboard');
      })
      .catch((loginError) => {
        const errorMessage = loginError.message;

        if (!username || !password) {
          setError('Username and password are required');
          return;
        }

        if (
          errorMessage.includes('user-not-found') ||
          errorMessage.includes('invalid-email')
        ) {
          setError('Invalid username or password');
        } else {
          setError('Something went wrong! Please try again later.');
        }
      });
  };

  const register = (username: string, password: string) => {
    createUserWithEmailAndPassword(
      auth,
      `${username.trim()}@sticalms.com`,
      password.trim()
    )
      .then((userCredential) => {
        const { user } = userCredential;
        setUser(user);
        // router.push('/dashboard');
      })
      .catch((registerError) => {
        const errorMessage = registerError.message;

        if (errorMessage.includes('email-already-in-use')) {
          setError('Username already exists');
        } else {
          setError('Something went wrong! Please try again later.');
        }

        console.log('register error', errorMessage);
      });
  };

  const logout = () => {
    auth.signOut();
    setUser({} as User);
    router.push('/');
  };

  return {
    login,
    register,
    logout,
    error,
  };
};

export default useAuth;
