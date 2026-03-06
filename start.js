#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting OYO Backend Services...\n');

// Start API server
const api = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'api'),
  stdio: 'inherit',
  shell: true
});

// Start Frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  api.kill();
  frontend.kill();
  process.exit(0);
});

api.on('close', (code) => {
  console.log(`API server exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
});