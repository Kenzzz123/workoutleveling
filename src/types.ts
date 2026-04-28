export enum Rank {
  IRON = 'Iron',
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  SHADOW = 'Shadow',
  MONARCH = 'Monarch'
}

export interface Stats {
  strength: number;
  endurance: number;
  agility: number;
  flexibility: number;
  ironWill: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  height: number;
  weight: number;
  age: number;
  maxPushups: number;
  rank: Rank;
  level: number;
  xp: number;
  totalXp: number;
  createdAt: any;
  lastActive: any;
  onboarded: boolean;
  workoutDays: string[]; // e.g. ["Monday", "Wednesday"]
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: any;
  category: 'combat' | 'endurance' | 'growth' | 'special';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  type: 'main' | 'side' | 'challenge';
  completed: boolean;
  requirements?: string[];
  verificationLog?: string;
  verifiedAt?: any;
}

export interface DailyQuests {
  date: string; // YYYY-MM-DD
  generated: boolean;
  quests: Quest[];
}

export interface Exercise {
  id: string;
  name: string;
  targetType: 'reps' | 'duration';
  targetValue: number;
  sets: number;
  restBetweenSets: number;
  restAfterExercise: number;
  description: string;
}

export interface Workout {
  id: string;
  name: string;
  createdAt: any;
  createdBy: 'ai' | 'manual';
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  date: any;
  workoutId: string;
  exercisesCompleted: number;
  xpEarned: number;
  statDeltas: Partial<Stats>;
  duration: number; // seconds
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: any;
  icon?: string;
}
