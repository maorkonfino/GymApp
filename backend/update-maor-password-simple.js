const { Client } = require('pg');
const bcrypt = require('bcrypt');

const updatePassword = async () => {
  // Connection string ישיר - תצטרך להחליף את זה ב-connection string שלך מ-Supabase
  const connectionString = process.env.DATABASE_URL || 'PASTE_YOUR_SUPABASE_CONNECTION_STRING_HERE';
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const email = 'maor.konfino@gmail.com';
    const newPassword = 'MaorGym1!';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed');

    // Update the password in the database
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2) RETURNING name, email',
      [hashedPassword, email]
    );

    if (result.rows.length > 0) {
      console.log('\n🎉 Password updated successfully!');
      console.log('📧 Email:', result.rows[0].email);
      console.log('👤 Name:', result.rows[0].name);
      console.log('🔐 New password: MaorGym1!');
      console.log('\nYou can now login with this password!');
    } else {
      console.log('❌ User not found with email:', email);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Done');
  }
};

updatePassword();

