import React from 'react';

const Contact = () => {
  return (
    <section className='w-full h-full '>
      <form
        action=''
        className='h-full w-full bg-neutral-200 p-8 rounded-2xl flex flex-col justify-between'
        onSubmit={() => {}}
      >
        <div>
          <h3 className='text-2xl font-semibold text-primary mb-4'>
            Contact
          </h3>
          <div className='h-[5px] w-[100px] bg-primary' />
        </div>
        <div className='space-y-6 my-6 w-full flex flex-col justify-between h-full text-textBlack'>
          <div className='flex flex-col space-x-0 space-y-3 md:flex-row md:space-y-0 md:space-x-3'>
            <input
              className='py-2 px-3 outline-none w-full rounded-lg'
              type='text'
              placeholder='First Name'
              required
            />
            <input
              className='py-2 px-3 outline-none w-full rounded-lg'
              type='text'
              placeholder='Last Name'
            />
          </div>
          <div className='flex flex-col space-x-0 space-y-3 md:flex-row md:space-y-0 md:space-x-3'>
            <input
              className='py-2 px-3 outline-none w-full rounded-lg'
              type='text'
              placeholder='Student email'
              required
            />
            <input
              className='py-2 px-3 outline-none w-full rounded-lg'
              type='text'
              placeholder='Student number'
            />
          </div>

          <textarea
            className='w-full h-full py-2 px-3 outline-none rounded-lg'
            cols={1}
            rows={5}
            placeholder='Message'
            required
          />
        </div>
        <div>
          <button
            type='button'
            className='bg-primary text-white px-3 py-2 rounded-lg hover:bg-primaryLight duration-300 transition-colors'
          >
            Send Message
          </button>
        </div>
      </form>
    </section>
  );
};

export default Contact;
