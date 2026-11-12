"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Plus,
  X,
  Upload,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { COMPLAINT_TYPES } from "@/lib/constants";
import { useComplaints } from "@/hooks/useComplaints";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useAuth } from "@/context/AuthContext";
import { uploadComplaintEvidence } from "@/lib/supabase/storageService";

function RaiseComplaintForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledOrderId = searchParams.get("orderId") || "LMS1054";

  const { user } = useAuth();
  const { createComplaint } = useComplaints();
  const { orders } = useLaundryOrders();

  const [category, setCategory] = useState("Missing Clothes");
  const [selectedOrderId, setSelectedOrderId] = useState(
    prefilledOrderId.startsWith("#") ? prefilledOrderId : `#${prefilledOrderId}`
  );
  const [description, setDescription] = useState(
    "One of my t-shirts is missing from the laundry bag."
  );

  // Evidence state
  const [evidencePreview, setEvidencePreview] = useState(
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80"
  );
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Success state
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Order choices for dropdown
  const orderOptions = orders.length > 0
    ? orders.map((o) => `#${o.id} – ${o.service} (${o.requestDate})`)
    : ["#LMS1054 – Wash & Fold (06 Nov 2026)", "#LMS1051 – Wash & Iron (04 Nov 2026)"];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrlOrDataUrl = await uploadComplaintEvidence(file);
      setEvidencePreview(publicUrlOrDataUrl);
      setEvidenceFile(file);
    } catch (err) {
      console.error("Failed to process evidence image", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const cleanOrderId = selectedOrderId.split(" ")[0].replace(/^#/, "");
    const created = createComplaint({
      orderId: cleanOrderId,
      studentName: user?.name || "Akshay Gupta",
      studentRegNo: user?.regNo || "LPU12345678",
      hostel: user?.hostel || "BH-3 (Boys Hostel 3)",
      roomBlock: user?.blockRoom || "B-32 / 210",
      type: category,
      description,
      evidenceUrl: evidencePreview,
    });

    setSubmittedComplaint(created);
    setUploading(false);
  };

  if (submittedComplaint) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl p-8 border border-[#E5E3F0] shadow-card animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC] mb-2 inline-block">
          Ticket #{submittedComplaint.id}
        </span>
        <h2 className="text-2xl font-bold text-[#211747]">
          Complaint Lodged Successfully
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6780] mt-1 mb-6 leading-relaxed">
          Your issue regarding Order{" "}
          <span className="font-bold text-[#6633CC]">
            #{submittedComplaint.orderId}
          </span>{" "}
          has been registered. Staff and hub supervisor will inspect laundry sorting
          and CCTV records within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/student/complaints" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full shadow-purple">
              View In My Complaints
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              setSubmittedComplaint(null);
              setDescription("");
              setEvidencePreview("");
            }}
          >
            Submit Another Complaint
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none pb-8">
      {/* Main Complaint Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft space-y-5"
      >
        <Select
          label="Complaint Category"
          options={COMPLAINT_TYPES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
            Related Laundry Request ID
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 transition-all font-medium"
            >
              {orderOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Input
              placeholder="Or type #LMS1054 manually"
              value={selectedOrderId.split(" ")[0]}
              onChange={(e) => setSelectedOrderId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-[#E5E3F0] p-4 text-sm text-[#1A162B] focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 outline-none transition-all resize-none"
            placeholder="Please specify garment color, brand, tags or exact delivery issue..."
            required
          />
        </div>

        {/* Upload Evidence with Thumbnail & Plus box matching Screen 8 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
            Upload Evidence (Optional)
          </label>
          <div className="flex items-center gap-3">
            {/* Thumbnail Preview of T-Shirt */}
            {evidencePreview ? (
              <div className="relative w-16 h-16 rounded-2xl border border-[#E5E3F0] bg-gray-50 overflow-hidden flex items-center justify-center p-1 shadow-sm group">
                <img
                  src={evidencePreview}
                  alt="Evidence preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setEvidencePreview("")}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Plus add box */}
            <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#D3CEE8] flex flex-col items-center justify-center text-[#8F8A9E] hover:border-[#6633CC] hover:text-[#6633CC] cursor-pointer transition-all bg-white hover:bg-purple-50/30">
              <Plus className="w-6 h-6" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <span className="text-[10px] text-[#8F8A9E]">
            Images are securely stored and inspected by the University Laundry Board.
          </span>
        </div>

        {/* Submit Complaint Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={uploading}
          className="w-full text-base font-bold shadow-purple mt-4"
        >
          {uploading ? "Uploading Evidence..." : "Submit Complaint"}
        </Button>
      </form>
    </div>
  );
}

export default function RaiseComplaintPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#6B6780]">Loading complaint form...</div>}>
      <RaiseComplaintForm />
    </Suspense>
  );
}

