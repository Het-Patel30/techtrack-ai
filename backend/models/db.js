import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'db_local_backup.json');

// Initialize local DB directory if needed
const initLocalDb = () => {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({
      users: [],
      profiles: [],
      resumes: [],
      interviews: []
    }, null, 2));
  }
};

initLocalDb();

// Load & Save helpers for local DB
const readLocalDb = () => {
  try {
    initLocalDb();
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], profiles: [], resumes: [], interviews: [] };
  }
};

const writeLocalDb = (data) => {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to local DB:", err);
  }
};

// ----------------------------------------------------
// MongoDB / Mongoose Schemas & Models
// ----------------------------------------------------

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    portfolio: String
  },
  qualification: {
    highestDegree: String,
    institution: String,
    graduationYear: String,
    cgpa: String,
    coursework: [String]
  },
  targetJob: {
    jobTitle: String,
    experienceLevel: String,
    targetCompanyType: String
  },
  technicalSkills: {
    languages: [String],
    frameworks: [String],
    databases: [String],
    toolsCloud: [String],
    softSkills: [String]
  },
  updatedAt: { type: Date, default: Date.now }
});

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  atsScore: Number,
  atsKeywordsMatched: [String],
  atsKeywordsMissing: [String],
  summary: String,
  experienceBullets: [String],
  projectsBullets: [String],
  skillsFormatted: String,
  generatedAt: { type: Date, default: Date.now }
});

const InterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentRound: { type: Number, default: 1 },
  rounds: [{
    roundNumber: Number,
    roundName: String,
    status: { type: String, enum: ['Locked', 'Pending', 'Active', 'Completed'], default: 'Locked' },
    studyConcepts: [String],
    questions: [{
      questionId: String,
      questionText: String,
      userAnswer: { type: String, default: '' },
      feedback: { type: String, default: '' },
      score: { type: Number, default: 0 },
      isAnswered: { type: Boolean, default: false }
    }],
    resourceLinks: [{
      label: String,
      url: String,
      type: { type: String, enum: ['video', 'reading'], default: 'reading' }
    }]
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const MongoUser = mongoose.model('User', UserSchema);
export const MongoProfile = mongoose.model('Profile', ProfileSchema);
export const MongoResume = mongoose.model('Resume', ResumeSchema);
export const MongoInterview = mongoose.model('Interview', InterviewSchema);

export let isConnectedToMongo = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log("No MONGO_URI environment variable found. Using local JSON DB.");
    return false;
  }
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connection successful!");
    isConnectedToMongo = true;
    return true;
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to local JSON database. Error:", err.message);
    isConnectedToMongo = false;
    return false;
  }
}

// Generate unique string ID for local records
const genId = () => Math.random().toString(36).substring(2, 15);

// ----------------------------------------------------
// Repository Interface Wrapper
// ----------------------------------------------------
export const db = {
  User: {
    create: async (data) => {
      if (isConnectedToMongo) {
        return await MongoUser.create(data);
      } else {
        const dbData = readLocalDb();
        const newUser = { _id: genId(), createdAt: new Date(), ...data };
        dbData.users.push(newUser);
        writeLocalDb(dbData);
        return newUser;
      }
    },
    findOne: async (query) => {
      if (isConnectedToMongo) {
        return await MongoUser.findOne(query);
      } else {
        const dbData = readLocalDb();
        return dbData.users.find(u => {
          for (let key in query) {
            if (u[key] !== query[key]) return false;
          }
          return true;
        }) || null;
      }
    },
    findById: async (id) => {
      if (isConnectedToMongo) {
        return await MongoUser.findById(id);
      } else {
        const dbData = readLocalDb();
        return dbData.users.find(u => u._id === id) || null;
      }
    }
  },
  Profile: {
    findOne: async (query) => {
      const userId = query.user?.toString() || query.user;
      if (isConnectedToMongo) {
        return await MongoProfile.findOne({ user: userId });
      } else {
        const dbData = readLocalDb();
        return dbData.profiles.find(p => p.user === userId) || null;
      }
    },
    findOneAndUpdate: async (query, updateData, options = {}) => {
      const userId = query.user?.toString() || query.user;
      if (isConnectedToMongo) {
        return await MongoProfile.findOneAndUpdate({ user: userId }, updateData, { upsert: true, new: true });
      } else {
        const dbData = readLocalDb();
        let profileIdx = dbData.profiles.findIndex(p => p.user === userId);
        let profile = profileIdx !== -1 ? dbData.profiles[profileIdx] : null;

        if (!profile) {
          profile = { _id: genId(), user: userId, ...updateData, updatedAt: new Date() };
          dbData.profiles.push(profile);
        } else {
          profile = { ...profile, ...updateData, updatedAt: new Date() };
          dbData.profiles[profileIdx] = profile;
        }
        writeLocalDb(dbData);
        return profile;
      }
    }
  },
  Resume: {
    findOne: async (query) => {
      const userId = query.user?.toString() || query.user;
      if (isConnectedToMongo) {
        return await MongoResume.findOne({ user: userId });
      } else {
        const dbData = readLocalDb();
        return dbData.resumes.find(r => r.user === userId) || null;
      }
    },
    findOneAndUpdate: async (query, updateData, options = {}) => {
      const userId = query.user?.toString() || query.user;
      if (isConnectedToMongo) {
        return await MongoResume.findOneAndUpdate({ user: userId }, updateData, { upsert: true, new: true });
      } else {
        const dbData = readLocalDb();
        let resumeIdx = dbData.resumes.findIndex(r => r.user === userId);
        let resume = resumeIdx !== -1 ? dbData.resumes[resumeIdx] : null;

        if (!resume) {
          resume = { _id: genId(), user: userId, ...updateData, generatedAt: new Date() };
          dbData.resumes.push(resume);
        } else {
          resume = { ...resume, ...updateData, generatedAt: new Date() };
          dbData.resumes[resumeIdx] = resume;
        }
        writeLocalDb(dbData);
        return resume;
      }
    }
  },
  Interview: {
    findOne: async (query) => {
      const userId = query.user?.toString() || query.user;
      if (isConnectedToMongo) {
        return await MongoInterview.findOne({ user: userId });
      } else {
        const dbData = readLocalDb();
        return dbData.interviews.find(i => i.user === userId) || null;
      }
    },
    findOneAndUpdate: async (query, updateData, options = {}) => {
      const userId = query.user?.toString() || query.user;
      if (isConnectedToMongo) {
        return await MongoInterview.findOneAndUpdate({ user: userId }, updateData, { upsert: true, new: true });
      } else {
        const dbData = readLocalDb();
        let interviewIdx = dbData.interviews.findIndex(i => i.user === userId);
        let interview = interviewIdx !== -1 ? dbData.interviews[interviewIdx] : null;

        if (!interview) {
          interview = { _id: genId(), user: userId, ...updateData, updatedAt: new Date() };
          dbData.interviews.push(interview);
        } else {
          interview = { ...interview, ...updateData, updatedAt: new Date() };
          dbData.interviews[interviewIdx] = interview;
        }
        writeLocalDb(dbData);
        return interview;
      }
    }
  }
};
