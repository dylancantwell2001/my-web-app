import { useState, useRef, useEffect } from "react";

interface TimeWindowPickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

// Format time for display (e.g., "14:00" -> "2pm")
const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : "";
  return `${displayHours}${displayMinutes}${period}`;
};

// Generate time options in 15-minute intervals
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
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeWindowPickerProps) => {
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const startDropdownRef = useRef<HTMLDivElement>(null);
  const endDropdownRef = useRef<HTMLDivElement>(null);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const timeOptions = generateTimeOptions();

  // Scroll to current time when dropdown opens
  useEffect(() => {
    if (showStartDropdown && startDropdownRef.current) {
      const currentIndex = timeOptions.indexOf(startTime);
      if (currentIndex !== -1) {
        const buttonHeight = 48; // py-3 = 12px top + 12px bottom + text height ≈ 48px
        startDropdownRef.current.scrollTop = currentIndex * buttonHeight;
      }
    }
  }, [showStartDropdown, startTime, timeOptions]);

  useEffect(() => {
    if (showEndDropdown && endDropdownRef.current) {
      const currentIndex = timeOptions.indexOf(endTime);
      if (currentIndex !== -1) {
        const buttonHeight = 48;
        endDropdownRef.current.scrollTop = currentIndex * buttonHeight;
      }
    }
  }, [showEndDropdown, endTime, timeOptions]);

  return (
    <div className="text-center space-y-2">
      <p className="conversational-text text-2xl sm:text-3xl text-foreground">
        I have from
      </p>

      <div className="flex items-baseline justify-center gap-2 flex-wrap">
        {/* Start Time Dropdown */}
        <div className="relative inline-block">
          <button
            onClick={() => {
              setShowStartDropdown(!showStartDropdown);
              setShowEndDropdown(false);
            }}
            className="group relative px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="time-display text-4xl sm:text-5xl md:text-6xl text-primary">
              {formatTimeDisplay(startTime)}
            </span>
          </button>

          {showStartDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowStartDropdown(false)}
              />
              <div
                ref={startDropdownRef}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-48 max-h-64 overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
              >
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      onStartTimeChange(time);
                      setShowStartDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${time === startTime ? "bg-white/30 text-primary font-semibold" : "text-foreground"
                      }`}
                  >
                    {formatTimeDisplay(time)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <span className="time-display text-4xl sm:text-5xl md:text-6xl text-primary">-</span>

        {/* End Time Dropdown */}
        <div className="relative inline-block">
          <button
            onClick={() => {
              setShowEndDropdown(!showEndDropdown);
              setShowStartDropdown(false);
            }}
            className="group relative px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="time-display text-4xl sm:text-5xl md:text-6xl text-primary">
              {formatTimeDisplay(endTime)}
            </span>
          </button>

          {showEndDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowEndDropdown(false)}
              />
              <div
                ref={endDropdownRef}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-48 max-h-64 overflow-y-auto rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
              >
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      onEndTimeChange(time);
                      setShowEndDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${time === endTime ? "bg-white/30 text-primary font-semibold" : "text-foreground"
                      }`}
                  >
                    {formatTimeDisplay(time)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <span className="conversational-text text-2xl sm:text-3xl text-foreground">
          free today,
        </span>
      </div>
    </div>
  );
};

export default TimeWindowPicker;
