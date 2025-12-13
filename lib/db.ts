import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }

  console.log('=> Creating new database connection...');
  try {
    const db = await mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds
      socketTimeoutMS: 45000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('=> Database connected successfully');
  } catch (error) {
    console.error('=> Error connecting to database:', error);
    throw error;
  }
}

export default connectToDatabase;
