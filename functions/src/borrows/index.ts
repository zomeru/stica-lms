import * as functions from 'firebase-functions';
import { db } from '..';

const regionalFunctions = functions.region('asia-east2');

export const cancelNotPickupBorrows = regionalFunctions.pubsub
  .schedule('every 1 minutes')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    const borrows = await db.collection('borrows').get();

    borrows.forEach(async (borrow) => {
      const data = borrow.data();

      if (data.status === 'Pending') {
        const now = new Date();
        const pickUpDueDate = data.pickUpDueDate.toDate();
        const diff = now.getTime() - pickUpDueDate.getTime();
        // const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor(diff / 1000);

        // check if 20 seconds has passed
        if (seconds >= 20) {
          await borrow.ref.update({ status: 'Cancelled' });
        }

        // // check if 1 minute has passed
        // if (minutes >= 1) {
        //   await borrow.ref.update({ status: 'Cancelled' });
        // }
      }
    });
  });
