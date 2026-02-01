import { Download, Copy } from "lucide-react";
import { toast } from "sonner";
import GoogleCalendarButton from "./GoogleCalendarButton";

export interface ScheduleItem {
  task: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface ScheduleDisplayProps {
  schedule: ScheduleItem[];
  onExport: () => void;
}

// Format time for display (e.g., "14:00" -> "2:00pm")
const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
};

const ScheduleDisplay = ({ schedule, onExport }: ScheduleDisplayProps) => {
  const copyToClipboard = () => {
    const text = schedule
      .map((item, index) =>
        `${index + 1}. ${item.task}: ${formatTimeDisplay(item.startTime)} - ${formatTimeDisplay(item.endTime)} (${item.duration} mins)`
      )
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      toast.success("Schedule copied to clipboard! 📋");
    });
  };
  if (schedule.length === 0) return null;

  return (
    <div className="space-y-6 text-center animate-fade-in">
      <div className="h-px bg-primary/20 max-w-xs mx-auto" />

      <p className="conversational-text text-2xl sm:text-3xl text-foreground">
        Here's your wacky schedule:
      </p>

      <ul className="space-y-3 text-left max-w-md mx-auto">
        {schedule.map((item, index) => (
          <li
            key={index}
            className="schedule-item flex gap-4 items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full py-3 px-6 shadow-sm hover:bg-white/10 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-primary/70 text-lg font-bold min-w-[1.5rem]">
              {index + 1}.
            </span>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
              <span className="task-item text-xl sm:text-2xl text-primary font-medium truncate">
                {item.task}
              </span>
              <span className="conversational-text text-sm sm:text-base text-muted-foreground whitespace-nowrap">
                {formatTimeDisplay(item.startTime)} – {formatTimeDisplay(item.endTime)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-primary/80 hover:text-primary conversational-text"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>

        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-primary/80 hover:text-primary conversational-text"
        >
          <Download className="w-4 h-4" />
          Download ICS
        </button>



        <GoogleCalendarButton schedule={schedule} />
      </div>
    </div>
  );
};

export default ScheduleDisplay;
