// Test Supabase connectivity
const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Get configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present (first 8 chars: ' + supabaseKey.substring(0, 8) + '...)' : 'Missing');

// Extract hostname from URL
const hostname = supabaseUrl.replace('https://', '');

// Test basic connectivity to Supabase
const options = {
  hostname: hostname,
  port: 443,
  path: '/auth/v1/health',
  method: 'GET',
  headers: {
    'apikey': supabaseKey
  }
};

console.log(`Testing connectivity to ${hostname}...`);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Successfully connected to Supabase!');
    } else {
      console.error('Failed to connect to Supabase with status code:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('Error connecting to Supabase:', error.message);
});

req.end(); 