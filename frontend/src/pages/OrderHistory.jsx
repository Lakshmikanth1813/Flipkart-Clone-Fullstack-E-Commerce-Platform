import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useUser } from '../context/UserContext';
import { Package, ChevronDown, ChevronUp, ShoppingBag, Calendar, MapPin, CreditCard, Star } from 'lucide-react';

export default function OrderHistory() {
  const { userId, currentUser, openLoginModal } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {

      try {
        setLoading(true);
        const data = await apiService.getOrders(userId);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  // Helper to determine order status styling
  const getStatusBadge = (status) => {
    const statusMap = {
      processing: { bg: 'bg-blue-100 text-blue-700', label: 'Processing' },
      confirmed: { bg: 'bg-indigo-100 text-indigo-700', label: 'Confirmed' },
      shipped: { bg: 'bg-yellow-100 text-yellow-700', label: 'Shipped' },
      delivered: { bg: 'bg-green-100 text-green-700', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100 text-red-600', label: 'Cancelled' },
    };
    const s = statusMap[status?.toLowerCase()] || { bg: 'bg-gray-100 text-gray-600', label: status || 'Processing' };
    return (
      <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-extrabold uppercase tracking-wider ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-sm shadow-details p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center select-none">
        <Package size={80} className="text-gray-200 mb-5" strokeWidth={1} />
        <h2 className="text-xl font-bold text-gray-800">Track and view your orders</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">Please log in to check your order history and tracking details</p>
        <button
          onClick={openLoginModal}
          className="bg-brand-orange text-white text-sm font-bold uppercase tracking-wider px-14 py-3 mt-6 rounded-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-16 text-center text-gray-500 font-bold border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mb-4"></div>
        <span>Loading your orders...</span>
      </div>
    );
  }


  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-details p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center">
        <Package size={80} className="text-gray-200 mb-5" strokeWidth={1} />
        <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">Looks like you haven't placed any orders. Start exploring and find products you love!</p>
        <Link to="/" className="bg-brand-blue text-white text-sm font-bold px-10 py-3 mt-6 rounded-sm hover:bg-blue-600 transition-colors shadow-md">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package size={22} className="text-brand-blue" />
          My Orders
        </h1>
        <span className="text-xs text-gray-400 font-semibold">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Orders List */}
      {orders.map(order => {
        const isExpanded = expandedOrderId === order.id;
        const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        const orderId = `OD${order.id.toString().padStart(8, '0')}`;

        return (
          <div key={order.id} className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Order Header — always visible */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="flex items-center gap-4 flex-wrap min-w-0">
                {/* Order Icon */}
                <div className="w-10 h-10 bg-brand-lightBlue rounded-sm flex items-center justify-center shrink-0">
                  <Package size={20} className="text-brand-blue" />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{order.id}</span>
                    {getStatusBadge(order.order_status)}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 font-semibold flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {orderDate}</span>
                    <span className="flex items-center gap-1"><CreditCard size={11} /> {order.payment_method || 'COD'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-extrabold text-gray-900 hidden sm:block">₹{parseFloat(order.total_price).toLocaleString('en-IN')}</span>
                {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>
            </div>

            {/* Expanded — Order Items */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {/* Address */}
                {order.address_name && (
                  <div className="px-5 py-3 bg-gray-50 text-xs text-gray-500 font-semibold flex items-start gap-2">
                    <MapPin size={14} className="text-brand-blue mt-0.5 shrink-0" />
                    <span>
                      <span className="font-bold text-gray-700">{order.address_name}</span> — {order.address_line}, {order.city}, {order.state} {order.pincode}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {order.items && order.items.map((item, idx) => (
                    <Link
                      key={idx}
                      to={`/products/${item.product_id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="w-14 h-14 border border-gray-100 rounded-sm flex items-center justify-center bg-white shrink-0">
                        <img src={item.image_url || 'https://via.placeholder.com/60'} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                          <span className="font-extrabold text-gray-900">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                          <span className="text-gray-400">× {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-gray-900">
                          ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Total row */}
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between text-sm font-bold border-t border-gray-100">
                  <span className="text-gray-500">Order Total</span>
                  <span className="text-gray-900 text-base">₹{parseFloat(order.total_price).toLocaleString('en-IN')}</span>
                </div>

                {/* Rate & Review prompt */}
                {order.order_status?.toLowerCase() === 'delivered' && (
                  <div className="px-5 py-3 bg-yellow-50 text-xs font-semibold text-gray-600 flex items-center gap-2 border-t border-gray-100">
                    <Star size={14} className="text-brand-yellow fill-brand-yellow" />
                    Rate and review your purchased products to help other buyers
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
