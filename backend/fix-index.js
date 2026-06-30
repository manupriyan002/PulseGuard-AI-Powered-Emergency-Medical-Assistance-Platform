const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  
  // Drop the problematic index
  try {
    await db.collection('users').dropIndex('firebaseUid_1');
    console.log('Dropped old firebaseUid_1 index');
  } catch(e) {
    console.log('Index drop:', e.message);
  }
  
  // Rebuild with sparse
  await db.collection('users').createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
  console.log('Created new sparse unique index');
  
  // Fix existing users with empty firebaseUid
  const unsetOp = { firebaseUid: '' };
  const result = await db.collection('users').updateMany(
    { firebaseUid: '' },
    { '$unset': unsetOp }
  );
  console.log('Fixed', result.modifiedCount, 'users with empty firebaseUid');
  
  await mongoose.disconnect();
  console.log('Done!');
}
fix();
