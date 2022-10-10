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

export function formatDate(date: Date) {
  // const dateStr = `${addZero(
  //   date.getMonth() + 1
  // )}/${date.getDate()}/${date.getFullYear()}`;

  const dateStr = `${
    MONTHS[date.getMonth()]
  }. ${date.getDate()}, ${date.getFullYear()}`;

  // , ${DAYS[date.getDay()]}

  return dateStr;
}
