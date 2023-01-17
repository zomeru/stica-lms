import React, { useRef, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import Select from 'react-select';
import toast from 'react-hot-toast';
import nProgress from 'nprogress';
import { useRouter } from 'next/router';

import { AlgoBorrowDoc, IBookDoc, Identifier, IUserDoc } from '@lms/types';
import { useCol } from '@lms/ui';
import { db } from '@lms/db';
import { processHoliday } from '@src/utils/processHoliday';

const WalkinRequest = () => {
  const router = useRouter();

  const [selectedBook, setSelectedBook] = useState<IBookDoc | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUserDoc | null>(null);
  const [selectedIdentifier, setSelectedIdentifier] =
    useState<Identifier | null>(null);
  const [issuing, setIssuing] = useState(false);

  let acnRef = useRef();

  const [books] = useCol<IBookDoc>(
    query(collection(db, 'books'), orderBy('title', 'asc'))
  );
  const [users] = useCol<IUserDoc>(
    query(collection(db, 'users'), orderBy('displayName', 'asc'))
  );

  const handleWalkinRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!books) {
      toast.error('No books available.');
      return;
    }

    if (!selectedBook || !selectedUser || !selectedIdentifier) {
      toast.error('All fields are required.');
      return;
    }

    if (!selectedBook.category.canBeBorrowed) {
      toast.error('This book cannot be borrowed.');
      return;
    }

    if (selectedBook.available === 0) {
      toast.error('There is currently no available copy of this book.');
      return;
    }

    try {
      nProgress.configure({ showSpinner: true });
      nProgress.start();
      setIssuing(true);

      const userBorrowQuery = query(
        collection(db, 'borrows'),
        where('status', '==', 'Issued'),
        where('userId', '==', selectedUser.id)
      );
      const borrowQuerySnap = await getDocs(userBorrowQuery);

      if (!borrowQuerySnap.empty && borrowQuerySnap.size >= 5) {
        toast.error('Only maximun of 5 books can be borrowed at once.');
        nProgress.done();
        setIssuing(false);
        return;
      }

      const bookRef = doc(db, 'books', selectedBook.id);

      const finalDueDateTimestamp = await processHoliday({
        category: selectedBook.category.category,
      } as AlgoBorrowDoc);

      const newIdentifiers = selectedBook.identifiers.filter(
        (iden) =>
          iden.accessionNumber !== selectedIdentifier.accessionNumber
      );

      // add borrow
      const timestamp = serverTimestamp();

      await addDoc(collection(db, 'borrows'), {
        author: selectedBook.author,
        bookId: selectedBook.id,
        category: selectedBook.category.category,
        copyright: selectedBook.copyright,
        dueDate: finalDueDateTimestamp,
        genre: selectedBook.genre,
        identifiers: {
          isbn: selectedIdentifier.isbn,
          accessionNumber: selectedIdentifier.accessionNumber,
        },
        issuedDate: timestamp,
        penalty: 0,
        publisher: selectedBook.publisher,
        status: 'Issued',
        studentName: selectedUser.displayName,
        title: selectedBook.title,
        updatedAt: timestamp,
        userId: selectedUser.id,
      });

      // update identifers
      await updateDoc(bookRef, {
        identifiers: [
          ...newIdentifiers,
          {
            isbn: selectedIdentifier.isbn,
            accessionNumber: selectedIdentifier.accessionNumber,
            status: 'Borrowed',
            borrowedBy: selectedUser.id,
          },
        ],
        available: increment(-1),
        totalBorrow: increment(1),
      });

      const userDocRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userDocRef, {
        totalBorrowedBooks: increment(1),
      });
      setSelectedBook(null);
      setSelectedUser(null);
      setSelectedIdentifier(null);
      toast.success('Book issued successfully.');

      setTimeout(() => {
        router.push(
          {
            pathname: '/',
            query: {
              page: encodeURIComponent('currently loaned books'),
            },
          },
          undefined,
          { shallow: true }
        );
      }, 300);
    } catch (err) {
      console.log('err', err);
      toast.error('Something went wrong! Please try again.');
    } finally {
      setIssuing(false);
      nProgress.done();
    }
  };

  return (
    <section className='flex h-full w-full flex-col items-center lg:items-start'>
      <div className='text-primary mb-3 text-xl font-bold'>
        Add Walk-in Book Request
      </div>

      <form
        className='flex flex-col space-y-2'
        onSubmit={handleWalkinRequest}
      >
        <div className='flex items-center space-x-2'>
          {/* <div>Student: </div> */}
          <Select
            className='min-w-[350px]'
            placeholder='Select student'
            required
            options={
              users
                ? users.map((user) => ({
                    value: user,
                    label: user.displayName,
                  }))
                : []
            }
            onChange={(e) => {
              if (e && e.value) {
                setSelectedUser(e.value);
              }
            }}
          />{' '}
          <div className='text-neutral-600'> - Student</div>
        </div>
        <div className='flex items-center space-x-2'>
          {/* <div>Book: </div> */}
          <Select
            placeholder='Select book'
            className='min-w-[350px]'
            required
            options={
              books
                ? books.map((book) => ({ value: book, label: book.title }))
                : []
            }
            onChange={(e) => {
              if (e && e.value) {
                setSelectedIdentifier(null);
                setSelectedBook(e.value);

                // @ts-ignore
                acnRef.clearValue();
              }
            }}
          />
          <div className='text-neutral-600'> - Book</div>
        </div>
        <div className='flex items-center space-x-2'>
          {/* <div>Accession number: </div> */}
          <Select
            isDisabled={!selectedBook}
            ref={(c) => {
              // @ts-ignore
              acnRef = c;
            }}
            required
            placeholder='Select accession no.'
            className='min-w-[350px]'
            options={
              books
                ? books
                    .find((book) => book.id === selectedBook?.id)
                    ?.identifiers.filter(
                      (idtfr) => idtfr.status === 'Available'
                    )
                    .map((identifier) => ({
                      value: identifier,
                      label: identifier.accessionNumber,
                    }))
                : []
            }
            onChange={(e) => {
              if (e && e.value) {
                setSelectedIdentifier(e.value);
              }
            }}
            noOptionsMessage={() => 'No book available'}
          />{' '}
          <div className='text-neutral-600'> - Accession no.</div>
        </div>
        {selectedIdentifier && (
          <div className='flex cursor-not-allowed items-center space-x-2'>
            {/* <div>Accession number: </div> */}
            <Select
              isDisabled
              placeholder={selectedIdentifier?.isbn || 'ISBN'}
              className='min-w-[350px]'
            />{' '}
            <div className='text-neutral-600'> - ISBN</div>
          </div>
        )}
        {selectedBook && (
          <>
            <div className='flex cursor-not-allowed items-center space-x-2'>
              {/* <div>Accession number: </div> */}
              <Select
                isDisabled
                placeholder={selectedBook.author}
                className='min-w-[350px]'
              />{' '}
              <div className='text-neutral-600'> - Author</div>
            </div>{' '}
            <div className='flex cursor-not-allowed items-center space-x-2'>
              {/* <div>Accession number: </div> */}
              <Select
                isDisabled
                placeholder={selectedBook.publisher}
                className='min-w-[350px]'
              />{' '}
              <div className='text-neutral-600'> - Publisher</div>
            </div>{' '}
            <div className='flex cursor-not-allowed items-center space-x-2'>
              {/* <div>Accession number: </div> */}
              <Select
                isDisabled
                placeholder={selectedBook.category.category}
                className='min-w-[350px]'
              />{' '}
              <div className='text-neutral-600'> - Category</div>
            </div>{' '}
            <div className='flex cursor-not-allowed items-center space-x-2'>
              {/* <div>Accession number: </div> */}
              <Select
                isDisabled
                placeholder={selectedBook.genre}
                className='min-w-[350px]'
              />{' '}
              <div className='text-neutral-600'> - Genre</div>
            </div>
          </>
        )}
        <button
          disabled={issuing}
          type='submit'
          className={`mt-3 place-self-start rounded-md px-3 py-2 text-white ${
            issuing ? 'bg-neutral-600' : 'bg-primary'
          }`}
        >
          Issue Book
        </button>
      </form>
    </section>
  );
};

export default WalkinRequest;
