import { useGoogleLogin } from "@react-oauth/google";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type ScheduleItem } from "./ScheduleDisplay";

interface GoogleCalendarButtonProps {
    schedule: ScheduleItem[];
    onSuccess?: () => void;
}

const GoogleCalendarButton = ({ schedule, onSuccess }: GoogleCalendarButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const createEvent = async (task: ScheduleItem, token: string) => {
        // Current date logic from scheduleGenerator
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

        // Convert 24h time time to full ISO string
        const startTimeISO = `${dateStr}T${task.startTime}:00`;
        const endTimeISO = `${dateStr}T${task.endTime}:00`;

        const event = {
            summary: task.task,
            description: "Scheduled by Wacky Calendar 🎲",
            start: {
                dateTime: new Date(startTimeISO).toISOString(), // Ensure correct timezone
            },
            end: {
                dateTime: new Date(endTimeISO).toISOString(),
            },
        };

        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to create event: ${task.task}`);
        }

        return response.json();
    };

    const login = useGoogleLogin({
        scope: "https://www.googleapis.com/auth/calendar.events",
        onSuccess: async (response) => {
            if (response.access_token) {
                setIsLoading(true);
                let successCount = 0;
                let failCount = 0;

                try {
                    // Process sequentially to avoid rate limits and ordering issues
                    for (const item of schedule) {
                        try {
                            await createEvent(item, response.access_token);
                            successCount++;
                        } catch (error) {
                            console.error(error);
                            failCount++;
                        }
                    }

                    if (successCount > 0) {
                        toast.success(`Allocated ${successCount} tasks to your calendar! 📅`);
                        onSuccess?.();
                    }
                    if (failCount > 0) {
                        toast.error(`Failed to add ${failCount} tasks.`);
                    }
                } catch (error) {
                    toast.error("Something went wrong while adding events.");
                } finally {
                    setIsLoading(false);
                }
            }
        },
        onError: () => {
            toast.error("Login Failed");
            setIsLoading(false);
        },
    });

    return (
        <button
            onClick={() => login()}
            disabled={isLoading}
            className="btn-main text-lg px-6 py-2 flex items-center gap-2"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <CalendarPlus className="w-5 h-5" />
            )}
            {isLoading ? "Adding..." : "Add to Google Calendar"}
        </button>
    );
};

export default GoogleCalendarButton;
