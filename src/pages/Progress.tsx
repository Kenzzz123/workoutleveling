import React from "react";
import { useAuth } from "../App";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, Star, Zap, Shield, Repeat, Award } from "lucide-react";

export function ProgressPage() {
  const { stats, profile } = useAuth();

  const data = [
    { day: "Mon", xp: 450 },
    { day: "Tue", xp: 300 },
    { day: "Wed", xp: 600 },
    { day: "Thu", xp: 200 },
    { day: "Fri", xp: 800 },
    { day: "Sat", xp: 400 },
    { day: "Sun", xp: 550 },
  ];

  const statItems = [
    { label: "Strength", value: stats?.strength || 10, icon: Shield, color: "text-red-500", barColor: "bg-red-500" },
    { label: "Endurance", value: stats?.endurance || 10, icon: Activity, color: "text-blue-500", barColor: "bg-blue-500" },
    { label: "Agility", value: stats?.agility || 10, icon: Zap, color: "text-yellow-500", barColor: "bg-yellow-500" },
    { label: "Flexibility", value: stats?.flexibility || 10, icon: Repeat, color: "text-green-500", barColor: "bg-green-500" },
    { label: "Iron Will", value: stats?.ironWill || 10, icon: Star, color: "text-purple-500", barColor: "bg-purple-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header>
        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.5em] mb-1">Growth Matrix</p>
        <h2 className="text-3xl font-display font-bold uppercase italic tracking-tight text-white">System Evolution</h2>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sl-card h-80 flex flex-col">
          <h3 className="text-xs font-display font-bold uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            XP Accumulation (Weekly)
          </h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7F77DD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#88889a', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#88889a', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12121a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#7F77DD', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#7F77DD" fillOpacity={1} fill="url(#colorXp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sl-card space-y-6">
          <h3 className="text-xs font-display font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Vessel Attributes
          </h3>
          <div className="space-y-5">
            {statItems.map((stat) => (
              <div key={stat.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-widest">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                    <span className="text-text-muted">{stat.label}</span>
                  </div>
                  <span className="text-white">{stat.value}</span>
                </div>
                <div className="h-1.5 w-full bg-base rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.value / 100) * 100}%` }}
                    className={`h-full ${stat.barColor} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Quests", value: "0", sub: "New Hunter Init" },
          { label: "Calamity Rank", value: profile?.rank || "E", sub: "Verified Rank" },
          { label: "Consistency", value: "0%", sub: "Scanning..." },
          { label: "Total Volume", value: "0", sub: "KG lifted" },
        ].map((item, i) => (
          <div key={i} className="sl-card !p-4 border-white/5">
            <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-2xl font-display font-bold text-white">{item.value}</p>
            <p className="text-[8px] font-mono text-primary uppercase mt-1 opacity-60">{item.sub}</p>
          </div>
        ))}
      </section>

      {/* Rank Encyclopedia */}
      <section className="space-y-4">
        <h3 className="text-xs font-display font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 px-2">
          <Star className="w-4 h-4 text-primary" />
          System Ranks & Trials
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { rank: "IRON (E)", level: "Lv. 1", trial: "Physical Baseline", desc: "For new awakened individuals." },
            { rank: "BRONZE (D)", level: "Lv. 10", trial: "Endurance Burn", desc: "Demonstrating sustained capacity." },
            { rank: "SILVER (C)", level: "Lv. 25", trial: "Power Output", desc: "Recognized as a capable combatant." },
            { rank: "GOLD (B)", level: "Lv. 50", trial: "The Gatekeeper", desc: "Elite human limit breaker." },
            { rank: "PLATINUM (A)", level: "Lv. 75", trial: "Mana Overload", desc: "The peak of recognized hunters." },
            { rank: "SHADOW (S)", level: "Lv. 100", trial: "The Monarch's Trial", desc: "Beyond human measurement." }
          ].map((r, i) => (
            <div key={i} className="sl-card border-white/5 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-display font-bold text-white italic">{r.rank}</span>
                <span className="text-[10px] font-mono text-primary">{r.level}</span>
              </div>
              <p className="text-[10px] font-mono text-text-muted uppercase mb-2">Trial: {r.trial}</p>
              <p className="text-[10px] text-text-muted/60 italic">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hunter Achievements */}
      <section className="space-y-4">
        <h3 className="text-xs font-display font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 px-2">
          <Award className="w-4 h-4 text-primary" />
          Achievement Trophies
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { name: "First Blood", desc: "Complete 1st Quest", icon: "🩸", unlocked: profile?.xp && profile.xp > 0 },
            { name: "Iron Will", desc: "7 Day Streak", icon: "🛡️", unlocked: false },
            { name: "Limit Breaker", desc: "Reach Level 10", icon: "💎", unlocked: profile?.level && profile.level >= 10 },
            { name: "Combat Ready", desc: "Log 5 Workouts", icon: "⚔️", unlocked: false },
            { name: "Shadow King", desc: "Reach Rank S", icon: "👑", unlocked: false },
            { name: "Early Bird", desc: "6AM Training", icon: "🌅", unlocked: false },
            { name: "Night Owl", desc: "Midnight Training", icon: "🌙", unlocked: false },
            { name: "Scholar", desc: "10 AI Chats", icon: "📖", unlocked: false },
          ].map((ach, i) => (
            <div key={i} className={`sl-card !p-4 flex flex-col items-center text-center transition-all ${
                ach.unlocked ? 'border-primary/40 bg-primary/5' : 'border-white/5 opacity-40 grayscale'
            }`}>
              <span className="text-3xl mb-2">{ach.icon}</span>
              <h4 className="text-[10px] font-display font-bold uppercase tracking-tight">{ach.name}</h4>
              <p className="text-[9px] font-mono text-text-muted uppercase tracking-tighter mt-1">{ach.desc}</p>
              {ach.unlocked && <div className="mt-2 text-[8px] font-mono text-primary uppercase">UNLOCKED</div>}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
