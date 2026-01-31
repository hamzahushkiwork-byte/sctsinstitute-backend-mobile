/**
 * Script to drop the Partners collection to fix schema mismatch
 * 
 * WARNING: This will delete ALL partner data!
 * Only run this if you don't have important partner data or want to start fresh.
 * 
 * Usage: node scripts/drop-partners-collection.js
 */

import mongoose from 'mongoose';
import config from '../src/config/env.js';

const MONGODB_URI = process.env.MONGODB_URI || config.mongodbUri || 'mongodb://localhost:27017/sctsinstitute';

async function dropPartnersCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const partnersCollection = db.collection('partners');

    // Check if collection exists
    const collections = await db.listCollections({ name: 'partners' }).toArray();
    
    if (collections.length === 0) {
      console.log('ℹ️  Partners collection does not exist. Nothing to drop.');
      await mongoose.disconnect();
      return;
    }

    // Count documents before deletion
    const count = await partnersCollection.countDocuments();
    console.log(`⚠️  Found ${count} partner document(s) in the collection.`);

    if (count > 0) {
      console.log('⚠️  WARNING: This will delete all partner data!');
      console.log('   If you want to keep the data, cancel this script and migrate instead.');
    }

    // Drop the collection
    await partnersCollection.drop();
    console.log('✅ Partners collection dropped successfully.');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n✅ Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Try creating a partner again');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 26) {
      console.log('ℹ️  Collection does not exist (this is fine)');
    }
    process.exit(1);
  }
}

dropPartnersCollection();
