const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function testSignup() {
  console.log('Attempting to create user via Admin API to catch trigger errors...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin_test123@gmail.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin Test',
      role: 'TENANT_ADMIN'
    }
  });

  if (error) {
    console.error('Signup failed with error:');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  } else {
    console.log('Signup succeeded!');
    console.log(data);
  }
}

testSignup();
