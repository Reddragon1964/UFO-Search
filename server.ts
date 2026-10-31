import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "4mb" }));

  // 1. Deep Scan YouTube for UFO, UAP, and Aliens
  app.post("/api/scan-youtube", async (req, res) => {
    try {
      const {
        query,
        category,
        youtubeUrl,
        dateRangePreset,
        startDate,
        endDate,
        excludedChannels,
        negativeKeywords,
      } = req.body as {
        query?: string;
        category?: string;
        youtubeUrl?: string;
        dateRangePreset?: string;
        startDate?: string;
        endDate?: string;
        excludedChannels?: string[];
        negativeKeywords?: string[];
      };

      const ai = getGenAIClient();
      const baseTopic =
        query?.trim() ||
        "Recent high-credibility YouTube UFO UAP military FLIR footage congressional hearing alien testimony";

      const cleanExcludedChannels = Array.isArray(excludedChannels)
        ? excludedChannels.map((c) => c.trim()).filter(Boolean)
        : [];
      const cleanNegativeKeywords = Array.isArray(negativeKeywords)
        ? negativeKeywords.map((k) => k.trim()).filter(Boolean)
        : [];

      // Build boolean search operators for grounding
      const negativeOperators = [
        ...cleanExcludedChannels.map((ch) => `-"${ch}"`),
        ...cleanNegativeKeywords.map((kw) => `-"${kw}"`),
      ].join(" ");

      let dateWindowConstraint = "Any publication date";
      if (dateRangePreset === "last_30_days") {
        dateWindowConstraint = "Published within the last 30 days (2026-09-30 to 2026-10-30)";
      } else if (dateRangePreset === "last_year") {
        dateWindowConstraint = "Published within the last year (2025-10-30 to 2026-10-30)";
      } else if (dateRangePreset === "2023_present") {
        dateWindowConstraint = "Published between 2023-01-01 and 2026-10-30";
      } else if (dateRangePreset === "2020_2022") {
        dateWindowConstraint = "Published between 2020-01-01 and 2022-12-31";
      } else if (dateRangePreset === "custom" && (startDate || endDate)) {
        dateWindowConstraint = `Published between ${startDate || "1990-01-01"} and ${endDate || "2026-10-30"}`;
      }

      const hasUrl = Boolean(youtubeUrl && youtubeUrl.trim().startsWith("http"));
      const tools: Array<Record<string, unknown>> = [{ googleSearch: {} }];
      if (hasUrl) {
        tools.push({ urlContext: {} });
      }

      const scanPrompt = `You are RunBot, an aerospace and OSINT YouTube Deep-Scan Intelligence Analyst specializing in Unidentified Anomalous Phenomena (UAP), UFO footage, and Non-Human Intelligence (NHI / Alien) disclosures on YouTube.

Perform a deep scan of YouTube and verified public archives for: "${baseTopic} ${negativeOperators}"
${category && category !== "All Captures" && category !== "all" ? `Focus category: ${category}` : ""}
${hasUrl ? `Specifically analyze this YouTube URL as well: ${youtubeUrl}` : ""}

STRICT ADVANCED FILTER CONSTRAINTS:
1. Date Range Requirement: ${dateWindowConstraint}. Every returned finding MUST have a "publishedAt" date in strict YYYY-MM-DD format falling within this window.
2. Excluded Channels (DO NOT return videos from these low-quality/CGI/hoax channels): ${cleanExcludedChannels.length > 0 ? cleanExcludedChannels.join(", ") : "None specified"}.
3. Negative Keywords (DO NOT return videos matching or explained by these terms): ${cleanNegativeKeywords.length > 0 ? cleanNegativeKeywords.join(", ") : "None specified"}.

Return a valid JSON object (and NOTHING ELSE—no markdown code fences) with this exact structure:
{
  "scanSummary": "2-3 sentence technical synthesis of what the YouTube deep scan uncovered, noting how the date range, channel exclusions, and negative keywords narrowed the results.",
  "findings": [
    {
      "id": "unique-slug-id",
      "title": "Exact or representative YouTube Video Title",
      "channel": "YouTube Channel Name (e.g. Department of Defense, House Oversight Committee, NASA, The Basement Office, Eyes On Cinema)",
      "publishedAt": "YYYY-MM-DD",
      "duration": "MM:SS",
      "viewsEstimate": "e.g. 4.2M views",
      "youtubeUrl": "https://www.youtube.com/watch?v=... or verified YouTube search link",
      "category": "One of: Military FLIR | Congressional Testimony | Civilian OSINT | Biological / NHI | Radar & Telemetry",
      "sensorModality": "e.g. AN/ASQ-228 ATFLIR Thermal | Dual-Band Radar | Optical 4K | Sworn Testimony",
      "location": "Geographic location or airspace sector",
      "credibilityIndex": 88,
      "anomalyScore": 91,
      "statusLabel": "One of: ● Verified Multi-Sensor | ▲ Anomalous Kinematics | ◆ Testimony Corroborated | ○ Under OSINT Review",
      "summary": "Concise 2-3 sentence technical summary of the video contents and anomaly claims.",
      "keyTimestamps": [
        { "timestamp": "01:14", "event": "Target lock acquired showing apparent zero-plume thermal signature" },
        { "timestamp": "02:48", "event": "Sudden angular rate change across cloud horizon" }
      ],
      "observables": {
        "positiveLift": 90,
        "instantaneousAcceleration": 85,
        "hypersonicVelocity": 72,
        "transmediumTravel": 65,
        "lowObservability": 88
      }
    }
  ]
}
Provide 4 to 5 distinct, specific, real-world YouTube UAP/UFO/Alien video findings matching the query and filters.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: scanPrompt,
        config: {
          tools,
        },
      });

      const rawText = response.text || "{}";
      const cleanedJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      let parsed: {
        scanSummary?: string;
        findings?: Array<Record<string, unknown>>;
      } = {};

      try {
        const firstBrace = cleanedJson.indexOf("{");
        const lastBrace = cleanedJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          parsed = JSON.parse(cleanedJson.slice(firstBrace, lastBrace + 1));
        }
      } catch {
        parsed = {
          scanSummary: rawText.slice(0, 400),
          findings: [],
        };
      }

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk?.web?.title || "YouTube / Web Intelligence Source",
          uri: chunk?.web?.uri || "",
        }))
        .filter((s: { uri: string }) => Boolean(s.uri));

      res.json({
        scanSummary:
          parsed.scanSummary ||
          `Completed deep scan across YouTube UAP & NHI indices for "${baseTopic}".`,
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
        sources,
      });
    } catch (error: any) {
      console.error("Error in /api/scan-youtube:", error);
      res.status(500).json({
        error:
          error?.message ||
          "Failed to complete YouTube deep scan. Verify your Gemini API key in Settings > Secrets.",
      });
    }
  });

  // 2. Interactive Dialog with RunBot
  app.post("/api/runbot/chat", async (req, res) => {
    try {
      const { messages, selectedFindings } = req.body as {
        messages: Array<{ role: "user" | "assistant"; content: string }>;
        selectedFindings?: Array<Record<string, unknown>>;
      };

      const ai = getGenAIClient();

      const contextDigest =
        Array.isArray(selectedFindings) && selectedFindings.length > 0
          ? selectedFindings
              .map(
                (f: any, idx: number) =>
                  `[${idx + 1}] "${f.title}" (${f.channel}, ${f.publishedAt}) | Category: ${f.category} | Sensor: ${f.sensorModality} | Credibility: ${f.credibilityIndex}% | Anomaly: ${f.anomalyScore}% | Summary: ${f.summary} | Key Timestamps: ${(f.keyTimestamps || []).map((t: any) => `${t.timestamp} (${t.event})`).join("; ")}`
              )
              .join("\n")
          : "No specific YouTube findings isolated; use full UAP/UFO/NHI database context.";

      const conversationHistory = (messages || [])
        .map((m) => `${m.role === "user" ? "ANALYST" : "RUNBOT"}: ${m.content}`)
        .join("\n\n");

      const systemInstruction = `You are RunBot (Unit RB-09), an empirical UAP, UFO, and Non-Human Intelligence (NHI) YouTube Deep-Scan Analyst Bot.
Your role:
1. Analyze YouTube UFO, UAP, and Alien video evidence with rigorous aerospace telemetry, optical physics (FLIR gimbal rotation, parallax, bokeh, cold-air wake, radar cross-section), and sworn testimony cross-referencing.
2. Reference specific timestamps, channels, and observables from the active YouTube Deep-Scan Queue provided below.
3. Maintain a precise, authoritative, objective tone without sci-fi roleplay clichés. When asked to summarize findings into a report, provide structured executive takeaways and remind the user they can also click "Generate Full Report" in the RunBot console to compile a formal exportable dossier.

ACTIVE YOUTUBE DEEP-SCAN FINDINGS IN WORKSPACE:
${contextDigest}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: conversationHistory || "Provide an initial readiness briefing on the active YouTube UAP scan queue.",
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
          title: chunk?.web?.title || "Grounded Reference",
          uri: chunk?.web?.uri || "",
        }))
        .filter((s: { uri: string }) => Boolean(s.uri));

      res.json({
        reply: response.text || "RunBot completed analysis with no additional text output.",
        sources,
      });
    } catch (error: any) {
      console.error("Error in /api/runbot/chat:", error);
      res.status(500).json({
        error:
          error?.message ||
          "RunBot dialog encountered an API error. Please check your Gemini API key in Settings > Secrets.",
      });
    }
  });

  // 3. RunBot Automated Intelligence Report Synthesis
  app.post("/api/runbot/report", async (req, res) => {
    try {
      const { selectedFindings, chatHistory, focusDirective } = req.body as {
        selectedFindings?: Array<Record<string, unknown>>;
        chatHistory?: Array<{ role: string; content: string }>;
        focusDirective?: string;
      };

      const ai = getGenAIClient();

      const findingsText = (selectedFindings || [])
        .map(
          (f: any, i: number) =>
            `${i + 1}. Title: ${f.title}\n   Channel: ${f.channel} (${f.publishedAt})\n   Category: ${f.category} | Sensor: ${f.sensorModality} | Location: ${f.location}\n   Credibility: ${f.credibilityIndex}/100 | Anomaly Index: ${f.anomalyScore}/100\n   Observables: Lift ${f.observables?.positiveLift}, Accel ${f.observables?.instantaneousAcceleration}, Hypersonic ${f.observables?.hypersonicVelocity}, Transmedium ${f.observables?.transmediumTravel}, LowObs ${f.observables?.lowObservability}\n   Summary: ${f.summary}\n   Timestamps: ${(f.keyTimestamps || []).map((t: any) => `${t.timestamp}: ${t.event}`).join(" | ")}`
        )
        .join("\n\n");

      const dialogText = (chatHistory || [])
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      const prompt = `Synthesize a comprehensive, formal UAP / UFO / NHI YouTube Deep-Scan Intelligence Report based on the following scanned YouTube video evidence and RunBot analyst dialog.
${focusDirective ? `Special Analyst Directive: ${focusDirective}` : ""}

SCANNED YOUTUBE EVIDENCE QUEUE:
${findingsText}

ANALYST & RUNBOT DIALOG TRANSCRIPT:
${dialogText || "No manual dialog overrides."}

Generate the structured JSON report.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reportId: {
                type: Type.STRING,
                description: "Formal report identifier e.g. VANGUARD-UAP-2026-884",
              },
              title: {
                type: Type.STRING,
                description: "Authoritative intelligence report title",
              },
              generatedAt: {
                type: Type.STRING,
                description: "ISO timestamp or formatted UTC date",
              },
              classificationBanner: {
                type: Type.STRING,
                description: "Open-Source Intelligence classification label",
              },
              executiveSummary: {
                type: Type.STRING,
                description: "Detailed 2-paragraph executive synthesis of the YouTube deep scan findings and anomaly patterns.",
              },
              overallCredibilityScore: {
                type: Type.NUMBER,
                description: "Aggregate multi-source credibility index from 0 to 100",
              },
              primaryAnomalyClassification: {
                type: Type.STRING,
                description: "Primary kinematic or biological classification",
              },
              keyFindingsMatrix: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sourceTitle: { type: Type.STRING },
                    channel: { type: Type.STRING },
                    keyTimestamp: { type: Type.STRING },
                    kinematicObservation: { type: Type.STRING },
                    artifactProbability: { type: Type.STRING },
                    verdict: { type: Type.STRING },
                  },
                },
              },
              fiveObservablesSynthesis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    observable: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    evidenceNotes: { type: Type.STRING },
                  },
                },
              },
              opticalAndSensorEvaluation: {
                type: Type.STRING,
                description: "Technical evaluation of camera parallax, FLIR glare, sensor lock, and radar corroboration.",
              },
              nhiAndBiologicalAssessment: {
                type: Type.STRING,
                description: "Assessment of Non-Human Intelligence (NHI) / alien biological or material recovery claims in the scanned videos.",
              },
              recommendedNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const reportData = JSON.parse((response.text ?? "{}").trim());
      res.json({ report: reportData });
    } catch (error: any) {
      console.error("Error in /api/runbot/report:", error);
      res.status(500).json({
        error:
          error?.message ||
          "Failed to synthesize intelligence report. Verify your Gemini API key in Settings > Secrets.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vanguard UAP Observatory server running on http://localhost:${PORT}`);
  });
}

startServer();
