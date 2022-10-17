import * as admin from 'firebase-admin';

// export * from './algolia';
export * from './borrows';

admin.initializeApp();
export const db = admin.firestore();
