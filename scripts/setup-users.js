// Script untuk menambahkan users ke localStorage
const users = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    email: 'admin@studio-pos.com',
    role: 'Administrator',
    full_name: 'Administrator',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kasir1',
    username: 'kasir1',
    password: 'kasir123',
    email: 'kasir1@studio-pos.com',
    role: 'Kasir',
    full_name: 'Kasir Satu',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kasir2',
    username: 'kasir2',
    password: 'kasir123',
    email: 'kasir2@studio-pos.com',
    role: 'Kasir',
    full_name: 'Kasir Dua',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'manager',
    username: 'manager',
    password: 'manager123',
    email: 'manager@studio-pos.com',
    role: 'Manager',
    full_name: 'Manager',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

console.log('🔧 Setting up users for localStorage...');
console.log('📋 Users to be added:');
users.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user.username} (${user.full_name}) - ${user.role}`);
});

// Simpan ke localStorage (ini akan dijalankan di browser)
if (typeof window !== 'undefined') {
  localStorage.setItem('studio_pos_users', JSON.stringify(users));
  console.log('✅ Users saved to localStorage');
} else {
  console.log('📝 Copy this JSON to browser console:');
  console.log(JSON.stringify(users, null, 2));
  console.log('\n🔧 Then run: localStorage.setItem("studio_pos_users", JSON.stringify(users))');
}

module.exports = users;

