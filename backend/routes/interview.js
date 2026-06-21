import express from 'express';
import { db } from '../models/db.js';
import { auth } from '../middleware/auth.js';
import { generateInterviewRound, evaluateInterviewAnswer } from '../services/gemini.js';

const router = express.Router();

const ROUND_NAMES = [
  "Resume & Profile Screening",
  "Online Assessment (OA) & Core Coding",
  "Technical Phone Screen / Language Fundamentals",
  "Deep-Dive Technical & Frameworks",
  "System Design & Scalability",
  "Behavioral & Hiring Manager (HR)"
];

// Helper: Create default interview tracks
async function getOrCreateInterviewProgress(userId) {
  let progress = await db.Interview.findOne({ user: userId });
  if (!progress) {
    const rounds = ROUND_NAMES.map((name, index) => ({
      roundNumber: index + 1,
      roundName: name,
      status: index === 0 ? "Pending" : "Locked",
      studyConcepts: [],
      questions: [],
      resourceLinks: []
    }));

    progress = await db.Interview.findOneAndUpdate(
      { user: userId },
      {
        currentRound: 1,
        rounds,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );
  }
  return progress;
}

// GET INTERVIEW PROGRESS
router.get('/', auth, async (req, res) => {
  try {
    const progress = await getOrCreateInterviewProgress(req.user.id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching interview progress', error: err.message });
  }
});

// INITIALIZE/GENERATE A SPECIFIC ROUND
router.post('/init-round/:roundNum', auth, async (req, res) => {
  const roundNum = parseInt(req.params.roundNum);
  if (isNaN(roundNum) || roundNum < 1 || roundNum > 6) {
    return res.status(400).json({ message: 'Invalid round number' });
  }

  try {
    const profile = await db.Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ message: 'Please complete your Profile first to tailor the interview guide!' });
    }

    const progress = await getOrCreateInterviewProgress(req.user.id);
    const roundIdx = progress.rounds.findIndex(r => r.roundNumber === roundNum);

    if (roundIdx === -1) {
      return res.status(404).json({ message: 'Round not found' });
    }

    const targetRound = progress.rounds[roundIdx];

    // Ensure the round is unlocked (Pending or Active or Completed)
    if (targetRound.status === 'Locked') {
      return res.status(400).json({ message: 'This round is currently locked. Complete previous rounds first!' });
    }

    // Call Gemini to generate specialized questions and resources
    const aiRoundData = await generateInterviewRound(profile, roundNum, targetRound.roundName);

    const questionsFormatted = aiRoundData.questions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      userAnswer: '',
      feedback: '',
      score: 0,
      isAnswered: false
    }));

    progress.rounds[roundIdx].studyConcepts = aiRoundData.studyConcepts;
    progress.rounds[roundIdx].questions = questionsFormatted;
    progress.rounds[roundIdx].resourceLinks = aiRoundData.resourceLinks;
    progress.rounds[roundIdx].status = 'Active';
    progress.updatedAt = new Date();

    const updatedProgress = await db.Interview.findOneAndUpdate(
      { user: req.user.id },
      { rounds: progress.rounds, updatedAt: new Date() },
      { new: true }
    );

    res.json(updatedProgress);
  } catch (err) {
    res.status(500).json({ message: 'Server error initializing interview round', error: err.message });
  }
});

// SUBMIT MOCK ANSWER FOR EVALUATION
router.post('/submit-answer', auth, async (req, res) => {
  const { roundNumber, questionId, userAnswer } = req.body;

  if (!roundNumber || !questionId || userAnswer === undefined) {
    return res.status(400).json({ message: 'Please provide roundNumber, questionId, and userAnswer' });
  }

  try {
    const profile = await db.Profile.findOne({ user: req.user.id });
    const jobTitle = profile ? profile.targetJob.jobTitle : 'Software Developer';

    const progress = await getOrCreateInterviewProgress(req.user.id);
    const roundIdx = progress.rounds.findIndex(r => r.roundNumber === roundNumber);

    if (roundIdx === -1) {
      return res.status(404).json({ message: 'Round not found' });
    }

    const round = progress.rounds[roundIdx];
    const questionIdx = round.questions.findIndex(q => q.questionId === questionId);

    if (questionIdx === -1) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const question = round.questions[questionIdx];

    // Call Gemini to evaluate the answer
    const evaluation = await evaluateInterviewAnswer(question.questionText, userAnswer, jobTitle);

    // Update question state
    progress.rounds[roundIdx].questions[questionIdx].userAnswer = userAnswer;
    progress.rounds[roundIdx].questions[questionIdx].feedback = evaluation.feedback;
    progress.rounds[roundIdx].questions[questionIdx].score = evaluation.score;
    progress.rounds[roundIdx].questions[questionIdx].isAnswered = true;

    // Check if all questions in this round are answered
    const allAnswered = progress.rounds[roundIdx].questions.every(q => q.isAnswered);

    if (allAnswered) {
      progress.rounds[roundIdx].status = 'Completed';
      
      // Unlock next round if present
      if (roundNumber < 6) {
        const nextRoundIdx = progress.rounds.findIndex(r => r.roundNumber === roundNumber + 1);
        if (nextRoundIdx !== -1 && progress.rounds[nextRoundIdx].status === 'Locked') {
          progress.rounds[nextRoundIdx].status = 'Pending';
        }
      }
      
      progress.currentRound = Math.min(roundNumber + 1, 6);
    }

    const updatedProgress = await db.Interview.findOneAndUpdate(
      { user: req.user.id },
      {
        currentRound: progress.currentRound,
        rounds: progress.rounds,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      progress: updatedProgress,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error evaluating answer', error: err.message });
  }
});

export default router;
