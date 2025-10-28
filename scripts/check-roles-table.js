const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRolesTable() {
  console.log('🔍 Checking roles table and data...\n');

  try {
    // Check if roles table exists and has data
    console.log('📋 Test 1: Checking roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name');
      
    if (rolesError) {
      console.log('❌ Error accessing roles table:', rolesError.message);
      
      if (rolesError.message.includes('relation') || rolesError.message.includes('does not exist')) {
        console.log('   → Roles table does not exist');
        console.log('   → Need to create roles table');
        return false;
      } else if (rolesError.message.includes('permission denied')) {
        console.log('   → Permission denied - RLS issue');
        return false;
      }
    } else {
      console.log('✅ Roles table accessible');
      console.log('📊 Roles count:', roles?.length || 0);
      
      if (roles && roles.length > 0) {
        console.log('📋 Available roles:');
        roles.forEach(role => {
          console.log(`   - ${role.name} (ID: ${role.id})`);
        });
      } else {
        console.log('⚠️ No roles found in table');
        console.log('   → Need to insert default roles');
        return false;
      }
    }

    // Check role_permissions table
    console.log('\n📋 Test 2: Checking role_permissions table...');
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('*')
      .limit(5);
      
    if (permError) {
      console.log('❌ Error accessing role_permissions table:', permError.message);
    } else {
      console.log('✅ Role permissions table accessible');
      console.log('📊 Permissions count:', permissions?.length || 0);
    }

    // Check employees table for role references
    console.log('\n📋 Test 3: Checking employees with roles...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, nama, username, role')
      .not('role', 'is', null)
      .limit(10);
      
    if (empError) {
      console.log('❌ Error accessing employees table:', empError.message);
    } else {
      console.log('✅ Employees table accessible');
      console.log('📊 Employees with roles:', employees?.length || 0);
      
      if (employees && employees.length > 0) {
        console.log('📋 Employees and their roles:');
        employees.forEach(emp => {
          console.log(`   - ${emp.nama} (${emp.username}) → ${emp.role}`);
        });
      }
    }

    return true;

  } catch (error) {
    console.log('❌ Fatal error:', error.message);
    return false;
  }
}

async function createDefaultRoles() {
  console.log('\n🔧 Creating default roles...\n');

  try {
    // Insert default roles
    const defaultRoles = [
      { name: 'Administrator', description: 'Akses penuh ke seluruh sistem' },
      { name: 'Manager', description: 'Akses manajemen dan monitoring' },
      { name: 'Supervisor', description: 'Akses supervisor dan pengawasan' },
      { name: 'Cashier', description: 'Akses kasir dan transaksi' },
      { name: 'Designer', description: 'Akses fitur desain dan file' },
      { name: 'Staff', description: 'Akses staff umum' },
      { name: 'Viewer', description: 'Hanya bisa melihat data' }
    ];

    const { data, error } = await supabase
      .from('roles')
      .insert(defaultRoles)
      .select();

    if (error) {
      console.log('❌ Error creating roles:', error.message);
      return false;
    }

    console.log('✅ Default roles created successfully');
    console.log('📋 Created roles:');
    data.forEach(role => {
      console.log(`   - ${role.name} (ID: ${role.id})`);
    });

    return true;

  } catch (error) {
    console.log('❌ Fatal error creating roles:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting roles table diagnosis...\n');
  
  const rolesExist = await checkRolesTable();
  
  if (!rolesExist) {
    console.log('\n🔧 Attempting to fix roles table...');
    const created = await createDefaultRoles();
    
    if (created) {
      console.log('\n✅ Roles table fixed! Please refresh the settings page.');
    } else {
      console.log('\n❌ Failed to fix roles table. Manual intervention required.');
    }
  } else {
    console.log('\n✅ Roles table is working correctly!');
  }
}

main().catch(console.error);
