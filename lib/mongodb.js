import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "quickPortfolio";

if (!uri && process.env.VERCEL) {
  // On Vercel/Netlify you need a real DB; local JSON is not durable.
  // We throw only when something actually requests the DB.
}

/** @type {Promise<MongoClient> | null} */
let clientPromise = null;

function getClientPromise() {
  if (!uri) {
    const err = new Error(
      "MONGODB_URI is not set. Add it in your hosting provider environment variables.",
    );
    err.code = "MONGO_MISSING_URI";
    throw err;
  }

  // In dev, preserve the client across HMR reloads.
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__qpMongoClientPromise) {
      globalThis.__qpMongoClientPromise = new MongoClient(uri).connect();
    }
    return globalThis.__qpMongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(dbName);
}

