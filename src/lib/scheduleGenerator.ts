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

import type { TimeWindow } from "@/components/TimeWindowPicker";

export function generateSchedule(
  tasks: Task[],
  windows: TimeWindow[]
): ScheduleItem[] {
  if (tasks.length === 0) return [];

  // Sort windows by start time to ensure chronological order
  const sortedWindows = [...windows].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

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

  let currentTaskIndex = 0;

  // Iterate through each time window
  for (const window of sortedWindows) {
    let currentTime = timeToMinutes(window.startTime);
    const windowEndMinutes = timeToMinutes(window.endTime);

    // Try to fit as many tasks as possible into this window
    while (currentTaskIndex < interleavedTasks.length) {
      const task = interleavedTasks[currentTaskIndex];
      const duration = task.duration;

      if (currentTime + duration > windowEndMinutes) {
        // Task doesn't fit in this window, stop and move to next window
        // Note: In a smarter alg, we might try to find a smaller task, but for now we keep order
        break;
      }

      schedule.push({
        task: task.name,
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(currentTime + duration),
        duration,
      });

      currentTime += duration;
      currentTaskIndex++;
    }
  }

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

export function generateGoogleCalendarLink(item: ScheduleItem): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;

  const start = item.startTime.replace(":", "") + "00";
  const end = item.endTime.replace(":", "") + "00";

  const dates = `${datePrefix}T${start}/${datePrefix}T${end}`;
  const text = encodeURIComponent(item.task);
  const details = encodeURIComponent("Scheduled by Wacky Calendar 🎲");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
}
