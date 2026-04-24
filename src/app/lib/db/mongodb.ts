import { MongoClient } from 'mongodb';

import type { Listing } from '@/app/lib/definitions/listing.types';

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? 'leonettis';
const LISTINGS_COLLECTION = 'listings';

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  return uri;
}

type GlobalMongoCache = {
  clientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __mongoCache?: GlobalMongoCache;
};

if (!globalForMongo.__mongoCache) {
  globalForMongo.__mongoCache = {};
}

const mongoCache = globalForMongo.__mongoCache;

function getMongoClientPromise(): Promise<MongoClient> {
  if (!mongoCache.clientPromise) {
    const client = new MongoClient(getMongoUri());
    mongoCache.clientPromise = client.connect();
  }

  return mongoCache.clientPromise;
}

let indexesEnsured = false;

export async function getListingsCollection() {
  const client = await getMongoClientPromise();
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection<Listing>(LISTINGS_COLLECTION);

  if (!indexesEnsured) {
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ id: 1 }, { unique: true });
    indexesEnsured = true;
  }

  return collection;
}
