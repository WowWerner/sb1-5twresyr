import { parseISO, isValid, format as formatDate } from 'date-fns';

export const formatDateForQuery = (date: Date): string => {
  return formatDate(date, 'yyyy-MM-dd');
};

export const formatDateString = (dateString: string | null | undefined, fallback = 'Invalid date'): string => {
  if (!dateString) return fallback;
  const date = parseISO(dateString);
  if (!isValid(date)) return fallback;
  return formatDate(date, 'MMM dd, yyyy');
};

export const formatDateTimeString = (dateString: string | null | undefined, fallback = 'Invalid date'): string => {
  if (!dateString) return fallback;
  const date = parseISO(dateString);
  if (!isValid(date)) return fallback;
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};