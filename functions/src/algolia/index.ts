import * as functions from 'firebase-functions';
import algoliasearch from 'algoliasearch';
import { db } from '..';

const regionalFunctions = functions.region('asia-east2');

const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_API_KEY = functions.config().algolia.api_key;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex('books');

// https
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

    await index.saveObjects(records);
    res.status(200).send({ success: true, data: records });
  }
);

// triggers
export const onBookCreate = regionalFunctions.firestore
  .document('books/{bookId}')
  .onCreate(async (snap) => {
    const book = snap.data();
    book.objectID = snap.id;
    return await index.saveObject(book);
  });

export const onBookUpdate = regionalFunctions.firestore
  .document('books/{bookId}')
  .onUpdate(async (snap) => {
    const book = snap.after.data();
    book.objectID = snap.after.id;
    return await index.saveObject(book);
  });

export const onBookDelete = regionalFunctions.firestore
  .document('books/{bookId}')
  .onDelete(async (snap) => {
    return await index.deleteObject(snap.id);
  });
