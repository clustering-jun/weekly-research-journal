import { BarChart3, BookOpen, CalendarDays, CalendarRange, FileText, Printer, Settings, ClipboardList } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { cn } from "../lib/utils";

export type View = "dashboard" | "monthly" | "journal" | "viewer" | "summary" | "print" | "settings";

const items: Array<{ id: View; label: string; icon: ElementType }> = [
  { id: "dashboard", label: "대시보드", icon: BarChart3 },
  { id: "monthly", label: "월간 통계", icon: CalendarRange },
  { id: "journal", label: "일지 작성", icon: CalendarDays },
  { id: "viewer", label: "일지 보기", icon: BookOpen },
  { id: "summary", label: "주간 요약", icon: ClipboardList },
  { id: "print", label: "PDF 출력", icon: Printer },
  { id: "settings", label: "설정", icon: Settings },
];

type Props = {
  view: View;
  onViewChange: (view: View) => void;
  onLock: () => void;
  researcherName: string;
  weekLabel: string;
  children: ReactNode;
};

export function Shell({ view, onViewChange, onLock, researcherName, weekLabel, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-60 border-r bg-card lg:block">
        <div className="flex h-20 flex-col justify-center border-b px-5">
          <div className="flex items-center gap-2 font-semibold">
            <FileText size={19} /> 주간 연구 일지
          </div>
          <div className="mt-1 text-xs text-muted-foreground">연구자: {researcherName}</div>
        </div>
        <nav className="p-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn("mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-accent", view === item.id && "bg-primary text-primary-foreground hover:bg-primary")}
              >
                <Icon size={17} /> {item.label}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onLock}
          className="absolute bottom-4 left-5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          잠금화면
        </button>
      </aside>
      <div className="lg:pl-60">
        <header className="no-print sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <h1 className="text-xl font-semibold">주간 연구 일지</h1>
              <p className="text-sm text-muted-foreground">{weekLabel}</p>
            </div>
            <div className="flex gap-1 overflow-x-auto lg:hidden">
              {items.map((item) => (
                <button key={item.id} onClick={() => onViewChange(item.id)} className={cn("whitespace-nowrap rounded-md px-3 py-2 text-sm", view === item.id ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {item.label}
                </button>
              ))}
              <button type="button" onClick={onLock} className="whitespace-nowrap rounded-md bg-muted px-3 py-2 text-sm">
                잠금화면
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-5 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
