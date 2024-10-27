import { Entry, Filter } from './types';

const hoursFormat = (minutes: number) : string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(remainingMinutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

const entryDecorator = (entries: Entry[]) => {
  return entries.map((entry) => ({
    ...entry,
    formatted_minutes: hoursFormat(entry.minutes)
  }));
}

// TODO: support other time zones via preferences settings
const timeZoneOffset = () => -6;

// Returns the date in 'YYYY-MM-DD' format
const dateFormat = (date: Date) : string => date.toISOString().split('T')[0];

const dateWithTimeZone = (date: Date) : string => {
  const utcDate = new Date(dateFormat(date));
  utcDate.setHours(utcDate.getHours() + timeZoneOffset());

  return dateFormat(utcDate);
};

const formattedSelectedDay = (filter: Filter) : string => {
  const today = new Date();

  if (filter === Filter.Yesterday) {
    const yesterday = new Date(today.setDate(today.getDate() - 1));

    return dateWithTimeZone(yesterday);
  }

  if (filter === Filter.Tomorrow) {
    const tomorrow = new Date(today.setDate(today.getDate() + 1));

    return dateWithTimeZone(tomorrow);
  }

  return dateWithTimeZone(today);
}

export { entryDecorator, formattedSelectedDay };
