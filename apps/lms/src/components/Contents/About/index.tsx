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
          <p className='mx-auto max-w-[700px] text-neutral-700'>
            Stica LMS is an online library management system that helps
            students from STI College Alabang to make a borrow request and
            view their history from the library, it also helps the
            librarian to manage books and library reports easily.
          </p>
        </div>

        <div className='text-center text-neutral-700'>
          <p className='mb-1'>
            Developed by awesome IT students of STI College Alabang
          </p>
          <div className='space-y-5'>
            <div>
              <div className='relative mx-auto h-[120px] w-[120px] overflow-hidden rounded-full'>
                <Image
                  src={capstone_team[0].photo}
                  layout='fill'
                  quality={50}
                />
              </div>
              <div className='text-sm'>
                <p>{capstone_team[0].name}</p>
                <p>{capstone_team[0].role}</p>
              </div>
            </div>
            <div className='flex justify-center space-x-10'>
              {capstone_team.slice(1).map((member) => (
                <div key={member.name}>
                  <div className='relative mx-auto h-[120px] w-[120px] overflow-hidden rounded-full'>
                    <Image src={member.photo} layout='fill' quality={50} />
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
