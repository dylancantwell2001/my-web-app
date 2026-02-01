import type { ScheduleItem } from "@/components/ScheduleDisplay";
import type { Task } from "@/components/TaskManager";

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Convert minutes to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function generateSchedule(
  tasks: Task[],
  startTime: string,
  endTime: string
): ScheduleItem[] {
  if (tasks.length === 0) return [];

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalMinutes = endMinutes - startMinutes;

  if (totalMinutes <= 0) return [];

  // PRD Algorithm: Separate outdoor and indoor tasks
  const outdoorTasks = tasks.filter(t => t.isOutside);
  const indoorTasks = tasks.filter(t => !t.isOutside);

  // Shuffle each group independently
  const shuffledOutdoor = shuffle(outdoorTasks);
  const shuffledIndoor = shuffle(indoorTasks);

  // Group consecutive outdoor tasks together and interleave with indoor
  const interleavedTasks: Task[] = [];
  let outdoorIndex = 0;
  let indoorIndex = 0;

  while (outdoorIndex < shuffledOutdoor.length || indoorIndex < shuffledIndoor.length) {
    // Add an indoor task if available
    if (indoorIndex < shuffledIndoor.length) {
      interleavedTasks.push(shuffledIndoor[indoorIndex++]);
    }

    // Add a group of outdoor tasks (1-3 tasks grouped together)
    if (outdoorIndex < shuffledOutdoor.length) {
      const groupSize = Math.min(
        Math.floor(Math.random() * 3) + 1, // Random 1-3 tasks
        shuffledOutdoor.length - outdoorIndex
      );
      for (let i = 0; i < groupSize; i++) {
        interleavedTasks.push(shuffledOutdoor[outdoorIndex++]);
      }
    }
  }

  const schedule: ScheduleItem[] = [];
  let currentTime = startMinutes;

  interleavedTasks.forEach((task) => {
    // Use the exact duration specified by the user
    const duration = task.duration;

    // Ensure we don't exceed end time
    if (currentTime + duration > endMinutes) {
      // Skip this task if it doesn't fit
      return;
    }

    schedule.push({
      task: task.name,
      startTime: minutesToTime(currentTime),
      endTime: minutesToTime(currentTime + duration),
      duration,
    });
    currentTime += duration;
  });

  return schedule;
}

export function generateICS(schedule: ScheduleItem[]): string {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

  const events = schedule.map((item) => {
    const startTimeFormatted = item.startTime.replace(":", "") + "00";
    const endTimeFormatted = item.endTime.replace(":", "") + "00";
    const uid = `${dateStr}-${item.startTime}-${Math.random().toString(36).substr(2, 9)}@wackycalendar`;

    return `BEGIN:VEVENT
DTSTART:${dateStr}T${startTimeFormatted}
DTEND:${dateStr}T${endTimeFormatted}
SUMMARY:${item.task}
DESCRIPTION:Scheduled by Wacky Calendar 🎲
UID:${uid}
END:VEVENT`;
  }).join("\n");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wacky Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events}
END:VCALENDAR`;
}

export function downloadICS(schedule: ScheduleItem[]): void {
  const icsContent = generateICS(schedule);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  // Generate filename with date: wacky-calendar-YYYY-MM-DD.ics
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  link.download = `wacky-calendar-${dateStr}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
