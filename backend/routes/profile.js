import express from 'express';
import { db } from '../models/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET USER PROFILE
router.get('/', auth, async (req, res) => {
  try {
    const profile = await db.Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(200).json(null);
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving profile', error: err.message });
  }
});

// SAVE/UPDATE USER PROFILE
router.post('/', auth, async (req, res) => {
  const {
    personalInfo,
    qualification,
    targetJob,
    technicalSkills,
    workExperience,   // [{ company, role, startDate, endDate, isCurrent, bullets[], rawText }]
    projects,         // [{ name, techStack[], description, liveUrl, repoUrl }]
    certifications,   // [{ name, issuer, date }]
    achievements      // [{ text }]
  } = req.body;

  try {
    const updatedProfile = await db.Profile.findOneAndUpdate(
      { user: req.user.id },
      {
        personalInfo,
        qualification,
        targetJob,
        technicalSkills,
        workExperience:   workExperience   || [],
        projects:         projects         || [],
        certifications:   certifications   || [],
        achievements:     achievements     || [],
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ message: 'Server error saving profile', error: err.message });
  }
});

export default router;
