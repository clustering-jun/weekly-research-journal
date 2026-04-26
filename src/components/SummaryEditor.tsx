import type { WeeklyJournal } from "../types";
import { Card, CardContent, CardHeader, CardTitle, Textarea } from "./ui";

type Props = {
  journal: WeeklyJournal;
  onChange: (journal: WeeklyJournal) => void;
};

export function SummaryEditor({ journal, onChange }: Props) {
  const summaryFields = [
    ["overall", "전체"],
    ["project", "과제"],
    ["research", "연구"],
    ["paper", "논문"],
    ["competition", "대회"],
    ["etc", "기타"],
  ] as const;
  const nextFields = [
    ["project", "과제"],
    ["research", "연구"],
    ["paper", "논문"],
    ["competition", "대회"],
    ["etc", "기타"],
  ] as const;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>이번주 총평</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {summaryFields.map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">{label}
              <Textarea value={journal.weeklySummary[key]} onChange={(e) => onChange({ ...journal, weeklySummary: { ...journal.weeklySummary, [key]: e.target.value } })} />
            </label>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>다음주 계획</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {nextFields.map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">{label}
              <Textarea value={journal.nextWeekPlan[key]} onChange={(e) => onChange({ ...journal, nextWeekPlan: { ...journal.nextWeekPlan, [key]: e.target.value } })} />
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
