import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './models/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interview.js';

// Load .env FIRST before anything else
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Startup checks ────────────────────────────────────────────────────────────
console.log(`\n🚀 TechTrack AI Backend starting...`);
console.log(`   Mode    : ${NODE_ENV}`);
console.log(`   Port    : ${PORT}`);
console.log(`   DB      : ${process.env.MONGO_URI ? 'MongoDB Atlas' : 'Local JSON fallback'}`);
console.log(`   Gemini  : ${process.env.GEMINI_API_KEY ? '✅ API Key loaded' : '⚠️  No API key — using rule engine fallback'}\n`);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:4173',   // Vite preview
  'http://localhost:8080',   // Production same-origin
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, REST Client)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parser ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/resume',    resumeRoutes);
app.use('/api/interview', interviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: NODE_ENV,
    timestamp: new Date(),
    db: process.env.MONGO_URI ? 'mongodb' : 'local-json',
    gemini: !!process.env.GEMINI_API_KEY,
  });
});

// ── Serve static frontend in production ────────────────────────────────────────
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuildPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('TechTrack AI — backend running in API-only mode. Start the frontend with: cd frontend && npm run dev');
    }
  });
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ── Start ──────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
      console.log(`   Health : http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

