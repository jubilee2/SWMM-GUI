const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'swmm';
// MongoDB's Node driver uses a pooled connection with a default of
// 100 concurrent connections. Allow overriding via environment variables.
const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 100;
const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 0;

let client;
let db;

async function connectToDatabase() {
  if (db) return db;
  client = new MongoClient(uri, {
    maxPoolSize,
    minPoolSize,
  });
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database connection not established');
  }
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connectToDatabase, getDb, closeDb };
