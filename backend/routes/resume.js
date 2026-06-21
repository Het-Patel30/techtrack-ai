import express from 'express';
import { db } from '../models/db.js';
import { auth } from '../middleware/auth.js';
import { generateResume } from '../services/gemini.js';

const router = express.Router();

// GET SAVED RESUME
router.get('/', auth, async (req, res) => {
  try {
    const resume = await db.Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(200).json(null);
    }
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving resume', error: err.message });
  }
});

// GENERATE ATS-OPTIMIZED RESUME VIA AI
router.post('/generate', auth, async (req, res) => {
  try {
    const profile = await db.Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ message: 'Please complete your Profile details first!' });
    }

    // Call Gemini Service
    const aiResumeData = await generateResume(profile);

    const updatedResume = await db.Resume.findOneAndUpdate(
      { user: req.user.id },
      {
        atsScore: aiResumeData.atsScore,
        atsKeywordsMatched: aiResumeData.atsKeywordsMatched,
        atsKeywordsMissing: aiResumeData.atsKeywordsMissing,
        summary: aiResumeData.summary,
        experienceBullets: aiResumeData.experienceBullets,
        projectsBullets: aiResumeData.projectsBullets,
        skillsFormatted: aiResumeData.skillsFormatted,
        generatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json(updatedResume);
  } catch (err) {
    res.status(500).json({ message: 'Server error generating resume', error: err.message });
  }
});

export default router;
