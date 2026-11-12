"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E7E1F0] shadow-soft space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#211A40]">Something went wrong</h1>
          <p className="text-sm text-[#77738B]">
            An unexpected error occurred. Please try again or return to the main portal.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} variant="primary" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Try Again
          </Button>
          <Link href="/portal">
            <Button variant="secondary" leftIcon={<Home className="w-4 h-4" />}>
              Portal Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

