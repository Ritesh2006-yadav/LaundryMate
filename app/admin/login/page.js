"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { switchDemoRole } = useAuth();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedId = adminId.trim();
    if (!trimmedId) {
      setError("Please enter your Administrative ID.");
      return;
    }

    if (!password) {
      setError("Please enter your master password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Valid credentials or administrative ID matching ADM prefix
      switchDemoRole("admin");
      window.location.href = "/admin/dashboard";
    }, 200);
  };

  return (
    <AuthCard
      title="Admin Console Login"
      subtitle="University Operations, Audits & Analytics Console"
      badge="Admin Portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Administrative ID"
          placeholder="e.g. ADM-LPU-01"
          icon={ShieldCheck}
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          required
        />

        <Input
          label="Master Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full text-base font-bold shadow-purple mt-2"
        >
          Sign In to Admin Dashboard
        </Button>

        <div className="text-center pt-2 text-xs text-[#6B6780]">
          Return to{" "}
          <Link
            href="/portal"
            className="text-[#6633CC] font-bold hover:underline"
          >
            Portal Selection
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

