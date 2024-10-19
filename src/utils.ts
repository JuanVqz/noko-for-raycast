import { Entry } from './types';

const formattedMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(remainingMinutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

const entryDecorator = (entries: Entry[]) => {
  return entries.map((entry) => ({
    ...entry,
    formatted_minutes: formattedMinutes(entry.minutes)
  }));
}

export { entryDecorator };




