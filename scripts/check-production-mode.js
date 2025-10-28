// Script to check if app is running in production mode
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking production mode configuration...');

// Check if dist folder exists (indicates production build)
const distPath = path.join(__dirname, '..', 'dist');
const distExists = fs.existsSync(distPath);

console.log('📁 Dist folder exists:', distExists);

if (distExists) {
  // Check if index.html exists
  const indexPath = path.join(distPath, 'index.html');
  const indexExists = fs.existsSync(indexPath);
  
  console.log('📄 index.html exists:', indexExists);
  
  if (indexExists) {
    // Read and check index.html for development indicators
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const hasDevIndicators = indexContent.includes('localhost') || 
                            indexContent.includes('development') ||
                            indexContent.includes('dev-tools');
    
    console.log('🚫 Development indicators found:', hasDevIndicators);
    
    if (!hasDevIndicators) {
      console.log('✅ Production build verified - no development mode detected');
    } else {
      console.log('⚠️  Development mode detected in production build');
    }
  }
} else {
  console.log('❌ No production build found - run npm run build first');
}

// Check environment variables
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('📦 App packaged:', process.env.npm_package_name ? 'Yes' : 'No');



