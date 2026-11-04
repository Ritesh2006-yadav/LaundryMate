'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  Sparkles,
  CreditCard,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge, PaymentBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function StudentDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    readyForDelivery: 0,
    pendingPayments: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await readApiResponse(res);
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your laundry dashboard..." />;
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'Active Orders',
      value: stats.activeOrders,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'Ready for Delivery',
      value: stats.readyForDelivery,
      icon: Sparkles,
      color: 'bg-[#e9f7ee] text-[#1b4332] border-[#b7e4c7]',
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments,
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Action */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome to LaundryMate!
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Schedule a laundry pickup or track your current active garments seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Refresh metrics"
          >
            <RefreshCw size={18} />
          </button>

          <Link
            href="/student/new-request"
            className="inline-flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <PlusCircle size={18} />
            <span>New Laundry Request</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${c.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Services Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-white border border-[#b7e4c7] p-5 rounded-xl">
          <div className="flex items-center gap-2 text-[#1b4332] font-bold text-sm mb-1">
            <CheckCircle2 size={18} />
            <span>Regular Hostel Wash & Fold</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Everyday laundry including shirts, t-shirts, jeans, and bedsheets washed, dried, and crisply pressed at ₹15–₹30.
          </p>
          <Link
            href="/student/new-request"
            className="text-xs font-bold text-[#1b4332] hover:underline inline-flex items-center gap-1"
          >
            Create regular order <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
            <Sparkles size={18} />
            <span>Premium Dry Cleaning Service</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Special delicate care for woolen blazers, suits, ethnic silk wear, and delicate garments with solvent treatment.
          </p>
          <Link
            href="/student/premium-cleaning"
            className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
          >
            Explore premium cleaning <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Recent Laundry Requests
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Your latest submissions and real-time statuses
            </p>
          </div>

          <Link
            href="/student/orders"
            className="text-xs font-semibold text-[#1b4332] hover:underline inline-flex items-center gap-1"
          >
            View all orders <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No laundry requests yet"
              description="You have not submitted any laundry requests so far. Create your first request to get started!"
              action={
                <Link
                  href="/student/new-request"
                  className="inline-flex items-center gap-2 bg-[#1b4332] text-white px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  <PlusCircle size={16} /> Create Request
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order ID</th>
                  <th className="px-5 py-3 font-semibold">Garments</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Total Price</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const itemCount = order.items.reduce(
                    (acc, it) => acc + (it.requestedCount || 1),
                    0
                  );
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-bold text-gray-900 font-mono">
                        {order.orderId}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {itemCount} items
                        <span className="block text-[11px] text-gray-400">
                          {order.items.map((i) => i.clothingType).slice(0, 2).join(', ')}
                          {order.items.length > 2 ? '...' : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {order.isPremium ? (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ✨ Premium Dry Clean
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            Regular Wash
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">
                        ₹{order.payment?.totalAmount || 0}
                      </td>
                      <td className="px-5 py-3.5">
                        <PaymentBadge status={order.payment?.status || 'Pending'} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/student/orders?selected=${order.orderId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1b4332] hover:text-[#2d6a4f] bg-[#e9f7ee] px-2.5 py-1 rounded"
                        >
                          <Eye size={14} /> Track
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
