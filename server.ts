import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Endpoint: Deteksi Kata Serapan menggunakan Gemini AI
  app.post('/api/ai/deteksi-kata-serapan', async (req: Request, res: Response) => {
    try {
      const { words, bahasaDaerah = 'Bahasa Daerah', namaDesa = 'Wilayah Pengamatan' } = req.body;

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({ error: 'Daftar kata Swadesh harus berupa array.' });
        return;
      }

      // Filter words with valid non-empty values
      const validWords = words.filter((w: any) => w.bentukLokal && String(w.bentukLokal).trim() !== '');

      if (validWords.length === 0) {
        res.json({ results: [] });
        return;
      }

      // If Gemini client is not initialized (e.g. missing API key in dev), return fallback indicator
      if (!ai) {
        console.warn('[AI Server] GEMINI_API_KEY is not set. Returning empty to trigger client-side etymological dictionary fallback.');
        res.json({ results: [], fallback: true });
        return;
      }

      // Take a manageable chunk (up to 50 words per batch for fast response)
      const chunkToProcess = validWords.slice(0, 50);

      const prompt = `Anda adalah ahli geolinguistik komparatif dan etimologi bahasa-bahasa Nusantara.
Tugas Anda adalah menganalisis daftar kosakata Swadesh dari ${bahasaDaerah} di desa ${namaDesa}.
Tentukan apakah masing-masing kata merupakan KATA SERAPAN (loanword / serapan leksikal) dari:
- Bahasa Indonesia / Melayu (terutama kasus responden memberikan kata baku BI alih-alih kosakata asli bahasa daerah)
- Sanskerta (misal: kaca < kāca, guru < guru, jiwa < jīva, rupa < rūpa, warna < varṇa, dll)
- Arab (misal: surat < ṣūrah, kursi < kursī, waktu < waqt, akal < 'aql, dll)
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
${JSON.stringify(chunkToProcess.map((w: any) => ({
  id: w.id,
  glosIndonesia: w.glosIndonesia,
  bentukLokal: w.bentukLokal,
  transkripsiIPA: w.transkripsiIPA || ''
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
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      
      // Clean possible markdown code fences
      const cleanJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      try {
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed)) {
          res.json({ results: parsed });
          return;
        }
      } catch (parseError) {
        console.error('[AI Server] Failed to parse Gemini response as JSON:', parseError, responseText);
      }

      // If parsing fails, signal fallback
      res.json({ results: [], fallback: true });
    } catch (error: any) {
      console.error('[AI Server Error] deteksi-kata-serapan error:', error);
      res.status(500).json({ error: error.message || 'Gagal memproses analisis kata serapan AI.' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Sistem Pemetaan Bahasa & Dialektometri API',
      aiAvailable: Boolean(ai),
      timestamp: new Date().toISOString(),
    });
  });

  // CARTO.com Server-Side Proxy Configuration (Key concealed from browser)
  const CARTO_API_KEY = process.env.CARTO_API_KEY || process.env.VITE_CARTO_API_KEY || process.env.apiKey;

  // API Endpoint: CARTO Basemap Tile Proxy
  app.get('/api/carto/tiles/:style/:z/:x/:y', async (req: Request, res: Response) => {
    try {
      const { style, z, x } = req.params;
      let y = req.params.y;
      y = y.replace(/\.png$/i, '');

      let cartoPath = 'rastertiles/voyager';
      if (style === 'positron') {
        cartoPath = 'light_all';
      } else if (style === 'dark_matter' || style === 'dark') {
        cartoPath = 'dark_all';
      } else if (style === 'voyager') {
        cartoPath = 'rastertiles/voyager';
      }

      const subdomains = ['a', 'b', 'c', 'd'];
      const s = subdomains[(Number(x) + Number(y)) % subdomains.length];
      if (!CARTO_API_KEY) {
    res.status(503).send('CARTO API key is not configured');
    return;
  }

  const cartoUrl = `https://${s}.basemaps.cartocdn.com/${cartoPath}/${z}/${x}/${y}.png?api_key=${encodeURIComponent(CARTO_API_KEY)}`;

      const tileRes = await fetch(cartoUrl, {
        headers: {
          'User-Agent': 'SistemPemetaanBahasa-CartoProxy/1.0',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });

      if (!tileRes.ok) {
        // Fallback without api_key parameter if rate limit or domain constraint occurs
        const fallbackUrl = `https://${s}.basemaps.cartocdn.com/${cartoPath}/${z}/${x}/${y}.png`;
        const fallbackRes = await fetch(fallbackUrl);
        if (fallbackRes.ok) {
          const arrayBuf = await fallbackRes.arrayBuffer();
          res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'X-Carto-Proxy': 'active'
          });
          res.send(Buffer.from(arrayBuf));
          return;
        }
        res.status(tileRes.status).send('Gagal mengambil tile CARTO');
        return;
      }

      const arrayBuf = await tileRes.arrayBuffer();
      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Carto-Proxy': 'secured'
      });
      res.send(Buffer.from(arrayBuf));
    } catch (err: any) {
      console.error('[CARTO Proxy Error]:', err?.message || err);
      res.status(502).send('Error proxying CARTO tile');
    }
  });

  // API Endpoint: CARTO status info for client verification
  app.get('/api/carto/status', (req: Request, res: Response) => {
    res.json({
      provider: 'CARTO.com Basemaps & Tiles Engine',
    status: CARTO_API_KEY ? 'authenticated' : 'configuration_required',
    secured: true,
      supportedStyles: ['voyager', 'positron', 'dark_matter'],
      tileEndpointPattern: '/api/carto/tiles/{style}/{z}/{x}/{y}.png'
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
