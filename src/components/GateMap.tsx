import React from "react";
import { motion } from "motion/react";
import { Lock, Unlock, MapPin, Sparkles } from "lucide-react";

interface Gate {
  id: string;
  name: string;
  rank: string;
  status: "locked" | "open" | "conquered";
  x: number;
  y: number;
}

const GATES: Gate[] = [
  { id: "1", name: "Training Ground", rank: "E", status: "conquered", x: 20, y: 30 },
  { id: "2", name: "Iron Fortress", rank: "D", status: "open", x: 50, y: 50 },
  { id: "3", name: "Shadow Realm", rank: "C", status: "locked", x: 80, y: 70 },
  { id: "4", name: "Dragon Peak", rank: "B", status: "locked", x: 30, y: 80 },
];

export function GateMap() {
  return (
    <div className="relative aspect-square md:aspect-video w-full bg-surface rounded-2xl border border-white/5 overflow-hidden group">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Pulse Effect at Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />

      <h3 className="absolute top-4 left-4 font-display font-bold text-[10px] uppercase tracking-[0.4em] text-text-muted flex items-center gap-2">
        <MapPin className="w-3 h-3 text-primary" />
        World Gate Topology
      </h3>

      {/* Connection Lines (Simple SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="rgba(127,119,221,0.1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="rgba(127,119,221,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="50%" x2="30%" y2="80%" stroke="rgba(127,119,221,0.05)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {GATES.map((gate) => (
        <motion.div
            key={gate.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: parseInt(gate.id) * 0.1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${gate.x}%`, top: `${gate.y}%` }}
        >
            <div className="relative flex flex-col items-center">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        gate.status === 'conquered' ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(127,119,221,0.3)]' :
                        gate.status === 'open' ? 'bg-surface-light border-primary/50 animate-pulse' :
                        'bg-surface-dark border-white/5 grayscale'
                    }`}
                >
                    {gate.status === 'conquered' ? <Sparkles className="w-5 h-5 text-primary" /> : 
                     gate.status === 'open' ? <Unlock className="w-4 h-4 text-primary" /> : 
                     <Lock className="w-4 h-4 text-text-muted" />}
                </motion.div>
                
                <div className="absolute top-12 whitespace-nowrap text-center">
                    <p className={`text-[9px] font-mono uppercase tracking-widest ${gate.status === 'locked' ? 'text-text-muted opacity-40' : 'text-text'}`}>
                        {gate.name}
                    </p>
                    <p className="text-[8px] font-mono text-primary/60">Rank {gate.rank}</p>
                </div>
            </div>
        </motion.div>
      ))}

      <div className="absolute bottom-4 right-4 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
        <span className="text-[8px] font-mono text-primary uppercase tracking-widest animate-pulse">Scanning for new Gates...</span>
      </div>
    </div>
  );
}
