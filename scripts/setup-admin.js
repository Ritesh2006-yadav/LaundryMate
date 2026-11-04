import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { default: connectDB } = await import('../src/lib/mongodb.js');
const { default: User } = await import('../src/models/User.js');
const mongoose = await import('mongoose');

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim();

if (!email || !password || !name) {
  console.error('Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD in .env.local before setup.');
  process.exit(1);
}
if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
  console.error('Use a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.');
  process.exit(1);
}

try {
  await connectDB();
  await User.createIndexes();
  const existingAdmin = await User.findOne({ role: 'admin' }).select('_id');
  if (existingAdmin) throw new Error('An admin account already exists; setup is one-time and will not create another.');
  const existingEmail = await User.findOne({ email }).select('_id');
  if (existingEmail) throw new Error('That email is already registered. Review the existing account or choose a new admin email.');

  await User.create({ name, email, password, role: 'admin' });
  console.info(`Admin account created for ${email}. The password was not displayed.`);
} catch (error) {
  if (error.code === 11000) {
    console.error('Admin setup stopped because a unique account already exists.');
  } else {
    console.error(`Admin setup failed: ${error.message}`);
  }
  process.exitCode = 1;
} finally {
  await mongoose.default.disconnect();
}
