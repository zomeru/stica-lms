import { useState } from 'react';

type Selected = 'All' | 'Selected';

const SendNotification = () => {
  const [selected, setSelected] = useState<Selected>('All');

  return (
    <section className='h-full w-full'>
      <div>
        {/* <h1 className='text-4xl'>Send Notification</h1> */}
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => setSelected('All')}
            className='border-primary flex items-center space-x-2 rounded-2xl border px-4 py-2 text-center'
            type='button'
          >
            <div
              className={
                selected === 'All' ? 'text-primary' : 'text-neutral-500'
              }
            >
              All users
            </div>
            <div
              className={`h-[15px] w-[15px] rounded-full ${
                selected === 'All' ? 'bg-primary' : 'border-primary border'
              }`}
            />
          </button>
          <button
            onClick={() => setSelected('Selected')}
            className='border-primary flex items-center space-x-2 rounded-2xl border px-4 py-2 text-center'
            type='button'
          >
            <div
              className={
                selected === 'Selected'
                  ? 'text-primary'
                  : 'text-neutral-500'
              }
            >
              Selected users
            </div>
            <div
              className={`h-[15px] w-[15px] rounded-full ${
                selected === 'Selected'
                  ? 'bg-primary'
                  : 'border-primary border'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SendNotification;
