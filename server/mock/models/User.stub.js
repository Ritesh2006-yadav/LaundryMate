/**
 * MOCK STUB: User Model
 * OWNED BY: Member 3
 * EXPECTED FIELDS:
 * - name: String (Full name of student or staff)
 * - email: String (Unique email address)
 * - password: String (Hashed with bcrypt)
 * - role: String ('student' | 'staff' | 'admin')
 * - phone: String (Phone number)
 * - hostel: String (e.g., 'Cauvery', 'Ganga', 'Yamuna')
 * - block: String (e.g., 'A', 'B', 'C')
 * - roomNumber: String (e.g., '101', '204')
 * - matchPassword(enteredPassword): Promise<Boolean>
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    hostel: {
      type: String,
      trim: true,
      default: '', // Required for student
    },
    block: {
      type: String,
      trim: true,
      default: '', // Required for student
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '', // Required for student
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
