import React, { useState, useEffect } from "react";
import { 
  Video, 
  Link as LinkIcon, 
  Scissors, 
  Zap, 
  Sparkles, 
  Clock, 
  Trash2, 
  Download, 
  Play, 
  Pause, 
  RefreshCw, 
  Sliders, 
  Smile, 
  Share2, 
  Check, 
  AlertTriangle, 
  Volume2, 
  Tv, 
  ChevronRight,
  Database,
  Plus,
  Compass,
  FileText,
  User,
  ExternalLink,
  Flame,
  LineChart
} from "lucide-react";

import { Clip, SubtitleSegment, AnalysisResult, SubtitleStyleTemplate, SavedClip } from "./types";
import { TEXT_TEMPLATES } from "./templates";
import { SAMPLE_VIDEOS, SampleVideo } from "./samples";

export default function App() {
  // Input states
  const [inputUrl, setInputUrl] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Analysis Result states
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<SubtitleStyleTemplate>("tiktok-yellow");

  // Custom modification states (editing subtitles / titles)
  const [editedSubtitles, setEditedSubtitles] = useState<SubtitleSegment[]>([]);
  const [editedClipTitle, setEditedClipTitle] = useState("");

  // Saved Library state
  const [savedClips, setSavedClips] = useState<SavedClip[]>([]);

  // Export process animation states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState("");
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [latestExport, setLatestExport] = useState<SavedClip | null>(null);

  // Active YouTube Video Iframe control (if applicable)
  const [currentEmbedId, setCurrentEmbedId] = useState("");

  // Soundwave decorative bars
  const [soundBars, setSoundBars] = useState<number[]>([]);

  // Load saved clips from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("clipper_saved_clips");
    if (stored) {
      try {
        setSavedClips(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored clips", e);
      }
    }
    
    const bars = Array.from({ length: 15 }, () => Math.floor(Math.random() * 24) + 6);
    setSoundBars(bars);
  }, []);

  // Update sound bars heights periodically when video is playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSoundBars(Array.from({ length: 15 }, () => Math.floor(Math.random() * 28) + 6));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Synchronized subtitle looping mechanism
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && activeClip) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.15;
          if (next >= activeClip.end) {
            return activeClip.start; // Loop back
          }
          return next;
        });
      }, 150);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeClip]);

  // Handle active clip switching
  const handleSelectClip = (clip: Clip) => {
    setActiveClip(clip);
    setCurrentTime(clip.start);
    setEditedClipTitle(clip.title);
    setEditedSubtitles([...clip.subtitles]);
    setIsPlaying(true);
  };

  // Helper to extract YouTube ID
  const extractYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  // Analyze a link (via Gemini backend)
  const handleAnalyzeLink = async (urlToAnalyze: string) => {
    if (!urlToAnalyze) {
      setErrorMessage("Silakan masukkan link video terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setAnalysis(null);
    setActiveClip(null);

    const ytId = extractYoutubeId(urlToAnalyze);
    setCurrentEmbedId(ytId);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlToAnalyze,
          duration: selectedDuration,
          category: selectedCategory
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal melakukan analisis video. Coba lagi.");
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);

      if (data.clips && data.clips.length > 0) {
        handleSelectClip(data.clips[0]);
      } else {
        setErrorMessage("Tidak ditemukan potongan klip potensial. Coba link video lainnya.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat menganalisis video.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick select sample videos for immediate demo
  const handleLoadSample = (sample: SampleVideo) => {
    setInputUrl(sample.url);
    setCurrentEmbedId(sample.embedId);
    setAnalysis(sample.data);
    if (sample.data.clips && sample.data.clips.length > 0) {
      handleSelectClip(sample.data.clips[0]);
    }
    setErrorMessage("");
  };

  // Subtitle editor change handler
  const handleSubtitleTextChange = (index: number, newText: string) => {
    const updated = [...editedSubtitles];
    updated[index].text = newText;
    setEditedSubtitles(updated);
  };

  // Fetch the active subtitle word to show on top of the player
  const getActiveSubtitleText = (): string => {
    if (editedSubtitles.length === 0) return "";
    
    const active = [...editedSubtitles]
      .reverse()
      .find(sub => sub.time <= currentTime);
    
    return active ? active.text : "";
  };

  // Export / Save visual simulation
  const handleExportClip = () => {
    if (!activeClip || !analysis) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportStep("Menyiapkan kanvas potong vertikal 9:16...");

    const steps = [
      { prg: 20, txt: "Melakukan cropping video ke format Portrait..." },
      { prg: 45, txt: "Menyelaraskan trek audio dan transkripsi kata..." },
      { prg: 70, txt: "Mengompilasi template subtitle teks otomatis..." },
      { prg: 90, txt: "Merender file video dengan kompresi viral tinggi..." },
      { prg: 100, txt: "Selesai! Menyimpan ke pustaka Clipper..." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setExportProgress(steps[currentStepIdx].prg);
        setExportStep(steps[currentStepIdx].txt);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setIsExporting(false);

        const newSaved: SavedClip = {
          id: `saved-${Date.now()}`,
          title: editedClipTitle || activeClip.title,
          videoTitle: analysis.videoTitle,
          url: inputUrl || "https://youtube.com/watch?v=sample",
          start: activeClip.start,
          end: activeClip.end,
          templateId: selectedTemplate,
          timestamp: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          score: activeClip.viralityScore
        };

        const updatedSaved = [newSaved, ...savedClips];
        setSavedClips(updatedSaved);
        localStorage.setItem("clipper_saved_clips", JSON.stringify(updatedSaved));

        setLatestExport(newSaved);
        setShowExportSuccess(true);
      }
    }, 900);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedClips.filter(c => c.id !== id);
    setSavedClips(filtered);
    localStorage.setItem("clipper_saved_clips", JSON.stringify(filtered));
  };

  // Get configuration values for active overlay style
  const activeTemplateConfig = TEXT_TEMPLATES.find(t => t.id === selectedTemplate) || TEXT_TEMPLATES[0];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans overflow-x-hidden antialiased select-none">
      
      {/* GLOW ATMOSPHERE BACKGROUNDS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-[600px] -right-20 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] pointer-events-none z-0"></div>

      {/* TOP NAVIGATION HEADER */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_18px_rgba(79,70,229,0.55)] border border-indigo-400/20">
            <Scissors className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter uppercase font-display text-white">
              Clipper<span className="text-indigo-500">.ai</span>
            </span>
            <span className="text-[9px] text-gray-500 font-mono tracking-widest block uppercase -mt-1 font-bold">Provider Mode</span>
          </div>
        </div>

        {/* INTEGRATED MIDDLE PASTE BAR FROM IMMERSIVE THEME */}
        <div className="hidden md:flex flex-1 max-w-xl px-8">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Tempel link video YouTube di sini..." 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-5 pr-32 text-xs text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-gray-500"
            />
            <button 
              onClick={() => handleAnalyzeLink(inputUrl)}
              disabled={isLoading || !inputUrl}
              className="absolute right-1.5 top-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-bold px-4 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "PROSES..." : "POTONG KLIP"}
            </button>
          </div>
        </div>

        {/* RIGHTS / METRICS BLOCK */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Kapasitas Ekspor</p>
            <p className="text-xs font-mono text-indigo-400 font-bold">Unbounded / Cloud Free</p>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center font-bold text-[11px] text-white">
              AI
            </div>
          </div>
        </div>
      </nav>

      {/* CORE WORKSPACE WITH SIDEBARS AND BENTO GRID */}
      <div className="flex flex-1 flex-col lg:flex-row z-10 relative">
        
        {/* LEFT SIDEBAR: ASSETS, OPTIONS & TEMPLATE OVERLAYS */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#080808] flex flex-col p-5 space-y-6">
          
          {/* Quick Setup */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Sliders className="w-3 h-3 text-indigo-400" />
              <span>Konfigurasi AI</span>
            </h3>
            
            <div className="space-y-2.5">
              {/* Duration Settings Option Selector */}
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase">Target Durasi Klip</label>
                <div className="flex gap-1 mt-1 bg-white/5 p-1 rounded-lg border border-white/5">
                  {[
                    { label: "15s", val: "15" },
                    { label: "30s", val: "30" },
                    { label: "60s", val: "60" }
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      onClick={() => setSelectedDuration(dur.val)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${
                        selectedDuration === dur.val
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme category config */}
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase">Algoritma Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-1 bg-[#101010] text-[11px] text-slate-300 border border-white/10 px-2.5 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="auto">🏷️ Otomatis Deteksi</option>
                  <option value="podcast">🎙️ Podcast & Talkshow</option>
                  <option value="motivation">🔥 Motivasi Hidup</option>
                  <option value="tech">💻 Inovasi & Gadget</option>
                  <option value="comedy">🎭 Standup & Lucu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtitle style templates */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-400" />
              <span>Template Teks Viral</span>
            </h3>

            <div className="space-y-2">
              {TEXT_TEMPLATES.map((tpl) => {
                const isSel = selectedTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isSel 
                        ? "bg-indigo-900/10 border-indigo-500/40 text-white" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    <p className="text-[11px] font-bold flex items-center justify-between">
                      <span>{tpl.name}</span>
                      {isSel && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRO TIPS BANNER FROM THE IMMERSIVE STYLE */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="bg-indigo-950/20 rounded-xl p-4 border border-indigo-500/25">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">PRO TIPS</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Potongan pendek berdurasi <span className="text-indigo-400 font-semibold">15s-30s</span> biasanya mendapatkan persentase retensi tontonan <span className="text-green-400 font-bold">24% lebih tinggi</span> pada algoritma Reels & TikTok FYP.
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE: EDITOR, VIDEO PLAYER AND PREVIEW (CENTER) */}
        <main className="flex-1 flex flex-col bg-[#050505] p-5 md:p-6 space-y-6 overflow-y-auto no-scrollbar">
          
          {/* MOBILE FRIENDLY paste input bar wrapper (for small devices that hide top bar paste tool) */}
          <div className="block md:hidden bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tempel link video YouTube..." 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-gray-500"
              />
              <div className="absolute inset-y-0 right-3 flex items-center text-indigo-400">
                <LinkIcon className="w-4 h-4" />
              </div>
            </div>
            <button
              onClick={() => handleAnalyzeLink(inputUrl)}
              disabled={isLoading || !inputUrl}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs"
            >
              {isLoading ? "MENGANALISIS..." : "PROSES EKSTRAK KLIP"}
            </button>
          </div>

          {/* QUICK START SAMPLES LIST */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Demo Sandbox</p>
              <h4 className="text-xs font-bold text-white">Ingin menguji langsung? Klik salah satu sampel kueri instan berikut:</h4>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="bg-[#0f0f0f] hover:bg-indigo-950/40 border border-white/10 hover:border-indigo-500/40 text-[11px] text-slate-300 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN PLAYER AND BENTO GRID AREA */}
          {analysis && activeClip ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* VIDEO PLAYER PREVIEW VERTICAL BOX (COLUMN: xl:col-span-6) */}
              <div className="xl:col-span-6 flex flex-col items-center">
                <div className="w-full aspect-[9/16] max-w-[290px] md:max-w-[320px] bg-black rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  
                  {/* Outer Notch decorative */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-zinc-900 rounded-full z-30 flex items-center justify-center">
                    <span className="w-2 h-2 bg-black rounded-full ml-auto mr-3"></span>
                  </div>

                  {/* ACTIVE LOOP PLAYER FRAME */}
                  <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
                    {currentEmbedId ? (
                      <iframe
                        key={`${currentEmbedId}-${activeClip.id}`}
                        src={`https://www.youtube.com/embed/${currentEmbedId}?start=${activeClip.start}&end=${activeClip.end}&autoplay=1&mute=1&loop=1&playlist=${currentEmbedId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                        title="YouTube Clip Embed"
                        className="w-[178%] h-[100%] scale-[1.78] pointer-events-none opacity-80"
                        allow="autoplay; encrypted-media"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      /* Decorative simulated studio panel when no YouTube ID exists */
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-slate-950 via-[#0d0d0d] to-indigo-950">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-3 animate-bounce">
                          <Volume2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Sinyal Audio Aktif</span>
                        <span className="text-[10px] text-gray-400 mt-1 max-w-[180px] line-clamp-2">"{editedClipTitle || activeClip.title}"</span>
                        
                        {/* Audio Wave spectrum elements */}
                        <div className="flex items-end gap-1 mt-6 h-12">
                          {soundBars.map((h, i) => (
                            <div 
                              key={i} 
                              style={{ height: `${h}px` }} 
                              className="w-1.5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-150"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SUBTITLE OVERLAY OVER PHONE CONTENT */}
                  <div className="absolute inset-x-4 top-[50%] -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none min-h-[90px]">
                    {getActiveSubtitleText() && (
                      <div className={`transition-all duration-100 ${activeTemplateConfig.className}`}>
                        <span 
                          style={{
                            fontFamily: activeTemplateConfig.fontFamily === "font-mono" ? "JetBrains Mono" : "Outfit"
                          }}
                          className={`${activeTemplateConfig.shadowStyle} select-none block drop-shadow-xl`}
                        >
                          {getActiveSubtitleText()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SIDE MOBILE ICONS OVERLAY */}
                  <div className="absolute inset-y-0 right-3.5 flex flex-col justify-end gap-5 pb-16 z-20">
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className="p-2.5 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full border border-white/10">
                        <Smile className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[9px] text-gray-300 font-mono font-bold">{activeClip.viralityScore}%</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className="p-2.5 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full border border-white/10">
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[9px] text-gray-300 font-mono font-bold">Bagi</span>
                    </div>
                  </div>

                  {/* BOTTOM INFO */}
                  <div className="absolute bottom-16 left-4 right-10 z-20 text-left space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-900/40 uppercase">@Clipper.AI</span>
                    <h4 className="text-[11px] font-bold text-white truncate">
                      {editedClipTitle || activeClip.title}
                    </h4>
                  </div>

                  {/* REALTIME DURATION INDICATOR BAR */}
                  <div className="absolute bottom-2 inset-x-3 z-20 bg-black/80 backdrop-blur-md px-2.5 py-2 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-[9px] font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span className="text-slate-300">
                        {Math.floor(currentTime)}s
                      </span>
                    </div>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden mx-1 relative">
                      <div 
                        style={{ 
                          width: `${((currentTime - activeClip.start) / (activeClip.end - activeClip.start)) * 100}%` 
                        }} 
                        className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-slate-400">
                      {activeClip.duration}s
                    </span>
                  </div>

                </div>

                {/* PLAYBACK TRIGGERS below player */}
                <div className="w-full max-w-[290px] md:max-w-[320px] flex items-center justify-between gap-2 mt-3 bg-[#0a0a0a] p-1.5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Rentang: <strong className="text-white">{activeClip.start}s - {activeClip.end}s</strong>
                  </span>
                  <button
                    onClick={() => setCurrentTime(activeClip.start)}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CONTROLS PANEL & ANALYSIS INSIGHTS (COLUMN: xl:col-span-6) */}
              <div className="xl:col-span-6 space-y-6">
                
                {/* VIRALITY SCORE CARD FROM IMMERSIVE DESIGN */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Virality Index (Peringkat Viral)</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Potensi daya sebar video berdurasi pendek</p>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30">EKSTREM</span>
                  </div>
                  
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{activeClip.viralityScore}%</span>
                    <span className="text-xs text-green-500 font-bold pb-1.5">+12.4% vs Rata-rata</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${activeClip.viralityScore}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                    />
                  </div>
                  
                  <p className="mt-3 text-[10px] text-slate-400">
                    Dampak penyebaran sangat tinggi diprediksi untuk platform <span className="text-indigo-400 font-bold">TikTok FYP</span>, <span className="text-pink-400 font-bold">Instagram Reels</span>, dan <span className="text-red-400 font-bold">YouTube Shorts</span>.
                  </p>
                </div>

                {/* DYNAMIC TITLE EDIT & AUTOGENERATE AI TITLES */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Judul Rekomendasi Viral (Klik Untuk Menggunakan)</span>
                  </h4>

                  <div className="space-y-2">
                    {activeClip.suggestedTitles.map((title, idx) => {
                      const isCurrent = editedClipTitle === title;
                      return (
                        <div
                          key={idx}
                          onClick={() => setEditedClipTitle(title)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isCurrent 
                              ? "bg-indigo-500/10 border-indigo-500/50" 
                              : "bg-white/5 border-white/10 hover:border-indigo-500/40"
                          }`}
                        >
                          <p className="text-xs font-semibold text-slate-200">{title}</p>
                          {isCurrent && (
                            <div className="mt-2 h-1 w-full bg-white/10 rounded-full">
                              <div className="h-full bg-indigo-400 w-full rounded-full shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CURRENT ACTIVE TITLE INPUT FOR MANUAL TOUCHES */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kustomisasi Judul Klip Aktif</label>
                  <input
                    type="text"
                    value={editedClipTitle}
                    onChange={(e) => setEditedClipTitle(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Masukkan judul klip kustom..."
                  />
                </div>

                {/* TRANSCRIPT DICTIONARY EDITOR PANEL */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Penyunting Kata Subtitle</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Kata yang disesuaikan akan langsung di-overlay di video 9:16</p>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-md">
                      {editedSubtitles.length} Baris
                    </span>
                  </div>

                  <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                    {editedSubtitles.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-[#0a0a0a] p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-indigo-400 px-2 py-1 bg-white/5 rounded">
                          {sub.time}s
                        </span>
                        <input
                          type="text"
                          value={sub.text}
                          onChange={(e) => handleSubtitleTextChange(idx, e.target.value)}
                          className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none px-1"
                          placeholder="..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI INSIGHTS SUMMARIZATION BOX */}
                <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-2xl p-4 space-y-2">
                  <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <LineChart className="w-3.5 h-3.5" />
                    <span>Rekomendasi Konten Kreator</span>
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{analysis.viralityInsights}</p>
                </div>

                {/* SUBMIT SAVE & EXPORT ACTION BUTTON */}
                <div className="pt-2">
                  <button
                    onClick={handleExportClip}
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-slate-200 transition-colors shadow-lg tracking-wider"
                  >
                    SAVE & DOWNLOAD PORTRAIT CLIP (.MP4)
                  </button>
                </div>

              </div>

            </div>
          ) : (
            /* Welcome state before analysis loading */
            <div className="text-center py-20 bg-[#080808]/40 border border-white/5 rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-600/5">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Belum Ada Video Teranalisis</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Silakan tempel tautan video Anda di atas atau muat salah satu demo video instan untuk melihat keajaiban ekstraksi otomatis.</p>
              </div>
            </div>
          )}

          {/* CLIP TIMELINE BAR FROM THE IMMERSIVE THEME AT THE BOTTOM OF WORKSPACE */}
          {analysis && (
            <div className="pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>AI Selected Moments ({analysis.clips.length} Klip Potensial)</span>
                </h3>
                <span className="text-[10px] text-gray-500">Nilai kecocokan dihitung secara dinamis</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {analysis.clips.map((clip) => {
                  const isActive = activeClip?.id === clip.id;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => handleSelectClip(clip)}
                      className={`w-48 bg-white/5 p-3 rounded-xl relative overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? "border-2 border-indigo-500 bg-indigo-900/10"
                          : "border border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay"></div>
                      <span className="text-[10px] font-bold text-white block truncate mb-1">{clip.title}</span>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-indigo-300">
                          00:{clip.start} - 00:{clip.end}
                        </span>
                        <span className="text-[9px] font-black text-green-400">{clip.viralityScore}% Match</span>
                      </div>
                      
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-indigo-500 rounded text-[7px] font-bold text-white uppercase tracking-wider">
                          AKTIF
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SAVED LIBRARY ARCHIVE COMPONENT */}
          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Katalog Klip Tersimpan ({savedClips.length})</h3>
              </div>
              <span className="text-[10px] text-slate-500">Penyimpanan Aman Browser Lokal</span>
            </div>

            {savedClips.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-xs text-slate-500">
                Belum ada ekspor video klip portrait. Klik tombol "SAVE & DOWNLOAD PORTRAIT CLIP" untuk menambahkan ke pustaka Anda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="bg-[#0c0c0c] rounded-xl border border-white/10 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/30 px-2 py-0.5 rounded-full">
                          Viral Index: {clip.score}%
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">{clip.timestamp}</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{clip.title}</h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">Asal: {clip.videoTitle}</p>
                      </div>

                      <div className="flex items-center gap-2 text-[9px] text-indigo-300 font-mono bg-white/5 p-1.5 rounded border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Detik: {clip.start}s - {clip.end}s</span>
                      </div>
                    </div>

                    <div className="bg-[#101010] p-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setInputUrl(clip.url);
                          const ytId = extractYoutubeId(clip.url);
                          setCurrentEmbedId(ytId);
                          
                          const fabricated: AnalysisResult = {
                            videoTitle: clip.videoTitle,
                            videoDuration: 300,
                            overallViralityScore: clip.score,
                            viralityInsights: "Klip dimuat kembali dari katalog tersimpan.",
                            clips: [
                              {
                                id: clip.id,
                                title: clip.title,
                                start: clip.start,
                                end: clip.end,
                                duration: clip.end - clip.start,
                                viralityScore: clip.score,
                                whyViral: "Katalog klip lokal tersimpan.",
                                suggestedTitles: [clip.title],
                                subtitles: [
                                  { time: clip.start, text: "Subtitles dimuat kembali..." }
                                ]
                              }
                            ]
                          };
                          setAnalysis(fabricated);
                          setSelectedTemplate(clip.templateId);
                        }}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-bold py-1.5 rounded transition-all"
                      >
                        Edit Ulang
                      </button>
                      
                      <button
                        onClick={(e) => handleDeleteSaved(clip.id, e)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-white/5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>

      </div>

      {/* FOOTER STATUS BAR FROM IMMERSIVE THEME */}
      <footer className="h-8 border-t border-white/10 bg-[#080808] px-6 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-widest font-bold z-20 relative">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>AI Engine: Operational</span>
          </div>
          <span>Cloud Latency: 24ms</span>
        </div>
        <div className="flex gap-4">
          <span>Penyimpanan Awan: 4.2GB / 10GB</span>
          <span className="text-indigo-400">PLAN PRO</span>
        </div>
      </footer>

      {/* RENDER PROGRESS OVERLAY */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6 text-center">
            
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
              <Scissors className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">MEMPROSES RENDER KLIP PORTRAIT 9:16</h4>
              <p className="text-xs text-gray-400">{exportStep}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-gray-500">
                <span>Rendering Progress</span>
                <span className="text-indigo-400 font-bold">{exportProgress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  style={{ width: `${exportProgress}%` }} 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-500 font-sans leading-relaxed">Video portrait sedang digenerasi langsung pada server Clipper. Jangan tutup tab atau browser Anda.</p>
          </div>
        </div>
      )}

      {/* EXPORT SUCCESS MODAL */}
      {showExportSuccess && latestExport && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-5 text-center">
            
            <div className="w-12 h-12 bg-indigo-950 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
              <Check className="w-6 h-6 text-indigo-400" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-200">Klip Berhasil Diekspor!</h4>
              <p className="text-xs text-slate-400">Klip "{latestExport.title}" telah diproses dan disimpan ke katalog Clipper lokal Anda.</p>
            </div>

            <div className="bg-[#050505] p-3 rounded-xl border border-white/10 text-left space-y-1.5 text-xs font-mono">
              <div className="text-gray-500 text-[10px]">Rincian File Ekspor:</div>
              <div className="text-white truncate">📝 {latestExport.title}</div>
              <div className="text-indigo-400">⭐ Virality Rating: {latestExport.score}%</div>
              <div className="text-indigo-300">⏱️ Durasi: {latestExport.end - latestExport.start} detik</div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href="data:text/plain;charset=utf-8,MockVideoFileContent"
                download={`${latestExport.title.toLowerCase().replace(/\s+/g, "_")}.mp4`}
                onClick={() => setShowExportSuccess(false)}
                className="w-full bg-white hover:bg-slate-200 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
                <span>Unduh File MP4</span>
              </a>

              <button
                onClick={() => setShowExportSuccess(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-2.5 rounded-xl text-xs transition-all border border-white/5"
              >
                Kembali Ke Editor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
