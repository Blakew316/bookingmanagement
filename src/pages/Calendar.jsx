import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { formatTime } from '../lib/formatters';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_CHIP_COLORS = {
  inquiry: 'bg-gray-400',
  proposal: 'bg-amber-400',
  confirmed: 'bg-green-500',
  completed: 'bg-gray-300',
  cancelled: 'bg-red-400',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

/** Build a 42-cell (6x7) array of day objects for the given month. */
function buildCalendarDays(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const days = [];

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, month, year, isCurrentMonth: true });
  }

  // Trailing days from next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let trailing = 1;
  while (days.length < 42) {
    days.push({
      day: trailing++,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  return days;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function dateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EventChip({ event, onClick }) {
  const color = EVENT_CHIP_COLORS[event.status] || 'bg-gray-400';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(event.id);
      }}
      className={`
        group flex items-center gap-1 w-full rounded-md px-1.5 py-0.5 text-left
        transition-all duration-150 hover:brightness-110 hover:shadow-sm
      `}
    >
      <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="truncate text-[11px] font-medium text-gray-700 group-hover:text-gray-900">
        {event.title}
      </span>
      {event.start_time && (
        <span className="ml-auto shrink-0 text-[10px] text-gray-400">
          {formatTime(event.start_time)}
        </span>
      )}
    </button>
  );
}

function MobileEventCard({ event, onClick }) {
  const color = EVENT_CHIP_COLORS[event.status] || 'bg-gray-400';

  return (
    <button
      onClick={() => onClick(event.id)}
      className="flex items-center gap-3 w-full rounded-lg bg-white p-3 border border-gray-100
                 hover:bg-gray-50 transition-all duration-200 text-left"
    >
      <span className={`shrink-0 h-3 w-3 rounded-full ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {event.start_time && (
            <span className="text-xs text-gray-500">{formatTime(event.start_time)}</span>
          )}
          <Badge status={event.status} type="event" />
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Calendar Component
// ---------------------------------------------------------------------------

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonth);
  const [selectedDay, setSelectedDay] = useState(null);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next, 0 = none

  // Build API path for the current month
  const lastDay = getDaysInMonth(currentYear, currentMonth);
  const fromDate = `${currentYear}-${pad(currentMonth + 1)}-01`;
  const toDate = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay)}`;
  const apiPath = `/events?from=${fromDate}&to=${toDate}`;

  const { data: events, loading, error, refetch } = useApi(apiPath);

  // Index events by date string for O(1) lookup
  const eventsByDate = useMemo(() => {
    const map = {};
    if (!events || !Array.isArray(events)) return map;
    events.forEach((evt) => {
      const key = evt.event_date;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [events]);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  // Navigation helpers
  const goToPrevMonth = useCallback(() => {
    setDirection(-1);
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setDirection(0);
    setSelectedDay(null);
    setCurrentYear(todayYear);
    setCurrentMonth(todayMonth);
  }, [todayYear, todayMonth]);

  const handleEventClick = useCallback(
    (id) => navigate(`/events/${id}`),
    [navigate],
  );

  const isToday = (d) =>
    d.isCurrentMonth &&
    d.day === todayDate &&
    d.month === todayMonth &&
    d.year === todayYear;

  const isSelected = (d) =>
    selectedDay &&
    d.day === selectedDay.day &&
    d.month === selectedDay.month &&
    d.year === selectedDay.year;

  // Events for mobile day view
  const selectedDateEvents = useMemo(() => {
    if (!selectedDay) return [];
    const key = dateKey(selectedDay.year, selectedDay.month, selectedDay.day);
    return eventsByDate[key] || [];
  }, [selectedDay, eventsByDate]);

  // Determine animation class based on direction
  const slideClass =
    direction === -1
      ? 'animate-slide-in-left'
      : direction === 1
        ? 'animate-slide-in-right'
        : 'animate-fade-in';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
          <CalendarDays className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500">View and manage your events</p>
        </div>
      </div>

      <Card padding={false} className="overflow-hidden">
        {/* Calendar header / controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900 min-w-[200px]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg
                       hover:bg-gray-200 transition-colors duration-150"
          >
            Today
          </button>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-red-500">Failed to load events.</p>
            <button
              onClick={refetch}
              className="text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Desktop grid calendar */}
            <div className="hidden md:block">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAY_HEADERS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div key={`${currentYear}-${currentMonth}`} className={`grid grid-cols-7 ${slideClass}`}>
                {calendarDays.map((d, idx) => {
                  const key = dateKey(d.year, d.month, d.day);
                  const dayEvents = eventsByDate[key] || [];
                  const visibleEvents = dayEvents.slice(0, 3);
                  const extraCount = dayEvents.length - 3;
                  const isTodayCell = isToday(d);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDay(d)}
                      className={`
                        relative min-h-[110px] border-b border-r border-gray-50 p-1.5
                        transition-colors duration-150 cursor-pointer
                        hover:bg-gray-50/70
                        ${!d.isCurrentMonth ? 'bg-gray-50/40' : 'bg-white'}
                        ${isSelected(d) ? 'bg-gray-100/50' : ''}
                      `}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-center mb-1">
                        <span
                          className={`
                            flex items-center justify-center h-7 w-7 text-sm font-medium rounded-full
                            transition-all duration-150
                            ${isTodayCell
                              ? 'bg-gray-900 text-white'
                              : d.isCurrentMonth
                                ? 'text-gray-900 hover:bg-gray-100'
                                : 'text-gray-300'
                            }
                          `}
                        >
                          {d.day}
                        </span>
                      </div>

                      {/* Event chips */}
                      <div className="space-y-0.5">
                        {visibleEvents.map((evt) => (
                          <EventChip
                            key={evt.id}
                            event={evt}
                            onClick={handleEventClick}
                          />
                        ))}
                        {extraCount > 0 && (
                          <p className="text-[10px] font-medium text-gray-500 pl-1.5 mt-0.5">
                            +{extraCount} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile view: compact calendar + day event list */}
            <div className="md:hidden">
              {/* Mini month grid */}
              <div className="px-4 pt-3 pb-2">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAY_HEADERS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] font-semibold text-gray-400 uppercase"
                    >
                      {d.charAt(0)}
                    </div>
                  ))}
                </div>
                <div key={`mobile-${currentYear}-${currentMonth}`} className={`grid grid-cols-7 gap-1 ${slideClass}`}>
                  {calendarDays.map((d, idx) => {
                    const key = dateKey(d.year, d.month, d.day);
                    const dayEvents = eventsByDate[key] || [];
                    const hasEvents = dayEvents.length > 0;
                    const isTodayCell = isToday(d);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDay(d)}
                        className={`
                          relative flex flex-col items-center justify-center py-2 rounded-lg
                          transition-all duration-150
                          ${isTodayCell
                            ? 'bg-gray-900 text-white'
                            : isSelected(d)
                              ? 'bg-gray-200 text-gray-900'
                              : d.isCurrentMonth
                                ? 'text-gray-900 hover:bg-gray-100'
                                : 'text-gray-300'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">{d.day}</span>
                        {hasEvents && (
                          <span
                            className={`
                              absolute bottom-1 h-1 w-1 rounded-full
                              ${isTodayCell ? 'bg-white' : 'bg-gray-900'}
                            `}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected day event list */}
              <div className="border-t border-gray-100 px-4 py-4 min-h-[160px]">
                {selectedDay ? (
                  <>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">
                      {MONTH_NAMES[selectedDay.month]} {selectedDay.day}, {selectedDay.year}
                    </h3>
                    {selectedDateEvents.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">
                        No events this day
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDateEvents.map((evt) => (
                          <MobileEventCard
                            key={evt.id}
                            event={evt}
                            onClick={handleEventClick}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Select a day to view events
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Inline keyframe styles for slide transitions */}
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.25s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
