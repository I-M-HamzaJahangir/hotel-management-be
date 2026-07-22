import { startOfDay } from "date-fns";

export const normalizeDate = (date: Date) => startOfDay(date);
