'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Save,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function StaffCollectionsPage() {
  const [hostel, setHostel] = useState('Cauvery Hostel');
  const [block, setBlock] = useState('Block A');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active collection modal
  const [collectingOrder, setCollectingOrder] = useState(null);
  const [itemCounts, setItemCounts] = useState({});
  const [collectionNotes, setCollectionNotes] = useState('');
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hostel) params.append('hostel', hostel);
      if (block) params.append('block', block);

      const res = await fetch(`/api/collections?${params.toString()}`);
      const data = await readApiResponse(res);
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Fetch collections error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [hostel, block]);

  const openCollectionModal = (order) => {
    setCollectingOrder(order);
    setMessage('');
    setCollectionNotes(order.collectionDetails?.staffNotes || '');

    // Initialize counts with existing collected counts or requested counts
    const initial = {};
    order.items?.forEach((item) => {
      initial[item._id] = item.collectedCount > 0 ? item.collectedCount : item.requestedCount;
    });
    setItemCounts(initial);
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!collectingOrder) return;

    setSaving(true);
    setMessage('');

    try {
      const payload = {
        collectionDate,
        staffNotes: collectionNotes,
        collectedItems: collectingOrder.items.map((item) => ({
          _id: item._id,
          clothingType: item.clothingType,
          collectedCount: Number(itemCounts[item._id] !== undefined ? itemCounts[item._id] : item.requestedCount),
        })),
      };

      const res = await fetch(`/api/orders/${collectingOrder._id}/collection`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to record collection');
      }

      setMessage('Garment collection recorded successfully!');
      fetchCollections();
      setTimeout(() => {
        setCollectingOrder(null);
      }, 700);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Hostel-Wise Collection Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Select a hostel block to view room pickups, verify clothing quantities, and record count discrepancies.
          </p>
        </div>

        <button
          onClick={fetchCollections}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Hostel & Block Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Building size={16} className="text-[#1b4332]" />
            <span className="text-xs font-bold text-gray-700 uppercase">Hostel:</span>
            <select
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] font-semibold"
            >
              <option value="Cauvery Hostel">Cauvery Hostel</option>
              <option value="Ganga Hostel">Ganga Hostel</option>
              <option value="Yamuna Hostel">Yamuna Hostel</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase">Block:</span>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] font-semibold"
            >
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="North Wing">North Wing</option>
              <option value="South Wing">South Wing</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing orders in <span className="font-bold text-gray-800">{hostel} ({block})</span>
        </div>
      </div>

      {/* Table of Orders Needing Collection */}
      {loading ? (
        <LoadingSpinner message="Loading collection roster..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No pending collections in this block"
          description={`All garments in ${hostel} (${block}) are collected or no new requests submitted.`}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Room No</th>
                  <th className="px-5 py-3 font-semibold">Student Name / Reg</th>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-5 py-3 font-semibold">Requested Clothes</th>
                  <th className="px-5 py-3 font-semibold">Actual Collected</th>
                  <th className="px-5 py-3 font-semibold">Discrepancy Status</th>
                  <th className="px-5 py-3 font-semibold">Current State</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const reqTotal = order.items.reduce((s, i) => s + (i.requestedCount || 0), 0);
                  const colTotal = order.items.reduce((s, i) => s + (i.collectedCount || 0), 0);
                  const hasDiscrepancy = order.collectionDetails?.countDiscrepancy || (colTotal > 0 && reqTotal !== colTotal);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-bold text-gray-900 font-mono text-sm">
                        {order.student?.roomNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{order.student?.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {order.student?.registrationNumber} · Ph: {order.student?.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-700">
                        {order.orderId}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-900">{reqTotal} items</span>
                        <div className="text-[10px] text-gray-500 space-x-1">
                          {order.items.map((it, idx) => (
                            <span key={idx}>
                              {it.clothingType} ({it.requestedCount}){idx < order.items.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {colTotal > 0 ? (
                          <span className="font-bold text-[#1b4332] font-mono">
                            {colTotal} items
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not recorded yet</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {hasDiscrepancy ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <AlertTriangle size={12} /> Count Discrepancy
                          </span>
                        ) : colTotal > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 size={12} /> Verified Exact
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Pending count</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openCollectionModal(order)}
                          className="px-3 py-1.5 bg-[#1b4332] text-white hover:bg-[#2d6a4f] rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          Record Actuals
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

      {/* Collection Recording Modal */}
      {collectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Record Collected Clothes
                </h3>
                <p className="text-xs text-gray-500">
                  {collectingOrder.student?.name} · Room #{collectingOrder.student?.roomNumber} ({collectingOrder.student?.hostel})
                </p>
              </div>
              <button
                onClick={() => setCollectingOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {message && (
              <p className="text-xs p-2 bg-[#e9f7ee] text-[#1b4332] rounded font-medium">
                {message}
              </p>
            )}

            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                <p className="font-bold text-gray-700 uppercase tracking-wide">
                  Verify Clothing Quantities
                </p>

                {collectingOrder.items?.map((item) => {
                  const reqCount = item.requestedCount;
                  const currentCollected = itemCounts[item._id] !== undefined ? itemCounts[item._id] : reqCount;
                  const diff = currentCollected !== reqCount;

                  return (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border bg-white ${
                        diff ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{item.clothingType}</p>
                        <p className="text-[10px] text-gray-400">
                          Student requested: <span className="font-bold text-gray-700">{reqCount}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-gray-600 font-medium">
                          Collected:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={currentCollected}
                          onChange={(e) =>
                            setItemCounts({
                              ...itemCounts,
                              [item._id]: parseInt(e.target.value || '0', 10),
                            })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded font-mono font-bold text-center text-xs focus:ring-1 focus:ring-[#1b4332]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Collection Date & Time
                </label>
                <input
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Staff Collection Notes & Discrepancy Reason
                </label>
                <textarea
                  rows={2}
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  placeholder="e.g. Student informed 1 shirt kept back; student signed collection voucher."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCollectingOrder(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg font-semibold transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Collection Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
