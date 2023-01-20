import React, { useState } from 'react';
import Image from 'next/image';
import {
  collection,
  doc,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import TimeAgo from 'javascript-time-ago';
import { useRouter } from 'next/router';

import { AlgoUserDoc, ChatMates } from '@lms/types';
import { useAlgoData, useCol, useNextQuery } from '@lms/ui';
import { db } from '@lms/db';

import Conversation from './Conversation';

const Messages = () => {
  const timeAgo = new TimeAgo('en-US');
  const router = useRouter();

  const chatId = useNextQuery('chatId');
  const [userSearch, setUserSearch] = useState<string>('');
  const [newUserData, setNewUserData] = useState<ChatMates | undefined>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchedUsers, setSearchUsers, _, usersLoading] =
    useAlgoData<AlgoUserDoc>('users', undefined, userSearch);

  const [messages, messageLoading] = useCol<ChatMates>(
    query(
      collection(db, 'messages'),
      orderBy('lastMessageTimestamp', 'desc')
    )
  );

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
        adminOpened: true,
      });
    } catch (error) {
      console.log('error updating doc', error);
    }
  };

  const searchedUserClick = async (newUser: AlgoUserDoc) => {
    const hasMessageHistory = messages?.find(
      (message) => message.userId === newUser.objectID
    );
    if (hasMessageHistory) {
      onChatMateClick(hasMessageHistory.id);
      setUserSearch('');
    } else {
      setNewUserData({
        userPhoto: newUser.photo.url,
        userName: `${newUser.givenName} ${newUser.surname}`,
        userId: newUser.objectID,
      } as ChatMates);

      const allQueries: any = {
        ...router.query,
        chatId: 'new',
      };

      router.push(
        {
          pathname: '/',
          query: allQueries,
        },
        undefined,
        { shallow: true }
      );

      setUserSearch('');
    }
  };

  return (
    <section className='flex h-full w-full'>
      <div className='h-full w-[300px] space-y-[15px] lg:w-[400px]'>
        <input
          type='text'
          className='border-cGray-200 mx-auto h-[40px] w-[90%] rounded-full border px-3 outline-none'
          placeholder='Search user'
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />
        <div className='custom-scrollbar h-[calc(100%-55px)] w-full overflow-y-scroll'>
          {!userSearch && (
            <>
              {!messageLoading && messages && messages.length > 0 ? (
                messages.map((message) => {
                  const createdAt = message.lastMessageTimestamp
                    ? message.lastMessageTimestamp
                        .toDate()
                        .toLocaleString()
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
                          src={message.userPhoto}
                          layout='fill'
                          objectFit='cover'
                          objectPosition='center'
                        />
                      </div>
                      <div className='flex h-full w-[calc(100%-50px)] flex-col justify-center text-left text-sm'>
                        <p
                          className={
                            message.adminOpened
                              ? 'font-medium text-neutral-700'
                              : 'font-semibold'
                          }
                        >
                          {message.userName}
                        </p>
                        <p
                          className={`line-clamp-1 flex text-xs ${
                            message.adminOpened
                              ? 'text-neutral-500'
                              : 'font-semibold text-sky-700'
                          }`}
                        >
                          {message.lastSender === 'admin' && 'You: '}
                          {message.lastMessageText}
                        </p>
                        <p
                          className={`line-clamp-1 flex text-xs ${
                            message.adminOpened && 'text-neutral-500'
                          }`}
                        >
                          {ago === 'in a moment' ? 'just now' : ago}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className='text-neutral-600'>No recent messages</div>
              )}
            </>
          )}
          {userSearch && (
            <>
              {!usersLoading &&
              searchedUsers &&
              searchedUsers.length > 0 ? (
                searchedUsers.map((user) => {
                  return (
                    <button
                      key={user.objectID}
                      className='flex h-[65px] w-full space-x-2 rounded-md p-1 hover:bg-sky-100'
                      type='button'
                      onClick={() => searchedUserClick(user)}
                    >
                      <div className='relative my-auto h-[50px] w-[50px] overflow-hidden rounded-full'>
                        <Image
                          src={user.photo.url}
                          layout='fill'
                          objectFit='cover'
                          objectPosition='center'
                        />
                      </div>
                      <div className='flex h-full w-[calc(100%-50px)] flex-col justify-center text-left text-sm'>
                        {`${user.givenName} ${user.surname}`}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className='text-neutral-600'>No users found</div>
              )}
            </>
          )}
        </div>
      </div>
      <>
        {chatId ? (
          <Conversation
            chatId={chatId}
            messageData={
              chatId === 'new'
                ? newUserData
                : messages?.filter((message) => message.id === chatId)[0]
            }
          />
        ) : (
          <div className='flex h-full w-[calc(100%-300px)] items-center justify-center text-center text-xl text-neutral-600 lg:w-[calc(100%-400px)]'>
            Select a chat or start a new conversation
          </div>
        )}
      </>
    </section>
  );
};

export default Messages;
