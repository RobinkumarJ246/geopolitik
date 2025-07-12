import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please add your MongoDB connection string to .env.local as MONGODB_URI");
}
const MONGODB_DB = process.env.MONGODB_DB;

/**
 * Cached connection across hot reloads in development to prevent
 * spawning too many connections.
 */
let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {});
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, {});
  clientPromise = client.connect();
}

export default clientPromise;
