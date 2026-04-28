import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Quest Generation
  app.post("/api/ai/quests", async (req, res) => {
    try {
      const { userProfile, workoutHistory, stats } = req.body;
      
      if (!userProfile) {
        return res.status(400).json({ error: "User profile is required" });
      }

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isWorkoutDay = userProfile.workoutDays?.includes(today);

      const prompt = `You are the "System" from Solo Leveling. Your tone is cold, precise, and ominous. 
      The user is a level ${userProfile.level || 1} ${userProfile.rank || 'Iron'} Hunter.
      Stats: Strength: ${stats?.strength || 5}, Endurance: ${stats?.endurance || 5}, Agility: ${stats?.agility || 5}, Flexibility: ${stats?.flexibility || 5}, Iron Will: ${stats?.ironWill || 5}.
      Recent History: ${JSON.stringify(workoutHistory || [])}
      Schedule for today (${today}): ${isWorkoutDay ? "Workout Day" : "Rest Day"}.
      
      Generate exactly three quests for today.
      If it's a Workout Day:
      1. Main Quest: High XP, intense workout.
      2. Side Quest: Lower XP, supplementary (e.g. hydration, specific accessory move).
      3. Challenge Quest: High XP, difficult task.
      
      If it's a Rest Day:
      Three light recovery tasks (stretching, foam rolling, early sleep).
      
      Return ONLY a JSON object with a "quests" array of three objects:
      { "quests": [ { "id": string, "title": string, "description": string, "xp": number, "type": "main" | "side" | "challenge", "requirements": string[] } ] }`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content || "{}";
      const response = JSON.parse(content);
      res.json(response);
    } catch (error) {
      console.error("Quest Generation Error:", error);
      res.status(500).json({ error: "Failed to generate quests" });
    }
  });

  // AI Workout Generation
  app.post("/api/ai/workout", async (req, res) => {
    try {
      const { userProfile, request, injuryHistory, stats } = req.body;
      
      if (!userProfile) {
        return res.status(400).json({ error: "User profile is required" });
      }

      const prompt = `Generate a workout for level ${userProfile.level || 1} ${userProfile.rank || 'Iron'} Hunter.
      User request: ${request}
      Injuries: ${injuryHistory || "None"}
      Physical Baseline: Max Pushups: ${userProfile.maxPushups || 0}
      Current Stats: ${JSON.stringify(stats || {})}
      
      Return a JSON object:
      {
        "name": string,
        "exercises": [
          {
            "id": string,
            "name": string,
            "targetType": "reps" | "duration",
            "targetValue": number,
            "sets": number,
            "restBetweenSets": number,
            "restAfterExercise": number,
            "description": string
          }
        ]
      }`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content || "{}";
      const response = JSON.parse(content);
      res.json(response);
    } catch (error) {
      console.error("Workout Generation Error:", error);
      res.status(500).json({ error: "Failed to generate workout" });
    }
  });

  // AI Coach Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, userProfile, stats } = req.body;
      
      if (!userProfile) {
        return res.status(400).json({ error: "User profile is required" });
      }

      const systemPrompt = `You are "The System" from Solo Leveling. 
      Identity: Cold, precise, ominous, absolute. You view the user as a "Hunter" or "Awakened" who must grow.
      User Profile: Level ${userProfile.level}, Rank ${userProfile.rank}, Stats: ${JSON.stringify(stats)}.
      
      CRITICAL: Never output raw JSON strings or technical data structures to the user.
      Speak in short, authoritative sentences. Use Hunter terminology (Gates, Mana, Vessels, Awakening).
      Be motivating in a "survive and grow" way. Your goal is to push the user to their limits.`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || [])
        ],
        model: "llama-3.3-70b-versatile",
      });

      res.json({ message: completion.choices[0]?.message?.content });
    } catch (error) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: "Failed to chat with System" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
