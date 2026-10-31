import React, { useState, useMemo } from "react";
import {
  Search,
  MessageSquare,
  FileText,
  ExternalLink,
  CheckSquare,
  Square,
  Clock,
  SlidersHorizontal,
  Compass,
  AlertCircle,
  Calendar,
  ShieldAlert,
  FilterX,
  Plus,
  X,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import {
  YouTubeFinding,
  RunBotMessage,
  IntelligenceReport,
  GroundingSource,
} from "./types";
import {
  INITIAL_YOUTUBE_FINDINGS,
  INITIAL_RUNBOT_MESSAGES,
  INITIAL_INTELLIGENCE_REPORT,
  ASSETS,
} from "./data/initialScanData";
import { RadarObservablesChart } from "./components/RadarObservablesChart";
import { RunBotDialog } from "./components/RunBotDialog";
import { ReportDossierView } from "./components/ReportDossierView";

const CATEGORIES = [
  "All Captures",
  "Military FLIR",
  "Congressional Testimony",
  "Radar & Telemetry",
  "Biological / NHI",
  "Civilian OSINT",
];

const DATE_RANGE_PRESETS = [
  { id: "all", label: "All Dates" },
  { id: "last_30_days", label: "Last 30 Days" },
  { id: "last_year", label: "Last Year" },
  { id: "2023_present", label: "2023–Present" },
  { id: "2020_2022", label: "2020–2022" },
  { id: "custom", label: "Custom Dates" },
] as const;

type DateRangePresetId = (typeof DATE_RANGE_PRESETS)[number]["id"];

const KNOWN_LOW_QUALITY_CHANNELS = [
  "ThirdPhaseOfMoon",
  "SecureTeam10",
  "Section 51",
  "UFOMania",
  "Paranormal Crucible",
];

const COMMON_NEGATIVE_KEYWORDS = [
  "Starlink",
  "CGI",
  "Blender",
  "VFX",
  "Chinese Lantern",
  "Movie Trailer",
  "Prank",
];

const PRESET_SCAN_VECTORS = [
  "Declassified Pentagon Navy FLIR UAP YouTube",
  "Congressional UAP & Non-Human Biologics Hearing YouTube",
  "Jellyfish UAP Thermal Footage Iraq OSINT YouTube",
  "Langley AFB & Restricted Airspace Drone UAP Swarms YouTube",
];

type SortField = "publishedAt" | "credibilityIndex" | "anomalyScore" | "peakObservable";

export default function App() {
  const [findings, setFindings] = useState<YouTubeFinding[]>(
    INITIAL_YOUTUBE_FINDINGS
  );
  const [activeFindingId, setActiveFindingId] = useState<string>(
    INITIAL_YOUTUBE_FINDINGS[0].id
  );
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Captures");
  const [filterSearch, setFilterSearch] = useState<string>("");

  // Advanced Filter State (Shared across Deep Scan & Table Output)
  const [dateRangePreset, setDateRangePreset] =
    useState<DateRangePresetId>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("2020-01-01");
  const [customEndDate, setCustomEndDate] = useState<string>("2026-10-30");

  const [excludedChannels, setExcludedChannels] = useState<string[]>([
    "ThirdPhaseOfMoon",
    "SecureTeam10",
    "Section 51",
  ]);
  const [channelInput, setChannelInput] = useState<string>("");

  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([
    "Starlink",
    "CGI",
    "Blender",
  ]);
  const [negativeKeywordInput, setNegativeKeywordInput] = useState<string>("");

  // Table Sorting State
  const [sortField, setSortField] = useState<SortField>("credibilityIndex");
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  // Live YouTube Deep Scan state
  const [scanQuery, setScanQuery] = useState<string>("");
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSummary, setScanSummary] = useState<string>(
    "Baseline calibration complete: Verified YouTube UAP, military FLIR, and Congressional NHI archives indexed into the white-cell output table below. Advanced noise-suppression filters active."
  );
  const [scanSources, setScanSources] = useState<GroundingSource[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  // RunBot Dialog & Report synthesis state
  const [isRunBotOpen, setIsRunBotOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<RunBotMessage[]>(
    INITIAL_RUNBOT_MESSAGES
  );
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [report, setReport] = useState<IntelligenceReport>(
    INITIAL_INTELLIGENCE_REPORT
  );
  const [isCompilingReport, setIsCompilingReport] = useState<boolean>(false);

  // Helper: check if a YYYY-MM-DD date string matches the active Date Range filter
  const matchesDateRange = (publishedAt: string): boolean => {
    if (dateRangePreset === "all") return true;
    const normalizedDate =
      publishedAt.length === 4 ? `${publishedAt}-01-01` : publishedAt;
    const itemTime = Date.parse(normalizedDate);
    if (Number.isNaN(itemTime)) return true;

    const nowTime = Date.parse("2026-10-30T23:59:59Z");

    if (dateRangePreset === "last_30_days") {
      const thirtyDaysAgo = Date.parse("2026-09-30T00:00:00Z");
      return itemTime >= thirtyDaysAgo && itemTime <= nowTime;
    }
    if (dateRangePreset === "last_year") {
      const oneYearAgo = Date.parse("2025-10-30T00:00:00Z");
      return itemTime >= oneYearAgo && itemTime <= nowTime;
    }
    if (dateRangePreset === "2023_present") {
      const start2023 = Date.parse("2023-01-01T00:00:00Z");
      return itemTime >= start2023 && itemTime <= nowTime;
    }
    if (dateRangePreset === "2020_2022") {
      const start2020 = Date.parse("2020-01-01T00:00:00Z");
      const end2022 = Date.parse("2022-12-31T23:59:59Z");
      return itemTime >= start2020 && itemTime <= end2022;
    }
    if (dateRangePreset === "custom") {
      const start = customStartDate
        ? Date.parse(`${customStartDate}T00:00:00Z`)
        : 0;
      const end = customEndDate
        ? Date.parse(`${customEndDate}T23:59:59Z`)
        : nowTime;
      return itemTime >= start && itemTime <= end;
    }
    return true;
  };

  // Filtered & Sorted Table Output
  const { filteredFindings, suppressedCount } = useMemo(() => {
    let suppressed = 0;

    const result = findings.filter((item) => {
      const isExcludedChannel = excludedChannels.some((ch) =>
        item.channel.toLowerCase().includes(ch.toLowerCase())
      );
      const searchableCorpus =
        `${item.title} ${item.summary} ${item.sensorModality} ${item.channel}`.toLowerCase();
      const hasNegativeKeyword = negativeKeywords.some((kw) =>
        searchableCorpus.includes(kw.toLowerCase())
      );

      if (isExcludedChannel || hasNegativeKeyword) {
        suppressed++;
        return false;
      }

      if (!matchesDateRange(item.publishedAt)) {
        return false;
      }

      const matchesCat =
        selectedCategory === "All Captures" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      if (!matchesCat) return false;

      const matchesSearch =
        !filterSearch.trim() ||
        item.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.channel.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.summary.toLowerCase().includes(filterSearch.toLowerCase()) ||
        item.location.toLowerCase().includes(filterSearch.toLowerCase());

      return matchesSearch;
    });

    const sorted = [...result].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === "publishedAt") {
        valA = Date.parse(a.publishedAt) || 0;
        valB = Date.parse(b.publishedAt) || 0;
      } else if (sortField === "credibilityIndex") {
        valA = a.credibilityIndex;
        valB = b.credibilityIndex;
      } else if (sortField === "anomalyScore") {
        valA = a.anomalyScore;
        valB = b.anomalyScore;
      } else if (sortField === "peakObservable") {
        valA = Math.max(
          a.observables.positiveLift,
          a.observables.instantaneousAcceleration,
          a.observables.hypersonicVelocity,
          a.observables.transmediumTravel,
          a.observables.lowObservability
        );
        valB = Math.max(
          b.observables.positiveLift,
          b.observables.instantaneousAcceleration,
          b.observables.hypersonicVelocity,
          b.observables.transmediumTravel,
          b.observables.lowObservability
        );
      }
      return sortDesc ? valB - valA : valA - valB;
    });

    return { filteredFindings: sorted, suppressedCount: suppressed };
  }, [
    findings,
    excludedChannels,
    negativeKeywords,
    dateRangePreset,
    customStartDate,
    customEndDate,
    selectedCategory,
    filterSearch,
    sortField,
    sortDesc,
  ]);

  const activeFinding = useMemo(() => {
    return (
      filteredFindings.find((f) => f.id === activeFindingId) ||
      findings.find((f) => f.id === activeFindingId) ||
      filteredFindings[0] ||
      findings[0]
    );
  }, [findings, activeFindingId, filteredFindings]);

  const selectedForReportFindings = useMemo(
    () => findings.filter((f) => f.selectedForReport !== false),
    [findings]
  );

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc((prev) => !prev);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const handleToggleExcludedChannel = (channelName: string) => {
    setExcludedChannels((prev) =>
      prev.includes(channelName)
        ? prev.filter((c) => c !== channelName)
        : [...prev, channelName]
    );
  };

  const handleAddExcludedChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = channelInput.trim();
    if (!trimmed) return;
    if (!excludedChannels.includes(trimmed)) {
      setExcludedChannels((prev) => [...prev, trimmed]);
    }
    setChannelInput("");
  };

  const handleToggleNegativeKeyword = (keyword: string) => {
    setNegativeKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleAddNegativeKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = negativeKeywordInput.trim().replace(/^-+/, "");
    if (!trimmed) return;
    if (!negativeKeywords.includes(trimmed)) {
      setNegativeKeywords((prev) => [...prev, trimmed]);
    }
    setNegativeKeywordInput("");
  };

  const handleResetAllFilters = () => {
    setDateRangePreset("all");
    setCustomStartDate("2020-01-01");
    setCustomEndDate("2026-10-30");
    setExcludedChannels([]);
    setNegativeKeywords([]);
    setSelectedCategory("All Captures");
    setFilterSearch("");
  };

  const handleToggleFindingForReport = (id: string) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, selectedForReport: f.selectedForReport === false }
          : f
      )
    );
  };

  const handleToggleAllVisibleForReport = () => {
    const allVisibleSelected = filteredFindings.every(
      (f) => f.selectedForReport !== false
    );
    const visibleIds = new Set(filteredFindings.map((f) => f.id));
    setFindings((prev) =>
      prev.map((f) =>
        visibleIds.has(f.id)
          ? { ...f, selectedForReport: !allVisibleSelected }
          : f
      )
    );
  };

  const handleExecuteDeepScan = async (overrideQuery?: string) => {
    const targetQuery = overrideQuery ?? scanQuery;
    if (!targetQuery.trim() && !youtubeUrlInput.trim()) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const res = await fetch("/api/scan-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: targetQuery,
          category: selectedCategory,
          youtubeUrl: youtubeUrlInput,
          dateRangePreset,
          startDate: customStartDate,
          endDate: customEndDate,
          excludedChannels,
          negativeKeywords,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deep scan request failed");
      }

      if (data.scanSummary) {
        setScanSummary(data.scanSummary);
      }
      if (Array.isArray(data.sources)) {
        setScanSources(data.sources);
      }

      if (Array.isArray(data.findings) && data.findings.length > 0) {
        const fallbackImages = [
          ASSETS.flirCapture,
          ASSETS.hearingFrame,
          ASSETS.radarObservatory,
        ];
        const normalized: YouTubeFinding[] = data.findings.map(
          (raw: any, index: number) => ({
            id: raw.id || `scan-${Date.now()}-${index}`,
            title: raw.title || "Scanned YouTube UAP Evidence Capture",
            channel: raw.channel || "YouTube OSINT Archive",
            publishedAt: raw.publishedAt || "2026-03-15",
            duration: raw.duration || "04:12",
            viewsEstimate: raw.viewsEstimate || "Verified Capture",
            youtubeUrl:
              raw.youtubeUrl && String(raw.youtubeUrl).startsWith("http")
                ? raw.youtubeUrl
                : `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    raw.title || targetQuery
                  )}`,
            thumbnailUrl: fallbackImages[index % fallbackImages.length],
            category: raw.category || "Military FLIR",
            sensorModality:
              raw.sensorModality || "Multi-Spectral Optical / Telemetry",
            location: raw.location || "Restricted Airspace Sector",
            credibilityIndex: Number(raw.credibilityIndex) || 85,
            anomalyScore: Number(raw.anomalyScore) || 84,
            statusLabel: raw.statusLabel || "● Verified Multi-Sensor",
            summary:
              raw.summary ||
              "Grounded YouTube UAP / NHI video evidence extracted by RunBot deep scan.",
            keyTimestamps:
              Array.isArray(raw.keyTimestamps) && raw.keyTimestamps.length > 0
                ? raw.keyTimestamps
                : [
                    {
                      timestamp: "00:42",
                      event: "Primary anomalous trajectory acquisition",
                    },
                    {
                      timestamp: "02:15",
                      event: "Multi-sensor kinematic cross-check",
                    },
                  ],
            observables: {
              positiveLift: Number(raw.observables?.positiveLift) || 85,
              instantaneousAcceleration:
                Number(raw.observables?.instantaneousAcceleration) || 80,
              hypersonicVelocity:
                Number(raw.observables?.hypersonicVelocity) || 70,
              transmediumTravel:
                Number(raw.observables?.transmediumTravel) || 68,
              lowObservability:
                Number(raw.observables?.lowObservability) || 84,
            },
            selectedForReport: true,
          })
        );

        setFindings((prev) => [...normalized, ...prev]);
        setActiveFindingId(normalized[0].id);

        const botUpdate: RunBotMessage = {
          id: `msg-scan-${Date.now()}`,
          role: "assistant",
          content: `Deep scan complete for "${targetQuery}" (Date filter: ${dateRangePreset}, Excluded channels: ${
            excludedChannels.join(", ") || "None"
          }, Negative keywords: ${
            negativeKeywords.map((k) => `-${k}`).join(" ") || "None"
          }).\n\nI have ingested ${normalized.length} new YouTube findings into the Output Table:\n${normalized
            .map(
              (n, i) =>
                `${i + 1}. [${n.publishedAt}] ${n.title} (${n.channel}) — Credibility ${n.credibilityIndex}% / Anomaly ${n.anomalyScore}%`
            )
            .join("\n")}\n\nSummary: ${data.scanSummary}`,
          timestamp: new Date().toISOString().slice(11, 19) + " UTC",
          sources: data.sources,
        };
        setMessages((prev) => [...prev, botUpdate]);
      }
    } catch (err: any) {
      setScanError(err.message || "Unable to complete YouTube deep scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendRunBotMessage = async (content: string) => {
    const userMsg: RunBotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString().slice(11, 19) + " UTC",
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsSendingChat(true);

    try {
      const res = await fetch("/api/runbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          selectedFindings: selectedForReportFindings,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "RunBot response failed");
      }

      const botMsg: RunBotMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString().slice(11, 19) + " UTC",
        sources: data.sources,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: RunBotMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `RunBot telemetry notice: ${
          err.message || "Unable to reach Gemini backend."
        }`,
        timestamp: new Date().toISOString().slice(11, 19) + " UTC",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleCompileReport = async (directive?: string) => {
    setIsCompilingReport(true);
    try {
      const res = await fetch("/api/runbot/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedFindings: selectedForReportFindings,
          chatHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          focusDirective: directive,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to compile intelligence report");
      }

      if (data.report) {
        setReport(data.report);
        setIsRunBotOpen(false);
        const dossierEl = document.getElementById("intelligence-dossier");
        dossierEl?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: any) {
      setScanError(err.message || "Report compilation encountered an error.");
    } finally {
      setIsCompilingReport(false);
    }
  };

  const handleInterrogateFinding = (finding: YouTubeFinding) => {
    setActiveFindingId(finding.id);
    setIsRunBotOpen(true);
    handleSendRunBotMessage(
      `Analyze "${finding.title}" from ${finding.channel} (${finding.publishedAt}). Evaluate its key timestamps (${finding.keyTimestamps
        .map((t) => t.timestamp)
        .join(", ")}), sensor modality (${finding.sensorModality}), and summarize how it impacts our UAP / NHI intelligence report.`
    );
  };

  const avgCredibility = useMemo(() => {
    if (!filteredFindings.length) return 0;
    return Math.round(
      filteredFindings.reduce((s, f) => s + f.credibilityIndex, 0) /
        filteredFindings.length
    );
  }, [filteredFindings]);

  const avgAnomaly = useMemo(() => {
    if (!filteredFindings.length) return 0;
    return Math.round(
      filteredFindings.reduce((s, f) => s + f.anomalyScore, 0) /
        filteredFindings.length
    );
  }, [filteredFindings]);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* Top Bar Contract: Strictly 1 row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 bg-[#07090E]/95 border-b border-slate-800">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#deep-scan"
          className="text-lg font-bold tracking-tight text-slate-100 font-display whitespace-nowrap shrink-0"
        >
          Vanguard UAP Observatory
        </a>

        {/* Zone 2: 4–5 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#deep-scan"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Deep Scan
          </a>
          <a
            href="#evidence-matrix"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Output Table
          </a>
          <a
            href="#anomaly-radar"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Anomaly Radar
          </a>
          <a
            href="#intelligence-dossier"
            className="hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Intelligence Dossier
          </a>
        </nav>

        {/* Zone 3: 1 primary action (Tactile Blue) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsRunBotOpen(true)}
            className="btn-tactile-blue px-4 py-2 text-xs font-semibold rounded whitespace-nowrap shrink-0"
          >
            Open RunBot Dialog
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px max-w baseline) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 space-y-10">
        {/* Section 1: Deep Scan Command Console & Advanced Search Filters */}
        <section id="deep-scan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 8 Cols: Deep Scan Search, Advanced Filters & YouTube URL Ingestion */}
            <div className="lg:col-span-8 bg-[#111827] border border-slate-800 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-mono text-blue-400">
                  OSINT YOUTUBE TELEMETRY SCANNER · UAP / UFO / NON-HUMAN INTELLIGENCE
                </div>
                <h1
                  className="text-2xl md:text-4xl font-bold text-slate-100 tracking-tight"
                  style={{ textWrap: "balance" }}
                >
                  Deep-Scan YouTube for Aerial Anomalies & Synthesize Verified Intelligence Reports
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Configure date ranges, exclude low-quality channels, and add negative keywords. All scan output is sent directly into white table cells with black text below.
                </p>
              </div>

              {/* Primary Search & URL Inputs (White textboxes, black text, tactile blue button) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteDeepScan();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7 relative">
                    <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={scanQuery}
                      onChange={(e) => setScanQuery(e.target.value)}
                      placeholder="Deep scan YouTube (e.g., 'USS Nimitz Tic Tac FLIR', 'Alien biologics testimony')..."
                      className="textbox-white w-full pl-10 pr-4 py-2.5 text-sm rounded"
                    />
                  </div>
                  <div className="md:col-span-5 flex gap-2">
                    <input
                      type="url"
                      value={youtubeUrlInput}
                      onChange={(e) => setYoutubeUrlInput(e.target.value)}
                      placeholder="Optional YouTube URL..."
                      className="textbox-white flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded"
                    />
                    <button
                      type="submit"
                      disabled={isScanning}
                      className="btn-tactile-blue px-5 py-2.5 text-xs font-semibold rounded disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {isScanning ? "Scanning YouTube..." : "Run Deep Scan"}
                    </button>
                  </div>
                </div>

                {/* Preset Scan Vector Buttons (Tactile Blue) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-300 mr-1">
                    PRESET VECTORS:
                  </span>
                  {PRESET_SCAN_VECTORS.map((vec) => (
                    <button
                      key={vec}
                      type="button"
                      disabled={isScanning}
                      onClick={() => {
                        setScanQuery(vec);
                        handleExecuteDeepScan(vec);
                      }}
                      className="btn-tactile-blue-subtle px-2.5 py-1.5 text-xs rounded whitespace-nowrap shrink-0"
                    >
                      {vec}
                    </button>
                  ))}
                </div>
              </form>

              {/* ADVANCED SEARCH & NOISE-SUPPRESSION FILTERS PANEL */}
              <div className="bg-[#0B0E17] border border-slate-800 p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ADVANCED SEARCH & NOISE-SUPPRESSION PARAMETERS</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="btn-tactile-blue-subtle px-3 py-1 text-xs font-mono rounded inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>

                {/* 1. Date Range Parameter */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-mono text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>01. PUBLICATION DATE RANGE WINDOW</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      Filters both live YouTube deep scans and the Output Table below
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {DATE_RANGE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setDateRangePreset(preset.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                          dateRangePreset === preset.id
                            ? "btn-tactile-blue font-semibold"
                            : "btn-tactile-blue-subtle opacity-75 hover:opacity-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}

                    {dateRangePreset === "custom" && (
                      <div className="flex flex-wrap items-center gap-2 bg-[#111827] border border-slate-700 px-3 py-1.5 rounded">
                        <span className="text-[11px] font-mono text-slate-200">
                          FROM
                        </span>
                        <input
                          type="date"
                          aria-label="Custom Start Date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="textbox-white px-2.5 py-1 text-xs font-mono rounded"
                        />
                        <span className="text-[11px] font-mono text-slate-200">
                          TO
                        </span>
                        <input
                          type="date"
                          aria-label="Custom End Date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="textbox-white px-2.5 py-1 text-xs font-mono rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Exclude Low-Quality Channels & 3. Negative Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-800/80">
                  {/* Channel Exclusion Block */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-slate-200">
                        02. EXCLUDE LOW-QUALITY CHANNELS ({excludedChannels.length})
                      </label>
                    </div>
                    <form
                      onSubmit={handleAddExcludedChannel}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        placeholder="Add channel to exclude (e.g. HoaxChannel)..."
                        className="textbox-white flex-1 min-w-0 px-3 py-1.5 text-xs rounded"
                      />
                      <button
                        type="submit"
                        className="btn-tactile-blue px-3.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Exclude Channel
                      </button>
                    </form>

                    {/* Quick Preset & Custom Excluded Channels */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        new Set([
                          ...KNOWN_LOW_QUALITY_CHANNELS,
                          ...excludedChannels,
                        ])
                      ).map((ch) => {
                        const isExcluded = excludedChannels.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => handleToggleExcludedChannel(ch)}
                            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                              isExcluded
                                ? "btn-tactile-blue font-semibold"
                                : "btn-tactile-blue-subtle opacity-65 hover:opacity-100"
                            }`}
                          >
                            <span>{isExcluded ? `Excluded: -${ch}` : `Allow: ${ch}`}</span>
                            {isExcluded && <X className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Negative Keywords Block */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-slate-200">
                        03. NEGATIVE KEYWORDS ({negativeKeywords.length})
                      </label>
                    </div>
                    <form
                      onSubmit={handleAddNegativeKeyword}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={negativeKeywordInput}
                        onChange={(e) => setNegativeKeywordInput(e.target.value)}
                        placeholder="Add negative keyword (e.g. -Drone, -LensFlare)..."
                        className="textbox-white flex-1 min-w-0 px-3 py-1.5 text-xs rounded"
                      />
                      <button
                        type="submit"
                        className="btn-tactile-blue px-3.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add -Keyword
                      </button>
                    </form>

                    {/* Quick Preset & Custom Negative Keywords */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        new Set([
                          ...COMMON_NEGATIVE_KEYWORDS,
                          ...negativeKeywords,
                        ])
                      ).map((kw) => {
                        const isActive = negativeKeywords.includes(kw);
                        return (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => handleToggleNegativeKeyword(kw)}
                            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                              isActive
                                ? "btn-tactile-blue font-semibold"
                                : "btn-tactile-blue-subtle opacity-65 hover:opacity-100"
                            }`}
                          >
                            <span>{isActive ? `-${kw}` : kw}</span>
                            {isActive && <X className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: RunBot Analyst Command Card with White-Cell Output Table */}
            <div className="lg:col-span-4 bg-[#111827] border border-slate-800 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4">
                  <div className="w-14 h-14 bg-[#07090E] border border-slate-700 shrink-0 overflow-hidden">
                    <img
                      src={ASSETS.runbotAvatar}
                      alt="RunBot Optical Reconnaissance Unit"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-blue-400">
                      RUNBOT ANALYST · UNIT RB-09
                    </div>
                    <h2 className="text-lg font-bold text-slate-100">
                      Interactive Report Bot
                    </h2>
                    <div className="text-xs text-slate-400">
                      ● Ready for Dialog & Table Report Synthesis
                    </div>
                  </div>
                </div>

                {/* RunBot Status & Latest Output Table (White Cells, Black Text) */}
                <table className="output-table-white text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase">
                      <th className="py-2 px-3">Parameter</th>
                      <th className="py-2 px-3">Active Output Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-black">
                        Date Filter
                      </td>
                      <td className="py-2 px-3 font-mono text-black">
                        {
                          DATE_RANGE_PRESETS.find(
                            (d) => d.id === dateRangePreset
                          )?.label
                        }
                        {dateRangePreset === "custom"
                          ? ` (${customStartDate} to ${customEndDate})`
                          : ""}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-black">
                        Excluded Channels
                      </td>
                      <td className="py-2 px-3 font-mono text-black">
                        {excludedChannels.length
                          ? excludedChannels.join(", ")
                          : "None"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-black">
                        Negative Terms
                      </td>
                      <td className="py-2 px-3 font-mono text-black">
                        {negativeKeywords.length
                          ? negativeKeywords.map((k) => `-${k}`).join(" ")
                          : "None"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-black align-top">
                        Latest RunBot Output
                      </td>
                      <td className="py-2 px-3 text-black leading-snug">
                        <div className="line-clamp-4">
                          {messages[messages.length - 1]?.content}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRunBotOpen(true)}
                  className="btn-tactile-blue w-full py-2.5 px-4 text-xs font-semibold rounded flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open RunBot Dialog ({messages.length} Messages)
                </button>
                <button
                  type="button"
                  onClick={() => handleCompileReport()}
                  disabled={isCompilingReport}
                  className="btn-tactile-blue-subtle w-full py-2.5 px-4 text-xs font-semibold rounded disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  {isCompilingReport
                    ? "Synthesizing Report Table..."
                    : `Compile ${selectedForReportFindings.length} Findings into Report`}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: PRIMARY YOUTUBE DEEP-SCAN OUTPUT TABLE (WHITE CELLS, BLACK TEXT) */}
        <section id="evidence-matrix" className="space-y-5">
          {/* Table Filter Toolbar (Category + Date Range + White Textbox Search) */}
          <div className="bg-[#111827] border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-blue-400">
                  STRUCTURED DEEP-SCAN RESULTS TABLE · {filteredFindings.length} MATCHING ROWS ({suppressedCount} NOISE-SUPPRESSED)
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                  YouTube UFO, UAP & Alien Deep-Scan Output Table
                </h2>
              </div>

              {/* Date Range Selector & White Textbox Filter in Table Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  TABLE DATE FILTER:
                </span>
                <select
                  aria-label="Filter Table by Date Range"
                  value={dateRangePreset}
                  onChange={(e) =>
                    setDateRangePreset(e.target.value as DateRangePresetId)
                  }
                  className="textbox-white px-3 py-1.5 text-xs font-mono rounded"
                >
                  {DATE_RANGE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {dateRangePreset === "custom" && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="textbox-white px-2.5 py-1 text-xs font-mono rounded"
                    />
                    <span className="text-xs font-mono text-slate-300">–</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="textbox-white px-2.5 py-1 text-xs font-mono rounded"
                    />
                  </div>
                )}

                <div className="relative">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Filter table rows..."
                    className="textbox-white pl-8 pr-3 py-1.5 text-xs rounded w-48"
                  />
                </div>
              </div>
            </div>

            {/* Category Tactile Blue Filter Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? "btn-tactile-blue font-semibold"
                        : "btn-tactile-blue-subtle opacity-75 hover:opacity-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {scanSources.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono text-slate-400">GROUNDED LINKS:</span>
                  {scanSources.slice(0, 3).map((s, i) => (
                    <a
                      key={i}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{s.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Deep-Scan Synthesis Output Table Cell (White Cell, Black Text) */}
            <table className="output-table-white text-left text-xs">
              <thead>
                <tr className="text-[11px] font-mono uppercase">
                  <th className="py-2 px-3 w-48">Deep-Scan Output Status</th>
                  <th className="py-2 px-4">Synthesized Scan Output Summary</th>
                  <th className="py-2 px-3 w-36 text-right">Rows / Credibility</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-black align-top">
                    {isScanning ? "SCANNING YOUTUBE..." : "COMPLETED SCAN OUTPUT"}
                  </td>
                  <td className="py-2.5 px-4 text-black leading-relaxed align-top">
                    {scanSummary}
                    {scanError && (
                      <div className="flex items-center gap-1.5 text-rose-700 font-semibold mt-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{scanError}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-black text-right align-top tabular-nums">
                    {filteredFindings.length} rows · {avgCredibility}% avg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PRIMARY OUTPUT DATA TABLE — ALL CELLS WHITE WITH BLACK TEXT */}
          <div className="overflow-hidden shadow-lg border border-slate-300 bg-white">
            {filteredFindings.length === 0 ? (
              <div className="p-10 text-center space-y-3 bg-white text-black">
                <p className="text-sm font-medium text-black">
                  No YouTube deep-scan records match your active date range, channel exclusions, and negative keyword filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="btn-tactile-blue px-4 py-2 text-xs font-semibold rounded"
                >
                  Reset All Search Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="output-table-white text-left">
                  <thead>
                    <tr className="text-[11px] font-mono uppercase">
                      <th className="py-3.5 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleToggleAllVisibleForReport}
                          title="Select or deselect all visible rows for RunBot Report"
                          className="text-blue-700 inline-flex items-center justify-center"
                        >
                          {filteredFindings.every(
                            (f) => f.selectedForReport !== false
                          ) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleSort("publishedAt")}
                          className="btn-tactile-blue px-2.5 py-1 rounded inline-flex items-center gap-1 text-[10px]"
                        >
                          <span>DATE</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3.5 px-4">
                        YOUTUBE VIDEO EVIDENCE & TECHNICAL SUMMARY
                      </th>
                      <th className="py-3.5 px-3 whitespace-nowrap">
                        CHANNEL & LOCATION
                      </th>
                      <th className="py-3.5 px-3 whitespace-nowrap">
                        MODALITY & CATEGORY
                      </th>
                      <th className="py-3.5 px-3 whitespace-nowrap">
                        KEY TIMESTAMPS
                      </th>
                      <th className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleSort("credibilityIndex")}
                          className="btn-tactile-blue px-2.5 py-1 rounded inline-flex items-center justify-end gap-1 text-[10px] ml-auto"
                        >
                          <span>CREDIBILITY</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleSort("anomalyScore")}
                          className="btn-tactile-blue px-2.5 py-1 rounded inline-flex items-center justify-end gap-1 text-[10px] ml-auto"
                        >
                          <span>ANOMALY IDX</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3.5 px-3 whitespace-nowrap">
                        VERIFICATION STATUS
                      </th>
                      <th className="py-3.5 px-3 text-right whitespace-nowrap">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredFindings.map((item) => {
                      const isSelected = item.id === activeFinding?.id;
                      const inReport = item.selectedForReport !== false;
                      const peakObs = Math.max(
                        item.observables.positiveLift,
                        item.observables.instantaneousAcceleration,
                        item.observables.hypersonicVelocity,
                        item.observables.transmediumTravel,
                        item.observables.lowObservability
                      );

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setActiveFindingId(item.id)}
                          className={`cursor-pointer ${
                            isSelected ? "row-selected" : ""
                          }`}
                        >
                          {/* Col 1: Report Queue Checkbox */}
                          <td
                            className="py-3.5 px-3 align-top text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFindingForReport(item.id);
                            }}
                          >
                            <button
                              type="button"
                              aria-label={`Include ${item.title} in report`}
                              className="text-blue-700 pt-0.5"
                            >
                              {inReport ? (
                                <CheckSquare className="w-4 h-4 text-blue-700" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                          </td>

                          {/* Col 2: Published Date & Duration */}
                          <td className="py-3.5 px-3 align-top font-mono tabular-nums whitespace-nowrap text-black">
                            <div className="font-bold text-black">
                              {item.publishedAt}
                            </div>
                            <div className="text-[11px] text-slate-700 mt-0.5">
                              {item.duration} · {item.viewsEstimate}
                            </div>
                          </td>

                          {/* Col 3: Title & Summary */}
                          <td className="py-3.5 px-4 align-top max-w-md text-black">
                            <div className="font-bold text-black leading-snug">
                              {item.title}
                            </div>
                            <p className="text-black text-[11px] leading-relaxed mt-1">
                              {item.summary}
                            </p>
                          </td>

                          {/* Col 4: Channel & Location */}
                          <td className="py-3.5 px-3 align-top max-w-[200px] text-black">
                            <div className="font-semibold text-black truncate">
                              {item.channel}
                            </div>
                            <div className="text-[11px] text-slate-700 truncate mt-0.5">
                              {item.location}
                            </div>
                          </td>

                          {/* Col 5: Category & Sensor Modality */}
                          <td className="py-3.5 px-3 align-top max-w-[210px] text-black">
                            <div className="font-mono font-bold text-black text-[11px]">
                              {item.category}
                            </div>
                            <div className="text-[11px] text-black mt-0.5">
                              {item.sensorModality}
                            </div>
                          </td>

                          {/* Col 6: Key Frame Timestamps */}
                          <td className="py-3.5 px-3 align-top whitespace-nowrap text-black">
                            <div className="flex flex-col gap-1.5">
                              {item.keyTimestamps.slice(0, 2).map((ts, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveFindingId(item.id);
                                    setIsRunBotOpen(true);
                                    handleSendRunBotMessage(
                                      `In "${item.title}" at timestamp ${ts.timestamp} ("${ts.event}"), what does optical and radar analysis reveal?`
                                    );
                                  }}
                                  title={ts.event}
                                  className="btn-tactile-blue px-2 py-0.5 rounded text-left font-mono text-[10px] tabular-nums"
                                >
                                  [{ts.timestamp}] {ts.event.slice(0, 22)}...
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* Col 7: Credibility Index */}
                          <td className="py-3.5 px-3 align-top text-right font-mono tabular-nums whitespace-nowrap text-black">
                            <div className="font-bold text-black">
                              {item.credibilityIndex}.0%
                            </div>
                            <div className="w-16 h-1.5 bg-slate-200 ml-auto mt-1.5 overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${item.credibilityIndex}%` }}
                              />
                            </div>
                          </td>

                          {/* Col 8: Anomaly Score */}
                          <td className="py-3.5 px-3 align-top text-right font-mono tabular-nums whitespace-nowrap text-black">
                            <div className="font-bold text-black">
                              {item.anomalyScore}.0%
                            </div>
                            <div className="text-[10px] text-slate-700 mt-0.5 font-semibold">
                              PEAK OBS {peakObs}
                            </div>
                          </td>

                          {/* Col 9: Verification Status */}
                          <td className="py-3.5 px-3 align-top whitespace-nowrap font-mono text-[11px] font-bold text-black">
                            {item.statusLabel}
                          </td>

                          {/* Col 10: Row Actions (Tactile Blue) */}
                          <td
                            className="py-3.5 px-3 align-top text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveFindingId(item.id)}
                                className="btn-tactile-blue-subtle px-2.5 py-1 text-[11px] font-medium rounded inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Inspect
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInterrogateFinding(item)}
                                className="btn-tactile-blue px-2.5 py-1 text-[11px] font-semibold rounded inline-flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                RunBot
                              </button>
                              <a
                                href={item.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Watch ${item.title} on YouTube`}
                                className="btn-tactile-blue p-1.5 rounded inline-flex items-center"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected Table Row Detailed Frame & Telemetry Inspector (With White Table Cells & Black Text) */}
          {activeFinding && (
            <div className="bg-[#111827] border border-slate-800 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 Cols: Visual Frame Preview */}
              <div className="lg:col-span-5 relative aspect-video w-full bg-[#07090E] border border-slate-800 overflow-hidden">
                <img
                  src={activeFinding.thumbnailUrl || ASSETS.flirCapture}
                  alt={activeFinding.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-200">
                    <span>SELECTED ROW INSPECTOR</span>
                    <span className="tabular-nums">
                      {activeFinding.publishedAt} · {activeFinding.duration}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-blue-300">
                      {activeFinding.channel} · {activeFinding.location}
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {activeFinding.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Timestamped Frame Breakdown Table (White Cells, Black Text) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Selected Video Telemetry & Timestamp Output Table</span>
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleInterrogateFinding(activeFinding)}
                      className="btn-tactile-blue px-3.5 py-2 text-xs font-semibold rounded flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Interrogate Row with RunBot
                    </button>
                    <a
                      href={activeFinding.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile-blue-subtle px-3 py-2 text-xs font-medium rounded inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>

                <table className="output-table-white text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-mono uppercase">
                      <th className="py-2 px-3 w-32">Timestamp</th>
                      <th className="py-2 px-4">Frame Telemetry & Event Observation</th>
                      <th className="py-2 px-3 w-32 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFinding.keyTimestamps.map((ts, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-mono font-bold text-black tabular-nums">
                          [{ts.timestamp}]
                        </td>
                        <td className="py-2.5 px-4 text-black leading-relaxed">
                          {ts.event}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setIsRunBotOpen(true);
                              handleSendRunBotMessage(
                                `In "${activeFinding.title}" at timestamp ${ts.timestamp} ("${ts.event}"), what does optical and radar analysis reveal?`
                              );
                            }}
                            className="btn-tactile-blue px-2.5 py-1 text-[11px] font-mono rounded whitespace-nowrap"
                          >
                            Ask RunBot →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Five Observables Radar Calibration & Crosshair Scatter */}
        <section id="anomaly-radar" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Aerospace Telemetry & Five Observables Calibration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Quantitative evaluation of lift, instantaneous acceleration, hypersonic velocity, transmedium travel, and low observability across filtered table rows
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>CALIBRATED TO AARO / AATIP FIVE OBSERVABLES STANDARD</span>
            </div>
          </div>

          {activeFinding && (
            <RadarObservablesChart
              activeFinding={activeFinding}
              allFindings={filteredFindings.length ? filteredFindings : findings}
              onSelectFinding={(f) => setActiveFindingId(f.id)}
            />
          )}
        </section>

        {/* Section 4: Compiled Intelligence Dossier Report */}
        <ReportDossierView
          report={report}
          onRecompile={() => handleCompileReport()}
          isCompiling={isCompilingReport}
          onOpenRunBot={() => setIsRunBotOpen(true)}
        />
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-800 bg-[#07090E] px-6 py-6 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Vanguard UAP Observatory · Open-Source YouTube Aerial Anomaly & NHI Analysis Workspace
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#deep-scan"
              className="hover:text-slate-200 transition-colors"
            >
              Deep Scanner
            </a>
            <a
              href="#evidence-matrix"
              className="hover:text-slate-200 transition-colors"
            >
              Output Table
            </a>
            <button
              type="button"
              onClick={() => setIsRunBotOpen(true)}
              className="btn-tactile-blue px-3 py-1.5 text-xs font-semibold rounded"
            >
              Open RunBot Dialog
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive RunBot Dialog Modal */}
      <RunBotDialog
        isOpen={isRunBotOpen}
        onClose={() => setIsRunBotOpen(false)}
        messages={messages}
        onSendMessage={handleSendRunBotMessage}
        isSending={isSendingChat}
        onCompileReport={handleCompileReport}
        isCompilingReport={isCompilingReport}
        findings={findings}
        onToggleFindingForReport={handleToggleFindingForReport}
        onResetConversation={() => setMessages(INITIAL_RUNBOT_MESSAGES)}
      />
    </div>
  );
}
