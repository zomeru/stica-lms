import * as functions from 'firebase-functions';
import { db } from '..';

const regionalFunctions = functions.region('asia-east2');

export const cancelNotPickupBorrows = regionalFunctions.pubsub
  //.schedule('every 1 minutes')
  // everyday every 5:00 PM
  .schedule('0 17 * * *')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    const borrows = await db.collection('borrows').get();

    borrows.forEach(async (borrow) => {
      const data = borrow.data();

      if (data.status === 'Pending') {
        const now = new Date();
        const pickUpDueDate = data.pickUpDueDate.toDate();
        const diff = now.getTime() - pickUpDueDate.getTime();

        if (diff / 1000 > 10) {
          await borrow.ref.update({
            status: 'Cancelled',
            updatedAt: new Date(),
          });
        }
      }
    });
  });
