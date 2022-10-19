import React from 'react';
import Image from 'next/image';

import { capstone_team } from '@src/constants';

const About = () => {
  return (
    <section className='w-full h-full flex justify-center items-center'>
      <div className='space-y-5'>
        <div className='text-center'>
          <h1 className='text-4xl font-black text-primary italic mb-1'>
            STICA LMS
          </h1>
          <p className='max-w-[700px] mx-auto text-neutral-700'>
            Stica LMS is an online library management system that helps
            students from STI College Alabang to make a borrow request and
            view their history in the library, it also helps the librarian
            to manage books and library reports easily.
          </p>
        </div>

        <div className='text-center text-neutral-700'>
          <p className='mb-1'>
            Developed by awesome IT students of STI College Alabang
          </p>
          <div className='space-y-5'>
            <div>
              <div className='relative w-[120px] h-[120px] mx-auto rounded-full overflow-hidden'>
                <Image src={capstone_team[0].photo} layout='fill' />
              </div>
              <div className='text-sm'>
                <p>{capstone_team[0].name}</p>
                <p>{capstone_team[0].role}</p>
              </div>
            </div>
            <div className='flex justify-center space-x-10'>
              {capstone_team.slice(1).map((member) => (
                <div key={member.name}>
                  <div className='relative w-[120px] h-[120px] mx-auto rounded-full overflow-hidden'>
                    <Image src={member.photo} layout='fill' />
                  </div>
                  <div className='text-sm'>
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
