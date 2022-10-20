import Image from 'next/image';
import React from 'react';

export const NotFound = () => {
  return (
    <section className='w-full h-full flex justify-center items-center'>
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <div className='relative w-[500px] h-[300px] 2xl:w-[700px] 2xl:h-[450px]'>
          <Image
            src='/assets/images/not_found.png'
            layout='fill'
            alt='not found'
            objectFit='contain'
            blurDataURL='/assets/images/empty.png'
            placeholder='blur'
            quality={50}
          />
        </div>
        <div className='text-center text-4xl font-bold text-cGray-300'>
          Page Not Found
        </div>
      </div>
    </section>
  );
};
