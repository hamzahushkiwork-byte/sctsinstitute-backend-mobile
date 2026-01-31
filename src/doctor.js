import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = resolve(join(__dirname, '..', '.env'));
dotenv.config({ path: envPath });

console.log('🔍 Backend Environment Doctor\n');
console.log(`📁 Resolved .env path: ${envPath}`);

const hasMongo = !!process.env.MONGODB_URI;
console.log(`✅ MONGODB_URI exists: ${hasMongo}`);

if (hasMongo) {
  const uri = process.env.MONGODB_URI;
  
  // Extract host (no password)
  const hostMatch = uri.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^/?]+)/);
  if (hostMatch) {
    console.log(`🔗 MongoDB host: ${hostMatch[1]}`);
  } else {
    const standardMatch = uri.match(/mongodb:\/\/[^@]+@([^/?]+)/);
    if (standardMatch) {
      console.log(`🔗 MongoDB host: ${standardMatch[1]}`);
    } else {
      console.log(`🔗 MongoDB URI format: ${uri.substring(0, 30)}...`);
    }
  }
  
  // Extract db name
  const dbMatch = uri.match(/\/\?|(\/[^/?]+)/);
  if (dbMatch && dbMatch[1]) {
    const dbName = dbMatch[1].replace('/', '');
    if (dbName && !dbName.includes('?')) {
      console.log(`📦 Database name: ${dbName}`);
    }
  }
  
  // Check for db name in query or default
  if (uri.includes('retryWrites')) {
    console.log(`⚙️  Connection options: retryWrites enabled`);
  }
}

console.log(`\n📋 Node version: ${process.version}`);
console.log(`📋 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`📋 PORT: ${process.env.PORT || '5000 (default)'}`);

if (!hasMongo) {
  console.log('\n❌ MONGODB_URI is missing. Check .env file.');
  process.exit(1);
} else {
  console.log('\n✅ Environment check passed.');
}
