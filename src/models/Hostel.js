import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
  {
    hostelName: {
      type: String,
      required: [true, 'Please provide hostel name'],
      trim: true,
    },
    block: {
      type: String,
      required: [true, 'Please provide block identifier'],
      trim: true,
    },
    availableRooms: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

hostelSchema.index({ hostelName: 1, block: 1 }, { unique: true });

const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);

export default Hostel;
