import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Star, ShoppingCart, Shield, ArrowLeft, Heart, CheckCircle2, Truck } from 'lucide-react';

const BANK_OFFERS = [
  "Bank Offer: 10% Instant Discount on Axis Bank Credit Card Txns, up to ₹1,250 on orders of ₹5,000 and above",
  "Bank Offer: 10% Instant Discount on SBI Credit Card Txns, up to ₹1,500 on orders of ₹7,500 and above",
  "Bank Offer: 5% Unlimited Cashback on Flipkart Axis Bank Credit Card",
  "Special Offer: Extra ₹1,000 Off on selective payment modes (applied in cart)"
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isProductInWishlist, currentUser, openLoginModal } = useUser();

  const [product, setProduct] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCartState, setAddingToCartState] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Simulated Pincode Check state
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Auto-scroll images in carousel
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1 || isCarouselHovered) return;

    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [product, isCarouselHovered]);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProductById(id);
        setProduct(data);
        setActiveImageIdx(0); // reset image index on new product
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      setAddingToCartState(true);
      await addToCart(product.id, 1);
      navigate('/cart');
    } catch (err) {
      alert(err.message || 'Could not add product to cart.');
    } finally {
      setAddingToCartState(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock === 0) return;
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      setAddingToCartState(true);
      await addToCart(product.id, 1);
      navigate('/checkout');
    } catch (err) {
      alert(err.message || 'Could not place order.');
    } finally {
      setAddingToCartState(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    try {
      setWishlistLoading(true);
      await toggleWishlist(product.id);
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length !== 6 || isNaN(pincode)) {
      setDeliveryMessage({ type: 'error', text: 'Enter a valid 6-digit pincode' });
      return;
    }

    setCheckingPincode(true);
    setTimeout(() => {
      setCheckingPincode(false);
      // Give simulated answers based on pincodes
      if (pincode.startsWith('560') || pincode.startsWith('700') || pincode.startsWith('110')) {
        setDeliveryMessage({
          type: 'success',
          text: 'Delivery by Tomorrow, Saturday (Free Delivery over ₹500)'
        });
      } else {
        setDeliveryMessage({
          type: 'success',
          text: 'Delivery in 2-3 Days, Monday (Daily Saver Delivery)'
        });
      }
    }, 800);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-16 text-center text-gray-500 font-bold border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mb-4"></div>
        <span>Retrieving Flipkart Specifications...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-sm shadow-sm p-12 text-center border border-gray-100 min-h-[300px] flex flex-col justify-center items-center">
        <h3 className="text-lg font-bold text-gray-800">Product Not Found</h3>
        <p className="text-sm text-gray-500 mt-1">The product specifications might be unavailable or deleted from catalog.</p>
        <button onClick={() => navigate('/')} className="bg-brand-blue text-white text-sm font-bold px-6 py-2 mt-4 rounded-sm hover:bg-blue-600">
          Go Back Home
        </button>
      </div>
    );
  }

  const isWishlisted = isProductInWishlist(product.id);
  const imagesList = product.images || [];
  const activeImage = imagesList[activeImageIdx]?.image_url || 'https://via.placeholder.com/400';

  return (
    <div className="flex flex-col gap-3">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-600 hover:text-brand-blue w-max mb-1 focus:outline-none cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      {/* Main product structure card */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Left Column: Images panel (Span 5) */}
        <div className="md:col-span-5 flex flex-col gap-6 md:sticky md:top-20 h-max">

          <div className="flex flex-col-reverse sm:flex-row gap-4">

            {/* 1. Thumbnail strips (left) */}
            <div className="flex flex-row sm:flex-col gap-2.5 max-h-96 overflow-y-auto overflow-x-auto sm:overflow-x-visible shrink-0 pb-2 sm:pb-0 scrollbar-none">
              {imagesList.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(index)}
                  onMouseEnter={() => {
                    setActiveImageIdx(index);
                    setIsCarouselHovered(true);
                  }}
                  onMouseLeave={() => setIsCarouselHovered(false)}
                  className={`w-12 h-16 sm:w-16 sm:h-20 border-2 p-1 bg-white rounded-sm flex items-center justify-center shrink-0 cursor-pointer transition-all ${index === activeImageIdx ? 'border-brand-blue' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <img src={img.image_url} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>

            {/* 2. Large Main Image Display with Hover Zoom effects */}
            <div
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
              className="flex-grow h-80 sm:h-96 bg-white border border-gray-100 rounded-sm p-6 flex flex-col items-center justify-center overflow-hidden relative group"
            >
              <img
                key={activeImageIdx}
                src={activeImage}
                alt={product.title}
                className="max-h-[85%] max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out animate-fadeIn"
              />

              {/* Auto-scroll dot indicators */}
              {imagesList.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {imagesList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${idx === activeImageIdx ? 'w-6 h-2 bg-brand-blue' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}

              {/* Heart Wishlist Overlay */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform text-gray-400 hover:text-red-500"
              >
                <Heart size={18} className={`${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

          </div>

          {/* 3. Action Add To Cart & Buy Now Buttons */}
          <div className="grid grid-cols-2 gap-3.5 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCartState}
              className={`w-full py-4 text-xs sm:text-base font-extrabold uppercase rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow transition-all ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-brand-yellow hover:bg-opacity-95 text-white hover:shadow-md'}`}
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0 || addingToCartState}
              className={`w-full py-4 text-xs sm:text-base font-extrabold uppercase rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow transition-all ${product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-brand-orange hover:bg-opacity-95 text-white hover:shadow-md'}`}
            >
              <span className="font-bold">⚡</span>
              {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>

        </div>

        {/* Right Column: Spec details (Span 7) */}
        <div className="md:col-span-7 flex flex-col gap-4">

          {/* Title block */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{product.brand}</span>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-snug">{product.title}</h1>
          </div>

          {/* Ratings and Reviews count */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-0.5 px-2 py-0.5 text-xs text-white bg-brand-green rounded-sm font-extrabold">
              {parseFloat(product.rating).toFixed(1)} <Star size={10} className="fill-white" />
            </span>
            <span className="text-xs md:text-sm font-bold text-gray-400">
              {parseInt(product.rating_count).toLocaleString()} Ratings & {parseInt(product.review_count).toLocaleString()} Reviews
            </span>
            <span className="text-brand-blue text-xs font-bold hover:underline cursor-pointer">Assured</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mt-1 flex-wrap">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900">
              ₹{parseInt(product.price).toLocaleString('en-IN')}
            </span>
            <span className="text-sm md:text-base text-gray-400 line-through font-bold">
              ₹{parseInt(product.original_price).toLocaleString('en-IN')}
            </span>
            <span className="text-sm md:text-base text-brand-green font-extrabold">
              {product.discount_percent}% off
            </span>
          </div>

          {/* Stock inventory levels */}
          <div className="text-sm font-semibold flex items-center gap-2">
            <span>Availability:</span>
            {product.stock > 5 ? (
              <span className="text-brand-green font-bold flex items-center gap-1">
                <CheckCircle2 size={16} /> In Stock ({product.stock} left)
              </span>
            ) : product.stock > 0 ? (
              <span className="text-red-500 font-extrabold uppercase animate-pulse">
                Hurry, Only {product.stock} Left in Stock!
              </span>
            ) : (
              <span className="text-gray-500 font-bold">Temporarily Out of Stock</span>
            )}
          </div>

          {/* Flipkart Bank Offers List */}
          <div className="flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-sm p-4 mt-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Available Offers</h3>
            <ul className="space-y-2 mt-1.5 text-xs md:text-sm text-gray-700 font-semibold leading-relaxed">
              {BANK_OFFERS.map((offer, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-green text-base leading-none">🏷️</span>
                  <span>{offer}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Delivery Pincode checker */}
          <div className="border border-gray-100 rounded-sm p-4 mt-1 flex flex-col gap-2.5">
            <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-brand-blue" />
              Delivery & Pincode Check
            </h3>

            <form onSubmit={handlePincodeCheck} className="flex items-center max-w-sm">
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full text-sm border border-gray-300 border-r-0 rounded-l-sm px-3.5 py-2 focus:outline-none focus:border-brand-blue font-semibold"
              />
              <button
                type="submit"
                className="bg-brand-blue text-white font-bold text-sm px-5 py-2.5 rounded-r-sm hover:bg-blue-600 transition-colors shrink-0"
              >
                {checkingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {/* Display Pincode Message */}
            {deliveryMessage && (
              <div className={`text-xs font-bold ${deliveryMessage.type === 'error' ? 'text-red-500' : 'text-brand-green'}`}>
                {deliveryMessage.text}
              </div>
            )}
          </div>

          {/* Product Specifications list */}
          <div className="flex flex-col gap-3 mt-4">
            <h3 className="text-sm md:text-base font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase tracking-wider">
              Product Description
            </h3>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              <h3 className="text-sm md:text-base font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase tracking-wider">
                Specifications
              </h3>

              <div className="border border-gray-100 rounded-sm overflow-hidden mt-1">
                <table className="w-full text-xs md:text-sm font-semibold text-left">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/55'}`}>
                        <td className="py-3 px-4 font-bold text-gray-400 w-1/3 border-r border-gray-100 shrink-0">{key}</td>
                        <td className="py-3 px-4 text-gray-700">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Safe Purchase Banner */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-6 text-gray-500 text-[11px] font-bold">
            <span className="flex items-center gap-1.5"><Shield size={16} className="text-brand-blue" /> 7 Day Replacement Policy</span>
            <span className="flex items-center gap-1.5"><Truck size={16} className="text-brand-blue" /> Free Delivery above ₹500</span>
            <span className="flex items-center gap-1.5">🔒 100% Genuine Products</span>
          </div>

        </div>

      </div>

    </div>
  );
}
