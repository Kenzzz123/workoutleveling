import React, { useState, useEffect, useRef } from "react";
import { Workout, Exercise } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, ChevronRight, Check, Timer, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "../App";
import { doc, updateDoc, collection, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../lib/firebase";

export function WorkoutTimer({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { profile, user } = useAuth();
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<"exercise" | "rest_set" | "rest_exercise" | "summary">("exercise");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  
  const currentExercise = workout.exercises[currentExerciseIdx];

  useEffect(() => {
    if (phase === "exercise") {
      if (currentExercise.targetType === "duration") {
        setTimeLeft(currentExercise.targetValue);
      } else {
        setTimeLeft(0);
      }
    } else if (phase === "rest_set") {
      setTimeLeft(currentExercise.restBetweenSets);
    } else if (phase === "rest_exercise") {
      setTimeLeft(currentExercise.restAfterExercise);
    }
  }, [currentExerciseIdx, currentSet, phase]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
        if (timeLeft > 0 && (phase !== "exercise" || currentExercise.targetType === "duration")) {
          setTimeLeft(prev => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase]);

  useEffect(() => {
    if (timeLeft === 0 && (phase !== "exercise" || currentExercise.targetType === "duration")) {
      handleNextPhase();
    }
  }, [timeLeft]);

  const handleNextPhase = () => {
    if (phase === "exercise") {
      if (currentSet < currentExercise.sets) {
        setPhase("rest_set");
      } else {
        if (currentExerciseIdx < workout.exercises.length - 1) {
          setPhase("rest_exercise");
        } else {
          setPhase("summary");
        }
      }
    } else if (phase === "rest_set") {
      setCurrentSet(prev => prev + 1);
      setPhase("exercise");
    } else if (phase === "rest_exercise") {
      setCurrentExerciseIdx(prev => prev + 1);
      setCurrentSet(1);
      setPhase("exercise");
    }
  };

  const completeWorkout = async () => {
    if (!user || !profile) return;
    
    const xpEarned = workout.exercises.length * 50; // Simple calc
    const log = {
      workoutId: workout.id,
      workoutName: workout.name,
      date: serverTimestamp(),
      duration: totalTime,
      xpEarned: xpEarned,
      exercisesCompleted: workout.exercises.length
    };

    try {
      await addDoc(collection(db, "users", user.uid, "history"), log);
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(xpEarned),
        totalXp: increment(xpEarned),
        lastActive: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (phase === "summary") {
    return (
      <div className="fixed inset-0 bg-base z-[100] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 space-y-8"
        >
          <div className="w-24 h-24 bg-primary rounded-3xl rotate-45 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(127,119,221,0.5)]">
            <Trophy className="w-12 h-12 text-white -rotate-45" />
          </div>
          <div>
            <h1 className="text-5xl font-display font-black uppercase italic tracking-tighter text-white mb-2 underline decoration-primary underline-offset-8">Protocol Cleared</h1>
            <p className="text-primary font-mono uppercase tracking-[0.5em] text-sm">Vessel Strength Optimized</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="sl-card !p-4">
              <p className="text-[10px] font-mono text-text-muted uppercase mb-1">Time Elapsed</p>
              <p className="text-2xl font-display font-bold">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</p>
            </div>
            <div className="sl-card !p-4">
              <p className="text-[10px] font-mono text-text-muted uppercase mb-1">XP Harvested</p>
              <p className="text-2xl font-display font-bold text-primary">+{workout.exercises.length * 50}</p>
            </div>
          </div>

          <button 
            onClick={completeWorkout}
            className="w-full sl-button-primary py-5 text-lg uppercase tracking-[0.4em] font-display hover:scale-105 transition-transform"
          >
            Claim Rewards
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = currentExercise.targetType === "duration" 
    ? (timeLeft / currentExercise.targetValue) * 100 
    : 0;

  return (
    <div className="fixed inset-0 bg-base z-[100] flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        phase.includes('rest') ? 'bg-primary/5' : 'bg-transparent'
      }`} />

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center relative z-10">
        <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-display font-bold uppercase tracking-widest text-text-muted">{workout.name}</h2>
          <div className="flex gap-1 mt-1 justify-center">
            {workout.exercises.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                i < currentExerciseIdx ? 'w-4 bg-primary' : i === currentExerciseIdx ? 'w-8 bg-primary animate-pulse' : 'w-2 bg-white/10'
              }`} />
            ))}
          </div>
        </div>
        <div className="font-mono text-xs text-text-muted w-10 text-right">
          {Math.floor(totalTime/60)}:{(totalTime % 60).toString().padStart(2,'0')}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${currentExerciseIdx}-${phase}-${currentSet}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="space-y-2">
              <h3 className="text-primary font-mono text-[10px] uppercase tracking-[0.5em]">
                {phase === 'exercise' ? `Unit 0${currentExerciseIdx + 1}` : 'Recovery Protocol'}
              </h3>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-white italic">
                {phase === 'exercise' ? currentExercise.name : 'System Cooling'}
              </h1>
              {phase === 'exercise' && (
                <div className="text-text-muted font-mono uppercase text-xs tracking-widest opacity-60">
                  Set {currentSet} of {currentExercise.sets}
                </div>
              )}
            </div>

            {/* Visual Indicator */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="754" 
                  strokeDashoffset={754 * (1 - (phase === 'exercise' && currentExercise.targetType === 'reps' ? 1 : timeLeft / (phase === 'exercise' ? currentExercise.targetValue : (phase === 'rest_set' ? currentExercise.restBetweenSets : currentExercise.restAfterExercise))))}
                  className={phase.includes('rest') ? 'text-primary shadow-[0_0_20px_rgba(127,119,221,0.5)]' : 'text-primary'}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {phase === 'exercise' && currentExercise.targetType === 'reps' ? (
                  <>
                    <span className="text-6xl font-display font-black text-white">{currentExercise.targetValue}</span>
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-text-muted mt-2">Repetitions</span>
                  </>
                ) : (
                  <>
                    <span className="text-7xl font-display font-black text-white">{timeLeft}</span>
                    <span className="text-xs font-mono uppercase tracking-[0.3em] text-text-muted mt-2">Seconds</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-text-muted leading-relaxed font-sans italic opacity-80 max-w-xs mx-auto">
              {phase === 'exercise' ? currentExercise.description : 'Deep breaths. Oxygenate the blood. Prime for next engagement.'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <footer className="p-8 relative z-10">
        <div className="max-w-md mx-auto">
          {phase === 'exercise' && currentExercise.targetType === 'reps' ? (
            <button 
              onClick={handleNextPhase}
              className="w-full sl-button-primary py-6 flex items-center justify-center gap-3 group text-lg"
            >
              <Check className="w-6 h-6 group-hover:scale-125 transition-transform" />
              <span className="uppercase tracking-[0.3em] font-display">Set Complete</span>
            </button>
          ) : (
             <div className="flex gap-4">
               <button 
                onClick={() => setIsActive(!isActive)}
                className="w-20 sl-button border border-white/5 flex items-center justify-center"
               >
                 {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 text-primary fill-current" />}
               </button>
               <button 
                onClick={handleNextPhase}
                className="flex-grow sl-button-primary py-6 flex items-center justify-center gap-2 group"
               >
                 <span className="uppercase tracking-[0.3em] font-display">Skip Phase</span>
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
             </div>
          )}
        </div>
      </footer>
    </div>
  );
}
