"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F3FA] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E7E1F0] shadow-soft space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#6633CC]/10 text-[#6633CC] flex items-center justify-center text-2xl font-bold">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#211A40]">Page Not Found</h1>
          <p className="text-sm text-[#77738B]">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/portal">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Go to Portal
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

