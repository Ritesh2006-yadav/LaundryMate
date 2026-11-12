import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Truck,
  Waves,
  CheckCircle2,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import staffApi from '../api/staffApi';
import { StatusBadge, PaymentBadge, PremiumBadge } from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await staffApi.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading staff dashboard..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800">
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cards = data?.cards || {};

  // 6 big dashboard cards with click navigation to filtered lists
  const metricCards = [
    {
      id: 'today',
      title: "Today's New Orders",
      count: cards.todaysNewOrders || 0,
      icon: CalendarDays,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Orders placed since midnight',
      link: '/orders',
    },
    {
      id: 'toCollect',
      title: 'To Collect',
      count: cards.toCollect || 0,
      icon: Truck,
      badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
      description: 'Waiting at student rooms',
      link: '/orders?status=Placed',
    },
    {
      id: 'washing',
      title: 'Washing',
      count: cards.washing || 0,
      icon: Waves,
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      description: 'Currently inside wash cycles',
      link: '/orders?status=Washing',
    },
    {
      id: 'ready',
      title: 'Ready to Deliver',
      count: cards.readyToDeliver || 0,
      icon: CheckCircle2,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Cleaned, packed & ready for pickup',
      link: '/orders?status=Ready',
    },
    {
      id: 'unpaid',
      title: 'Unpaid Orders',
      count: cards.unpaidOrders || 0,
      icon: Receipt,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      description: 'Pending cash or UPI collection',
      link: '/orders?payment=Unpaid',
    },
    {
      id: 'complaints',
      title: 'Open Complaints',
      count: cards.openComplaints || 0,
      icon: AlertTriangle,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Issues needing staff reply',
      link: '/complaints?status=Open',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title & Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Hostel Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Laundry Staff Dashboard
          </h1>
          <p className="text-gray-500 text-base mt-1">
            Overview of student laundry requests, washing stages, and deliveries.
          </p>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 transition"
        >
          <span>View All Orders</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* 6 Big Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.link)}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.badgeColor}`}
                  >
                    <Icon size={28} />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-blue-600">
                <span>Open filtered list</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Laundry Orders</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Latest incoming laundry bags from student hostels
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View all orders →
          </button>
        </div>

        {data?.recentOrders?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No recent orders recorded today.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.recentOrders?.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition cursor-pointer ${
                  order.isPremium ? 'bg-amber-50/40' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">
                      {order.orderNumber}
                    </span>
                    {order.isPremium && <PremiumBadge />}
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    Student: <strong className="text-gray-900">{order.student?.name}</strong> •{' '}
                    {order.student?.hostel}, {order.student?.block}, Room {order.student?.roomNumber}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <PaymentBadge status={order.payment?.status} />
                  <span className="text-base font-bold text-gray-900">
                    ₹{order.payment?.totalAmount || 0}
                  </span>
                  <button className="py-2 px-4 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-semibold text-sm rounded-xl transition">
                    Open Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
