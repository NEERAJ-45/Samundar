import mongoose from 'mongoose';

let globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: Record<string, { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null }>;
};

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = {};
}
const connectionsCache = globalWithMongoose.mongooseCache;

export async function connectToDatabase(customUri?: string) {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    return null;
  }

  if (!connectionsCache[uri]) {
    connectionsCache[uri] = { conn: null, promise: null };
  }

  const cached = connectionsCache[uri];

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    };

    if (customUri) {
      cached.promise = mongoose.createConnection(uri, opts).asPromise();
    } else {
      cached.promise = mongoose.connect(uri, opts).then(() => mongoose.connection);
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
