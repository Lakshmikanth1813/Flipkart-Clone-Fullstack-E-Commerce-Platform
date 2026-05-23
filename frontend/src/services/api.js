const BASE_URL = 'http://localhost:5000/api';

// Get headers, appending token or user ID dynamically
const getHeaders = (userId) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (userId) {
    headers['x-user-id'] = userId.toString();
  }
  return headers;
};

export const apiService = {
  // AUTH
  async login(emailOrPhone, password) {
    const response = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Login failed');
    }
    return response.json();
  },

  async register(email, password, name, phone) {
    const response = await fetch(`${BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Registration failed');
    }
    return response.json();
  },

  // PRODUCTS
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const url = `${BASE_URL}/products?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductById(id) {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product details');
    return response.json();
  },

  async getCategories() {
    const response = await fetch(`${BASE_URL}/products/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // CART
  async getCart(userId) {
    const response = await fetch(`${BASE_URL}/cart`, {
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  async addToCart(userId, productId, quantity = 1) {
    const response = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ product_id: productId, quantity })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to add item to cart');
    }
    return response.json();
  },

  async updateCartQty(userId, productId, quantity) {
    const response = await fetch(`${BASE_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: getHeaders(userId),
      body: JSON.stringify({ quantity })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update cart quantity');
    }
    return response.json();
  },

  async removeFromCart(userId, productId) {
    const response = await fetch(`${BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to remove item from cart');
    return response.json();
  },

  // USER ADDRESSES & PROFILE
  async getProfile(userId) {
    const response = await fetch(`${BASE_URL}/user/profile`, {
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  async getAddresses(userId) {
    const response = await fetch(`${BASE_URL}/user/addresses`, {
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },

  async addAddress(userId, addressData) {
    const response = await fetch(`${BASE_URL}/user/addresses`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(addressData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to add address');
    }
    return response.json();
  },

  async deleteAddress(userId, addressId) {
    const response = await fetch(`${BASE_URL}/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to delete address');
    return response.json();
  },

  // WISHLIST
  async getWishlist(userId) {
    const response = await fetch(`${BASE_URL}/user/wishlist`, {
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    return response.json();
  },

  async toggleWishlist(userId, productId) {
    const response = await fetch(`${BASE_URL}/user/wishlist/toggle`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ product_id: productId })
    });
    if (!response.ok) throw new Error('Failed to toggle wishlist');
    return response.json();
  },

  // ORDERS
  async placeOrder(userId, addressId, paymentMethod) {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ address_id: addressId, payment_method: paymentMethod })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return response.json();
  },

  async getOrders(userId) {
    const response = await fetch(`${BASE_URL}/orders`, {
      headers: getHeaders(userId)
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }
};
