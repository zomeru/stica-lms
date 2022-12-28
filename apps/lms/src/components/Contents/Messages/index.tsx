import React from 'react';
import Image from 'next/image';
import {
  collection,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import TimeAgo from 'javascript-time-ago';
import { useRouter } from 'next/router';

import { ChatMates } from '@lms/types';
import { useCol, useNextQuery, useWindowDimensions } from '@lms/ui';
import { db } from '@lms/db';
import { useAuth } from '@src/contexts';

import Conversation from './Conversation';

const Messages = () => {
  const timeAgo = new TimeAgo('en-US');
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const chatId = useNextQuery('chatId');

  const [messages, messageLoading] = useCol<ChatMates>(
    query(
      collection(db, 'messages'),
      where('userId', '==', user?.id || 'default'),
      orderBy('lastMessageTimestamp', 'desc')
    )
  );

  console.log('messages', messages);

  const onChatMateClick = async (chatMateId: string) => {
    const allQueries: any = {
      ...router.query,
      chatId: chatMateId,
    };

    router.push(
      {
        pathname: '/',
        query: allQueries,
      },
      undefined,
      { shallow: true }
    );

    if (!chatMateId) return;

    try {
      const messageRef = doc(db, 'messages', chatMateId);
      await updateDoc(messageRef, {
        userOpened: true,
      });
    } catch (error) {
      console.log('error updating doc', error);
    }
  };

  return (
    <section className='relative flex h-full w-full'>
      <div
        className={`h-full w-full space-y-[15px] transition-all duration-200 ease-in-out sm:w-[300px] lg:w-[400px] ${
          chatId && width < 640 ? '-translate-x-[105%]' : '-translate-x-0'
        }`}
      >
        {/* <input
          type='text'
          className='border-cGray-200 mx-auto h-[40px] w-[90%] rounded-full border px-3 outline-none'
          placeholder='Search user'
        /> */}
        <div className='custom-scrollbar h-[calc(100%)] w-full overflow-y-scroll'>
          {!messageLoading && messages && messages.length > 0 ? (
            messages.map((message) => {
              const createdAt = message.lastMessageTimestamp
                ? message.lastMessageTimestamp.toDate().toLocaleString()
                : new Date();
              const date = new Date(createdAt);
              const ago = timeAgo.format(date);
              return (
                <button
                  key={message.id}
                  className='flex h-[65px] w-full space-x-2 rounded-md p-1 hover:bg-sky-100'
                  type='button'
                  onClick={() => onChatMateClick(message.id)}
                >
                  <div className='relative my-auto h-[50px] w-[50px] overflow-hidden rounded-full'>
                    <Image
                      src='https://firebasestorage.googleapis.com/v0/b/stica-lms.appspot.com/o/stica%2FSTI_LOGO.png?alt=media&token=2a5f406c-9e29-41de-be02-16f830682691'
                      layout='fill'
                      objectFit='cover'
                      objectPosition='center'
                    />
                  </div>
                  <div className='flex h-full w-[calc(100%-50px)] flex-col justify-center text-left text-sm'>
                    <p
                      className={
                        message.userOpened
                          ? 'font-medium text-neutral-700'
                          : 'font-semibold'
                      }
                    >
                      Admin
                    </p>
                    <p
                      className={`line-clamp-1 flex text-xs ${
                        message.userOpened
                          ? 'text-neutral-500'
                          : 'font-semibold text-sky-700'
                      }`}
                    >
                      {message.lastSender !== 'admin' && 'You: '}
                      {message.lastMessageText}
                    </p>
                    <p
                      className={`line-clamp-1 flex text-xs ${
                        message.userOpened && 'text-neutral-500'
                      }`}
                    >
                      {ago === 'in a moment' ? 'just now' : ago}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <button
              className='flex h-[65px] w-full space-x-2 rounded-md p-1 hover:bg-sky-100'
              type='button'
              onClick={() => {
                const allQueries: any = {
                  ...router.query,
                  chatId: 'default',
                };

                router.push(
                  {
                    pathname: '/',
                    query: allQueries,
                  },
                  undefined,
                  { shallow: true }
                );
              }}
            >
              <div className='relative my-auto h-[50px] w-[50px] overflow-hidden rounded-full'>
                <Image
                  src='https://firebasestorage.googleapis.com/v0/b/stica-lms.appspot.com/o/stica%2FSTI_LOGO.png?alt=media&token=2a5f406c-9e29-41de-be02-16f830682691'
                  layout='fill'
                  objectFit='cover'
                  objectPosition='center'
                />
              </div>
              <div className='flex h-full w-[calc(100%-50px)] flex-col justify-center text-left text-sm'>
                <p className='font-semibold'>Admin</p>
                <p
                  className={`line-clamp-1 flex text-xs ${
                    chatId === 'default'
                      ? 'text-neutral-500'
                      : 'font-semibold text-sky-700'
                  }`}
                >
                  Message admin here
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
      <div
        className={`absolute top-[0px] right-0  h-full w-full transition-all duration-200 ease-in-out sm:static sm:w-[calc(100%-300px)] lg:w-[calc(100%-400px)] ${
          !chatId && width < 640 ? 'translate-x-[100%]' : 'translate-x-0'
        }`}
      >
        {chatId ? (
          <Conversation
            chatId={chatId}
            messageData={
              messages?.filter((message) => message.id === chatId)[0]
            }
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-center text-xl text-neutral-600'>
            Select a chat or start a new conversation
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;
