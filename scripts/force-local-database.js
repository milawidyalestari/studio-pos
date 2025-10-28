// Script untuk memaksa aplikasi menggunakan database lokal
// Jalankan script ini untuk mengatur konfigurasi database ke local storage

console.log('🔧 Setting up local database configuration...');

// Simulasi localStorage untuk Node.js environment
if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: (key) => {
      // Simulasi localStorage
      return null;
    },
    setItem: (key, value) => {
      console.log(`Setting ${key}:`, value);
    }
  };
}

// Konfigurasi database lokal
const localDatabaseConfig = {
  mode: 'development',
  type: 'local',
  connection: {}
};

// Simpan konfigurasi ke localStorage
if (typeof window !== 'undefined') {
  localStorage.setItem('database_config', JSON.stringify(localDatabaseConfig));
  localStorage.setItem('database_setup_completed', 'true');
  localStorage.setItem('use_local_database', 'true');
  
  console.log('✅ Local database configuration saved to localStorage');
  console.log('📋 Configuration:', localDatabaseConfig);
} else {
  console.log('⚠️ This script should be run in browser environment');
  console.log('📋 Configuration to set:', localDatabaseConfig);
}

console.log('🎉 Local database configuration setup complete!');
console.log('🔄 Please refresh the application to use local database.');
