export interface TimestampMarker {
  timestamp: string;
  event: string;
}

export interface FiveObservables {
  positiveLift: number;
  instantaneousAcceleration: number;
  hypersonicVelocity: number;
  transmediumTravel: number;
  lowObservability: number;
}

export interface YouTubeFinding {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  duration: string;
  viewsEstimate: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category:
    | "Military FLIR"
    | "Congressional Testimony"
    | "Civilian OSINT"
    | "Biological / NHI"
    | "Radar & Telemetry"
    | string;
  sensorModality: string;
  location: string;
  credibilityIndex: number;
  anomalyScore: number;
  statusLabel: string;
  summary: string;
  keyTimestamps: TimestampMarker[];
  observables: FiveObservables;
  selectedForReport?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface RunBotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
  relatedFindingTitle?: string;
}

export interface IntelligenceReport {
  reportId: string;
  title: string;
  generatedAt: string;
  classificationBanner: string;
  executiveSummary: string;
  overallCredibilityScore: number;
  primaryAnomalyClassification: string;
  keyFindingsMatrix: Array<{
    sourceTitle: string;
    channel: string;
    keyTimestamp: string;
    kinematicObservation: string;
    artifactProbability: string;
    verdict: string;
  }>;
  fiveObservablesSynthesis: Array<{
    observable: string;
    rating: number;
    evidenceNotes: string;
  }>;
  opticalAndSensorEvaluation: string;
  nhiAndBiologicalAssessment: string;
  recommendedNextSteps: string[];
}
