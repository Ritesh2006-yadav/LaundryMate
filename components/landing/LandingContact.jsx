"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LandingContact() {
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    hostel: "BH-3 (Boys Hostel 3)",
    category: "General Inquiry",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate inputs
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage("Please enter your full name (minimum 2 characters).");
      return;
    }
    if (!formData.regNo.trim() || formData.regNo.trim().length < 3) {
      setErrorMessage("Please provide your university Registration Number or Email.");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage("Please enter at least 10 characters in your message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          emailOrReg: formData.regNo.trim(),
          hostelResidence: formData.hostel,
          category: formData.category,
          subject: formData.subject.trim() || `${formData.category} - ${formData.hostel}`,
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.referenceId) {
        setSubmittedInquiry({
          referenceId: data.referenceId,
          name: formData.name,
          category: formData.category,
          hostel: formData.hostel,
        });
        setFormData({
          name: "",
          regNo: "",
          hostel: "BH-3 (Boys Hostel 3)",
          category: "General Inquiry",
          subject: "",
          message: "",
        });
      } else {
        setErrorMessage(data.error || "Unable to send your inquiry. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error: Could not reach the server. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (submittedInquiry?.referenceId) {
      navigator.clipboard.writeText(submittedInquiry.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#F5F4FA] select-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F58220] bg-[#F58220]/10 border border-[#F58220]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Campus Helpdesk
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#211747] tracking-tight">
            Contact Hostel Laundry Operations
          </h2>
          <p className="text-[#6B6780] text-sm sm:text-base mt-2.5">
            Inquiries submitted here are delivered directly to the Central LMS Administration Desk for supervisory review and resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact & Support Info Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#211747] text-white rounded-3xl p-7 sm:p-8 shadow-card space-y-6">
            <div>
              <span className="text-xs font-bold text-[#F58220] uppercase tracking-wider">
                Official Support Desk
              </span>
              <h3 className="text-xl font-bold mt-1 text-white">
                Central Plant Headquarters
              </h3>
              <p className="text-xs text-white/70 mt-1">
                Lovely Professional University, Phagwara, Punjab 144411
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-white/80">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F58220] flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Location on Campus</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Central Laundry Complex, Behind Uni-Mall & Sports Area
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F58220] flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Desk Working Hours</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Monday – Saturday: 08:00 AM – 08:00 PM<br />
                    Sunday: 10:00 AM – 04:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F58220] flex-shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Hostel Coverage</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Doorstep laundry service for BH-1 through BH-8 and GH-1 through GH-6 resident hostels.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#F58220] flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">Inquiry Processing Workflow</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Messages are routed to the central administration queue. Supervisors review tickets and follow up directly with hostel hub runners.
                  </p>
                </div>
              </div>
            </div>

            {/* Note on Student Complaints */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F58220]">
                <FileText className="w-3.5 h-3.5" />
                <span>Have an active order issue?</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                For missing clothes, fabric damage, or delayed delivery claims with photographic evidence, please use the Student Complaints Desk.
              </p>
              <Link
                href="/student/complaints"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#F58220] transition-colors pt-1"
              >
                <span>Go to Student Complaints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-[#E5E3F0] shadow-soft">
            <h3 className="text-xl font-bold text-[#211747] mb-1">
              Submit an Official Inquiry
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6780] mb-6">
              Your inquiry will be logged directly into the Central Laundry Admin Desk for staff review.
            </p>

            {submittedInquiry ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-900 text-lg">
                    Inquiry Lodged Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="font-semibold text-emerald-950">{submittedInquiry.name}</strong>. Your inquiry has been securely submitted to the Central LMS Administration Inbox.
                  </p>
                </div>

                {/* Reference ID Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-emerald-300 shadow-xs">
                  <span className="text-xs font-semibold text-gray-500">Inquiry Reference:</span>
                  <span className="font-mono text-sm font-bold text-[#211747]">
                    {submittedInquiry.referenceId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-emerald-700 max-w-sm mx-auto">
                  Please keep this reference ID for any follow-up with the laundry supervisor or hostel warden.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedInquiry(null)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E5E3F0] hover:bg-[#F5F4FA] text-xs font-bold text-[#211747] transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#6633CC]" />
                    <span>Submit Another Inquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#211747] mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akshay Gupta"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] transition-colors disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#211747] mb-1.5">
                      Registration Number or Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12015842 or email@lpu.in"
                      value={formData.regNo}
                      onChange={(e) =>
                        setFormData({ ...formData, regNo: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] transition-colors disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#211747] mb-1.5">
                      Hostel Residence <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.hostel}
                      onChange={(e) =>
                        setFormData({ ...formData, hostel: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors cursor-pointer disabled:bg-gray-50"
                    >
                      <option value="BH-1 (Boys Hostel 1)">BH-1 (Boys Hostel 1)</option>
                      <option value="BH-2 (Boys Hostel 2)">BH-2 (Boys Hostel 2)</option>
                      <option value="BH-3 (Boys Hostel 3)">BH-3 (Boys Hostel 3)</option>
                      <option value="BH-4 (Boys Hostel 4)">BH-4 (Boys Hostel 4)</option>
                      <option value="BH-5 (Boys Hostel 5)">BH-5 (Boys Hostel 5)</option>
                      <option value="BH-6 (Boys Hostel 6)">BH-6 (Boys Hostel 6)</option>
                      <option value="BH-7 (Boys Hostel 7)">BH-7 (Boys Hostel 7)</option>
                      <option value="BH-8 (Boys Hostel 8)">BH-8 (Boys Hostel 8)</option>
                      <option value="GH-1 (Girls Hostel 1)">GH-1 (Girls Hostel 1)</option>
                      <option value="GH-2 (Girls Hostel 2)">GH-2 (Girls Hostel 2)</option>
                      <option value="GH-3 (Girls Hostel 3)">GH-3 (Girls Hostel 3)</option>
                      <option value="GH-4 (Girls Hostel 4)">GH-4 (Girls Hostel 4)</option>
                      <option value="GH-5 (Girls Hostel 5)">GH-5 (Girls Hostel 5)</option>
                      <option value="GH-6 (Girls Hostel 6)">GH-6 (Girls Hostel 6)</option>
                      <option value="Day Scholar">Day Scholar / Off-Campus</option>
                      <option value="Faculty / Staff Residence">Faculty / Staff Residence</option>
                      <option value="Other / Visitor">Other / Campus Visitor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#211747] mb-1.5">
                      Inquiry Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] bg-white focus:outline-none focus:border-[#6633CC] transition-colors cursor-pointer disabled:bg-gray-50"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Pickup & Delivery Schedule">Pickup & Delivery Schedule</option>
                      <option value="Laundry Quota / Pricing">Laundry Quota / Pricing</option>
                      <option value="Special Fabric Care">Special Fabric Care</option>
                      <option value="System / Account Help">System / Account Help</option>
                      <option value="Feedback / Suggestion">Feedback / Suggestion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#211747] mb-1.5">
                    Subject / Summary <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Brief headline of your inquiry..."
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] transition-colors disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#211747]">
                      Detailed Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#8F8A9E]">
                      {formData.message.length}/2000 chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    maxLength={2000}
                    placeholder="Please describe your question, hostel scheduling concern, or service feedback in detail..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-xs sm:text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] transition-colors resize-none disabled:bg-gray-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-[#F58220] hover:bg-[#E07214] text-white font-bold text-sm shadow-orange transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting to Admin Desk...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Inquiry to Helpdesk</span>
                      <Send className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
