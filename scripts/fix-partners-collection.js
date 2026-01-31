/**
 * Script to fix Partners collection schema mismatch
 * Run this once to ensure the collection uses the correct schema
 * 
 * Usage: node scripts/fix-partners-collection.js
 */

import mongoose from 'mongoose';
import config from '../src/config/env.js';

const MONGODB_URI = process.env.MONGODB_URI || config.mongodbUri || 'mongodb://localhost:27017/sctsinstitute';

async function fixPartnersCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const partnersCollection = db.collection('partners');

    // Check if collection exists and has documents
    const count = await partnersCollection.countDocuments();
    console.log(`Found ${count} partner documents`);

    if (count > 0) {
      // Check if any documents have the old 'name' field
      const docsWithName = await partnersCollection.find({ name: { $exists: true } }).toArray();
      
      if (docsWithName.length > 0) {
        console.log(`Found ${docsWithName.length} documents with old 'name' field`);
        console.log('These documents need to be migrated or deleted.');
        console.log('Options:');
        console.log('1. Delete all partners: db.partners.deleteMany({})');
        console.log('2. Migrate: Update documents to use "title" instead of "name"');
      } else {
        console.log('No documents with old schema found. Collection is clean.');
      }
    } else {
      console.log('Collection is empty. Ready for new schema.');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPartnersCollection();
