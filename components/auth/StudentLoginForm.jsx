"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, AlertCircle, ArrowRight } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function StudentLoginForm({ onSwitchToRegister }) {
  const router = useRouter();
  const { login } = useAuth();
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedRegNo = regNo.trim();
    if (!trimmedRegNo) {
      setError("Please enter your LPU Registration Number or Email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        role: "student",
        credentials: { regNo: trimmedRegNo, password },
      });

      if (result.success) {
        router.push("/student/dashboard");
      } else {
        setError(result.error || "Invalid Registration Number or Password.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Field 1: LPU ID / Registration Number or Email */}
      <Input
        placeholder="LPU Reg No or Registered Email"
        icon={User}
        value={regNo}
        onChange={(e) => setRegNo(e.target.value)}
        required
        className="py-3 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* Field 2: Password with Show/Hide Eye Toggle (Matches Screen 03) */}
      <Input
        type="password"
        placeholder="Password"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="py-3 rounded-xl border-[#E5E0F2] text-sm placeholder:text-[#9E9AA8] focus:border-[#6633CC]"
      />

      {/* Remember Me & Forgot Password Options Row */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer text-[#4A4560] select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]/20 border-gray-300 cursor-pointer"
          />
          <span className="font-medium text-[#4A4560]">Remember Me</span>
        </label>

        <Link
          href="/student/forgot-password"
          className="text-[#6633CC] font-semibold hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Solid Purple Gradient Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#6633CC] to-[#5528B8] hover:from-[#5A25BF] hover:to-[#4A1FA3] text-white font-bold text-sm shadow-purple transition-all duration-200 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>Login</span>
        )}
      </button>

      {/* Centered OR Divider */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="border-t border-[#E5E0F2] w-full" />
        <span className="bg-white px-3 text-xs text-[#8F8A9E] font-medium lowercase absolute">
          or
        </span>
      </div>

      {/* Outlined Purple Button: Create New Account (Matches Screen 03) */}
      <Link href="/student/register" className="w-full block">
        <button
          type="button"
          className="w-full py-3 rounded-xl border-2 border-[#6633CC] text-[#6633CC] hover:bg-[#6633CC]/5 font-bold text-sm transition-all text-center block active:scale-[0.99]"
        >
          Create New Account
        </button>
      </Link>
    </form>
  );
}
