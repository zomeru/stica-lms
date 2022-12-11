import React from 'react';
import Image from 'next/image';

const Deface = () => {
  const img = 'https://i.imgur.com/4c7tND8.jpg';

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center space-y-[15px] bg-black py-[50px] px-[10px]'>
      <div className='relative z-[10] mb-[30px] flex h-[220px] w-[220px] items-center justify-center rounded-full'>
        <div className='absolute h-full w-full rounded-full bg-red-500 blur-lg'></div>
        <div className='relative z-[20] h-[200px] w-[200px] overflow-hidden rounded-full'>
          <Image src={img} layout='fill' alt='Hacker' />
        </div>
      </div>

      <div className='flex flex-col items-center space-y-[15px]'>
        <h1
          style={{
            textShadow: `0 2px 10px #ff0000`,
          }}
          className='text-3xl font-semibold text-white'
        >
          Hacked by 4B53NC3
        </h1>
        <div className='h-[4px] w-[600px] bg-neutral-700'></div>
        <div
          style={{
            letterSpacing: '15px',
          }}
          className='text-sp flex space-x-10 text-xl font-medium '
        >
          <h2 className='text-sky-700'>TEAM</h2>
          <h2 className='text-sky-700'>COPYRIGHT™</h2>
        </div>
      </div>

      <p className='max-w-[700px] text-center text-red-500'>
        Attention: this website has been hacked by 4B53NC3. We have taken
        control of the site and its content. Your security measures were
        inadequate, and we have accessed your sensitive data. This is a
        warning to all websites: improve your security, or suffer the
        consequences.
      </p>
      <p className='text-sm font-extralight italic text-white'>
        We are copyright, we hack websites because we are bored.
      </p>
    </div>
  );
};

export default Deface;
