import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import staffApi from '../api/staffApi';
import {
  StatusBadge,
  PaymentBadge,
  PremiumBadge,
} from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export const OrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Multi-tier dynamic filter options fetched from backend
  const [filterTree, setFilterTree] = useState({
    hostels: [],
    statuses: ['Placed', 'Collected', 'Washing', 'Ready', 'Delivered'],
    paymentStatuses: ['Unpaid', 'Partly Paid', 'Paid'],
  });

  // Selected filter states
  const [selectedHostel, setSelectedHostel] = useState(
    searchParams.get('hostel') || ''
  );
  const [selectedBlock, setSelectedBlock] = useState(
    searchParams.get('block') || ''
  );
  const [selectedRoom, setSelectedRoom] = useState(
    searchParams.get('room') || ''
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('status') || ''
  );
  const [selectedPayment, setSelectedPayment] = useState(
    searchParams.get('payment') || ''
  );
  const [premiumOnly, setPremiumOnly] = useState(
    searchParams.get('premium') === 'true'
  );
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || ''
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    totalOrders: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch dynamic filter tree options (Hostels, Blocks, Rooms)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await staffApi.getFilters();
        if (res.success && res.data) {
          setFilterTree(res.data);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Compute dependent dropdown options based on selections
  const currentHostelObj = filterTree.hostels.find(
    (h) => h.name === selectedHostel
  );
  const availableBlocks = currentHostelObj ? currentHostelObj.blocks : [];

  const currentBlockObj = availableBlocks.find(
    (b) => b.name === selectedBlock
  );
  const availableRooms = currentBlockObj ? currentBlockObj.rooms : [];

  // When hostel changes, clear block and room if not available
  const handleHostelChange = (e) => {
    const newHostel = e.target.value;
    setSelectedHostel(newHostel);
    setSelectedBlock('');
    setSelectedRoom('');
    setCurrentPage(1);
  };

  const handleBlockChange = (e) => {
    const newBlock = e.target.value;
    setSelectedBlock(newBlock);
    setSelectedRoom('');
    setCurrentPage(1);
  };

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters button
  const handleClearFilters = () => {
    setSelectedHostel('');
    setSelectedBlock('');
    setSelectedRoom('');
    setSelectedStatus('');
    setSelectedPayment('');
    setPremiumOnly(false);
    setSearchInput('');
    setCurrentPage(1);
    setSearchParams({});
  };

  // 2. Fetch Orders with active queries
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 10,
      };

      if (selectedHostel) params.hostel = selectedHostel;
      if (selectedBlock) params.block = selectedBlock;
      if (selectedRoom) params.room = selectedRoom;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPayment) params.payment = selectedPayment;
      if (premiumOnly) params.premium = 'true';
      if (searchInput.trim()) params.search = searchInput.trim();

      // Sync URL query params
      const urlQuery = {};
      Object.keys(params).forEach((key) => {
        if (params[key]) urlQuery[key] = params[key].toString();
      });
      setSearchParams(urlQuery);

      const res = await staffApi.getOrders(params);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setPagination(
          res.data.pagination || {
            totalOrders: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
          }
        );
      }
    } catch (err) {
      setError(err.message || 'Could not fetch orders.');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    selectedHostel,
    selectedBlock,
    selectedRoom,
    selectedStatus,
    selectedPayment,
    premiumOnly,
    searchInput,
    setSearchParams,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const hasActiveFilters =
    Boolean(selectedHostel) ||
    Boolean(selectedBlock) ||
    Boolean(selectedRoom) ||
    Boolean(selectedStatus) ||
    Boolean(selectedPayment) ||
    premiumOnly ||
    Boolean(searchInput);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Laundry Orders
          </h1>
          <p className="text-gray-500 text-base mt-1">
            Browse, search, and manage all student laundry requests across hostels.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-sm flex items-center gap-2 text-sm transition"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, room, or order number (e.g. ORD-1001)..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* 3 Dependent Cascading Dropdowns: Hostel -> Block -> Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Dropdown 1: Hostel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              1. Hostel
            </label>
            <select
              value={selectedHostel}
              onChange={handleHostelChange}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Hostels</option>
              {filterTree.hostels.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Block (Dependent on Hostel) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              2. Block
            </label>
            <select
              value={selectedBlock}
              onChange={handleBlockChange}
              disabled={!selectedHostel}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="">
                {selectedHostel ? 'All Blocks in this Hostel' : 'Select a Hostel first'}
              </option>
              {availableBlocks.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 3: Room (Dependent on Block) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              3. Room Number
            </label>
            <select
              value={selectedRoom}
              onChange={handleRoomChange}
              disabled={!selectedBlock}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="">
                {selectedBlock ? 'All Rooms in this Block' : 'Select a Block first'}
              </option>
              {availableRooms.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filters: Status, Payment, Premium-only, and Clear Button */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
          {/* Status Filter */}
          <div className="min-w-[160px]">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Collected">Collected</option>
              <option value="Washing">Washing</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="min-w-[160px]">
            <select
              value={selectedPayment}
              onChange={(e) => {
                setSelectedPayment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              <option value="Unpaid">Not Paid</option>
              <option value="Partly Paid">Partly Paid</option>
              <option value="Paid">Paid in Full</option>
            </select>
          </div>

          {/* Premium Only Checkbox */}
          <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-900 font-semibold text-sm cursor-pointer hover:bg-amber-100/60 transition">
            <input
              type="checkbox"
              checked={premiumOnly}
              onChange={(e) => {
                setPremiumOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
            />
            <span>Show Premium Only</span>
          </label>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 py-2 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <X size={16} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <LoadingSpinner message="Searching laundry records..." />
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800">
          <p className="font-semibold">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            hasActiveFilters
              ? 'No laundry requests match your current filters. Try resetting the filters.'
              : 'There are currently no laundry orders in the system.'
          }
          actionButton={
            hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Clear all filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Order No.</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Hostel / Room</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className={`hover:bg-blue-50/40 transition cursor-pointer ${
                      order.isPremium ? 'bg-amber-50/50 hover:bg-amber-100/50' : ''
                    }`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">
                          {order.orderNumber}
                        </span>
                        {order.isPremium && <PremiumBadge />}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">
                        {order.student?.name || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.student?.phone || 'No phone'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      <p className="font-medium">
                        {order.student?.hostel} • {order.student?.block}
                      </p>
                      <p className="text-gray-500">Room {order.student?.roomNumber}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="space-y-1">
                        <PaymentBadge status={order.payment?.status} />
                        <p className="text-xs font-bold text-gray-900">
                          ₹{order.payment?.totalAmount || 0}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order._id}`);
                        }}
                        className="py-2 px-4 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 font-semibold text-sm rounded-xl transition"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (for phone staff users) */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className={`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 cursor-pointer ${
                  order.isPremium ? 'border-amber-300 bg-amber-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">
                      {order.orderNumber}
                    </span>
                    {order.isPremium && <PremiumBadge />}
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="pt-2 border-t border-gray-100 text-sm space-y-1">
                  <p className="text-gray-900 font-bold">
                    {order.student?.name}
                  </p>
                  <p className="text-gray-600">
                    {order.student?.hostel}, {order.student?.block}, Room {order.student?.roomNumber}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <PaymentBadge status={order.payment?.status} />
                  <span className="font-bold text-gray-900 text-base">
                    ₹{order.payment?.totalAmount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-600">
              Showing page <strong className="text-gray-900">{pagination.currentPage}</strong> of{' '}
              <strong className="text-gray-900">{pagination.totalPages}</strong> ({pagination.totalOrders} total orders)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="py-2 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition"
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>

              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="py-2 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition"
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
