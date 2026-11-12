import { apiError } from '@/lib/api-error';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hostel from '@/models/Hostel';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const hostels = await Hostel.find().sort({ hostelName: 1, block: 1 }).lean();

    // Group blocks by hostel name
    const grouped = {};
    hostels.forEach((h) => {
      if (!grouped[h.hostelName]) {
        grouped[h.hostelName] = [];
      }
      grouped[h.hostelName].push({
        block: h.block,
        availableRooms: h.availableRooms || [],
      });
    });

    return NextResponse.json({
      success: true,
      data: grouped,
      raw: hostels,
    });
  } catch (err) {
    return apiError(err, 'Error fetching hostels');
  }
}
