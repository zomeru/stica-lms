import { Timestamp } from 'firebase/firestore';

import { AlgoBorrowDoc } from '@lms/types';
import { addDays, DAYS, simpleFormatDate } from '../functions';

export const processHoliday = async (
  borrow: AlgoBorrowDoc
): Promise<Timestamp | undefined> => {
  let returnData: Timestamp | undefined;

  try {
    const holidayApiUrl = `https://www.googleapis.com/calendar/v3/calendars/en.philippines%23holiday%40group.v.calendar.google.com/events?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;

    const holRes = await fetch(holidayApiUrl);
    const holData = await holRes.json();
    const holidays = [...holData.items];
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

    const timeApiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=${
      process.env.NEXT_PUBLIC_TIMEZONE_API_KEY as string
    }&location=Manila, Philippines`;

    const timeRes = await fetch(timeApiUrl);
    const timeData = await timeRes.json();

    if (timeData) {
      const date = new Date(timeData.datetime);

      const daysToAddToDueDate = borrow?.category === 'Fiction' ? 7 : 3;

      const dueDate = addDays(date, daysToAddToDueDate);

      const dueDateDay = DAYS[dueDate.getDay()];

      const daysToAddIfWeekends =
        dueDateDay === 'Saturday' ? 2 : dueDateDay === 'Sunday' ? 1 : 0;
      const newDueDate = addDays(dueDate, daysToAddIfWeekends);

      let holidayDaysToAdd = 0;
      let incrementDay = 0;

      while (true) {
        // check if holiday
        const currentDueDate = addDays(newDueDate, incrementDay);
        const newDueDateDay = DAYS[currentDueDate.getDay()];

        if (newDueDateDay !== 'Sunday' && newDueDateDay !== 'Saturday') {
          const simpleDueDate = simpleFormatDate(currentDueDate);

          const isHoliday = holidayItems.some(
            (item: any) => item.startDate === simpleDueDate
          );

          if (isHoliday) {
            holidayDaysToAdd = +1;
          } else {
            break;
          }
        }

        incrementDay += 1;
      }

      const finalDueDate = addDays(newDueDate, holidayDaysToAdd);
      finalDueDate.setHours(17, 0, 0, 0);
      const finalDueDateTimestamp = Timestamp.fromDate(finalDueDate);

      // TODO: do this in fast dev mode
      // const sampleDate = new Date();
      // sampleDate.setSeconds(sampleDate.getSeconds() + 10);
      // const sampleDueDateTimestamp = Timestamp.fromDate(sampleDate);
      // TODO: do this in fast dev mode

      returnData = finalDueDateTimestamp;
    }
  } catch (error) {
    console.log('Error getting holiday info', error);
    returnData = undefined;
  }

  return returnData;
};
