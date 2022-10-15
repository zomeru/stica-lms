import * as functions from 'firebase-functions';
import algoliasearch from 'algoliasearch';
import { db } from '..';

const regionalFunctions = functions.region('asia-east2');

const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_API_KEY = functions.config().algolia.api_key;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const indexBooks = client.initIndex('books');
const indexBorrows = client.initIndex('borrows');
const indexUsers = client.initIndex('users');

// ? For books
export const sendBooksToAlgolia = regionalFunctions.https.onRequest(
  async (_, res) => {
    const records: any[] = [];
    const books = await db.collection('books').get();

    books.forEach((book) => {
      records.push({
        objectID: book.id,
        ...book.data(),
      });
    });

    await indexBooks.saveObjects(records);
    res.status(200).send({ success: true, data: records });
  }
);

export const onBookCreate = regionalFunctions.firestore
  .document('books/{bookId}')
  .onCreate(async (snap) => {
    const book = snap.data();
    book.objectID = snap.id;
    return await indexBooks.saveObject(book);
  });

export const onBookUpdate = regionalFunctions.firestore
  .document('books/{bookId}')
  .onUpdate(async (snap) => {
    const book = snap.after.data();
    book.objectID = snap.after.id;
    return await indexBooks.saveObject(book);
  });

export const onBookDelete = regionalFunctions.firestore
  .document('books/{bookId}')
  .onDelete(async (snap) => {
    return await indexBooks.deleteObject(snap.id);
  });

// ? For borrows
export const sendBorrowsToAlgolia = regionalFunctions.https.onRequest(
  async (_, res) => {
    const records: any[] = [];
    const borrows = await db.collection('borrows').get();

    borrows.forEach((borrow) => {
      records.push({
        objectID: borrow.id,
        ...borrow.data(),
      });
    });

    await indexBorrows.saveObjects(records);
    res.status(200).send({ success: true, data: records });
  }
);

export const onBorrowCreate = regionalFunctions.firestore
  .document('borrows/{borrowId}')
  .onCreate(async (snap) => {
    const borrow = snap.data();
    borrow.objectID = snap.id;
    return await indexBorrows.saveObject(borrow);
  });

export const onBorrowUpdate = regionalFunctions.firestore
  .document('borrows/{borrowId}')
  .onUpdate(async (snap) => {
    const borrow = snap.after.data();
    borrow.objectID = snap.after.id;
    return await indexBorrows.saveObject(borrow);
  });

export const onBorrowDelete = regionalFunctions.firestore
  .document('borrows/{borrowId}')
  .onDelete(async (snap) => {
    return await indexBorrows.deleteObject(snap.id);
  });

// ? For users
export const sendUsersToAlgolia = regionalFunctions.https.onRequest(
  async (_, res) => {
    const records: any[] = [];
    const users = await db.collection('users').get();

    users.forEach((user) => {
      records.push({
        objectID: user.id,
        ...user.data(),
      });
    });

    await indexUsers.saveObjects(records);
    res.status(200).send({ success: true, data: records });
  }
);

export const onUserCreate = regionalFunctions.firestore
  .document('users/{userId}')
  .onCreate(async (snap) => {
    const user = snap.data();
    user.objectID = snap.id;
    return await indexUsers.saveObject(user);
  });

export const onUserUpdate = regionalFunctions.firestore
  .document('users/{userId}')
  .onUpdate(async (snap) => {
    const user = snap.after.data();
    user.objectID = snap.after.id;
    return await indexUsers.saveObject(user);
  });

export const onUserDelete = regionalFunctions.firestore
  .document('users/{userId}')
  .onDelete(async (snap) => {
    return await indexUsers.deleteObject(snap.id);
  });
