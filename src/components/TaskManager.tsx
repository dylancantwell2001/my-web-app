import { useState, useRef, useEffect } from "react";
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

const generateDurationOptions = (): number[] => {
  const options: number[] = [];
  for (let i = 5; i <= 240; i += 5) { // Cap at 4 hours for dropdown usability, though logic allows 480
    options.push(i);
  }
  return options;
};

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

  const [activeDropdown, setActiveDropdown] = useState<'new' | number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const durationOptions = generateDurationOptions();

  useEffect(() => {
    if (activeDropdown !== null && dropdownRef.current) {
      let durationToCheck = 30;
      if (activeDropdown === 'new') {
        durationToCheck = newTaskDuration;
      } else if (typeof activeDropdown === 'number') {
        durationToCheck = editingDuration;
      }

      const currentIndex = durationOptions.indexOf(durationToCheck);
      if (currentIndex !== -1) {
        dropdownRef.current.scrollTop = currentIndex * 40; // Approx height of item
      }
    }
  }, [activeDropdown, newTaskDuration, editingDuration]);

  // Auto-estimate duration when task name changes
  const handleTaskNameChange = (name: string) => {
    setNewTaskName(name);
    if (name.trim()) {
      const estimated = estimateDuration(name);
      setNewTaskDuration(estimated);
    }
  };

  const addTask = () => {
    const trimmedName = newTaskName.trim();
    const safeDuration = Math.max(5, Math.min(480, newTaskDuration)); // Clamp 5-480

    if (trimmedName && tasks.length < 10 && trimmedName.length <= 50) {
      const isOutside = detectOutdoor(trimmedName);
      onTasksChange([...tasks, {
        name: trimmedName,
        duration: safeDuration,
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
    const trimmedName = editingName.trim();
    const safeDuration = Math.max(5, Math.min(480, editingDuration));

    if (editingIndex !== null && trimmedName && trimmedName.length <= 50) {
      const isOutside = detectOutdoor(trimmedName);
      const updatedTasks = [...tasks];
      updatedTasks[editingIndex] = {
        name: trimmedName,
        duration: safeDuration,
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
          <ul className="space-y-2 flex flex-col items-center">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="relative flex items-center gap-3 group animate-fade-in"
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
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                        className="input-conversational text-xl text-primary min-w-[3rem] text-center hover:bg-white/5 transition-colors rounded-lg cursor-pointer px-2"
                      >
                        {editingDuration}
                      </button>
                      {activeDropdown === index && (
                        <>
                          <div className="fixed inset-0 z-20 cursor-default" onClick={() => setActiveDropdown(null)} />
                          <div
                            ref={dropdownRef}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 w-32 max-h-48 overflow-y-auto rounded-xl backdrop-blur-xl bg-[#1a1a1a] border border-white/20 shadow-2xl"
                          >
                            {durationOptions.map((mins) => (
                              <button
                                key={mins}
                                onClick={() => {
                                  setEditingDuration(mins);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full px-3 py-2 text-center text-sm hover:bg-white/10 transition-colors ${mins === editingDuration ? "bg-white/10 text-primary font-semibold" : "text-foreground"
                                  }`}
                              >
                                {mins} mins
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
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
                    <div className="absolute left-full top-1/2 -translate-y-1/2 pl-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(index)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`Edit ${task.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeTask(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${task.name}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-muted-foreground hover:text-destructive text-sm"
        >
          <X className="w-4 h-4" />
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
          <div className="relative inline-block text-left">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'new' ? null : 'new')}
              className="input-conversational text-xl text-primary min-w-[3rem] text-center hover:bg-white/5 transition-colors rounded-lg cursor-pointer px-2"
            >
              {newTaskDuration}
            </button>
            {activeDropdown === 'new' && (
              <>
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setActiveDropdown(null)} />
                <div
                  ref={dropdownRef}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-32 max-h-60 overflow-y-auto rounded-xl backdrop-blur-xl bg-[#1a1a1a] border border-white/20 shadow-2xl"
                >
                  {durationOptions.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setNewTaskDuration(mins);
                        setActiveDropdown(null);
                      }}
                      className={`w-full px-3 py-2 text-center text-sm hover:bg-white/10 transition-colors ${mins === newTaskDuration ? "bg-white/10 text-primary font-semibold" : "text-foreground"
                        }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
