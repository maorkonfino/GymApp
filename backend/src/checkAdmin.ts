import * as db from './database';

function checkAdmin() {
  const adminEmail = 'konfinoshlomi@gmail.com';
  
  console.log('🔍 Checking admin user...\n');
  
  const user = db.getUserByEmail(adminEmail);
  
  if (user) {
    console.log('✅ User found:');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('📱 Phone:', user.phone);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    
    if (user.role === 'admin') {
      console.log('\n🎉 User is an ADMIN! ✅');
    } else {
      console.log('\n⚠️  User is NOT an admin. Role:', user.role);
    }
  } else {
    console.log('❌ User not found');
  }
}

checkAdmin();

