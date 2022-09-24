import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const NotFoundPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, []);

  return <div />;
};

export default NotFoundPage;
