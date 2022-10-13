import Router from 'next/router';

export function randNum(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTHS = [
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

export function formatDate(date: Date | number | string) {
  // const dateStr = `${addZero(
  //   date.getMonth() + 1
  // )}/${date.getDate()}/${date.getFullYear()}`;

  const dateObj = new Date(date);

  const dateStr = `${
    MONTHS[dateObj.getMonth()]
  }. ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

  // , ${DAYS[date.getDay()]}

  return dateStr;
}

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
