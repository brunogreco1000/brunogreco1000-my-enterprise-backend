import mongoose from 'mongoose';

let dbStatus = 'Not connected';

export const getDbStatus = () => dbStatus;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    dbStatus = 'Failed';
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    console.log('🔹 Conectando a MongoDB con URI:', process.env.MONGO_URI.substring(0, 40) + '...');
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5 segundos
      socketTimeoutMS: 45000, // 45 segundos
    });
    dbStatus = 'Connected';
    console.log('✅ MongoDB conectado correctamente');
  } catch (err) {
    dbStatus = 'Failed';
    console.error('❌ Error conectando a MongoDB:', err);
    throw err;
  }
};

export default connectDB;
