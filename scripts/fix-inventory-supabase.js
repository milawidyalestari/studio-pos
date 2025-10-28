const fs = require('fs');
const path = require('path');

// Read the Inventory.tsx file
const filePath = path.join(__dirname, '..', 'src', 'pages', 'Inventory.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all Supabase references with databaseService
const replacements = [
  // Update materials queries
  {
    from: /const { data, error } = await supabase\.from\('materials'\)\.update\(([^)]+)\)\.eq\('id', ([^)]+)\);/g,
    to: `try {
      await databaseService.update('materials', $2, $1);
    } catch (error) {
      console.error('Error updating material:', error);
    }`
  },
  
  // Update materials delete
  {
    from: /const { error } = await supabase\.from\('materials'\)\.delete\(\)\.eq\('id', ([^)]+)\);/g,
    to: `try {
      await databaseService.delete('materials', $1);
    } catch (error) {
      console.error('Error deleting material:', error);
    }`
  },
  
  // Update materials select
  {
    from: /const { data, error } = await supabase\.from\('materials'\)\.select\('\*'\);/g,
    to: `const data = await databaseService.query('materials');`
  },
  
  // Update materials upsert
  {
    from: /const { error } = await supabase\.from\('materials'\)\.upsert\(([^,]+), \{ onConflict: 'id' \}\);/g,
    to: `try {
      await databaseService.upsert('materials', $1);
    } catch (error) {
      console.error('Error upserting materials:', error);
    }`
  },
  
  // Update inventory_movements insert
  {
    from: /await supabase\.from\('inventory_movements'\)\.insert\(\{([^}]+)\}\);/g,
    to: `await databaseService.create('inventory_movements', {$1});`
  }
];

// Apply replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed Supabase references in Inventory.tsx');
