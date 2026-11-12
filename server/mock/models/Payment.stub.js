/**
 * MOCK STUB: Payment Model
 * OWNED BY: Member 3
 * EXPECTED FIELDS:
 * - paymentNumber: String (Unique e.g., 'PAY-3001')
 * - order: ObjectId ref 'Order'
 * - student: ObjectId ref 'User'
 * - amount: Number (amount collected in this transaction)
 * - paymentMethod: 'Cash' | 'UPI' | 'Other'
 * - transactionRef: String (e.g. UPI transaction ID, bank reference)
 * - receivedBy: ObjectId ref 'User' (staff who accepted the payment)
 * - notes: String
 * - recordedAt: Date
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Payment amount must be at least 1'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Other'],
      required: true,
    },
    transactionRef: {
      type: String,
      trim: true,
      default: '',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
