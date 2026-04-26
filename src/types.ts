export type Category = "과제" | "연구" | "논문" | "행정" | "대회" | "기타";

export type WorkSession = {
  id: string;
  startTime: string;
  endTime: string;
  category: Category;
  plan: string;
  achievement: string;
};

export type DailyEntry = {
  date: string;
  dayOfWeek: string;
  checkInTime: string;
  checkOutTime: string;
  workSessions: WorkSession[];
  memo?: string;
};

export type WeeklySummary = {
  overall: string;
  project: string;
  research: string;
  paper: string;
  competition: string;
  etc: string;
};

export type NextWeekPlan = {
  project: string;
  research: string;
  paper: string;
  competition: string;
  etc: string;
};

export type WeeklyJournal = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  researcherName: string;
  dailyEntries: DailyEntry[];
  weeklySummary: WeeklySummary;
  nextWeekPlan: NextWeekPlan;
};

export type AppSettings = {
  researcherName: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
  secretKey: string;
};

export type AppData = {
  settings: AppSettings;
  journals: WeeklyJournal[];
};
