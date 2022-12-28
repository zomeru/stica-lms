import React, { useState, useRef, useEffect } from 'react';
import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import { AiOutlineSend, AiOutlineArrowLeft } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import ReactTooltip from 'react-tooltip';
import { useRouter } from 'next/router';
import { BsCheckAll } from 'react-icons/bs';

import { db } from '@lms/db';
import { ChatMates, ChatMessage } from '@lms/types';
import { useCol, formatDate } from '@lms/ui';
import { useAuth } from '@src/contexts';

interface ConversationProps {
  chatId: string;
  messageData?: ChatMates;
}

const Conversation = ({ chatId, messageData }: ConversationProps) => {
  const msgRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [conversation, loading] = useCol<ChatMessage>(
    query(
      collection(db, `messages/${chatId}/data`),
      orderBy('createdAt', 'desc')
    )
  );

  const seenMessage = async () => {
    if (!messageData?.userOpened) {
      try {
        const messageRef = doc(db, 'messages', chatId);
        await updateDoc(messageRef, {
          userOpened: true,
        });
      } catch (error) {
        console.log(error);
      }

      console.log('seen message');
    }
  };

  useEffect(() => {
    msgRef.current?.scrollTo({
      top: msgRef.current?.scrollHeight,
    });

    seenMessage();
  }, [chatId, messageData, conversation, loading]);

  const handleScroll = async (
    e: React.UIEvent<HTMLDivElement, UIEvent>
  ) => {
    const bottom =
      // @ts-ignore
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if (bottom) {
      seenMessage();
    }
  };

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!message || isSending) return;

    setIsSending(true);

    try {
      const timestamp = serverTimestamp();

      if (chatId === 'default') {
        const convoRef = collection(db, `messages`);
        const newConvo = await addDoc(convoRef, {
          userOpened: true,
          adminOpened: false,
          lastMessageText: message.trim(),
          lastMessageTimestamp: timestamp,
          userId: user?.id,
          userName: `${user?.givenName} ${user?.surname}`,
          userPhoto: user?.photo.url,
        });

        const messageRef = collection(db, `messages/${newConvo.id}/data`);
        await addDoc(messageRef, {
          text: message.trim(),
          createdAt: timestamp,
          sender: 'admin',
        });

        const allQueries: any = {
          ...router.query,
          chatId: newConvo.id,
        };

        router.push(
          {
            pathname: '/',
            query: allQueries,
          },
          undefined,
          { shallow: true }
        );

        setMessage('');
        setIsSending(false);
        return;
      }

      const convoRef = collection(db, `messages/${chatId}/data`);

      await addDoc(convoRef, {
        createdAt: timestamp,
        senderId: user?.id,
        text: message.trim(),
      });

      // update the last message timestamp
      const messageRef = doc(db, 'messages', chatId);
      await updateDoc(messageRef, {
        lastSender: user?.id,
        lastMessageTimestamp: timestamp,
        adminOpened: false,
        lastMessageText: message.trim(),
      });

      setMessage('');
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
      console.log('error sending message', error);
      toast.error('Unable to send message! Please try again.');
    }

    msgRef.current?.scrollTo({
      top: msgRef.current?.scrollHeight,
    });

    // bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    const allQueries: any = {
      ...router.query,
    };
    delete allQueries.chatId;

    router.push(
      {
        pathname: '/',
        query: allQueries,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className='h-full w-full'>
      <div className='border-cGray-200 ml-3 flex items-center space-x-3 border-b bg-white pb-[6px]'>
        <button
          type='button'
          className='block sm:hidden'
          onClick={handleBack}
        >
          <AiOutlineArrowLeft className='text-primary text-3xl' />
        </button>
        <div className='relative h-[50px] w-[50px] overflow-hidden rounded-full'>
          <Image
            src='https://firebasestorage.googleapis.com/v0/b/stica-lms.appspot.com/o/stica%2FSTI_LOGO.png?alt=media&token=2a5f406c-9e29-41de-be02-16f830682691'
            layout='fill'
          />
        </div>
        <div>Admin</div>
      </div>
      <div className='h-[calc(100%-56px)] pl-3'>
        <div
          ref={msgRef}
          className='custom-scrollbar flex h-[calc(100%-50px)] w-full flex-col space-y-2 overflow-y-scroll text-sm'
          onScroll={handleScroll}
        >
          {conversation && conversation.length > 0 ? (
            [...conversation].reverse().map((convo, index) => {
              const isPreviousSenderUser = [...conversation].reverse()[
                index - 1
              ]
                ? [...conversation].reverse()[index - 1].senderId !==
                  'admin'
                : false;
              const isNextSenderUser = [...conversation].reverse()[
                index + 1
              ]
                ? [...conversation].reverse()[index + 1].senderId !==
                  'admin'
                : false;
              const isLastMessageAdmin =
                [...conversation].reverse()[conversation.length - 1]
                  .senderId === 'admin' &&
                index === conversation.length - 1;

              const simpleDate = convo.createdAt
                ? formatDate(
                    convo.createdAt.toDate().toLocaleString(),
                    true
                  )
                : '';

              if (convo.senderId !== 'admin') {
                return (
                  <div
                    className='bg-primary mr-2 mt-auto w-fit max-w-[80%] self-end rounded-xl px-3 py-2 text-white'
                    key={convo.id}
                  >
                    <ReactTooltip id={convo.id} />
                    <p
                      className='whitespace-pre-wrap break-words'
                      data-for={convo.id}
                      data-tip={simpleDate}
                    >
                      {convo.text}
                    </p>
                  </div>
                );
              } else {
                if (
                  (isPreviousSenderUser && isNextSenderUser) ||
                  isNextSenderUser ||
                  isLastMessageAdmin
                ) {
                  return (
                    <div
                      key={convo.id}
                      className='mt-auto flex max-w-[calc(80%+35px)] items-center'
                    >
                      <div className='relative mt-auto h-[30px]  w-[30px] overflow-hidden rounded-full'>
                        <Image
                          src='https://firebasestorage.googleapis.com/v0/b/stica-lms.appspot.com/o/stica%2FSTI_LOGO.png?alt=media&token=2a5f406c-9e29-41de-be02-16f830682691'
                          layout='fill'
                        />
                      </div>
                      <ReactTooltip id={convo.id} />
                      <p
                        data-for={convo.id}
                        data-tip={simpleDate}
                        className='bg-cGray-200 ml-[5px] w-fit  self-start whitespace-pre-wrap break-words rounded-xl px-3 py-2'
                      >
                        {convo.text}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div
                      className='bg-cGray-200 mt-auto ml-[35px] w-fit max-w-[80%] self-start whitespace-pre-wrap break-words rounded-lg px-3 py-2'
                      key={convo.id}
                    >
                      <ReactTooltip id={convo.id} />
                      <p
                        className=''
                        data-for={convo.id}
                        data-tip={simpleDate}
                      >
                        {convo.text}
                      </p>
                    </div>
                  );
                }
              }
            })
          ) : (
            <div className='flex h-full w-full items-center justify-center text-neutral-600'>
              <p>Send a message to start a conversation</p>
            </div>
          )}

          {/* {isSending && (
            <div className='bg-primary mr-2 mt-auto w-fit self-end rounded-full px-3 py-2 text-white'>
              <ReactTooltip id='current-message' />
              <p data-for='current-message' data-tip='sample'>
                {message}
              </p>
            </div>
          )} */}
          {messageData?.lastSender !== 'admin' &&
            messageData?.adminOpened && (
              <div className='mr-2 flex items-center space-x-1 self-end text-neutral-600'>
                <p className='text-xs'>Seen</p>
                <BsCheckAll />
              </div>
            )}
          <div ref={bottomRef} />
        </div>
        <form
          className='flex h-[60px] items-center space-x-2'
          onSubmit={handleSendMessage}
        >
          <input
            type='text'
            className='border-cGray-200 h-[40px] w-full rounded-full border px-3 text-sm outline-none'
            placeholder='Type your message here'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type='submit'>
            <AiOutlineSend className='text-primary h-[40px] w-[40px]' />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;
