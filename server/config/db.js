import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isConnected = false;

// Fallback JSON persistence file
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'reviews.json');

// Ensure data directory and file exist
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export const connectDB = async () => {
  ensureDataFile();
  const uri = process.env.MONGO_URI;

  // Zero-config default: Use built-in persistent storage immediately
  if (!uri || uri.trim() === '' || uri === 'your_mongodb_connection_string') {
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ [DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    return false;
  }
};

export const getIsConnected = () => isConnected;

// File-based store helpers
export const readLocalReviews = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
};

export const writeLocalReviews = (reviews) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
};
