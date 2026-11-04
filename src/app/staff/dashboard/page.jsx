'use client';
import { readApiResponse } from '@/lib/api-client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  Layers,
  RotateCw,
  Sparkles,
  Truck,
  CreditCard,
  MessageSquareWarning,
  RefreshCw,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge, PaymentBadge } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todaysNewRequests: 0,
    pendingCollections: 0,
    processingCount: 0,
    premiumOrdersCount: 0,
    readyForDeliveryCount: 0,
    pendingPaymentsCount: 0,
    openComplaintsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await readApiResponse(res);
      if (data.success && data.stats) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (err) {
      console.error('Error loading staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metricCards = [
    {
      label: "Today's New Requests",
      value: stats.todaysNewRequests,
      sub: 'Orders placed today',
      icon: Clock,
      href: '/staff/orders?status=Request+Submitted',
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'Pending Collections',
      value: stats.pendingCollections,
      sub: 'Need hostel room pickup',
      icon: Layers,
      href: '/staff/collections',
      color: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'Currently Processing',
      value: stats.processingCount,
      sub: 'In washing machines',
      icon: RotateCw,
      href: '/staff/orders?status=Processing',
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      label: 'Premium Dry Cleaning',
      value: stats.premiumOrdersCount,
      sub: 'Delicate & blazer care',
      icon: Sparkles,
      href: '/staff/premium-orders',
      color: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      label: 'Ready for Delivery',
      value: stats.readyForDeliveryCount,
      sub: 'Cleaned, folded & bagged',
      icon: Truck,
      href: '/staff/orders?status=Ready+for+Delivery',
      color: 'bg-[#e9f7ee] text-[#1b4332] border-[#b7e4c7]',
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPaymentsCount,
      sub: 'Unpaid / partially paid',
      icon: CreditCard,
      href: '/staff/payments?status=Pending',
      color: 'bg-rose-50 text-rose-700 border-rose-100',
    },
    {
      label: 'Open Complaints',
      value: stats.openComplaintsCount,
      sub: 'Awaiting staff reply',
      icon: MessageSquareWarning,
      href: '/staff/complaints?status=Open',
      color: 'bg-red-50 text-red-700 border-red-100',
    },
    {
      label: 'Total Orders Handled',
      value: stats.totalOrders,
      sub: 'All lifetime records',
      icon: Package,
      href: '/staff/orders',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Laundry Staff Management Operations
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Real-time hostel laundry metrics, pickup workflow, batch processing, and delivery status updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Refresh database numbers"
          >
            <RefreshCw size={18} />
          </button>

          <Link
            href="/staff/collections"
            className="inline-flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Layers size={16} />
            <span>Hostel Collection Sheet</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating real MongoDB statistics..." />
      ) : (
        <>
          {/* 8 Live Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metricCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Link
                  key={i}
                  href={card.href}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#1b4332] shadow-sm hover:shadow transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-[#1b4332] transition">
                      {card.label}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 font-mono">
                      {card.value}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Operations Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/staff/collections"
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#1b4332] shadow-sm transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-gray-900">Hostel Collections</p>
                <p className="text-[11px] text-gray-500">View room-wise garments ready to collect</p>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-[#1b4332] transition" />
            </Link>

            <Link
              href="/staff/premium-orders"
              className="p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 shadow-sm transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-amber-950">Premium Dry Cleaning Queue</p>
                <p className="text-[11px] text-amber-700">Inspect delicate fabrics and blazer tags</p>
              </div>
              <Sparkles size={16} className="text-amber-600 group-hover:text-amber-800 transition" />
            </Link>

            <Link
              href="/staff/payments"
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-[#1b4332] shadow-sm transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-gray-900">Payment Verification</p>
                <p className="text-[11px] text-gray-500">Record cash & verified online payments</p>
              </div>
              <CreditCard size={16} className="text-gray-400 group-hover:text-[#1b4332] transition" />
            </Link>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Recent Orders Across Hostels
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Latest student requests submitted to the laundry counter
                </p>
              </div>

              <Link
                href="/staff/orders"
                className="text-xs font-semibold text-[#1b4332] hover:underline inline-flex items-center gap-1"
              >
                View all orders <ArrowRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No recent orders"
                  description="No orders have been recorded yet in MongoDB."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Order ID</th>
                      <th className="px-5 py-3 font-semibold">Student / Reg No.</th>
                      <th className="px-5 py-3 font-semibold">Hostel & Room</th>
                      <th className="px-5 py-3 font-semibold">Service</th>
                      <th className="px-5 py-3 font-semibold">Order Status</th>
                      <th className="px-5 py-3 font-semibold">Payment</th>
                      <th className="px-5 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                          {order.orderId}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-900">
                            {order.student?.name || 'Student'}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {order.student?.registrationNumber}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">
                          {order.student?.hostel}
                          <span className="block text-[11px] text-gray-400">
                            {order.student?.block} · Rm {order.student?.roomNumber}
                          </span>
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
                        <td className="px-5 py-3.5">
                          <PaymentBadge status={order.payment?.status || 'Pending'} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/staff/orders?search=${order.orderId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1b4332] bg-[#e9f7ee] hover:bg-[#d8f3dc] px-2.5 py-1 rounded transition"
                          >
                            <Eye size={14} /> Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
