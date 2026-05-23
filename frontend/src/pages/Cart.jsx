import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, ChevronRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { currentUser, openLoginModal } = useUser();
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    totalItemsCount,
    totalMRP,
    totalDiscount,
    deliveryCharges,
    finalAmount,
    savings
  } = useCart();

  if (!currentUser) {
    return (
      <div className="bg-white rounded-sm shadow-details p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center select-none">
        <ShoppingBag size={80} className="text-gray-200 mb-5" strokeWidth={1} />
        <h2 className="text-xl font-bold text-gray-800">Missing Cart items?</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">Login to see the items you added previously</p>
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
        <span>Loading your cart...</span>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-details p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center">
        <ShoppingBag size={80} className="text-gray-200 mb-5" strokeWidth={1} />
        <h2 className="text-xl font-bold text-gray-800">Your cart is empty!</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">Add items to it now. Browse hundreds of products at best prices with exciting deals and offers.</p>
        <Link
          to="/"
          className="bg-brand-blue text-white text-sm font-bold px-10 py-3 mt-6 rounded-sm hover:bg-blue-600 transition-colors shadow-md"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left Panel — Cart Items */}
      <div className="flex-grow">
        {/* Header */}
        <div className="bg-white rounded-t-sm shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            My Cart ({totalItemsCount})
          </h1>
          <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
            Deliver to: <span className="text-brand-blue font-bold">Default Address</span>
          </span>
        </div>

        {/* Cart Item List */}
        <div className="bg-white rounded-b-sm shadow-sm border-x border-b border-gray-100 divide-y divide-gray-100">
          {cartItems.map((item) => {
            const price = parseFloat(item.price);
            const originalPrice = parseFloat(item.original_price);
            const discountPercent = originalPrice > 0
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : 0;

            return (
              <div key={item.product_id} className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50/50 transition-colors group">
                {/* Image */}
                <Link
                  to={`/products/${item.product_id}`}
                  className="w-24 h-28 sm:w-28 sm:h-32 bg-white border border-gray-100 rounded-sm p-2 flex items-center justify-center shrink-0 mx-auto sm:mx-0"
                >
                  <img
                    src={item.primary_image || item.image_url || 'https://via.placeholder.com/120'}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Details */}
                <div className="flex-grow flex flex-col gap-1.5 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="text-sm font-semibold text-gray-800 hover:text-brand-blue leading-snug line-clamp-2">
                    {item.title}
                  </Link>
                  {item.brand && (
                    <span className="text-[11px] text-gray-400 font-bold uppercase">{item.brand}</span>
                  )}

                  {/* Pricing Row */}
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    {originalPrice > price && (
                      <>
                        <span className="text-xs text-gray-400 line-through font-semibold">
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-brand-green font-extrabold">
                          {discountPercent}% off
                        </span>
                      </>
                    )}
                  </div>

                  {/* Delivery estimate */}
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Delivery by <span className="text-gray-700 font-bold">Tomorrow</span> | <span className="text-brand-green font-bold">{price > 500 ? 'Free' : '₹40'}</span>
                  </p>

                  {/* Quantity Controls + Remove */}
                  <div className="flex items-center gap-4 mt-3">
                    {/* Quantity Adjuster */}
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center text-sm font-extrabold border-x border-gray-200 bg-white text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-xs font-bold text-gray-500 hover:text-red-500 uppercase flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Place Order Button (bottom bar) */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 mt-3 px-6 py-4 flex items-center justify-end sticky bottom-0 z-10">
          <button
            onClick={() => navigate('/checkout')}
            className="btn-orange text-sm uppercase tracking-wide"
          >
            Place Order <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Right Panel — Price Details */}
      <div className="w-full lg:w-96 shrink-0">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 sticky top-20">
          {/* Section Title */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Price Details
            </h2>
          </div>

          {/* Billing Rows */}
          <div className="px-6 py-4 space-y-3.5 text-sm border-b border-dashed border-gray-200">
            <div className="flex items-center justify-between font-semibold text-gray-700">
              <span>Price ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})</span>
              <span>₹{totalMRP.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-brand-green">
              <span>Discount</span>
              <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-gray-700">
              <span>Delivery Charges</span>
              <span>
                {deliveryCharges === 0 ? (
                  <span className="text-brand-green font-bold">FREE</span>
                ) : (
                  `₹${deliveryCharges}`
                )}
              </span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between font-extrabold text-base text-gray-900">
              <span>Total Amount</span>
              <span>₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Savings Banner */}
          {savings > 0 && (
            <div className="px-6 py-3 bg-green-50 text-brand-green text-sm font-bold flex items-center gap-2">
              <Tag size={16} />
              You will save ₹{savings.toLocaleString('en-IN')} on this order
            </div>
          )}

          {/* Trust Badge */}
          <div className="px-6 py-4 flex items-center gap-2 text-xs text-gray-400 font-semibold">
            <ShieldCheck size={16} className="text-gray-300" />
            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
