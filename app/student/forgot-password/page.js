"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { sendPasswordRecovery } from "@/lib/supabase/authService";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your Registration Number or University Email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await sendPasswordRecovery({ identifier });
      setSentEmail(res.email);
    } catch (err) {
      setError(err.message || "Failed to process recovery request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Recover your LPU LMS student account"
    >
      {sentEmail ? (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#211747]">
              Recovery Email Sent!
            </h3>
            <p className="text-xs text-[#6B6780] mt-1 leading-relaxed max-w-xs mx-auto">
              We have dispatched a secure password reset link to: <br />
              <span className="font-bold text-[#6633CC] break-all">{sentEmail}</span>
            </p>
          </div>

          <div className="pt-2">
            <Link href="/student/login">
              <Button variant="primary" size="md" className="w-full font-bold">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-[#6B6780] leading-relaxed">
            Enter your 8-digit LPU Registration Number or official student email
            address. We will send you instructions to reset your password.
          </p>

          <Input
            label="LPU Registration Number or Email"
            placeholder="e.g. 12345678 or student@lpu.in"
            icon={Mail}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full text-base font-bold shadow-purple mt-2"
          >
            Send Reset Instructions
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/student/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6633CC] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Login</span>
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}

