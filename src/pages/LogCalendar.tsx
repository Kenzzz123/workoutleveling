import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { motion, AnimatePresence } from "motion/react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay,
  isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Zap, Coffee, Activity, Sword } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export function LogCalendar() {
  const { profile, user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const q = query(
          collection(db, "users", user.uid, "history"),
          where("date", ">=", start),
          where("date", "<=", end)
        );
        const snap = await getDocs(q);
        setWorkoutLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const isWorkoutDay = (date: Date) => {
    const dayName = format(date, "EEEE");
    return profile?.workoutDays.includes(dayName);
  };

  const getLogForDay = (date: Date) => {
    return workoutLogs.find(log => {
      const logDate = log.date?.toDate?.() || new Date(log.date);
      return isSameDay(logDate, date);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.5em] mb-1">Chronicle System</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold uppercase italic tracking-tighter">Hunter Record</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 bg-surface px-4 py-2 rounded-xl border border-white/5 w-full sm:w-auto">
          <button onClick={prevMonth} className="p-1 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-bold uppercase tracking-widest text-xs md:text-sm min-w-[100px] md:min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={nextMonth} className="p-1 hover:text-primary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="sl-card border-white/5 overflow-hidden !p-0">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {days.map(day => (
            <div key={day} className="py-3 md:py-4 text-center text-[8px] md:text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold border-r border-white/5 last:border-0 bg-surface-dark/50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-l border-t border-white/5">
          {calendarDays.map((day, i) => {
            const log = getLogForDay(day);
            const scheduled = isWorkoutDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const today = isToday(day);

            return (
              <div 
                key={i} 
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border-r border-b border-white/5 transition-all relative group ${
                  !isCurrentMonth ? 'opacity-20 pointer-events-none' : ''
                } ${today ? 'bg-primary/5' : ''}`}
              >
                <span className={`text-[9px] md:text-[10px] font-mono font-bold ${
                  today ? 'text-primary' : 'text-text-muted'
                }`}>
                  {format(day, "d")}
                </span>

                <div className="mt-1 md:mt-2 space-y-1">
                  {log ? (
                    <div className="bg-primary/20 border border-primary/30 p-0.5 md:p-1.5 rounded flex items-center justify-center md:justify-start gap-1 md:gap-1.5 shadow-[0_0_10px_rgba(127,119,221,0.1)]">
                      <Zap className="w-2 md:w-2.5 h-2 md:h-2.5 text-primary" />
                      <span className="hidden md:inline text-[8px] font-display font-bold uppercase tracking-tight text-white truncate">
                        Cleared
                      </span>
                    </div>
                  ) : scheduled ? (
                    <div className="bg-white/5 border border-white/10 p-0.5 md:p-1.5 rounded flex items-center justify-center md:justify-start gap-1 md:gap-1.5 opacity-60">
                      <Activity className="w-2 md:w-2.5 h-2 md:h-2.5 text-text-muted" />
                      <span className="hidden md:inline text-[8px] font-display font-bold uppercase tracking-tight text-text-muted truncate">
                        Scheduled
                      </span>
                    </div>
                  ) : isCurrentMonth ? (
                     <div className="p-0.5 md:p-1.5 flex items-center justify-center md:justify-start gap-1 md:gap-1.5 opacity-20">
                      <Coffee className="w-2 md:w-2.5 h-2 md:h-2.5" />
                      <span className="hidden md:inline text-[8px] font-display font-bold uppercase tracking-tight truncate">
                        Rest
                      </span>
                    </div>
                  ) : null}
                </div>

                {today && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-primary shadow-[0_0_10px_rgba(127,119,221,0.5)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="sl-card border-white/5 space-y-4">
          <h3 className="text-xs font-display font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Zap className="w-4 h-4" /> Power Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-light/50 p-4 rounded-xl border border-white/5">
              <p className="text-[8px] font-mono text-text-muted uppercase mb-1">Gates Cleared</p>
              <p className="text-xl font-display font-bold">{workoutLogs.length}</p>
            </div>
            <div className="bg-surface-light/50 p-4 rounded-xl border border-white/5">
              <p className="text-[8px] font-mono text-text-muted uppercase mb-1">Consistency</p>
              <p className="text-xl font-display font-bold">
                {profile?.workoutDays.length ? Math.round((workoutLogs.length / (profile.workoutDays.length * 4)) * 100) : 0}%
              </p>
            </div>
          </div>
        </section>

        <section className="sl-card border-white/5 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-text-muted">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Protocol Success</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">System Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full border border-white/10" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Recovery Cycle</span>
                </div>
            </div>
            <p className="text-[10px] text-text-muted/60 mt-4 italic font-mono uppercase tracking-tighter">
                * Chronicle logs are synchronized with the Hunter Association database. Stay consistent to avoid rank stagnation.
            </p>
        </section>
      </div>
    </motion.div>
  );
}
