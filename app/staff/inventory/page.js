"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Plus,
  AlertTriangle,
  AlertCircle,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  History,
  Sliders,
  Edit2,
  Trash2,
  X,
  Package,
  Layers,
  Sparkles,
  Droplets,
  ShoppingBag,
  ExternalLink,
  Download,
  Filter,
  Check,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ClientPortal from "@/components/common/ClientPortal";
import { useInventory, INVENTORY_CATEGORIES } from "@/hooks/useInventory";
import { useAuth } from "@/context/AuthContext";

export default function StaffInventoryPage() {
  const { user } = useAuth();
  const {
    items,
    loading,
    addItem,
    updateStock,
    updateItem,
    removeItem,
    getLowStockItems,
    getInventoryReport,
    categories,
  } = useInventory();

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'low' | 'healthy'
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeItemForStock, setActiveItemForStock] = useState(null);
  const [activeItemForHistory, setActiveItemForHistory] = useState(null);
  const [activeItemForSupplier, setActiveItemForSupplier] = useState(null);
  const [activeItemForEdit, setActiveItemForEdit] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Forms
  const [addForm, setAddForm] = useState({
    name: "",
    sku: "",
    category: "Detergent",
    currentStock: 50,
    minStockLevel: 20,
    maxStockLevel: 200,
    unit: "Liters",
    unitCost: 100,
    location: "Central Laundry Plant - Rack A",
    supplierName: "Punjab Chemical Supplies",
    supplierContact: "Rajesh Sharma",
    supplierPhone: "+91 98140 12345",
    supplierEmail: "supplies@punjabchem.in",
    leadTimeDays: 2,
    supplierAddress: "Industrial Area, Phagwara, Punjab",
  });

  const [stockActionForm, setStockActionForm] = useState({
    type: "Restock", // 'Restock' | 'Usage' | 'Adjustment'
    quantity: 10,
    reason: "",
  });

  const lowStockItems = getLowStockItems();
  const report = getInventoryReport();

  const filteredItems = items.filter((it) => {
    const matchesCategory =
      activeCategory === "all" || it.category === activeCategory;
    const matchesSearch =
      it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const isLow = it.currentStock <= it.minStockLevel;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "low" && isLow) ||
      (statusFilter === "healthy" && !isLow);

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCreateItem = (e) => {
    e.preventDefault();
    const actor = user?.name || "Staff Rohit Kumar";
    addItem(
      {
        name: addForm.name,
        sku: addForm.sku,
        category: addForm.category,
        currentStock: addForm.currentStock,
        minStockLevel: addForm.minStockLevel,
        maxStockLevel: addForm.maxStockLevel,
        unit: addForm.unit,
        unitCost: addForm.unitCost,
        location: addForm.location,
        supplier: {
          name: addForm.supplierName,
          contactPerson: addForm.supplierContact,
          phone: addForm.supplierPhone,
          email: addForm.supplierEmail,
          leadTimeDays: addForm.leadTimeDays,
          address: addForm.supplierAddress,
          gstin: "03AABCU9999P1Z8",
        },
      },
      actor
    );

    setShowAddModal(false);
    showToast(`Added new item "${addForm.name}" to inventory.`);
    // Reset form
    setAddForm({
      name: "",
      sku: "",
      category: "Detergent",
      currentStock: 50,
      minStockLevel: 20,
      maxStockLevel: 200,
      unit: "Liters",
      unitCost: 100,
      location: "Central Laundry Plant - Rack A",
      supplierName: "Punjab Chemical Supplies",
      supplierContact: "Rajesh Sharma",
      supplierPhone: "+91 98140 12345",
      supplierEmail: "supplies@punjabchem.in",
      leadTimeDays: 2,
      supplierAddress: "Industrial Area, Phagwara, Punjab",
    });
  };

  const handleUpdateStock = (e) => {
    e.preventDefault();
    if (!activeItemForStock) return;
    const actor = user?.name || "Staff Rohit Kumar";
    const delta =
      stockActionForm.type === "Usage"
        ? -Math.abs(Number(stockActionForm.quantity))
        : Math.abs(Number(stockActionForm.quantity));

    updateStock(
      activeItemForStock.id,
      delta,
      stockActionForm.type,
      stockActionForm.reason || `${stockActionForm.type} recorded for ${activeItemForStock.name}`,
      actor
    );

    showToast(
      `Stock updated for ${activeItemForStock.name} (${delta > 0 ? "+" : ""}${delta} ${activeItemForStock.unit}).`
    );
    setActiveItemForStock(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeItemForEdit) return;
    const actor = user?.name || "Staff Rohit Kumar";
    updateItem(activeItemForEdit.id, activeItemForEdit, actor);
    showToast(`Updated settings for "${activeItemForEdit.name}".`);
    setActiveItemForEdit(null);
  };

  const handleDeleteItem = (item) => {
    if (
      confirm(
        `Are you sure you want to remove "${item.name}" (${item.sku}) from the inventory records?`
      )
    ) {
      const actor = user?.name || "Staff Rohit Kumar";
      removeItem(item.id, actor);
      showToast(`Removed "${item.name}" from inventory.`);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Detergent":
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case "Washing Powder":
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case "Fabric Conditioner":
        return <Droplets className="w-4 h-4 text-purple-500" />;
      case "Laundry Bags":
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case "Packaging Materials":
        return <Layers className="w-4 h-4 text-emerald-500" />;
      default:
        return <Boxes className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Plant Stock & Consumables
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {items.length} Tracked Items
          </span>
          {lowStockItems.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {lowStockItems.length} Low Stock
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowReportModal(true)}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Usage Reports
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-purple"
          >
            Add New Item
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner (Triggered when any item is <= minStockLevel) */}
      {lowStockItems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-amber-900 text-sm sm:text-base">
                  Low Stock Alert ({lowStockItems.length} items require replenishment)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                The following essential items have dipped below the configured safety threshold:{" "}
                <strong>
                  {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit})`).join(", ")}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatusFilter("low");
              }}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold"
            >
              Filter Low Stock
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActiveItemForSupplier(lowStockItems[0]);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white border-transparent text-xs font-bold"
            >
              Contact Supplier
            </Button>
          </div>
        </div>
      )}

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6B6780]">Total SKU Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6633CC] flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#211747]">
            {items.length}
          </p>
          <span className="text-[11px] text-[#8F8A9E] mt-1 block">
            Across 6 laundry categories
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700">Low Stock Breaches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700">
            {lowStockItems.length}
          </p>
          <span className="text-[11px] text-amber-600/80 mt-1 block">
            Below minimum safety stock
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700">Inventory Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
            ₹{report.totalValuation.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">
            Current asset replacement cost
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6633CC]">Stock Health Index</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6633CC] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#6633CC]">
            {Math.round(((items.length - lowStockItems.length) / Math.max(1, items.length)) * 100)}%
          </p>
          <span className="text-[11px] text-[#8F8A9E] mt-1 block">
            Safe operational buffer
          </span>
        </div>
      </div>

      {/* Filter, Search & View Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E3F0] shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="w-full md:w-96">
            <Input
              placeholder="Search by name, SKU (e.g. DET-LIQ), location or supplier..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick status & view mode toggles */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-[#F5F4FA] p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === "all"
                    ? "bg-white text-[#211747] shadow-sm"
                    : "text-[#6B6780] hover:text-[#211747]"
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setStatusFilter("low")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  statusFilter === "low"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-700 hover:bg-amber-100/50"
                }`}
              >
                Low Stock ({lowStockItems.length})
              </button>
              <button
                onClick={() => setStatusFilter("healthy")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  statusFilter === "healthy"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-700 hover:bg-emerald-100/50"
                }`}
              >
                Healthy ({items.length - lowStockItems.length})
              </button>
            </div>

            <div className="flex items-center gap-1 border border-[#E5E3F0] rounded-2xl p-1 text-xs">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-[#6633CC] text-white"
                    : "text-[#6B6780] hover:bg-gray-100"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  viewMode === "cards"
                    ? "bg-[#6633CC] text-white"
                    : "text-[#6B6780] hover:bg-gray-100"
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* 6 Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold border-t border-[#F0EDF8] pt-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "bg-[#6633CC] text-white shadow-sm"
                : "bg-[#F5F4FA] text-[#6B6780] hover:bg-gray-200/70"
            }`}
          >
            All Supplies
          </button>
          {INVENTORY_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            const hasLow = items.some(
              (i) => i.category === cat && i.currentStock <= i.minStockLevel
            );

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? "bg-[#6633CC] text-white shadow-sm"
                    : "bg-[#F5F4FA] text-[#6B6780] hover:bg-gray-200/70"
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategory === cat
                      ? "bg-white/20 text-white"
                      : hasLow
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-200 text-[#4A4560]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inventory Display: Table View or Cards View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FD] text-[#6B6780] uppercase tracking-wider font-extrabold border-b border-[#F0EDF8]">
                <tr>
                  <th className="py-4 px-5">Item & SKU</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Current Stock / Capacity</th>
                  <th className="py-4 px-4">Safety Level</th>
                  <th className="py-4 px-4">Unit Cost</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#8F8A9E]">
                      No inventory items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.currentStock <= item.minStockLevel;
                    const percentFull = Math.min(
                      100,
                      Math.round((item.currentStock / item.maxStockLevel) * 100)
                    );

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#FAF9FD] transition-colors ${
                          isLow ? "bg-amber-50/20" : ""
                        }`}
                      >
                        {/* Name & SKU */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="font-extrabold text-sm text-[#211747] block">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-[#6633CC] font-bold">
                                {item.sku}
                              </span>
                              <span className="text-[10px] text-[#8F8A9E]">
                                • Last Restocked: {item.lastRestocked}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F4FA] font-bold text-[#4A4560] border border-[#E5E3F0]">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </span>
                        </td>

                        {/* Current Stock */}
                        <td className="py-4 px-4 min-w-[150px]">
                          <div>
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="font-extrabold text-sm text-[#211747]">
                                {item.currentStock} {item.unit}
                              </span>
                              <span className="text-[10px] text-[#8F8A9E]">
                                Max: {item.maxStockLevel}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isLow ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${percentFull}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Configurable Min Stock Level */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#211747]">
                              {item.minStockLevel} {item.unit}
                            </span>
                            <button
                              onClick={() => setActiveItemForEdit(item)}
                              title="Admin: Configure threshold"
                              className="p-1 hover:bg-gray-100 rounded text-[#8F8A9E] hover:text-[#6633CC]"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Unit Cost */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-[#211747]">
                            ₹{item.unitCost}
                          </span>
                          <span className="text-[10px] text-[#8F8A9E] block">
                            Total: ₹{(item.currentStock * item.unitCost).toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4">
                          <span className="text-xs text-[#6B6780] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#8F8A9E] flex-shrink-0" />
                            {item.location}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setActiveItemForStock(item);
                                setStockActionForm({
                                  type: "Restock",
                                  quantity: 20,
                                  reason: "Received shipment",
                                });
                              }}
                              className="text-xs py-1 px-2.5 bg-purple-50 text-[#6633CC] border-purple-200 hover:bg-purple-100"
                            >
                              + Refill / Log
                            </Button>
                            <button
                              onClick={() => setActiveItemForHistory(item)}
                              title="View Stock Movement Audit History"
                              className="p-1.5 rounded-xl hover:bg-gray-100 text-[#6B6780] hover:text-[#211747]"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActiveItemForSupplier(item)}
                              title="Supplier Details"
                              className="p-1.5 rounded-xl hover:bg-gray-100 text-[#6B6780] hover:text-[#211747]"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActiveItemForEdit(item)}
                              title="Edit item settings"
                              className="p-1.5 rounded-xl hover:bg-gray-100 text-[#6B6780] hover:text-[#211747]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              title="Delete item"
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-gray-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isLow = item.currentStock <= item.minStockLevel;
            const percentFull = Math.min(
              100,
              Math.round((item.currentStock / item.maxStockLevel) * 100)
            );

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border shadow-soft hover:shadow-card transition-all flex flex-col justify-between ${
                  isLow ? "border-amber-300 ring-1 ring-amber-300/40" : "border-[#E5E3F0]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F4FA] font-bold text-xs text-[#4A4560] border border-[#E5E3F0]">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Healthy
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[#211747] leading-snug">
                      {item.name}
                    </h4>
                    <span className="font-mono text-xs text-[#6633CC] font-bold">
                      {item.sku}
                    </span>
                  </div>

                  <div className="bg-[#FAF9FD] p-3 rounded-2xl border border-[#F0EDF8] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-[#211747]">
                        {item.currentStock}{" "}
                        <span className="text-xs font-semibold text-[#6B6780]">
                          {item.unit}
                        </span>
                      </span>
                      <span className="text-xs text-[#8F8A9E]">
                        Threshold: {item.minStockLevel} {item.unit}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLow ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-[#6B6780]">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-semibold text-[#211747]">
                        {item.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit Cost:</span>
                      <span className="font-semibold text-[#211747]">
                        ₹{item.unitCost} / {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supplier:</span>
                      <button
                        onClick={() => setActiveItemForSupplier(item)}
                        className="font-bold text-[#6633CC] hover:underline"
                      >
                        {item.supplier?.name}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F0EDF8] mt-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveItemForHistory(item)}
                      title="History"
                      className="p-1.5 rounded-xl hover:bg-gray-100 text-[#6B6780]"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveItemForEdit(item)}
                      title="Edit"
                      className="p-1.5 rounded-xl hover:bg-gray-100 text-[#6B6780]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActiveItemForStock(item);
                      setStockActionForm({
                        type: "Restock",
                        quantity: 20,
                        reason: "Weekly refill",
                      });
                    }}
                    className="text-xs"
                  >
                    Adjust / Refill
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD NEW INVENTORY ITEM */}
      {showAddModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setShowAddModal(false)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[#F0EDF8] flex items-center justify-between sticky top-0 bg-white z-20">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  LPU Laundry Logistics Master
                </span>
                <h3 className="text-xl font-extrabold text-[#211747]">
                  Register New Inventory Item
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-bold text-[#4A4560]">
                    Supply Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Industrial Liquid Detergent (Grade A) or Heavy Mesh Laundry Bag"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Category *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white font-medium"
                  >
                    {INVENTORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    SKU / Tracking Barcode
                  </label>
                  <input
                    type="text"
                    value={addForm.sku}
                    onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                    placeholder="e.g. DET-ECO-101 (Auto-generated if empty)"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-mono text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Current Opening Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={addForm.currentStock}
                    onChange={(e) => setAddForm({ ...addForm, currentStock: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Measurement Unit *
                  </label>
                  <select
                    value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] bg-white"
                  >
                    <option value="Liters">Liters (L)</option>
                    <option value="Kg">Kilograms (Kg)</option>
                    <option value="Units">Units / Pcs</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Packs">Packs</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-amber-800">
                    Min Stock Threshold (Low-Stock Alert Trigger) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addForm.minStockLevel}
                    onChange={(e) => setAddForm({ ...addForm, minStockLevel: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-amber-300 text-sm text-[#211747] focus:outline-none focus:border-[#6633CC] font-bold bg-amber-50/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Max Storage Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.maxStockLevel}
                    onChange={(e) => setAddForm({ ...addForm, maxStockLevel: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Unit Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={addForm.unitCost}
                    onChange={(e) => setAddForm({ ...addForm, unitCost: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Plant Storage Location
                  </label>
                  <input
                    type="text"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    placeholder="e.g. Chem Bay Rack A, Finishing Station"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                {/* Supplier Information Section */}
                <div className="sm:col-span-2 pt-2 border-t border-[#F0EDF8]">
                  <span className="font-bold text-[#6633CC] uppercase tracking-wider block mb-2">
                    Primary Supplier Details
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Vendor / Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.supplierName}
                    onChange={(e) => setAddForm({ ...addForm, supplierName: e.target.value })}
                    placeholder="e.g. Diversey Chemical Solutions"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={addForm.supplierContact}
                    onChange={(e) => setAddForm({ ...addForm, supplierContact: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Supplier Phone
                  </label>
                  <input
                    type="text"
                    value={addForm.supplierPhone}
                    onChange={(e) => setAddForm({ ...addForm, supplierPhone: e.target.value })}
                    placeholder="+91 98..."
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Lead Time (Days to Deliver)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.leadTimeDays}
                    onChange={(e) => setAddForm({ ...addForm, leadTimeDays: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                  />
                </div>
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
                  Register Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 2: UPDATE QUANTITY (RESTOCK / USAGE / ADJUSTMENT) */}
      {activeItemForStock && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setActiveItemForStock(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Stock Adjustment
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  {activeItemForStock.name}
                </h3>
                <p className="text-xs text-[#8F8A9E]">
                  Current Level:{" "}
                  <strong className="text-[#211747]">
                    {activeItemForStock.currentStock} {activeItemForStock.unit}
                  </strong>{" "}
                  (Min: {activeItemForStock.minStockLevel} {activeItemForStock.unit})
                </p>
              </div>
              <button
                onClick={() => setActiveItemForStock(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-[#F5F4FA] p-1 rounded-2xl font-bold">
                <button
                  type="button"
                  onClick={() =>
                    setStockActionForm({ ...stockActionForm, type: "Restock" })
                  }
                  className={`py-2 rounded-xl transition-all ${
                    stockActionForm.type === "Restock"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[#6B6780] hover:text-[#211747]"
                  }`}
                >
                  + Restock
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStockActionForm({ ...stockActionForm, type: "Usage" })
                  }
                  className={`py-2 rounded-xl transition-all ${
                    stockActionForm.type === "Usage"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-[#6B6780] hover:text-[#211747]"
                  }`}
                >
                  - Log Usage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStockActionForm({ ...stockActionForm, type: "Adjustment" })
                  }
                  className={`py-2 rounded-xl transition-all ${
                    stockActionForm.type === "Adjustment"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-[#6B6780] hover:text-[#211747]"
                  }`}
                >
                  Audit Adjust
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#4A4560]">
                  Quantity to{" "}
                  {stockActionForm.type === "Usage" ? "Deduct" : "Add"} ({activeItemForStock.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockActionForm.quantity}
                  onChange={(e) =>
                    setStockActionForm({
                      ...stockActionForm,
                      quantity: Number(e.target.value),
                    })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm font-bold text-[#211747] focus:outline-none focus:border-[#6633CC]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#4A4560]">
                  Reference / Batch / Reason *
                </label>
                <input
                  type="text"
                  required
                  value={stockActionForm.reason}
                  onChange={(e) =>
                    setStockActionForm({
                      ...stockActionForm,
                      reason: e.target.value,
                    })
                  }
                  placeholder={
                    stockActionForm.type === "Restock"
                      ? "e.g. Received PO #4489 from Diversey"
                      : "e.g. Batch #1 & #2 Morning Wash Cycles"
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747] focus:outline-none focus:border-[#6633CC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveItemForStock(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Record Stock Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 3: AUDIT HISTORY TIMELINE */}
      {activeItemForHistory && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setActiveItemForHistory(null)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 max-h-[85vh] flex flex-col my-auto">
            <div className="p-6 border-b border-[#F0EDF8] flex items-center justify-between sticky top-0 bg-white">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Audit History Log
                </span>
                <h3 className="text-xl font-extrabold text-[#211747]">
                  {activeItemForHistory.name}
                </h3>
                <p className="text-xs text-[#8F8A9E]">
                  SKU: {activeItemForHistory.sku} • Current Balance:{" "}
                  <strong>
                    {activeItemForHistory.currentStock} {activeItemForHistory.unit}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setActiveItemForHistory(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {(activeItemForHistory.stockHistory || []).length === 0 ? (
                <p className="text-xs text-[#8F8A9E] italic text-center p-8">
                  No transaction history recorded yet for this item.
                </p>
              ) : (
                <div className="divide-y divide-[#F0EDF8]">
                  {activeItemForHistory.stockHistory.map((h) => (
                    <div key={h.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              h.type === "Restock"
                                ? "bg-emerald-100 text-emerald-800"
                                : h.type === "Usage"
                                ? "bg-purple-100 text-[#6633CC]"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {h.type}
                          </span>
                          <span className="font-bold text-[#211747]">
                            {h.quantity > 0 ? `+${h.quantity}` : h.quantity}{" "}
                            {activeItemForHistory.unit}
                          </span>
                          <span className="text-[#8F8A9E]">
                            → Balance: {h.balanceAfter} {activeItemForHistory.unit}
                          </span>
                        </div>
                        <p className="text-[#4A4560]">{h.reason}</p>
                        <p className="text-[10px] text-[#8F8A9E]">
                          Logged by: <strong>{h.actor}</strong>
                        </p>
                      </div>

                      <div className="text-right text-[11px] text-[#8F8A9E] whitespace-nowrap">
                        <p>{h.date}</p>
                        <p className="text-[10px]">{h.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#F0EDF8] bg-[#FAF9FD] flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveItemForHistory(null)}
              >
                Close Audit Log
              </Button>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 4: SUPPLIER DETAILS */}
      {activeItemForSupplier && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setActiveItemForSupplier(null)}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Contracted Vendor
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  {activeItemForSupplier.supplier?.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveItemForSupplier(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F5F4FA] border border-[#E5E3F0] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Contact Person:</span>
                  <span className="font-bold text-[#211747]">
                    {activeItemForSupplier.supplier?.contactPerson || "Account Manager"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Phone:</span>
                  <a
                    href={`tel:${activeItemForSupplier.supplier?.phone}`}
                    className="font-bold text-[#6633CC] hover:underline"
                  >
                    {activeItemForSupplier.supplier?.phone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Email:</span>
                  <a
                    href={`mailto:${activeItemForSupplier.supplier?.email}`}
                    className="font-bold text-[#6633CC] hover:underline"
                  >
                    {activeItemForSupplier.supplier?.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">Delivery Lead Time:</span>
                  <span className="font-bold text-amber-800">
                    {activeItemForSupplier.supplier?.leadTimeDays || 3} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6780]">GSTIN / Tax ID:</span>
                  <span className="font-mono text-[#211747]">
                    {activeItemForSupplier.supplier?.gstin || "03AABCD1234E1Z5"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[#6B6780] p-2">
                <MapPin className="w-4 h-4 text-[#8F8A9E] flex-shrink-0 mt-0.5" />
                <span>
                  {activeItemForSupplier.supplier?.address || "Industrial Focal Point, Phagwara, Punjab"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#F0EDF8]">
              <a
                href={`tel:${activeItemForSupplier.supplier?.phone}`}
                className="flex-1"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  leftIcon={<Phone className="w-3.5 h-3.5" />}
                >
                  Call Vendor
                </Button>
              </a>
              <a
                href={`mailto:${activeItemForSupplier.supplier?.email}?subject=LPU LMS Purchase Order Request: ${activeItemForSupplier.name}`}
                className="flex-1"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  leftIcon={<Mail className="w-3.5 h-3.5" />}
                >
                  Email PO
                </Button>
              </a>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}

      {/* MODAL 5: CONFIGURE / EDIT ITEM & MINIMUM SAFETY THRESHOLD */}
      {activeItemForEdit && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setActiveItemForEdit(null)}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EDF8] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  Admin Threshold & Parameters
                </span>
                <h3 className="text-lg font-extrabold text-[#211747]">
                  Configure {activeItemForEdit.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveItemForEdit(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#4A4560]">
                  Item Display Name
                </label>
                <input
                  type="text"
                  required
                  value={activeItemForEdit.name}
                  onChange={(e) =>
                    setActiveItemForEdit({
                      ...activeItemForEdit,
                      name: e.target.value,
                    })
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-amber-800">
                    Minimum Safety Threshold *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={activeItemForEdit.minStockLevel}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        minStockLevel: Number(e.target.value),
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-amber-300 text-sm font-bold bg-amber-50/50 text-[#211747]"
                  />
                  <span className="text-[10px] text-amber-700">
                    Alerts staff when current stock ≤ this value
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Max Storage Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={activeItemForEdit.maxStockLevel}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        maxStockLevel: Number(e.target.value),
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={activeItemForEdit.unitCost}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        unitCost: Number(e.target.value),
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#4A4560]">
                    Plant Location
                  </label>
                  <input
                    type="text"
                    value={activeItemForEdit.location}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        location: e.target.value,
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-[#E5E3F0] text-sm text-[#211747]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EDF8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveItemForEdit(null)}
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

      {/* MODAL 6: USAGE REPORTS & VALUATION ANALYTICS */}
      {showReportModal && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17112F]/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div
              className="fixed inset-0"
              onClick={() => setShowReportModal(false)}
            />

            <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#E5E3F0] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 max-h-[85vh] flex flex-col my-auto">
            <div className="p-6 border-b border-[#F0EDF8] flex items-center justify-between sticky top-0 bg-white">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6633CC]">
                  University Laundry Logistics
                </span>
                <h3 className="text-xl font-extrabold text-[#211747]">
                  Inventory Usage & Valuation Report
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[#6633CC] font-bold">Total Inventory Items</span>
                  <p className="text-2xl font-black text-[#211747] mt-1">
                    {report.totalItems} SKUs
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 font-bold">Total Current Asset Value</span>
                  <p className="text-2xl font-black text-emerald-900 mt-1">
                    ₹{report.totalValuation.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-800 font-bold">Items Requiring Reorder</span>
                  <p className="text-2xl font-black text-amber-900 mt-1">
                    {report.lowStockCount} Items
                  </p>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-[#211747]">
                  Category Consumption & Asset Breakdown
                </h4>
                <div className="border border-[#E5E3F0] rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF9FD] text-[#6B6780] font-bold border-b border-[#E5E3F0]">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Items Count</th>
                        <th className="p-3">Total Asset Valuation</th>
                        <th className="p-3">Threshold Breaches</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EDF8]">
                      {report.categoryBreakdown.map((c) => (
                        <tr key={c.category} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-[#211747] flex items-center gap-1.5">
                            {getCategoryIcon(c.category)}
                            {c.category}
                          </td>
                          <td className="p-3">{c.itemCount} SKUs</td>
                          <td className="p-3 font-bold text-emerald-700">
                            ₹{c.valTotal.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            {c.lowStockInCat > 0 ? (
                              <span className="text-amber-700 font-bold">
                                {c.lowStockInCat} low
                              </span>
                            ) : (
                              <span className="text-emerald-700">All Safe</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#F0EDF8] bg-[#FAF9FD] flex items-center justify-between">
              <span className="text-[11px] text-[#8F8A9E]">
                Generated on: {new Date().toLocaleDateString("en-GB")}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert("Report exported to PDF/CSV.");
                  setShowReportModal(false);
                }}
              >
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </ClientPortal>
      )}
    </div>
  );
}
