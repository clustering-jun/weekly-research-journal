import { addDays, endOfMonth, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import type { Category, DailyEntry, WeeklyJournal, WorkSession } from "../types";
import { cn, displayDate, formatHour, hourDiff, isInvalidRange, isoDate, totalDailyHours, uid } from "../lib/utils";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, OutlineButton, Select, Textarea } from "./ui";

const categories: Category[] = ["과제", "연구", "논문", "행정", "대회", "기타"];

type Props = {
  journal: WeeklyJournal;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onChange: (journal: WeeklyJournal) => void;
};

export function JournalEditor({ journal, selectedDate, onSelectDate, onChange }: Props) {
  const entry = journal.dailyEntries.find((item) => item.date === selectedDate) ?? journal.dailyEntries[0];
  const monthDays = buildMonthDays(entry.date);
  const weeklyDates = new Set(journal.dailyEntries.map((day) => day.date));
  const entryByDate = new Map(journal.dailyEntries.map((day) => [day.date, day]));

  function updateEntry(next: DailyEntry) {
    onChange({ ...journal, dailyEntries: journal.dailyEntries.map((item) => (item.date === next.date ? next : item)) });
  }

  function updateSession(id: string, patch: Partial<WorkSession>) {
    updateEntry({ ...entry, workSessions: entry.workSessions.map((session) => (session.id === id ? { ...session, ...patch } : session)) });
  }

  function addSession() {
    const last = entry.workSessions.at(-1);
    const start = last?.endTime || entry.checkInTime || "9";
    const end = formatHour((Number(start) || 9) + 1);
    updateEntry({
      ...entry,
      workSessions: [...entry.workSessions, { id: uid(), startTime: start, endTime: end, category: "연구", plan: "", achievement: "" }],
    });
  }

  function removeSession(id: string) {
    updateEntry({ ...entry, workSessions: entry.workSessions.filter((session) => session.id !== id) });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>월 달력</CardTitle>
          <p className="text-sm text-muted-foreground">{format(new Date(`${entry.date}T00:00:00`), "yyyy년 M월")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => <div key={day} className="py-1">{day}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthDays.map((date) => {
              const key = isoDate(date);
              const day = entryByDate.get(key);
              const selectable = weeklyDates.has(key);
              const selected = key === entry.date;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!selectable}
                  onClick={() => onSelectDate(key)}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center rounded-md border text-sm transition",
                    isSameMonth(date, new Date(`${entry.date}T00:00:00`)) ? "bg-background" : "bg-muted/40 text-muted-foreground",
                    selectable && "border-primary/30 bg-primary/5 hover:bg-primary/10",
                    selected && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                    !selectable && "cursor-default opacity-45",
                  )}
                >
                  <span className="font-semibold">{format(date, "d")}</span>
                  {day && <span className="mt-1 text-[11px]">{totalDailyHours(day).toFixed(1)}h</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            선택한 주차는 진한 테두리로 표시됩니다.
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{displayDate(entry.date)} ({entry.dayOfWeek}) 일지 작성</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">근무 시간 {totalDailyHours(entry).toFixed(1)}시간</p>
          </div>
          <Button onClick={addSession}><Plus size={16} /> 세션 추가</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium">출근 시간<Input value={entry.checkInTime} onChange={(e) => updateEntry({ ...entry, checkInTime: e.target.value })} placeholder="7.5" /></label>
            <label className="text-sm font-medium">퇴근 시간<Input value={entry.checkOutTime} onChange={(e) => updateEntry({ ...entry, checkOutTime: e.target.value })} placeholder="22" /></label>
          </div>
          <label className="block text-sm font-medium">
            메모
            <Textarea
              className="mt-1 min-h-16"
              value={entry.memo ?? ""}
              onChange={(e) => updateEntry({ ...entry, memo: e.target.value })}
              placeholder="회의 내용, 특이사항, 다음에 확인할 내용을 간단히 적어두세요."
            />
          </label>
          {isInvalidRange(entry.checkInTime, entry.checkOutTime) && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">퇴근 시간이 출근 시간보다 빠릅니다.</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="w-24 p-2 text-left">시작</th>
                  <th className="w-24 p-2 text-left">종료</th>
                  <th className="w-28 p-2 text-left">시간</th>
                  <th className="w-32 p-2 text-left">카테고리</th>
                  <th className="p-2 text-left">계획</th>
                  <th className="p-2 text-left">실적</th>
                  <th className="w-16 p-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {entry.workSessions.map((session) => (
                  <tr key={session.id} className="border-b align-top">
                    <td className="p-2"><Input value={session.startTime} onChange={(e) => updateSession(session.id, { startTime: e.target.value })} /></td>
                    <td className="p-2"><Input value={session.endTime} onChange={(e) => updateSession(session.id, { endTime: e.target.value })} /></td>
                    <td className="p-2">
                      {isInvalidRange(session.startTime, session.endTime) ? <span className="text-destructive">시간 오류</span> : `${hourDiff(session.startTime, session.endTime).toFixed(1)}h`}
                    </td>
                    <td className="p-2"><Select value={session.category} onChange={(e) => updateSession(session.id, { category: e.target.value as Category })}>{categories.map((category) => <option key={category}>{category}</option>)}</Select></td>
                    <td className="p-2"><Textarea value={session.plan} onChange={(e) => updateSession(session.id, { plan: e.target.value })} /></td>
                    <td className="p-2"><Textarea value={session.achievement} onChange={(e) => updateSession(session.id, { achievement: e.target.value })} /></td>
                    <td className="p-2"><OutlineButton className="h-9 w-9 px-0" onClick={() => removeSession(session.id)} title="삭제"><Trash2 size={16} /></OutlineButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildMonthDays(iso: string) {
  const base = new Date(`${iso}T00:00:00`);
  const start = startOfWeek(startOfMonth(base), { weekStartsOn: 1 });
  const end = addDays(startOfWeek(addDays(endOfMonth(base), 6), { weekStartsOn: 1 }), 6);
  const days: Date[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
}
