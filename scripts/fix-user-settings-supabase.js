const fs = require('fs');
const path = require('path');

// Read the UserSettings.tsx file
const filePath = path.join(__dirname, '..', 'src', 'components', 'settings', 'UserSettings.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all Supabase references with databaseService
const replacements = [
  // Replace supabase.from('role_permissions').delete with databaseService.delete
  {
    from: /const { error: deleteError } = await supabase\s*\.from\('role_permissions'\)\s*\.delete\(\)\s*\.eq\('role', role\);/g,
    to: `await databaseService.delete('role_permissions', { where: { role } });`
  },
  
  // Replace supabase.from('role_permissions').insert with databaseService.create
  {
    from: /const { error: insertError } = await supabase\s*\.from\('role_permissions'\)\s*\.insert\(newPermissions\);/g,
    to: `for (const permission of newPermissions) {
        await databaseService.create('role_permissions', permission);
      }`
  },
  
  // Replace supabase.from('role_permissions').select with databaseService.query
  {
    from: /const { data: verifyData, error: verifyError } = await supabase\s*\.from\('role_permissions'\)\s*\.select\('\*'\)\s*\.eq\('role', role\);/g,
    to: `const verifyData = await databaseService.query('role_permissions', {
        where: { role }
      });`
  },
  
  // Replace supabase.from('positions').select with databaseService.query
  {
    from: /supabase\.from\('positions'\)\.select\('\*'\)\.order\('name'\)\.then\(\(\{ data \}\) => \{/g,
    to: `databaseService.query('positions', {
        orderBy: { column: 'name', direction: 'asc' }
      }).then((data) => {`
  },
  
  // Replace supabase.from('employees').select with databaseService.query
  {
    from: /supabase\.from\('employees'\)\.select\('id, nama, username, role, status, password'\)\.order\('nama'\)\.then\(\(\{ data \}\) => \{/g,
    to: `databaseService.query('employees', {
        select: 'id, nama, username, role, status, password',
        orderBy: { column: 'nama', direction: 'asc' }
      }).then((data) => {`
  },
  
  // Replace supabase.from('roles').select with databaseService.query
  {
    from: /supabase\.from\('roles'\)\.select\('id, name'\)\.order\('name'\)\.then\(\(\{ data \}\) => \{/g,
    to: `databaseService.query('roles', {
        select: 'id, name',
        orderBy: { column: 'name', direction: 'asc' }
      }).then((data) => {`
  },
  
  // Replace supabase.from('employees').update with databaseService.update
  {
    from: /const { error } = await supabase\.from\('employees'\)\.update\(\{([^}]+)\}\)\.eq\('id', ([^)]+)\);/g,
    to: `try {
        await databaseService.update('employees', $2, {$1});
      } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
      }`
  },
  
  // Replace supabase.from('employees').update with databaseService.update (delete user)
  {
    from: /const { error } = await supabase\.from\('employees'\)\.update\(\{ username: null, role: null, password: null \}\)\.eq\('id', ([^)]+)\);/g,
    to: `try {
        await databaseService.update('employees', $1, { username: null, role: null, password: null });
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }`
  },
  
  // Replace supabase.from('role_permissions').select with databaseService.query
  {
    from: /const { data, error } = await supabase\s*\.from\('role_permissions'\)\s*\.select\('menu, action, allowed'\)\s*\.eq\('role', role\);/g,
    to: `const data = await databaseService.query('role_permissions', {
        select: 'menu, action, allowed',
        where: { role }
      });`
  }
];

// Apply replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.from, replacement.to);
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed Supabase references in UserSettings.tsx');
