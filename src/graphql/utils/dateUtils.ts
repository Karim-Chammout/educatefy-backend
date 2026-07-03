import { format, startOfDay, subDays } from 'date-fns';

export function getDateDaysAgo(days: number) {
  const date = subDays(new Date(), days);

  return startOfDay(date);
}

export const getDateRange = (days: number) => {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  return {
    startDate,
    endDate,
  };
};

export const formatDateKey = (date: Date | string | number) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const generateDateRangeKeys = (days: number): string[] => {
  const dates: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    dates.push(formatDateKey(date));
  }

  return dates;
};
