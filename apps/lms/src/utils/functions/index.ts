import Router from 'next/router';

import { DayType, MonthType } from '@src/types';

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

export function formatDate(date: Date | number | string) {
  // const dateStr = `${addZero(
  //   date.getMonth() + 1
  // )}/${date.getDate()}/${date.getFullYear()}`;

  const dateObj = new Date(date);

  const dateStr = `${
    MONTHS[dateObj.getMonth()]
  }. ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

  // console.log(dateObj.getHours(), '-', dateObj.getMinutes());
  // , ${DAYS[date.getDay()]}

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
