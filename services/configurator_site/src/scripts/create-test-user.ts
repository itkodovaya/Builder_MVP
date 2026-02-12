/**
 * Script to create a test user
 * 
 * Run with: npx ts-node src/scripts/create-test-user.ts
 */

import { userService } from '../services/user.service';

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'test12345';

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('📧 Email:', existingUser.email);
      console.log('🆔 User ID:', existingUser.id);
      console.log('🔑 Password:', password);
      return;
    }

    // Create user
    const user = await userService.createUser({ email, password });

    console.log('✅ User created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🆔 User ID:', user.id);
    console.log('🔑 Password:', password);
    console.log('\n📝 Данные для входа:');
    console.log('   Email: ' + email);
    console.log('   Password: ' + password);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

createTestUser();

