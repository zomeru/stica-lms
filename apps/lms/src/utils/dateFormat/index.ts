const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function addZero(num: number) {
  return num < 10 ? `0${num}` : num;
}

export function formatDate(date: Date) {
  return `${addZero(
    date.getMonth() + 1
  )}/${date.getDate()}/${date.getFullYear()}, ${DAYS[date.getDay()]}`;
}
