import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

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
            className="schedule-item flex gap-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-primary/60 text-lg font-semibold min-w-[2rem]">
              {index + 1}.
            </span>
            <div className="flex-1">
              <span className="task-item text-xl sm:text-2xl text-primary block">
                {item.task}
              </span>
              <span className="conversational-text text-base text-muted-foreground">
                {formatTimeDisplay(item.startTime)} – {formatTimeDisplay(item.endTime)} ({item.duration} mins)
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 conversational-text text-base text-primary/70 hover:text-primary transition-colors underline underline-offset-4"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>

        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 conversational-text text-base text-primary/70 hover:text-primary transition-colors underline underline-offset-4"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};

export default ScheduleDisplay;
