import React from "react";
import { motion } from "motion/react";
import { Rank } from "../types";

export function RankBadge({ rank, size = "md" }: { rank: Rank; size?: "sm" | "md" | "lg" }) {
  const configs = {
    [Rank.IRON]: { 
      color: "text-iron", 
      border: "border-iron/40", 
      glow: "shadow-[0_0_15px_rgba(100,116,139,0.4)]",
      bgGradient: "from-iron/10 via-transparent to-iron/5",
      label: "E"
    },
    [Rank.BRONZE]: { 
      color: "text-bronze", 
      border: "border-bronze/40", 
      glow: "shadow-[0_0_15px_rgba(217,119,6,0.4)]",
      bgGradient: "from-bronze/10 via-transparent to-bronze/5",
      label: "D"
    },
    [Rank.SILVER]: { 
      color: "text-silver", 
      border: "border-silver/40", 
      glow: "shadow-[0_0_15px_rgba(148,163,184,0.4)]",
      bgGradient: "from-silver/10 via-transparent to-silver/5",
      label: "C"
    },
    [Rank.GOLD]: { 
      color: "text-gold", 
      border: "border-gold/40", 
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
      bgGradient: "from-gold/10 via-transparent to-gold/5",
      label: "B"
    },
    [Rank.PLATINUM]: { 
      color: "text-platinum", 
      border: "border-platinum/40", 
      glow: "shadow-[0_0_25px_rgba(45,212,191,0.5)]",
      bgGradient: "from-platinum/10 via-transparent to-platinum/5",
      label: "A"
    },
    [Rank.SHADOW]: { 
      color: "text-shadow", 
      border: "border-shadow/50", 
      glow: "shadow-[0_0_30px_rgba(139,92,246,0.6)]",
      bgGradient: "from-shadow/20 via-transparent to-shadow/10",
      label: "S"
    },
    [Rank.MONARCH]: { 
      color: "text-white", 
      border: "border-white/60", 
      glow: "shadow-[0_0_40px_rgba(255,255,255,0.7)]",
      bgGradient: "from-primary/30 via-transparent to-primary/20",
      label: "SSS"
    },
  };

  const sizes = {
    sm: { container: "w-10 h-10", font: "text-xs", borderSize: "border" },
    md: { container: "w-16 h-16", font: "text-xl", borderSize: "border-2" },
    lg: { container: "w-28 h-28", font: "text-4xl", borderSize: "border-[3px]" },
  };

  const config = configs[rank] || configs[Rank.IRON];
  const sizeConfig = sizes[size];

  return (
    <div className="relative group select-none">
      {/* Outer Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-2xl ${config.glow.replace('shadow-[', 'bg-[').split(' ')[0]} opacity-30`}
      />
      
      {/* Main Container (Hexagon/Diamond rotation) */}
      <div className={`relative ${sizeConfig.container} transition-transform duration-500 group-hover:scale-110`}>
        {/* Decorative Background Hex */}
        <div className={`absolute inset-0 bg-surface border ${config.border} rotate-45 rounded-xl shadow-inner overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient}`} />
          {/* Scanline Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 2px)', backgroundSize: '100% 3px' }} />
        </div>

        {/* Dynamic Inner Frame */}
        <div className={`absolute inset-[10%] border ${config.border} rotate-45 rounded-lg opacity-50`} />
        
        {/* Rank Letter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`font-display font-black italic tracking-tighter ${sizeConfig.font} ${config.color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10`}>
            {config.label}
          </span>
        </div>

        {/* Corner Accents (System appearance) */}
        <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${config.border} -translate-x-1 -translate-y-1`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${config.border} translate-x-1 translate-y-1`} />
      </div>

      {/* Floating Particles for S-Rank and above */}
      {(rank === Rank.SHADOW || rank === Rank.MONARCH) && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${rank === Rank.SHADOW ? 'bg-shadow' : 'bg-primary'}`}
              animate={{
                y: [-20, -60],
                x: [Math.random() * 40 - 20, Math.random() * 40 - 20],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{ left: '50%', bottom: '50%' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
