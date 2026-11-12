/**
 * Staff Filter Options Controller
 * Returns dynamic hierarchical Hostel -> Block -> Room options for cascading dropdowns
 */

import User from '../models/User.js';

export const getFilterOptions = async (req, res, next) => {
  try {
    // Gather distinct hostel, block, room combinations from student users
    const students = await User.find({ role: 'student' })
      .select('hostel block roomNumber')
      .lean();

    // Default hostel structure in case DB is newly initialized
    const hierarchy = {};

    students.forEach((student) => {
      const hostel = student.hostel?.trim();
      const block = student.block?.trim();
      const room = student.roomNumber?.trim();

      if (!hostel) return;

      if (!hierarchy[hostel]) {
        hierarchy[hostel] = {};
      }

      if (block) {
        if (!hierarchy[hostel][block]) {
          hierarchy[hostel][block] = new Set();
        }
        if (room) {
          hierarchy[hostel][block].add(room);
        }
      }
    });

    // If no students in DB yet, seed a rich fallback hierarchy
    if (Object.keys(hierarchy).length === 0) {
      hierarchy['Cauvery Hostel'] = {
        'Block A': new Set(['101', '102', '103', '201', '202', '203']),
        'Block B': new Set(['101', '102', '201', '202']),
      };
      hierarchy['Ganga Hostel'] = {
        'Block A': new Set(['101', '102', '201']),
        'Block C': new Set(['301', '302', '303']),
      };
      hierarchy['Yamuna Hostel'] = {
        'North Wing': new Set(['101', '102', '104']),
        'South Wing': new Set(['201', '202']),
      };
    }

    // Convert Set to sorted arrays
    const formattedData = Object.keys(hierarchy).sort().map((hostelName) => {
      const blocksObj = hierarchy[hostelName];
      const blocks = Object.keys(blocksObj).sort().map((blockName) => ({
        name: blockName,
        rooms: Array.from(blocksObj[blockName]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      }));

      return {
        name: hostelName,
        blocks,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        hostels: formattedData,
        statuses: ['Placed', 'Collected', 'Washing', 'Ready', 'Delivered'],
        paymentStatuses: ['Unpaid', 'Partly Paid', 'Paid'],
      },
    });
  } catch (error) {
    next(error);
  }
};
