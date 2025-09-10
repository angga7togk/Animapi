import dayjs from "dayjs";

export function parseDate(strDate: string, format = "MMM D, YYYY"): Date {
  return dayjs(strDate, format).toDate();
}
