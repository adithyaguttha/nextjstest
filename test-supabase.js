// Test the updated Supabase configuration
import { createClient } from '@supabase/supabase-js';

// Use the same initialization as in the main application
const supabaseUrl = 'https://ehzindoarppdatdqytyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoemluZG9hcnBwZGF0ZHF5dHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM1OTA0MDAsImV4cCI6MTk5OTE2NjQwMH0.fgSS7D9Gn0hWpRiEaY9wsiMrCulVZLx5-4jg18kmbvI';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present (not shown fully for security)' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connectivity by fetching a simple health check
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to check auth configuration
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Session data:', data);
    }
  } catch (err) {
    console.error('Exception when connecting to Supabase:', err);
  }
}

testConnection(); 