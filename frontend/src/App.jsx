import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';

// Pages to be created next
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import Wishlist from './pages/Wishlist';

// A high-fidelity Flipkart-style dummy Footer
function Footer() {
  return (
    <footer className="bg-brand-darkBlue text-gray-400 text-xs py-10 mt-16 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-6 gap-8">
        
        {/* Col 1 */}
        <div>
          <h5 className="text-gray-500 font-bold uppercase mb-3">About</h5>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Flipkart Stories</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
            <li><a href="#" className="hover:underline">Corporate Information</a></li>
          </ul>
        </div>

        {/* Col 2 */}
        <div>
          <h5 className="text-gray-500 font-bold uppercase mb-3">Group Companies</h5>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:underline">Myntra</a></li>
            <li><a href="#" className="hover:underline">Cleartrip</a></li>
            <li><a href="#" className="hover:underline">Shopsy</a></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h5 className="text-gray-500 font-bold uppercase mb-3">Help</h5>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:underline">Payments</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Report Infringement</a></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h5 className="text-gray-500 font-bold uppercase mb-3">Consumer Policy</h5>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">Terms of Use</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
            <li><a href="#" className="hover:underline">Sitemap</a></li>
            <li><a href="#" className="hover:underline">EPR Compliance</a></li>
          </ul>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block border-l border-gray-700 h-32 my-auto col-span-1 max-w-0 mx-auto"></div>

        {/* Col 5: Address */}
        <div className="col-span-2 md:col-span-1">
          <h5 className="text-gray-500 font-bold uppercase mb-3">Registered Office Address:</h5>
          <p className="leading-relaxed text-gray-300">
            Flipkart Internet Private Limited,<br />
            Buildings Alyssa, Begonia &<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103,<br />
            Karnataka, India
          </p>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 font-medium">
        <div className="flex flex-wrap items-center gap-6 justify-center">
          <span>&copy; 2026 Flipkart-Clone SDE Intern Assignment</span>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
        <div className="text-center md:text-right">
          <span>Developed with ❤️ for Advanced Agentic Evaluation</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Sticky Header */}
            <Header />
            
            {/* Main Content Area */}
            <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-4 mt-2">
              <Routes>
                <Route path="/" element={<ProductListing />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}
