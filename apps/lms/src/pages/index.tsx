import type { NextPage } from 'next';
import { Button } from 'ui';

const Home: NextPage = () => {
  return (
    <div className='flex min-h-screen min-w-screen items-center justify-center flex-col space-y-3'>
      <Button />
      <div>Student - Stica LMS</div>
    </div>
  );
};

export default Home;
