import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useUser } from '../context/UserContext';
import { Heart, Star, SlidersHorizontal, X } from 'lucide-react';

// Sample circular category banner data
const CATEGORY_ITEMS = [
  { name: 'All Products', slug: '', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&q=80' },
  { name: 'Mobiles', slug: 'mobiles', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=150&q=80' },
  { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80' },
  { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=150&q=80' }
];

// Sliding Promotional Banners Data
const PROMO_BANNERS = [
  {
    title: "THE BIG BILLION DAYS",
    subtitle: "Biggest Deals of the Season • Up to 80% Off",
    gradient: "from-blue-600 via-indigo-600 to-purple-700",
    badge: "Coming Soon"
  },
  {
    title: "MEGA ELECTRONICS SALE",
    subtitle: "Latest Mobiles & Laptops • No Cost EMI | Exchange Offers",
    gradient: "from-emerald-500 to-teal-700",
    badge: "Live Now"
  },
  {
    title: "FASHION FESTIVAL DEALS",
    subtitle: "Allen Solly, Adidas, Levi's & More • Minimum 50% Off",
    gradient: "from-rose-500 via-pink-500 to-orange-500",
    badge: "Best Brands"
  }
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, isProductInWishlist } = useUser();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Slider Banner State
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read URL parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentRatingMin = searchParams.get('rating_min') || '';
  const currentPriceMax = searchParams.get('price_max') || '';

  // Auto-scroll banner effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Load products whenever filter parameters change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const filters = {
          category: currentCategory,
          search: currentSearch,
          brand: currentBrand,
          sort: currentSort,
          rating_min: currentRatingMin,
          price_max: currentPriceMax
        };
        const data = await apiService.getProducts(filters);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [searchParams]);

  // Extract unique brands from list to display in filter sidebar
  const getUniqueBrands = () => {
    // Hardcoded unique brands to keep UI clean and descriptive
    return [
      'Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Motorola',
      'Sony', 'Dell', 'Nintendo', 'Allen Solly', "Levi's", 'Adidas',
      'Puma', 'Nike', 'Casio', 'Pigeon', 'Philips', 'Wakefit',
      'Hawkins', 'Amazon Solimo', 'Wipro', 'LG', 'IFB', 'Dyson', 'Kent', 'Havells'
    ];
  };

  // Update query params helper
  const updateQueryParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="flex flex-col gap-4">

      {/* 1. Circle Categories Banner */}
      <div className="bg-white rounded-sm shadow-sm py-4 px-6 overflow-x-auto flex items-center justify-start md:justify-center gap-8 md:gap-16 border-b border-gray-100 scrollbar-none">
        {CATEGORY_ITEMS.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => updateQueryParam('category', cat.slug)}
            className={`flex flex-col items-center gap-1.5 focus:outline-none min-w-max transition-transform hover:scale-105`}
          >
            <div className={`w-14 h-14 rounded-full p-0.5 border-2 ${currentCategory === cat.slug ? 'border-brand-blue' : 'border-gray-200'} overflow-hidden shadow-sm`}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <span className={`text-xs font-bold ${currentCategory === cat.slug ? 'text-brand-blue' : 'text-gray-700'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* 2. Interactive Banner Slider (Festivals) */}
      <div className="relative w-full h-36 md:h-56 rounded-sm overflow-hidden shadow-sm select-none">
        {PROMO_BANNERS.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} flex flex-col justify-center px-8 md:px-16 text-white transition-opacity duration-700 ease-in-out ${idx === currentBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <span className="bg-yellow-400 text-brand-darkBlue text-[10px] md:text-xs font-extrabold px-2.5 py-0.5 rounded-full w-max mb-2 uppercase tracking-wider">
              {banner.badge}
            </span>
            <h2 className="text-xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">{banner.title}</h2>
            <p className="text-xs md:text-lg font-medium text-gray-100 mt-1 md:mt-2">{banner.subtitle}</p>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          {PROMO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIdx ? 'bg-white w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-2.5 rounded-sm shadow-sm">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-700 focus:outline-none"
        >
          <SlidersHorizontal size={16} className="text-brand-blue" />
          Filter & Sort
        </button>
        {currentSearch && <span className="text-xs font-semibold text-gray-500">Search: "{currentSearch}"</span>}
      </div>

      {/* 3. Filter Sidebar + Grid Layout */}
      <div className="flex gap-4 items-start">

        {/* Sidebar Filters Column (Desktop) */}
        <aside className={`w-64 bg-white rounded-sm shadow-sm border border-gray-100 shrink-0 hidden md:flex flex-col`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Filters</span>
            {(currentCategory || currentBrand || currentRatingMin || currentPriceMax || currentSearch) && (
              <button onClick={clearAllFilters} className="text-xs text-brand-blue font-bold hover:underline focus:outline-none">
                CLEAR ALL
              </button>
            )}
          </div>

          {/* Active Search Filter Badge */}
          {currentSearch && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase">Active Search</span>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-sm px-2.5 py-1 mt-1 text-xs text-gray-800 font-semibold shadow-sm">
                <span className="truncate max-w-[150px]">"{currentSearch}"</span>
                <button onClick={() => updateQueryParam('search', '')} className="text-gray-400 hover:text-red-500">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="p-4 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase">Categories</span>
            <ul className="mt-2 space-y-1.5 text-sm font-semibold text-gray-700">
              <li>
                <button
                  onClick={() => updateQueryParam('category', '')}
                  className={`w-full text-left py-0.5 hover:text-brand-blue ${!currentCategory ? 'text-brand-blue font-bold' : ''}`}
                >
                  All Categories
                </button>
              </li>
              {CATEGORY_ITEMS.slice(1).map((cat, i) => (
                <li key={i}>
                  <button
                    onClick={() => updateQueryParam('category', cat.slug)}
                    className={`w-full text-left py-0.5 hover:text-brand-blue ${currentCategory === cat.slug ? 'text-brand-blue font-bold' : ''}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Max Filter */}
          <div className="p-4 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase">Max Price</span>
            <div className="mt-2.5 flex flex-col gap-2">
              <input
                type="range"
                min="500"
                max="150000"
                step="500"
                value={currentPriceMax || 150000}
                onChange={(e) => updateQueryParam('price_max', e.target.value)}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <div className="flex justify-between text-xs text-gray-500 font-bold">
                <span>₹500</span>
                <span className="text-brand-blue">Under ₹{parseFloat(currentPriceMax || 150000).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="p-4 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase">Popular Brands</span>
            <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto pr-2">
              {getUniqueBrands().map((brand, i) => (
                <label key={i} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentBrand === brand}
                    onChange={() => updateQueryParam('brand', currentBrand === brand ? '' : brand)}
                    className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue focus:ring-2"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Customer Rating Filter */}
          <div className="p-4">
            <span className="text-xs font-bold text-gray-500 uppercase">Customer Rating</span>
            <div className="mt-2.5 space-y-2">
              {[4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateQueryParam('rating_min', currentRatingMin === stars.toString() ? '' : stars.toString())}
                  className={`w-full flex items-center gap-2.5 text-sm font-semibold hover:text-brand-blue py-0.5 text-left focus:outline-none ${currentRatingMin === stars.toString() ? 'text-brand-blue font-bold' : 'text-gray-700'}`}
                >
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-white bg-brand-green rounded-sm font-bold">
                    {stars}★ & above
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid Column */}
        <div className="flex-grow flex flex-col gap-3">

          {/* Top Sort / Header Bar */}
          <div className="bg-white rounded-sm shadow-sm py-3 px-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs md:text-sm font-semibold">
            <div className="text-gray-600">
              {loading ? (
                <span>Loading products...</span>
              ) : (
                <span>Showing {products.length} products {currentSearch && `for "${currentSearch}"`}</span>
              )}
            </div>

            {/* Sorting Anchors */}
            <div className="flex items-center gap-4 text-gray-600 overflow-x-auto whitespace-nowrap">
              <span className="font-bold text-gray-400 uppercase text-[11px]">Sort By:</span>
              <button
                onClick={() => updateQueryParam('sort', '')}
                className={`pb-0.5 hover:text-brand-blue focus:outline-none ${!currentSort ? 'text-brand-blue border-b-2 border-brand-blue font-bold' : ''}`}
              >
                Relevance
              </button>
              <button
                onClick={() => updateQueryParam('sort', 'price_asc')}
                className={`pb-0.5 hover:text-brand-blue focus:outline-none ${currentSort === 'price_asc' ? 'text-brand-blue border-b-2 border-brand-blue font-bold' : ''}`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => updateQueryParam('sort', 'price_desc')}
                className={`pb-0.5 hover:text-brand-blue focus:outline-none ${currentSort === 'price_desc' ? 'text-brand-blue border-b-2 border-brand-blue font-bold' : ''}`}
              >
                Price: High to Low
              </button>
              <button
                onClick={() => updateQueryParam('sort', 'rating')}
                className={`pb-0.5 hover:text-brand-blue focus:outline-none ${currentSort === 'rating' ? 'text-brand-blue border-b-2 border-brand-blue font-bold' : ''}`}
              >
                Popularity
              </button>
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="bg-white rounded-sm shadow-sm p-12 text-center text-gray-500 font-bold border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent mb-4"></div>
              <span>Updating Flipkart Catalog...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-12 text-center border border-gray-100 min-h-[300px] flex flex-col justify-center items-center">
              <SlidersHorizontal size={40} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No Products Found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md">We couldn't find matches for your current search or filters. Try removing some filters or clearing search.</p>
              <button onClick={clearAllFilters} className="bg-brand-blue text-white text-sm font-bold px-6 py-2 mt-4 rounded-sm hover:bg-blue-600 transition-colors">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => {
                const isWishlisted = isProductInWishlist(product.id);
                return (
                  <div key={product.id} className="bg-white rounded-sm shadow-card hover:shadow-lg transition-all duration-200 overflow-hidden relative border border-gray-100 flex flex-col group h-full">

                    {/* Wishlist Button Absolute */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white text-gray-400 hover:text-red-500 hover:scale-105 active:scale-95 transition-all focus:outline-none"
                    >
                      <Heart size={16} className={`${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>

                    {/* Product Card Click Wrap */}
                    <Link to={`/products/${product.id}`} className="flex flex-col h-full">
                      {/* Image Frame */}
                      <div className="w-full h-48 bg-white p-4 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={product.primary_image || 'https://via.placeholder.com/200'}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 ease-out"
                        />
                      </div>

                      {/* Info Pane */}
                      <div className="p-4 border-t border-gray-50 flex flex-col flex-grow">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{product.brand}</span>
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-brand-blue transition-colors">
                          {product.title}
                        </h4>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-white bg-brand-green rounded-sm font-extrabold">
                            {parseFloat(product.rating).toFixed(1)} <Star size={9} className="fill-white" />
                          </span>
                          <span className="text-[11px] text-gray-400 font-bold">
                            ({parseInt(product.rating_count).toLocaleString()})
                          </span>
                        </div>

                        {/* Price Details */}
                        <div className="flex items-baseline gap-2 mt-3 flex-wrap">
                          <span className="text-base font-extrabold text-gray-900">
                            ₹{parseInt(product.price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-400 line-through font-bold">
                            ₹{parseInt(product.original_price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-brand-green font-extrabold">
                            {product.discount_percent}% off
                          </span>
                        </div>

                        {/* Inventory stock status alert */}
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="text-[10px] text-red-500 font-extrabold uppercase mt-2">
                            Only {product.stock} Left!
                          </span>
                        )}
                        {product.stock === 0 && (
                          <span className="text-[10px] text-gray-500 font-extrabold uppercase mt-2">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* 4. Mobile Sliding Drawer Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end md:hidden">
          <div className="w-80 h-full bg-white flex flex-col shadow-2xl animate-slide-left">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-brand-blue text-white">
              <span className="text-base font-bold">Filters & Sort</span>
              <button onClick={() => setShowMobileFilters(false)} className="focus:outline-none hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {/* Category */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Categories</span>
                <ul className="mt-2 space-y-1 text-sm font-semibold text-gray-700">
                  {CATEGORY_ITEMS.map((cat, i) => (
                    <li key={i}>
                      <button
                        onClick={() => {
                          updateQueryParam('category', cat.slug);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full text-left py-1 hover:text-brand-blue ${currentCategory === cat.slug ? 'text-brand-blue font-bold' : ''}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Max Price</span>
                <div className="mt-2 flex flex-col gap-1.5">
                  <input
                    type="range"
                    min="500"
                    max="150000"
                    step="500"
                    value={currentPriceMax || 150000}
                    onChange={(e) => updateQueryParam('price_max', e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded accent-brand-blue"
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                    <span>Under ₹{parseFloat(currentPriceMax || 150000).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Brands</span>
                <div className="mt-2 space-y-2 max-h-36 overflow-y-auto pr-1">
                  {getUniqueBrands().map((brand, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentBrand === brand}
                        onChange={() => {
                          updateQueryParam('brand', currentBrand === brand ? '' : brand);
                          setShowMobileFilters(false);
                        }}
                        className="w-4 h-4 text-brand-blue rounded border-gray-300"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => {
                  clearAllFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-grow border border-gray-300 text-sm font-bold text-gray-700 py-2.5 rounded-sm hover:bg-gray-50 focus:outline-none"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-grow bg-brand-orange text-white text-sm font-bold py-2.5 rounded-sm focus:outline-none hover:bg-opacity-90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
