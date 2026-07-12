const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not loaded from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function verifyUserSync() {
  console.log('Querying public.users table for owner3.test@gmail.com...');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'owner3.test@gmail.com');

  if (error) {
    console.error('Error querying public.users:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('SUCCESS! Found user in public.users:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('FAILED: No user found in public.users with email owner3.test@gmail.com');
  }
}

verifyUserSync();
