// config/db.ts
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
    cached.promise = mongoose.connect(process.env.MONGO_URI!).then(m => {
      isDbConnected = true;
      console.log(`✅ MongoDB Connected: ${m.connection.host}`);
      return m;
    }).catch(err => {
  isDbConnected = false;
  console.error('❌ MongoDB connection error:');
  if (err instanceof Error) {
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  } else {
    console.error('Error object:', err);
  }
  throw err; // asegura que la promesa falle
  });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// Función para usar en server.ts y endpoints
export const getDbStatus = (): 'Connected' | 'Failed' => {
  return isDbConnected ? 'Connected' : 'Failed';
};

export default connectDB;
