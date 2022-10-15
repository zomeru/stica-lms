import toast from 'react-hot-toast';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import nProgress from 'nprogress';

import { AlgoBookDoc, IBorrow, ILikedBooks } from '@lms/types';
import { db } from '@lms/db';
import { addDays, DAYS, simpleFormatDate } from '@src/utils';

export const borrowBook = async (
  book: AlgoBookDoc,
  isAuthenticated: boolean,
  userId: string,
  cb?: () => void
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
    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/en.philippines%23holiday%40group.v.calendar.google.com/events?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'GET',
      }
    );

    const calData = await calRes.json();
    const holidays = [...calData.items];

    const timeApiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=${
      process.env.NEXT_PUBLIC_TIMEZONE_API_KEY as string
    }&location=Manila, Philippines`;

    nProgress.configure({
      showSpinner: true,
    });
    nProgress.start();
    fetch(timeApiUrl)
      .then((res) => res.json())
      .then(async (timeData) => {
        const requestDateTimestamp = serverTimestamp();
        const date = new Date(timeData.datetime);

        const day = DAYS[date.getDay()];
        const dayToAdd = day === 'Friday' ? 3 : day === 'Saturday' ? 2 : 1;

        const holidayItems: any = [];

        holidays.forEach((item) => {
          if (item.start.date.includes(date.getFullYear().toString())) {
            const calItems = {
              id: item.id,
              description: item.description,
              summary: item.summary,
              startDate: item.start.date,
              endDate: item.end.date,
            };

            holidayItems.push(calItems);
          }
        });

        let holidayDaysToAdd = 0;
        let increment = 0;

        while (true) {
          const tom = addDays(date, increment + 1);
          const tomDay = DAYS[tom.getDay()];

          if (tomDay !== 'Sunday' && tomDay !== 'Saturday') {
            const newTom = simpleFormatDate(tom);

            const isHoliday = holidayItems.find(
              (item: any) => item.startDate === newTom
            );

            if (isHoliday) {
              holidayDaysToAdd += 1;
            } else {
              break;
            }
          }

          increment += 1;
        }

        // TODO : do this in fast dev mode
        // const sampleDate = new Date();
        // add 1 minute to sample date
        // sampleDate.setMinutes(sampleDate.getMinutes() + 1);
        // add 10 seconds to sample date
        // sampleDate.setSeconds(sampleDate.getSeconds() + 10);

        // set date time to 5pm
        date.setHours(17, 0, 0, 0);
        // const pickUpDueDate = addDays(sampleDate, 0);
        const pickUpDueDate = addDays(date, dayToAdd + holidayDaysToAdd);
        const pickupDueTimestamp = Timestamp.fromDate(pickUpDueDate);

        const payload: IBorrow = {
          bookId: book.objectID,
          userId,
          title: book.title,
          isbn: availableIsbn,
          accessionNumber: book.accessionNumber,
          requestDate: requestDateTimestamp,
          status: 'Pending',
          updatedAt: requestDateTimestamp,
          penalty: 0,
          pickUpDueDate: pickupDueTimestamp,
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
        nProgress.done();
        if (cb) cb();
      })
      .catch((err) => {
        console.log('error borrow', err);
        toast.error('Something went wrong, please try again later.');
        nProgress.done();
        if (cb) cb();
      });
  } catch (error) {
    console.log('error', error);
    toast.error('Something went wrong, please try again later.');
    if (cb) cb();
  }
};

export const cancelBorrowRequest = async (borrowId: string) => {
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
