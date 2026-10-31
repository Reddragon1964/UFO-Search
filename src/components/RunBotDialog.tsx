import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  FileText,
  X,
  ExternalLink,
  Terminal,
  CheckSquare,
  Square,
  RotateCcw,
} from "lucide-react";
import { YouTubeFinding, RunBotMessage } from "../types";
import { ASSETS } from "../data/initialScanData";

interface RunBotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: RunBotMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  onCompileReport: (directive?: string) => Promise<void>;
  isCompilingReport: boolean;
  findings: YouTubeFinding[];
  onToggleFindingForReport: (id: string) => void;
  onResetConversation: () => void;
}

const QUICK_PROMPTS = [
  "Summarize all scanned YouTube UAP & Alien findings into an executive brief",
  "Evaluate the ATFLIR GIMBAL 00:53 rotation: optical glare vs. physical banking",
  "What concrete evidence exists in the scanned videos for Non-Human Intelligence (NHI)?",
  "Compare the Aguadilla transmedium water entry with the USS Nimitz Tic-Tac radar tracks",
];

export const RunBotDialog: React.FC<RunBotDialogProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isSending,
  onCompileReport,
  isCompilingReport,
  findings,
  onToggleFindingForReport,
  onResetConversation,
}) => {
  const [input, setInput] = useState("");
  const [reportDirective, setReportDirective] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const selectedCount = findings.filter((f) => f.selectedForReport !== false).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput("");
    await onSendMessage(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="runbot-dialog-title"
    >
      <div className="bg-[#0B0E17] border border-slate-700 w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden">
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={ASSETS.runbotAvatar}
                alt="RunBot Optical Sensor Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <h2
                id="runbot-dialog-title"
                className="text-lg font-semibold text-slate-100 tracking-tight"
              >
                RunBot Analyst Dialog & Report Table Compiler
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                UNIT RB-09 · GROUNDED YOUTUBE UAP / UFO / NHI SYNTHESIS ENGINE ·{" "}
                {selectedCount} OF {findings.length} VIDEOS QUEUED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onResetConversation}
              className="btn-tactile-blue-subtle px-3 py-2 text-xs font-medium rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Dialog
            </button>
            <button
              type="button"
              onClick={() => onCompileReport(reportDirective)}
              disabled={isCompilingReport}
              className="btn-tactile-blue px-4 py-2 text-xs font-semibold rounded disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4" />
              {isCompilingReport
                ? "Compiling Dossier Report..."
                : "Compile Findings into Report Table"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close RunBot Dialog"
              className="btn-tactile-blue-subtle p-2 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Active Scanned YouTube Context Table (5 cols) - WHITE CELLS, BLACK TEXT */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#07090E] flex flex-col min-h-0">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Queued YouTube Findings Table
                </h3>
                <span className="text-xs font-mono text-blue-400 tabular-nums">
                  {selectedCount}/{findings.length} active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select which scanned YouTube rows RunBot synthesizes into the report table.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-3">
              <table className="output-table-white text-left text-xs">
                <thead className="text-[10px] font-mono uppercase sticky top-0">
                  <tr>
                    <th className="py-2 px-2.5">Use</th>
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">YouTube Finding</th>
                    <th className="py-2 px-2.5 text-right">Cred / Anom</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((item) => {
                    const checked = item.selectedForReport !== false;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => onToggleFindingForReport(item.id)}
                        className={`cursor-pointer ${
                          checked ? "row-selected" : "opacity-60"
                        }`}
                      >
                        <td className="py-2.5 px-2.5 align-top">
                          <button
                            type="button"
                            aria-label={`Include ${item.title} in report`}
                            className="text-blue-600"
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-2.5 align-top font-mono text-[11px] text-black whitespace-nowrap tabular-nums">
                          {item.publishedAt}
                        </td>
                        <td className="py-2.5 px-2.5 align-top">
                          <div className="font-semibold text-black line-clamp-2 leading-snug">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-700 mt-0.5">
                            {item.channel}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 align-top text-right font-mono text-[11px] text-black whitespace-nowrap tabular-nums font-semibold">
                          {item.credibilityIndex}% / {item.anomalyScore}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Report Custom Directive Input (White textbox, black text) */}
            <div className="p-4 border-t border-slate-800 bg-[#111827] space-y-2">
              <label
                htmlFor="report-focus-directive"
                className="block text-xs font-mono text-slate-200"
              >
                REPORT SYNTHESIS DIRECTIVE (OPTIONAL)
              </label>
              <input
                id="report-focus-directive"
                type="text"
                value={reportDirective}
                onChange={(e) => setReportDirective(e.target.value)}
                placeholder="e.g. Emphasize radar-infrared corroboration & NHI claims..."
                className="textbox-white w-full px-3 py-2 text-xs rounded"
              />
            </div>
          </div>

          {/* Right Column: Interactive RunBot Output Table & Prompt Bar (7 cols) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-[#0B0E17]">
            {/* Quick Investigative Prompts */}
            <div className="px-5 py-3 bg-[#111827]/70 border-b border-slate-800">
              <div className="text-[11px] font-mono text-slate-300 mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>QUICK INTERROGATION VECTORS:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isSending}
                    onClick={() => onSendMessage(q)}
                    className="btn-tactile-blue-subtle px-2.5 py-1.5 text-xs rounded text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* RunBot Dialog Output Table (White Cells, Black Text) */}
            <div className="flex-1 overflow-y-auto p-5">
              <table className="output-table-white text-left text-xs">
                <thead className="text-[11px] font-mono uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-36">Speaker / Time</th>
                    <th className="py-2.5 px-4">RunBot Dialog & Intelligence Output</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id}>
                      <td className="py-3 px-3 align-top font-mono text-[11px] text-black whitespace-nowrap">
                        <div className="font-bold">
                          {msg.role === "user" ? "ANALYST" : "RUNBOT RB-09"}
                        </div>
                        <div className="text-slate-600 mt-0.5">
                          {msg.timestamp}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top text-sm text-black leading-relaxed">
                        <div className="whitespace-pre-wrap text-black">
                          {msg.content}
                        </div>

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-300">
                            <div className="text-[11px] font-mono font-bold text-black mb-1">
                              GROUNDED YOUTUBE & WEB CITATIONS:
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {msg.sources.slice(0, 5).map((src, idx) => (
                                <a
                                  key={idx}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-xs">
                                    {src.title}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {isSending && (
                    <tr>
                      <td className="py-3 px-3 align-top font-mono text-[11px] text-black font-bold">
                        RUNBOT RB-09
                      </td>
                      <td className="py-3 px-4 align-top font-mono text-xs text-black">
                        Cross-referencing YouTube telemetry, optical frames, and Five Observables...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form (White textbox, black text + Tactile Blue button) */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-[#111827] border-t border-slate-800 flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSending}
                placeholder="Ask RunBot about any YouTube UAP footage, FLIR timestamp, alien testimony, or request a summary..."
                className="textbox-white flex-1 px-4 py-2.5 text-sm rounded"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="btn-tactile-blue px-5 py-2.5 text-xs font-semibold rounded disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Send to RunBot
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
