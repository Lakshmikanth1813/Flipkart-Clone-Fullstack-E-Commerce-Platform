import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Package, User, Star, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

export default function Header() {
  const { totalItemsCount } = useCart();
  const { currentUser, logout, openLoginModal } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
  };

  return (
    <header className="bg-brand-blue text-white sticky top-0 z-50 shadow-header py-3">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Left: Logo */}
        <div className="flex flex-col items-start leading-none min-w-max">
          <Link to="/" className="flex flex-col" onClick={() => setSearchTerm('')}>
            <span className="text-xl font-bold italic tracking-wide text-white">Flipkart</span>
            <span className="text-[10px] text-gray-200 italic hover:underline flex items-center gap-0.5">
              Explore <span className="text-yellow-400 font-bold">Plus</span>
              <Star size={8} className="fill-yellow-400 text-yellow-400" />
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-xl">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full text-black px-4 py-2 pr-10 text-sm rounded-sm bg-white border border-transparent shadow-sm focus:outline-none focus:border-brand-blue"
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-brand-blue hover:text-blue-700">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Right: Actions */}
        <nav className="flex items-center gap-6 text-sm font-semibold">
          
          {/* User Profile / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1 group relative py-1 cursor-pointer">
              <User size={16} />
              <span className="hidden md:inline hover:underline flex items-center gap-0.5">
                {currentUser.name.split(' ')[0]}
                <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />
              </span>
              
              {/* Hover Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white text-gray-800 rounded-sm shadow-lg border border-gray-100 hidden group-hover:block z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="font-bold text-sm text-gray-900 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 truncate">{currentUser.email}</p>
                </div>
                <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  <Package size={14} className="text-brand-blue" />
                  My Orders
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                  <Heart size={14} className="text-red-500 fill-red-500" />
                  Wishlist
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-sm font-bold text-red-600 transition-colors text-left border-t border-gray-100 cursor-pointer"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="bg-white text-brand-blue hover:bg-gray-50 font-bold px-7 py-1 text-sm rounded-sm transition-all border border-transparent shadow-sm cursor-pointer"
            >
              Login
            </button>
          )}

          {/* Wishlist Link */}
          <Link to="/wishlist" className="flex items-center gap-1.5 hover:text-yellow-300">
            <Heart size={16} className="md:block hidden" />
            <span className="hidden md:inline">Wishlist</span>
          </Link>

          {/* Orders Link */}
          <Link to="/orders" className="flex items-center gap-1.5 hover:text-yellow-300">
            <Package size={16} className="md:block hidden" />
            <span>Orders</span>
          </Link>

          {/* Shopping Cart Button */}
          <Link to="/cart" className="flex items-center gap-2 text-white bg-blue-700 md:bg-transparent md:hover:text-yellow-300 px-3 py-1.5 rounded-sm md:p-0 transition-colors">
            <div className="relative">
              <ShoppingCart size={18} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-brand-darkBlue text-[10px] font-extrabold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-brand-blue md:border-transparent">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>
          
        </nav>
      </div>
    </header>
  );
}
