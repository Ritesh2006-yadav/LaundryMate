"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield,
  HelpCircle,
  X,
  PhoneCall,
  Building2,
  ArrowRight,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useAuth } from "@/context/AuthContext";

export default function StaffLoginPage() {
  const router = useRouter();
  const { loginStaffMember } = useAuth();

  const [staffIdOrEmail, setStaffIdOrEmail] = useState("STF-8821");
  const [password, setPassword] = useState("staff@123");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!staffIdOrEmail.trim()) {
      setError("Please enter your Staff ID or Registered Email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginStaffMember({
        staffIdOrEmail: staffIdOrEmail.trim(),
        password,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/staff/dashboard");
        }, 600);
      } else {
        setError(result.error || "Invalid Staff ID or Password.");
      }
    } catch (err) {
      setError(
        err.message ||
          "Authentication failed. Note that staff accounts must be pre-provisioned by administration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F4FA] via-[#EAE7F5] to-[#DFD9F2] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Decorative top blue-violet gradient curve to visually distinguish staff portal */}
      <div className="absolute top-0 right-0 w-96 h-56 bg-gradient-to-bl from-blue-600/15 via-[#6633CC]/10 to-transparent rounded-bl-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-48 bg-gradient-to-tr from-purple-200/50 to-transparent rounded-tr-[140px] pointer-events-none" />

      {/* Top Logo with Staff Portal Subtitle */}
      <div className="w-full flex flex-col items-center justify-center mb-6 relative z-10">
        <Logo variant="dark" size="lg" subtitle="Staff Portal" href="/" />
      </div>

      {/* Main Staff Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#D3CEE8] shadow-card p-6 sm:p-8 relative z-10">
        {/* Operations Pill Badge */}
        <div className="flex items-center justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Central Laundry Plant • Staff Console
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#211747]">Staff Login</h2>
          <p className="text-xs text-[#6B6780] mt-1">
            Sign in to process wash cycles, manage inventory & resolve issues
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">
              Authenticated successfully! Loading staff dashboard...
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Staff ID or Registered Email */}
          <Input
            label="Staff ID or Registered Email"
            placeholder="e.g. STF-8821 or staff@lpu.in"
            icon={UserCheck}
            value={staffIdOrEmail}
            onChange={(e) => setStaffIdOrEmail(e.target.value)}
            required
          />

          {/* Field 2: Password with built-in show/hide toggle */}
          <Input
            label="Password / Access Code"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#4A4560] select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 border-gray-300 cursor-pointer"
              />
              Remember Me
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full text-base font-bold shadow-purple mt-2"
          >
            Sign In to Staff Console
          </Button>

          {/* Authorization Notice (Explaining No Public Registration) */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 text-[11px] text-[#6B6780] leading-relaxed mt-4 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#211747]">
                Restricted University Facility:
              </p>
              <p className="text-[#8F8A9E] mt-0.5">
                Staff accounts are provisioned exclusively by Campus
                Administration. Public staff registration is prohibited.
              </p>
            </div>
          </div>
        </form>

        {/* Alternative Navigation */}
        <div className="pt-4 border-t border-[#F0EDF8] mt-4 flex items-center justify-between text-xs text-[#6B6780]">
          <Link
            href="/portal"
            className="text-[#6633CC] font-semibold hover:underline"
          >
            ← Portal Directory
          </Link>

          <Link
            href="/student/login"
            className="text-[#4A4560] hover:text-[#211747] font-medium"
          >
            Resident Student? <span className="text-[#6633CC] font-bold">Student Login</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password / Help Modal */}
      {showForgotModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setShowForgotModal(false)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF8]">
                <div className="flex items-center gap-2 text-[#211747]">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base">Staff Access Recovery</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#4A4560] leading-relaxed">
                In accordance with university operational security protocols, staff
                password resets are managed by duty supervisors.
              </p>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Central Plant Administration Desk</span>
                </div>
                <p className="text-blue-800 text-[11px]">
                  North Wing Operational Control Room, Complex Block 32
                </p>
                <div className="flex items-center gap-2 text-[11px] text-blue-700 font-bold pt-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Intercom Ext: 4021 / 4022</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full font-bold"
                onClick={() => setShowForgotModal(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-[#8F8A9E] relative z-10">
        © 2026 Lovely Professional University • Division of Student Welfare
      </div>
    </div>
  );
}
