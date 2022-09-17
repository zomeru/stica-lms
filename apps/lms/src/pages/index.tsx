import type { NextPage } from 'next';
import { Button } from 'ui';

const Home: NextPage = () => {
  return (
    <div className='flex min-h-screen min-w-screen items-center justify-center '>
      <Button />
      <div className='text-black'>
        {process.env.NEXT_PUBLIC_ZOMER?.toString()}
      </div>
    </div>
  );
};

export default Home;
