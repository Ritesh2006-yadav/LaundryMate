"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Tag,
  Edit,
  Plus,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  Shirt,
  ShieldCheck,
  Flame,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ClientPortal from "@/components/common/ClientPortal";
import { useLaundryServices } from "@/hooks/useLaundryServices";

export default function AdminServicesPage() {
  const { services, updateService, addService, resetToDefaults } = useLaundryServices();
  const [editingService, setEditingService] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit form state
  const [pricePerKg, setPricePerKg] = useState("");
  const [turnaround, setTurnaround] = useState("");
  const [description, setDescription] = useState("");

  // Add new service form state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newTurnaround, setNewTurnaround] = useState("24-48 hrs");
  const [newDesc, setNewDesc] = useState("");

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setPricePerKg(String(svc.pricePerKg));
    setTurnaround(svc.turnaround || "24-48 hrs");
    setDescription(svc.description || "");
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingService) return;

    updateService(editingService.id, {
      pricePerKg: Number(pricePerKg) || editingService.pricePerKg,
      turnaround,
      description,
    });
    setEditingService(null);
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    addService({
      name: newName,
      pricePerKg: Number(newPrice),
      turnaround: newTurnaround,
      description: newDesc || "University hostel standard laundry service.",
      icon: "Shirt",
    });

    setNewName("");
    setNewPrice("");
    setNewDesc("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Active Catalog & Tariffs
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {services.length} {services.length === 1 ? "Service" : "Services"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              if (confirm("Reset all services and rates to university defaults?")) {
                resetToDefaults();
              }
            }}
          >
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add New Service
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between transition-all hover:shadow-card hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-2xl bg-purple-50 text-[#6633CC] shadow-sm">
                  <Tag className="w-5 h-5" />
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#211747]">
                    ₹{s.pricePerKg}
                  </span>
                  <span className="text-xs text-[#6B6780] font-medium">{s.unit || "/kg"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#211747]">{s.name}</h3>
                {s.popular && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F58220] text-white">
                    Popular
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6B6780] mt-1.5 leading-relaxed">
                {s.description}
              </p>

              <div className="mt-4 p-3 rounded-xl bg-[#F5F4FA] border border-[#E5E3F0] flex items-center justify-between text-xs">
                <span className="text-[#6B6780]">Turnaround:</span>
                <span className="font-bold text-[#6633CC]">{s.turnaround}</span>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-[#F0EDF8] flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active for Students
              </span>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => handleOpenEdit(s)}
              >
                Edit Tariff
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setEditingService(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    Tariff Configuration
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Edit {editingService.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <Input
                  label="Price Per Kg (₹)"
                  type="number"
                  min="5"
                  max="500"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  required
                />

                <Input
                  label="Turnaround Time"
                  value={turnaround}
                  onChange={(e) => setTurnaround(e.target.value)}
                  placeholder="e.g. 24-48 hrs"
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Service Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingService(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}

      {/* Add New Service Modal */}
      {showAddModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="fixed inset-0 bg-[#17112F]/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 sm:p-8 space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                    New Service Plan
                  </span>
                  <h3 className="text-xl font-bold text-[#211747]">
                    Add Laundry Service
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNew} className="space-y-4">
                <Input
                  label="Service Name"
                  placeholder="e.g. Express Dry Cleaning"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />

                <Input
                  label="Price Per Kg (₹)"
                  type="number"
                  min="5"
                  placeholder="e.g. 75"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />

                <Input
                  label="Turnaround Time"
                  value={newTurnaround}
                  onChange={(e) => setNewTurnaround(e.target.value)}
                  placeholder="e.g. 12-24 hrs"
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#4A4560]">
                    Service Description
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe treatment and fabrics covered..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] focus:ring-4 focus:ring-[#6633CC]/10 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F0EDF8]">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Add Service
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
