export interface SubtitleSegment {
  time: number;
  text: string;
}

export interface Clip {
  id: string;
  title: string;
  start: number;
  end: number;
  duration: number;
  viralityScore: number;
  whyViral: string;
  suggestedTitles: string[];
  subtitles: SubtitleSegment[];
}

export interface AnalysisResult {
  videoTitle: string;
  videoDuration: number;
  overallViralityScore: number;
  viralityInsights: string;
  clips: Clip[];
  _note?: string;
}

export type SubtitleStyleTemplate = "tiktok-yellow" | "neon-glitch" | "retro-arcade" | "minimalist-clean" | "gamer-cyber";

export interface TextTemplateConfig {
  id: SubtitleStyleTemplate;
  name: string;
  className: string;
  fontFamily: string;
  shadowStyle: string;
  color: string;
  animationClass: string;
}

export interface SavedClip {
  id: string;
  title: string;
  videoTitle: string;
  url: string;
  start: number;
  end: number;
  templateId: SubtitleStyleTemplate;
  timestamp: string;
  score: number;
}
