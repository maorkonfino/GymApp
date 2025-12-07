const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const updatePassword = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const email = 'maor.konfino@gmail.com';
    const newPassword = 'MaorGym1!';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Password hashed successfully');

    // Update the password in the database
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE LOWER(email) = LOWER($2) RETURNING name, email',
      [hashedPassword, email]
    );

    if (result.rows.length > 0) {
      console.log('✅ Password updated successfully for:', result.rows[0]);
      console.log('Email:', result.rows[0].email);
      console.log('Name:', result.rows[0].name);
      console.log('New password: MaorGym1!');
    } else {
      console.log('❌ User not found with email:', email);
    }

  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
};

updatePassword();

