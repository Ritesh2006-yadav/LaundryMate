"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Hash,
  Building2,
  MapPin,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import { LPU_HOSTELS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

export default function StudentRegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    regNo: "",
    hostel: "",
    hostelBlock: "",
    roomNumber: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError("");
  };

  const validate = () => {
    // 1. Full Name
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      return "Please enter your full name (minimum 3 characters).";
    }

    // 2. LPU Registration Number
    const cleanRegNo = formData.regNo.trim().toUpperCase().replace(/^LPU/, "");
    if (!cleanRegNo || cleanRegNo.length < 6) {
      return "Please enter a valid LPU Registration Number (at least 6 characters).";
    }

    // 3. Hostel Name
    if (!formData.hostel) {
      return "Please select your assigned hostel.";
    }

    // 4. Hostel Block & Room Number (Side by side)
    if (!formData.hostelBlock.trim()) {
      return "Please enter your hostel block (e.g. Block B-32).";
    }
    if (!formData.roomNumber.trim()) {
      return "Please enter your room number (e.g. 210).";
    }

    // 5. University Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address (e.g. student@lpu.in).";
    }

    // 6. Mobile Number (10 digits)
    const cleanPhone = formData.phone.replace(/[\s\-\+\(\)]/g, "");
    if (!/^[0-9]{10,12}$/.test(cleanPhone)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    // 7. Password
    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    // 8. Confirm Password
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match. Please re-check.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await register({
        fullName: formData.fullName.trim(),
        regNo: formData.regNo.trim(),
        hostel: formData.hostel,
        hostelBlock: formData.hostelBlock.trim(),
        roomNumber: formData.roomNumber.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/student/dashboard");
        }, 800);
      } else {
        setError(result.error || "Failed to create account.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-[#211747]">Account Created!</h3>
        <p className="text-xs text-[#6B6780]">
          Welcome to LPU LMS, <span className="font-semibold text-[#211747]">{formData.fullName}</span>.
          Redirecting to your student dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Full Name */}
      <Input
        placeholder="Full Name"
        icon={User}
        value={formData.fullName}
        onChange={(e) => handleChange("fullName", e.target.value)}
        required
        className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* 2. LPU Registration Number */}
      <Input
        placeholder="LPU Registration Number"
        icon={Hash}
        value={formData.regNo}
        onChange={(e) => handleChange("regNo", e.target.value)}
        required
        className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* 3. Hostel Name Dropdown */}
      <div className="relative">
        <select
          value={formData.hostel}
          onChange={(e) => handleChange("hostel", e.target.value)}
          required
          className="w-full rounded-xl border border-[#E5E0F2] bg-white pl-10 pr-9 py-2.5 text-sm text-[#1A162B] outline-none focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>
            Select Hostel Name
          </option>
          {LPU_HOSTELS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <Building2 className="w-4 h-4 text-[#8F8A9E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F8A9E]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* 4. Hostel Block & Room Number (Side by side on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Hostel Block"
          icon={MapPin}
          value={formData.hostelBlock}
          onChange={(e) => handleChange("hostelBlock", e.target.value)}
          required
          className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
        />
        <Input
          placeholder="Room Number"
          icon={Hash}
          value={formData.roomNumber}
          onChange={(e) => handleChange("roomNumber", e.target.value)}
          required
          className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
        />
      </div>

      {/* 5. Email Address */}
      <Input
        type="email"
        placeholder="Email Address"
        icon={Mail}
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
        className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* 6. Phone Number */}
      <Input
        type="tel"
        placeholder="Phone Number"
        icon={Phone}
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        required
        className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* 7. Password with Eye Toggle */}
      <Input
        type="password"
        placeholder="Password"
        icon={Lock}
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        required
        className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* 8. Confirm Password with Eye Toggle */}
      <Input
        type="password"
        placeholder="Confirm Password"
        icon={Lock}
        value={formData.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        required
        className="py-2.5 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* Submit Button (Solid Purple matching Screen 04) */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#6633CC] to-[#5528B8] hover:from-[#5A25BF] hover:to-[#4A1FA3] text-white font-bold text-sm shadow-purple transition-all duration-200 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-4 cursor-pointer"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>Create Account</span>
        )}
      </button>

      {/* Bottom Switcher */}
      <div className="text-center pt-2 text-xs text-[#6B6780]">
        Already have an account?{" "}
        <Link
          href="/student/login"
          className="text-[#6633CC] font-bold hover:underline ml-1"
        >
          Sign In
        </Link>
      </div>
    </form>
  );
}
