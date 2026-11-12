import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'Request Submitted',
  'Pickup Scheduled',
  'Clothes Collected',
  'Processing',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const orderItemSchema = new mongoose.Schema({
  clothingType: {
    type: String,
    required: true,
    trim: true,
  },
  requestedCount: {
    type: Number,
    required: true,
    min: 1,
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
  unitPrice: {
    type: Number,
    default: 15,
  },
  specialInstructions: {
    type: String,
    trim: true,
    default: '',
  },
});

const statusHistorySchema = new mongoose.Schema({
  previousStatus: {
    type: String,
    default: '',
  },
  newStatus: {
    type: String,
    required: true,
  },
  updatedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Staff' },
    role: { type: String, default: 'staff' },
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
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
    items: [orderItemSchema],
    photos: [
      {
        type: String,
      },
    ],
    serviceType: {
      type: String,
      enum: ['regular', 'premium'],
      default: 'regular',
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
    pickupPreferences: {
      pickupDate: { type: String, default: '' },
      pickupTime: { type: String, default: '6:00 – 7:00 PM' },
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Request Submitted',
      index: true,
    },
    estimatedDelivery: {
      type: String,
      default: '',
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
        enum: ['Pending', 'Unpaid', 'Partially Paid', 'Paid', 'Failed'],
        default: 'Pending',
      },
      paymentMethod: {
        type: String,
        default: 'Pending',
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

orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
