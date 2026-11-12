'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { PaymentBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function StaffPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Record payment modal
  const [activeOrder, setActiveOrder] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await readApiResponse(res);
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openPaymentModal = (order) => {
    setActiveOrder(order);
    setAmount(order.payment?.balance > 0 ? order.payment?.balance.toString() : '0');
    setPaymentMethod('Cash');
    setTransactionRef('');
    setNotes('');
    setVerified(false);
    setMessage('');
    setError('');
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!verified) {
      setError('You must physically verify the cash or digital transaction receipt before recording.');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder._id,
          amount: Number(amount),
          paymentMethod,
          transactionRef,
          notes,
          verified: true,
        }),
      });

      const data = await readApiResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment recording failed');
      }

      setMessage(`Payment of ₹${amount} recorded and verified successfully!`);
      fetchOrders();
      setTimeout(() => {
        setActiveOrder(null);
      }, 700);
    } catch (err) {
      setError(err.message || 'Error recording payment');
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.payment?.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchId = o.orderId.toLowerCase().includes(s);
      const matchName = o.student?.name?.toLowerCase().includes(s);
      const matchReg = o.student?.registrationNumber?.toLowerCase().includes(s);
      return matchId || matchName || matchReg;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Payment Records & Counter Verification
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Accept cash payments at the hostel laundry counter or verify UPI digital slips before confirming receipts.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Student Name, or Reg..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-gray-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
          >
            <option value="all">All Payment States</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Fetching payment records from MongoDB..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No payment records found"
          description="No orders match your payment status and search criteria."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-5 py-3 font-semibold">Student Name / Hostel</th>
                  <th className="px-5 py-3 font-semibold">Total Amount</th>
                  <th className="px-5 py-3 font-semibold">Amount Paid</th>
                  <th className="px-5 py-3 font-semibold">Remaining Balance</th>
                  <th className="px-5 py-3 font-semibold">Payment Mode</th>
                  <th className="px-5 py-3 font-semibold">Payment Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const isPaid = order.payment?.status === 'Paid';
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{order.student?.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {order.student?.hostel} ({order.student?.block} - {order.student?.roomNumber})
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                        ₹{order.payment?.totalAmount}
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-emerald-700">
                        ₹{order.payment?.paidAmount || 0}
                      </td>
                      <td className="px-5 py-3.5 font-bold font-mono text-red-700">
                        ₹{order.payment?.balance || 0}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">
                        {order.payment?.paymentMethod || 'Pending'}
                      </td>
                      <td className="px-5 py-3.5">
                        <PaymentBadge status={order.payment?.status || 'Pending'} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openPaymentModal(order)}
                          disabled={isPaid}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
                            isPaid
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#1b4332] text-white hover:bg-[#2d6a4f]'
                          }`}
                        >
                          {isPaid ? 'Settled' : 'Record Payment'}
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

      {/* Record Payment Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Record & Verify Payment
                </h3>
                <p className="text-xs text-gray-500">
                  Order {activeOrder.orderId} · {activeOrder.student?.name}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Billed:</span>
                  <span className="font-bold font-mono">₹{activeOrder.payment?.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Already Paid:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ₹{activeOrder.payment?.paidAmount || 0}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span className="font-bold text-gray-700">Remaining Balance:</span>
                  <span className="font-bold text-red-700 font-mono">
                    ₹{activeOrder.payment?.balance || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Payment Amount Collected (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={activeOrder.payment?.balance || undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332] font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  >
                    <option value="Cash">Cash at Counter</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">Card Swipe</option>
                    <option value="Manual Verification">Manual Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Txn / Receipt Ref
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI-827364"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Staff Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received exact cash from student during drop-off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
                />
              </div>

              {/* Crucial: Verification checkbox enforcement */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#1b4332] border-gray-300 rounded focus:ring-[#1b4332]"
                  />
                  <span className="text-[11px] text-amber-900 leading-tight">
                    <span className="font-bold">Staff Verification Required:</span> I confirm that I have physically received this cash or verified the transaction on the laundry counter bank terminal.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !verified}
                  className="px-5 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Recording...' : 'Confirm & Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
