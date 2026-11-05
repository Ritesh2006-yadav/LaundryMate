'use client';
import { readApiResponse } from '@/lib/api-client';
import { Suspense } from 'react';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Eye,
  RefreshCw,
  X,
  Calendar,
  Clock,
  Sparkles,
  Shirt,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge, PaymentBadge } from '@/components/common/Badge';
import TrackingTimeline from '@/components/common/TrackingTimeline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Link from 'next/link';

function StudentOrdersPage() {
  const searchParams = useSearchParams();
  const initialSelected = searchParams.get('selected');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await readApiResponse(res);
      if (data.success) {
        setOrders(data.data || []);
        if (initialSelected) {
          const match = data.data?.find((o) => o.orderId === initialSelected);
          if (match) setSelectedOrder(match);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [initialSelected]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !['Delivered', 'Cancelled'].includes(o.status);
    if (statusFilter === 'delivered') return o.status === 'Delivered';
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Laundry Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track real-time progress, delivery schedules, and view itemized order receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#B95E19]"
          >
            <option value="all">All Orders</option>
            <option value="active">Active Orders</option>
            <option value="delivered">Delivered</option>
            <option value="Request Submitted">Request Submitted</option>
            <option value="Processing">Processing</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your orders..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            statusFilter === 'all'
              ? 'You have not placed any laundry requests yet.'
              : `No orders matching filter "${statusFilter}".`
          }
          action={
            <Link
              href="/student/new-request"
              className="inline-flex items-center gap-2 bg-[#B95E19] text-white px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Submit New Request
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-5 py-3 font-semibold">Submission Date</th>
                  <th className="px-5 py-3 font-semibold">Garments</th>
                  <th className="px-5 py-3 font-semibold">Service Type</th>
                  <th className="px-5 py-3 font-semibold">Current Status</th>
                  <th className="px-5 py-3 font-semibold">Estimated Delivery</th>
                  <th className="px-5 py-3 font-semibold">Total Price</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce(
                    (acc, it) => acc + (it.requestedCount || 1),
                    0
                  );
                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-800 font-medium">
                        {itemCount} garments
                      </td>
                      <td className="px-5 py-3.5">
                        {order.isPremium ? (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ✨ Premium
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">
                        {order.estimatedDelivery || 'Pending schedule'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        ₹{order.payment?.totalAmount || 0}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B95E19] bg-[#FFF1E5] hover:bg-[#FFE1C7] px-2.5 py-1 rounded transition"
                        >
                          <Eye size={14} /> Track & Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-gray-200 my-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 font-mono">
                    {selectedOrder.orderId}
                  </h3>
                  <StatusBadge status={selectedOrder.status} />
                  {selectedOrder.isPremium && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      ✨ Premium Dry Clean
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tracking Timeline Component */}
            <TrackingTimeline
              status={selectedOrder.status}
              estimatedDelivery={selectedOrder.estimatedDelivery}
              statusHistory={selectedOrder.statusHistory}
            />

            {/* Garment Details & Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Garments List */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Clothing Items & Quantities
                </h4>
                <div className="space-y-2 text-xs">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{item.clothingType}</p>
                        <p className="text-[11px] text-gray-400">
                          Requested: {item.requestedCount}
                          {item.collectedCount > 0 && ` | Collected: ${item.collectedCount}`}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-gray-800">
                        ₹{(item.collectedCount > 0 ? item.collectedCount : item.requestedCount) * (item.unitPrice || 15)}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedOrder.specialInstructions && (
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <span className="font-bold">Special Instructions:</span> {selectedOrder.specialInstructions}
                  </div>
                )}
              </div>

              {/* Payment & Schedule Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Payment Status
                  </h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-bold text-gray-900 font-mono">₹{selectedOrder.payment?.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="font-bold text-emerald-700 font-mono">₹{selectedOrder.payment?.paidAmount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Remaining Balance:</span>
                      <span className="font-bold text-red-700 font-mono">₹{selectedOrder.payment?.balance || 0}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-100">
                      <span className="text-gray-500">Payment Status:</span>
                      <PaymentBadge status={selectedOrder.payment?.status || 'Pending'} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Pickup Preferences
                  </h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium text-gray-800">Date:</span> {selectedOrder.pickupPreferences?.pickupDate || 'Not specified'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Window:</span> {selectedOrder.pickupPreferences?.pickupTime || '6:00 – 7:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Photos Preview */}
            {selectedOrder.photos && selectedOrder.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Uploaded Clothing Photos ({selectedOrder.photos.length})
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedOrder.photos.map((photo, i) => (
                    <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <img src={photo} alt={`Garment ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status History Audit */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Status Change Log
                </h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-gray-600 bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{h.newStatus}</span>
                        {h.note && <span className="text-gray-500">— {h.note}</span>}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(h.changedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentOrdersPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading...</div>}>
      <StudentOrdersPage />
    </Suspense>
  );
}
