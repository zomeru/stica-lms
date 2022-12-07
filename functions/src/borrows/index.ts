import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch-commonjs';

import { db } from '..';

const timestamp = admin.firestore.Timestamp;
const increment = admin.firestore.FieldValue.increment;
const deleteField = admin.firestore.FieldValue.delete;

const regionalFunctions = functions.region('asia-east2');

const FIREBASE_API_KEY = functions.config().fireb.api_key;

function addZero(num: number) {
  return num < 10 ? `0${num}` : num;
}

// .schedule('0 17 * * *') - Every 5:00 PM
// .schedule('every 1 minutes')
// .schedule('0 17 * * 1-5') - Every weekday at 5:00 PM
// .schedule('5 17 * * 1-5') - Every weekday at 5:05 PM

// cancel pending borrows when not picked up before pick up due date (24h, always 5:00 PM)
export const autoCancelBorrows = regionalFunctions.pubsub
  .schedule('5 17 * * 1-5')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    const borrowsRef = db.collection('borrows');
    const query = borrowsRef.where('status', '==', 'Pending');
    const borrows = await query.get();

    borrows.forEach(async (borrow: any) => {
      const data = borrow.data();

      const now = new Date();
      const pickUpDueDate = data.pickUpDueDate.toDate();
      const diff = now.getTime() - pickUpDueDate.getTime();

      if (diff / 1000 > 10) {
        await borrow.ref.update({
          status: 'Cancelled',
          updatedAt: timestamp.now(),
        });

        // delete notification for admin
        const adminNotifRef = db.collection('admin-notifications');
        const adminNotifQuery = adminNotifRef.where(
          'borrowId',
          '==',
          borrow.id
        );
        const adminNotif = await adminNotifQuery.get();
        const doc = adminNotif.docs[0];
        await doc.ref.delete();

        // send notification to student that borrow request was automatically cancelled on notifications collection

        const payload = {
          createdAt: timestamp.now(),
          clicked: false,
          type: 'Cancelled',
          message: `Your borrow request on ${data.title} was automatically cancelled.`,
          borrowId: borrow.id,
          userId: data.userId,
          bookTitle: data.title,
        };
        await db.collection('notifications').add(payload);
      }
    });
  });

// add 5 pesos penalty for every day late (5:00 PM)
export const addPenaltyForLateReturn = regionalFunctions.pubsub
  .schedule('5 17 * * 1-5')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    const DAYS = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    try {
      const today = new Date();
      const day = DAYS[today.getDay()];
      const simpleDate = `${today.getFullYear()}-${addZero(
        today.getMonth() + 1
      )}-${addZero(today.getDate())}`;

      const holidayApiUrl = `https://www.googleapis.com/calendar/v3/calendars/en.philippines%23holiday%40group.v.calendar.google.com/events?key=${FIREBASE_API_KEY}`;

      const holidayResponse = await fetch(holidayApiUrl);
      const holidayData = await holidayResponse.json();

      const holidays = [...(holidayData as any).items];
      const newHolidays: any[] = [];

      holidays.forEach((item: any) => {
        const calItems = {
          id: item.id,
          description: item.description,
          summary: item.summary,
          startDate: item.start.date,
          endDate: item.end.date,
        };

        newHolidays.push(calItems);
      });

      const borrowsRef = db.collection('borrows');
      const query = borrowsRef.where('status', '==', 'Issued');
      const borrows = await query.get();

      const isHoliday = newHolidays.some(
        (item) => item.startDate === simpleDate
      );

      if (day !== 'Sunday' && day !== 'Saturday' && !isHoliday) {
        borrows.forEach(async (borrow: any) => {
          const data = borrow.data();

          const now = new Date();
          const dueDate = data.dueDate.toDate();
          const diff = now.getTime() - dueDate.getTime();

          if (diff / 1000 > 10) {
            await borrow.ref.update({
              penalty: increment(5),
              updatedAt: timestamp.now(),
            });

            if (data.renewRequest || data.renewRequestDate) {
              await borrow.ref.update({
                renewRequest: deleteField(),
                renewRequestDate: deleteField(),
                updatedAt: timestamp.now(),
              });
            }

            // send notification to student that penalty was added on notifications collection
            const studentId = data.userId;

            const totalPenalty = Number(data.penalty) + 5;

            const payload = {
              createdAt: timestamp.now(),
              clicked: false,
              type: 'Penalty',
              message: `We have added ${
                Number(data.penalty) > 1 ? 'another 5' : '5'
              } pesos penalty for your issued book on ${
                data.title
              } because you have not returned it on time.${
                Number(data.penalty) > 1
                  ? ` Total penalty is now ${totalPenalty}`
                  : ''
              }`,
              borrowId: borrow.id,
              userId: studentId,
              bookTitle: data.title,
            };

            await db.collection('notifications').add(payload);
          }
        });
      }
    } catch (error: any) {
      console.log('Penalty Error', error.message);
    }
  });
