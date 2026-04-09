"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, StickyNote, Palette, Sun, Moon, Snowflake, Flower } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  text: string;
  dateRange?: string;
  createdAt: string;
}

interface Theme {
  name: string;
  accent: string;
  accentLight: string;
  accentPale: string;
  paper: string;
  paperDark: string;
  ink: string;
  inkLight: string;
  imageQuery: string;
  season: string;
  icon: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const THEMES: Theme[] = [
  {
    name: "Autumn",
    accent: "#c8432b",
    accentLight: "#e8856e",
    accentPale: "#fde8e3",
    paper: "#faf6f0",
    paperDark: "#f0e8db",
    ink: "#1a1209",
    inkLight: "#6b5c44",
    imageQuery: "autumn forest",
    season: "Fall",
    icon: "🍂",
  },
  {
    name: "Winter",
    accent: "#2b5fc8",
    accentLight: "#6e9be8",
    accentPale: "#e3ecfd",
    paper: "#f0f4fa",
    paperDark: "#dbe5f0",
    ink: "#091220",
    inkLight: "#445b6b",
    imageQuery: "snowy mountains winter",
    season: "Winter",
    icon: "❄️",
  },
  {
    name: "Spring",
    accent: "#2b8c4e",
    accentLight: "#6ec48a",
    accentPale: "#e3fded",
    paper: "#f0faf3",
    paperDark: "#dbf0e4",
    ink: "#091a10",
    inkLight: "#446b52",
    imageQuery: "cherry blossom spring",
    season: "Spring",
    icon: "🌸",
  },
  {
    name: "Summer",
    accent: "#c87d2b",
    accentLight: "#e8b86e",
    accentPale: "#fdf3e3",
    paper: "#fafaf0",
    paperDark: "#f0f0db",
    ink: "#1a1709",
    inkLight: "#6b6444",
    imageQuery: "tropical beach summer",
    season: "Summer",
    icon: "☀️",
  },
];

// Indian public holidays (month is 0-indexed)
const HOLIDAYS: Record<string, string> = {
  "0-26": "Republic Day",
  "1-19": "Shivaji Jayanti",
  "3-14": "Ambedkar Jayanti",
  "3-21": "Ram Navami",
  "7-15": "Independence Day",
  "9-2": "Gandhi Jayanti",
  "10-1": "Diwali",
  "11-25": "Christmas",
  "11-31": "New Year's Eve",
};

const UNSPLASH_IMAGES: Record<string, string[]> = {
  Autumn: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80",
    "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&q=80",
  ],
  Winter: [
    "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=600&q=80",
    "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80",
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80",
  ],
  Spring: [
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80",
    "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600&q=80",
  ],
  Summer: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80",
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80",
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateRange(start: Date | null, end: Date | null) {
  if (!start) return "";
  if (!end) return formatDate(start);
  return `${formatDate(start)} → ${formatDate(end)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HangingRing() {
  return (
    <div className="absolute -top-3 left-0 right-0 flex justify-around px-8 pointer-events-none z-20">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="w-6 h-3 rounded-full border-2"
            style={{ borderColor: "#8b6914", background: "transparent", borderBottom: "none" }}
          />
          <div className="w-0.5 h-3" style={{ background: "#8b6914" }} />
          <div
            className="w-8 h-4 rounded-full"
            style={{ background: "#c8a84b", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.3)" }}
          />
        </div>
      ))}
    </div>
  );
}

function DayCell({
  day,
  isCurrentMonth,
  isToday,
  isStart,
  isEnd,
  isInRangeDay,
  isHoliday,
  holidayName,
  onClick,
  onHover,
}: {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  isInRangeDay: boolean;
  isHoliday: boolean;
  holidayName?: string;
  onClick: () => void;
  onHover: () => void;
}) {
  const cls = [
    "day-cell relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 mx-auto text-sm rounded-full select-none",
    !isCurrentMonth ? "opacity-20" : "",
    isStart || isEnd ? "selected-start" : "",
    isInRangeDay ? "in-range" : "",
    isToday && !isStart && !isEnd ? "today" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cls}
      onClick={onClick}
      onMouseEnter={onHover}
      title={isHoliday ? holidayName : undefined}
    >
      {day}
      {isHoliday && !isStart && !isEnd && (
        <span className="holiday-dot" title={holidayName} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WallCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [themeIdx, setThemeIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[themeIdx];

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("calendar-notes");
      if (saved) setNotes(JSON.parse(saved));
      const savedTheme = localStorage.getItem("calendar-theme");
      if (savedTheme) setThemeIdx(Number(savedTheme));
    } catch {}
  }, []);

  // Save notes
  useEffect(() => {
    localStorage.setItem("calendar-notes", JSON.stringify(notes));
  }, [notes]);

  // Save theme
  useEffect(() => {
    localStorage.setItem("calendar-theme", String(themeIdx));
  }, [themeIdx]);

  // Apply CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-light", theme.accentLight);
    root.style.setProperty("--accent-pale", theme.accentPale);
    root.style.setProperty("--paper", theme.paper);
    root.style.setProperty("--paper-dark", theme.paperDark);
    root.style.setProperty("--ink", theme.ink);
    root.style.setProperty("--ink-light", theme.inkLight);
  }, [theme]);

  // Navigate month
  const navigate = (dir: 1 | -1) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentMonth((m) => {
        const next = m + dir;
        if (next < 0) { setCurrentYear((y) => y - 1); return 11; }
        if (next > 11) { setCurrentYear((y) => y + 1); return 0; }
        return next;
      });
      setImageIdx((i) => (i + 1) % 3);
      setAnimating(false);
    }, 200);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  // Build cells: [day, isCurrentMonth]
  const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({ day: d, isCurrentMonth: false, date: new Date(y, m, d) });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, date: new Date(currentYear, currentMonth, d) });
  }
  // Next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    cells.push({ day: d, isCurrentMonth: false, date: new Date(y, m, d) });
  }

  const effectiveEnd = endDate || hoverDate;

  const handleDayClick = (date: Date) => {
    if (selecting === "start") {
      setStartDate(date);
      setEndDate(null);
      setSelecting("end");
    } else {
      if (startDate && date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setSelecting("start");
    }
  };

  const handleHover = (date: Date) => {
    if (selecting === "end" && startDate) {
      setHoverDate(date);
    }
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
    setSelecting("start");
  };

  const addNote = () => {
    if (!currentNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      text: currentNote.trim(),
      dateRange: startDate ? formatDateRange(startDate, endDate) : undefined,
      createdAt: new Date().toISOString(),
    };
    setNotes((n) => [note, ...n]);
    setCurrentNote("");
  };

  const deleteNote = (id: string) => {
    setNotes((n) => n.filter((note) => note.id !== id));
  };

  const imageUrl = UNSPLASH_IMAGES[theme.name]?.[imageIdx] ||
    UNSPLASH_IMAGES.Autumn[0];

  const rangeLabel = formatDateRange(startDate, effectiveEnd);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Hanging mechanism */}
      <div className="relative h-8 mb-0 hidden md:block">
        <HangingRing />
      </div>

      {/* Main calendar card */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl calendar-wrapper"
        style={{
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
          background: theme.paper,
        }}
      >
        {/* Spiral binding strip at top */}
        <div
          className="h-5 w-full relative z-10 hidden md:block"
          style={{
            background: `linear-gradient(to bottom, #5a3a10, #8b6020)`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full w-3 rounded-sm"
              style={{
                left: `${3 + i * 5}%`,
                background: "linear-gradient(to bottom, #3a2008, #6b4515)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: Hero image + month header */}
          <div className="md:w-2/5 relative flex-shrink-0">
            {/* Hero image */}
            <div
              className="relative overflow-hidden"
              style={{ height: "220px", minHeight: "180px" }}
            >
              <img
                src={imageUrl}
                alt={`${theme.name} scenery`}
                className="w-full h-full object-cover transition-opacity duration-700"
                style={{ opacity: animating ? 0.3 : 1 }}
              />
              <div className="image-overlay absolute inset-0" />

              {/* Month + Year overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-[0.2em] mb-1"
                      style={{ fontFamily: "'DM Sans', sans-serif", opacity: 0.8 }}
                    >
                      {currentYear}
                    </p>
                    <h2
                      className="text-4xl md:text-5xl font-bold leading-none"
                      style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                    >
                      {MONTHS[currentMonth]}
                    </h2>
                  </div>
                  <span className="text-3xl theme-badge">{theme.icon}</span>
                </div>
              </div>
            </div>

            {/* Controls bar */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ background: theme.paperDark, borderBottom: `1px solid rgba(0,0,0,0.06)` }}
            >
              {/* Month navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{ background: theme.accent, color: "white" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{ background: theme.accent, color: "white" }}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
                  className="text-xs px-3 py-1 rounded-full transition-all hover:opacity-80"
                  style={{ background: theme.accentPale, color: theme.accent, fontWeight: 500 }}
                >
                  Today
                </button>
              </div>

              {/* Theme switcher */}
              <div className="flex items-center gap-1">
                {THEMES.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setThemeIdx(i)}
                    title={t.name}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: t.accent,
                      borderColor: themeIdx === i ? theme.ink : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Selection summary */}
            {startDate && (
              <div
                className="mx-4 mt-3 mb-0 px-4 py-2 rounded-xl flex items-center justify-between text-sm"
                style={{ background: theme.accentPale, color: theme.accent }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                  {rangeLabel || "Select end date…"}
                </span>
                <button onClick={clearSelection} className="ml-2 hover:opacity-70">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Holidays legend */}
            <div className="px-5 py-2 text-xs" style={{ color: theme.inkLight }}>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#d4a843" }} />
                Public holiday
              </span>
            </div>
          </div>

          {/* Right: Calendar grid + Notes */}
          <div className="flex-1 flex flex-col">
            {/* Calendar grid */}
            <div className="p-5 pb-3 flex-1">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold uppercase tracking-wider py-1"
                    style={{ color: theme.inkLight, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div
                ref={gridRef}
                className={`grid grid-cols-7 gap-y-1 ${animating ? "" : "calendar-grid-enter"}`}
              >
                {cells.map((cell, idx) => {
                  const isStart = !!(startDate && isSameDay(cell.date, startDate));
                  const isEnd = !!(endDate && isSameDay(cell.date, endDate));
                  const isInRangeDay = isInRange(cell.date, startDate, effectiveEnd);
                  const isToday = isSameDay(cell.date, today);
                  const holidayKey = `${cell.date.getMonth()}-${cell.date.getDate()}`;
                  const holidayName = HOLIDAYS[holidayKey];

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center py-0.5"
                      style={
                        isInRangeDay
                          ? { background: theme.accentPale }
                          : undefined
                      }
                    >
                      <DayCell
                        day={cell.day}
                        isCurrentMonth={cell.isCurrentMonth}
                        isToday={isToday}
                        isStart={isStart}
                        isEnd={isEnd}
                        isInRangeDay={isInRangeDay}
                        isHoliday={!!holidayName}
                        holidayName={holidayName}
                        onClick={() => cell.isCurrentMonth && handleDayClick(cell.date)}
                        onHover={() => cell.isCurrentMonth && handleHover(cell.date)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div
              className="mx-5 border-t"
              style={{ borderColor: `${theme.ink}15` }}
            />

            {/* Notes section */}
            <div className="p-5 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: theme.inkLight, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <StickyNote size={13} />
                  {startDate && endDate
                    ? `Notes for ${formatDateRange(startDate, endDate)}`
                    : startDate
                    ? `Notes for ${formatDate(startDate)}`
                    : "Monthly Notes"}
                </h3>
                <button
                  onClick={() => setShowNotesPanel((v) => !v)}
                  className="text-xs opacity-50 hover:opacity-80 transition-opacity"
                  style={{ color: theme.inkLight }}
                >
                  {showNotesPanel ? "Hide" : "Show"}
                </button>
              </div>

              {showNotesPanel && (
                <div>
                  {/* Notepad input */}
                  <div
                    className="rounded-xl p-3 mb-3 relative"
                    style={{
                      background: theme.paper,
                      border: `1px solid ${theme.ink}10`,
                      boxShadow: `inset 0 1px 4px ${theme.ink}08`,
                    }}
                  >
                    <textarea
                      className="notes-area h-16 w-full"
                      placeholder={`Jot down something for ${MONTHS[currentMonth]}…`}
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
                      }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs" style={{ color: theme.inkLight, opacity: 0.6 }}>
                        ⌘+Enter to save
                      </span>
                      <button
                        onClick={addNote}
                        disabled={!currentNote.trim()}
                        className="text-xs px-3 py-1 rounded-lg transition-all disabled:opacity-30"
                        style={{
                          background: theme.accent,
                          color: "white",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* Notes list */}
                  <div className="space-y-2 max-h-36 overflow-y-auto notes-scroll">
                    {notes.length === 0 ? (
                      <p className="text-xs text-center py-2" style={{ color: theme.inkLight, opacity: 0.5 }}>
                        No notes yet. Add one above!
                      </p>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-start gap-2 p-2.5 rounded-lg group"
                          style={{ background: theme.paperDark }}
                        >
                          <div className="flex-1 min-w-0">
                            {note.dateRange && (
                              <p className="text-xs mb-0.5" style={{ color: theme.accent, fontWeight: 500 }}>
                                {note.dateRange}
                              </p>
                            )}
                            <p className="text-sm leading-snug" style={{ color: theme.ink }}>
                              {note.text}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity flex-shrink-0"
                            style={{ color: theme.inkLight }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-6 py-2.5 flex items-center justify-between text-xs border-t"
          style={{
            background: theme.paperDark,
            borderColor: `${theme.ink}10`,
            color: theme.inkLight,
          }}
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {selecting === "end" && startDate
              ? "Click an end date"
              : "Click a date to start selecting"}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Shadow beneath card */}
      <div
        className="mx-8 h-4 rounded-b-full opacity-30 blur-sm"
        style={{ background: "#000", marginTop: "-4px" }}
      />
    </div>
  );
}
