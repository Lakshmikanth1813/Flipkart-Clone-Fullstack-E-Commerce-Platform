import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login, register } = useUser();
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.emailOrPhone || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(loginData.emailOrPhone, loginData.password);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Name, email, and password are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(
        registerData.email,
        registerData.password,
        registerData.name,
        registerData.phone
      );
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(prev => !prev);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-65 animate-fadeIn">
      {/* Container */}
      <div className="relative bg-white w-full max-w-3xl h-[528px] rounded-sm shadow-2xl flex overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10"
        >
          <X size={24} />
        </button>

        {/* Left Column (Flipkart Blue Panel) */}
        <div className="w-2/5 bg-brand-blue text-white px-9 py-11 flex flex-col justify-between select-none">
          <div>
            <h2 className="text-2xl font-bold font-sans tracking-wide">
              {isLoginView ? 'Login' : 'Looks like you\'re new here!'}
            </h2>
            <p className="text-sm text-blue-100 font-semibold mt-4 leading-relaxed max-w-[210px]">
              {isLoginView
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Sign up with your mobile number to get started'}
            </p>
          </div>

          {/* SVG Shopping Illustration */}
          <div className="mt-auto flex justify-center">
            <svg
              width="180"
              height="150"
              viewBox="0 0 180 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-90"
            >
              {/* Ground Shadow */}
              <ellipse cx="90" cy="138" rx="70" ry="8" fill="#1b5fc9" />
              
              {/* Delivery Box */}
              <rect x="50" y="55" width="80" height="65" rx="4" fill="#ffbd3a" />
              <rect x="50" y="55" width="40" height="65" fill="#fca811" /> {/* Box shadow */}
              <path d="M50 72H130M50 97H130" stroke="#f18903" strokeWidth="2" />
              
              {/* Delivery Label / Tape */}
              <rect x="80" y="55" width="20" height="25" fill="#fff" opacity="0.9" />
              <line x1="84" y1="62" x2="96" y2="62" stroke="#4a5568" strokeWidth="2" />
              <line x1="84" y1="69" x2="92" y2="69" stroke="#4a5568" strokeWidth="2" />

              {/* Shopping Bag */}
              <path
                d="M100 35H125V65H100V35Z"
                fill="#fb641b"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M106 35C106 29 119 29 119 35"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Float Coins/Stars */}
              <path
                d="M38 42L40 34L48 36L42 42L44 50L38 42Z"
                fill="#ffda44"
                className="animate-pulse"
              />
              <circle cx="145" cy="45" r="5" fill="#58d0ff" />
              <circle cx="30" cy="90" r="4" fill="#58d0ff" />
            </svg>
          </div>
        </div>

        {/* Right Column (Form Panel) */}
        <div className="w-3/5 bg-white px-9 py-11 flex flex-col justify-between">
          {isLoginView ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6 mt-2">
              <div className="flex flex-col gap-5">
                
                {/* Email / Mobile Input */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-email-phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    name="emailOrPhone"
                    id="login-email-phone"
                    value={loginData.emailOrPhone}
                    onChange={handleLoginChange}
                    placeholder="Enter email or 10-digit mobile"
                    className="border-b-2 border-gray-200 focus:border-brand-blue bg-transparent py-2 text-sm text-gray-900 focus:outline-none transition-colors placeholder:text-gray-300"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="login-password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className="border-b-2 border-gray-200 focus:border-brand-blue bg-transparent py-2 text-sm text-gray-900 focus:outline-none transition-colors placeholder:text-gray-300"
                    required
                    autoComplete="current-password"
                  />
                </div>

              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to Flipkart's{' '}
                <a href="#" className="text-brand-blue hover:underline">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-brand-blue hover:underline">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Error Box */}
              {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-sm border border-red-100">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-semibold py-3 text-sm rounded-sm hover:shadow-md transition-shadow uppercase tracking-wide cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : null}
                <span>Login</span>
              </button>

            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 mt-2">
              
              {/* Name Input */}
              <div className="flex flex-col gap-1">
                <label htmlFor="register-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="register-name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter your full name"
                  className="border-b-2 border-gray-200 focus:border-brand-blue bg-transparent py-2 text-sm text-gray-900 focus:outline-none transition-colors placeholder:text-gray-300"
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label htmlFor="register-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="register-email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter your email address"
                  className="border-b-2 border-gray-200 focus:border-brand-blue bg-transparent py-2 text-sm text-gray-900 focus:outline-none transition-colors placeholder:text-gray-300"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Phone Input */}
              <div className="flex flex-col gap-1">
                <label htmlFor="register-phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mobile Number <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="register-phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  placeholder="Enter 10-digit mobile number"
                  className="border-b-2 border-gray-200 focus:border-brand-blue bg-transparent py-2 text-sm text-gray-900 focus:outline-none transition-colors placeholder:text-gray-300"
                  autoComplete="tel"
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <label htmlFor="register-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="register-password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Create a strong password"
                  className="border-b-2 border-gray-200 focus:border-brand-blue bg-transparent py-2 text-sm text-gray-900 focus:outline-none transition-colors placeholder:text-gray-300"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
                By continuing, you agree to Flipkart's{' '}
                <a href="#" className="text-brand-blue hover:underline">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-brand-blue hover:underline">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Error Box */}
              {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-sm border border-red-100">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Continue / Signup Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-semibold py-3 text-sm rounded-sm hover:shadow-md transition-shadow uppercase tracking-wide cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : null}
                <span>Create Account</span>
              </button>

            </form>
          )}

          {/* Bottom Switch Link */}
          <div className="mt-auto pt-4 text-center">
            <button
              onClick={toggleView}
              className="text-sm font-semibold text-brand-blue hover:underline cursor-pointer"
            >
              {isLoginView
                ? 'New to Flipkart? Create an account'
                : 'Existing User? Log in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
