// ABOUTME: Jest test setup and global configuration
// ABOUTME: Runs before all tests to configure the testing environment

import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
});