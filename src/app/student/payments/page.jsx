'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { PaymentBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function StudentPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await readApiResponse(res);
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Compute summary
  const summary = orders.reduce(
    (acc, o) => {
      acc.totalBilled += o.payment?.totalAmount || 0;
      acc.totalPaid += o.payment?.paidAmount || 0;
      acc.totalBalance += o.payment?.balance || 0;
      return acc;
    },
    { totalBilled: 0, totalPaid: 0, totalBalance: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View total amounts, settled payments, and outstanding hostel laundry balances.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Billed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
              ₹{summary.totalBilled}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Amount Settled</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
              ₹{summary.totalPaid}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Outstanding Balance</p>
            <p className="text-2xl font-bold text-red-700 mt-1 font-mono">
              ₹{summary.totalBalance}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching payment history..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No payment records"
          description="You do not have any laundry orders with payment history yet."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-5 py-3 font-semibold">Order Date</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Total Amount</th>
                  <th className="px-5 py-3 font-semibold">Amount Paid</th>
                  <th className="px-5 py-3 font-semibold">Remaining Balance</th>
                  <th className="px-5 py-3 font-semibold">Payment Status</th>
                  <th className="px-5 py-3 font-semibold">Payment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                      {o.orderId}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {new Date(o.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
                    <td className="px-5 py-3.5 font-bold text-gray-900 font-mono">
                      ₹{o.payment?.totalAmount || 0}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-700 font-mono">
                      ₹{o.payment?.paidAmount || 0}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-red-700 font-mono">
                      ₹{o.payment?.balance || 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <PaymentBadge status={o.payment?.status || 'Pending'} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-medium">
                      {o.payment?.paymentMethod || 'Cash on Delivery'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
