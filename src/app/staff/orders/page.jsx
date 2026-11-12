'use client';
import { readApiResponse } from '@/lib/api-client';
import { Suspense } from 'react';

import React, { useState, useEffect } from 'react';
const ORDER_STATUSES = ['Request Submitted','Pickup Scheduled','Clothes Collected','Processing','Ready for Delivery','Out for Delivery','Delivered','Cancelled'];
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  X,
  Calendar,
  Clock,
  Sparkles,
  Shirt,
  CheckCircle,
  AlertCircle,
  Truck,
  RotateCw,
} from 'lucide-react';
import { StatusBadge, PaymentBadge } from '@/components/common/Badge';
import TrackingTimeline from '@/components/common/TrackingTimeline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';


function StaffOrdersPage() {
  const searchParams = useSearchParams();

  // Filters
  const [hostel, setHostel] = useState(searchParams.get('hostel') || '');
  const [block, setBlock] = useState(searchParams.get('block') || '');
  const [room, setRoom] = useState(searchParams.get('room') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [payment, setPayment] = useState(searchParams.get('payment') || '');
  const [premium, setPremium] = useState(searchParams.get('premium') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status update modal state
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [modalNotice, setModalNotice] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hostel) params.append('hostel', hostel);
      if (block) params.append('block', block);
      if (room) params.append('room', room);
      if (status) params.append('status', status);
      if (payment) params.append('payment', payment);
      if (premium) params.append('premium', premium);
      if (search) params.append('search', search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await readApiResponse(res);
      if (data.success) {
        setOrders(data.data || []);
        // Check if search matches one exact order
        if (search && data.data?.length === 1) {
          setSelectedOrder(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [hostel, block, room, status, payment, premium]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setEstimatedDelivery(order.estimatedDelivery || '');
    setModalNotice('');
    setStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    setModalNotice('');

    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
          estimatedDelivery,
        }),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status');
      }

      setModalNotice('Status updated successfully!');
      setSelectedOrder(data.data);
      // Refresh list
      fetchOrders();
      setTimeout(() => {
        setStatusModal(false);
      }, 700);
    } catch (err) {
      setModalNotice(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const clearFilters = () => {
    setHostel('');
    setBlock('');
    setRoom('');
    setStatus('');
    setPayment('');
    setPremium('');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Filter by hostel block, room number, or status, and advance orders through the 7 laundry stages.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID (ORD-...), Student Name, Reg No, or Room..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-gray-100 text-xs">
          <select
            value={hostel}
            onChange={(e) => setHostel(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="">All Hostels</option>
            <option value="Cauvery Hostel">Cauvery</option>
            <option value="Ganga Hostel">Ganga</option>
            <option value="Yamuna Hostel">Yamuna</option>
          </select>

          <select
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="North Wing">North Wing</option>
            <option value="South Wing">South Wing</option>
          </select>

          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room No."
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
          </select>

          <select
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="">All Services</option>
            <option value="true">✨ Premium Only</option>
            <option value="false">Regular Only</option>
          </select>
        </div>

        {(hostel || block || room || status || payment || premium || search) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={clearFilters}
              className="text-[11px] text-red-600 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner message="Filtering orders from MongoDB..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Try adjusting your hostel block or search filters."
          action={
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-[#1b4332] text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-5 py-3 font-semibold">Student / Reg No</th>
                  <th className="px-5 py-3 font-semibold">Hostel Location</th>
                  <th className="px-5 py-3 font-semibold">Garments</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const reqTotal = o.items?.reduce((n, i) => n + (i.requestedCount || 0), 0) || 0;
                  const colTotal = o.items?.reduce((n, i) => n + (i.collectedCount || 0), 0) || 0;

                  return (
                    <tr
                      key={o._id}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => setSelectedOrder(o)}
                    >
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                        {o.orderId}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{o.student?.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {o.student?.registrationNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {o.student?.hostel}
                        <span className="block text-[11px] text-gray-400">
                          {o.student?.block} · Rm {o.student?.roomNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-800">
                        <span className="font-semibold">{reqTotal} items</span>
                        {colTotal > 0 && (
                          <span className="block text-[10px] text-gray-500">
                            Collected: {colTotal}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {o.isPremium ? (
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
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <PaymentBadge status={o.payment?.status || 'Pending'} />
                        <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                          ₹{o.payment?.totalAmount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStatusModal(o);
                          }}
                          className="px-2.5 py-1 bg-[#1b4332] text-white hover:bg-[#2d6a4f] rounded text-xs font-semibold transition"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs transition"
                        >
                          View
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

      {/* Order Details Modal */}
      {selectedOrder && !statusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-gray-200 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900 font-mono">
                    {selectedOrder.orderId}
                  </h3>
                  <StatusBadge status={selectedOrder.status} />
                  {selectedOrder.isPremium && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      ✨ Premium
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Student: <span className="font-semibold text-gray-800">{selectedOrder.student?.name}</span> ({selectedOrder.student?.registrationNumber}) · Ph: {selectedOrder.student?.phone || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  Hostel: {selectedOrder.student?.hostel} · {selectedOrder.student?.block} · Room #{selectedOrder.student?.roomNumber}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenStatusModal(selectedOrder)}
                  className="px-3 py-1.5 bg-[#1b4332] text-white rounded-lg text-xs font-semibold hover:bg-[#2d6a4f]"
                >
                  Change Status
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tracking Progress */}
            <TrackingTimeline
              status={selectedOrder.status}
              estimatedDelivery={selectedOrder.estimatedDelivery}
              statusHistory={selectedOrder.statusHistory}
            />

            {/* Garments and Collection Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Garment Breakdown
                </h4>
                <div className="space-y-1.5">
                  {selectedOrder.items?.map((it, i) => (
                    <div key={i} className="flex justify-between bg-white p-2 rounded border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{it.clothingType}</p>
                        <p className="text-[10px] text-gray-500">
                          Requested: {it.requestedCount} | Collected: {it.collectedCount || 0}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-gray-800">₹{it.unitPrice} each</span>
                    </div>
                  ))}
                </div>

                {selectedOrder.specialInstructions && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900">
                    <span className="font-bold">Instructions:</span> {selectedOrder.specialInstructions}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-gray-700 uppercase tracking-wide">
                  Collection & Delivery Notes
                </h4>
                <div className="bg-white p-3 rounded border border-gray-100 space-y-1">
                  <p><span className="font-medium text-gray-700">Collected By:</span> {selectedOrder.collectionDetails?.collectedBy?.name || 'Not collected yet'}</p>
                  <p><span className="font-medium text-gray-700">Discrepancy:</span> {selectedOrder.collectionDetails?.countDiscrepancy ? '⚠️ Quantity difference flagged' : 'None'}</p>
                  {selectedOrder.collectionDetails?.staffNotes && (
                    <p><span className="font-medium text-gray-700">Staff Notes:</span> {selectedOrder.collectionDetails?.staffNotes}</p>
                  )}
                  <p><span className="font-medium text-gray-700">Estimated Delivery:</span> {selectedOrder.estimatedDelivery || 'Not set'}</p>
                </div>

                <div className="bg-white p-3 rounded border border-gray-100">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total: ₹{selectedOrder.payment?.totalAmount}</span>
                    <span>Paid: ₹{selectedOrder.payment?.paidAmount || 0}</span>
                    <span className="text-red-700">Balance: ₹{selectedOrder.payment?.balance || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {selectedOrder.photos && selectedOrder.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Uploaded Garment Photos
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedOrder.photos.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt={`Photo ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Transition Modal */}
      {statusModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Update Order Status ({selectedOrder.orderId})
              </h3>
              <button
                onClick={() => setStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {modalNotice && (
              <p className="text-xs p-2 bg-[#e9f7ee] text-[#1b4332] rounded font-medium">
                {modalNotice}
              </p>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Current Status
                </label>
                <p className="text-xs font-mono font-bold text-gray-600 bg-gray-100 p-2 rounded">
                  {selectedOrder.status}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Advance to Next Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] font-medium"
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
                  Estimated Delivery Date/Time (Optional)
                </label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="e.g. Tomorrow by 7:00 PM or Nov 05, 6:00 PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Status Change Audit Note (Stored in MongoDB)
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Clothes washed in batch #3, ironed, and bagged in Locker 8"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStatusModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg font-semibold transition disabled:opacity-60"
                >
                  {updatingStatus ? 'Saving to Database...' : 'Record Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffOrdersPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading...</div>}>
      <StaffOrdersPage />
    </Suspense>
  );
}
