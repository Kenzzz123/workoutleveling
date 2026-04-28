import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Workout, Exercise } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Play, Brain, Settings2, Trash2, Clock, ChevronRight, X, List, Dumbbell } from "lucide-react";
import { generateWorkout } from "../lib/groq";

export function MyWorkouts({ onStartWorkout }: { onStartWorkout: (w: Workout) => void }) {
  const { user, profile, stats } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [creationMode, setCreationMode] = useState<"ai" | "manual" | null>(null);
  const [aiRequest, setAiRequest] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "workouts"));
    return onSnapshot(q, (snap) => {
      setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Workout)));
    });
  }, [user]);

  const handleAIDesign = async () => {
    if (!aiRequest || !profile) return;
    setIsGenerating(true);
    try {
      const workout = await generateWorkout(profile, aiRequest, undefined, stats);
      await setDoc(doc(db, "users", user!.uid, "workouts", workout.id), {
        ...workout,
        createdAt: serverTimestamp()
      });
      setIsCreating(false);
      setCreationMode(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = async () => {
    if (!workoutToDelete || !user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "workouts", workoutToDelete));
      setWorkoutToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.5em] mb-1">Armory & Intel</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold uppercase italic tracking-tight">Training Protocols</h2>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="sl-button-primary !p-3 flex items-center justify-center rounded-xl self-start sm:self-end"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workouts.map((workout) => (
          <motion.div 
            key={workout.id}
            layoutId={workout.id}
            className="sl-card group hover:border-primary/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-widest border ${
                  workout.createdBy === 'ai' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-light border-white/5 text-text-muted'
                }`}>
                  {workout.createdBy} Design
                </span>
                <button onClick={() => setWorkoutToDelete(workout.id)} className="text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-display font-bold uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{workout.name}</h3>
              <div className="flex items-center gap-4 text-text-muted text-[10px] font-mono uppercase tracking-widest opacity-60">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.exercises.length} Units</span>
                <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> TIER {workout.exercises.length > 5 ? 'S' : 'B'}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedWorkout(workout)}
              className="mt-6 w-full sl-button bg-surface-light group-hover:bg-primary/20 group-hover:border-primary/50 text-text transition-all py-3 font-display uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              Analyze Protocol <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
        
        {workouts.length === 0 && (
          <div className="md:col-span-2 sl-card h-48 flex flex-col items-center justify-center text-text-muted border-dashed border-white/5">
            <Plus className="w-8 h-8 opacity-20 mb-2" />
            <p className="font-mono text-[10px] uppercase tracking-widest">No active protocols detected</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {workoutToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base/90 backdrop-blur-md"
              onClick={() => setWorkoutToDelete(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-surface border border-red-500/20 rounded-2xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Warning Background Icon */}
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-5 pointer-events-none">
                <Trash2 className="w-32 h-32 text-red-500" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h3 className="text-xl font-display font-bold uppercase italic text-white">Decommission Protocol</h3>
                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Irreversible Action</p>
                </div>
              </div>

              <p className="text-xs text-text-muted mb-8 leading-relaxed">
                Confirming this request will permanently erase the selected training protocol from the System. This data cannot be recovered.
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setWorkoutToDelete(null)}
                  className="flex-1 sl-button border border-white/5 uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all py-3"
                >
                  Abort
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-[1.5] sl-button bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-[10px] font-bold py-3"
                >
                  Confirm Erasure
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workout Preview Modal */}
      <AnimatePresence>
        {selectedWorkout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base/80 backdrop-blur-md"
              onClick={() => setSelectedWorkout(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] z-50"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em]">Protocol Specification</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase italic text-white">{selectedWorkout.name}</h3>
                </div>
                <button onClick={() => setSelectedWorkout(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="sl-card !p-3 text-center border-white/5 bg-surface-light/30">
                    <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest mb-1">Units</p>
                    <p className="text-lg font-display font-bold">{selectedWorkout.exercises.length}</p>
                  </div>
                  <div className="sl-card !p-3 text-center border-white/5 bg-surface-light/30">
                    <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest mb-1">Est. Power</p>
                    <p className="text-lg font-display font-bold">{selectedWorkout.exercises.length * 12}0</p>
                  </div>
                  <div className="sl-card !p-3 text-center border-white/5 bg-surface-light/30">
                    <p className="text-[8px] font-mono text-text-muted uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-lg font-display font-bold uppercase text-primary">{selectedWorkout.exercises.length > 5 ? 'S' : 'B'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                    <List className="w-3 h-3 text-primary" /> Tactical Manifest
                  </h4>
                  {selectedWorkout.exercises.map((ex, idx) => (
                    <div key={ex.id} className="sl-card !p-4 border-white/5 bg-surface-light/20 flex justify-between items-center">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3">
                           <span className="font-mono text-xs text-primary/40 italic">0{idx+1}</span>
                           <h5 className="font-display font-bold uppercase text-sm tracking-tight text-white">{ex.name}</h5>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1 italic max-w-sm">{ex.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-display font-bold text-white">
                          {ex.sets} SETS
                        </p>
                        <p className="text-[10px] font-mono text-primary uppercase">
                          {ex.targetValue} {ex.targetType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-surface-dark">
                <button 
                  onClick={() => {
                    onStartWorkout(selectedWorkout);
                    setSelectedWorkout(null);
                  }}
                  className="w-full sl-button-primary py-4 uppercase font-bold tracking-[0.4em] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(127,119,221,0.2)]"
                >
                  <Play className="w-4 h-4 fill-current" /> Deploy units
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-base/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {!creationMode ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-display font-bold uppercase italic italic">Protocol Initialization</h3>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">Select logic source</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setCreationMode("ai")}
                      className="sl-card !p-6 hover:border-primary/40 transition-all text-center space-y-4 group"
                    >
                      <Brain className="w-10 h-10 mx-auto text-primary animate-pulse" />
                      <div>
                        <h4 className="font-display font-bold uppercase text-xs">AI Architect</h4>
                        <p className="text-[9px] font-mono text-text-muted mt-1 uppercase">Recommended</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => setCreationMode("manual")}
                      className="sl-card !p-6 hover:border-text/40 transition-all text-center space-y-4"
                    >
                      <Settings2 className="w-10 h-10 mx-auto text-text-muted" />
                      <div>
                        <h4 className="font-display font-bold uppercase text-xs">Manual Entry</h4>
                        <p className="text-[9px] font-mono text-text-muted mt-1 uppercase">Custom Specs</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : creationMode === "ai" ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-display font-bold uppercase italic italic">Architect Intelligence</h3>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">Define training objective</p>
                  </div>
                  <textarea 
                    placeholder="E.g. Want explosive leg power, training for 5K run, focusing on chest and core..."
                    value={aiRequest}
                    onChange={(e) => setAiRequest(e.target.value)}
                    className="w-full h-32 bg-surface-light border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white resize-none"
                  />
                  <button 
                    onClick={handleAIDesign}
                    disabled={isGenerating || !aiRequest}
                    className="w-full sl-button-primary py-4 uppercase tracking-[0.3em] text-xs font-display flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                   {isGenerating ? "Synthesizing Protocol..." : "Generate Program"}
                   <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-muted font-mono uppercase text-xs tracking-widest">Manual Interface v2.0 Coming Soon</p>
                  <p className="text-[10px] text-primary mt-2">Use AI Architect for now, Hunter.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
