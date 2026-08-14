import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Personalized Remedy & Cycle Advice endpoint
  app.post("/api/gemini-advice", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server."
        });
      }

      const { age, phase, dayInCycle, cycleLength, periodDuration, symptoms, last3Periods } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `You are an empathetic, expert women's health and holistic period wellness companion.
User Details:
- Age: ${age || "Not specified"}
- Current Cycle Phase: ${phase || "Unknown"} (Day ${dayInCycle || 1} of ${cycleLength || 28})
- Average Cycle Length: ${cycleLength || 28} days
- Average Period Duration: ${periodDuration || 5} days
- Logged Symptoms: ${symptoms && symptoms.length > 0 ? symptoms.join(", ") : "None reported"}
- Recent Period Starts: ${last3Periods && last3Periods.length > 0 ? last3Periods.join(", ") : "Not provided"}

Please provide a concise, compassionate, and actionable wellness recommendation covering:
1. Direct phase insight based on age and day in cycle.
2. Specific dietary nutrients & key foods to eat today.
3. Highlighted vitamins & minerals crucial right now and why.
4. Rest, stress relief, and physical movement tips tailored to current symptoms.

Keep tone warm, scientific yet easy to read, and formatted with clear bullet points. Avoid medical jargon without explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: systemPrompt,
      });

      res.json({ advice: response.text });
    } catch (err: any) {
      console.error("Error generating Gemini advice:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI advice" });
    }
  });

  // Interactive AI Period & Cycle Chatbot endpoint (Multi-turn)
  app.post("/api/gemini-chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server."
        });
      }

      const { messages, userContext } = req.body;
      const {
        age,
        phase,
        dayInCycle,
        cycleLength,
        periodDuration,
        symptoms,
        last3Periods
      } = userContext || {};

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are "Flawsome Cycle & Period Companion", an empathetic, highly knowledgeable, caring, and science-backed AI assistant.
The user is asking questions, discussing doubts, or seeking clarity regarding:
- Menstrual periods, cycle phases, and ovulation timing
- Symptoms (cramps, bloating, mood swings, breast tenderness, fatigue, acne, cravings)
- Discharge types and whether they are normal
- Nutrition, foods to eat, and hydration for their phase
- Safe workouts, exercises, and energy management
- Sanitary care, pad refills, tampons, cups, hygiene & comfort
- Fertility, PMS vs ovulation signs, and cycle irregularities

User's Real-Time Profile & Active Cycle Context:
- Age: ${age || 24}
- Current Active Phase: ${phase || "Ovulation / Menstrual"}
- Day in Cycle: Day ${dayInCycle || 1} of a ${cycleLength || 28}-day cycle
- Average Period Duration: ${periodDuration || 5} days
- Logged Symptoms Today: ${symptoms && symptoms.length > 0 ? symptoms.join(", ") : "None reported"}
- Recent Period Records: ${last3Periods && last3Periods.length > 0 ? last3Periods.join(", ") : "Tracked"}

Response Rules:
1. Be warm, reassuring, destigmatizing, and concise. Speak like a supportive health companion.
2. Directly answer their specific question or doubt with evidence-based insights.
3. Tailor advice to their current cycle phase (${phase}, Day ${dayInCycle}) and symptoms when relevant.
4. Format with clean bullet points, bold highlights, and clear sections so it is easily scannable on mobile screens.
5. Educational & wellness support disclaimer: Kindly remind for severe pain or urgent clinical concerns to consult a gynecologist.`;

      // Build strictly compliant contents array for Gemini (alternating user/model, starting with user)
      const rawList = (messages || [])
        .map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" || m.role === "model" ? "model" : "user",
          text: (m.content || "").trim(),
        }))
        .filter((m: { role: string; text: string }) => m.text.length > 0);

      // Find first user message index (Gemini API requires first message to have role: 'user')
      const firstUserIdx = rawList.findIndex((m: { role: string }) => m.role === "user");
      const validFromUser = firstUserIdx !== -1 ? rawList.slice(firstUserIdx) : [];

      // Consolidate consecutive messages with the same role
      const consolidated: { role: string; parts: { text: string }[] }[] = [];
      for (const item of validFromUser) {
        if (consolidated.length > 0 && consolidated[consolidated.length - 1].role === item.role) {
          consolidated[consolidated.length - 1].parts[0].text += `\n\n${item.text}`;
        } else {
          consolidated.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }

      // If no valid user message, provide default context query
      if (consolidated.length === 0) {
        consolidated.push({
          role: "user",
          parts: [{ text: `Hello! I am on Day ${dayInCycle || 1} of my cycle (${phase || "Cycle"}). What should I know for my period and health today?` }],
        });
      }

      let replyText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: consolidated,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        replyText = response.text || "";
      } catch (geminiErr) {
        console.warn("Primary gemini-2.5-flash error, trying fallback model:", geminiErr);
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: consolidated,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        replyText = fallbackResponse.text || "";
      }

      res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Error in Gemini Chat endpoint:", err);
      res.status(500).json({ error: err.message || "Failed to generate chat response" });
    }
  });

  // Vite middleware for dev or static server for production
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
    console.log(`Period Tracker server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
