import React from "react";
import { LayoutDashboard, Sword, Crosshair, MessageSquare, BarChart3, User, Calendar, Bell, Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Layout({ children, activePage, setActivePage }: LayoutProps) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Home" },
    { id: "calendar", icon: Calendar, label: "History" },
    { id: "quests", icon: Sword, label: "Quests" },
    { id: "workouts", icon: Crosshair, label: "Train" },
    { id: "coach", icon: MessageSquare, label: "System" },
    { id: "progress", icon: BarChart3, label: "Growth" },
    { id: "profile", icon: User, label: "Hunter" },
  ];

  return (
    <div className="min-h-screen bg-base pb-20 md:pb-0 md:pl-64 pt-16 md:pt-0">
      {/* Mobile Top Navbar */}
      <header className="fixed top-0 left-0 w-full h-16 bg-surface/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:hidden z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary rounded shadow-[0_0_10px_rgba(127,119,221,0.5)]" />
          <h1 className="text-sm font-display font-bold tracking-tight text-white uppercase italic truncate max-w-[150px]">Leveling</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-text-muted hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActivePage("profile")}
            className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden bg-surface-light flex items-center justify-center p-1"
          >
            <User className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-white/5 hidden md:flex flex-col p-6 z-40">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded shadow-[0_0_15px_rgba(127,119,221,0.5)]" />
          <h1 className="text-xl font-display font-bold tracking-tight text-white uppercase italic">Workout Leveling</h1>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActive ? "bg-primary/20 text-primary shadow-[inset_0_0_10px_rgba(127,119,221,0.1)]" : "text-text-muted hover:text-text hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "group-hover:text-text"}`} />
                <span className="font-display font-medium uppercase tracking-wider text-sm">{item.label}</span>
                {isActive && <motion.div layoutId="sidebar-active" className="ml-auto w-1 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(127,119,221,0.5)]" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 opacity-50 text-[10px] uppercase font-mono tracking-widest text-text-muted">
          System v1.2.4 // Connection Secure
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-2xl border-t border-white/5 flex justify-between px-2 py-3 md:hidden z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActivePage(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-text-muted hover:text-text"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[8px] font-display uppercase tracking-widest font-bold whitespace-nowrap">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-active"
                  className="absolute -top-3 w-10 h-0.5 bg-primary shadow-[0_0_10px_rgba(127,119,221,0.5)] rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
