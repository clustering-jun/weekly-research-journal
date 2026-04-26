import { addDays, format, startOfWeek } from "date-fns";
import type { DailyEntry, WeeklyJournal } from "../types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function parseHour(value: string): number | null {
  if (!value.trim()) return null;
  const normalized = value.trim().replace(":", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export function formatHour(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

export function hourDiff(start: string, end: string) {
  const s = parseHour(start);
  const e = parseHour(end);
  if (s === null || e === null || e < s) return 0;
  return e - s;
}

export function isInvalidRange(start: string, end: string) {
  const s = parseHour(start);
  const e = parseHour(end);
  return s !== null && e !== null && e < s;
}

export function mondayOf(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function isoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function displayDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return format(date, "M/d");
}

export function createDailyEntries(weekStart: Date, checkIn: string, checkOut: string): DailyEntry[] {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  return days.map((day, index) => ({
    date: isoDate(addDays(weekStart, index)),
    dayOfWeek: day,
    checkInTime: index < 5 ? checkIn : "",
    checkOutTime: index < 5 ? checkOut : "",
    workSessions: [],
  }));
}

export function emptyJournal(weekStart: Date, researcherName: string, checkIn: string, checkOut: string): WeeklyJournal {
  const end = addDays(weekStart, 6);
  return {
    id: isoDate(weekStart),
    weekStartDate: isoDate(weekStart),
    weekEndDate: isoDate(end),
    researcherName,
    dailyEntries: createDailyEntries(weekStart, checkIn, checkOut),
    weeklySummary: { overall: "", project: "", research: "", paper: "", competition: "", etc: "" },
    nextWeekPlan: { project: "", research: "", paper: "", competition: "", etc: "" },
  };
}

export function totalDailyHours(entry: DailyEntry) {
  return entry.workSessions.reduce((sum, session) => sum + hourDiff(session.startTime, session.endTime), 0);
}

export function totalJournalHours(journal: WeeklyJournal) {
  return journal.dailyEntries.reduce((sum, entry) => sum + totalDailyHours(entry), 0);
}
