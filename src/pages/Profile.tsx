import React, { useState } from "react";
import { useAuth } from "../App";
import { auth, db } from "../lib/firebase";
import { RankBadge } from "../components/RankBadge";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, Settings, Award, History, Share2, ShieldCheck, MapPin, Trash2, AlertTriangle, FilePlus, X } from "lucide-react";
import { onSnapshot, query, collection, orderBy, limit, deleteDoc, doc, writeBatch, setDoc, updateDoc } from "firebase/firestore";

export function ProfilePage() {
  const { profile, user, stats } = useAuth();
  const [avatarSeed, setAvatarSeed] = useState(user?.uid || "hunter");
  const [history, setHistory] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [encounterName, setEncounterName] = useState("");
  const [encounterXp, setEncounterXp] = useState("50");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!user) return;
    const qry = query(collection(db, "users", user.uid, "history"), orderBy("date", "desc"), limit(10));
    const unsub = onSnapshot(qry, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleAddEncounter = async () => {
    if (!user || !encounterName) return;
    setIsSubmitting(true);
    try {
      const xp = parseInt(encounterXp) || 0;
      await setDoc(doc(db, "users", user.uid, "history", `${Date.now()}`), {
        date: new Date(),
        workoutName: encounterName,
        xpEarned: xp,
        type: 'manual'
      });
      // Also update profile XP
      await updateDoc(doc(db, "users", user.uid), {
        xp: (await import("firebase/firestore")).increment(xp),
        totalXp: (await import("firebase/firestore")).increment(xp)
      });
      setShowEncounterModal(false);
      setEncounterName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  const handleDeleteLog = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "history", id));
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSystemReset = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    
    // Reset Profile
    batch.update(doc(db, "users", user.uid), {
      level: 1,
      xp: 0,
      totalXp: 0,
      rank: "IRON"
    });

    // Reset Stats
    batch.set(doc(db, "users", user.uid, "stats", "current"), {
      strength: 5,
      endurance: 5,
      agility: 5,
      flexibility: 5,
      ironWill: 5,
      lastUpdated: new Date()
    });

    // We don't delete history here to prevent accidental total loss, 
    // but the user can clear it manually.

    await batch.commit();
    setShowResetModal(false);
  };

  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex flex-col items-center justify-center pt-4 md:pt-8 space-y-4">
        <div className="relative group">
          <div 
            onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
            className="w-32 h-32 rounded-3xl bg-surface border-4 border-primary/20 overflow-hidden shadow-[0_0_40px_rgba(127,119,221,0.3)] cursor-pointer group hover:border-primary/50 transition-all"
          >
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
              alt={profile.displayName} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-mono text-white font-bold uppercase tracking-widest">Re-roll</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4">
            <RankBadge rank={profile.rank} size="sm" />
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold uppercase italic tracking-tighter text-white">{profile.displayName}</h2>
          <p className="text-primary font-mono text-[10px] uppercase tracking-[0.5em] mt-1">{profile.email}</p>
        </div>

        {/* Rank Up Area */}
        <div className="w-full max-w-sm">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`sl-card border-dashed border-2 flex items-center justify-between group cursor-pointer ${
              profile.level >= 10 ? 'border-primary/50 bg-primary/5' : 'border-white/5 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-8 h-8 ${profile.level >= 10 ? 'text-primary' : 'text-text-muted'}`} />
              <div>
                <h4 className="font-display font-bold text-xs uppercase tracking-widest">Rank-Up Trial</h4>
                <p className="text-[9px] font-mono text-text-muted uppercase">
                  {profile.level >= 10 ? 'Available for Initiation' : `Req: Level 10 (Current: ${profile.level})`}
                </p>
              </div>
            </div>
            {profile.level >= 10 && (
              <span className="text-[10px] font-mono text-primary animate-pulse group-hover:scale-110 transition-transform tracking-widest">START</span>
            )}
          </motion.div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="sl-card !p-6 flex flex-col items-center gap-2 hover:border-primary/30 transition-all">
          <Settings className="w-6 h-6 text-text-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Settings</span>
        </button>
        <button onClick={() => auth.signOut()} className="sl-card !p-6 flex flex-col items-center gap-2 border-red-500/10 hover:border-red-500/30 transition-all text-red-400">
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-mono uppercase tracking-widest">Sign Out</span>
        </button>
      </div>

      <section className="sl-card space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Hunter Log
          </h3>
          <span className="text-[10px] font-mono text-text-muted uppercase">Last 10 Activities</span>
        </div>
        
        <div className="space-y-4">
          {history.length > 0 ? history.map((log) => (
            <div key={log.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-1.5 rounded-full bg-primary`} />
                <div>
                  <p className="text-sm font-display font-medium text-text group-hover:text-primary transition-colors">
                    {log.workoutName || "Generic Training"}
                  </p>
                  <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest">
                    {log.date?.toDate?.() ? log.date.toDate().toLocaleDateString() : "Processing..."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-mono text-primary`}>
                  +{log.xpEarned} XP
                </span>
                <button 
                  onClick={() => setItemToDelete(log.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded transition-all text-text-muted hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center opacity-30">
              <p className="text-[10px] font-mono uppercase tracking-widest">No activities recorded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* System Management */}
      <section className="space-y-4">
        <h3 className="text-xs font-display font-bold uppercase tracking-widest text-text-muted flex items-center gap-2 px-2">
          <Settings className="w-4 h-4 text-primary" />
          System Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowEncounterModal(true)}
            className="sl-card !p-4 border-white/5 hover:border-primary/20 transition-all flex items-center gap-4 group text-left"
          >
            <div className="w-10 h-10 bg-surface-light rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <FilePlus className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h4 className="font-display font-bold uppercase text-[10px] tracking-widest mb-0.5">Encounter Report</h4>
              <p className="text-[9px] font-mono text-text-muted opacity-60 uppercase">Manual Data Entry</p>
            </div>
          </button>
          <button 
            onClick={() => setShowResetModal(true)}
            className="sl-card !p-4 border-white/5 hover:border-red-500/20 transition-all flex items-center gap-4 group text-left"
          >
            <div className="w-10 h-10 bg-surface-light rounded flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
              <AlertTriangle className="w-5 h-5 text-text-muted group-hover:text-red-500 transition-colors" />
            </div>
            <div>
              <h4 className="font-display font-bold uppercase text-[10px] tracking-widest mb-0.5">Initial Reset</h4>
              <p className="text-[9px] font-mono text-red-400/60 uppercase">Wipe Progress State</p>
            </div>
          </button>
        </div>
      </section>

      {/* Reset Modal */}
      <AnimatePresence>
        {showEncounterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/90 backdrop-blur-md" onClick={() => setShowEncounterModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold uppercase italic text-white leading-tight">Encounter Report</h3>
                  <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">Manual Data Injection</p>
                </div>
                <button onClick={() => setShowEncounterModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono text-text-muted uppercase tracking-widest block mb-1">Encounter Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Shadow Soldier Training"
                    value={encounterName}
                    onChange={(e) => setEncounterName(e.target.value)}
                    className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-text-muted uppercase tracking-widest block mb-1">Mana Harvested (XP)</label>
                  <input 
                    type="number" 
                    value={encounterXp}
                    onChange={(e) => setEncounterXp(e.target.value)}
                    className="w-full bg-surface-light border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary transition-all text-white"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleAddEncounter}
                  disabled={isSubmitting || !encounterName}
                  className="w-full sl-button-primary py-4 uppercase font-bold tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  {isSubmitting ? "Transmitting..." : "Submit Report"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/90 backdrop-blur-md" onClick={() => setShowResetModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-surface border border-red-500/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 font-display">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter">System Re-Awakening</h3>
              </div>
              <p className="text-xs text-text-muted mb-8 leading-relaxed font-mono uppercase tracking-widest opacity-80">
                Warning: This protocol will initialize your power levels. Level, XP, and Stats will revert to baseline. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowResetModal(false)} className="flex-1 sl-button border border-white/5 uppercase text-[10px] tracking-widest">Abort</button>
                <button 
                  onClick={handleSystemReset}
                  className="flex-[1.5] sl-button bg-red-500/20 text-red-500 border border-red-500/30 font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Single Log Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-base/80 backdrop-blur-md" onClick={() => setItemToDelete(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-lg font-display font-bold uppercase mb-4">Expunge Record</h3>
              <p className="text-xs text-text-muted mb-8 italic">Delete this specific encounter from your memory?</p>
              <div className="flex gap-4">
                <button onClick={() => setItemToDelete(null)} className="flex-1 sl-button border border-white/5 uppercase text-[10px] tracking-widest">Cancel</button>
                <button 
                  onClick={() => handleDeleteLog(itemToDelete)}
                  className="flex-1 sl-button bg-red-500 text-white uppercase text-[10px] tracking-widest font-bold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center pb-8">
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.4em] opacity-30">
          Hunter License: {user?.uid.toUpperCase()}
        </p>
      </div>
    </motion.div>

  );
}
