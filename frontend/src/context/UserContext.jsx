import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';
import LoginModal from '../components/LoginModal';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  // Read current token
  const token = localStorage.getItem('token');
  const userId = currentUser ? currentUser.id : null;

  // Load profile and related data if authenticated
  const loadUserData = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const profile = await apiService.getProfile();
      setCurrentUser(profile);

      // Fetch addresses
      const addressList = await apiService.getAddresses(profile.id);
      setAddresses(addressList);

      // Fetch wishlist
      const wishItems = await apiService.getWishlist(profile.id);
      setWishlist(wishItems);
    } catch (err) {
      console.error('Error loading authenticated user data:', err);
      // If profile fails, clear invalid token
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUserData();
    } else {
      setCurrentUser(null);
      setAddresses([]);
      setWishlist([]);
      setLoading(false);
    }
  }, [token]);

  const refreshAddresses = async () => {
    if (!userId) return;
    try {
      const addressList = await apiService.getAddresses(userId);
      setAddresses(addressList);
    } catch (err) {
      console.error('Error refreshing addresses:', err);
    }
  };

  const addAddress = async (addressData) => {
    if (!userId) throw new Error('User not logged in');
    try {
      const newAddress = await apiService.addAddress(userId, addressData);
      setAddresses(prev => {
        if (newAddress.is_default) {
          return [newAddress, ...prev.map(addr => ({ ...addr, is_default: false }))];
        }
        return [...prev, newAddress];
      });
      return newAddress;
    } catch (err) {
      console.error('Error adding address to user:', err);
      throw err;
    }
  };

  const deleteAddress = async (addressId) => {
    if (!userId) throw new Error('User not logged in');
    try {
      await apiService.deleteAddress(userId, addressId);
      setAddresses(prev => {
        const remaining = prev.filter(addr => addr.id !== addressId);
        const deletedWasDefault = prev.find(addr => addr.id === addressId)?.is_default;
        if (deletedWasDefault && remaining.length > 0) {
          remaining[0].is_default = true;
        }
        return remaining;
      });
    } catch (err) {
      console.error('Error deleting address:', err);
      throw err;
    }
  };

  const toggleWishlist = async (productId) => {
    if (!userId) {
      openLoginModal();
      return false;
    }
    try {
      const res = await apiService.toggleWishlist(userId, productId);
      const wishItems = await apiService.getWishlist(userId);
      setWishlist(wishItems);
      return res.added;
    } catch (err) {
      console.error('Error toggling wishlist item:', err);
      throw err;
    }
  };

  const isProductInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };

  // Auth Operations
  const login = async (emailOrPhone, password) => {
    try {
      const res = await apiService.login(emailOrPhone, password);
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
      // Wait for user data to load
      await loadUserData();
      setLoginModalOpen(false);
      return res.user;
    } catch (err) {
      console.error('Login action error:', err);
      throw err;
    }
  };

  const register = async (email, password, name, phone) => {
    try {
      const res = await apiService.register(email, password, name, phone);
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
      // Wait for user data to load
      await loadUserData();
      setLoginModalOpen(false);
      return res.user;
    } catch (err) {
      console.error('Register action error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setAddresses([]);
    setWishlist([]);
  };

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  return (
    <UserContext.Provider value={{
      currentUser,
      addresses,
      wishlist,
      loading,
      userId,
      addAddress,
      deleteAddress,
      toggleWishlist,
      isProductInWishlist,
      refreshAddresses,
      login,
      register,
      logout,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
