import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URL;
    if (!mongodbUri) {
      console.error('MONGODB_URL is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB...');

    const adminEmail = 'admin@faithandfast.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = new User({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'Active',
      verifyEmail: true,
    });

    await adminUser.save();
    console.log('Admin account created successfully!');
    console.log('Email: admin@faithandfast.com');
    console.log('Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
