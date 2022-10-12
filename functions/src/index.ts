import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export * from './algolia';

const regionalFunctions = functions.region('asia-east2');

admin.initializeApp();
export const db = admin.firestore();
export const fieldValue = admin.firestore.FieldValue;

export const hello = regionalFunctions.https.onRequest((_, response) => {
  response.send('Hello from STICA LMS!');
});
