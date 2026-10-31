import { YouTubeFinding, IntelligenceReport, RunBotMessage } from "../types";

export const ASSETS = {
  flirCapture: "/src/assets/images/uap_gimbal_flir_capture_1793412895003.jpg",
  hearingFrame: "/src/assets/images/uap_congressional_hearing_frame_1793412895672.jpg",
  radarObservatory: "/src/assets/images/uap_radar_dome_observatory_1793412897591.jpg",
  runbotAvatar: "/src/assets/images/runbot_analyst_avatar_1793412896209.jpg",
};

export const INITIAL_YOUTUBE_FINDINGS: YouTubeFinding[] = [
  {
    id: "uss-roosevelt-gimbal-atflir",
    title: "Official DoD Declassified Navy ATFLIR 'GIMBAL' & 'FLIR1' UAP Footage",
    channel: "Department of Defense / NAVAIR Archives",
    publishedAt: "2020-04-27",
    duration: "01:16",
    viewsEstimate: "8.4M views",
    youtubeUrl: "https://www.youtube.com/watch?v=rO_M0hLlJ-Q",
    thumbnailUrl: ASSETS.flirCapture,
    category: "Military FLIR",
    sensorModality: "AN/ASQ-228 ATFLIR Thermal Pod (WHT/BLK Polarity)",
    location: "Atlantic Warning Area W-72 · 25,000 ft MSL",
    credibilityIndex: 96,
    anomalyScore: 93,
    statusLabel: "● Verified Multi-Sensor",
    summary:
      "Forward-Looking Infrared targeting pod video captured by F/A-18F Super Hornet crew alongside SA-32A radar tracks. Demonstrates sustained hover against 120-knot headwinds followed by abrupt 90-degree axial rotation without visible exhaust plume.",
    keyTimestamps: [
      {
        timestamp: "00:12",
        event: "WSO confirms SA page formation (" + '"There is a whole fleet of them on the ASA"' + ")",
      },
      {
        timestamp: "00:34",
        event: "Thermal halo remains sharp while object begins counter-wind banking maneuver",
      },
      {
        timestamp: "00:53",
        event: "Instantaneous 90-degree orientation shift synchronized with ATFLIR gimbal roll step",
      },
    ],
    observables: {
      positiveLift: 96,
      instantaneousAcceleration: 89,
      hypersonicVelocity: 78,
      transmediumTravel: 62,
      lowObservability: 92,
    },
    selectedForReport: true,
  },
  {
    id: "house-oversight-uap-subcommittee-hearing",
    title: "Subcommittee on National Security: Unidentified Anomalous Phenomena (UAP) Full Hearing",
    channel: "House Committee on Oversight and Accountability",
    publishedAt: "2023-07-26",
    duration: "02:34:18",
    viewsEstimate: "6.1M views",
    youtubeUrl: "https://www.youtube.com/watch?v=SNgoul4vyDM",
    thumbnailUrl: ASSETS.hearingFrame,
    category: "Congressional Testimony",
    sensorModality: "Sworn Congressional Testimony & Multi-Platform Radar Brief",
    location: "Rayburn House Office Building · Washington, D.C.",
    credibilityIndex: 94,
    anomalyScore: 88,
    statusLabel: "◆ Testimony Corroborated",
    summary:
      "Sworn testimony under oath by former NGA/NRO intelligence officer David Grusch, Navy Cmdr. David Fravor (USS Nimitz Tic-Tac encounter), and former F/A-18 pilot Ryan Graves detailing near-daily multi-sensor UAP incursions and alleged non-human biologics recovery programs.",
    keyTimestamps: [
      {
        timestamp: "38:14",
        event: "Cmdr. Fravor details 2004 USS Princeton SPY-1B radar tracks descending from 80,000 ft to sea level in 0.78 seconds",
      },
      {
        timestamp: "52:40",
        event: "Ryan Graves testifies on dark cube-in-sphere UAP splitting F/A-18 formation off Virginia Beach",
      },
      {
        timestamp: "01:19:05",
        event: "David Grusch testifies under oath regarding multi-decade crash retrieval and non-human biologics assessment",
      },
    ],
    observables: {
      positiveLift: 94,
      instantaneousAcceleration: 95,
      hypersonicVelocity: 92,
      transmediumTravel: 86,
      lowObservability: 84,
    },
    selectedForReport: true,
  },
  {
    id: "aguadilla-dhs-transmedium-thermal",
    title: "DHS CBP DHC-8 Thermal Capture: Aguadilla Puerto Rico Transmedium UAP Analysis",
    channel: "SCU Anomalous Aerospace Archive",
    publishedAt: "2021-09-14",
    duration: "03:54",
    viewsEstimate: "1.9M views",
    youtubeUrl: "https://www.youtube.com/watch?v=q6s5RwqnnLM",
    thumbnailUrl: ASSETS.radarObservatory,
    category: "Radar & Telemetry",
    sensorModality: "Wescam MX-15D Thermal Imager + Primary Radar Track",
    location: "Rafael Hernández Airport · Aguadilla, Puerto Rico",
    credibilityIndex: 89,
    anomalyScore: 94,
    statusLabel: "▲ Anomalous Kinematics",
    summary:
      "Homeland Security reconnaissance aircraft thermal footage tracking a low-altitude spherical thermal source at 80–120 mph that enters the Atlantic Ocean without hydrodynamic deceleration, continues submerged, and appears to bifurcate into dual thermal lobes.",
    keyTimestamps: [
      {
        timestamp: "00:48",
        event: "Object crosses runway approach corridor causing brief flight-safety hold",
      },
      {
        timestamp: "02:19",
        event: "Air-to-water entry into coastal surf with zero splash signature or velocity decay",
      },
      {
        timestamp: "03:02",
        event: "Apparent bifurcation into two synchronized thermal signatures before re-submerging",
      },
    ],
    observables: {
      positiveLift: 88,
      instantaneousAcceleration: 76,
      hypersonicVelocity: 54,
      transmediumTravel: 98,
      lowObservability: 87,
    },
    selectedForReport: true,
  },
  {
    id: "nasa-uap-independent-study-briefing",
    title: "NASA Unidentified Anomalous Phenomena Independent Study Team Full Report Briefing",
    channel: "NASA Official Broadcast",
    publishedAt: "2023-09-14",
    duration: "01:02:45",
    viewsEstimate: "2.7M views",
    youtubeUrl: "https://www.youtube.com/watch?v=CwriDd8STdI",
    thumbnailUrl: ASSETS.flirCapture,
    category: "Radar & Telemetry",
    sensorModality: "AARO / NASA Calibrated Multi-Spectral & Satellite Framework",
    location: "NASA Headquarters · Mary W. Jackson Building",
    credibilityIndex: 95,
    anomalyScore: 79,
    statusLabel: "● Verified Multi-Sensor",
    summary:
      "NASA and AARO joint briefing analyzing Middle East MQ-9 Reaper metallic orb capture alongside quantitative parallax reconstructions of the GOFAST video, establishing why calibrated multi-sensor baselines are required to isolate true anomalies.",
    keyTimestamps: [
      {
        timestamp: "14:22",
        event: "Presentation of unresolved metallic spherical UAP filmed by MQ-9 Reaper in Middle East theater",
      },
      {
        timestamp: "28:50",
        event: "Trigonometric breakdown of GOFAST range-finder telemetry showing ~40 mph actual speed via ocean parallax",
      },
      {
        timestamp: "44:10",
        event: "Roadmap for AI/ML anomaly detection across commercial satellite and aviation telemetry",
      },
    ],
    observables: {
      positiveLift: 85,
      instantaneousAcceleration: 72,
      hypersonicVelocity: 60,
      transmediumTravel: 58,
      lowObservability: 81,
    },
    selectedForReport: true,
  },
  {
    id: "stanford-nolan-metamaterials-nhi-interview",
    title: "Isotope Ratios, Biological Exposure & Anomalous Aerospace Materials Deep Dive",
    channel: "SOL Foundation / Academic UAP Symposium",
    publishedAt: "2024-02-11",
    duration: "54:12",
    viewsEstimate: "1.4M views",
    youtubeUrl: "https://www.youtube.com/watch?v=9t5G5n9B-0w",
    thumbnailUrl: ASSETS.hearingFrame,
    category: "Biological / NHI",
    sensorModality: "Secondary Ion Mass Spectrometry (NanoSIMS) & MRI Telemetry",
    location: "Palo Alto, CA · Materials Analysis Lab",
    credibilityIndex: 86,
    anomalyScore: 85,
    statusLabel: "○ Under OSINT Review",
    summary:
      "Laboratory examination of recovered bismuth-magnesium-zinc layered specimens and caudate-putamen neurological profiles from aerospace personnel exposed to close-proximity UAP electromagnetic fields.",
    keyTimestamps: [
      {
        timestamp: "11:08",
        event: "Mass spectrometry results showing engineered magnesium isotope ratios outside natural terrestrial baselines",
      },
      {
        timestamp: "29:45",
        event: "Clinical MRI analysis of white-matter dipole effects in close-encounter military aviators",
      },
      {
        timestamp: "46:19",
        event: "Discussion of Non-Human Intelligence (NHI) hypothesis and empirical falsifiability criteria",
      },
    ],
    observables: {
      positiveLift: 74,
      instantaneousAcceleration: 70,
      hypersonicVelocity: 65,
      transmediumTravel: 60,
      lowObservability: 90,
    },
    selectedForReport: true,
  },
  {
    id: "joint-senate-armed-services-aaro-2025",
    title: "Senate Armed Services Briefing: Restricted Airspace UAP Incursions & Langley Swarm Telemetry",
    channel: "U.S. Senate Armed Services Archive",
    publishedAt: "2025-11-19",
    duration: "01:48:10",
    viewsEstimate: "1.8M views",
    youtubeUrl: "https://www.youtube.com/results?search_query=Senate+Armed+Services+UAP+Hearing+Langley",
    thumbnailUrl: ASSETS.hearingFrame,
    category: "Congressional Testimony",
    sensorModality: "NORAD Multi-Site Phased Array Radar & Optical Tracking",
    location: "Langley AFB · Virginia Restricted Airspace",
    credibilityIndex: 93,
    anomalyScore: 87,
    statusLabel: "◆ Testimony Corroborated",
    summary:
      "Congressional briefing reviewing multi-night trans-sonic and loitering luminous UAP formations over sensitive coastal installations resistant to electronic counter-UAS frequency jamming.",
    keyTimestamps: [
      {
        timestamp: "19:04",
        event: "NORAD radar track overlay showing coordinated 17-object formation loitering above 18,000 ft",
      },
      {
        timestamp: "47:32",
        event: "Testimony confirming zero RF command-link signature across standard drone spectrums",
      },
    ],
    observables: {
      positiveLift: 91,
      instantaneousAcceleration: 84,
      hypersonicVelocity: 75,
      transmediumTravel: 72,
      lowObservability: 93,
    },
    selectedForReport: true,
  },
  {
    id: "range-fouler-oceanic-transmedium-2026",
    title: "Declassified FOIA Navy Range Fouler Report: Pacific Fleet Thermal & Sonar Correlation",
    channel: "The Black Vault OSINT Archive",
    publishedAt: "2026-04-08",
    duration: "28:42",
    viewsEstimate: "940K views",
    youtubeUrl: "https://www.youtube.com/results?search_query=Black+Vault+Navy+Range+Fouler+UAP",
    thumbnailUrl: ASSETS.radarObservatory,
    category: "Military FLIR",
    sensorModality: "MH-60R Dipping Sonar + Electro-Optical FLIR",
    location: "SOCAL Offshore Range · 120 NM SW of San Diego",
    credibilityIndex: 91,
    anomalyScore: 90,
    statusLabel: "● Verified Multi-Sensor",
    summary:
      "Analysis of newly released FOIA Navy Range Fouler logs paired with helicopter FLIR video showing an unlit discoid object descending vertically into the Pacific Ocean with simultaneous acoustic sonar ping return.",
    keyTimestamps: [
      {
        timestamp: "06:15",
        event: "FLIR thermal capture of self-luminous craft hovering 150 ft above ocean swell",
      },
      {
        timestamp: "14:50",
        event: "Submerged acoustic track recorded at 140 knots with zero cavitation signature",
      },
    ],
    observables: {
      positiveLift: 92,
      instantaneousAcceleration: 88,
      hypersonicVelocity: 82,
      transmediumTravel: 96,
      lowObservability: 89,
    },
    selectedForReport: true,
  },
  {
    id: "low-quality-cgi-starlink-sample",
    title: "Mothership Fleet Dropping Glowing Orbs Over Desert Highway (Night Vision)",
    channel: "ThirdPhaseOfMoon",
    publishedAt: "2026-02-14",
    duration: "08:15",
    viewsEstimate: "620K views",
    youtubeUrl: "https://www.youtube.com/results?search_query=UFO+orbs+night+vision",
    thumbnailUrl: ASSETS.flirCapture,
    category: "Civilian OSINT",
    sensorModality: "Single-Channel Consumer Digital Night Vision",
    location: "Mojave Desert Sector · Highway 95",
    credibilityIndex: 28,
    anomalyScore: 34,
    statusLabel: "○ Under OSINT Review",
    summary:
      "Single-witness consumer video showing sequential flaring lights along orbital inclination plane consistent with Starlink satellite train solar reflection and digital compression artifacts.",
    keyTimestamps: [
      {
        timestamp: "01:20",
        event: "Linear flare sequence matches SpaceX Starlink LEO orbital pass ephemeris",
      },
      {
        timestamp: "04:05",
        event: "Motion tracking drift indicative of tripod pan artifact",
      },
    ],
    observables: {
      positiveLift: 35,
      instantaneousAcceleration: 20,
      hypersonicVelocity: 25,
      transmediumTravel: 15,
      lowObservability: 30,
    },
    selectedForReport: false,
  },
];

export const INITIAL_RUNBOT_MESSAGES: RunBotMessage[] = [
  {
    id: "msg-init-1",
    role: "assistant",
    content:
      "RunBot Unit RB-09 online. I have completed an initial deep scan of 5 high-priority YouTube UAP, UFO, and Non-Human Intelligence archives—spanning Pentagon ATFLIR releases, House Oversight sworn testimony, DHS Aguadilla transmedium thermal logs, NASA/AARO briefings, and SOL Foundation materials telemetry.\n\nSelect any video in the Deep-Scan Matrix to inspect its timestamped frames, ask me specific questions about sensor physics or witness corroboration, or click **Compile Dossier Report** to synthesize all checked findings into a formal intelligence briefing.",
    timestamp: "19:14:02 UTC",
  },
];

export const INITIAL_INTELLIGENCE_REPORT: IntelligenceReport = {
  reportId: "VANGUARD-UAP-2026-094",
  title: "Multi-Source YouTube UAP, UFO & NHI Deep-Scan Intelligence Assessment",
  generatedAt: "2026-10-30 19:14 UTC",
  classificationBanner: "OSINT · CALIBRATED AEROSPACE & TESTIMONY SYNTHESIS",
  executiveSummary:
    "Cross-correlation of declassified military targeting pod captures, sworn Congressional oversight testimony, and DHS airborne thermal imagery on YouTube reveals a persistent subset of Unidentified Anomalous Phenomena (UAP) exhibiting multi-sensor corroboration across radar and infrared bands. While single-sensor night-vision videos frequently resolve to optical parallax (as demonstrated in NASA's trigonometric reconstruction of GOFAST) or triangular aperture bokeh, multi-platform encounters such as the 2004 USS Nimitz Carrier Strike Group ('FLIR1') and 2015 USS Theodore Roosevelt ('GIMBAL') events remain unresolved by conventional aerodynamic envelopes.\n\nFurthermore, deep-scan analysis of sworn testimony and academic symposia highlights an emerging convergence between physical airspace incursions over restricted naval warning areas and laboratory mass-spectrometry investigations into engineered isotopic materials and close-proximity electromagnetic bio-effects.",
  overallCredibilityScore: 92,
  primaryAnomalyClassification: "Class-I Multi-Sensor Transmedium & Non-Ballistic Propulsion",
  keyFindingsMatrix: [
    {
      sourceTitle: "Official DoD Declassified Navy ATFLIR 'GIMBAL' & 'FLIR1' UAP Footage",
      channel: "Department of Defense / NAVAIR Archives",
      keyTimestamp: "00:53",
      kinematicObservation: "Sustained station-keeping in 120-kt winds followed by abrupt 90° axial rotation without thermal exhaust plume.",
      artifactProbability: "Low (22%) — Gimbal roll-step glare debated, but SA-32A radar track confirms physical target.",
      verdict: "Genuine Multi-Sensor Aerial Anomaly",
    },
    {
      sourceTitle: "Subcommittee on National Security: UAP Full Hearing",
      channel: "House Committee on Oversight",
      keyTimestamp: "38:14",
      kinematicObservation: "SPY-1B radar + visual confirmation of 40-ft white Tic-Tac dropping from 80,000 ft to 20,000 ft in <0.8s.",
      artifactProbability: "Negligible (8%) — Four independent naval aviators + E-2C Hawkeye + cruiser radar lock.",
      verdict: "High-Credibility Non-Ballistic Trajectory",
    },
    {
      sourceTitle: "DHS CBP DHC-8 Thermal Capture: Aguadilla Transmedium UAP",
      channel: "SCU Anomalous Aerospace Archive",
      keyTimestamp: "02:19",
      kinematicObservation: "Thermal signature enters Atlantic Ocean at ~95 mph without hydrodynamic drag and appears to split.",
      artifactProbability: "Moderate (38%) — Wind-borne lantern parallax hypothesis vs. transmedium submergence.",
      verdict: "High-Priority Transmedium Candidate",
    },
    {
      sourceTitle: "NASA UAP Independent Study Team Full Report Briefing",
      channel: "NASA Official Broadcast",
      keyTimestamp: "14:22",
      kinematicObservation: "MQ-9 Reaper electro-optical capture of metallic spherical orb traversing Middle East sector.",
      artifactProbability: "Low (18%) — Confirmed unresolved by AARO & NASA independent panel.",
      verdict: "Verified Unresolved Metallic Sphere",
    },
  ],
  fiveObservablesSynthesis: [
    {
      observable: "Positive Lift (Anti-Gravity / Zero Control Surfaces)",
      rating: 93,
      evidenceNotes: "Consistently observed across Nimitz Tic-Tac, Roosevelt Gimbal, and MQ-9 metallic sphere captures with zero wings, rotors, or thermal exhaust.",
    },
    {
      observable: "Instantaneous Acceleration",
      rating: 86,
      evidenceNotes: "Documented in SPY-1B radar logs (>50g vertical descent) and terminal break-lock acceleration in FLIR1 at 01:08.",
    },
    {
      observable: "Hypersonic Velocity Without Thermal/Sonic Boom",
      rating: 77,
      evidenceNotes: "Confirmed by radar track data in Nimitz CAP point intercept; less pronounced in coastalAguadilla footage.",
    },
    {
      observable: "Transmedium Travel (Air / Space / Water)",
      rating: 81,
      evidenceNotes: "Primary focus of Aguadilla DHS thermal video (02:19 water entry) and USS Nimitz submerged disturbance corroboration.",
    },
    {
      observable: "Low Observability & Cloaking / EM Interference",
      rating: 88,
      evidenceNotes: "Active APG-73 radar jamming reported by Cmdr. Fravor and cold-halo infrared signatures across ATFLIR captures.",
    },
  ],
  opticalAndSensorEvaluation:
    "RunBot optical calibration distinguishes between single-channel optical artifacts and multi-sensor tracks. Specifically, the GOFAST video's apparent high speed is largely explained by aircraft motion parallax at 25,000 ft, whereas the FLIR1 and GIMBAL captures include simultaneous radar range-gate data and multi-crew visual confirmation that rule out simple lens glare or balloon drift.",
  nhiAndBiologicalAssessment:
    "YouTube deep scan of the July 2023 House Oversight Hearing and 2024 SOL Foundation briefings indicates that Non-Human Intelligence (NHI) claims rest on two pillars: (1) Inspector General-reviewed whistleblower testimony regarding retrieval programs, and (2) peer-reviewed mass spectrometry of anomalous isotopic ratios and aviator neurological exposure markers. Direct physical video proof of biological entities on YouTube remains unverified unless corroborated by chain-of-custody laboratory telemetry.",
  recommendedNextSteps: [
    "Cross-reference ATFLIR gimbal roll-angle telemetry at 00:53 against raw SA-32A radar azimuth files to isolate physical banking from sensor derotation.",
    "Execute targeted YouTube deep scans on 2024–2026 Langley AFB and Wright-Patterson restricted airspace UAP incursion briefings.",
    "Apply frame-by-frame radiometric pixel analysis to the Aguadilla 02:19 water-entry timestamp to test line-of-sight foreground wave occlusion.",
  ],
};
