# eCommerce Backend API

A simple REST API for products and cart built with Express and MongoDB.

## Setup
1. Clone the repo
2. Run `npm install`
3. Create `.env` with `MONGO_URI=your_mongo_uri`
4. Run `npm run seed` to add sample data
5. Run `npm run dev` to start

## Endpoints
### Products
- `GET /api/products` – get all
- `GET /api/products/:id` – get one
- `POST /api/products` – create
- `PUT /api/products/:id` – update
- `DELETE /api/products/:id` – delete

### Cart
- `GET /api/cart` – view cart
- `POST /api/cart/add` – add item `{ "productId": "...", "quantity": 1 }`