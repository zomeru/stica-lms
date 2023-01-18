import { AlgoBorrowDoc, IBookDoc } from '@lms/types';
import { DayType, MonthType } from '@src/types';
import Router from 'next/router';

export const keyGen = (diff?: string | number) => {
  return Math.trunc(
    Number(`${diff || ''}${Date.now() + Math.random() * 100000}`)
  ).toString();
};

export const hasDuplicateString = (arrString: string[]): boolean =>
  arrString.length !== new Set(arrString).size;

export function randNum(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const DAYS: DayType[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTHS: MonthType[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function addZero(num: number) {
  return num < 10 ? `0${num}` : num;
}

export function formatDate(
  date: Date | number | string,
  showTime: boolean = false
) {
  // const dateStr = `${addZero(
  //   date.getMonth() + 1
  // )}/${date.getDate()}/${date.getFullYear()}`;

  const dateObj = new Date(date);

  // show time in 12 hour format
  const hour =
    dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12;
  const time = `${hour}:${addZero(dateObj.getMinutes())} ${
    dateObj.getHours() >= 12 ? 'PM' : 'AM'
  }`;

  const dateStr = `${
    MONTHS[dateObj.getMonth()]
  }. ${dateObj.getDate()}, ${dateObj.getFullYear()}${
    showTime ? ` ${time}` : ''
  }`;

  // console.log(dateObj.getHours(), '-', dateObj.getMinutes());
  // , ${DAYS[date.getDay()]}

  return dateStr;
}

export function simpleFormatDate(
  date: Date | number | string,
  daysToAdd?: number
) {
  const dateObj = new Date(date);

  // 2022-05-01
  const dateStr = `${dateObj.getFullYear()}-${addZero(
    dateObj.getMonth() + 1
  )}-${addZero(dateObj.getDate() + (daysToAdd || 0))}`;

  return dateStr;
}

export const addDays = (date: Date, days: number) => {
  // const newDate = new Date(date);
  return new Date(date.setDate(date.getDate() + days));
};

export const navigateToBook = (bookId: string) => {
  const allQueries = Router.query;

  Router.push(
    {
      pathname: '/',
      query: {
        ...allQueries,
        page: 'books',
        bookId,
      },
    },
    undefined,
    { shallow: true }
  );
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

export const uniqueAcnCheck = (books: IBookDoc[], acn: string) => {
  let found = 0;

  books.forEach((book) => {
    book.identifiers.forEach((identifier) => {
      if (
        identifier.accessionNumber === acn &&
        identifier.status !== 'Lost' &&
        identifier.status !== 'Damaged'
      ) {
        found += 1;
      }
    });
  });

  return found === 0;
};

export const filterBetweenDates = (
  data: AlgoBorrowDoc[],
  fromDate?: Date,
  toDate?: Date
) => {
  try {
    if (!fromDate && !toDate) return data;

    const filteredData = data.filter((item) => {
      if (!fromDate && toDate) {
        return new Date(item.updatedAt) <= toDate;
      }

      if (fromDate && !toDate) {
        return new Date(item.updatedAt) >= fromDate;
      }

      return (
        new Date(item.updatedAt) >= fromDate! &&
        new Date(item.updatedAt) <= toDate!
      );
    });

    return filteredData;
  } catch (error) {
    console.log('error while filtering by dates', error);
    return data;
  }
};
