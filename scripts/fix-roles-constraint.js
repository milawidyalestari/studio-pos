const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oojmuyalhveuefjbwysj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vam11eWFsaHZldWVmamJ3eXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDYxOTcsImV4cCI6MjA2NTQ4MjE5N30.GqZRZJWhVkILCW0VaEiBQZ5C5_nHgGmj6vbOyk-VjrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRolesConstraint() {
  console.log('🔧 Fixing roles constraint issue...\n');

  try {
    // Step 1: Check current roles
    console.log('📋 Step 1: Checking current roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name');
      
    if (rolesError) {
      console.log('❌ Error accessing roles:', rolesError.message);
      return false;
    }
    
    console.log('✅ Current roles:', roles.length);
    roles.forEach(role => {
      console.log(`   - ${role.name} (ID: ${role.id})`);
    });

    // Step 2: Check employees with roles
    console.log('\n📋 Step 2: Checking employees with roles...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, nama, username, role')
      .not('role', 'is', null);
      
    if (empError) {
      console.log('❌ Error accessing employees:', empError.message);
    } else {
      console.log('✅ Employees with roles:', employees?.length || 0);
      employees?.forEach(emp => {
        console.log(`   - ${emp.nama} (${emp.username}) → ${emp.role}`);
      });
    }

    // Step 3: Check role permissions
    console.log('\n📋 Step 3: Checking role permissions...');
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('role')
      .order('role');
      
    if (permError) {
      console.log('❌ Error accessing role permissions:', permError.message);
    } else {
      const roleCounts = {};
      permissions?.forEach(perm => {
        roleCounts[perm.role] = (roleCounts[perm.role] || 0) + 1;
      });
      
      console.log('✅ Role permissions count:');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   - ${role}: ${count} permissions`);
      });
    }

    // Step 4: Ensure all default roles exist
    console.log('\n📋 Step 4: Ensuring default roles exist...');
    const defaultRoles = [
      { name: 'Administrator', description: 'Akses penuh ke seluruh sistem' },
      { name: 'Manager', description: 'Akses manajemen dan monitoring' },
      { name: 'Supervisor', description: 'Akses supervisor dan pengawasan' },
      { name: 'Cashier', description: 'Akses kasir dan transaksi' },
      { name: 'Designer', description: 'Akses fitur desain dan file' },
      { name: 'Staff', description: 'Akses staff umum' },
      { name: 'Viewer', description: 'Hanya bisa melihat data' }
    ];

    // Insert roles that don't exist
    for (const role of defaultRoles) {
      const { error: insertError } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'name' });
        
      if (insertError) {
        console.log(`❌ Error inserting role ${role.name}:`, insertError.message);
      } else {
        console.log(`✅ Role ${role.name} ensured`);
      }
    }

    // Step 5: Final verification
    console.log('\n📋 Step 5: Final verification...');
    const { data: finalRoles, error: finalError } = await supabase
      .from('roles')
      .select('*')
      .order('name');
      
    if (finalError) {
      console.log('❌ Error in final verification:', finalError.message);
      return false;
    }
    
    console.log('✅ Final roles count:', finalRoles.length);
    console.log('📋 Available roles:');
    finalRoles.forEach(role => {
      console.log(`   - ${role.name}`);
    });

    console.log('\n🎉 Roles issue fixed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Refresh the settings page in the application');
    console.log('   2. Check if roles appear in the dropdown');
    console.log('   3. Test creating/editing users with roles');

    return true;

  } catch (error) {
    console.log('❌ Fatal error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting roles constraint fix...\n');
  
  const success = await fixRolesConstraint();
  
  if (success) {
    console.log('\n✅ Roles constraint fix completed successfully!');
  } else {
    console.log('\n❌ Roles constraint fix failed. Manual intervention required.');
  }
}

main().catch(console.error);
