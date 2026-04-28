import { UserProfile, Quest, Workout, Stats } from "../types";

export async function generateQuests(userProfile: UserProfile, workoutHistory: any[], stats: Stats | null): Promise<Quest[]> {
  const response = await fetch("/api/ai/quests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userProfile, workoutHistory, stats }),
  });
  if (!response.ok) throw new Error("Failed to generate quests");
  const data = await response.json();
  return data.quests;
}

export async function generateWorkout(userProfile: UserProfile, request: string, injuryHistory?: string, stats?: Stats | null): Promise<Workout> {
  const response = await fetch("/api/ai/workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userProfile, request, injuryHistory, stats }),
  });
  if (!response.ok) throw new Error("Failed to generate workout");
  const data = await response.json();
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    createdBy: "ai"
  };
}

export async function chatWithSystem(messages: { role: string; content: string }[], userProfile: UserProfile, stats: Stats | null): Promise<string> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, userProfile, stats }),
  });
  if (!response.ok) throw new Error("Failed to chat with System");
  const data = await response.json();
  return data.message;
}
