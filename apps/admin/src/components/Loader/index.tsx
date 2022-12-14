import React from 'react';

const Loader = ({ message }: { message?: string }) => {
  return (
    <div className='flex flex-col items-center justify-center w-full space-y-2'>
      <div className='flex p-3 space-x-2 rounded-full loader'>
        <div className='loader-circle' />
        <div className='loader-circle' />
        <div className='loader-circle' />
      </div>
      <p className='text-lg font-medium text-gray-500'>
        {message || 'Loading...'}
      </p>
    </div>
  );
};

export default Loader;
