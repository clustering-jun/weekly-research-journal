import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "./ui";
import { displayDate, hourDiff, totalDailyHours, totalJournalHours } from "../lib/utils";
import type { WeeklyJournal } from "../types";

const colors = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#64748b"];
type Props = {
  journal: WeeklyJournal;
  journals: WeeklyJournal[];
};

export function Dashboard({ journal, journals }: Props) {
  const daily = journal.dailyEntries.map((entry) => ({ name: entry.dayOfWeek, hours: Number(totalDailyHours(entry).toFixed(1)) }));
  const categoryMap = new Map<string, number>();
  let planCount = 0;
  let achievementCount = 0;
  journal.dailyEntries.forEach((entry) => {
    entry.workSessions.forEach((session) => {
      categoryMap.set(session.category, (categoryMap.get(session.category) ?? 0) + hourDiff(session.startTime, session.endTime));
      if (session.plan.trim()) planCount += 1;
      if (session.achievement.trim()) achievementCount += 1;
    });
  });
  const category = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }));
  const sessions = journal.dailyEntries.flatMap((entry) => entry.workSessions.map((session) => ({ ...session, date: entry.date, day: entry.dayOfWeek })));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat title="이번 주 총 근무" value={`${totalJournalHours(journal).toFixed(1)}시간`} />
        <Stat title="업무 세션" value={`${sessions.length}개`} />
        <Stat title="계획 작성" value={`${planCount}/${sessions.length}`} />
        <Stat title="실적 작성" value={`${achievementCount}/${sessions.length}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>요일별 근무 시간</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>업무 카테고리 비율</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={category} dataKey="value" nameKey="name" outerRadius={90} label>
                  {category.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>최근 작성한 일지</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {journals.slice().sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate)).slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span>{item.weekStartDate} 주차</span>
                <Badge>{totalJournalHours(item).toFixed(1)}h</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>이번 주 주요 실적</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sessions.filter((s) => s.achievement.trim()).slice(0, 5).map((s) => (
              <p key={s.id}><Badge className="mr-2">{displayDate(s.date)} {s.day}</Badge>{s.achievement}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>다음 주 계획 미리보기</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["과제", journal.nextWeekPlan.project],
              ["연구", journal.nextWeekPlan.research],
              ["논문", journal.nextWeekPlan.paper],
              ["대회", journal.nextWeekPlan.competition],
              ["기타", journal.nextWeekPlan.etc],
            ].map(([label, value]) => <p key={label}><Badge className="mr-2">{label}</Badge>{value || "미작성"}</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-semibold">{value}</div></CardContent>
    </Card>
  );
}
