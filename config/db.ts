import mongoose from 'mongoose';

let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };
let isDbConnected = false;

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI no definido!');
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000, // 5s timeout
    })
    .then(m => {
      isDbConnected = true;
      console.log(`✅ MongoDB Connected: ${m.connection.host}`);
      return m;
    })
    .catch(err => {
      isDbConnected = false;
      console.error('❌ MongoDB connection error (Vercel):');
      console.error(err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export const getDbStatus = (): 'Connected' | 'Failed' => isDbConnected ? 'Connected' : 'Failed';
export default connectDB;
