import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Missing Item',
        'Damaged Item',
        'Improper Wash',
        'Late Delivery',
        'Wrong Items',
        'Pricing Issue',
        'Staff Behavior',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint details'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
      index: true,
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

complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export default Complaint;
