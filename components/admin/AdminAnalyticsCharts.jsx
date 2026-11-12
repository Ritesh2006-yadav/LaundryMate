"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ExternalLink } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminAnalyticsCharts({
  weeklyOrdersData,
  orderDistributionData,
  totalOrdersCount,
  monthlyOrdersData,
  revenueTrendData,
  totalRevenue,
  complaintStatsData,
  popularServicesData,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E3F0] pb-2">
        <h3 className="text-lg font-extrabold text-[#211747] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#6633CC]" />
          Operations Intelligence & Recharts Visualizations
        </h3>
        <span className="text-xs text-[#8F8A9E]">
          Synced with real storage records
        </span>
      </div>

      {/* Row 1: Weekly Orders Graph & Order Status Distribution (Matches Screen 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Graph 1: Weekly Orders Graph (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-[#211747] text-base">
                Weekly Order Intake Volume
              </h4>
              <p className="text-xs text-[#8F8A9E]">
                Daily laundry orders received from Boys & Girls Hostels
              </p>
            </div>
            <span className="text-xs font-bold text-[#6633CC] bg-purple-50 px-2.5 py-1 rounded-xl">
              Peak: Saturday
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyOrdersData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6633CC" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6633CC" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF8" />
                <XAxis dataKey="day" stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#211747",
                    borderRadius: "14px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#6633CC"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Order Status Distribution Donut Chart (5 cols, matches Screen 11) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-[#211747] text-base">
              Order Status Distribution
            </h4>
            <span className="text-xs text-[#8F8A9E]">Screen 11 Donut</span>
          </div>

          <div className="relative h-56 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#211747]">
                {totalOrdersCount}
              </span>
              <span className="text-xs font-semibold text-[#8F8A9E]">
                Orders
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#F0EDF8]">
            {orderDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-[#4A4560]">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-[#211747]">
                  {item.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Orders Trend & Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Graph 2: Monthly Orders Graph (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-[#211747] text-base">
                Monthly Orders Trend
              </h4>
              <p className="text-xs text-[#8F8A9E]">
                Semester growth trajectory across hostel resident enrollments
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              +104% Semester Growth
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyOrdersData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF8" />
                <XAxis dataKey="month" stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#211747",
                    borderRadius: "14px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#blueArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 6: Revenue Overview (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-[#211747] text-base">
                Revenue Overview (₹)
              </h4>
              <p className="text-xs text-[#8F8A9E]">
                Total tariff collected from student laundry quotas
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#8F8A9E] block">
                Avg: ₹240 / order
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueTrendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF8" />
                <XAxis dataKey="week" stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#211747",
                    borderRadius: "14px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`₹${val}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#F58220" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Complaint Statistics & Most Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Graph 4: Complaint Statistics (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-[#211747] text-base">
                Grievance Inquiries by Category
              </h4>
              <p className="text-xs text-[#8F8A9E]">
                Breakdown of student reported issues across hostel clusters
              </p>
            </div>
            <Link
              href="/staff/complaints"
              className="text-xs font-bold text-[#6633CC] hover:underline flex items-center gap-1"
            >
              Grievance Queue <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={complaintStatsData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0EDF8" />
                <XAxis type="number" stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="type" stroke="#4A4560" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#211747",
                    borderRadius: "14px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#E11D48" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 5: Most Popular Services (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E5E3F0] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-[#211747] text-base">
                Most Popular Services Demand
              </h4>
              <p className="text-xs text-[#8F8A9E]">
                Share of student bookings across the 5 official university services
              </p>
            </div>
            <span className="text-xs font-bold text-[#6633CC]">
              Leader: Wash & Fold (42%)
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularServicesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDF8" />
                <XAxis dataKey="name" stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8F8A9E" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#211747",
                    borderRadius: "14px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val} orders`, "Booking Volume"]}
                />
                <Bar dataKey="orders" fill="#6633CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

