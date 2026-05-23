import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';
import { useUser } from './UserContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { userId } = useUser() || {};
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const items = await apiService.getCart(userId);
      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch cart whenever userId changes (login/logout)
  useEffect(() => {
    if (userId) {
      fetchCart();
    } else {
      // User logged out — clear cart
      setCartItems([]);
      setLoading(false);
    }
  }, [userId]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await apiService.addToCart(userId, productId, quantity);
      await fetchCart(); // Refresh cart items to sync database calculations
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    try {
      await apiService.updateCartQty(userId, productId, quantity);
      // Optimistic locally updated state first for snappy response
      setCartItems(prev => prev.map(item => 
        item.product_id === productId ? { ...item, quantity } : item
      ));
      // Re-fetch to sync database totals
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await apiService.removeFromCart(userId, productId);
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (err) {
      console.error('Error removing cart item:', err);
      throw err;
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Dynamic Billing Computations matching Flipkart's billing scheme
  const getBillingDetails = () => {
    let totalMRP = 0;
    let totalDiscount = 0;
    let totalItemsCount = 0;

    cartItems.forEach(item => {
      const price = parseFloat(item.price);
      const originalPrice = parseFloat(item.original_price);
      totalMRP += originalPrice * item.quantity;
      totalDiscount += (originalPrice - price) * item.quantity;
      totalItemsCount += item.quantity;
    });

    const subtotal = totalMRP - totalDiscount;
    const deliveryCharges = subtotal > 500 || subtotal === 0 ? 0 : 40; // Free delivery over ₹500
    const finalAmount = subtotal + deliveryCharges;

    return {
      totalItemsCount,
      totalMRP,
      totalDiscount,
      subtotal,
      deliveryCharges,
      finalAmount,
      savings: totalDiscount
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      ...getBillingDetails()
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
