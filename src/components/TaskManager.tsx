import { useState } from "react";
import { X, Pencil } from "lucide-react";

export interface Task {
  name: string;
  duration: number; // in minutes
  isOutside: boolean; // outdoor flag
}

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

// AI-powered duration estimation based on task name
const estimateDuration = (taskName: string): number => {
  const lower = taskName.toLowerCase();
  if (lower.includes('gym') || lower.includes('workout')) return 60;
  if (lower.includes('walk')) return 30;
  if (lower.includes('run') || lower.includes('jog')) return 45;
  if (lower.includes('meeting')) return 30;
  if (lower.includes('research') || lower.includes('study')) return 90;
  if (lower.includes('email')) return 15;
  if (lower.includes('lunch') || lower.includes('dinner')) return 45;
  if (lower.includes('breakfast')) return 20;
  if (lower.includes('coffee') || lower.includes('tea')) return 15;
  if (lower.includes('call') || lower.includes('phone')) return 20;
  return 30; // default
};

// Detect if task is outdoor based on keywords
const detectOutdoor = (taskName: string): boolean => {
  const outdoorKeywords = ['walk', 'run', 'jog', 'bike', 'hike', 'park',
    'outdoor', 'outside', 'garden', 'yard', 'beach', 'trail', 'cycling'];
  return outdoorKeywords.some(keyword =>
    taskName.toLowerCase().includes(keyword)
  );
};

const TaskManager = ({ tasks, onTasksChange }: TaskManagerProps) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDuration, setEditingDuration] = useState(30);

  // Auto-estimate duration when task name changes
  const handleTaskNameChange = (name: string) => {
    setNewTaskName(name);
    if (name.trim()) {
      const estimated = estimateDuration(name);
      setNewTaskDuration(estimated);
    }
  };

  const addTask = () => {
    if (newTaskName.trim() && tasks.length < 10) {
      const isOutside = detectOutdoor(newTaskName);
      onTasksChange([...tasks, {
        name: newTaskName.trim(),
        duration: newTaskDuration,
        isOutside
      }]);
      setNewTaskName("");
      setNewTaskDuration(30);
    }
  };

  const clearAllTasks = () => {
    onTasksChange([]);
  };

  const removeTask = (index: number) => {
    onTasksChange(tasks.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingName(tasks[index].name);
    setEditingDuration(tasks[index].duration);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingName.trim()) {
      const isOutside = detectOutdoor(editingName);
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = {
        name: editingName.trim(),
        duration: editingDuration,
        isOutside
      };
      onTasksChange(updatedTasks);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
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
        <div className="flex justify-center">
          <ul className="space-y-2 inline-block">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="flex items-center gap-3 group animate-fade-in"
              >
                <span className="text-primary text-2xl">•</span>

                {editingIndex === index ? (
                  // Editing mode
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="input-conversational text-xl text-primary w-32 sm:w-40"
                      autoFocus
                    />
                    <span className="conversational-text text-lg text-muted-foreground">~</span>
                    <input
                      type="number"
                      value={editingDuration}
                      onChange={(e) => setEditingDuration(Math.max(5, parseInt(e.target.value) || 5))}
                      className="input-conversational text-xl text-primary w-16 text-center"
                      min={5}
                    />
                    <span className="conversational-text text-lg text-muted-foreground">mins</span>
                    <button
                      onClick={saveEdit}
                      className="text-primary hover:text-primary/70 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  // Display mode
                  <>
                    <span className="task-item text-xl sm:text-2xl text-primary">
                      {task.name} ~{task.duration} mins.
                    </span>
                    <button
                      onClick={() => startEditing(index)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
                      aria-label={`Edit ${task.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeTask(index)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      aria-label={`Remove ${task.name}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Clear All button */}
      {tasks.length > 0 && (
        <button
          onClick={clearAllTasks}
          className="text-sm text-primary/60 hover:text-primary transition-colors underline underline-offset-2"
        >
          Clear all
        </button>
      )}

      {/* Add new task */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <div className="flex items-baseline gap-2">
          <span className="text-primary text-2xl">•</span>
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => handleTaskNameChange(e.target.value)}
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
