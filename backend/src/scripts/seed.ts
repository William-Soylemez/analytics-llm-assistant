// ABOUTME: Database seeding script for development data
// ABOUTME: Creates test users and sample data for local development

import bcrypt from 'bcrypt';
import { query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('Starting database seed...');

    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, subscription_tier, daily_digest_enabled)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      ['test@example.com', hashedPassword, 'free', false]
    );

    if (result.rows.length > 0) {
      console.log('✅ Test user created:', result.rows[0].email);
      console.log('   Email: test@example.com');
      console.log('   Password: TestPassword123!');
    } else {
      console.log('ℹ️  Test user already exists');
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();