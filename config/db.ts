// config/db.ts
import mongoose from 'mongoose';

let dbStatus = 'Disconnected';

export const getDbStatus = () => dbStatus;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI no está definido en el .env');
    dbStatus = 'Failed';
    return;
  }

  try {
    console.log('🔹 Intentando conectar a MongoDB con URI:', uri.substring(0, 50) + '...');
    await mongoose.connect(uri, {
      // Timeout para que falle rápido si no conecta
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB conectado correctamente');
    dbStatus = 'Connected';
  } catch (err: any) {
    console.error('❌ Falló la conexión a MongoDB:');
    console.error('Mensaje:', err.message);
    console.error(err);
    dbStatus = 'Failed';
  }
};

export default connectDB;
