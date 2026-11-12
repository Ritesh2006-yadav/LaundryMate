"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MOCK_CURRENT_STUDENT, MOCK_CURRENT_STAFF, MOCK_CURRENT_ADMIN } from "@/lib/supabase/mockData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { loginStudent, registerStudent, loginStaff } from "@/lib/supabase/authService";

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  loginStaffMember: async () => {},
  register: async () => {},
  logout: () => {},
  switchDemoRole: () => {},
  updateUserProfile: async () => {},
  refreshUserProfile: async () => {},
});

export function AuthProvider({ children }) {
  // Synchronous cache read for instantaneous 0ms client hydration
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lpu_lms_current_user");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return MOCK_CURRENT_STUDENT;
  });

  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lpu_lms_role") || "student";
    }
    return "student";
  });

  const [loading, setLoading] = useState(false);

  // Sync latest user details from Supabase session
  const refreshUserProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const authUser = session.user;
      const meta = authUser.user_metadata || {};

      let profileData = null;
      let studentData = null;

      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();
        profileData = prof;
      } catch {}

      if (meta.role === "student" || profileData?.role === "student") {
        try {
          const { data: std } = await supabase
            .from("students")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();
          studentData = std;
        } catch {}
      }

      const activeRole = profileData?.role || meta.role || role || "student";
      const cleanReg = profileData?.reg_no || studentData?.reg_no || meta.reg_no || "12413882";
      const blockRoomStr = studentData?.hostel_block && studentData?.room_number
        ? `${studentData.hostel_block} / ${studentData.room_number}`
        : meta.block_room || "A / 808";

      const refreshedUser = {
        id: authUser.id,
        name: profileData?.full_name || meta.full_name || "Akshay Gupta",
        regNo: cleanReg,
        staffId: cleanReg,
        email: authUser.email,
        phone: profileData?.phone || meta.phone || "+91 81076 15285",
        hostel: studentData?.hostel_id || meta.hostel_name || "BH-5 (Boys Hostel 5)",
        hostelBlock: studentData?.hostel_block || meta.hostelBlock || "Block A",
        roomNumber: studentData?.room_number || meta.roomNumber || "808",
        blockRoom: blockRoomStr,
        walletBalance: studentData?.wallet_balance ?? profileData?.wallet_balance ?? 1000.0,
        role: activeRole,
        avatar: (profileData?.full_name || meta.full_name || "AG").slice(0, 2).toUpperCase(),
      };

      setUser(refreshedUser);
      setRole(activeRole);
      localStorage.setItem("lpu_lms_current_user", JSON.stringify(refreshedUser));
      localStorage.setItem("lpu_lms_role", activeRole);
    } catch (err) {
      console.warn("[Auth] Failed to refresh user profile:", err.message);
    }
  }, [role]);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            refreshUserProfile();
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setRole(null);
          localStorage.removeItem("lpu_lms_role");
          localStorage.removeItem("lpu_lms_current_user");
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshUserProfile]);

  const switchDemoRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem("lpu_lms_role", newRole);
    let targetUser = MOCK_CURRENT_STUDENT;
    if (newRole === "staff") targetUser = MOCK_CURRENT_STAFF;
    else if (newRole === "admin") targetUser = MOCK_CURRENT_ADMIN;

    setUser(targetUser);
    localStorage.setItem("lpu_lms_current_user", JSON.stringify(targetUser));
  };

  const login = async ({ role: requestedRole = "student", credentials }) => {
    setLoading(true);
    try {
      if (requestedRole === "student") {
        const student = await loginStudent({
          regNoOrEmail: credentials.regNo || credentials.email,
          password: credentials.password,
        });
        setUser(student);
        setRole("student");
        localStorage.setItem("lpu_lms_role", "student");
        localStorage.setItem("lpu_lms_current_user", JSON.stringify(student));
        return { success: true, user: student };
      } else if (requestedRole === "staff") {
        const staff = await loginStaff({
          staffIdOrEmail: credentials.staffId || credentials.email,
          password: credentials.password,
        });
        setUser(staff);
        setRole("staff");
        localStorage.setItem("lpu_lms_role", "staff");
        localStorage.setItem("lpu_lms_current_user", JSON.stringify(staff));
        return { success: true, user: staff };
      } else {
        switchDemoRole(requestedRole);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginStaffMember = async ({ staffIdOrEmail, password }) => {
    return login({
      role: "staff",
      credentials: { staffId: staffIdOrEmail, password },
    });
  };

  const register = async (studentData) => {
    setLoading(true);
    try {
      const newStudent = await registerStudent(studentData);
      setUser(newStudent);
      setRole("student");
      localStorage.setItem("lpu_lms_role", "student");
      localStorage.setItem("lpu_lms_current_user", JSON.stringify(newStudent));
      return { success: true, user: newStudent };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("lpu_lms_current_user", JSON.stringify(updatedUser));

    // Sync to Supabase if logged in
    if (isSupabaseConfigured() && user?.id && !user.id.startsWith("std_")) {
      try {
        if (updates.phone || updates.name) {
          await supabase
            .from("profiles")
            .update({
              phone: updates.phone,
              full_name: updates.name,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }
        if (updates.hostelBlock || updates.roomNumber) {
          await supabase
            .from("students")
            .update({
              hostel_block: updates.hostelBlock,
              room_number: updates.roomNumber,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }
      } catch (err) {
        console.warn("[Auth] Failed to sync profile update to Supabase:", err.message);
      }
    }
    return updatedUser;
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setRole(null);
    localStorage.removeItem("lpu_lms_role");
    localStorage.removeItem("lpu_lms_current_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        loginStaffMember,
        register,
        logout,
        switchDemoRole,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
