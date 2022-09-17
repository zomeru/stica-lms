import type { NextPage } from 'next';
import { Button } from 'ui';

const Home: NextPage = () => {
  return (
    <div className='flex flex-col min-h-screen min-w-screen items-center justify-center space-y-3'>
      <Button />
      <div>Admin - Stica LMS</div>
    </div>
  );
};

export default Home;
