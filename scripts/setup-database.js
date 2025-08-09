#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Studio POS - Database Setup Guide');
console.log('=====================================\n');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.log('⚠️  No .env.local file found');
  console.log('📝 Creating .env.local template...\n');
  
  const envTemplate = `# Database Configuration for Studio POS
VITE_USE_SUPABASE=false
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Alternative React App naming (if using Create React App)
REACT_APP_USE_SUPABASE=false
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here`;

  try {
    fs.writeFileSync(envLocalPath, envTemplate);
    console.log('✅ Created .env.local file');
  } catch (error) {
    console.log('❌ Failed to create .env.local file:', error.message);
  }
} else {
  console.log('✅ Found .env.local file');
}

console.log('\n📋 Setup Options:');
console.log('==================\n');

console.log('1️⃣  LOCAL STORAGE (Default - No setup required)');
console.log('   • Data stored in browser localStorage');
console.log('   • Perfect for development and testing');
console.log('   • No external dependencies');
console.log('   • Automatic sample data generation\n');

console.log('2️⃣  SUPABASE CLOUD DATABASE (Recommended)');
console.log('   • Data stored in cloud database');
console.log('   • Real-time synchronization');
console.log('   • Scalable and reliable');
console.log('   • Backup and recovery\n');

console.log('🔧 To setup Supabase:');
console.log('=====================\n');

console.log('1. Create Supabase project:');
console.log('   → Visit https://supabase.com');
console.log('   → Create new project');
console.log('   → Note your Project URL and Anon Key\n');

console.log('2. Setup database schema:');
console.log('   → Open Supabase Dashboard → SQL Editor');
console.log('   → Copy and run: database/supabase-setup.sql\n');

console.log('3. Configure environment:');
console.log('   → Edit .env.local file');
console.log('   → Set VITE_USE_SUPABASE=true');
console.log('   → Add your VITE_SUPABASE_URL');
console.log('   → Add your VITE_SUPABASE_ANON_KEY\n');

console.log('4. Restart development server:');
console.log('   → npm run dev\n');

console.log('📊 Monitoring:');
console.log('==============');
console.log('• Database status available in Finance page');
console.log('• Real-time connection monitoring');
console.log('• Automatic fallback to localStorage\n');

console.log('🔗 Useful Links:');
console.log('================');
console.log('• Supabase: https://supabase.com');
console.log('• Documentation: DATABASE_SETUP_GUIDE.md');
console.log('• SQL Schema: database/supabase-setup.sql\n');

console.log('💡 Quick Start:');
console.log('===============');
console.log('• For local development: npm run dev (no setup needed)');
console.log('• For cloud database: Follow steps above');
console.log('• Switch anytime by updating .env.local\n');

console.log('🎉 Happy coding!');