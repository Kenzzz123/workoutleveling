import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DailyQuests, Quest } from "../types";
import { formatDate } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronRight, Sword, Shield, Zap, Play, Info, RefreshCw, X, FileText, Camera } from "lucide-react";
import { generateQuests } from "../lib/groq";

export function QuestBoard({ onStartWorkout }: { onStartWorkout: (w: any) => void }) {
  const { user, profile, stats } = useAuth();
  const [dailyQuests, setDailyQuests] = useState<DailyQuests | null>(null);
  const [isRerolling, setIsRerolling] = useState(false);
  const [rerollRequest, setRerollRequest] = useState("");
  const [showRerollModal, setShowRerollModal] = useState(false);
  const [verifyingQuest, setVerifyingQuest] = useState<Quest | null>(null);
  const [verificationText, setVerificationText] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const today = formatDate(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid, "quests", today), (snap) => {
      if (snap.exists()) setDailyQuests(snap.data() as DailyQuests);
    });
  }, [user]);

  const handleReroll = async () => {
    if (!user || !profile || !stats) return;
    setIsRerolling(true);
    try {
      // In a real app, I'd pass the rerollRequest to the server
      const quests = await generateQuests(profile, [], stats);
      await setDoc(doc(db, "users", user.uid, "quests", today), {
        date: today,
        generated: true,
        requests: rerollRequest, // Store context if needed
        quests: quests.map(q => ({ ...q, completed: false }))
      });
      setShowRerollModal(false);
      setRerollRequest("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsRerolling(false);
    }
  };

  const handleCompleteQuest = async () => {
    if (!dailyQuests || !user || !verifyingQuest) return;
    setIsVerifying(true);
    
    try {
      const updatedQuests = dailyQuests.quests.map(q => 
        q.id === verifyingQuest.id ? { 
          ...q, 
          completed: true, 
          verificationLog: verificationText,
          verifiedAt: new Date()
        } : q
      );
      
      await updateDoc(doc(db, "users", user.uid, "quests", today), { quests: updatedQuests });
      
      // Update XP
      await updateDoc(doc(db, "users", user.uid), {
        xp: (await import("firebase/firestore")).increment(verifyingQuest.xp),
        totalXp: (await import("firebase/firestore")).increment(verifyingQuest.xp)
      });

      // Add to history
      await setDoc(doc(db, "users", user.uid, "history", `${today}-${verifyingQuest.id}`), {
        date: new Date(),
        workoutName: `Quest: ${verifyingQuest.title}`,
        xpEarned: verifyingQuest.xp,
        type: 'quest'
      });

      setVerifyingQuest(null);
      setVerificationText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <p className="text-[10px] font-mono text-primary uppercase tracking-[0.5em] mb-1">Active Gate Protocol</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold uppercase italic tracking-tight">Today's Quests</h2>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest bg-surface px-3 py-2 rounded border border-white/5">
            {today}
          </p>
          <button 
            onClick={() => setShowRerollModal(true)}
            className="sl-button border border-white/5 text-text-muted hover:text-primary transition-colors p-3"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reroll Modal */}
      <AnimatePresence>
        {showRerollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base/80 backdrop-blur-md"
              onClick={() => setShowRerollModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-display font-bold uppercase italic italic mb-4">Reroll Protocol</h3>
              <p className="text-xs text-text-muted mb-6">Modify the current quests by providing a System constraint.</p>
              <textarea 
                placeholder="E.g. No equipment available, focus more on endurance, I'm injured..."
                value={rerollRequest}
                onChange={(e) => setRerollRequest(e.target.value)}
                className="w-full h-24 bg-surface-light border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white mb-6 resize-none"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowRerollModal(false)} className="flex-1 sl-button border border-white/5 uppercase text-xs tracking-widest">Cancel</button>
                <button 
                  onClick={handleReroll}
                  disabled={isRerolling}
                  className="flex-grow sl-button-primary uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2"
                >
                  {isRerolling ? "Recalibrating..." : "Initiate Reroll"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <AnimatePresence>
        {verifyingQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-base/90 backdrop-blur-md"
              onClick={() => setVerifyingQuest(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-display font-bold uppercase italic">Proof of Work</h3>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Protocol Verification</p>
                </div>
              </div>

              <div className="sl-card !p-4 bg-surface-dark/50 border-white/5 mb-6">
                <p className="text-[10px] font-mono text-primary uppercase mb-1">Target Mission</p>
                <p className="text-sm font-display font-bold text-white uppercase">{verifyingQuest.title}</p>
              </div>

              <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest block mb-2">Combat Log / Summary</label>
                    <textarea 
                        placeholder="Describe your completion (e.g. Completed all sets with 20kg, ran 5km in 25min...)"
                        value={verificationText}
                        onChange={(e) => setVerificationText(e.target.value)}
                        className="w-full h-32 bg-surface-light border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white resize-none"
                    />
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 sl-button border border-white/5 opacity-50 cursor-not-allowed text-[10px] uppercase font-mono py-3 flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" /> Upload Proof
                    </button>
                    <button className="flex-1 sl-button border border-white/5 opacity-50 cursor-not-allowed text-[10px] uppercase font-mono py-3 flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" /> Link Data
                    </button>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={() => setVerifyingQuest(null)} className="flex-1 sl-button border border-white/5 uppercase text-xs tracking-widest">Abort</button>
                <button 
                  onClick={handleCompleteQuest}
                  disabled={isVerifying || verificationText.length < 10}
                  className="flex-grow sl-button-primary uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {isVerifying ? "Verifying..." : "Submit Proof"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="grid gap-6">
        {dailyQuests?.quests.map((quest) => (
          <motion.div 
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`sl-card border-l-[4px] relative overflow-hidden transition-all ${
              quest.type === 'main' ? 'border-l-primary' : 
              quest.type === 'challenge' ? 'border-l-orange-500' : 'border-l-text-muted'
            } ${quest.completed ? 'opacity-40 pointer-events-none' : ''}`}
          >
            {quest.completed && (
              <div className="absolute top-4 right-4 z-10">
                <CheckCircle2 className="w-8 h-8 text-primary animate-in zoom-in duration-500" />
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest border ${
                    quest.type === 'main' ? 'bg-primary/10 border-primary/30 text-primary' :
                    quest.type === 'challenge' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                    'bg-white/5 border-white/10 text-text-muted'
                  }`}>
                    {quest.type} Quest
                  </span>
                  <span className="text-[10px] font-mono text-primary uppercase">+{quest.xp} XP</span>
                </div>
                
                <h3 className="text-xl font-display font-bold uppercase tracking-tight">{quest.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{quest.description}</p>
                
                {quest.requirements && (
                  <div className="bg-white/5 rounded-lg p-3 space-y-2 border border-white/5">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Requirements</p>
                    <ul className="space-y-1">
                      {quest.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-text flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:w-1/3 flex flex-col justify-center space-y-3">
                <button 
                  onClick={() => setVerifyingQuest(quest)}
                  className={`w-full sl-button bg-surface-light hover:bg-white/10 text-white uppercase tracking-widest text-xs py-4 flex items-center justify-center gap-2 border border-white/10`}
                >
                  Verify Protocol
                </button>
                <div className="text-center">
                  <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest opacity-40">System verification required</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {!dailyQuests && (
          <div className="sl-card h-64 flex flex-col items-center justify-center space-y-4 border-dashed border-white/10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-text-muted animate-pulse">Scanning for nearby gates...</p>
          </div>
        )}
      </div>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 flex gap-4">
        <Info className="w-5 h-5 text-orange-500 shrink-0" />
        <p className="text-xs text-orange-200/70 italic leading-relaxed">
          Quests not completed by midnight will be lost. Streaks are reset upon failure of the Main Quest. Do not falter.
        </p>
      </div>
    </motion.div>
  );
}
