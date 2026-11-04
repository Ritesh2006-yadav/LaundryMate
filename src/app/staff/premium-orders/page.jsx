'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
const ORDER_STATUSES = ['Request Submitted','Pickup Scheduled','Clothes Collected','Processing','Ready for Delivery','Out for Delivery','Delivered','Cancelled'];
import {
  Sparkles,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  X,
  RotateCw,
} from 'lucide-react';
import { StatusBadge, PaymentBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';


export default function StaffPremiumOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchPremiumOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?premium=true');
      const data = await readApiResponse(res);
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching premium orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumOrders();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    setNotice('');

    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
        }),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');

      setNotice('Premium order status updated successfully!');
      setSelectedOrder(data.data);
      fetchPremiumOrders();
    } catch (err) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-white p-6 rounded-xl border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Specialized Queue
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Premium Dry-Cleaning & Garment Care Desk
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Dedicated queue for woolen blazers, silk kurtas, suits, and garments requiring solvent care and individual tags.
          </p>
        </div>

        <button
          onClick={fetchPremiumOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 p-2 bg-white border border-amber-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-amber-50"
        >
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading premium dry cleaning orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No premium orders active"
          description="There are currently no premium dry cleaning requests in the queue."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm space-y-4 hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="font-mono font-bold text-xs text-amber-900">
                    {order.orderId}
                  </span>
                  <p className="text-xs font-semibold text-gray-900">
                    {order.student?.name} · {order.student?.hostel} (Rm {order.student?.roomNumber})
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Garment Details */}
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 space-y-1 text-xs">
                <p className="font-bold text-amber-950 uppercase text-[10px] tracking-wide">
                  Dry-Clean Items:
                </p>
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-gray-800">
                    <span>
                      {it.clothingType} × {it.requestedCount}
                    </span>
                    <span className="font-mono font-semibold">₹{it.unitPrice} ea</span>
                  </div>
                ))}
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="font-bold text-amber-900">Special Instructions:</span>{' '}
                  {order.specialInstructions}
                </div>
              )}

              {/* Photos */}
              {order.photos && order.photos.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <ImageIcon size={13} /> Garment Photographs ({order.photos.length}):
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {order.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt={`Garment ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Action Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Bill: </span>
                  <span className="font-bold text-gray-900 text-xs">₹{order.payment?.totalAmount}</span>
                  <span className="ml-2">
                    <PaymentBadge status={order.payment?.status || 'Pending'} />
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setNewStatus(order.status);
                    setStatusNote('');
                    setNotice('');
                  }}
                  className="px-3 py-1.5 bg-[#1b4332] text-white hover:bg-[#2d6a4f] rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Manage & Advance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Detail / Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Premium Order Care ({selectedOrder.orderId})
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {notice && (
              <p className="text-xs p-2 bg-[#e9f7ee] text-[#1b4332] rounded font-medium">
                {notice}
              </p>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Update Processing Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] font-semibold"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Dry-Cleaning Solvent & Handling Note
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Applied enzymatic spot remover to collar stain, low heat dry-clean drum completed."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg font-semibold transition disabled:opacity-60"
                >
                  {updating ? 'Saving...' : 'Update Processing Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
