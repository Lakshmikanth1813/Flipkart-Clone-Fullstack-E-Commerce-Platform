import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Truck, PartyPopper } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount } = location.state || {};

  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // If no order state, redirect to home
  if (!orderId) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center">
        <Package size={60} className="text-gray-200 mb-4" strokeWidth={1} />
        <h2 className="text-lg font-bold text-gray-800">No order information found</h2>
        <p className="text-sm text-gray-500 mt-1">It seems like you accessed this page directly.</p>
        <Link to="/" className="bg-brand-blue text-white text-sm font-bold px-8 py-2.5 mt-5 rounded-sm hover:bg-blue-600 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const generatedOrderId = orderId.toString().startsWith('OD')
    ? orderId
    : `OD${orderId.toString().padStart(8, '0')}${Date.now().toString().slice(-6)}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`bg-white rounded-sm shadow-details border border-gray-100 overflow-hidden transition-all duration-700 ease-out ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-brand-green to-emerald-600 text-white p-8 text-center">
          <div className={`transition-all duration-700 delay-300 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm ring-4 ring-white/30">
              <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className={`text-2xl font-extrabold mb-1 transition-all duration-500 delay-500 ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Order Placed Successfully!
          </h1>
          <p className={`text-sm text-white/80 font-semibold transition-all duration-500 delay-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
            Your order has been confirmed and will be shipped soon
          </p>
        </div>

        {/* Order Details */}
        <div className="p-6 md:p-8 flex flex-col gap-5">

          {/* Order ID Card */}
          <div className={`bg-blue-50 border border-blue-100 rounded-sm p-5 transition-all duration-500 delay-[800ms] ${showAnimation ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order ID</p>
                <p className="text-lg font-extrabold text-brand-blue mt-0.5 tracking-wide">{generatedOrderId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Paid</p>
                <p className="text-lg font-extrabold text-gray-900 mt-0.5">₹{totalAmount?.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className={`flex flex-col gap-3 transition-all duration-500 delay-[1000ms] ${showAnimation ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Delivery Timeline</h3>
            <div className="flex items-start gap-4">
              {[
                { icon: <CheckCircle2 size={20} className="text-brand-green" />, label: 'Order Confirmed', time: 'Just now', active: true },
                { icon: <Package size={20} className="text-brand-blue" />, label: 'Processing', time: 'Within 2 hours', active: false },
                { icon: <Truck size={20} className="text-brand-orange" />, label: 'Out for Delivery', time: 'Tomorrow', active: false },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center flex-1 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs font-bold mt-1.5 ${step.active ? 'text-gray-800' : 'text-gray-500'}`}>{step.label}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{step.time}</p>
                  {idx < 2 && (
                    <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Celebration Message */}
          <div className={`bg-yellow-50 border border-yellow-100 rounded-sm p-4 flex items-center gap-3 text-sm font-semibold text-gray-700 transition-all duration-500 delay-[1200ms] ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
            <PartyPopper size={24} className="text-brand-yellow shrink-0" />
            <span>Thank you for shopping with us! You can track your order anytime from your <Link to="/orders" className="text-brand-blue font-bold hover:underline">Order History</Link>.</span>
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row items-center gap-3 mt-2 transition-all duration-500 delay-[1400ms] ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to="/orders" className="flex-1 w-full sm:w-auto text-center bg-brand-blue text-white font-bold text-sm py-3 px-6 rounded-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              <Package size={16} />
              View My Orders
            </Link>
            <Link to="/" className="flex-1 w-full sm:w-auto text-center bg-brand-orange text-white font-bold text-sm py-3 px-6 rounded-sm hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={16} />
              Continue Shopping
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
