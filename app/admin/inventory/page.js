"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Plus,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Search,
  Edit2,
  Save,
  X,
  Package,
  Download,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useInventory, INVENTORY_CATEGORIES } from "@/hooks/useInventory";

export default function AdminInventoryPage() {
  const {
    items,
    updateItem,
    getLowStockItems,
    getInventoryReport,
    categories,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [tempMinStock, setTempMinStock] = useState(0);
  const [tempUnitCost, setTempUnitCost] = useState(0);
  const [successToast, setSuccessToast] = useState("");

  const lowStock = getLowStockItems();
  const report = getInventoryReport();

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setTempMinStock(item.minStockLevel);
    setTempUnitCost(item.unitCost);
  };

  const saveEdit = (itemId) => {
    updateItem(
      itemId,
      {
        minStockLevel: Number(tempMinStock),
        unitCost: Number(tempUnitCost),
      },
      "University Administrator"
    );
    setEditingItemId(null);
    setSuccessToast(`Updated threshold configuration for item.`);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211747] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E3F0] shadow-soft">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-[#6B6780] uppercase tracking-wider">
            Safety Stock & Asset Master
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6633CC]/10 text-[#6633CC]">
            {items.length} Tracked SKUs
          </span>
          {lowStock.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {lowStock.length} Low Stock
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const headers = ["SKU", "Item Name", "Category", "Current Stock", "Unit", "Min Threshold", "Unit Cost (INR)", "Supplier"];
              const rows = filtered.map((i) => [
                i.sku,
                `"${i.name}"`,
                `"${i.category}"`,
                i.currentStock,
                i.unit,
                i.minStockLevel,
                i.unitCost,
                `"${i.supplier?.name || 'N/A'}"`,
              ]);
              const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `lpu_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setSuccessToast("Exported inventory spreadsheet to CSV.");
              setTimeout(() => setSuccessToast(""), 3000);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E3F0] text-xs font-bold text-[#211747] hover:bg-gray-50 hover:border-[#6633CC]/30 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#6633CC]" />
            <span>Export CSV</span>
          </button>
          <Link href="/staff/inventory">
            <Button variant="secondary" size="sm">
              Open Staff Operations View →
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-bold text-[#6B6780]">Total Asset Valuation</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            ₹{report.totalValuation.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-[#8F8A9E]">
            {items.length} Tracked Material SKUs
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-bold text-amber-800">Threshold Breaches</span>
          <p className="text-3xl font-black text-amber-700 mt-1">
            {lowStock.length} Items
          </p>
          <span className="text-[11px] text-amber-700/80">
            Current stock ≤ Configured minimum
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E3F0] shadow-soft">
          <span className="text-xs font-bold text-[#6633CC]">Procurement Categories</span>
          <p className="text-3xl font-black text-[#211747] mt-1">
            {categories.length}
          </p>
          <span className="text-[11px] text-[#8F8A9E]">
            Detergents, Powders, Bags, Packaging
          </span>
        </div>
      </div>

      {/* Configuration Table Card */}
      <div className="bg-white rounded-3xl border border-[#E5E3F0] shadow-soft overflow-hidden">
        <div className="p-5 border-b border-[#F0EDF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-lg text-[#211747]">
              Safety Level Rules & Stock Thresholds
            </h3>
            <p className="text-xs text-[#8F8A9E]">
              Click edit on any item to tune minimum stock level alerts or unit pricing
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search items to configure..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FD] text-[#6B6780] uppercase tracking-wider font-extrabold border-b border-[#F0EDF8]">
              <tr>
                <th className="py-4 px-5">SKU & Item Name</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Current Stock</th>
                <th className="py-4 px-4">Configured Min Threshold</th>
                <th className="py-4 px-4">Unit Cost (₹)</th>
                <th className="py-4 px-4">Primary Supplier</th>
                <th className="py-4 px-5 text-right">Configure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDF8] text-[#211747]">
              {filtered.map((item) => {
                const isEditing = editingItemId === item.id;
                const isLow = item.currentStock <= item.minStockLevel;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#FAF9FD] transition-colors ${
                      isLow ? "bg-amber-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-5">
                      <span className="font-bold text-sm text-[#211747] block">
                        {item.name}
                      </span>
                      <span className="font-mono text-[11px] text-[#6633CC]">
                        {item.sku}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-[#4A4560]">
                      {item.category}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-sm text-[#211747]">
                        {item.currentStock} {item.unit}
                      </span>
                      {isLow && (
                        <span className="text-[10px] text-amber-700 font-bold block">
                          ⚠️ Below Threshold
                        </span>
                      )}
                    </td>

                    {/* Minimum Threshold Configuration */}
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={tempMinStock}
                            onChange={(e) => setTempMinStock(e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg border-2 border-[#6633CC] text-xs font-bold text-[#211747]"
                          />
                          <span className="text-xs font-semibold text-[#6B6780]">
                            {item.unit}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-xs bg-purple-50 text-[#6633CC] px-2.5 py-1 rounded-lg border border-purple-200">
                          {item.minStockLevel} {item.unit}
                        </span>
                      )}
                    </td>

                    {/* Unit Cost */}
                    <td className="py-4 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={tempUnitCost}
                          onChange={(e) => setTempUnitCost(e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg border-2 border-[#6633CC] text-xs font-bold text-[#211747]"
                        />
                      ) : (
                        <span className="font-bold text-xs text-[#211747]">
                          ₹{item.unitCost}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-[#6B6780]">
                      <span className="font-semibold text-[#211747] block">
                        {item.supplier?.name}
                      </span>
                      <span className="text-[10px] text-[#8F8A9E]">
                        Lead: {item.supplier?.leadTimeDays} days
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => saveEdit(item.id)}
                            className="text-xs py-1 px-2.5"
                          >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            Save
                          </Button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(item)}
                          className="text-xs py-1 px-2.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Set Level
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
