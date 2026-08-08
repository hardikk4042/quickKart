<div align="center">

# ⚡ QuickKart

### Everything you need. Delivered fast.

A full-stack quick-commerce platform inspired by Blinkit — built with a premium React frontend and a Node.js + Express + PostgreSQL backend architecture.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup-coming-soon)
- [Demo Accounts](#-demo-accounts)
- [Pages & Routes](#-pages--routes)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🚀 About the Project

**QuickKart** is a 10–30 minute quick-commerce delivery application where users can:

- 📍 Select their delivery location
- 🛍️ Browse products across 10+ categories
- 🔍 Search and filter products (Elasticsearch-ready)
- 🛒 Add products to cart, apply coupons, checkout
- 💳 Pay via UPI, Card, COD, or Wallet
- 📦 Track orders in real-time (Socket.IO-ready)
- ⭐ Rate products and delivery experience

The project is structured as a **monorepo** with a complete React frontend and a Node.js + Express backend scaffold. The frontend runs fully on **mock data** today, and is designed so connecting the real backend requires changing a single flag per service file.

---

## ✨ Features

### 👤 Customer
- 🏠 Location-aware home page with hero banners and product sections
- 🔍 Powerful search with suggestions, filters, and sorting
- 📁 Category & subcategory browsing
- 🛒 Persistent cart with coupon support
- ❤️ Wishlist with move-to-cart
- 🧾 Multi-step checkout (Address → Payment → Review)
- 📦 Live order tracking with status timeline
- 🔔 Notification center
- ⭐ Post-delivery review & rating

### 🛡️ Admin Panel (`/admin`)
- Dashboard with KPI cards and Recharts analytics
- Product management table
- Order management
- Placeholder pages for: Categories, Users, Inventory, Coupons, Delivery Partners

### 🏪 Store Manager (`/store`)
- Today's order stats
- Incoming orders with Pack / Ready actions
- Inventory management

### 🛵 Delivery Partner (`/delivery`)
- Online/Offline toggle
- New order accept/reject
- Active delivery with navigation
- Earnings and delivery history

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v3 | Styling |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| Axios | HTTP client |
| Lucide React | Icons |
| Recharts | Admin analytics charts |
| react-hot-toast | Toast notifications |
| Socket.IO Client | Real-time order tracking (stubbed) |
| canvas-confetti | Order confirmation animation |

### Backend *(scaffold — ready for implementation)*
| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| PostgreSQL | Primary database |
| Prisma | ORM |
| Redis | Caching & sessions |
| Kafka | Event streaming |
| Elasticsearch | Product search |
| Socket.IO | Real-time events |
| JWT | Authentication |

---

## 📁 Project Structure

```
QuickKart/
│
├── frontend/                        # React + Vite app (fully functional)
│   └── src/
│       ├── data/                    # Mock data (products, orders, etc.)
│       ├── services/                # API service layer (Axios)
│       ├── store/                   # Zustand global stores
│       ├── hooks/                   # Custom React hooks
│       ├── utils/                   # Formatting utilities
│       ├── components/
│       │   ├── common/              # SearchBar, HeroBanner, Modal, etc.
│       │   ├── navbar/              # Navbar, BottomNav
│       │   └── product/             # ProductCard, ProductSection
│       ├── pages/                   # 18 customer pages
│       ├── admin/                   # Admin panel
│       ├── storeManager/            # Store manager panel
│       ├── delivery/                # Delivery partner panel
│       ├── routes/                  # ProtectedRoute
│       ├── App.jsx                  # Router & layout assembly
│       └── main.jsx
│
├── backend/                         # Node.js + Express scaffold
│   └── src/
│       ├── config/                  # DB, Redis, Kafka, Elasticsearch, env
│       ├── modules/                 # Feature modules (auth, products, orders...)
│       ├── middleware/              # Auth, error, rate-limit, validation
│       ├── events/                  # Kafka producers & consumers
│       ├── jobs/                    # Background jobs
│       ├── sockets/                 # Socket.IO handlers
│       └── utils/                   # Logger, response, pagination...
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
│
├── docker/                          # Docker Compose + Prometheus config
├── docs/                            # Architecture, API, Database docs
└── .github/workflows/ci.yml         # CI pipeline
```

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org/) |
| npm | ≥ 9.x | Comes with Node |
| Git | Any | [git-scm.com](https://git-scm.com/) |

> 💡 You can check your versions with: `node -v` and `npm -v`

---

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/QuickKart.git
cd QuickKart
```

> Replace `YOUR_USERNAME` with the actual GitHub username.

---

### Frontend Setup

The frontend is **fully functional with mock data** — no backend required to run it.

```bash
# 1. Go into the frontend directory
cd frontend

# 2. Install all dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**

> If port 5173 is busy, Vite will automatically pick the next available port (e.g., 5174). Check the terminal output.

#### Environment Variables (Optional)

The frontend comes with a pre-configured `.env` file. If you want to point it at a real backend:

```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

### Backend Setup *(coming soon)*

> The backend scaffold is in place. Implementation of each module is in progress.

Once the backend is implemented:

```bash
cd backend
npm install
cp .env.example .env      # Fill in your DB, Redis, and Kafka credentials
npx prisma migrate dev    # Run database migrations
npx prisma db seed        # Seed the database
npm run dev               # Start the Express server on port 3000
```

**Required services** (use Docker Compose for local dev):
```bash
docker-compose up -d      # Starts PostgreSQL, Redis, Kafka, Elasticsearch
```

---

## 🔑 Demo Accounts

These are available on the **Login page** as clickable buttons — no need to type:

| Role | Email | Password | Redirects to |
|---|---|---|---|
| 👤 Customer | `hardik@quickkart.com` | `password123` | `/` |
| 🛡️ Admin | `admin@quickkart.com` | `admin123` | `/admin` |
| 🏪 Store Manager | `store@quickkart.com` | `store123` | `/store` |
| 🛵 Delivery Partner | `delivery@quickkart.com` | `delivery123` | `/delivery` |

---

## 📄 Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/search?q=...` | Search | No |
| `/category` | All Categories | No |
| `/category/:slug` | Category Products | No |
| `/product/:id` | Product Details | No |
| `/cart` | Shopping Cart | No |
| `/wishlist` | Wishlist | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/checkout` | Checkout (3-step) | ✅ Yes |
| `/order-confirmed/:id` | Order Confirmation | ✅ Yes |
| `/track/:id` | Live Order Tracking | ✅ Yes |
| `/orders` | Order History | ✅ Yes |
| `/account` | My Account | No |
| `/notifications` | Notification Center | No |
| `/review/:orderId` | Rate Experience | No |
| `/admin/*` | Admin Panel | ✅ Admin only |
| `/store/*` | Store Manager | ✅ Store Manager only |
| `/delivery` | Delivery Partner | ✅ Delivery Partner only |

---

## 🔌 Switching from Mock Data to Real Backend

All API calls are isolated in `frontend/src/services/`. When the backend is ready:

1. Open any service file, e.g., `src/services/product.api.js`
2. Change the flag at the top:
   ```js
   const MOCK = false;  // was: true
   ```
3. The real Axios call below it will automatically take over.

That's it. **No UI changes needed.**

---

## 🧪 Scripts

### Frontend

```bash
npm run dev        # Start dev server (hot reload)
npm run build      # Production build
npm run preview    # Preview the production build locally
```

---

## 🤝 Contributing

1. **Fork** the repo and create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and **commit**:
   ```bash
   git commit -m "feat: add your feature"
   ```
3. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a **Pull Request** against the `main` branch.

Please follow the existing folder structure and keep components small and focused.

---

## 📦 Backend Modules (Scaffold — in progress)

| Module | Description |
|---|---|
| `auth` | JWT login, register, refresh token |
| `users` | User profile CRUD |
| `addresses` | Address management |
| `products` | Product listing, search, details |
| `categories` | Category hierarchy |
| `search` | Elasticsearch integration |
| `inventory` | Stock management |
| `cart` | Cart operations with Redis |
| `wishlist` | Saved products |
| `coupons` | Coupon validation |
| `orders` | Order creation and management |
| `payments` | Payment gateway integration |
| `refunds` | Refund processing |
| `delivery` | Delivery partner assignment |
| `reviews` | Product and delivery ratings |
| `notifications` | Push notifications |
| `analytics` | Sales and traffic analytics |

---

## 📝 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it.

---

<div align="center">

Built with ❤️ by **Hardik**

⭐ Star this repo if you find it useful!

</div>
