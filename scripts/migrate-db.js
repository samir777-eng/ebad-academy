#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Running database migrations...');

try {
  // Run prisma db push to sync schema with database
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Database migrations completed successfully!');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  // Don't fail the build if migrations fail
  console.log('⚠️  Continuing build despite migration failure...');
}

