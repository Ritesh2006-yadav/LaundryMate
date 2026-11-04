import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  registrationNumber: { type: String, trim: true, uppercase: true, required: function () { return this.role === 'student'; } },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
  },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student', required: true },
  phone: { type: String, trim: true, default: '', maxlength: 30 },
  hostel: { type: String, trim: true, required: function () { return this.role === 'student'; } },
  block: { type: String, trim: true, required: function () { return this.role === 'student'; } },
  roomNumber: { type: String, trim: true, required: function () { return this.role === 'student'; } },
}, { timestamps: true });

userSchema.index({ registrationNumber: 1 }, {
  unique: true,
  partialFilterExpression: { registrationNumber: { $type: 'string' } },
  name: 'uniq_user_registration_number',
});
userSchema.index({ role: 1 }, {
  unique: true,
  partialFilterExpression: { role: 'admin' },
  name: 'one_admin_account',
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
