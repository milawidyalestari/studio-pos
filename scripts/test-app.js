// Script to test if app is working properly
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Studio POS Application...');

// Check if dist folder exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ Dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('❌ index.html not found in dist folder.');
  process.exit(1);
}

// Read and analyze index.html
const indexContent = fs.readFileSync(indexPath, 'utf8');

console.log('✅ Dist folder exists');
console.log('✅ index.html exists');

// Check for common issues
const issues = [];

// Check if HTML is empty
if (indexContent.trim().length < 100) {
  issues.push('HTML content seems too short');
}

// Check if React app is loaded
if (!indexContent.includes('root')) {
  issues.push('React root element not found');
}

// Check if main JS file is referenced
if (!indexContent.includes('.js')) {
  issues.push('JavaScript files not referenced');
}

// Check if CSS is referenced
if (!indexContent.includes('.css')) {
  issues.push('CSS files not referenced');
}

if (issues.length > 0) {
  console.log('⚠️  Potential issues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('✅ HTML structure looks good');
}

// Check for development indicators
const devIndicators = [];
if (indexContent.includes('localhost')) {
  devIndicators.push('localhost references found');
}
if (indexContent.includes('development')) {
  devIndicators.push('development mode references found');
}

if (devIndicators.length > 0) {
  console.log('⚠️  Development indicators found:');
  devIndicators.forEach(indicator => console.log(`   - ${indicator}`));
} else {
  console.log('✅ No development indicators found');
}

// Check file sizes
const files = fs.readdirSync(distPath);
const jsFiles = files.filter(f => f.endsWith('.js'));
const cssFiles = files.filter(f => f.endsWith('.css'));

console.log(`📊 Build statistics:`);
console.log(`   - Total files: ${files.length}`);
console.log(`   - JS files: ${jsFiles.length}`);
console.log(`   - CSS files: ${cssFiles.length}`);

// Check for large files (potential issues)
jsFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  if (sizeKB > 1000) {
    console.log(`   - Large JS file: ${file} (${sizeKB}KB)`);
  }
});

console.log('');
console.log('🎯 Test completed!');
console.log('');
console.log('To test the app:');
console.log('1. Run: npm run electron:dev');
console.log('2. Check if app loads without blank page');
console.log('3. Check if DevTools are not open automatically');
console.log('4. Check if you can navigate to different pages');



