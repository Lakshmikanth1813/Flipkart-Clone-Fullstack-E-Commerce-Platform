# 🛒 Flipkart Clone — Fullstack E-Commerce Platform

A fullstack e-commerce web application inspired by Flipkart, built using React.js, Node.js, Express.js, and PostgreSQL.

The application includes product browsing, search & filtering, cart management, checkout flow, authentication, wishlist functionality, and order placement with a responsive modern UI.

---

# 📸 Screenshots

## 🏠 Home Page

<p align="center">
  <img src="./Project Screenshots/home.png" width="100%" />
</p>

---

## 📦 Product Listing Page

<p align="center">
  <img src="./Project Screenshots/product_list.png" width="100%" />
</p>

---

## ❤️ Wishlist Page

<p align="center">
  <img src="./Project Screenshots/wishlist.png" width="100%" />
</p>

---

## 🛒 Cart Page

<p align="center">
  <img src="./Project Screenshots/cart.png" width="100%" />
</p>

---

## ✅ Order Placed Page

<p align="center">
  <img src="./Project Screenshots/order_placed.png" width="100%" />
</p>

---

## 📜 Order History Page

<p align="center">
  <img src="./Project Screenshots/order_history.png" width="100%" />
</p>

---

## 🔐 Authentication Page

<p align="center">
  <img src="./Project Screenshots/login.png" width="100%" />
</p>

---

# 🚀 Features

## ✅ Product Listing Page

* Responsive product grid layout
* Flipkart-inspired UI design
* Product cards with pricing and discounts
* Search products by name
* Filter products by category
* Sorting functionality

---

## ✅ Product Detail Page

* Multiple product images
* Product description & specifications
* Price and stock availability
* Add to Cart functionality
* Buy Now functionality

---

## ✅ Shopping Cart

* Add products to cart
* Update product quantity
* Remove products from cart
* Dynamic subtotal & total calculation

---

## ✅ Checkout & Order Placement

* Shipping address form
* Order summary review
* Place order functionality
* Order confirmation page with Order ID

---

## ✅ Authentication

* User Login
* User Signup
* Password-based authentication
* Protected user routes
* Persistent login session

---

## ✅ Additional Features

* Responsive design (Mobile, Tablet, Desktop)
* Wishlist functionality
* Order history page
* PostgreSQL relational database
* REST API architecture
* Modular backend structure
* Seeded sample products

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router DOM
* Axios
* Tailwind CSS

---

## Backend

* Node.js
* Express.js

---

## Database

* PostgreSQL

---

# 📁 Project Structure

```txt
FlipKart_Clone/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── App.jsx
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── database/
│   │   ├── middleware/
│   │   └── app.js
│   │
│   └── package.json
│
├── Project Screenshots/
│
└── README.md
```

---

# 🗄️ Database Design

The application uses PostgreSQL with relational database design.

## Main Tables

* users
* categories
* products
* product_images
* cart_items
* wishlist
* orders
* order_items

---

# ⚙️ Backend API Endpoints

## Products

```http
GET /products
GET /products/:id
```

## Cart

```http
GET /cart
POST /cart
PUT /cart/:id
DELETE /cart/:id
```

## Wishlist

```http
GET /wishlist
POST /wishlist
DELETE /wishlist/:id
```

## Orders

```http
POST /orders
GET /orders
```

## Authentication

```http
POST /auth/login
POST /auth/signup
```

---

# 🌱 Database Seeding

The project includes seeded sample products across multiple categories.

### Categories Included

* Mobiles
* Electronics
* Fashion
* Laptops

---

# 🔧 Environment Variables

Create a `.env` file inside the backend folder.

```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flipkart_clone
PORT=5000
JWT_SECRET=your_secret_key
```

---

# 📦 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone <https://github.com/Lakshmikanth1813/Flipkart-Clone-Fullstack-E-Commerce-Platform >
```

---

## 2️⃣ Backend Setup

```bash
cd backend

npm install
```

### Create PostgreSQL Database

Create a database named:

```txt
flipkart_clone
```

### Run Database Initialization

```bash
node src/database/init.js
```

### Seed Sample Data

```bash
node src/database/seed.js
```

### Start Backend Server

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# 📱 Responsive Design

The application is responsive across:

* Mobile devices
* Tablets
* Desktop screens

---

# 🎯 Assignment Goals Covered

✅ Product Listing Page
✅ Product Detail Page
✅ Shopping Cart
✅ Checkout & Order Placement
✅ Responsive Design
✅ Authentication
✅ Wishlist Functionality
✅ Order History
✅ PostgreSQL Database Design
✅ REST APIs
✅ Flipkart-inspired UI

---

# 🚀 Deployment

## Frontend

* Vercel
* Netlify

## Backend

* Render
* Railway

## Database

* PostgreSQL

---

# 👨‍💻 Author

--Dhani Lakshmi Kanth Reddy
LinkedIn : https://www.linkedin.com/in/dhani-reddy-lakshmi-kanth-reddy-33a511298/
GitHub: https://github.com/Lakshmikanth1813
