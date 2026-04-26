import { addDays, format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { OutlineButton } from "./ui";

type Props = {
  weekStart: Date;
  onChange: (date: Date) => void;
};

export function WeekNavigator({ weekStart, onChange }: Props) {
  return (
    <div className="no-print mb-4 flex flex-wrap items-center gap-2">
      <OutlineButton onClick={() => onChange(addDays(weekStart, -7))}><ChevronLeft size={16} /> 이전 주</OutlineButton>
      <OutlineButton onClick={() => onChange(new Date())}><CalendarClock size={16} /> 이번 주</OutlineButton>
      <OutlineButton onClick={() => onChange(addDays(weekStart, 7))}>다음 주 <ChevronRight size={16} /></OutlineButton>
      <div className="ml-0 text-sm text-muted-foreground md:ml-2">
        {format(weekStart, "yyyy.MM.dd")} - {format(addDays(weekStart, 6), "yyyy.MM.dd")}
      </div>
    </div>
  );
}
