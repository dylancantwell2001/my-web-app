import { useState } from "react";
import { X } from "lucide-react";

export interface Task {
  name: string;
  duration: number; // in minutes
}

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const TaskManager = ({ tasks, onTasksChange }: TaskManagerProps) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);

  const addTask = () => {
    if (newTaskName.trim() && tasks.length < 10) {
      onTasksChange([...tasks, { name: newTaskName.trim(), duration: newTaskDuration }]);
      setNewTaskName("");
      setNewTaskDuration(30);
    }
  };

  const removeTask = (index: number) => {
    onTasksChange(tasks.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  };

  return (
    <div className="space-y-6 text-center">
      <p className="conversational-text text-2xl sm:text-3xl text-foreground">
        I need to do:
      </p>

      {/* Task list */}
      {tasks.length > 0 && (
        <ul className="space-y-2 text-left max-w-md mx-auto">
          {tasks.map((task, index) => (
            <li
              key={index}
              className="flex items-center gap-3 group animate-fade-in"
            >
              <span className="text-primary text-2xl">•</span>
              <span className="task-item text-xl sm:text-2xl text-primary flex-1">
                {task.name} ~{task.duration} mins.
              </span>
              <button
                onClick={() => removeTask(index)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                aria-label={`Remove ${task.name}`}
              >
                <X className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new task */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <div className="flex items-baseline gap-2">
          <span className="text-primary text-2xl">•</span>
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add a task"
            className="input-conversational text-xl sm:text-2xl text-primary w-32 sm:w-40 placeholder:text-primary/40"
            maxLength={30}
          />
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="conversational-text text-lg text-muted-foreground">~</span>
          <input
            type="number"
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(Math.max(5, Math.min(480, parseInt(e.target.value) || 5)))}
            onKeyDown={handleKeyPress}
            className="input-conversational text-xl text-primary w-16 text-center"
            min={5}
            max={480}
          />
          <span className="conversational-text text-lg text-muted-foreground">mins</span>
        </div>
        
        <button
          onClick={addTask}
          disabled={!newTaskName.trim() || tasks.length >= 10}
          className="conversational-text text-lg text-primary/60 hover:text-primary transition-colors disabled:opacity-30"
        >
          + add
        </button>
      </div>

      {tasks.length === 0 && (
        <p className="conversational-text text-muted-foreground text-lg">
          (add your first task above)
        </p>
      )}
    </div>
  );
};

export default TaskManager;
