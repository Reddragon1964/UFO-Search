import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  MessageSquare,
} from "lucide-react";
import { IntelligenceReport } from "../types";

interface ReportDossierViewProps {
  report: IntelligenceReport;
  onRecompile: () => Promise<void>;
  isCompiling: boolean;
  onOpenRunBot: () => void;
}

export const ReportDossierView: React.FC<ReportDossierViewProps> = ({
  report,
  onRecompile,
  isCompiling,
  onOpenRunBot,
}) => {
  const [copied, setCopied] = useState(false);

  const buildMarkdownReport = () => {
    const matrixRows = (report.keyFindingsMatrix || [])
      .map(
        (r) =>
          `| ${r.sourceTitle} | ${r.channel} | ${r.keyTimestamp} | ${r.kinematicObservation} | ${r.artifactProbability} | ${r.verdict} |`
      )
      .join("\n");

    const obsList = (report.fiveObservablesSynthesis || [])
      .map(
        (o) => `- **${o.observable}** (${o.rating}/100): ${o.evidenceNotes}`
      )
      .join("\n");

    const stepsList = (report.recommendedNextSteps || [])
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");

    return `# ${report.title}
Report ID: ${report.reportId}
Generated: ${report.generatedAt}
Classification: ${report.classificationBanner}
Aggregate Credibility Index: ${report.overallCredibilityScore}/100
Primary Classification: ${report.primaryAnomalyClassification}

## 1. Executive Summary
${report.executiveSummary}

## 2. YouTube Evidence Matrix
| Video Title | Channel | Key Timestamp | Kinematic Observation | Artifact Probability | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
${matrixRows}

## 3. Five Observables Synthesis
${obsList}

## 4. Optical & Sensor Artifact Evaluation
${report.opticalAndSensorEvaluation}

## 5. Non-Human Intelligence (NHI) & Biological Assessment
${report.nhiAndBiologicalAssessment}

## 6. Recommended OSINT Next Steps
${stepsList}
`;
  };

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(buildMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([buildMarkdownReport()], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.reportId.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.reportId.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="intelligence-dossier"
      className="bg-[#111827] border border-slate-800 p-6 md:p-8 space-y-8"
    >
      {/* Dossier Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-blue-400">
            <span>REPORT ID: {report.reportId}</span>
            <span>·</span>
            <span>{report.generatedAt}</span>
            <span>·</span>
            <span className="text-slate-400">{report.classificationBanner}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            {report.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            <span>
              Primary Classification:{" "}
              <strong className="text-slate-200 font-medium">
                {report.primaryAnomalyClassification}
              </strong>
            </span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              Aggregate Multi-Source Credibility:{" "}
              <strong className="text-blue-400">
                {report.overallCredibilityScore}.0%
              </strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenRunBot}
            className="btn-tactile-blue-subtle px-3.5 py-2 text-xs font-medium rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Interrogate Report with RunBot
          </button>
          <button
            type="button"
            onClick={onRecompile}
            disabled={isCompiling}
            className="btn-tactile-blue-subtle px-3.5 py-2 text-xs font-medium rounded disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isCompiling ? "animate-spin" : ""}`}
            />
            {isCompiling ? "Synthesizing..." : "Re-Synthesize with RunBot"}
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="btn-tactile-blue-subtle px-3.5 py-2 text-xs font-medium rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied Brief" : "Copy Markdown"}
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="btn-tactile-blue px-3.5 py-2 text-xs font-semibold rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export .MD Report
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="btn-tactile-blue-subtle px-3 py-2 text-xs font-medium rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <FileCode className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Section 1: Primary RunBot Report Findings Output Table (WHITE CELLS, BLACK TEXT) */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-100">
          01. RunBot Synthesized YouTube Evidence & Kinematic Verification Table
        </h3>
        <div className="overflow-x-auto">
          <table className="output-table-white text-left">
            <thead>
              <tr className="text-[11px] font-mono uppercase">
                <th className="py-3 px-4">YouTube Source Title</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Frame Timestamp</th>
                <th className="py-3 px-4">Kinematic Observation</th>
                <th className="py-3 px-4">Artifact Probability</th>
                <th className="py-3 px-4">RunBot Verdict</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {(report.keyFindingsMatrix || []).map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-semibold text-black max-w-xs">
                    {row.sourceTitle}
                  </td>
                  <td className="py-3 px-4 text-black">{row.channel}</td>
                  <td className="py-3 px-4 font-mono font-bold text-black tabular-nums whitespace-nowrap">
                    {row.keyTimestamp}
                  </td>
                  <td className="py-3 px-4 text-black max-w-sm">
                    {row.kinematicObservation}
                  </td>
                  <td className="py-3 px-4 text-black font-mono text-[11px]">
                    {row.artifactProbability}
                  </td>
                  <td className="py-3 px-4 font-bold text-black">
                    {row.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Executive Summary & Five Observables Table (WHITE CELLS, BLACK TEXT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-base font-semibold text-slate-100">
            02. Executive Intelligence Synthesis Table
          </h3>
          <table className="output-table-white text-left text-xs">
            <thead>
              <tr className="text-[11px] font-mono uppercase">
                <th className="py-2.5 px-4">Section</th>
                <th className="py-2.5 px-4">Synthesized Output</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-black align-top whitespace-nowrap">
                  Executive Summary
                </td>
                <td className="py-3 px-4 text-black leading-relaxed whitespace-pre-line">
                  {report.executiveSummary}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-black align-top whitespace-nowrap">
                  Sensor Evaluation
                </td>
                <td className="py-3 px-4 text-black leading-relaxed">
                  {report.opticalAndSensorEvaluation}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono font-bold text-black align-top whitespace-nowrap">
                  NHI / Biological
                </td>
                <td className="py-3 px-4 text-black leading-relaxed">
                  {report.nhiAndBiologicalAssessment}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Five Observables Breakdown Table (WHITE CELLS, BLACK TEXT) */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-base font-semibold text-slate-100">
            03. Five Observables Empirical Distribution Table
          </h3>
          <div className="overflow-x-auto">
            <table className="output-table-white text-left text-xs">
              <thead>
                <tr className="text-[11px] font-mono uppercase">
                  <th className="py-2.5 px-4">Observable Metric</th>
                  <th className="py-2.5 px-4 text-right">Score</th>
                  <th className="py-2.5 px-4">Empirical Notes</th>
                </tr>
              </thead>
              <tbody>
                {(report.fiveObservablesSynthesis || []).map((obs) => (
                  <tr key={obs.observable}>
                    <td className="py-2.5 px-4 font-semibold text-black">
                      {obs.observable}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-black font-bold tabular-nums whitespace-nowrap">
                      {obs.rating}/100
                    </td>
                    <td className="py-2.5 px-4 text-black leading-snug">
                      {obs.evidenceNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-slate-100 pt-2">
            04. Recommended OSINT Next Steps Table
          </h3>
          <table className="output-table-white text-left text-xs">
            <thead>
              <tr className="text-[11px] font-mono uppercase">
                <th className="py-2 px-3 w-28">Directive</th>
                <th className="py-2 px-4">Action Item</th>
              </tr>
            </thead>
            <tbody>
              {(report.recommendedNextSteps || []).map((step, i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-mono font-bold text-black tabular-nums">
                    DIRECTIVE 0{i + 1}
                  </td>
                  <td className="py-2.5 px-4 text-black leading-relaxed">
                    {step}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
