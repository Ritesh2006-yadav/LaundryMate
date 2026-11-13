"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";

export default function StaffDeliveredOrdersPage() {
  const { orders } = useLaundryOrders();
  const [searchTerm, setSearchTerm] = useState("");

  const delivered = orders.filter((o) => ["Delivered", "Completed"].includes(o.status));

  const filtered = delivered.filter((o) =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.roomBlock?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none pb-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Completed Orders Archive
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {filtered.length} {filtered.length === 1 ? "Order" : "Orders"}
          </span>
        </div>
      </div>

      <Input
        placeholder="Search by Request ID, Student Name, or Room..."
        icon={Search}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#6B6780] border-b border-[#E5E3F0]">
              <tr>
                <th className="py-3.5 px-6 font-bold">Request ID</th>
                <th className="py-3.5 px-6 font-bold">Student</th>
                <th className="py-3.5 px-6 font-bold">Hostel / Room</th>
                <th className="py-3.5 px-6 font-bold">Service</th>
                <th className="py-3.5 px-6 font-bold">Clothes</th>
                <th className="py-3.5 px-6 font-bold">Delivered Date</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6780] text-sm">
                    No delivered orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9FD]/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#211747]">#{order.id}</td>
                    <td className="py-4 px-6 font-semibold text-[#211747]">{order.studentName || order.student}</td>
                    <td className="py-4 px-6 text-xs text-[#4A4560]">
                      {order.hostel || "BH-3"}, {order.roomBlock || "B-32 / 210"}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#4A4560]">{order.service}</td>
                    <td className="py-4 px-6 text-xs text-[#6B6780]">{order.itemsCount || 0} pcs</td>
                    <td className="py-4 px-6 text-xs text-[#6B6780]">{order.requestDate}</td>
                    <td className="py-4 px-6"><Badge status={order.status} showDot /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

