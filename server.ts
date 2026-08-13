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

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an empathetic, expert women's health and holistic period wellness companion.
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
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ advice: response.text });
    } catch (err: any) {
      console.error("Error generating Gemini advice:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI advice" });
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
