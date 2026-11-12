/**
 * MOCK STUB: Order Model
 * OWNED BY: Member 3
 * EXPECTED FIELDS:
 * - orderNumber: String (Unique reference e.g., 'ORD-1001')
 * - student: ObjectId ref 'User' (Hostel, block, roomNumber populated)
 * - items: Array of { clothingType, requestedCount, collectedCount, isPremium, specialInstructions, unitPrice }
 * - photos: Array of String URLs (Uploaded by student - Member 3 image storage)
 * - status: 'Placed' | 'Collected' | 'Washing' | 'Ready' | 'Delivered'
 * - statusHistory: Array of { status, changedAt, changedBy: { id, name }, note }
 * - collectionDetails: { collectedBy: { id, name }, collectedAt, countDiscrepancy, staffNotes }
 * - isPremium: Boolean (Flag for dry-cleaning / delicate care)
 * - payment: { totalAmount, paidAmount, balance, status: 'Unpaid' | 'Partly Paid' | 'Paid', paymentHistory: [Payment ref] }
 */

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  clothingType: {
    type: String,
    required: true,
    trim: true,
  },
  requestedCount: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  collectedCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  specialInstructions: {
    type: String,
    trim: true,
    default: '',
  },
  unitPrice: {
    type: Number,
    default: 0,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Placed', 'Collected', 'Washing', 'Ready', 'Delivered'],
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  changedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Staff' },
  },
  note: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    photos: [
      {
        type: String, // Public image URLs
      },
    ],
    status: {
      type: String,
      enum: ['Placed', 'Collected', 'Washing', 'Ready', 'Delivered'],
      default: 'Placed',
    },
    statusHistory: [statusHistorySchema],
    collectionDetails: {
      collectedBy: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, default: '' },
      },
      collectedAt: {
        type: Date,
      },
      countDiscrepancy: {
        type: Boolean,
        default: false,
      },
      staffNotes: {
        type: String,
        default: '',
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    payment: {
      totalAmount: {
        type: Number,
        default: 0,
      },
      paidAmount: {
        type: Number,
        default: 0,
      },
      balance: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['Unpaid', 'Partly Paid', 'Paid'],
        default: 'Unpaid',
      },
      paymentHistory: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Payment',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast staff queries
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ isPremium: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
