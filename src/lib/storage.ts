import type { AppData } from "../types";
import { initialData } from "./sampleData";

const DATA_KEY = "weekly-research-journal:data";
const AUTH_KEY = "weekly-research-journal:authenticated";

const emptyData: AppData = {
  settings: {
    researcherName: "",
    defaultCheckIn: "9",
    defaultCheckOut: "18",
    secretKey: import.meta.env.VITE_SECRET_KEY ?? "",
  },
  journals: [],
};

export function loadData(): AppData {
  const raw = localStorage.getItem(DATA_KEY);
  if (!raw) {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    const data = JSON.parse(raw) as AppData;
    let changed = false;
    if (data.settings.researcherName === "홍길동") {
      data.settings.researcherName = "박정준";
      data.journals = data.journals.map((journal) => ({
        ...journal,
        researcherName: journal.researcherName === "홍길동" ? "박정준" : journal.researcherName,
      }));
      changed = true;
    }
    data.journals = data.journals.map((journal) => {
      const weeklySummary = { ...journal.weeklySummary, competition: journal.weeklySummary.competition ?? "" };
      const nextWeekPlan = { ...journal.nextWeekPlan, competition: journal.nextWeekPlan.competition ?? "" };
      if (!("competition" in journal.weeklySummary) || !("competition" in journal.nextWeekPlan)) {
        changed = true;
      }
      return { ...journal, weeklySummary, nextWeekPlan };
    });
    if (changed) {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    }
    return data;
  } catch {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
    return initialData;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(value: boolean) {
  if (value) sessionStorage.setItem(AUTH_KEY, "true");
  else sessionStorage.removeItem(AUTH_KEY);
}

export function resetData() {
  localStorage.setItem(DATA_KEY, JSON.stringify(emptyData));
  return emptyData;
}
