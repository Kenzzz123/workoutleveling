import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { UserProfile, Rank, Stats } from "./types";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { QuestBoard } from "./pages/QuestBoard";
import { MyWorkouts } from "./pages/MyWorkouts";
import { AICoach } from "./pages/AICoach";
import { ProgressPage } from "./pages/Progress";
import { ProfilePage } from "./pages/Profile";
import { LogCalendar } from "./pages/LogCalendar";
import { Onboarding } from "./pages/Onboarding";
import { AuthPage } from "./pages/AuthPage";
import { WorkoutTimer } from "./pages/WorkoutTimer";
import { AnimatePresence } from "motion/react";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  stats: Stats | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, stats: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [activeWorkout, setActiveWorkout] = useState<any>(null); // For the full-screen timer

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setStats(null);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setProfile({ uid: user.uid, ...doc.data() } as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const unsubStats = onSnapshot(doc(db, "users", user.uid, "stats", "current"), (doc) => {
      if (doc.exists()) {
        setStats(doc.data() as Stats);
      }
    });

    return () => {
      unsubProfile();
      unsubStats();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-display text-primary animate-pulse tracking-widest uppercase">Initializing System...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // If we have a user but no profile document exists, or they haven't finished onboarding
  if (!profile || !profile.onboarded) {
    return <AuthContext.Provider value={{ user, profile, stats, loading }}><Onboarding /></AuthContext.Provider>;
  }

  if (activeWorkout) {
    return <WorkoutTimer workout={activeWorkout} onClose={() => setActiveWorkout(null)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard setActivePage={setActivePage} onStartWorkout={setActiveWorkout} />;
      case "quests": return <QuestBoard onStartWorkout={setActiveWorkout} />;
      case "workouts": return <MyWorkouts onStartWorkout={setActiveWorkout} />;
      case "coach": return <AICoach />;
      case "progress": return <ProgressPage />;
      case "calendar": return <LogCalendar />;
      case "profile": return <ProfilePage />;
      default: return <Dashboard setActivePage={setActivePage} onStartWorkout={setActiveWorkout} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, stats, loading }}>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </Layout>
    </AuthContext.Provider>
  );
}
