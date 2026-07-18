import { AnalysisResult } from "./types";

export interface SampleVideo {
  id: string;
  name: string;
  url: string;
  category: string;
  embedId: string; // Real YouTube video id for high fidelity player loading!
  data: AnalysisResult;
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "growth-podcast",
    name: "🎙️ Podcast: Rahasia Disiplin Menembus Batas",
    url: "https://www.youtube.com/watch?v=A2G_D_Zz8_s", // Real YouTube podcast video
    embedId: "A2G_D_Zz8_s",
    category: "Podcast & Talkshow",
    data: {
      videoTitle: "Podcast Pertumbuhan Diri: Rahasia Sukses & Disiplin Menembus Batas",
      videoDuration: 300,
      overallViralityScore: 94,
      viralityInsights: "Kombinasi intonasi emosional tinggi dengan kontradiksi nasihat populer sangat viral di TikTok. Hook kuat 3 detik pertama terfokus pada pertanyaan kontroversial.",
      clips: [
        {
          id: "growth-clip-1",
          title: "Berhenti Cari Motivasi, Cari Disiplin! 🛑",
          start: 24,
          end: 54,
          duration: 30,
          viralityScore: 96,
          whyViral: "Nasihat kontradiktif yang keras. Memotong mitos bahwa sukses butuh motivasi konstan, melainkan disiplin murni saat sedang tidak ingin melakukan apa-apa.",
          suggestedTitles: [
            "Kenapa Motivasi Itu SCAM! 😡",
            "Satu-satunya trik disiplin konsisten",
            "Cara melatih mental juara saat malas"
          ],
          subtitles: [
            { time: 24, text: "Dengerin saya baik-baik." },
            { time: 27, text: "Motivasi itu bohong!" },
            { time: 30, text: "Itu perasaan sementara." },
            { time: 33, text: "Saat kamu lelah," },
            { time: 36, text: "motivasi kamu bakalan hilang." },
            { time: 39, text: "Tapi, disiplin sejati..." },
            { time: 42, text: "adalah tetap bekerja..." },
            { time: 45, text: "bahkan ketika kamu..." },
            { time: 48, text: "sangat benci melakukannya!" },
            { time: 51, text: "Itulah pembeda utamanya!" }
          ]
        },
        {
          id: "growth-clip-2",
          title: "Aturan 5 Detik Melawan Kemalasan",
          start: 110,
          end: 140,
          duration: 30,
          viralityScore: 89,
          whyViral: "Menyediakan tips praktis yang bisa langsung diterapkan penonton di rumah. Solusi cepat ini memicu interaksi komentar tinggi.",
          suggestedTitles: [
            "Trik Otak 5 Detik Biar Gak Malas 🧠",
            "Cara gampang bangun subuh tanpa tunda",
            "Hack psikologi terkuat abad ini!"
          ],
          subtitles: [
            { time: 110, text: "Setiap kali kamu ragu," },
            { time: 113, text: "otak kamu akan membunuh idemu." },
            { time: 116, text: "Gunakan aturan lima detik." },
            { time: 119, text: "Hitung mundur sekarang:" },
            { time: 122, text: "Lima, empat, tiga," },
            { time: 125, text: "dua, satu, dan GERAK!" },
            { time: 128, text: "Jangan biarkan alasan menang." },
            { time: 131, text: "Lakukan sebelum malas tiba!" },
            { time: 134, text: "Tulis di komen jika berhasil!" }
          ]
        }
      ]
    }
  },
  {
    id: "mindset-speech",
    name: "🔥 Motivasi: Ubah Rasa Sakit Menjadi Kekuatan",
    url: "https://www.youtube.com/watch?v=F3S7_v88j5g",
    embedId: "F3S7_v88j5g",
    category: "Pidato Inspiratif",
    data: {
      videoTitle: "Pidato Inspirasi Kehidupan: Mengubah Luka & Rasa Sakit Menjadi Bahan Bakar Sukses",
      videoDuration: 240,
      overallViralityScore: 91,
      viralityInsights: "Pidato berenergi tinggi dengan struktur naratif klimaks. Rekomendasi: Gunakan template Cyber Glitch untuk bagian teriakan emosional.",
      clips: [
        {
          id: "mindset-clip-1",
          title: "Rasa Sakit Itu Bahan Bakar Sukses!",
          start: 15,
          end: 45,
          duration: 30,
          viralityScore: 93,
          whyViral: "Sangat menyentuh empati anak muda yang merasa gagal. Membingkai ulang rasa sakit sebagai hadiah terbesar.",
          suggestedTitles: [
            "Sakit hari ini, kuat besok! 💪",
            "Jangan tangisi kegagalanmu!",
            "Trik jadikan masalah jadi cuan"
          ],
          subtitles: [
            { time: 15, text: "Sakit yang kamu rasakan..." },
            { time: 18, text: "kecewa yang kamu alami..." },
            { time: 21, text: "itu bukan tanda kamu lemah." },
            { time: 24, text: "Itu adalah bahan bakar!" },
            { time: 27, text: "Pakai rasa sakit itu..." },
            { time: 30, text: "untuk membuktikan mereka salah!" },
            { time: 33, text: "Bangun lebih pagi," },
            { time: 36, text: "belajar lebih keras," },
            { time: 39, text: "dan tunjukkan siapa kamu!" },
            { time: 42, text: "Kamu pasti bisa menang!" }
          ]
        }
      ]
    }
  },
  {
    id: "tech-future",
    name: "💻 Tech Trends: Gadget AI Pengubah Masa Depan",
    url: "https://www.youtube.com/watch?v=ZfbykM1A9wE",
    embedId: "ZfbykM1A9wE",
    category: "Teknologi & Review",
    data: {
      videoTitle: "Tech Future: Masa Depan Smartphone Telah Tiba!",
      videoDuration: 180,
      overallViralityScore: 88,
      viralityInsights: "Fokus pada rasa penasaran gila terhadap inovasi baru. Sempurna untuk target penonton milenial/Gen-Z yang hobi gadget.",
      clips: [
        {
          id: "tech-clip-1",
          title: "Selamat Tinggal Layar Smartphone Kaca! 👋",
          start: 35,
          end: 65,
          duration: 30,
          viralityScore: 90,
          whyViral: "Visualisasi keren dan klaim mengejutkan tentang punahnya HP biasa diganti kacamata holografik pintar.",
          suggestedTitles: [
            "HP lu bakalan PUNAH tahun depan! 🤯",
            "Gak perlu bawa HP lagi kemana-mana",
            "Gadget masa depan paling dicari"
          ],
          subtitles: [
            { time: 35, text: "Sepuluh tahun dari sekarang," },
            { time: 38, text: "smartphone di saku kamu..." },
            { time: 41, text: "akan sepenuhnya punah!" },
            { time: 44, text: "Kita akan pakai kacamata AI." },
            { time: 47, text: "Semua pesan, video, peta..." },
            { time: 50, text: "terproyeksi langsung di depan matamu!" },
            { time: 53, text: "Gila banget kan?" },
            { time: 56, text: "Apakah kamu siap buat beli?" },
            { time: 59, text: "Tulis pendapatmu di bawah!" },
            { time: 62, text: "Jangan lupa follow ya!" }
          ]
        }
      ]
    }
  }
];
