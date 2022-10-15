import { db, regionalFunctions } from '..';

export const cancelNotPickupBorrows = regionalFunctions.pubsub
  //.schedule('every 1 minutes')
  // everyday every 5:00 PM
  .schedule('0 17 * * *')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    const borrowsRef = db.collection('borrows');
    const query = borrowsRef.where('status', '==', 'Pending');
    const borrows = await query.get();

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
