#!/usr/bin/env node

// Check if environment is properly configured
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Flow Web Setup...\n');

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLAUDE_API_KEY'
];

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your_')) {
    console.log(`❌ ${varName} is not set`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is configured`);
  }
});

// Check Supabase URL format
if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
  console.log('\n⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL should end with .supabase.co');
}

// Check Claude model
const model = process.env.DEFAULT_MODEL;
if (model) {
  console.log(`\n📝 Claude model: ${model}`);
} else {
  console.log('\n📝 Using default Claude model');
}

if (hasErrors) {
  console.log('\n❌ Please update your .env.local file with the missing values');
  console.log('📚 See the instructions above for where to find these values');
  process.exit(1);
} else {
  console.log('\n✅ Environment is properly configured!');
  console.log('🚀 You can now run: npm install');
} 