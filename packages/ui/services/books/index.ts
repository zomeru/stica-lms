import toast from 'react-hot-toast';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  Timestamp,
  where,
  query,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import nProgress from 'nprogress';

import { AlgoBookDoc, IBorrow, ILikedBooks, IUserDoc } from '@lms/types';
import { db } from '@lms/db';
import { addDays, DAYS, simpleFormatDate } from '../../utils';

export const borrowBook = async (
  book: AlgoBookDoc,
  user: IUserDoc | null,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!user) {
    toast.error('Please sign in to borrow a book.');
    return;
  }

  if (book.isArchive) {
    toast.error('This book is archived.');
    return;
  }

  if (!book.category.canBeBorrowed) {
    toast.error('This book cannot be borrowed.');
    return;
  }

  // const availableBook = book.identifiers.find(
  //   (el) => el.status === 'Available'
  // );

  // if (book.available === 0 || !availableBook) {
  //   toast.error('No available books, please try again later.');
  //   return;
  // }
  try {
    setLoading(true);
    nProgress.configure({
      showSpinner: true,
    });
    nProgress.start();

    const userBorrowQuery = query(
      collection(db, 'borrows'),
      where('status', '==', 'Issued'),
      where('userId', '==', user.id)
    );
    const borrowQuerySnap = await getDocs(userBorrowQuery);

    if (!borrowQuerySnap.empty && borrowQuerySnap.size >= 5) {
      toast.error('Only maximun of 5 books can be borrowed at once.');
      nProgress.done();
      setLoading(false);
      return;
    }

    // Delete notification for admin
    const bookRef = doc(db, 'books', book.id || book.objectID);
    const bookSnap = await getDoc(bookRef);

    if (bookSnap.exists()) {
      const bookData: AlgoBookDoc = bookSnap.data() as AlgoBookDoc;

      if (bookData.available === 0) {
        toast.error('No available books, please try again later.');
        setLoading(false);
        nProgress.done();
        return;
      }
    } else {
      toast.error('No available books, please try again later.');
      setLoading(false);
      nProgress.done();

      return;
    }

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

    fetch(timeApiUrl)
      .then((res) => res.json())
      .then(async (timeData) => {
        const requestDateTimestamp = serverTimestamp();
        const date = new Date(timeData.datetime);

        const day = DAYS[date.getDay()];

        const dawnAdd =
          date.getHours() >= 0 && date.getHours() < 8 && day !== 'Sunday'
            ? 0
            : 1;

        const dayToAdd =
          day === 'Friday' ? 3 : day === 'Saturday' ? 2 : dawnAdd;

        const holidayItems: any = [];

        holidays.forEach((item) => {
          const calItems = {
            id: item.id,
            description: item.description,
            summary: item.summary,
            startDate: item.start.date,
            endDate: item.end.date,
          };

          holidayItems.push(calItems);
        });

        let holidayDaysToAdd = 0;
        let increment = 0;

        while (true) {
          console.log('');
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
        // TODO : do this in fast dev mode

        // set date time to 5pm
        date.setHours(17, 0, 0, 0);
        // const pickUpDueDate = addDays(sampleDate, 0);
        const pickUpDueDate = addDays(date, dayToAdd + holidayDaysToAdd);
        const pickupDueTimestamp = Timestamp.fromDate(pickUpDueDate);

        const newBookData: AlgoBookDoc = bookSnap.data() as AlgoBookDoc;
        const availableBook = newBookData.identifiers.find(
          (iden) => iden.status === 'Available'
        );

        const payload: IBorrow = {
          bookId: book.objectID,
          userId: user.id,
          studentName: user.displayName,
          title: book.title,
          author: book.author,
          genre: book.genre,
          copyright: book.copyright,
          publisher: book.publisher,
          category: book.category.category,
          identifiers: {
            // isbn: availableBook.isbn,
            isbn: availableBook?.isbn!,
            accessionNumber: availableBook?.accessionNumber!,
            // accessionNumber: availableBook.accessionNumber,
          },
          requestDate: requestDateTimestamp,
          status: 'Pending',
          updatedAt: requestDateTimestamp,
          penalty: 0,
          pickUpDueDate: pickupDueTimestamp,
        };

        const currentBorrow = await addDoc(
          collection(db, 'borrows'),
          payload
        );

        await addDoc(collection(db, 'admin-notifications'), {
          createdAt: serverTimestamp(),
          clicked: false,
          type: 'Borrow',
          studentName: `${user.givenName} ${user.surname}`,
          studentId: user.id,
          borrowId: currentBorrow.id,
          studentPhoto: user.photo.url,
          message: `has requested to borrow`,
          bookTitle: book.title,
          userId: 'admin',
        });

        toast.success('Borrow request sent successfully.');
        setLoading(false);
        nProgress.done();
      })
      .catch((err) => {
        console.log('error borrow', err);
        toast.error('Something went wrong, please try again later.');
        setLoading(false);
        nProgress.done();
      });
  } catch (error) {
    console.log('error', error);
    setLoading(false);
    toast.error('Something went wrong, please try again later.');
  }
};

export const cancelBorrowRequest = async (borrowId: string) => {
  try {
    // Cancel borrow
    const borrowRef = doc(db, 'borrows', borrowId);
    const timestamp = serverTimestamp();
    await updateDoc(borrowRef, {
      status: 'Cancelled',
      updatedAt: timestamp,
    });

    // Delete notification for admin
    const adminNotifRef = collection(db, 'admin-notifications');
    const adminNotifQuery = query(
      adminNotifRef,
      where('borrowId', '==', borrowId)
    );
    const adminNotifQuerySnapshot = await getDocs(adminNotifQuery);
    const adminNotifDoc = adminNotifQuerySnapshot.docs[0];
    const notifRef = doc(db, 'admin-notifications', adminNotifDoc.id);
    await deleteDoc(notifRef);

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
    return;
  }

  try {
    const likedBooksRef = collection(db, `users/${userId}/my-likes`);

    const payload: ILikedBooks = {
      bookId: book.objectID,
      title: book.title,
      author: book.author,
      genre: book.genre,
      identifiers: {
        isbn: book.identifiers[0].isbn,
        accessionNumber: book.identifiers[0].accessionNumber,
      },
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
