# 🛒 eCommerce Backend + Frontend

A full-stack eCommerce app with Express, MongoDB, and vanilla JavaScript frontend.

---

## Project Goal
The eCommerce API provides a backend for an online store, allowing shoppers to browse products, manage a shopping cart, and letting admins add, update, or remove products.

## User Stories
- As a shopper, I can view all products so that I can decide what to buy.
- As a shopper, I can create a cart and add items to it so that I can track my intended purchases.
- As an admin, I can add new products, update existing ones, and delete products so that the store catalogue stays current.


## 🚀 Features

- Product CRUD (create, read, update, delete)
- Shopping cart (add, view, clear)
- Checkout with automatic stock reduction
- Modern responsive frontend
- Search and filter products
- Persistent MongoDB database
- Postman collection included

---

## 🛠️ Tech Stack

Node.js | Express.js | MongoDB | Mongoose | HTML | CSS | JavaScript

---

## 📦 Setup

```bash
git clone https://github.com/teto1111/ecommerce-backend.git
cd ecommerce-backend

npm install

Create .env:
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
PORT=5000

npm run seed    # optional: add sample products
npm run dev     # start server

Open http://localhost:5000

📡 API Endpoints
Products
GET /api/products — All products

GET /api/products/:id — Single product

POST /api/products — Create product

PUT /api/products/:id — Update product

DELETE /api/products/:id — Delete product

Cart
GET /api/cart — View cart

POST /api/cart/add — Add item

DELETE /api/cart/clear — Clear cart

POST /api/cart/checkout — Purchase (reduces stock)