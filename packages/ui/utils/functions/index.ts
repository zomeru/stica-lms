import Router from 'next/router';

export type DayType =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type MonthType =
  | 'Jan'
  | 'Feb'
  | 'Mar'
  | 'Apr'
  | 'May'
  | 'June'
  | 'July'
  | 'Aug'
  | 'Sep'
  | 'Oct'
  | 'Nov'
  | 'Dec';

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
  const dateObj = new Date(date);

  // show time in 12 hour format
  const time = `${dateObj.getHours() % 12}:${addZero(
    dateObj.getMinutes()
  )} ${dateObj.getHours() >= 12 ? 'PM' : 'AM'}`;

  const dateStr = `${
    MONTHS[dateObj.getMonth()]
  }. ${dateObj.getDate()}, ${dateObj.getFullYear()}${
    showTime ? ` ${time}` : ''
  }`;

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
  const newDate = new Date(date);
  return new Date(newDate.setDate(date.getDate() + days));
};

export const navigateToBook = (bookId: string) => {
  const allQueries = Router.query;

  Router.push(
    {
      pathname: '/',
      query: {
        ...allQueries,
        page: 'search',
        bookId,
      },
    },
    undefined,
    { shallow: true }
  );
};

export const blobToFile = (theBlob: Blob, fileName: string): File => {
  return new File(
    [theBlob as any], // cast as any
    fileName,
    {
      lastModified: new Date().getTime(),
      type: theBlob.type,
    }
  );
};
