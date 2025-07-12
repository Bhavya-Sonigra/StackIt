import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const seedTempUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@stackit.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash('admin123', 10);
    const user = await User.create({
      username: 'admin', // Add username for local user
      name: 'Admin User', // Add proper name
      email: 'admin@stackit.com',
      password: hashed,
      isAdmin: true, // Set admin flag
      banned: false
    });

    console.log('✅ Admin user created successfully:');
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Is Admin:', user.isAdmin);
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

seedTempUser();