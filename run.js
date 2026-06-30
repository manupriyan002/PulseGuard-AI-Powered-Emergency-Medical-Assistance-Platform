const { spawn } = require('child_process');
const os = require('os');

// Find the local IPv4 address (Prioritizing Wi-Fi)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let fallback = 'localhost';
  
  // First, look specifically for a Wi-Fi connection
  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      }
    }
  }
  
  // Fallback: look for other connections but ignore VirtualBox specifically
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.56.')) continue; // Ignore VirtualBox host-only network
        return iface.address;
      }
    }
  }
  return fallback;
}

const localIP = getLocalIP();
console.log(`\n🔍 Detected Local Network IP: ${localIP}\n`);

// Start Backend
console.log('🚀 Starting Backend Server...');
const backend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: './backend',
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, HOST: '0.0.0.0' } // Bind backend to 0.0.0.0
});

backend.stdout.on('data', data => process.stdout.write(`[BACKEND] ${data}`));
backend.stderr.on('data', data => process.stderr.write(`[BACKEND ERR] ${data}`));

// Start Frontend
console.log('🚀 Starting Frontend Server...');
const frontend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: './frontend',
  stdio: 'pipe',
  shell: true,
  env: { 
    ...process.env, 
    // This tells Next.js to listen on all network interfaces
    HOSTNAME: '0.0.0.0',
    // Allow Next.js HMR to work on the mobile IP
    LOCAL_IP: localIP,
    // This dynamically points the frontend API calls to the local IP so mobile works!
    NEXT_PUBLIC_API_URL: `http://${localIP}:5000/api` 
  }
});

frontend.stdout.on('data', data => process.stdout.write(`[FRONTEND] ${data}`));
frontend.stderr.on('data', data => process.stderr.write(`[FRONTEND ERR] ${data}`));

// Print Mobile Links after 3 seconds to let servers start
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ PULSEGUARD IS RUNNING!');
  console.log('=' + '='.repeat(58) + '=');
  console.log('\n💻 To view on this PC:');
  console.log(`   http://localhost:3000\n`);
  console.log('📱 To view on your MOBILE DEVICE (must be on same WiFi):');
  console.log(`   Copy this link: \x1b[1m\x1b[32mhttp://${localIP}:3000\x1b[0m\n`);
  console.log('Press Ctrl+C to stop both servers.');
  console.log('='.repeat(60) + '\n');
}, 3000);

// Handle termination
process.on('SIGINT', () => {
  console.log('\nStopping servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});
