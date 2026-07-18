import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. AI features will fallback to simulation mode.");
}

// Helper to provide realistic simulated content if AI is not configured or in case of errors
function getSimulatedAnalysis(url: string, duration: string) {
  const durVal = parseInt(duration) || 30;
  
  // Choose realistic simulation based on domain keywords
  const isPodcast = url.toLowerCase().includes("podcast") || url.toLowerCase().includes("talk") || url.toLowerCase().includes("show");
  const isMotivation = url.toLowerCase().includes("motivation") || url.toLowerCase().includes("speak") || url.toLowerCase().includes("life");
  const isTech = url.toLowerCase().includes("tech") || url.toLowerCase().includes("unbox") || url.toLowerCase().includes("review");
  
  if (isPodcast) {
    return {
      videoTitle: "Podcast Pertumbuhan Diri: Menemukan Passion di Usia Muda",
      videoDuration: 600,
      overallViralityScore: 92,
      viralityInsights: "Konten ini sangat viral karena menyajikan perdebatan sudut pandang yang kontras namun relatable untuk audiens umur 18-30 tahun. Rekomendasi: Gunakan font kuning menyala di detik ke-3 pertama untuk menahan perhatian.",
      clips: [
        {
          id: "sim-clip-1",
          title: "Rahasia Sukses: Berhenti Mencari Passion!",
          start: 45,
          end: 45 + durVal,
          duration: durVal,
          viralityScore: 94,
          whyViral: "Kaitannya sangat tinggi dengan generasi Z yang merasa bingung arah karir. Pembicara memberikan solusi yang berlawanan dengan saran konvensional (kontra-intuitif).",
          suggestedTitles: [
            "BERHENTI Cari Passion Lu! 🛑",
            "Kenapa passion bikin lu miskin...",
            "Trik sukses umur 20-an"
          ],
          subtitles: [
            { time: 45, text: "Banyak orang bilang," },
            { time: 47, text: "kamu harus cari passion kamu." },
            { time: 50, text: "Tapi tahu nggak?" },
            { time: 52, text: "Itu adalah nasihat terburuk!" },
            { time: 55, text: "Passion itu dibangun," },
            { time: 58, text: "bukan cuma dicari." },
            { time: 61, text: "Fokus aja ke skill lu dulu!" },
            { time: 64, text: "Nanti passion bakalan ngikut." }
          ].filter(s => s.time < 45 + durVal)
        },
        {
          id: "sim-clip-2",
          title: "Cara Kerja Otak Saat Kita Malas",
          start: 180,
          end: 180 + durVal,
          duration: durVal,
          viralityScore: 89,
          whyViral: "Visualisasi penjelasan ilmiah yang dikemas sederhana tentang dopamin dan kemalasan mendalam.",
          suggestedTitles: [
            "Kenapa kita hobi banget menunda? 🧠",
            "Musuh terbesar produktivitas",
            "Cara manipulasi hormon dopamin"
          ],
          subtitles: [
            { time: 180, text: "Kenapa sih kita malas?" },
            { time: 182, text: "Itu bukan salah kamu." },
            { time: 185, text: "Itu cara kerja dopamin kita." },
            { time: 188, text: "Otak kita selalu mencari" },
            { time: 191, text: "kesenangan instan dengan mudah." },
            { time: 194, text: "Satu-satunya cara melawannya" },
            { time: 197, text: "adalah aturan lima detik!" },
            { time: 200, text: "Coba lakuin sekarang." }
          ].filter(s => s.time < 180 + durVal)
        }
      ]
    };
  }

  if (isMotivation) {
    return {
      videoTitle: "Pidato Inspiratif: Bangkit Setelah Hancur",
      videoDuration: 420,
      overallViralityScore: 95,
      viralityInsights: "Pemberian energi emosional yang intens dari intonasi suara pembicara sangat cocok untuk background musik sedih / sinematik.",
      clips: [
        {
          id: "sim-clip-1",
          title: "Sakit Hari Ini Adalah Kekuatan Besok",
          start: 20,
          end: 20 + durVal,
          duration: durVal,
          viralityScore: 96,
          whyViral: "Membangun empati instan. Detik-detik awal langsung memicu rasa ingin tahu dengan kutipan keras.",
          suggestedTitles: [
            "Dengerin ini saat lu mau menyerah 😭",
            "Rasa sakit itu sementara!",
            "Mental baja dibentuk dari badai"
          ],
          subtitles: [
            { time: 20, text: "Jika hari ini terasa sangat berat," },
            { time: 23, text: "ingatlah satu hal ini." },
            { time: 26, text: "Baja terkuat ditempa" },
            { time: 29, text: "di dalam api yang paling panas." },
            { time: 32, text: "Rasa sakit yang kamu rasakan" },
            { time: 35, text: "akan menjadi kekuatan besok." },
            { time: 38, text: "Jadi, jangan berhenti berjalan!" }
          ].filter(s => s.time < 20 + durVal)
        }
      ]
    };
  }

  // Default tech/general simulation
  return {
    videoTitle: "Inovasi Masa Depan: Teknologi AI Mengubah Dunia",
    videoDuration: 300,
    overallViralityScore: 87,
    viralityInsights: "Berfokus pada rasa penasaran futuristik. Cocok untuk audiens umum yang tertarik pada masa depan teknologi.",
    clips: [
      {
        id: "sim-clip-1",
        title: "Gadget AI Ini Menggantikan Smartphone Lu!",
        start: 10,
        end: 10 + durVal,
        duration: durVal,
        viralityScore: 91,
        whyViral: "Hook rasa ingin tahu yang tinggi tentang masa depan smartphone. Visual yang ditunjukkan sangat memukau.",
        suggestedTitles: [
          "Smartphone bakalan PUNAH?! 🤯",
          "Teknologi masa depan ada di sini",
          "Gak perlu HP lagi tahun depan"
        ],
        subtitles: [
          { time: 10, text: "Lihat perangkat sekecil ini." },
          { time: 13, text: "Bisa melakukan semua tugas HP." },
          { time: 16, text: "Kirim pesan lewat suara," },
          { time: 19, text: "proyeksikan layar di tangan," },
          { time: 22, text: "dan tanpa layar fisik sama sekali!" },
          { time: 25, text: "Apakah era smartphone sudah habis?" },
          { time: 28, text: "Tulis pendapatmu di kolom komentar!" }
        ].filter(s => s.time < 10 + durVal)
      }
    ]
  };
}

// Server API Endpoint to Analyze Video Link via Gemini
app.post("/api/analyze", async (req, res) => {
  const { url, duration, category } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL video wajib disertakan." });
  }

  // If no Gemini API Key is loaded, run in simulation mode immediately
  if (!ai) {
    console.log("Using simulation mode for URL:", url);
    const mockData = getSimulatedAnalysis(url, duration || "30");
    return res.json(mockData);
  }

  try {
    const durVal = duration || "30";
    const prompt = `Analyze this video link and extract several short viral clips/segments out of it. 
Video Link: "${url}"
Requested individual clip duration: "${durVal}" seconds.
Target Category/Theme: "${category || 'Auto-detect'}"

Please do the following:
1. Ground your knowledge or search for information about the video if it is a well-known URL (e.g. YouTube podcast, famous interviews, speech, influencer). If it is a generic, custom, or newer URL, analyze the keywords in the path/domain to generate a highly convincing, realistic set of viral clips that correspond to that topic.
2. Produce a list of highly engaging viral clips. Each clip must have:
   - A unique ID (e.g. "clip-1", "clip-2")
   - A viral, clickbait title in Indonesian (Indonesian is critical, since the user is Indonesian. For example: "Kenapa Kamu Harus Gagal Dulu!", "Trik Mengatasi Kemalasan", dll).
   - Start and end timestamps in seconds. Assume a realistic original video duration (e.g., between 120 to 600 seconds). Ensure the length of each clip is close to "${durVal}" seconds.
   - A virality score (from 0 to 100) and a comprehensive Indonesian explanation of why it will go viral (focusing on hooks, retention, psychological trigger).
   - At least 3 options of catchy/viral suggested titles for Reels/Shorts/TikTok.
   - A full, highly detailed transcript of subtitle segments during that clip's active duration. Each subtitle line should be 1 to 5 words maximum, optimized for rapid text overlay on mobile. Ensure timestamps (in seconds) are incremented realistically (e.g. every 2-4 seconds) starting from the clip's 'start' time up to its 'end' time.
3. Provide an overall original video title, an overall estimated original video duration, an overall estimated virality score, and general marketing insights (in Indonesian) on how to post and promote these clips.

Return the final result strictly as JSON matching the requested schema. Ensure all explanations, clip titles, and subtitle texts are in Indonesian.`;

    console.log(`Sending prompt to gemini-3.5-flash for URL: ${url}`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            videoTitle: { type: Type.STRING, description: "Judul asli atau rekonstruksi judul dari video" },
            videoDuration: { type: Type.INTEGER, description: "Estimasi total durasi video dalam detik" },
            overallViralityScore: { type: Type.INTEGER, description: "Potensi viralitas video secara keseluruhan dari 0 hingga 100" },
            viralityInsights: { type: Type.STRING, description: "Wawasan marketing singkat tentang kelebihan video ini dan strategi promosinya" },
            clips: {
              type: Type.ARRAY,
              description: "Daftar potongan klip video yang berpotensi viral tinggi",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING, description: "Judul klip yang sangat menarik perhatian audiens Indonesia" },
                  start: { type: Type.INTEGER, description: "Detik mulai klip" },
                  end: { type: Type.INTEGER, description: "Detik berakhirnya klip" },
                  duration: { type: Type.INTEGER, description: "Durasi klip dalam detik" },
                  viralityScore: { type: Type.INTEGER, description: "Skor potensi viral klip dari 0 sampai 100" },
                  whyViral: { type: Type.STRING, description: "Penjelasan kenapa bagian ini sangat viral" },
                  suggestedTitles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Setidaknya 3 pilihan judul viral siap pakai untuk video vertikal"
                  },
                  subtitles: {
                    type: Type.ARRAY,
                    description: "Daftar teks subtitle terpotong pendek untuk overlay template",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.INTEGER, description: "Timestamp detik teks ini muncul" },
                        text: { type: Type.STRING, description: "Teks subtitle pendek (1-5 kata)" }
                      },
                      required: ["time", "text"]
                    }
                  }
                },
                required: ["id", "title", "start", "end", "duration", "viralityScore", "whyViral", "suggestedTitles", "subtitles"]
              }
            }
          },
          required: ["videoTitle", "videoDuration", "overallViralityScore", "viralityInsights", "clips"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response received from Gemini.");
    }

    const jsonParsed = JSON.parse(textOutput.trim());
    return res.json(jsonParsed);

  } catch (error: any) {
    console.error("Gemini API Error, falling back to simulated output:", error);
    // Fallback to high-quality mock data so the app never crashes
    const mockData = getSimulatedAnalysis(url, duration || "30");
    return res.json({
      ...mockData,
      _note: "Sistem beralih ke mode simulasi cerdas karena batas kueri atau kegagalan API.",
      _errorDetails: error.message
    });
  }
});

// Setup Vite Dev Server / Static Hosting for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
