export const APP_NAME = "LPU | LMS";
export const APP_SUBTITLE = "Hostel Laundry Management System";
export const UNIVERSITY_NAME = "Lovely Professional University";

export const ROLES = {
  STUDENT: "student",
  STAFF: "staff",
  ADMIN: "admin",
};

export const LPU_HOSTELS = [
  "BH-1 (Boys Hostel 1)",
  "BH-2 (Boys Hostel 2)",
  "BH-3 (Boys Hostel 3)",
  "BH-4 (Boys Hostel 4)",
  "BH-5 (Boys Hostel 5)",
  "BH-6 (Boys Hostel 6)",
  "BH-7 (Boys Hostel 7)",
  "BH-8 (Boys Hostel 8)",
  "GH-1 (Girls Hostel 1)",
  "GH-2 (Girls Hostel 2)",
  "GH-3 (Girls Hostel 3)",
  "GH-4 (Girls Hostel 4)",
  "GH-5 (Girls Hostel 5)",
  "GH-6 (Girls Hostel 6)",
  "Uni-Castle Resident",
  "Apartment Blocks",
];

export const LAUNDRY_SERVICES = [
  {
    id: "wash-only",
    name: "Wash Only",
    pricePerKg: 30,
    unit: "/kg",
    turnaround: "24-48 hrs",
    description: "Standard machine wash with premium detergent & fabric care.",
    icon: "Shirt",
  },
  {
    id: "wash-fold",
    name: "Wash & Fold",
    pricePerKg: 40,
    unit: "/kg",
    turnaround: "24-48 hrs",
    description: "Machine wash, dried and crisply folded ready to wear.",
    icon: "Layers",
    popular: true,
  },
  {
    id: "wash-iron",
    name: "Wash & Iron",
    pricePerKg: 50,
    unit: "/kg",
    turnaround: "48 hrs",
    description: "Washed, tumble dried and steam pressed to perfection.",
    icon: "Sparkles",
  },
  {
    id: "wash-dry-iron",
    name: "Wash, Dry & Iron",
    pricePerKg: 60,
    unit: "/kg",
    turnaround: "48-72 hrs",
    description: "Complete royal care with delicate drying and crisp steam ironing.",
    icon: "ShieldCheck",
  },
  {
    id: "iron-only",
    name: "Iron Only",
    pricePerKg: 20,
    unit: "/kg",
    turnaround: "24 hrs",
    description: "Heavy steam press for shirts, trousers and traditional attire.",
    icon: "Flame",
  },
];

export const ORDER_STAGES = [
  { key: "placed", label: "Request Placed", order: 1 },
  { key: "accepted", label: "Request Accepted", order: 2 },
  { key: "picked_up", label: "Clothes Picked Up", order: 3 },
  { key: "washing", label: "In Washing", order: 4 },
  { key: "drying", label: "In Drying", order: 5 },
  { key: "ironing", label: "Ironing", order: 6 },
  { key: "ready", label: "Ready for Delivery", order: 7 },
  { key: "delivered", label: "Delivered", order: 8 },
];

export const COMPLAINT_TYPES = [
  "Missing Clothes",
  "Damaged Clothes",
  "Wrong Clothes Delivered",
  "Clothes Not Delivered",
  "Poor Washing Quality",
  "Delayed Delivery",
  "Payment Issue",
  "Other",
];

export const COMPLAINT_STATUS_CONFIG = {
  Submitted: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  "Under Review": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  Investigation: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  "Under Investigation": {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  Resolved: {
    bg: "bg-[#DEF7EC] text-[#057A55] border-[#BCF0DA]",
    dot: "bg-[#057A55]",
  },
  Rejected: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export const STATUS_CONFIG = {
  "Request Placed": {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  "Request Accepted": {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  "Clothes Picked Up": {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "Picked Up": {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "In Washing": {
    bg: "bg-[#EBF5FF] text-[#2563EB] border-[#BFDBFE]",
    dot: "bg-[#2563EB]",
  },
  "In Process": {
    bg: "bg-[#EBF5FF] text-[#2563EB] border-[#BFDBFE]",
    dot: "bg-[#2563EB]",
  },
  "In Progress": {
    bg: "bg-[#EBF5FF] text-[#2563EB] border-[#BFDBFE]",
    dot: "bg-[#2563EB]",
  },
  "In Drying": {
    bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    dot: "bg-cyan-500",
  },
  Ironing: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "Ready for Delivery": {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  Delivered: {
    bg: "bg-[#DEF7EC] text-[#057A55] border-[#BCF0DA]",
    dot: "bg-[#057A55]",
  },
  Completed: {
    bg: "bg-[#DEF7EC] text-[#057A55] border-[#BCF0DA]",
    dot: "bg-[#057A55]",
  },
  New: {
    bg: "bg-[#FEF08A] text-[#854D0E] border-[#FDE047]",
    dot: "bg-[#CA8A04]",
  },
  Cancelled: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

