#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Prisma schema for production build...');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

console.log('📄 Schema content preview:');
const lines = schemaContent.split('\n');
lines.slice(8, 12).forEach((line, index) => {
  console.log(`${9 + index}: ${line}`);
});

if (schemaContent.includes('provider = "postgresql"')) {
  console.log('✅ PostgreSQL provider found in schema');
} else if (schemaContent.includes('provider = "sqlite"')) {
  console.error('❌ SQLite provider found in schema - this should be PostgreSQL for production');
  process.exit(1);
} else {
  console.warn('⚠️  No database provider found in schema');
  process.exit(1);
}

console.log('🚀 Schema validation passed - proceeding with build');