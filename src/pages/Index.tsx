import { useState, useCallback } from "react";
import WavyBackground from "@/components/WavyBackground";
import TimeWindowPicker from "@/components/TimeWindowPicker";
import TaskManager, { type Task } from "@/components/TaskManager";
import ShuffleButton from "@/components/ShuffleButton";
import ScheduleDisplay, { type ScheduleItem } from "@/components/ScheduleDisplay";
import { generateSchedule, downloadICS } from "@/lib/scheduleGenerator";
import { toast } from "sonner";

import About from "@/components/About";

const Index = () => {
  // Calculate dynamic default times based on current time
  const getDefaultWindows = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Round to nearest 30 minutes
    const roundedMinutes = currentMinutes < 30 ? "00" : "30";
    const startHour = currentMinutes < 30 ? currentHour : currentHour + 1;
    const endHour = startHour + 1;

    return [{
      id: "default",
      startTime: `${startHour.toString().padStart(2, "0")}:${roundedMinutes}`,
      endTime: `${endHour.toString().padStart(2, "0")}:${roundedMinutes}`
    }];
  };

  const [timeWindows, setTimeWindows] = useState(getDefaultWindows());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = useCallback(() => {
    if (tasks.length === 0) {
      toast.error("Add some tasks first!");
      return;
    }

    // Validate all windows
    let totalAvailableMinutes = 0;

    for (const window of timeWindows) {
      const startMinutes = parseInt(window.startTime.split(":")[0]) * 60 + parseInt(window.startTime.split(":")[1]);
      const endMinutes = parseInt(window.endTime.split(":")[0]) * 60 + parseInt(window.endTime.split(":")[1]);

      if (endMinutes <= startMinutes) {
        toast.error("End time must be after start time for all windows!");
        return;
      }
      totalAvailableMinutes += (endMinutes - startMinutes);
    }

    // Calculate total task duration
    const totalTaskDuration = tasks.reduce((sum, task) => sum + task.duration, 0);

    if (totalTaskDuration > totalAvailableMinutes) {
      const hoursNeeded = Math.floor(totalTaskDuration / 60);
      const minutesNeeded = totalTaskDuration % 60;
      const hoursAvailable = Math.floor(totalAvailableMinutes / 60);
      const minutesAvailable = totalAvailableMinutes % 60;

      toast.error(
        `Tasks are too long! You need ${hoursNeeded}h ${minutesNeeded}m but only have ${hoursAvailable}h ${minutesAvailable}m available.`
      );
      return;
    }

    setIsShuffling(true);

    // Add a small delay for the animation effect
    setTimeout(() => {
      const newSchedule = generateSchedule(tasks, timeWindows);
      setSchedule(newSchedule);
      setIsShuffling(false);
      toast.success("Your wacky schedule is ready! 🎲");
    }, 600);
  }, [tasks, timeWindows]);

  const handleExport = useCallback(() => {
    if (schedule.length === 0) return;
    downloadICS(schedule);
    toast.success("Calendar exported! 📅");
  }, [schedule]);

  const handleRegenerate = useCallback(() => {
    if (tasks.length === 0) return;

    setIsShuffling(true);
    setTimeout(() => {
      const newSchedule = generateSchedule(tasks, timeWindows);
      setSchedule(newSchedule);
      setIsShuffling(false);
      toast.success("Schedule reshuffled! 🎲");
    }, 600);
  }, [tasks, timeWindows]);

  const canShuffle = tasks.length > 0;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <WavyBackground />
      <About />

      <div className="main-content min-h-screen flex flex-col justify-center py-12 px-6">
        <div className="max-w-2xl mx-auto w-full space-y-10">

          <TimeWindowPicker
            windows={timeWindows}
            onWindowsChange={setTimeWindows}
          />

          <TaskManager tasks={tasks} onTasksChange={setTasks} />

          <div className="pt-4">
            <ShuffleButton
              onClick={handleShuffle}
              disabled={!canShuffle}
              isShuffling={isShuffling}
            />
          </div>

          {schedule.length > 0 && (
            <ScheduleDisplay
              schedule={schedule}
              onExport={handleExport}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Index;
