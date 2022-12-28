import React from 'react';
import Image from 'next/image';

import { capstone_team } from '@src/constants';

const About = () => {
  return (
    <section className='flex h-full w-full items-center justify-center'>
      <div className='space-y-5'>
        <div className='text-center'>
          <h1 className='text-primary mb-1 text-4xl font-black italic'>
            STICA LMS
          </h1>
          <p className='mx-auto max-w-[100%] text-sm text-neutral-700 sm:max-w-[700px] sm:text-base'>
            Stica LMS is an online library management system that helps
            students from STI College Alabang to make a borrow request and
            view their history from the library, it also helps the
            librarian to manage books and library reports easily.
          </p>
        </div>

        <div className='text-center text-neutral-700'>
          <p className='mb-1 text-sm sm:text-base'>
            Developed by awesome IT students of STI College Alabang
          </p>
          <div className='space-y-5 '>
            <div>
              <div className='relative mx-auto h-[80px] w-[80px] overflow-hidden rounded-full sm:h-[120px] sm:w-[120px]'>
                <Image
                  src={capstone_team[0].photo}
                  layout='fill'
                  quality={50}
                />
              </div>
              <div className='text-xs sm:text-sm md:text-base'>
                <p>{capstone_team[0].name}</p>
                <p>{capstone_team[0].role}</p>
              </div>
            </div>
            <div className='flex justify-center space-x-10'>
              {capstone_team.slice(1).map((member) => (
                <div key={member.name}>
                  <div className='relative mx-auto h-[80px] w-[80px]  overflow-hidden rounded-full sm:h-[120px] sm:w-[120px]'>
                    <Image src={member.photo} layout='fill' quality={50} />
                  </div>
                  <div className='text-xs sm:text-sm md:text-base'>
                    <p>{member.name}</p>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
