import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, Star, X } from 'lucide-react';

export default function Wishlist() {
  const { currentUser, wishlist, toggleWishlist, loading, openLoginModal } = useUser();
  const { addToCart } = useCart();
  const [actionLoading, setActionLoading] = useState({});

  if (!currentUser) {
    return (
      <div className="bg-white rounded-sm shadow-details p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center select-none">
        <Heart size={80} className="text-gray-200 mb-5 fill-gray-100" strokeWidth={1} />
        <h2 className="text-xl font-bold text-gray-800">Please log in to view items in your wishlist</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">Save your favorite items here to purchase them later</p>
        <button
          onClick={openLoginModal}
          className="bg-brand-orange text-white text-sm font-bold uppercase tracking-wider px-14 py-3 mt-6 rounded-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          Login
        </button>
      </div>
    );
  }


  const handleRemoveFromWishlist = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: 'removing' }));
      await toggleWishlist(productId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: 'moving' }));
      await addToCart(productId, 1);
      // Keep in wishlist as per user request (do not call toggleWishlist to remove it)
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-16 text-center text-gray-500 font-bold border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mb-4"></div>
        <span>Loading wishlist...</span>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-details p-12 text-center border border-gray-100 min-h-[400px] flex flex-col justify-center items-center">
        <Heart size={80} className="text-gray-200 mb-5" strokeWidth={1} />
        <h2 className="text-xl font-bold text-gray-800">Your wishlist is empty!</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">Save items you love to your wishlist. Review them anytime and easily move them to your cart.</p>
        <Link to="/" className="bg-brand-blue text-white text-sm font-bold px-10 py-3 mt-6 rounded-sm hover:bg-blue-600 transition-colors shadow-md">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Heart size={22} className="text-red-500 fill-red-500" />
          My Wishlist ({wishlist.length})
        </h1>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {wishlist.map(item => {
          const price = parseFloat(item.price);
          const originalPrice = parseFloat(item.original_price);
          const discountPercent = originalPrice > 0
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;
          const itemAction = actionLoading[item.product_id];

          return (
            <div key={item.product_id} className="bg-white rounded-sm shadow-card border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow flex flex-col relative">

              {/* Remove Button (X) — top right corner */}
              <button
                onClick={() => handleRemoveFromWishlist(item.product_id)}
                disabled={!!itemAction}
                className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10 text-gray-400 hover:text-red-500 hover:border-red-300 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>

              {/* Product Image */}
              <Link to={`/products/${item.product_id}`} className="p-4 pb-2 flex items-center justify-center h-40 bg-white">
                <img
                  src={item.primary_image || 'https://via.placeholder.com/150'}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Details */}
              <div className="p-3 pt-2 flex flex-col gap-1.5 flex-grow">
                <Link to={`/products/${item.product_id}`} className="text-xs font-semibold text-gray-800 hover:text-brand-blue leading-snug line-clamp-2">
                  {item.title}
                </Link>

                {item.brand && (
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{item.brand}</span>
                )}

                {/* Rating */}
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-white bg-brand-green rounded-sm font-extrabold">
                      {parseFloat(item.rating).toFixed(1)} <Star size={8} className="fill-white" />
                    </span>
                    {item.rating_count && (
                      <span className="text-[10px] text-gray-400 font-semibold">({parseInt(item.rating_count).toLocaleString()})</span>
                    )}
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-baseline gap-1.5 flex-wrap mt-auto">
                  <span className="text-sm font-extrabold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                  {originalPrice > price && (
                    <>
                      <span className="text-[10px] text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-brand-green font-extrabold">{discountPercent}% off</span>
                    </>
                  )}
                </div>
              </div>

              {/* Move to Cart Button */}
              <button
                onClick={() => handleMoveToCart(item.product_id)}
                disabled={!!itemAction}
                className="w-full py-2.5 bg-brand-orange text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-100"
              >
                {itemAction === 'moving' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                    Moving...
                  </span>
                ) : (
                  <>
                    <ShoppingCart size={13} />
                    Move to Cart
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
