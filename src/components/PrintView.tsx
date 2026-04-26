import { Printer } from "lucide-react";
import type { WeeklyJournal } from "../types";
import { displayDate } from "../lib/utils";
import { Button, Card } from "./ui";

type Props = {
  journal: WeeklyJournal;
};

export function PrintView({ journal }: Props) {
  return (
    <div>
      <div className="no-print mb-4 flex justify-end">
        <Button onClick={() => window.print()}><Printer size={16} /> PDF 저장/인쇄</Button>
      </div>
      <Card className="print-sheet mx-auto max-w-[900px] p-6 shadow-sm">
        <div className="mb-4 flex items-end justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 className="text-2xl font-bold">주간 연구 일지</h2>
            <p className="mt-1 text-sm">{journal.weekStartDate} - {journal.weekEndDate}</p>
          </div>
          <div className="text-sm font-semibold">연구자명: {journal.researcherName}</div>
        </div>
        <table className="print-table">
          <colgroup>
            <col className="print-col-date" />
            <col className="print-col-check" />
            <col className="print-col-check" />
            <col className="print-col-time" />
            <col className="print-col-plan" />
            <col className="print-col-achievement" />
          </colgroup>
          <thead>
            <tr>
              <th>일자</th>
              <th>출근</th>
              <th>퇴근</th>
              <th>시간</th>
              <th>계획</th>
              <th>실적</th>
            </tr>
          </thead>
          <tbody>
            {journal.dailyEntries.map((entry) => {
              const rows = entry.workSessions.length
                ? entry.workSessions
                : [{ id: `${entry.date}-empty`, startTime: "", endTime: "", plan: "", achievement: "", category: "기타" }];

              return rows.map((session, index) => (
                <tr key={session.id}>
                  {index === 0 && (
                    <td className="print-cell-center print-cell-date" rowSpan={rows.length}>
                      {displayDate(entry.date)} ({entry.dayOfWeek})
                    </td>
                  )}
                  {index === 0 && <td className="print-cell-center" rowSpan={rows.length}>{entry.checkInTime}</td>}
                  {index === 0 && <td className="print-cell-center" rowSpan={rows.length}>{entry.checkOutTime}</td>}
                  <td className="print-cell-center print-cell-time">
                    {session.startTime && session.endTime ? `${session.startTime}-${session.endTime}` : ""}
                  </td>
                  <td className="print-cell-text"><strong>[{session.category}]</strong> {session.plan}</td>
                  <td className="print-cell-text">{session.achievement}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>

        <h3 className="mt-5 text-base font-semibold">이번 주 총평</h3>
        <SummaryTable rows={[
          ["전체", journal.weeklySummary.overall],
          ["과제", journal.weeklySummary.project],
          ["연구", journal.weeklySummary.research],
          ["논문", journal.weeklySummary.paper],
          ["대회", journal.weeklySummary.competition],
          ["기타", journal.weeklySummary.etc],
        ]} />

        <h3 className="mt-5 text-base font-semibold">다음 주 계획</h3>
        <SummaryTable rows={[
          ["과제", journal.nextWeekPlan.project],
          ["연구", journal.nextWeekPlan.research],
          ["논문", journal.nextWeekPlan.paper],
          ["대회", journal.nextWeekPlan.competition],
          ["기타", journal.nextWeekPlan.etc],
        ]} />
      </Card>
    </div>
  );
}

function SummaryTable({ rows }: { rows: string[][] }) {
  return (
    <table className="print-table summary">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th>{label}</th>
            <td className="print-cell-text">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
