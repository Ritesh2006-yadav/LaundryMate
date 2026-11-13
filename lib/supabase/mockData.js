// Clean role presets for role switching preview (no fake orders or complaints)
export const MOCK_CURRENT_STUDENT = {
  id: "std_preview",
  name: "University Student",
  regNo: "",
  email: "",
  phone: "",
  hostel: "",
  hostelBlock: "",
  roomNumber: "",
  blockRoom: "",
  gender: "Student",
  avatar: "ST",
  role: "student",
  walletBalance: 1000,
};

export const MOCK_CURRENT_STAFF = {
  id: "stf_001",
  name: "Laundry Operations Staff",
  staffId: "STF-8821",
  email: "staff@lpu.in",
  phone: "+91 98111 22334",
  assignedHub: "Central Laundry Complex - North Wing",
  avatar: "ST",
  role: "staff",
};

export const MOCK_CURRENT_ADMIN = {
  id: "adm_001",
  name: "System Administrator",
  adminId: "ADM-LPU-01",
  email: "admin@lpu.in",
  role: "admin",
  department: "Division of Student Welfare & Hostel Operations",
};

export const MOCK_ORDERS = [];
export const MOCK_COMPLAINTS = [];
export const MOCK_NOTIFICATIONS = [];
export const MOCK_INQUIRIES = [];
