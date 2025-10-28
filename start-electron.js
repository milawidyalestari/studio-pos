// This file now simply imports and runs the main electron process
// All the IPC handlers and database logic are in electron/main.js

// Set development environment
process.env.NODE_ENV = 'development';

// Import and run the main electron process
require('./electron/main.js');
