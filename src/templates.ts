import { TextTemplateConfig } from "./types";

export const TEXT_TEMPLATES: TextTemplateConfig[] = [
  {
    id: "tiktok-yellow",
    name: "🔥 TikTok Viral Yellow",
    className: "text-yellow-400 font-extrabold uppercase tracking-wide text-2xl md:text-3xl filter drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-center",
    fontFamily: "font-display",
    shadowStyle: "paint-order-[stroke_fill] stroke-black stroke-[4px]",
    color: "#eab308",
    animationClass: "animate-caption-bounce"
  },
  {
    id: "neon-glitch",
    name: "⚡ Cyber Glitch",
    className: "text-pink-500 font-bold uppercase tracking-widest text-2xl md:text-3xl text-center font-mono animate-caption-glitch",
    fontFamily: "font-mono",
    shadowStyle: "",
    color: "#ec4899",
    animationClass: "animate-caption-glitch"
  },
  {
    id: "gamer-cyber",
    name: "🎮 Gamer Neon Cyan",
    className: "text-cyan-400 font-black italic tracking-tighter text-3xl md:text-4xl text-center",
    fontFamily: "font-display",
    shadowStyle: "paint-order-[stroke_fill] stroke-indigo-900 stroke-[5px]",
    color: "#22d3ee",
    animationClass: "animate-caption-bounce"
  },
  {
    id: "retro-arcade",
    name: "👾 Arcade Lime",
    className: "text-green-400 font-bold tracking-normal text-xl md:text-2xl font-mono border-2 border-black bg-black/80 px-4 py-2 rounded-lg text-center",
    fontFamily: "font-mono",
    shadowStyle: "shadow-lg",
    color: "#4ade80",
    animationClass: ""
  },
  {
    id: "minimalist-clean",
    name: "✨ Elegant Minimalist",
    className: "text-white font-medium tracking-wide text-lg md:text-xl bg-slate-950/80 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-sm text-center",
    fontFamily: "font-sans",
    shadowStyle: "",
    color: "#ffffff",
    animationClass: ""
  }
];
