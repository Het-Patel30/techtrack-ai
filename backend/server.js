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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Serve static frontend files in production
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuildPath));

// Fallback all other routes to React index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // If index.html doesn't exist (e.g. dev mode), return API status
      res.status(200).send("TechTrack AI Express Backend running in API-only mode.");
    }
  });
});

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
