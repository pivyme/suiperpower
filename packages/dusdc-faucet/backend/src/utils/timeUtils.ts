export const getCurrentTime = (): string => {
  return new Date().toISOString();
};

export const getCurrentTimeUnix = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const convertDateToUnix = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

export const manyMinutesAgoUnix = (minutes: number): number => {
  return getCurrentTimeUnix() - minutes * 60;
};
