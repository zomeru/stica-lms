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
import { AiOutlineSend } from 'react-icons/ai';
import { BsCheckAll } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import ReactTooltip from 'react-tooltip';
import { useRouter } from 'next/router';

import { ChatMates, ChatMessage } from '@lms/types';
import { useCol, formatDate } from '@lms/ui';
import { db } from '@lms/db';

interface ConversationProps {
  chatId: string;
  messageData?: ChatMates;
}

const Conversation = ({ chatId, messageData }: ConversationProps) => {
  const router = useRouter();

  const msgRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [conversation, loading] = useCol<ChatMessage>(
    query(
      collection(db, `messages/${chatId}/data`),
      orderBy('createdAt', 'desc')
    )
  );

  const seenMessage = async () => {
    if (!messageData?.adminOpened) {
      try {
        const messageRef = doc(db, 'messages', chatId);
        await updateDoc(messageRef, {
          adminOpened: true,
        });
      } catch (error) {
        console.log(error);
      }
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

      if (chatId === 'new') {
        const messagePayload = {
          adminOpened: true,
          lastMessageText: message.trim(),
          lastMessageTimestamp: serverTimestamp(),
          lastSender: 'admin',
          userId: messageData?.userId,
          userName: messageData?.userName,
          userOpened: false,
          userPhoto: messageData?.userPhoto,
        };
        const newMessageRef = collection(db, 'messages');

        const newlyCreatedMessage = await addDoc(
          newMessageRef,
          messagePayload
        );

        const newConvoRef = collection(
          db,
          `messages/${newlyCreatedMessage.id}/data`
        );
        await addDoc(newConvoRef, {
          createdAt: timestamp,
          senderId: 'admin',
          text: message.trim(),
        });

        const allQueries: any = {
          ...router.query,
          chatId: newlyCreatedMessage.id,
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
        msgRef.current?.scrollTo({
          top: msgRef.current?.scrollHeight,
        });

        return;
      }

      const convoRef = collection(db, `messages/${chatId}/data`);

      await addDoc(convoRef, {
        createdAt: timestamp,
        senderId: 'admin',
        text: message.trim(),
      });

      // update the last message timestamp
      const messageRef = doc(db, 'messages', chatId);
      await updateDoc(messageRef, {
        lastSender: 'admin',
        lastMessageTimestamp: timestamp,
        userOpened: false,
        lastMessageText: message.trim(),
      });

      setMessage('');
      setIsSending(false);
      msgRef.current?.scrollTo({
        top: msgRef.current?.scrollHeight,
      });
    } catch (error) {
      setIsSending(false);
      console.log('error sending message', error);
      toast.error('Unable to send message! Please try again.');
    }

    // bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='h-full w-[calc(100%-300px)]'>
      <div className='border-cGray-200 ml-3 flex items-center space-x-3 border-b bg-white pb-[6px]'>
        <div className='relative h-[50px] w-[50px] overflow-hidden rounded-full'>
          <Image src={messageData?.userPhoto!} layout='fill' />
        </div>
        <div>{messageData?.userName}</div>
      </div>
      <div className='h-[calc(100%-56px)] pl-3'>
        <div
          ref={msgRef}
          className='custom-scrollbar flex h-[calc(100%-50px)] w-full flex-col space-y-2 overflow-y-scroll text-sm'
          onScroll={handleScroll}
        >
          {conversation && conversation.length > 0 ? (
            [...conversation].reverse().map((convo, index) => {
              const isPreviousSenderAdmin = [...conversation].reverse()[
                index - 1
              ]
                ? [...conversation].reverse()[index - 1].senderId ===
                  'admin'
                : false;
              const isNextSenderAdmin = [...conversation].reverse()[
                index + 1
              ]
                ? [...conversation].reverse()[index + 1].senderId ===
                  'admin'
                : false;
              const isLastMessageUser =
                [...conversation].reverse()[conversation.length - 1]
                  .senderId !== 'admin' &&
                index === conversation.length - 1;

              const simpleDate = convo.createdAt
                ? formatDate(convo.createdAt.toDate(), true)
                : '';

              if (convo.senderId === 'admin') {
                return (
                  <div
                    className='bg-primary mr-2 mt-auto w-fit max-w-[80%] self-end rounded-lg px-3 py-2 text-white'
                    key={convo.id}
                  >
                    <ReactTooltip id={convo.id} />
                    <p
                      data-for={convo.id}
                      data-tip={simpleDate}
                      className='whitespace-pre-wrap break-words'
                    >
                      {convo.text}
                    </p>
                  </div>
                );
              } else {
                if (
                  (isPreviousSenderAdmin && isNextSenderAdmin) ||
                  isNextSenderAdmin ||
                  isLastMessageUser
                ) {
                  return (
                    <div
                      key={convo.id}
                      className='mt-auto flex max-w-[calc(80%+35px)] items-center'
                    >
                      <div className='relative mt-auto h-[30px] w-[30px] overflow-hidden rounded-full'>
                        <Image
                          src={messageData?.userPhoto!}
                          layout='fill'
                        />
                      </div>
                      <ReactTooltip id={convo.id} />
                      <p
                        data-for={convo.id}
                        data-tip={simpleDate}
                        className='bg-cGray-200 ml-[5px] w-fit self-start whitespace-pre-wrap break-words rounded-lg px-3 py-2'
                      >
                        {convo.text}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={convo.id}
                      className='bg-cGray-200 ml-[35px] mt-auto w-fit self-start whitespace-pre-wrap break-words rounded-lg px-3 py-2'
                    >
                      <ReactTooltip id={convo.id} />
                      <p data-for={convo.id} data-tip={simpleDate}>
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
          {messageData?.lastSender === 'admin' && messageData.userOpened && (
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
