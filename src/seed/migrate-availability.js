import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sctsinstitute';

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const Course = mongoose.model('Course', new mongoose.Schema({
            isAvailable: { type: Boolean, default: true }
        }, { strict: false }));

        console.log('Updating existing courses...');
        const result = await Course.updateMany(
            { isAvailable: { $exists: false } },
            { $set: { isAvailable: true } }
        );

        console.log(`Successfully updated ${result.modifiedCount} courses.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
