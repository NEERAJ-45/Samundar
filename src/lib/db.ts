import mongoose from 'mongoose';

let globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: Record<string, { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }>;
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
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
