import React, { useState } from "react";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { motion } from "motion/react";
import { LogIn, UserPlus, Github, Mail, Lock } from "lucide-react";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-primary rounded-xl mb-4 shadow-[0_0_30px_rgba(127,119,221,0.5)] transform rotate-45" />
          <h1 className="text-4xl font-display font-bold tracking-tighter text-white uppercase italic">Workout Leveling</h1>
          <p className="text-text-muted font-mono text-sm mt-2 opacity-60 tracking-[0.3em]">Become the Apex Awakened</p>
        </div>

        <div className="sl-card border-primary/20">
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 font-display font-bold py-2 uppercase tracking-widest text-sm transition-all border-b-2 ${
                isLogin ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 font-display font-bold py-2 uppercase tracking-widest text-sm transition-all border-b-2 ${
                !isLogin ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Awaken
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                id="auth-email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-primary transition-all text-white"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                id="auth-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-light border border-white/5 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-primary transition-all text-white"
                required
              />
            </div>

            {error && <p id="auth-error" className="text-red-400 text-xs font-mono">{error}</p>}

            <button 
              type="submit"
              className="w-full sl-button-primary py-3 uppercase tracking-[0.2em] font-display text-sm group overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLogin ? "Enter System" : "Begin Awakening"}
              </div>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-mono"><span className="bg-surface px-2 text-text-muted">Or Link Identity</span></div>
          </div>

          <button 
            id="google-signin"
            onClick={handleGoogleSignIn}
            className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-white sl-button py-3 flex items-center justify-center gap-2 mb-4"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" className="w-5 h-5" alt="Google" />
            <span className="uppercase tracking-widest text-xs font-display">Continue with Google</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
