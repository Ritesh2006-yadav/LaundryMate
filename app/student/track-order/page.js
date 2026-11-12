"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchCheck, PackagePlus } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";

function TrackOrderRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idFromQuery = searchParams.get("id");
  const { user } = useAuth();
  const { getUserOrders, loading } = useLaundryOrders();

  const userOrders = getUserOrders(user);
  const targetId = idFromQuery || (userOrders.length > 0 ? userOrders[0].id : null);

  useEffect(() => {
    if (targetId) {
      router.replace(`/student/track-order/${targetId}`);
    }
  }, [targetId, router]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#6B6780]">
        Loading laundry tracking telemetry...
      </div>
    );
  }

  if (userOrders.length === 0 && !idFromQuery) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5E3F0] shadow-soft text-center max-w-md mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] text-[#6633CC] flex items-center justify-center mx-auto shadow-sm">
          <SearchCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#211747]">No Orders to Track</h3>
        <p className="text-xs text-[#6B6780] leading-relaxed">
          You don't have any active or past laundry requests. Schedule a hostel pickup to track your clothes live from pickup to delivery.
        </p>
        <div className="pt-2">
          <Link href="/student/new-request">
            <Button variant="primary" size="sm" leftIcon={<PackagePlus className="w-4 h-4" />}>
              Book Laundry Service
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 text-center text-xs text-[#6B6780]">
      Redirecting to order tracking timeline...
    </div>
  );
}

export default function TrackOrderIndexPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#6B6780]">Loading order tracker...</div>}>
      <TrackOrderRedirect />
    </Suspense>
  );
}
