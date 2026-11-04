import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Home,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Plus,
  Minus,
  Clock,
  Sparkles,
  Camera,
  CreditCard,
  Check,
} from 'lucide-react';
import staffApi from '../api/staffApi';
import {
  StatusBadge,
  PaymentBadge,
  PremiumBadge,
} from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';

const NEXT_STATUS_MAP = {
  Placed: 'Collected',
  Collected: 'Washing',
  Washing: 'Ready',
  Ready: 'Delivered',
  Delivered: null, // End of lifecycle
};

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Collection counting state
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [collectionItems, setCollectionItems] = useState([]);
  const [staffNotes, setStaffNotes] = useState('');
  const [collectionSaving, setCollectionSaving] = useState(false);
  const [collectionWarning, setCollectionWarning] = useState('');

  // Status progression state
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Payment management state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await staffApi.getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data);
        // Initialize collection items from existing order
        setCollectionItems(
          (res.data.items || []).map((item) => ({
            ...item,
            collectedCount:
              typeof item.collectedCount === 'number' && item.collectedCount > 0
                ? item.collectedCount
                : item.requestedCount,
          }))
        );
        setStaffNotes(res.data.collectionDetails?.staffNotes || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-red-800 max-w-lg mx-auto text-center">
        <p className="font-bold text-lg mb-4">{error || 'Order not found'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS_MAP[order.status];

  // Collection counts auto-calculation
  const totalRequestedCount = (order.items || []).reduce(
    (sum, item) => sum + (item.requestedCount || 0),
    0
  );
  const currentTotalCollected = collectionItems.reduce(
    (sum, item) => sum + (Number(item.collectedCount) || 0),
    0
  );
  const countMismatch = totalRequestedCount !== currentTotalCollected;

  // Handle +/- collection buttons
  const updateItemCount = (index, delta) => {
    setCollectionItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const newCount = Math.max(0, (item.collectedCount || 0) + delta);
        return { ...item, collectedCount: newCount };
      })
    );
  };

  // 5. Submit collection counts
  const handleSaveCollection = async () => {
    try {
      setCollectionSaving(true);
      setCollectionWarning('');
      const res = await staffApi.recordCollection(order._id, {
        items: collectionItems,
        staffNotes,
      });

      if (res.success) {
        setOrder(res.data);
        setShowCollectionForm(false);
        setActionSuccess('Clothing collection counts recorded successfully!');
        if (res.discrepancyWarning) {
          setCollectionWarning(res.discrepancyWarning);
        }
        setTimeout(() => setActionSuccess(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save collection counts');
    } finally {
      setCollectionSaving(false);
    }
  };

  // 6. Advance Order Status
  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    try {
      setStatusUpdating(true);
      const res = await staffApi.updateOrderStatus(order._id, {
        status: nextStatus,
      });

      if (res.success) {
        setOrder(res.data);
        setShowStatusConfirm(false);
        setActionSuccess(`Order status successfully updated to "${nextStatus}"!`);
        setTimeout(() => setActionSuccess(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // 7. Manage Payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    const amountNum = Number(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setPaymentSaving(true);
      const res = await staffApi.recordPayment(order._id, {
        amount: amountNum,
        paymentMethod,
        transactionRef,
        notes: paymentNotes,
      });

      if (res.success) {
        setOrder(res.data.order);
        setShowPaymentModal(false);
        setPaymentAmount('');
        setTransactionRef('');
        setPaymentNotes('');
        setActionSuccess(`Payment of ₹${amountNum} recorded successfully!`);
        setTimeout(() => setActionSuccess(''), 5000);
      }
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setPaymentSaving(false);
    }
  };

  // Separate regular vs premium items
  const regularItems = (order.items || []).filter((i) => !i.isPremium);
  const premiumItems = (order.items || []).filter((i) => i.isPremium);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-base font-semibold text-gray-600 hover:text-gray-900 transition self-start"
        >
          <ArrowLeft size={20} />
          <span>Back to All Orders</span>
        </button>

        <div className="flex items-center gap-3">
          {order.isPremium && <PremiumBadge />}
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 font-semibold text-base shadow-sm">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Discrepancy Warning Banner */}
      {(collectionWarning || order.collectionDetails?.countDiscrepancy) && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-start gap-3 text-base shadow-sm">
          <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Quantity Discrepancy Notice</p>
            <p className="text-sm mt-0.5">
              The collected clothing quantity differs from the count originally requested by the student.
              {order.collectionDetails?.staffNotes && (
                <span className="block italic mt-1">
                  Staff note: “{order.collectionDetails.staffNotes}”
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* BIG PRIMARY WORKFLOW ACTION BAR */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Next Processing Step
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
            Current Status: {order.status}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {nextStatus
              ? `Advance this order to the next step: "${nextStatus}".`
              : 'This laundry order has been delivered and completed.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Step 5 Action: Record/Edit Collection Count */}
          <button
            onClick={() => setShowCollectionForm(!showCollectionForm)}
            className="py-3.5 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-base transition flex items-center gap-2"
          >
            <span>{order.status === 'Placed' ? 'Count & Verify Items' : 'Edit Item Counts'}</span>
          </button>

          {/* Step 6 Action: Big Next Step Button */}
          {nextStatus && (
            <button
              onClick={() => setShowStatusConfirm(true)}
              className="py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 text-lg transition flex items-center gap-2"
            >
              <span>Mark as {nextStatus}</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 5: RECORD COLLECTED CLOTHING FORM (Expandable / Inline) */}
      {showCollectionForm && (
        <div className="bg-blue-50/50 rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-md space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Record Collected Clothing Quantity
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Verify every physical item received from the student's laundry bag.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-gray-500">Auto Total</span>
              <p className="text-2xl font-extrabold text-blue-700">
                {currentTotalCollected} items counted
              </p>
            </div>
          </div>

          {/* Real-time mismatch warning */}
          {countMismatch && (
            <div className="p-3.5 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-amber-700" />
              <span>
                Count Mismatch Warning: Student requested {totalRequestedCount} items, but you counted {currentTotalCollected} items.
              </span>
            </div>
          )}

          {/* List of clothing items with +/- buttons */}
          <div className="space-y-3">
            {collectionItems.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-lg">
                      {item.clothingType}
                    </span>
                    {item.isPremium && <PremiumBadge />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Student requested: <strong>{item.requestedCount}</strong>
                    {item.specialInstructions && (
                      <span className="ml-2 italic text-gray-700">
                        • “{item.specialInstructions}”
                      </span>
                    )}
                  </p>
                </div>

                {/* +/- Stepper Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateItemCount(index, -1)}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center font-bold transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="w-14 text-center font-extrabold text-2xl text-gray-900">
                    {item.collectedCount}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateItemCount(index, 1)}
                    className="w-11 h-11 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl flex items-center justify-center font-bold transition"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Staff notes field */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Staff Collection Notes (Optional)
            </label>
            <input
              type="text"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="e.g. Student informed 1 shirt missing; button torn on collar..."
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCollectionForm(false)}
              className="py-3 px-6 text-gray-700 hover:bg-gray-200 font-semibold rounded-xl text-base transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={collectionSaving}
              onClick={handleSaveCollection}
              className="py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-xl shadow-md transition disabled:opacity-50"
            >
              {collectionSaving ? 'Saving Items...' : 'Save Collected Items'}
            </button>
          </div>
        </div>
      )}

      {/* Main Details Grid: Left 2 Cols, Right 1 Col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Info + Clothing Items + Photos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={22} className="text-blue-600" />
              <span>Student & Room Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-400">Student Name</p>
                <p className="font-bold text-gray-900 text-lg mt-0.5">
                  {order.student?.name || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-gray-400">Phone Number</p>
                <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Phone size={16} className="text-gray-400" />
                  <span>{order.student?.phone || 'Not provided'}</span>
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-gray-400">Hostel & Block</p>
                <p className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <Home size={16} className="text-gray-400" />
                  <span>
                    {order.student?.hostel} • {order.student?.block}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs uppercase font-semibold text-gray-400">Room Number</p>
                <p className="font-bold text-blue-600 text-lg mt-0.5">
                  Room {order.student?.roomNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Clothing Items List */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Clothing List ({order.items?.length || 0} types)
              </h3>
              <span className="text-sm font-semibold text-gray-500">
                Total Count:{' '}
                {order.items?.reduce(
                  (sum, i) =>
                    sum + (i.collectedCount > 0 ? i.collectedCount : i.requestedCount),
                  0
                )}{' '}
                pieces
              </span>
            </div>

            {/* Premium Items Highlighted Section */}
            {premiumItems.length > 0 && (
              <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-700" />
                    <span className="font-bold text-amber-950 text-base">
                      Premium Dry-Cleaning Items
                    </span>
                  </div>
                  <PremiumBadge />
                </div>

                <div className="space-y-2">
                  {premiumItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{item.clothingType}</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-amber-800 font-medium">
                            “{item.specialInstructions}”
                          </p>
                        )}
                      </div>
                      <span className="text-base font-extrabold text-amber-900">
                        × {item.collectedCount || item.requestedCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Wash Items */}
            <div className="space-y-2">
              {regularItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{item.clothingType}</p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500">“{item.specialInstructions}”</p>
                    )}
                  </div>
                  <span className="text-base font-bold text-gray-700">
                    × {item.collectedCount || item.requestedCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Uploaded Photos */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Camera size={22} className="text-blue-600" />
              <span>Student Uploaded Photos</span>
            </h3>

            {order.photos && order.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {order.photos.map((photoUrl, idx) => (
                  <a
                    key={idx}
                    href={photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl overflow-hidden border border-gray-200 aspect-square block bg-gray-100"
                  >
                    <img
                      src={photoUrl}
                      alt={`Order photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg font-medium">
                      Photo {idx + 1}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-base text-gray-500 py-4">
                No pre-wash photos were uploaded by the student for this order.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Payment Summary + Status History */}
        <div className="space-y-6">
          {/* Payment Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Receipt size={22} className="text-blue-600" />
                <span>Payment</span>
              </h3>
              <PaymentBadge status={order.payment?.status} />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Total Bill</span>
                <span className="font-bold text-gray-900">
                  ₹{order.payment?.totalAmount || 0}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-bold text-emerald-600">
                  ₹{order.payment?.paidAmount || 0}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-extrabold">
                <span className="text-gray-900">Remaining Balance</span>
                <span
                  className={
                    order.payment?.balance > 0 ? 'text-red-600' : 'text-gray-900'
                  }
                >
                  ₹{order.payment?.balance || 0}
                </span>
              </div>
            </div>

            {/* Record Payment Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              <span>Record Payment</span>
            </button>

            {/* Payment Transactions Log */}
            {order.payment?.paymentHistory && order.payment.paymentHistory.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs uppercase font-bold text-gray-400 mb-2">
                  Payment History
                </p>
                <div className="space-y-2">
                  {order.payment.paymentHistory.map((p, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-0.5"
                    >
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>₹{p.amount} via {p.paymentMethod}</span>
                        <span>{new Date(p.recordedAt).toLocaleDateString()}</span>
                      </div>
                      {p.transactionRef && (
                        <p className="text-gray-500">Ref: {p.transactionRef}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock size={22} className="text-blue-600" />
              <span>Status History</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {(order.statusHistory || []).map((history, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
                  <div>
                    <p className="font-bold text-gray-900 text-base">
                      {history.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(history.changedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {history.changedBy?.name && (
                        <span> • by {history.changedBy.name}</span>
                      )}
                    </p>
                    {history.note && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        “{history.note}”
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM STATUS ADVANCE MODAL */}
      <ConfirmModal
        isOpen={showStatusConfirm}
        title={`Mark order as ${nextStatus}?`}
        message={`Are you sure you want to advance this order from "${order.status}" to "${nextStatus}"? This update will be recorded in the student's timeline.`}
        confirmText={`Yes, Mark as ${nextStatus}`}
        loading={statusUpdating}
        onConfirm={handleAdvanceStatus}
        onCancel={() => setShowStatusConfirm(false)}
      />

      {/* STEP 7: RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Record Student Payment
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Total Order Bill: <strong>₹{order.payment?.totalAmount || 0}</strong> •
              Remaining Balance: <strong className="text-red-600">₹{order.payment?.balance || 0}</strong>
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={order.payment?.balance || 99999}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`e.g. ${order.payment?.balance || 50}`}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Other'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Transaction / UTR Reference (Optional for UPI)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-REF-8921"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Staff Notes (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid in full at delivery desk"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  disabled={paymentSaving}
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/2 py-3 px-5 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSaving}
                  className="w-1/2 py-3.5 px-5 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {paymentSaving ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
