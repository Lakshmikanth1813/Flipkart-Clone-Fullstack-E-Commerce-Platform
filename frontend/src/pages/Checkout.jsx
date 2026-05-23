import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { apiService } from '../services/api';
import {
  MapPin, Plus, ChevronDown, CreditCard, Wallet, Landmark,
  Check, ArrowRight, ShieldCheck, Tag, Package, Truck, X
} from 'lucide-react';

const CHECKOUT_STEPS = ['Login', 'Delivery Address', 'Order Summary', 'Payment'];

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalItemsCount, totalMRP, totalDiscount, deliveryCharges, finalAmount, savings, clearCart } = useCart();
  const { userId, addresses, addAddress, currentUser, openLoginModal } = useUser();

  const [activeStep, setActiveStep] = useState(currentUser ? 1 : 0); // 0=Login, 1=Address, 2=Summary, 3=Payment
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Sync active step with authentication status
  useEffect(() => {
    if (!currentUser) {
      setActiveStep(0);
    } else if (activeStep === 0) {
      setActiveStep(1);
    }
  }, [currentUser]);


  // Address form state — matching backend schema fields exactly
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', address_line: '', locality: '',
    city: '', state: '', pincode: '', landmark: '', is_default: false
  });

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses]);

  // If cart is empty on mount, redirect
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      const timer = setTimeout(() => {
        if (!cartItems || cartItems.length === 0) {
          navigate('/cart');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const newAddr = await addAddress(addressForm);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      setAddressForm({ name: '', phone: '', address_line: '', locality: '', city: '', state: '', pincode: '', landmark: '', is_default: false });
    } catch (err) {
      alert(err.message || 'Could not save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setOrderError('Please select or add a delivery address first.');
      return;
    }
    try {
      setPlacingOrder(true);
      setOrderError('');
      const result = await apiService.placeOrder(userId, selectedAddressId, paymentMethod);
      clearCart();
      navigate('/order-confirmation', { state: { orderId: result.order_id, totalAmount: finalAmount } });
    } catch (err) {
      setOrderError(err.message || 'Order placement failed. Try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[500px]">

      {/* Left — Checkout Steps */}
      <div className="flex-grow">
        {/* Step Indicator Bar */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {CHECKOUT_STEPS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors
                    ${idx < activeStep ? 'bg-brand-blue text-white' :
                      idx === activeStep ? 'bg-brand-orange text-white ring-2 ring-brand-orange/30' :
                        'bg-gray-200 text-gray-400'}`}>
                    {idx < activeStep ? <Check size={14} /> : idx + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider
                    ${idx <= activeStep ? 'text-brand-blue' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
                {idx < CHECKOUT_STEPS.length - 1 && (
                  <div className={`flex-grow h-0.5 mx-2 rounded-full transition-colors ${idx < activeStep ? 'bg-brand-blue' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 0: Login — Auto confirmed */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-3 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-brand-blue text-white cursor-pointer" onClick={() => setActiveStep(0)}>
            <div className="flex items-center gap-3">
              <span className="bg-white text-brand-blue w-6 h-6 rounded-sm flex items-center justify-center text-xs font-extrabold">1</span>
              <span className="text-sm font-bold uppercase tracking-wider">Login</span>
            </div>
            {activeStep > 0 && currentUser && <Check size={18} className="text-green-300" />}
          </div>
          {activeStep === 0 && (
            <div className="p-5 flex flex-col gap-3">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveStep(1)} className="btn-orange text-sm self-end mt-2 w-max py-2.5 px-8">
                    Continue <ChevronDown size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    To place an order, please log in to your account.
                  </p>
                  <button
                    onClick={openLoginModal}
                    className="bg-brand-orange text-white text-sm font-bold uppercase tracking-wider px-10 py-2.5 rounded-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    Login to Continue
                  </button>
                </div>
              )}
            </div>
          )}
          {activeStep > 0 && currentUser && (
            <div className="px-5 py-2 bg-gray-50 text-xs text-gray-500 font-semibold flex items-center gap-2">
              <Check size={14} className="text-brand-green" />
              Logged in as <span className="text-gray-800 font-bold">{currentUser.name}</span> ({currentUser.email})
            </div>
          )}
        </div>

        {/* Step 1: Delivery Address */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-3 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-brand-blue text-white cursor-pointer" onClick={() => setActiveStep(1)}>
            <div className="flex items-center gap-3">
              <span className="bg-white text-brand-blue w-6 h-6 rounded-sm flex items-center justify-center text-xs font-extrabold">2</span>
              <span className="text-sm font-bold uppercase tracking-wider">Delivery Address</span>
            </div>
            {activeStep > 1 && <Check size={18} className="text-green-300" />}
          </div>

          {activeStep === 1 && (
            <div className="p-5 flex flex-col gap-4">
              {/* Address List */}
              {addresses.map(addr => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-all
                    ${selectedAddressId === addr.id ? 'border-brand-blue bg-blue-50/50 ring-1 ring-brand-blue/20' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="deliveryAddress"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 accent-brand-blue"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">{addr.name}</span>
                      {addr.is_default && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                      {addr.address_line}{addr.locality ? `, ${addr.locality}` : ''}<br />
                      {addr.city}, {addr.state} — <span className="font-bold">{addr.pincode}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                      <span className="text-gray-700 font-bold">Phone:</span> {addr.phone}
                    </p>
                  </div>
                </label>
              ))}

              {/* Add New Address */}
              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm text-brand-blue font-bold hover:underline mt-1 cursor-pointer"
                >
                  <Plus size={16} /> Add a new address
                </button>
              ) : (
                <form onSubmit={handleAddressSubmit} className="border border-brand-blue/30 bg-blue-50/30 rounded-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-800 uppercase">New Address</h4>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input name="name" value={addressForm.name} onChange={handleAddressFormChange} required
                      placeholder="Full Name *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                    <input name="phone" value={addressForm.phone} onChange={handleAddressFormChange} required
                      placeholder="Phone Number *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                  </div>
                  <input name="address_line" value={addressForm.address_line} onChange={handleAddressFormChange} required
                    placeholder="Address (House No, Street, Area) *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                  <input name="locality" value={addressForm.locality} onChange={handleAddressFormChange} required
                    placeholder="Locality / Town *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input name="city" value={addressForm.city} onChange={handleAddressFormChange} required
                      placeholder="City *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                    <input name="state" value={addressForm.state} onChange={handleAddressFormChange} required
                      placeholder="State *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                    <input name="pincode" value={addressForm.pincode} onChange={handleAddressFormChange} required maxLength={6}
                      placeholder="Pincode *" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                  </div>
                  <input name="landmark" value={addressForm.landmark} onChange={handleAddressFormChange}
                    placeholder="Landmark (Optional)" className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-blue font-semibold" />
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
                    <input type="checkbox" name="is_default" checked={addressForm.is_default} onChange={handleAddressFormChange} className="accent-brand-blue" />
                    Set as default address
                  </label>
                  <button type="submit" className="bg-brand-orange text-white font-bold text-sm py-2.5 px-6 rounded-sm self-end hover:bg-opacity-90 transition-colors cursor-pointer">
                    Save Address
                  </button>
                </form>
              )}

              <button onClick={() => { if (selectedAddressId) setActiveStep(2); }}
                disabled={!selectedAddressId}
                className="btn-orange text-sm self-end w-max py-2.5 px-8 disabled:opacity-40 disabled:cursor-not-allowed mt-2">
                Deliver Here <ArrowRight size={14} />
              </button>
            </div>
          )}

          {activeStep > 1 && selectedAddress && (
            <div className="px-5 py-3 bg-gray-50 text-xs text-gray-500 font-semibold flex items-center gap-2">
              <MapPin size={14} className="text-brand-blue shrink-0" />
              <span>
                Delivering to <span className="text-gray-800 font-bold">{selectedAddress.name}</span> — {selectedAddress.address_line}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Order Summary */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-3 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-brand-blue text-white cursor-pointer" onClick={() => { if (activeStep >= 2) setActiveStep(2); }}>
            <div className="flex items-center gap-3">
              <span className="bg-white text-brand-blue w-6 h-6 rounded-sm flex items-center justify-center text-xs font-extrabold">3</span>
              <span className="text-sm font-bold uppercase tracking-wider">Order Summary</span>
            </div>
            {activeStep > 2 && <Check size={18} className="text-green-300" />}
          </div>

          {activeStep === 2 && (
            <div className="p-5 flex flex-col gap-4">
              {/* Compact cart items */}
              {cartItems.map(item => (
                <div key={item.product_id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-sm">
                  <div className="w-14 h-14 border border-gray-100 rounded-sm flex items-center justify-center bg-white shrink-0">
                    <img src={item.primary_image || item.image_url || 'https://via.placeholder.com/60'} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-extrabold text-gray-900">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                      <span className="text-gray-400 line-through">₹{parseFloat(item.original_price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-sm shrink-0">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}

              {/* Delivery estimate */}
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-green-50 px-4 py-2.5 rounded-sm">
                <Truck size={16} className="text-brand-green shrink-0" />
                <span>Estimated Delivery: <span className="font-bold text-gray-800">Tomorrow by 9pm</span></span>
              </div>

              <button onClick={() => setActiveStep(3)}
                className="btn-orange text-sm self-end w-max py-2.5 px-8 mt-1">
                Continue <ArrowRight size={14} />
              </button>
            </div>
          )}

          {activeStep > 2 && (
            <div className="px-5 py-2 bg-gray-50 text-xs text-gray-500 font-semibold flex items-center gap-2">
              <Package size={14} className="text-brand-blue" />
              {totalItemsCount} item(s) reviewed
            </div>
          )}
        </div>

        {/* Step 3: Payment */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 mb-3 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-brand-blue text-white cursor-pointer" onClick={() => { if (activeStep >= 3) setActiveStep(3); }}>
            <div className="flex items-center gap-3">
              <span className="bg-white text-brand-blue w-6 h-6 rounded-sm flex items-center justify-center text-xs font-extrabold">4</span>
              <span className="text-sm font-bold uppercase tracking-wider">Payment Options</span>
            </div>
          </div>

          {activeStep === 3 && (
            <div className="p-5 flex flex-col gap-4">
              {/* Payment Method Options */}
              {[
                { id: 'UPI', label: 'UPI (PhonePe / Google Pay / Paytm)', icon: <Wallet size={18} className="text-purple-500" />, desc: 'Pay securely via your UPI app' },
                { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard size={18} className="text-brand-blue" />, desc: 'Visa, Mastercard, RuPay supported' },
                { id: 'NETBANKING', label: 'Net Banking', icon: <Landmark size={18} className="text-green-600" />, desc: 'All major banks supported' },
                { id: 'COD', label: 'Cash on Delivery', icon: <Package size={18} className="text-brand-orange" />, desc: 'Pay when your order is delivered' }
              ].map(method => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-all
                    ${paymentMethod === method.id ? 'border-brand-blue bg-blue-50/50 ring-1 ring-brand-blue/20' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-0.5 accent-brand-blue"
                  />
                  <div className="flex items-center gap-3 flex-grow">
                    {method.icon}
                    <div>
                      <p className="text-sm font-bold text-gray-800">{method.label}</p>
                      <p className="text-[11px] text-gray-500 font-semibold">{method.desc}</p>
                    </div>
                  </div>
                </label>
              ))}

              {/* Error */}
              {orderError && (
                <div className="text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-sm">{orderError}</div>
              )}

              {/* Confirm & Pay Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="btn-orange text-sm uppercase tracking-wide self-end w-max py-3 px-10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {placingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Placing Order...
                  </span>
                ) : (
                  <>Confirm Order — ₹{finalAmount.toLocaleString('en-IN')} <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right — Price Summary */}
      <div className="w-full lg:w-80 shrink-0 hidden lg:block">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 sticky top-20">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Price Details</h2>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm border-b border-dashed border-gray-200">
            <div className="flex justify-between font-semibold text-gray-700">
              <span>Price ({totalItemsCount} items)</span>
              <span>₹{totalMRP.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-semibold text-brand-green">
              <span>Discount</span>
              <span>-₹{totalDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-700">
              <span>Delivery</span>
              <span>{deliveryCharges === 0 ? <span className="text-brand-green font-bold">FREE</span> : `₹${deliveryCharges}`}</span>
            </div>
          </div>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex justify-between font-extrabold text-base text-gray-900">
              <span>Total</span>
              <span>₹{finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          {savings > 0 && (
            <div className="px-5 py-3 bg-green-50 text-brand-green text-xs font-bold flex items-center gap-2">
              <Tag size={14} />
              You save ₹{savings.toLocaleString('en-IN')}
            </div>
          )}
          <div className="px-5 py-3 text-[11px] text-gray-400 font-semibold flex items-center gap-2">
            <ShieldCheck size={14} className="text-gray-300" />
            Safe and Secure Payments
          </div>
        </div>
      </div>
    </div>
  );
}
