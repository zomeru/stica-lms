import React, { useState } from 'react';

const Notifications = () => {
  const [selected, setSelected] = useState('messages');

  const handleMessageClick = () => {
    setSelected('messages');
  };

  const handleNotificationClick = () => {
    setSelected('notifications');
  };

  return (
    <section className='w-full h-full space-y-3'>
      <div className='flex w-full h-[50px] rounded-xl overflow-hidden'>
        <button
          type='button'
          className={`w-[50%] ${
            selected === 'messages'
              ? 'bg-primaryLight text-white'
              : 'bg-neutral-200 text-textBlack'
          }`}
          onClick={handleMessageClick}
        >
          Notifications
        </button>
        <button
          type='button'
          className={`w-[50%] ${
            selected === 'notifications'
              ? 'bg-primaryLight text-white'
              : 'bg-neutral-200 text-textBlack'
          }`}
          onClick={handleNotificationClick}
        >
          Notifications
        </button>
      </div>
      <div className='w-full h-[calc(100%-50px)]'>
        {selected === 'messages' ? (
          <div className='w-full h-full rounded-xl bg-neutral-200  flex items-center justify-center text-2xl'>
            Messages
          </div>
        ) : (
          <div className='w-full h-full rounded-xl bg-neutral-200 flex items-center justify-center text-2xl'>
            Notifications
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
