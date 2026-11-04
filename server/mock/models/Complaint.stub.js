/**
 * MOCK STUB: Complaint Model
 * OWNED BY: Member 3
 * EXPECTED FIELDS:
 * - complaintNumber: String (Unique reference e.g., 'CMP-2001')
 * - student: ObjectId ref 'User' (populated for student details)
 * - order: ObjectId ref 'Order' (populated for order info)
 * - category: 'Missing Item' | 'Damaged Item' | 'Improper Wash' | 'Late Delivery' | 'Wrong Items' | 'Other'
 * - description: String
 * - photoEvidence: Array of String URLs
 * - status: 'Open' | 'In Progress' | 'Resolved'
 * - staffResponse: String (reply written by staff)
 * - resolvedAt: Date
 * - resolvedBy: { id: ObjectId ref 'User', name: String }
 */

import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Missing Item',
        'Damaged Item',
        'Improper Wash',
        'Late Delivery',
        'Wrong Items',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    photoEvidence: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    staffResponse: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

const Complaint =
  mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export default Complaint;
