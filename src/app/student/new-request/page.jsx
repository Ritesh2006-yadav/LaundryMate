'use client';
import { readApiResponse } from '@/lib/api-client';
import { Suspense } from 'react';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Shirt,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { CLOTHING_CATALOG, calculateOrderPrice } from '@/lib/pricing';

function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPremium = searchParams.get('service') === 'premium';

  const [serviceType, setServiceType] = useState(initialPremium ? 'premium' : 'regular');
  const [selectedItems, setSelectedItems] = useState([
    { clothingType: 'Shirt', requestedCount: 2, isPremium: initialPremium, specialInstructions: '' },
    { clothingType: 'Jeans / Trousers', requestedCount: 1, isPremium: initialPremium, specialInstructions: '' },
  ]);

  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState('7:00 – 8:00 PM');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Photos upload state
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Dynamic pricing breakdown
  const isPremium = serviceType === 'premium';
  const pricing = useMemo(() => {
    return calculateOrderPrice(
      selectedItems.map((item) => ({ ...item, isPremium })),
      isPremium
    );
  }, [selectedItems, isPremium]);

  const handleAddItem = (clothingName) => {
    const existing = selectedItems.find((i) => i.clothingType === clothingName);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.clothingType === clothingName ? { ...i, requestedCount: i.requestedCount + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { clothingType: clothingName, requestedCount: 1, isPremium, specialInstructions: '' },
      ]);
    }
  };

  const handleUpdateCount = (index, delta) => {
    setSelectedItems((prev) => {
      const updated = [...prev];
      const newCount = updated[index].requestedCount + delta;
      if (newCount <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].requestedCount = newCount;
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadNotice('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed');
      }

      setPhotos((prev) => [...prev, data.url]);
      setUploadNotice(data.message);
    } catch (err) {
      setError(err.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError('Please add at least one garment.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        items: pricing.items,
        serviceType,
        isPremium,
        specialInstructions,
        photos,
        pickupPreferences: {
          pickupDate,
          pickupTime,
        },
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Order creation failed');
      }

      setSuccessOrder(data.data);
    } catch (err) {
      setError(err.message || 'Error creating laundry request');
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#e9f7ee] text-[#1b4332] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Request Submitted!</h2>
        <p className="text-xs text-gray-500 mt-1">
          Your laundry request has been registered in the hostel system.
        </p>

        <div className="my-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-mono font-bold text-gray-900">{successOrder.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service:</span>
            <span className="font-semibold">{successOrder.isPremium ? '✨ Premium Dry Clean' : 'Regular Wash'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pickup Slot:</span>
            <span className="font-semibold">{successOrder.pickupPreferences?.pickupDate} ({successOrder.pickupPreferences?.pickupTime})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Items:</span>
            <span className="font-semibold">{pricing.totalItemsCount} garments</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
            <span className="font-bold text-gray-900">Total Estimated Price:</span>
            <span className="font-bold text-[#1b4332]">₹{successOrder.payment?.totalAmount}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setSuccessOrder(null);
              setSelectedItems([]);
              setPhotos([]);
            }}
            className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            Create Another
          </button>
          <button
            onClick={() => router.push(`/student/orders?selected=${successOrder.orderId}`)}
            className="px-5 py-2 text-xs font-semibold bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg shadow-sm transition"
          >
            Track Order Progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">New Laundry Request</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Choose your service type, add garments, upload photos, and confirm pickup preferences.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Garment selection & photos (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Switcher */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              Select Laundry Service Tier
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setServiceType('regular')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  serviceType === 'regular'
                    ? 'border-[#1b4332] bg-[#e9f7ee] text-[#1b4332] ring-2 ring-[#1b4332]'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Shirt size={18} />
                  <span>Regular Wash & Iron</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Standard detergent wash, spin dry & crisp iron. ₹15–₹30 per item.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setServiceType('premium')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  serviceType === 'premium'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-600'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <Sparkles size={18} />
                  <span>Premium Dry Cleaning</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Solvent care for blazers, silk, expensive & delicate items. ₹50–₹90 per item.
                </p>
              </button>
            </div>
          </div>

          {/* Garment Catalog Quick Buttons */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
              Add Clothing Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_CATALOG.map((cat) => {
                const currentPrice = isPremium ? cat.premiumPrice : cat.defaultPrice;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleAddItem(cat.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-[#e9f7ee] hover:border-[#b7e4c7] hover:text-[#1b4332] text-xs font-medium transition"
                  >
                    <Plus size={14} />
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">₹{currentPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Garments Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Garments in this Request ({pricing.totalItemsCount})
              </h3>
              <span className="text-xs text-gray-500">Adjust counts below</span>
            </div>

            {selectedItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No items added yet. Click from the clothing types above.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pricing.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.clothingType}</p>
                      <p className="text-[11px] text-gray-400">
                        ₹{item.unitPrice} each {item.isPremium ? '· Dry Clean' : '· Wash & Press'}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleUpdateCount(idx, -1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-gray-900"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-gray-900">
                        {item.requestedCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCount(idx, 1)}
                        className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-gray-900"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-16 text-right font-bold text-gray-900 font-mono">
                      ₹{item.subtotal}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-gray-400 hover:text-red-600 p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clothing Photographs Upload */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Garment Photographs
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Optional: Upload photos of delicate clothes, existing stains, or tags for safe handling.
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition">
                <Upload size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploadNotice && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                {uploadNotice}
              </p>
            )}

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                    <img src={url} alt={`Garment ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Special Instructions */}
          {isPremium && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Special Washing Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Do not bleach white shirts, handle woolen sweater on gentle cycle, remove cuff stains..."
              className="w-full p-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
            />
          </div>
          )}
        </div>

        {/* Right Column: Preferences, Price Summary & Submit (1 col) */}
        <div className="space-y-6">
          {/* Pickup Preferences */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Pickup Preferences
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Preferred Pickup Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Preferred Time Window
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                >
                  <option value="8:00 – 9:00 AM">Morning 8:00 – 9:00 AM</option>
                  <option value="7:00 – 8:00 PM">Evening 7:00 – 8:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Item-wise Price Breakdown & Summary */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
              Order Summary
            </h3>

            <div className="space-y-1.5 text-xs">
              {pricing.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span>
                    {item.clothingType} × {item.requestedCount}
                  </span>
                  <span className="font-mono">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Total Items:</span>
                <span className="font-semibold text-gray-800">{pricing.totalItemsCount}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Service Type:</span>
                <span className="font-semibold text-gray-800">
                  {isPremium ? 'Premium Dry Clean' : 'Regular Wash'}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Estimated Total:</span>
                <span className="text-[#1b4332] font-mono">₹{pricing.totalAmount}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Final bill verified upon staff garment collection.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-60"
            >
              {submitting ? 'Submitting Request...' : 'Confirm Laundry Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewRequestPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading...</div>}>
      <NewRequestPage />
    </Suspense>
  );
}
