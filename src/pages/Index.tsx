import { useState, useCallback } from "react";
import WavyBackground from "@/components/WavyBackground";
import TimeWindowPicker from "@/components/TimeWindowPicker";
import TaskManager, { type Task } from "@/components/TaskManager";
import ShuffleButton from "@/components/ShuffleButton";
import ScheduleDisplay, { type ScheduleItem } from "@/components/ScheduleDisplay";
import { generateSchedule, downloadICS } from "@/lib/scheduleGenerator";
import { toast } from "sonner";

const Index = () => {
  // Calculate dynamic default times based on current time
  const getDefaultTimes = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Round to nearest 30 minutes
    const roundedMinutes = currentMinutes < 30 ? "00" : "30";
    const startHour = currentMinutes < 30 ? currentHour : currentHour + 1;

    // Calculate end time (1 hour ahead)
    const endHour = startHour + 1;

    return {
      start: `${startHour.toString().padStart(2, "0")}:${roundedMinutes}`,
      end: `${endHour.toString().padStart(2, "0")}:${roundedMinutes}`
    };
  };

  const defaultTimes = getDefaultTimes();
  const [startTime, setStartTime] = useState(defaultTimes.start);
  const [endTime, setEndTime] = useState(defaultTimes.end);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = useCallback(() => {
    if (tasks.length === 0) {
      toast.error("Add some tasks first!");
      return;
    }

    const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
    const endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

    if (endMinutes <= startMinutes) {
      toast.error("End time must be after start time!");
      return;
    }

    setIsShuffling(true);

    // Add a small delay for the animation effect
    setTimeout(() => {
      const newSchedule = generateSchedule(tasks, startTime, endTime);
      setSchedule(newSchedule);
      setIsShuffling(false);
      toast.success("Your wacky schedule is ready! 🎲");
    }, 600);
  }, [tasks, startTime, endTime]);

  const handleExport = useCallback(() => {
    if (schedule.length === 0) return;
    downloadICS(schedule);
    toast.success("Calendar exported! 📅");
  }, [schedule]);

  const canShuffle = tasks.length > 0;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <WavyBackground />

      <div className="main-content min-h-screen flex flex-col justify-center py-12 px-6">
        <div className="max-w-2xl mx-auto w-full space-y-10">

          <TimeWindowPicker
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
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
            <ScheduleDisplay schedule={schedule} onExport={handleExport} />
          )}

        </div>
      </div>
    </div>
  );
};

export default Index;
