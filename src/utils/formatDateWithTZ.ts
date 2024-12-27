import { format } from 'date-fns-tz';

export const formatDateTZ = (date: Date) =>
  format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX", { timeZone: 'UTC' });
