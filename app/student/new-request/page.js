"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Shirt,
  Layers,
  Sparkles,
  ShieldCheck,
  Flame,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  Banknote,
  Calendar,
  Clock,
  AlertCircle,
  AlertTriangle,
  Building2,
  Phone,
  Printer,
  ChevronRight,
  RotateCcw,
  MapPin,
  Lock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLaundryOrders } from "@/hooks/useLaundryOrders";
import { useLaundryServices } from "@/hooks/useLaundryServices";
import { useAuth } from "@/context/AuthContext";
import { getValidBookingDates, getSlotsForDate } from "@/lib/utils/scheduling";
import { createLaundryRequestAction } from "@/app/actions/orderActions";

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createOrder } = useLaundryOrders();
  const { services, loading: servicesLoading } = useLaundryServices();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState("wash-fold");
  const [weightKg, setWeightKg] = useState("5");
  const [specialInstructions, setSpecialInstructions] = useState(
    "Please handle my clothes carefully."
  );

  // Step 2: Item Breakdown & Fabric Care
  const [itemCounts, setItemCounts] = useState({
    shirts: 3,
    tshirts: 2,
    trousers: 2,
    bedsheet: 0,
    towels: 1,
    ethnic: 0,
    undergarments: 0,
    others: 0,
  });
  const [delicateGarments, setDelicateGarments] = useState(false);
  const [stainTreatment, setStainTreatment] = useState(false);
  const [colorSeparation, setColorSeparation] = useState(false);

  // Accommodation details strictly anchored to authenticated student profile
  const hostelName = user?.hostel || "";
  const hostelBlock = user?.hostelBlock || (user?.blockRoom ? user.blockRoom.split("/")[0].trim() : "");
  const roomNumber = user?.roomNumber || (user?.blockRoom ? user.blockRoom.split("/")[1]?.trim() : "");
  const contactPhone = user?.phone || "";

  // Check profile completeness
  const isAccommodationComplete = Boolean(
    (user?.hostel || hostelName) &&
    (user?.roomNumber || roomNumber || user?.blockRoom) &&
    (user?.phone || contactPhone)
  );

  // Step 3: Dynamic Scheduling strictly in Asia/Kolkata (IST)
  const bookingDates = useMemo(() => getValidBookingDates(5), []);

  // Determine initial date: select Today if available, otherwise Tomorrow
  const initialDate = useMemo(() => {
    const firstAvailable = bookingDates.find((d) => d.isAvailable);
    return firstAvailable || bookingDates[0];
  }, [bookingDates]);

  const [selectedDateKey, setSelectedDateKey] = useState(initialDate?.dateKey);

  // Available slots for selected date
  const availableSlots = useMemo(() => {
    return getSlotsForDate(selectedDateKey);
  }, [selectedDateKey]);

  // Initial slot: first available slot
  const [selectedSlotId, setSelectedSlotId] = useState(() => {
    const firstOpen = availableSlots.find((s) => s.isAvailable);
    return firstOpen ? firstOpen.id : "morning";
  });

  // When selected date changes, auto-switch to first available slot if currently selected is closed
  useEffect(() => {
    const currentSlotObj = availableSlots.find((s) => s.id === selectedSlotId);
    if (!currentSlotObj || !currentSlotObj.isAvailable) {
      const firstOpen = availableSlots.find((s) => s.isAvailable);
      if (firstOpen) {
        setSelectedSlotId(firstOpen.id);
      }
    }
  }, [selectedDateKey, availableSlots, selectedSlotId]);

  const [runnerNotes, setRunnerNotes] = useState("");

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState("quota"); // 'quota', 'upi', 'cash'

  // Post Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [bookingError, setBookingError] = useState("");

  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Details" },
    { num: 3, label: "Pickup" },
    { num: 4, label: "Review" },
  ];

  // Selected Service object from dynamic services
  const currentService =
    services.find((s) => s.id === selectedServiceId) || services[1] || services[0];
  const ratePerKg = currentService?.pricePerKg || 40;

  // Total garments calculation
  const totalItems = Object.values(itemCounts).reduce((acc, curr) => acc + curr, 0);

  // Financial calculations
  const baseCost = (Number(weightKg) || 1) * ratePerKg;
  const addOnsCost = (stainTreatment ? 30 : 0) + (delicateGarments ? 20 : 0);
  const subtotal = baseCost + addOnsCost;
  const universitySubsidy = paymentMethod === "quota" ? 0 : 0;
  const finalAmount = subtotal - universitySubsidy;

  const updateItemCount = (key, delta) => {
    setItemCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case "Shirt":
        return <Shirt className="w-5 h-5" />;
      case "Layers":
        return <Layers className="w-5 h-5" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-5 h-5" />;
      case "Flame":
        return <Flame className="w-5 h-5" />;
      default:
        return <Shirt className="w-5 h-5" />;
    }
  };

  const activeDateObj = bookingDates.find((d) => d.dateKey === selectedDateKey) || bookingDates[0];
  const activeSlotObj = availableSlots.find((s) => s.id === selectedSlotId) || availableSlots[0];

  const handleNext = async () => {
    if (currentStep < 4) {
      if (currentStep === 3 && !isAccommodationComplete) {
        return; // Prevent advancing if accommodation details are missing
      }
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Step 4 Final Booking Submission (Prevents duplicate requests)
      if (isSubmitting) return;
      setIsSubmitting(true);
      setBookingError("");

      const fullRoomBlock = `${hostelBlock} / ${roomNumber}`;
      const locationSnapshot = `${hostelName}, Block ${hostelBlock} / Room ${roomNumber}`;

      const orderPayload = {
        studentId: user?.id,
        studentName: user?.name || "Resident Student",
        studentRegNo: user?.regNo || "",
        studentEmail: user?.email || "",
        hostel: hostelName,
        hostelBlock,
        roomNumber,
        roomBlock: fullRoomBlock,
        pickupLocation: locationSnapshot,
        deliveryLocation: locationSnapshot, // Exactly the same registered accommodation
        contactPhone,
        service: currentService.name,
        serviceId: currentService.id,
        itemsCount: totalItems > 0 ? totalItems : 1,
        weightKg: Number(weightKg) > 0 ? Number(weightKg) : 1.0,
        pickupDate: activeDateObj.fullFormatted,
        pickupDateKey: activeDateObj.dateKey,
        pickupSlot: activeSlotObj.label,
        pickupTime: activeSlotObj.timeRange,
        runnerNotes,
        specialInstructions,
        paymentStatus: paymentMethod === "cash" ? "Pending (Cash on Pickup)" : "Paid",
        amount: finalAmount,
        paymentMethod,
        itemsBreakdown: itemCounts,
        delicateGarments,
        stainTreatment,
        colorSeparation,
      };

      try {
        // 1. Create order in local store for instantaneous UI reaction
        const newOrder = createOrder(orderPayload);

        // 2. Trigger secure Server Action to insert into Supabase orders table
        try {
          await createLaundryRequestAction({
            id: newOrder.id,
            ...orderPayload,
          });
        } catch (serverErr) {
          console.warn("[NewRequest] Server action notice:", serverErr.message);
        }

        setConfirmedOrder(newOrder);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Booking failed:", err);
        setBookingError(err.message || "Failed to confirm booking. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ----------------------------------------------------
  // CONFIRMATION VIEW (Digital Receipt & Next Actions)
  // ----------------------------------------------------
  if (submitted && confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E3F0] shadow-card text-center relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 shadow-md">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC] mb-2 inline-block">
            Booking Confirmed & Runner Assigned
          </span>

          <h2 className="text-2xl font-black text-[#211747]">
            Laundry Request #{confirmedOrder.id}
          </h2>
          <p className="text-xs text-[#6B6780] mt-1 max-w-md mx-auto">
            Your laundry pickup has been scheduled at your registered hostel room. Our runner will collect your bag during the chosen time slot.
          </p>

          {/* Location & Schedule Snapshot Details Card */}
          <div className="mt-6 p-5 rounded-2xl bg-[#FAF9FD] border border-[#E5E3F0] text-left space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-2.5">
              <span className="font-bold text-[#211747]">Service</span>
              <span className="font-bold text-[#6633CC]">{confirmedOrder.service}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-[#6B6780]">Registered Room (Pickup & Delivery):</span>
              <span className="font-bold text-[#211747] text-right">
                {confirmedOrder.hostel} • {confirmedOrder.roomBlock}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6B6780]">Contact Mobile:</span>
              <span className="font-bold text-[#211747]">{confirmedOrder.contactPhone}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6B6780]">Collection Date:</span>
              <span className="font-bold text-[#211747]">{confirmedOrder.pickupDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6B6780]">Time Slot:</span>
              <span className="font-bold text-[#6633CC]">{confirmedOrder.pickupSlot}</span>
            </div>

            <div className="flex items-center justify-between border-t border-[#F0EDF8] pt-2.5">
              <span className="text-[#6B6780]">Total Amount:</span>
              <span className="font-black text-sm text-[#211747]">₹{confirmedOrder.amount}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href={`/student/track-order/${confirmedOrder.id}`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full shadow-purple">
                Track Live Order Status
              </Button>
            </Link>

            <Link href="/student/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-12">
      {/* Step Wizard Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E5E3F0] shadow-soft">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#E5E3F0] -translate-y-1/2 z-0" />
          {steps.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  disabled={s.num > currentStep}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? "bg-[#6633CC] text-white shadow-purple"
                      : isCurrent
                      ? "bg-[#F58220] text-white ring-4 ring-[#F58220]/20 font-extrabold shadow-orange"
                      : "bg-[#F5F4FA] text-[#8F8A9E] border border-[#E5E3F0]"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </button>
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent
                      ? "text-[#F58220]"
                      : isDone
                      ? "text-[#6633CC]"
                      : "text-[#8F8A9E]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3F0] shadow-soft space-y-6">
        {/* ==================================================== */}
        {/* STEP 1: SELECT LAUNDRY SERVICE & ESTIMATED WEIGHT   */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-[#211747]">
                Choose Laundry Service
              </h3>
              <p className="text-xs text-[#6B6780]">
                Select the service that fits your garments today
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {services.map((srv) => {
                const isSelected = selectedServiceId === srv.id;

                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-[#6633CC] bg-[#6633CC]/5 ring-2 ring-[#6633CC]/20 shadow-purple"
                        : "border-[#E5E3F0] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? "bg-[#6633CC] text-white"
                            : "bg-purple-50 text-[#6633CC]"
                        }`}
                      >
                        {getServiceIcon(srv.icon)}
                      </div>
                      {srv.popular && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F58220] text-white shadow-xs">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#211747]">
                        {srv.name}
                      </h4>
                      <p className="text-[11px] text-[#6B6780] mt-0.5 line-clamp-2">
                        {srv.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0EDF8] flex items-center justify-between">
                      <span className="text-xs font-black text-[#6633CC]">
                        ₹{srv.pricePerKg}/kg
                      </span>
                      <span className="text-[10px] text-[#8F8A9E]">
                        Est. {srv.estimatedHours || 24}h turn
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Weight and Instructions Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F0EDF8]">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                  Approx. Load Weight (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-bold text-[#211747] focus:ring-2 focus:ring-[#6633CC] outline-none"
                />
                <span className="text-[10px] text-[#8F8A9E]">
                  Hostel runner will weigh bag precisely on intake.
                </span>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Special Instructions (Optional)"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Please wash hostel hoodie inside out."
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: ENTER CLOTHES ITEM BREAKDOWN                */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-[#211747]">
                Garment Item Breakdown
              </h3>
              <p className="text-xs text-[#6B6780]">
                Itemize your clothes to ensure accurate reconciliation and zero laundry mix-ups
              </p>
            </div>

            {/* Garment Counter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: "shirts", label: "Shirts / Tops" },
                { key: "tshirts", label: "T-Shirts / Polos" },
                { key: "trousers", label: "Trousers / Jeans" },
                { key: "bedsheet", label: "Bedsheets / Linen" },
                { key: "towels", label: "Towels" },
                { key: "ethnic", label: "Kurta / Ethnic" },
                { key: "undergarments", label: "Undergarments" },
                { key: "others", label: "Others" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="p-3.5 rounded-2xl border border-[#E5E3F0] bg-[#FAF9FD] flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-[#211747]">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateItemCount(key, -1)}
                      className="w-7 h-7 rounded-lg border border-[#D3CEE8] bg-white text-[#211747] flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-[#211747]">
                      {itemCounts[key]}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItemCount(key, 1)}
                      className="w-7 h-7 rounded-lg bg-[#6633CC] text-white flex items-center justify-center hover:bg-[#5225a8] transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total clothes summary bar */}
            <div className="p-4 rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E40AF]">
                Total Clothes in Bag:
              </span>
              <span className="text-base font-extrabold text-[#1E40AF]">
                {totalItems} garments (~{weightKg} kg)
              </span>
            </div>

            {/* Fabric Care Options */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-[#211747]">
                Value-Add Fabric Care
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3.5 rounded-2xl border border-[#E5E3F0] hover:border-[#6633CC] flex items-center gap-3 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={delicateGarments}
                    onChange={(e) => setDelicateGarments(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#211747] block">
                      Delicate Fabrics
                    </span>
                    <span className="text-[10px] text-[#6B6780]">
                      Gentle cold wash (+₹20)
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl border border-[#E5E3F0] hover:border-[#6633CC] flex items-center gap-3 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={stainTreatment}
                    onChange={(e) => setStainTreatment(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#211747] block">
                      Stain Pre-Treatment
                    </span>
                    <span className="text-[10px] text-[#6B6780]">
                      Deep enzyme soak (+₹30)
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl border border-[#E5E3F0] hover:border-[#6633CC] flex items-center gap-3 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={colorSeparation}
                    onChange={(e) => setColorSeparation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6633CC] focus:ring-[#6633CC]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#211747] block">
                      Whites & Darks Split
                    </span>
                    <span className="text-[10px] text-[#6B6780]">
                      Zero color bleed (Free)
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: PICKUP LOCATION & SCHEDULING                 */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-[#211747]">
                Pickup & Delivery Schedule
              </h3>
              <p className="text-xs text-[#6B6780]">
                Collection and delivery take place at your registered hostel accommodation
              </p>
            </div>

            {/* Profile Incompleteness Alert */}
            {!isAccommodationComplete && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Incomplete Accommodation Profile</span>
                </div>
                <p className="text-xs text-amber-800">
                  Your hostel name, block, room number, or mobile number is missing from your registered profile. To prevent laundry mix-ups, you must complete your profile before creating a laundry request.
                </p>
                <Link href="/student/profile" className="inline-block pt-1">
                  <Button variant="primary" size="sm" className="text-xs bg-amber-600 hover:bg-amber-700">
                    Complete Profile & Settings Now →
                  </Button>
                </Link>
              </div>
            )}

            {/* A. Registered Accommodation (Source of Truth - Read Only) */}
            <div className="p-5 rounded-2xl bg-[#FAF9FD] border border-[#E5E3F0] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E3F0] pb-2.5">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#6633CC]" />
                  <span className="font-bold text-xs text-[#211747]">
                    Registered Room Details (Source of Truth)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified Resident
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                  <span className="text-[#6B6780] block text-[11px]">Registered Hostel</span>
                  <span className="font-bold text-[#211747] text-sm flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#6633CC]" />
                    {hostelName}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                  <span className="text-[#6B6780] block text-[11px]">Hostel Block</span>
                  <span className="font-bold text-[#211747] text-sm block mt-0.5">
                    {hostelBlock}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                  <span className="text-[#6B6780] block text-[11px]">Room Number</span>
                  <span className="font-bold text-[#211747] text-sm block mt-0.5">
                    Room {roomNumber}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E5E3F0]">
                  <span className="text-[#6B6780] block text-[11px]">Registered Mobile</span>
                  <span className="font-bold text-[#211747] text-sm flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {contactPhone}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#6B6780] flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#6633CC]" />
                <span>Pickup and delivery will both take place at your registered hostel room.</span>
              </p>
            </div>

            {/* B. Collection Date Selection (Strictly Dynamic in IST) */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560] flex items-center justify-between">
                <span>Choose Collection Date (Indian Standard Time)</span>
                <span className="text-[10px] text-[#6633CC] font-bold">LPU Central Hub Operations</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {bookingDates.map((d) => {
                  const isSelected = selectedDateKey === d.dateKey;
                  const isAvailable = d.isAvailable;

                  return (
                    <button
                      key={d.dateKey}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedDateKey(d.dateKey)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between relative ${
                        !isAvailable
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "border-[#6633CC] bg-[#6633CC]/5 text-[#6633CC] ring-2 ring-[#6633CC]/20 shadow-purple font-bold"
                          : "border-[#E5E3F0] bg-white text-[#4A4560] hover:bg-gray-50"
                      }`}
                    >
                      {d.badge && (
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1 ${
                            isSelected
                              ? "bg-[#6633CC] text-white"
                              : "bg-purple-100 text-[#6633CC]"
                          }`}
                        >
                          {d.badge}
                        </span>
                      )}
                      <span className="text-[11px] text-[#6B6780] font-medium">
                        {d.weekdayShort}
                      </span>
                      <span className="text-base font-extrabold text-[#211747]">
                        {d.day} {d.month}
                      </span>
                      {!isAvailable && (
                        <span className="text-[9px] text-rose-500 font-bold mt-1">
                          Closed
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Collection Time Slot Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                Choose Collection Time Slot
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id && slot.isAvailable;
                  const isAvailable = slot.isAvailable;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                      className={`p-3.5 rounded-2xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${
                        !isAvailable
                          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "border-[#6633CC] bg-[#6633CC]/5 text-[#6633CC] ring-2 ring-[#6633CC]/20 font-bold shadow-sm"
                          : "border-[#E5E3F0] bg-white text-[#4A4560] hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock
                          className={`w-4 h-4 ${
                            isSelected ? "text-[#6633CC]" : isAvailable ? "text-[#F58220]" : "text-gray-400"
                          }`}
                        />
                        <div>
                          <span className="font-bold text-[#211747] block text-xs">
                            {slot.label}
                          </span>
                          <span className="text-[10px] text-[#6B6780]">
                            Doorstep bag collection
                          </span>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-[#6633CC] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : !isAvailable ? (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Closed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Open
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. Runner Instructions (Max 200 chars) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#4A4560]">
                  Runner Pickup Instructions (Optional)
                </label>
                <span className="text-[10px] text-[#8F8A9E]">
                  {runnerNotes.length} / 200 characters
                </span>
              </div>
              <textarea
                maxLength={200}
                rows={2}
                value={runnerNotes}
                onChange={(e) => setRunnerNotes(e.target.value)}
                placeholder="e.g. Please ring room bell twice, bag placed beside door."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-xs focus:ring-2 focus:ring-[#6633CC] outline-none resize-none text-[#211747]"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: REVIEW & CONFIRM                            */}
        {/* ==================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-[#211747]">
                Review Order & Confirmation
              </h3>
              <p className="text-xs text-[#6B6780]">
                Verify all order parameters before finalizing your hostel laundry request
              </p>
            </div>

            {bookingError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Order Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Service & Garments */}
              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Service & Garments
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Service:</span>
                  <span className="font-bold text-[#211747]">{currentService.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Rate:</span>
                  <span className="font-bold text-[#6633CC]">₹{ratePerKg}/kg</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Estimated Weight:</span>
                  <span className="font-bold text-[#211747]">{weightKg} kg</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Garments Count:</span>
                  <span className="font-bold text-[#211747]">{totalItems} clothes</span>
                </div>
                {specialInstructions && (
                  <div className="pt-2 border-t border-[#E5E3F0] text-[11px] text-[#6B6780] italic">
                    Note: &ldquo;{specialInstructions}&rdquo;
                  </div>
                )}
              </div>

              {/* Card 2: Pickup & Delivery Location Snapshot */}
              <div className="p-4 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Accommodation & Schedule Snapshot
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Pickup Room:</span>
                  <span className="font-bold text-[#211747]">
                    {hostelName}, {hostelBlock} / {roomNumber}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Delivery Room:</span>
                  <span className="font-bold text-emerald-700">
                    Same ({hostelName}, {hostelBlock} / {roomNumber})
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Contact Mobile:</span>
                  <span className="font-bold text-[#211747]">{contactPhone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Collection Date:</span>
                  <span className="font-bold text-[#6633CC]">{activeDateObj.fullFormatted}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Time Slot:</span>
                  <span className="font-bold text-[#6633CC]">{activeSlotObj.label}</span>
                </div>
                {runnerNotes && (
                  <div className="pt-2 border-t border-[#E5E3F0] text-[11px] text-[#6B6780] italic">
                    Runner note: &ldquo;{runnerNotes}&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E3F0] shadow-soft space-y-2.5">
              <h4 className="font-bold text-sm text-[#211747]">
                Payment Breakdown
              </h4>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B6780]">
                  Base Wash ({weightKg} kg × ₹{ratePerKg}/kg):
                </span>
                <span className="font-semibold text-[#211747]">₹{baseCost}</span>
              </div>
              {stainTreatment && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Stain Pre-Treatment Add-on:</span>
                  <span className="font-semibold text-[#211747]">₹30</span>
                </div>
              )}
              {delicateGarments && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B6780]">Delicate Garment Care Add-on:</span>
                  <span className="font-semibold text-[#211747]">₹20</span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-2 border-t border-[#F0EDF8]">
                <span className="text-[#6B6780]">Subtotal:</span>
                <span className="font-bold text-[#211747]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#211747] pt-2 border-t border-[#E5E3F0]">
                <span>Total Payable:</span>
                <span className="text-[#6633CC] text-base">₹{finalAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-[#211747]">
                Select Payment Mode
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("quota")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "quota"
                      ? "border-[#6633CC] bg-[#6633CC]/5 ring-2 ring-[#6633CC]/20 shadow-purple"
                      : "border-[#E5E3F0] bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="w-5 h-5 text-[#6633CC]" />
                    {paymentMethod === "quota" && (
                      <Check className="w-4 h-4 text-[#6633CC] stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#211747]">
                      Student Laundry Quota
                    </h5>
                    <p className="text-[10px] text-[#6B6780] mt-0.5">
                      Bal: ₹{user?.walletBalance ?? 1000} (Auto-deducted)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "upi"
                      ? "border-[#6633CC] bg-[#6633CC]/5 ring-2 ring-[#6633CC]/20 shadow-purple"
                      : "border-[#E5E3F0] bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    {paymentMethod === "upi" && (
                      <Check className="w-4 h-4 text-[#6633CC] stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#211747]">
                      UPI / Net Banking
                    </h5>
                    <p className="text-[10px] text-[#6B6780] mt-0.5">
                      GPay, PhonePe, Paytm
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "cash"
                      ? "border-[#6633CC] bg-[#6633CC]/5 ring-2 ring-[#6633CC]/20 shadow-purple"
                      : "border-[#E5E3F0] bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="w-5 h-5 text-amber-600" />
                    {paymentMethod === "cash" && (
                      <Check className="w-4 h-4 text-[#6633CC] stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#211747]">
                      Cash on Pickup
                    </h5>
                    <p className="text-[10px] text-[#6B6780] mt-0.5">
                      Pay runner at door
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* FOOTER WIZARD ACTIONS (Back / Cancel / Next)        */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between pt-5 border-t border-[#F0EDF8]">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Back
            </Button>
          ) : (
            <Link href="/student/dashboard">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          )}

          <Button
            type="button"
            variant="primary"
            loading={isSubmitting}
            disabled={currentStep === 3 && !isAccommodationComplete}
            onClick={handleNext}
            rightIcon={
              currentStep === 4 ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
          >
            {currentStep === 4 ? "Confirm & Book Laundry" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
