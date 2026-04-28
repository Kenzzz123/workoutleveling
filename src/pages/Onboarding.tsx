import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile, Rank } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, User, Ruler, Weight, Dumbbell, Calendar } from "lucide-react";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    displayName: auth.currentUser?.displayName || "",
    height: 175,
    weight: 75,
    age: 25,
    maxPushups: 0,
    maxSquats: 0,
    maxPlank: 0,
    canPullup: false,
    pullupsCount: 0,
    experience: "beginner",
    workoutDays: ["Monday", "Wednesday", "Friday"],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workoutDays: prev.workoutDays.includes(day) 
        ? prev.workoutDays.filter(d => d !== day)
        : [...prev.workoutDays, day]
    }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Initial Rank Assessment would normally be an API call to Groq
      // For onboarding speed, I'll calculate a base rank but normally we'd fetch from /api/ai/onboarding
      let initialRank = Rank.IRON;
      if (formData.maxPushups > 30 && formData.pullupsCount > 5) initialRank = Rank.BRONZE;
      if (formData.maxPushups > 50 && formData.pullupsCount > 12) initialRank = Rank.SILVER;

      const profile: Partial<UserProfile> = {
        displayName: formData.displayName,
        email: user.email || "",
        height: formData.height,
        weight: formData.weight,
        age: formData.age,
        maxPushups: formData.maxPushups,
        rank: initialRank,
        level: 1,
        xp: 0,
        totalXp: 0,
        onboarded: true,
        workoutDays: formData.workoutDays,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), profile);
      
      // Initialize stats
      await setDoc(doc(db, "users", user.uid, "stats", "current"), {
        strength: initialRank === Rank.IRON ? 5 : 10,
        endurance: 5,
        agility: 5,
        flexibility: 5,
        ironWill: 5,
      });

      // Initialize schedule
      await setDoc(doc(db, "users", user.uid, "schedule", "current"), {
        workoutDays: formData.workoutDays,
        restDays: days.filter(d => !formData.workoutDays.includes(d)),
      });

      // Initialize streak
      await setDoc(doc(db, "users", user.uid, "streak", "current"), {
        current: 0,
        longest: 0,
        lastCheckin: null,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Identity Transmission",
      subtitle: "Registering your data in the System",
      icon: User,
      content: (
        <div className="space-y-6">
          <div className="relative group">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Experience</label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white appearance-none"
              >
                <option value="beginner">Beginner</option>
                <option value="novice">Novice</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Hunter</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Physical Baseline",
      subtitle: "Measuring current vessel capacity",
      icon: Ruler,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>
            <div className="relative group">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Max Push-ups (No Stop)</label>
              <input
                type="number"
                value={formData.maxPushups}
                onChange={(e) => setFormData({ ...formData, maxPushups: Number(e.target.value) })}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>
            <div className="relative group">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-text-muted mb-2">Max Pull-ups</label>
              <input
                type="number"
                value={formData.pullupsCount}
                onChange={(e) => setFormData({ ...formData, pullupsCount: Number(e.target.value) })}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Training Rhythm",
      subtitle: "Establishing active window protocol",
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <p className="text-xs text-text-muted italic opacity-50 text-center uppercase tracking-wide">Select your weekly workout days</p>
          <div className="grid grid-cols-2 gap-2">
            {days.map((day) => {
              const isSelected = formData.workoutDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-3 px-4 rounded-lg border transition-all text-sm font-display uppercase tracking-widest ${
                    isSelected ? "bg-primary/20 border-primary text-primary" : "bg-surface-light border-white/5 text-text-muted hover:border-white/20"
                   }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-base flex flex-col p-4 md:p-8">
      <div className="max-w-xl mx-auto w-full flex-grow flex flex-col justify-center">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white uppercase italic">
                {steps[step].title}
              </h1>
              <p className="text-primary font-mono text-[10px] uppercase tracking-[0.3em] mt-1">
                {steps[step].subtitle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-text-muted uppercase">Protocol Step</p>
              <p className="text-xl font-display text-white">{step + 1}/{steps.length}</p>
            </div>
          </div>
          <div className="h-1 w-full bg-surface-light rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary shadow-[0_0_10px_rgba(127,119,221,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="sl-card mb-8 border-primary/10"
        >
          {steps[step].content}
        </motion.div>

        <div className="flex gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 sl-button border border-white/5 text-text-muted hover:text-text hover:bg-white/5 uppercase tracking-widest text-xs py-4"
            >
              Previous
            </button>
          )}
          <button
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else handleComplete();
            }}
            disabled={isSubmitting}
            className="flex-[2] sl-button-primary uppercase tracking-[0.3em] font-display text-xs py-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {step === steps.length - 1 ? "Initialize Awakening" : "Proceed"}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-auto text-center opacity-30">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-text-muted">
          Access Granted // System Initializing Vessel ${auth.currentUser?.uid.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}
