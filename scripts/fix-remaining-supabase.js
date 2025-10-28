const fs = require('fs');
const path = require('path');

// Read the Inventory.tsx file
const filePath = path.join(__dirname, '..', 'src', 'pages', 'Inventory.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all remaining Supabase references
const replacements = [
  // Replace supabase.from('inventory_movements').insert with databaseService.create
  {
    from: /await supabase\.from\('inventory_movements'\)\.insert\(\{([^}]+)\}\);/g,
    to: `await databaseService.create('inventory_movements', {$1});`
  },
  
  // Replace supabase.from('materials').update with databaseService.update
  {
    from: /await supabase\.from\('materials'\)\.update\(([^)]+)\)\.eq\('id', ([^)]+)\);/g,
    to: `await databaseService.update('materials', $2, $1);`
  },
  
  // Replace supabase.from('materials').delete with databaseService.delete
  {
    from: /const { error } = await supabase\.from\('materials'\)\.delete\(\)\.eq\('id', ([^)]+)\);/g,
    to: `try {
      await databaseService.delete('materials', $1);
    } catch (error) {
      console.error('Error deleting material:', error);
    }`
  },
  
  // Replace supabase.from('materials').select with databaseService.query
  {
    from: /const { data, error } = await supabase\.from\('materials'\)\.select\('\*'\);/g,
    to: `const data = await databaseService.query('materials');`
  },
  
  // Replace supabase.from('materials').upsert with databaseService.upsert
  {
    from: /const { error } = await supabase\.from\('materials'\)\.upsert\(([^,]+), \{ onConflict: 'id' \}\);/g,
    to: `try {
      await databaseService.upsert('materials', $1);
    } catch (error) {
      console.error('Error upserting materials:', error);
    }`
  }
];

// Apply replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed remaining Supabase references in Inventory.tsx');
