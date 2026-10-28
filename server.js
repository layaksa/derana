// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(express.json({ limit: "10mb" }));
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  app.post("/api/ai/deteksi-kata-serapan", async (req, res) => {
    try {
      const { words, bahasaDaerah = "Bahasa Daerah", namaDesa = "Wilayah Pengamatan" } = req.body;
      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({ error: "Daftar kata Swadesh harus berupa array." });
        return;
      }
      const validWords = words.filter((w) => w.bentukLokal && String(w.bentukLokal).trim() !== "");
      if (validWords.length === 0) {
        res.json({ results: [] });
        return;
      }
      if (!ai) {
        console.warn("[AI Server] GEMINI_API_KEY is not set. Returning empty to trigger client-side etymological dictionary fallback.");
        res.json({ results: [], fallback: true });
        return;
      }
      const chunkToProcess = validWords.slice(0, 50);
      const prompt = `Anda adalah ahli geolinguistik komparatif dan etimologi bahasa-bahasa Nusantara.
Tugas Anda adalah menganalisis daftar kosakata Swadesh dari ${bahasaDaerah} di desa ${namaDesa}.
Tentukan apakah masing-masing kata merupakan KATA SERAPAN (loanword / serapan leksikal) dari:
- Bahasa Indonesia / Melayu (terutama kasus responden memberikan kata baku BI alih-alih kosakata asli bahasa daerah)
- Sanskerta (misal: kaca < k\u0101ca, guru < guru, jiwa < j\u012Bva, rupa < r\u016Bpa, warna < var\u1E47a, dll)
- Arab (misal: surat < \u1E63\u016Brah, kursi < kurs\u012B, waktu < waqt, akal < 'aql, dll)
- Belanda (misal: buku < boek, kantor < kantoor, kamar < kamer, gelas < glas, dll)
- Portugis (misal: meja < mesa, bangku < banco, sekolah < escola, sepatu < sapato, gereja < igreja, dll)
- Tionghoa (Hokkien) (misal: toko, lonceng, cawan, dll)
- Inggris
- Persia
- Atau BUKAN SERAPAN (Asli warisan Proto-Austronesia / kognat lokal).

Catatan Penting:
- Jangan menandai kata dasar Austronesia purba asli (seperti: batu, mata, kutu, dua, lima, daun, angin, langit, mati, hidup, susu, darah) sebagai serapan BI meskipun ejaannya mirip, karena itu adalah kognat turunan PAn/PMP!
- Tandai sebagai serapan BI jika bentuk asli bahasa daerah tersebut diketahui berbeda (misal di Sunda: responden menyebut "anjing" padahal variasi lokal atau menyebut "tidur" alih-alih "sare", menyebut "air" alih-alih "cai", dsb).

Daftar Kosakata:
${JSON.stringify(chunkToProcess.map((w) => ({
        id: w.id,
        glosIndonesia: w.glosIndonesia,
        bentukLokal: w.bentukLokal,
        transkripsiIPA: w.transkripsiIPA || ""
      })))}

KEMBALIKAN HANYA ARRAY JSON VALID (tanpa markdown backticks, tanpa penjelasan teks di luar JSON) dengan struktur persis seperti berikut:
[
  {
    "id": 1,
    "glosIndonesia": "air",
    "bentukLokal": "cai",
    "isLoanword": false,
    "sourceLanguage": "Bukan Serapan (Asli Austronesia)",
    "etymon": "Proto-Austronesia *wahiR",
    "confidence": "TINGGI",
    "explanation": "Bentuk asli Sunda dari rumpun Melayo-Polinesia purba.",
    "suggestedAnnotation": ""
  }
]`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });
      const responseText = response.text || "";
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed)) {
          res.json({ results: parsed });
          return;
        }
      } catch (parseError) {
        console.error("[AI Server] Failed to parse Gemini response as JSON:", parseError, responseText);
      }
      res.json({ results: [], fallback: true });
    } catch (error) {
      console.error("[AI Server Error] deteksi-kata-serapan error:", error);
      res.status(500).json({ error: error.message || "Gagal memproses analisis kata serapan AI." });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Sistem Pemetaan Bahasa & Dialektometri API",
      aiAvailable: Boolean(ai),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
