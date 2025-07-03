import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { Job } from "@/types/job";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  jobs: Job[];
}

export function CalendarView({ jobs }: CalendarViewProps) {
  const [events, setEvents] = useState(
    jobs.map((job) => ({
      title: job.title,
      start: new Date(job.dueDate),
      end: new Date(job.dueDate),
    }))
  );

  return (
    <div className="h-screen">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
