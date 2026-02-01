import { useState, useRef, useEffect } from "react";
import { Plus, X, Sunrise, Sun } from "lucide-react";

export interface TimeWindow {
  id: string;
  startTime: string;
  endTime: string;
}

interface TimeWindowPickerProps {
  windows: TimeWindow[];
  onWindowsChange: (windows: TimeWindow[]) => void;
}

const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : "";
  return `${displayHours}${displayMinutes}${period}`;
};

const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      options.push(timeString);
    }
  }
  return options;
};

const TimeWindowPicker = ({
  windows,
  onWindowsChange,
}: TimeWindowPickerProps) => {
  const [activeDropdown, setActiveDropdown] = useState<{ id: string; type: 'start' | 'end' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeOptions = generateTimeOptions();

  const handleTimeChange = (id: string, type: 'start' | 'end', time: string) => {
    const updatedWindows = windows.map(w => {
      if (w.id === id) {
        return { ...w, [type === 'start' ? 'startTime' : 'endTime']: time };
      }
      return w;
    });
    onWindowsChange(updatedWindows);
    setActiveDropdown(null);
  };

  const addWindow = () => {
    if (windows.length >= 3) return; // Limit to 3 windows for now

    // Smart default: start 1 hour after the last window ends
    const lastWindow = windows[windows.length - 1];
    let startHour = 14;
    let startMinute = 0;

    if (lastWindow) {
      const [h, m] = lastWindow.endTime.split(':').map(Number);
      startHour = h + 1;
      startMinute = m;
    }

    // Normalize if > 23
    if (startHour >= 23) startHour = 22;

    const endHour = startHour + 1;

    const newWindow: TimeWindow = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
      endTime: `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
    };

    onWindowsChange([...windows, newWindow]);
  };

  const removeWindow = (id: string) => {
    onWindowsChange(windows.filter(w => w.id !== id));
  };

  useEffect(() => {
    if (activeDropdown && dropdownRef.current) {
      const window = windows.find(w => w.id === activeDropdown.id);
      if (window) {
        const timeToCheck = activeDropdown.type === 'start' ? window.startTime : window.endTime;
        const currentIndex = timeOptions.indexOf(timeToCheck);
        if (currentIndex !== -1) {
          dropdownRef.current.scrollTop = currentIndex * 48;
        }
      }
    }
  }, [activeDropdown, windows]);

  return (
    <div className="text-center space-y-6">
      <p className="conversational-text text-2xl sm:text-3xl text-foreground">
        I have from
      </p>

      <div className="space-y-4">
        {windows.map((window, index) => (
          <div key={window.id} className="relative group/window animate-fade-in flex flex-col items-center">

            <div className="flex items-center justify-center gap-3 flex-wrap relative z-10">
              {/* Start Time */}
              <div className="flex items-center gap-2">
                {/* Preset Buttons */}
                <div className="flex flex-col gap-1 mr-2">
                  <button
                    onClick={() => {
                      const updatedWindows = windows.map(w => w.id === window.id ? { ...w, startTime: "09:00", endTime: "12:00" } : w);
                      onWindowsChange(updatedWindows);
                    }}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/preset"
                    title="Morning (9am - 12pm)"
                  >
                    <Sunrise className="w-4 h-4 text-primary/40 group-hover/preset:text-primary transition-colors" />
                  </button>
                  <button
                    onClick={() => {
                      const updatedWindows = windows.map(w => w.id === window.id ? { ...w, startTime: "09:00", endTime: "17:00" } : w);
                      onWindowsChange(updatedWindows);
                    }}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/preset"
                    title="Workday (9am - 5pm)"
                  >
                    <Sun className="w-4 h-4 text-primary/40 group-hover/preset:text-primary transition-colors" />
                  </button>
                </div>

                <div className="relative inline-block">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown?.id === window.id && activeDropdown.type === 'start' ? null : { id: window.id, type: 'start' })}
                    className="group relative px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl flex justify-center items-center min-w-[200px]"
                  >
                    <span className="time-display text-4xl sm:text-5xl md:text-6xl text-primary leading-none text-center pb-1">
                      {formatTimeDisplay(window.startTime)}
                    </span>
                  </button>

                  {activeDropdown?.id === window.id && activeDropdown.type === 'start' && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setActiveDropdown(null)} />
                      <div
                        ref={dropdownRef}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 w-48 max-h-64 overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
                      >
                        {timeOptions.map((time) => (
                          <button
                            key={time}
                            onClick={() => handleTimeChange(window.id, 'start', time)}
                            className={`w-full px-4 py-3 text-center hover:bg-white/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${time === window.startTime ? "bg-white/30 text-primary font-semibold" : "text-foreground"
                              }`}
                          >
                            {formatTimeDisplay(time)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <span className="time-display text-4xl sm:text-5xl md:text-6xl text-primary">-</span>

              {/* End Time */}
              <div className="relative inline-block">
                <button
                  onClick={() => setActiveDropdown(activeDropdown?.id === window.id && activeDropdown.type === 'end' ? null : { id: window.id, type: 'end' })}
                  className="group relative px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl flex justify-center items-center min-w-[200px]"
                >
                  <span className="time-display text-4xl sm:text-5xl md:text-6xl text-primary leading-none text-center pb-1">
                    {formatTimeDisplay(window.endTime)}
                  </span>
                </button>

                {activeDropdown?.id === window.id && activeDropdown.type === 'end' && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setActiveDropdown(null)} />
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 w-48 max-h-64 overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
                    >
                      {timeOptions.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeChange(window.id, 'end', time)}
                          className={`w-full px-4 py-3 text-center hover:bg-white/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${time === window.endTime ? "bg-white/30 text-primary font-semibold" : "text-foreground"
                            }`}
                        >
                          {formatTimeDisplay(time)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>


              {/* Add Time Button (only for last window) */}
              {index === windows.length - 1 && windows.length < 3 && (
                <button
                  onClick={addWindow}
                  className="absolute left-full ml-4 top-1/2 -translate-y-1/2 group/add p-3 rounded-full backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center"
                  aria-label="Add time window"
                >
                  <Plus className="w-5 h-5 text-primary/70 group-hover/add:text-primary transition-colors" />
                </button>
              )}
            </div>

            {/* Remove Button (only if > 1 window) */}
            {windows.length > 1 && (
              <button
                onClick={() => removeWindow(window.id)}
                className="mt-2 text-muted-foreground hover:text-destructive transition-colors text-sm flex items-center gap-1 opacity-0 group-hover/window:opacity-100"
              >
                <X className="w-4 h-4" /> Remove window
              </button>
            )}
          </div>
        ))}
      </div>



      <p className="conversational-text text-2xl sm:text-3xl text-foreground pt-4">
        free today,
      </p>
    </div >
  );
};

export default TimeWindowPicker;
