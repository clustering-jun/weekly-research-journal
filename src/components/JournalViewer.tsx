import { format, parseISO } from "date-fns";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "./ui";
import { cn, hourDiff, totalDailyHours } from "../lib/utils";
import type { DailyEntry, WeeklyJournal } from "../types";

type Props = {
  journals: WeeklyJournal[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

type EntryWithWeek = DailyEntry & {
  weekStartDate: string;
  weekEndDate: string;
};

export function JournalViewer({ journals, selectedDate, onSelectDate }: Props) {
  const entries = journals
    .flatMap((journal) => journal.dailyEntries.map((entry) => ({ ...entry, weekStartDate: journal.weekStartDate, weekEndDate: journal.weekEndDate })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const selectedEntry = entries.find((entry) => entry.date === selectedDate) ?? entries[0];

  if (!entries.length) {
    return (
      <Card>
        <CardHeader><CardTitle>일지 보기</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          아직 저장된 일지가 없습니다. 일지 작성 탭에서 내용을 입력하면 이곳에서 날짜별로 확인할 수 있습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>날짜별 일지</CardTitle>
          <p className="text-sm text-muted-foreground">이전에 작성한 내용을 선택해서 확인합니다.</p>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-180px)] space-y-2 overflow-y-auto">
          {entries.map((entry) => {
            const hours = totalDailyHours(entry);
            const selected = selectedEntry?.date === entry.date;
            const hasMemo = Boolean(entry.memo?.trim());
            const hasContent = hasMemo || entry.workSessions.some((session) => session.plan.trim() || session.achievement.trim());

            return (
              <button
                key={`${entry.weekStartDate}-${entry.date}`}
                type="button"
                onClick={() => onSelectDate(entry.date)}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left text-sm transition hover:bg-accent",
                  selected ? "border-primary bg-primary text-primary-foreground hover:bg-primary" : "bg-background",
                  !hasContent && "opacity-70",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{format(parseISO(entry.date), "yyyy.MM.dd")} ({entry.dayOfWeek})</span>
                  <span className={cn("text-xs", selected ? "text-primary-foreground" : "text-muted-foreground")}>{hours.toFixed(1)}h</span>
                </div>
                <div className={cn("mt-1 flex gap-2 text-xs", selected ? "text-primary-foreground/85" : "text-muted-foreground")}>
                  <span>{entry.workSessions.length}개 세션</span>
                  {hasMemo && <span>메모 있음</span>}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {selectedEntry && <EntryDetail entry={selectedEntry} />}
    </div>
  );
}

function EntryDetail({ entry }: { entry: EntryWithWeek }) {
  const totalHours = totalDailyHours(entry);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{format(parseISO(entry.date), "yyyy년 M월 d일")} ({entry.dayOfWeek})</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{entry.weekStartDate} - {entry.weekEndDate} 주차</p>
          </div>
          <Badge>{totalHours.toFixed(1)}h</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Info label="출근" value={entry.checkInTime || "-"} />
            <Info label="퇴근" value={entry.checkOutTime || "-"} />
            <Info label="세션" value={`${entry.workSessions.length}개`} />
          </div>
          <div className="mt-4 rounded-md bg-muted p-3">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">메모</div>
            <p className="whitespace-pre-wrap text-sm leading-6">{entry.memo?.trim() || "작성된 메모가 없습니다."}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>업무 세션</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {entry.workSessions.length ? entry.workSessions.map((session) => (
            <div key={session.id} className="rounded-md border p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>{session.category}</Badge>
                <span className="text-sm font-medium">{session.startTime || "-"} - {session.endTime || "-"}</span>
                <span className="text-sm text-muted-foreground">{hourDiff(session.startTime, session.endTime).toFixed(1)}h</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <TextBlock label="계획" value={session.plan} />
                <TextBlock label="실적" value={session.achievement} />
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">작성된 업무 세션이 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      <p className="whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-sm leading-6">{value || "미작성"}</p>
    </div>
  );
}
