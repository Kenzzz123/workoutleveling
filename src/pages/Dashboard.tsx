import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { RankBadge } from "../components/RankBadge";
import { motion } from "motion/react";
import { Flame, Star, Shield, Zap, Info, ChevronRight, Play, Sword, MessageSquare } from "lucide-react";
import { doc, getDoc, setDoc, onSnapshot, query, collection, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DailyQuests, Quest } from "../types";
import { formatDate } from "date-fns";
import { generateQuests } from "../lib/groq";

import { GateMap } from "../components/GateMap";
import { Activity, History } from "lucide-react";

export function Dashboard({ setActivePage, onStartWorkout }: { setActivePage: (p: string) => void; onStartWorkout: (w: any) => void }) {
  const { profile, user, stats } = useAuth();
  const [dailyQuests, setDailyQuests] = useState<DailyQuests | null>(null);
  const [streak, setStreak] = useState({ current: 0, multiplier: 1.0 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = formatDate(new Date(), "yyyy-MM-dd");
    
    // Fetch Streak
    const unsubStreak = onSnapshot(doc(db, "users", user.uid, "streak", "current"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStreak({ 
          current: data.current || 0, 
          multiplier: 1 + Math.min((data.current || 0) * 0.05, 0.5) 
        });
      }
    });

    // Fetch Recent Logs
    const q = query(collection(db, "users", user.uid, "history"), limit(3), orderBy("date", "desc"));
    const unsubLogs = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Quests
    const unsubQuests = onSnapshot(doc(db, "users", user.uid, "quests", today), async (snap) => {
      if (snap.exists()) {
        setDailyQuests(snap.data() as DailyQuests);
      } else if (profile && stats) {
        // Trigger Quest Generation
        try {
          const quests = await generateQuests(profile, [], stats); 
          const qData: DailyQuests = { date: today, generated: true, quests: quests.map(q => ({ ...q, completed: false })) };
          await setDoc(doc(db, "users", user.uid, "quests", today), qData);
        } catch (err) {
          console.error("Quest Generation Error:", err);
        }
      }
    });

    return () => {
      unsubStreak();
      unsubLogs();
      unsubQuests();
    };
  }, [user, profile, stats]);

  if (!profile) return null;

  const xpToNextLevel = profile.level * 1000;
  const progress = (profile.xp / xpToNextLevel) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        <RankBadge rank={profile.rank} size="lg" />
        <div className="flex-grow space-y-4 text-center md:text-left w-full">
          <div>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 mb-1">
              <h2 className="text-2xl md:text-3xl font-display font-bold uppercase italic truncate max-w-full">{profile.displayName}</h2>
              <span className="bg-primary/20 text-primary text-[10px] font-mono px-2 py-0.5 rounded border border-primary/30 uppercase tracking-widest whitespace-nowrap">
                Lv. {profile.level}
              </span>
            </div>
            <p className="text-text-muted font-mono text-[10px] uppercase tracking-[0.4em]">Rank {profile.rank} Awakened</p>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between items-end text-[10px] font-mono uppercase tracking-widest text-text-muted">
              <span className="flex items-center gap-1.5 truncate">
                <div className={`w-1.5 h-1.5 rounded-full ${streak.current > 0 ? 'bg-primary' : 'bg-orange-500'} animate-pulse shrink-0`} />
                <span className="truncate">Status: {streak.current > 0 ? "OPTIMAL" : "RESTING"}</span>
              </span>
              <span className="shrink-0">{profile.xp} / {xpToNextLevel} XP</span>
            </div>
            <div className="h-2 w-full bg-surface shadow-inner rounded-full overflow-hidden border border-white/5 relative mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary shadow-[0_0_15px_rgba(127,119,221,0.5)] z-10 relative"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-full h-full animate-shimmer" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
          <div className="sl-card !p-4 flex flex-col items-center justify-center border-orange-500/20 group">
            <Flame className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-display font-bold mt-1">{streak.current}</span>
            <span className="text-[10px] font-mono uppercase text-text-muted">Streak</span>
          </div>
          <div className="sl-card !p-4 flex flex-col items-center justify-center border-primary/20 group">
            <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-lg font-display font-bold mt-1">{streak.multiplier.toFixed(1)}x</span>
            <span className="text-[10px] font-mono uppercase text-text-muted">Mult</span>
          </div>
        </div>
      </section>

      {/* System Message */}
      <section className="bg-primary/5 border border-primary/20 rounded-xl p-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex items-start gap-4">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">System Evaluation</p>
            <p className="text-sm italic font-display text-text leading-relaxed">
              {profile.xp > 0 
                ? `"Your growth is accelerating, Hunter ${profile.displayName}. But the path to the summit is long. Do not falter."`
                : `"Analyzing hunter potential... Initial assessments show raw talent. Begin your first quest to unlock the System's true power."`}
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* World Gate Topology - Visual Map */}
          <section className="space-y-4">
            <h3 className="font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Active Topology
            </h3>
            <GateMap />
          </section>

          {/* Daily Quests */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <Sword className="w-4 h-4 text-primary" />
                Daily Quests
              </h3>
              <button 
                onClick={() => setActivePage("quests")}
                className="text-[10px] font-mono uppercase tracking-widest text-text-muted hover:text-primary transition-colors flex items-center gap-1"
              >
                View Quest Board <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid gap-4">
              {dailyQuests?.quests.map((quest) => (
                <motion.div 
                  key={quest.id}
                  whileHover={{ x: 4 }}
                  className={`sl-card !p-4 flex items-center gap-4 group cursor-pointer transition-all ${
                    quest.completed ? "opacity-50 grayscale" : "hover:border-primary/30"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                    quest.type === 'main' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-light border-white/5 text-text-muted'
                  }`}>
                    {quest.type === 'main' ? <Star className="w-6 h-6" /> : <Zap className="w-5 h-5" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display font-bold text-sm uppercase tracking-tight truncate">{quest.title}</h4>
                      <span className="text-[10px] font-mono text-primary">+{quest.xp} XP</span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-1">{quest.description}</p>
                  </div>
                  {!quest.completed && <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                </motion.div>
              ))}
              {!dailyQuests && <div className="sl-card h-32 flex items-center justify-center animate-pulse text-text-muted uppercase font-mono text-xs tracking-widest">Constructing Quests...</div>}
            </div>
          </section>
        </div>

        <div className="space-y-8">
           {/* Recent Activity / Log */}
           <section className="space-y-4">
            <h3 className="font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Recent Logs
            </h3>
            <div className="sl-card min-h-[160px]">
              <div className="space-y-6">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={log.id} className="flex gap-4 relative">
                    {i !== logs.length - 1 && <div className="absolute left-[7px] top-4 w-[1px] h-10 bg-white/5" />}
                    <div className={`w-4 h-4 rounded-full mt-1 shrink-0 bg-primary shadow-[0_0_8px_rgba(127,119,221,0.5)]`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                        {log.date ? formatDate(log.date.toDate(), "MMM dd HH:mm") : "Processing..."}
                      </p>
                      <p className="text-xs font-display font-bold text-text uppercase truncate">Unit Cleared</p>
                      <p className="text-[10px] text-text-muted italic">+{log.xpEarned} XP Harvested</p>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8">
                     <History className="w-8 h-8 mb-2" />
                     <p className="text-[9px] font-mono uppercase tracking-widest">No Record Found</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="space-y-4">
            <h3 className="font-display font-bold uppercase tracking-widest text-sm">Deployment</h3>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setActivePage("workouts")}
                className="sl-card !p-4 border-white/5 hover:border-primary/20 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-surface-light rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Shield className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-bold uppercase text-[10px] tracking-widest mb-0.5">Instant Entry</h4>
                  <p className="text-[9px] font-mono text-text-muted opacity-60 uppercase">Login Manual Workout</p>
                </div>
              </button>
              <button 
                onClick={() => setActivePage("coach")}
                className="sl-card !p-4 border-white/5 hover:border-primary/20 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-surface-light rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MessageSquare className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-bold uppercase text-[10px] tracking-widest mb-0.5">System Consult</h4>
                  <p className="text-[9px] font-mono text-text-muted opacity-60 uppercase">Query AI Overlord</p>
                </div>
              </button>
              <button 
                onClick={() => setActivePage("calendar")}
                className="sl-card !p-4 border-white/5 hover:border-primary/20 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-surface-light rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Activity className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-bold uppercase text-[10px] tracking-widest mb-0.5">Chronicle</h4>
                  <p className="text-[9px] font-mono text-text-muted opacity-60 uppercase">Log History & Recovery</p>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
