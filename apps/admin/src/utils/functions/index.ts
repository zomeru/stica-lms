import { DayType, MonthType } from '@src/types';

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
  const time = `${dateObj.getHours() % 12}:${addZero(
    dateObj.getMinutes()
  )} ${dateObj.getHours() >= 12 ? 'PM' : 'AM'}`;

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
