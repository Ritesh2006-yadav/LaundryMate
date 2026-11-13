import { supabase, isSupabaseConfigured } from "./client";

const LOCAL_STORAGE_STUDENTS_KEY = "lpu_lms_registered_students";
const LOCAL_STORAGE_STAFF_KEY = "lpu_lms_registered_staff";

// Default seed students (strictly empty: no fake accounts)
const INITIAL_STUDENTS = [];

// Pre-authorized staff roster created by administration
const INITIAL_STAFF = [
  {
    id: "stf_001",
    name: "Rohit Kumar",
    staffId: "STF-8821",
    email: "rohit.laundry@lpu.in",
    password: "staff@123",
    role: "staff",
    designation: "Plant Operator & Washing Specialist",
    hub: "Central Laundry Complex - North Wing",
    phone: "+91 98111 22334",
    avatar: "RK",
    shift: "Morning (07:00 AM - 03:30 PM)",
    status: "Active",
  },
  {
    id: "stf_002",
    name: "Satnam Singh",
    staffId: "STF-8822",
    email: "satnam.laundry@lpu.in",
    password: "staff@123",
    role: "staff",
    designation: "Senior Steam Presser & Quality Inspector",
    hub: "Central Laundry Complex - North Wing",
    phone: "+91 98111 22335",
    avatar: "SS",
    shift: "Evening (03:00 PM - 11:30 PM)",
    status: "Active",
  },
  {
    id: "stf_003",
    name: "Rajesh Sharma",
    staffId: "STF-8823",
    email: "rajesh.laundry@lpu.in",
    password: "staff@123",
    role: "staff",
    designation: "Hostel Pickup & Delivery Runner",
    hub: "BH-1 to BH-4 Zone",
    phone: "+91 98111 22336",
    avatar: "RS",
    shift: "General (08:00 AM - 05:00 PM)",
    status: "Active",
  },
];

/* ---------------- STUDENT STORAGE HELPERS ---------------- */

let cachedStudents = null;
let cachedStaff = null;

export const getStoredStudents = () => {
  if (cachedStudents) return cachedStudents;
  if (typeof window === "undefined") return INITIAL_STUDENTS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY);
    if (!data) {
      cachedStudents = INITIAL_STUDENTS;
      localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(data);
    cachedStudents = parsed;
    return parsed;
  } catch (err) {
    console.error("Failed to read students from storage", err);
    cachedStudents = INITIAL_STUDENTS;
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students) => {
  cachedStudents = students;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(students));
  } catch (err) {
    console.error("Failed to save students to storage", err);
  }
};

/* ---------------- STAFF STORAGE HELPERS ---------------- */

export const getStoredStaff = () => {
  if (cachedStaff) return cachedStaff;
  if (typeof window === "undefined") return INITIAL_STAFF;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
    if (!data) {
      cachedStaff = INITIAL_STAFF;
      localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(INITIAL_STAFF));
      return INITIAL_STAFF;
    }
    const parsed = JSON.parse(data);
    cachedStaff = parsed;
    return parsed;
  } catch (err) {
    console.error("Failed to read staff from storage", err);
    cachedStaff = INITIAL_STAFF;
    return INITIAL_STAFF;
  }
};

export const saveStoredStaff = (staffList) => {
  cachedStaff = staffList;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(staffList));
  } catch (err) {
    console.error("Failed to save staff to storage", err);
  }
};

export async function resolveStudentEmail(identifier) {
  const query = (identifier || "").trim();
  if (!query) return "";
  if (query.includes("@")) return query.toLowerCase();

  const cleanRegNo = query.toUpperCase().replace(/^LPU/, "");

  // 1. Check local storage first (instant client-side lookup)
  if (typeof window !== "undefined") {
    const students = getStoredStudents();
    const foundLocal = students.find(
      (s) =>
        s.regNo.toUpperCase().replace(/^LPU/, "") === cleanRegNo ||
        s.email.toLowerCase() === query.toLowerCase()
    );
    if (foundLocal?.email) return foundLocal.email.toLowerCase();
  }

  // 2. Query server resolver API for Supabase Auth accounts
  try {
    const res = await fetch("/api/auth/resolve-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: query }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.email) return data.email.toLowerCase();
    }
  } catch (err) {
    console.warn("Resolve student email API error:", err);
  }

  // 3. Fallback standard LPU email format
  return `${cleanRegNo}@lpu.in`.toLowerCase();
}

/* ---------------- STUDENT AUTH METHODS ---------------- */

export async function registerStudent({
  fullName,
  regNo,
  hostel,
  hostelBlock,
  roomNumber,
  email,
  phone,
  password,
}) {
  const cleanRegNo = regNo.trim().toUpperCase().replace(/^LPU/, "");
  const formattedRegNo = regNo.trim().toUpperCase();

  const existingStudents = getStoredStudents();
  const duplicate = existingStudents.find(
    (s) =>
      s.regNo === cleanRegNo ||
      s.regNo === formattedRegNo ||
      s.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (duplicate) {
    throw new Error(
      `An account with Registration Number (${regNo}) or Email (${email}) already exists.`
    );
  }

  const blockRoom = `${hostelBlock || "Block B"} / ${roomNumber || "101"}`;
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  const newStudent = {
    id: `std_${Date.now()}`,
    name: fullName.trim(),
    regNo: cleanRegNo,
    email: email.trim().toLowerCase(),
    password,
    hostel,
    hostelBlock,
    roomNumber,
    blockRoom,
    phone: phone.trim(),
    walletBalance: 1000.0,
    avatar: initials,
    role: "student",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          regNo: cleanRegNo,
          hostel,
          hostelBlock,
          roomNumber,
          email: email.trim().toLowerCase(),
          phone,
          password,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData?.error || "Registration failed on server.");
      }

      if (resData.user?.id) {
        newStudent.id = resData.user.id;
      }

      // Automatically sign in the freshly registered student
      try {
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
      } catch (signErr) {
        console.warn("[Register] Auto sign-in warning:", signErr.message);
      }
    } catch (apiErr) {
      if (
        apiErr.message.includes("already exists") ||
        apiErr.message.includes("Password") ||
        apiErr.message.includes("valid") ||
        apiErr.message.includes("minimum")
      ) {
        throw apiErr;
      }
      console.warn("[Register] Supabase registration notice:", apiErr.message);
    }
  }

  const updatedStudents = [newStudent, ...existingStudents];
  saveStoredStudents(updatedStudents);

  return newStudent;
}

export async function loginStudent({ regNoOrEmail, password }) {
  const query = (regNoOrEmail || "").trim();
  const cleanRegNo = query.toUpperCase().replace(/^LPU/, "");

  let targetEmail = query;
  if (!query.includes("@")) {
    targetEmail = await resolveStudentEmail(query);
  }

  let supabaseUser = null;
  let supabaseError = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        supabaseError = error;
      } else if (data?.user) {
        supabaseUser = data.user;
      }
    } catch (err) {
      supabaseError = err;
    }
  }

  if (supabaseUser) {
    let profile = null;
    try {
      const { data: profData } = await supabase
        .from("profiles")
        .select("id, full_name, reg_no, phone, hostel_name, hostel_block, room_number, wallet_balance, role")
        .eq("id", supabaseUser.id)
        .maybeSingle();
      profile = profData;
    } catch {
      // profiles table query fallback
    }

    const meta = supabaseUser.user_metadata || {};
    const sHostel = profile?.hostel_name || meta.hostel_name || meta.hostel || "";
    const sBlock = profile?.hostel_block || meta.hostel_block || meta.hostelBlock || "";
    const sRoom = profile?.room_number || meta.room_number || meta.roomNumber || "";
    const sPhone = profile?.phone || meta.phone || "";
    const sBlockRoom = (sBlock && sRoom) ? `${sBlock} / ${sRoom}` : (meta.block_room || "");
    const sName = profile?.full_name || meta.full_name || (supabaseUser.email ? supabaseUser.email.split("@")[0] : "Student");
    const sInitials = sName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "ST";

    const studentObj = {
      id: supabaseUser.id,
      name: sName,
      regNo: profile?.reg_no || meta.reg_no || cleanRegNo,
      email: supabaseUser.email,
      hostel: sHostel,
      hostelBlock: sBlock,
      roomNumber: sRoom,
      blockRoom: sBlockRoom,
      phone: sPhone,
      walletBalance: profile?.wallet_balance ?? 1000.0,
      avatar: sInitials,
      role: "student",
    };

    // Cache locally for offline resilience and fast loads
    const existing = getStoredStudents();
    const filtered = existing.filter((s) => s.email.toLowerCase() !== studentObj.email.toLowerCase());
    saveStoredStudents([studentObj, ...filtered]);

    return studentObj;
  }

  // Fallback to local storage (for pre-configured test accounts e.g. 12345678 / password123)
  const students = getStoredStudents();
  const found = students.find(
    (s) =>
      (s.regNo.toUpperCase().replace(/^LPU/, "") === cleanRegNo ||
        s.email.toLowerCase() === query.toLowerCase() ||
        s.email.toLowerCase() === targetEmail.toLowerCase()) &&
      s.password === password
  );

  if (found) {
    return found;
  }

  if (supabaseError) {
    if (supabaseError.message.includes("Invalid login credentials")) {
      throw new Error("Invalid Registration Number or Password. Please verify your credentials.");
    }
    if (supabaseError.message.includes("Email not confirmed")) {
      throw new Error("Please verify your email address before logging in, or check with administration.");
    }
    throw new Error(supabaseError.message);
  }

  throw new Error("Invalid Registration Number or Password. Please verify your credentials.");
}

export async function sendPasswordRecovery({ identifier }) {
  const query = identifier.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    let email = query;
    if (!query.includes("@")) {
      email = await resolveStudentEmail(query);
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/student/reset-password`,
    });
    if (error) throw new Error(error.message);
    return { success: true, email };
  }

  const students = getStoredStudents();
  const cleanRegNo = query.replace(/^lpu/, "");
  const found = students.find(
    (s) => s.regNo.toLowerCase() === cleanRegNo || s.email.toLowerCase() === query
  );

  if (!found) {
    throw new Error("No student account found matching this Registration Number or Email.");
  }

  return { success: true, email: found.email };
}

/* ---------------- SEPARATE STAFF AUTH METHODS ---------------- */

/**
 * Staff login strictly verified against authorized staff roster.
 * Public registration is prohibited.
 */
export async function loginStaff({ staffIdOrEmail, password }) {
  const query = staffIdOrEmail.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      let email = query;
      if (!query.includes("@")) {
        email = `${query}@lpu.in`;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        let profile = null;
        try {
          const { data: profData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();
          profile = profData;
        } catch {}

        if (profile?.role === "staff" || profile?.role === "admin" || data.user.user_metadata?.role === "staff") {
          return {
            id: data.user.id,
            name: profile?.full_name || data.user.user_metadata?.full_name || "Staff Member",
            staffId: profile?.reg_no || query.toUpperCase(),
            email: data.user.email,
            role: "staff",
            hub: "Central Laundry Plant",
            avatar: (profile?.full_name || data.user.user_metadata?.full_name || "ST").slice(0, 2).toUpperCase(),
          };
        }
      }
    } catch {
      // fallback to pre-provisioned roster
    }
  }

  // Local Staff Roster Verification (demo credentials like STF-8821 / staff@123)
  const staffList = getStoredStaff();
  const found = staffList.find(
    (st) =>
      (st.staffId.toLowerCase() === query || st.email.toLowerCase() === query) &&
      st.password === password
  );

  if (!found) {
    throw new Error(
      "Authentication Failed: Invalid Staff ID or Password. Note that staff accounts must be pre-provisioned by University Administration."
    );
  }

  return found;
}
