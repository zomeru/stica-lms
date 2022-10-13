import toast from 'react-hot-toast';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { AlgoBookDoc, IBorrow, ILikedBooks } from '@lms/types';
import { db } from '@lms/db';

export const borrowBook = async (
  book: AlgoBookDoc,
  isAuthenticated: boolean,
  userId: string
) => {
  if (!isAuthenticated || !userId) {
    toast.error('Please sign in to borrow a book.');
    return;
  }

  const availableIsbn = book.isbns.find((el) => el.isAvailable)?.isbn;

  if (book.available === 0 || !availableIsbn) {
    toast.error('No available books, please try again later.');
    return;
  }

  try {
    const timestamp = serverTimestamp();

    const payload: IBorrow = {
      bookId: book.objectID,
      userId,
      title: book.title,
      isbn: availableIsbn,
      accessionNumber: book.accessionNumber,
      requestDate: timestamp,
      status: 'Pending',
      updatedAt: timestamp,
      penalty: 0,
    };

    await addDoc(collection(db, 'borrows'), payload);

    // const bookRef = doc(db, 'books', objectID);

    // const filterIsbn = isbns.filter((el) => el.isbn !== availableIsbn);

    // await updateDoc(bookRef, {
    //   available: increment(-1),
    //   isbns: [
    //     ...filterIsbn,
    //     { isbn: availableIsbn, isAvailable: false, issuedBy: user.id },
    //   ],
    // });

    toast.success('Borrow request sent successfully.');
  } catch (error) {
    console.log('error borrow', error);
    toast.error('Something went wrong, please try again later.');
  }
};

export const cancelBorrowRequest = async (
  borrowId: string,
  cb?: Function | (() => void)
) => {
  try {
    const borrowRef = doc(db, 'borrows', borrowId);
    const timestamp = serverTimestamp();
    await updateDoc(borrowRef, {
      status: 'Cancelled',
      updatedAt: timestamp,
    });
    toast.success('Request cancelled');
  } catch (e) {
    console.log('Error cancel borrow', e);
    toast.error('Something went wrong! Please try again later.');
  }

  if (cb) cb();
};

export const addToLikedBooks = async (
  book: AlgoBookDoc,
  isAuthenticated: boolean,
  userId: string
) => {
  if (!isAuthenticated || !userId) {
    toast.error('Please login to add to your liked books');
  }

  try {
    const likedBooksRef = collection(db, `users/${userId}/my-likes`);

    const payload: ILikedBooks = {
      bookId: book.objectID,
      title: book.title,
      author: book.author,
      genre: book.genre,
      accessionNumber: book.accessionNumber,
      imageCover: book.imageCover,
      createdAt: serverTimestamp(),
    };

    await addDoc(likedBooksRef, payload);

    toast.success(`${book.title} is added to your liked books`);
  } catch (error: any) {
    console.log('error add to liked books', error);
    toast.error('Something went wrong, please try again later.');
  }
};

export const removeFromLikedBooks = async (
  likedId: string,
  isAuthenticated: boolean,
  userId: string
) => {
  if (!isAuthenticated || !userId) {
    toast.error('Please login to remove from your liked books');
  }

  try {
    const likedBooksRef = doc(db, `users/${userId}/my-likes`, likedId);
    await deleteDoc(likedBooksRef);

    toast.success('Removed from your liked books');
  } catch (error) {
    console.log('error remove from liked books', error);
    toast.error('Something went wrong, please try again later.');
  }
};
