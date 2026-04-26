import { addDays, endOfMonth, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "./ui";
import { cn, hourDiff, totalDailyHours } from "../lib/utils";
import type { DailyEntry, WeeklyJournal } from "../types";

const colors = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#64748b"];
const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

type Props = {
  journal: WeeklyJournal;
  journals: WeeklyJournal[];
  onSelectDate: (date: string) => void;
};

type MonthStats = {
  entries: DailyEntry[];
  totalHours: number;
  activeDays: number;
  sessionCount: number;
  category: Array<{ name: string; hours: number; color: string }>;
};

export function MonthlyView({ journal, journals, onSelectDate }: Props) {
  const selectedMonth = startOfMonth(parseISO(journal.weekStartDate));
  const monthStart = startOfWeek(selectedMonth, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(selectedMonth);
  const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
  const entriesByDate = new Map<string, DailyEntry>();

  journals.forEach((item) => {
    item.dailyEntries.forEach((entry) => {
      entriesByDate.set(entry.date, entry);
    });
  });

  const days: Date[] = [];
  for (let day = monthStart; day <= calendarEnd; day = addDays(day, 1)) {
    days.push(day);
  }

  const monthStats = buildMonthStats(journals, selectedMonth);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>월 달력</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{format(selectedMonth, "yyyy년 M월")} 연구 기록</p>
          </div>
          <Badge>{journal.weekStartDate} 주차 기준</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 overflow-hidden rounded-md border border-border text-sm">
            {weekDays.map((day) => (
              <div key={day} className="bg-muted px-2 py-1.5 text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const entry = entriesByDate.get(dateKey);
              const hours = entry ? totalDailyHours(entry) : 0;
              const sessionCount = entry?.workSessions.length ?? 0;
              const hasPlan = Boolean(entry?.workSessions.some((session) => session.plan.trim()));
              const hasAchievement = Boolean(entry?.workSessions.some((session) => session.achievement.trim()));
              const isSelectedWeek = journal.dailyEntries.some((dailyEntry) => dailyEntry.date === dateKey);
              const tone = getWorkTone(hours, hasPlan, hasAchievement);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className={cn(
                    "min-h-20 border-r border-t border-border bg-background p-2 text-left transition hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-ring",
                    !isSameMonth(day, selectedMonth) && "bg-muted/30 text-muted-foreground",
                    isSelectedWeek && "ring-1 ring-inset ring-primary/40",
                  )}
                >
                  <div className={cn("mb-1 h-1.5 rounded-full", tone.bar)} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{format(day, "d")}</span>
                    {hours > 0 && <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", tone.badge)}>{hours.toFixed(1)}h</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", hasPlan ? "bg-blue-500" : "bg-slate-300")} title="계획" />
                    <span className={cn("h-2 w-2 rounded-full", hasAchievement ? "bg-emerald-500" : "bg-slate-300")} title="실적" />
                    <span className="text-[11px] text-muted-foreground">{sessionCount ? `${sessionCount}개` : "기록 없음"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>월간 통계</CardTitle>
          <p className="text-sm text-muted-foreground">근무 시간과 카테고리 합계</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="총 시간" value={`${monthStats.totalHours.toFixed(1)}h`} />
            <MiniStat label="기록일" value={`${monthStats.activeDays}일`} />
            <MiniStat label="세션" value={`${monthStats.sessionCount}개`} />
          </div>
          <div className="space-y-3">
            {monthStats.category.length ? monthStats.category.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.hours.toFixed(1)}h</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${Math.max(5, (item.hours / monthStats.totalHours) * 100)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">이번 달 기록이 없습니다.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildMonthStats(journals: WeeklyJournal[], selectedMonth: Date): MonthStats {
  const entries = journals
    .flatMap((item) => item.dailyEntries)
    .filter((entry) => isSameMonth(parseISO(entry.date), selectedMonth));
  const categoryMap = new Map<string, number>();
  let sessionCount = 0;

  entries.forEach((entry) => {
    entry.workSessions.forEach((session) => {
      sessionCount += 1;
      categoryMap.set(session.category, (categoryMap.get(session.category) ?? 0) + hourDiff(session.startTime, session.endTime));
    });
  });

  const totalHours = entries.reduce((sum, entry) => sum + totalDailyHours(entry), 0);
  const category = Array.from(categoryMap.entries())
    .map(([name, hours], index) => ({ name, hours, color: colors[index % colors.length] }))
    .sort((a, b) => b.hours - a.hours);

  return {
    entries,
    totalHours,
    activeDays: entries.filter((entry) => totalDailyHours(entry) > 0 || entry.workSessions.length > 0).length,
    sessionCount,
    category,
  };
}

function getWorkTone(hours: number, hasPlan: boolean, hasAchievement: boolean) {
  if (hours <= 0) return { bar: "bg-slate-200", badge: "bg-slate-100 text-slate-600" };
  if (hasPlan && hasAchievement && hours >= 8) return { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" };
  if (hasPlan && hasAchievement) return { bar: "bg-blue-500", badge: "bg-blue-100 text-blue-700" };
  if (hasPlan || hasAchievement) return { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700" };
  return { bar: "bg-rose-500", badge: "bg-rose-100 text-rose-700" };
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-2 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
