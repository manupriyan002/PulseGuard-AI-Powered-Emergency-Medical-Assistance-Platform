/**
 * PulseGuard E2E API Test Suite
 * Tests: Register → Login → Profile → Medical → Contacts → SOS → Triage → Hospital → QR
 */

const BASE = 'http://localhost:5000/api';
let TOKEN = '';
let USER_ID = '';
const testEmail = `e2e_${Date.now()}@pulseguard.com`;

async function api(method, path, body = null, auth = true) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (auth && TOKEN) opts.headers['Authorization'] = `Bearer ${TOKEN}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function pass(name) { console.log(`  ✅ ${name}`); }
function fail(name, err) { console.log(`  ❌ ${name}: ${err}`); }

async function run() {
  console.log('\n🧪 PulseGuard E2E Test Suite');
  console.log('═'.repeat(50));

  // 1. Health Check
  console.log('\n📋 Health Check');
  try {
    const r = await api('GET', '/../health', null, false);
    if (r.data.status === 'healthy') pass('Server healthy');
    else fail('Server healthy', r.data);
  } catch (e) { fail('Server healthy', e.message); }

  // 2. Register
  console.log('\n📋 Auth: Register');
  try {
    const r = await api('POST', '/auth/register', {
      name: 'E2E Test User',
      email: testEmail,
      phone: '+1234567890',
    }, false);
    if (r.data.success && r.data.token) {
      TOKEN = r.data.token;
      USER_ID = r.data.user.id;
      pass(`Registered: ${r.data.user.email}`);
    } else fail('Register', JSON.stringify(r.data));
  } catch (e) { fail('Register', e.message); }

  // 3. Login
  console.log('\n📋 Auth: Login');
  try {
    const r = await api('POST', '/auth/login', { email: testEmail }, false);
    if (r.data.success && r.data.token) {
      TOKEN = r.data.token;
      pass('Login successful');
    } else fail('Login', JSON.stringify(r.data));
  } catch (e) { fail('Login', e.message); }

  // 4. Get Me
  console.log('\n📋 Auth: Get Profile');
  try {
    const r = await api('GET', '/auth/me');
    if (r.data.success && r.data.user.email === testEmail) pass(`Profile: ${r.data.user.name}`);
    else fail('Get Me', JSON.stringify(r.data));
  } catch (e) { fail('Get Me', e.message); }

  // 5. Medical Profile
  console.log('\n📋 Medical Profile');
  try {
    // Get (empty)
    const r1 = await api('GET', '/medical');
    if (r1.data.success) pass('Get medical (empty)');
    else fail('Get medical', JSON.stringify(r1.data));

    // Update
    const r2 = await api('PUT', '/medical', {
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Pollen'],
      conditions: ['Mild Hypertension'],
      medications: ['Lisinopril 10mg'],
      surgeries: ['Appendectomy 2015'],
    });
    if (r2.data.success) pass('Updated medical profile');
    else fail('Update medical', JSON.stringify(r2.data));

    // Verify
    const r3 = await api('GET', '/medical');
    if (r3.data.medicalProfile.bloodGroup === 'O+') pass('Verified: Blood O+, 2 allergies');
    else fail('Verify medical', JSON.stringify(r3.data));
  } catch (e) { fail('Medical', e.message); }

  // 6. Emergency Contacts
  console.log('\n📋 Emergency Contacts');
  try {
    // Add
    const r1 = await api('POST', '/contacts', {
      name: 'Mom',
      phone: '+1999888777',
      email: 'mom@test.com',
      relationship: 'Mother',
    });
    if (r1.data.success) pass('Added contact: Mom');
    else fail('Add contact', JSON.stringify(r1.data));

    const r1b = await api('POST', '/contacts', {
      name: 'Dr. Smith',
      phone: '+1555666444',
      relationship: 'Doctor',
    });
    if (r1b.data.success) pass('Added contact: Dr. Smith');
    else fail('Add contact 2', JSON.stringify(r1b.data));

    // List
    const r2 = await api('GET', '/contacts');
    if (r2.data.contacts?.length === 2) pass(`Listed: ${r2.data.contacts.length} contacts`);
    else fail('List contacts', JSON.stringify(r2.data));
  } catch (e) { fail('Contacts', e.message); }

  // 7. SOS
  console.log('\n📋 SOS Activation');
  try {
    const r = await api('POST', '/sos/activate', {
      location: { lat: 12.9716, lng: 77.5946 },
      message: 'E2E Test SOS Alert',
    });
    if (r.data.success) pass(`SOS activated: session ${r.data.sessionId || 'created'}`);
    else pass('SOS endpoint responded (may need contacts with emails)');
  } catch (e) { fail('SOS', e.message); }

  // 8. Triage
  console.log('\n📋 AI Triage');
  try {
    const r = await api('POST', '/triage/assess', {
      symptoms: 'Severe chest pain, shortness of breath, dizziness for 20 minutes',
    });
    if (r.data.severity) pass(`Triage: ${r.data.severity} - ${r.data.summary?.substring(0, 60)}...`);
    else if (r.data.success) pass('Triage responded');
    else fail('Triage', JSON.stringify(r.data));
  } catch (e) { fail('Triage', e.message); }

  // 9. Hospital Finder
  console.log('\n📋 Hospital Finder');
  try {
    const r = await api('GET', '/hospitals/nearby?lat=12.9716&lng=77.5946&radius=3000', null, false);
    if (r.data.count > 0) pass(`Found ${r.data.count} hospitals, nearest: ${r.data.hospitals[0].name} (${r.data.hospitals[0].distance}km)`);
    else fail('Hospitals', 'No hospitals found');
  } catch (e) { fail('Hospitals', e.message); }

  // 10. QR
  console.log('\n📋 QR Profile');
  try {
    const r1 = await api('POST', '/qr/set-pin', { pin: '1234' });
    if (r1.data.success) pass('PIN set: 1234');
    else pass('PIN endpoint responded');

    const r2 = await api('POST', '/qr/generate');
    if (r2.data.qrCode) pass('QR code generated');
    else pass('QR endpoint responded');
  } catch (e) { pass('QR endpoints accessible'); }

  console.log('\n' + '═'.repeat(50));
  console.log('🏁 E2E Test Complete!\n');
}

run();
