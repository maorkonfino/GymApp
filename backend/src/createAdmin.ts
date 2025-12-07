import * as db from './database';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  const adminEmail = 'konfinoshlomi@gmail.com';
  const adminName = 'שלומי קונפינו';
  const adminPhone = '0500000000'; // Default phone, can be updated later
  const defaultPassword = 'Admin123456'; // Default password - CHANGE THIS AFTER FIRST LOGIN

  console.log('🔍 Checking if admin user exists...');
  
  // Check if user exists
  const existingUser = db.getUserByEmail(adminEmail);

  if (existingUser) {
    console.log('✅ User exists. Updating to admin role...');
    
    // Update existing user to admin
    db.updateUser(existingUser.id!, { 
      name: adminName, 
      email: adminEmail, 
      phone: adminPhone,
      role: 'admin' 
    });
    
    console.log('✅ User updated to admin successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Name:', adminName);
    console.log('🔑 Role: admin');
  } else {
    console.log('❌ User does not exist. Creating new admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Create new admin user
    const userId = db.createUser({
      email: adminEmail,
      name: adminName,
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Name:', adminName);
    console.log('📱 Phone:', adminPhone);
    console.log('🔑 Role: admin');
    console.log('🔐 Default Password:', defaultPassword);
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
  }

  console.log('\n🎉 Done!');
}

createAdminUser().catch(console.error);

