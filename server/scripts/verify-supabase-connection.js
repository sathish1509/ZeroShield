import { supabaseAdmin, supabaseAnon } from '../src/config/supabase.js';

async function testConnection() {
  console.log('--- Testing Supabase Connection ---');
  console.log('Supabase URL:', process.env.SUPABASE_URL);

  try {
    // Test admin client connection (service role key)
    const { data: adminData, error: adminError } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true });
    if (adminError) {
      console.log('⚠️ Admin client check:', adminError.message);
    } else {
      console.log('✅ Supabase Admin Client (Service Role) connected successfully!');
    }

    // Test anon client connection (RLS active)
    const { data: anonData, error: anonError } = await supabaseAnon.from('users').select('count', { count: 'exact', head: true });
    console.log('✅ Supabase Anon Client (Public RLS) connected!');
    if (anonError) {
      console.log('   Note: RLS Policy Status:', anonError.message);
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
