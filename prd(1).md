# QuickKart — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Draft / Development Specification  
**Project Type:** University 5th Semester Backend Engineering Project  
**Primary Goal:** Build a production-style quick-commerce platform inspired by the core workflow of Blinkit, with a strong JavaScript/Node.js backend.

---

## 1. Product Overview

QuickKart is a quick-commerce platform that allows customers to discover nearby products, add them to a cart, place orders, make payments, and track deliveries.

The project is intentionally designed to go beyond a basic e-commerce CRUD application. The primary learning objective is backend engineering: authentication, authorization, transactional workflows, inventory concurrency, caching, asynchronous event processing, search, real-time updates, testing, observability, and deployment.

QuickKart should have its own branding and UI and should not copy Blinkit's proprietary branding, assets, or exact interface.

### Tagline

> Everything you need. Delivered fast.

---

## 2. Goals

### Primary Goals

1. Build a complete quick-commerce customer experience.
2. Build a strong JavaScript backend using Node.js and Express.js.
3. Learn production-oriented backend architecture and engineering practices.
4. Implement realistic order, payment, inventory, and delivery workflows.
5. Demonstrate concurrency control and transactional consistency.
6. Introduce Redis, Kafka, Elasticsearch, WebSockets, Docker, testing, and monitoring progressively.
7. Create a portfolio project suitable for SDE/backend interviews.

### Secondary Goals

- Provide separate interfaces for customers, store managers, delivery partners, and administrators.
- Make the system modular so selected modules can later be extracted into microservices.
- Keep frontend and backend cleanly separated through REST APIs.

---

## 3. Non-Goals

The first version will NOT attempt to reproduce the full operational complexity of a real commercial quick-commerce company.

The following are outside the initial scope:

- Real-world warehouse robotics.
- Real logistics fleet optimization at commercial scale.
- Production financial settlement systems.
- Real customer PII/payment storage.
- Actual large-scale delivery infrastructure.
- Exact replication of Blinkit's proprietary systems or UI.
- AI as the core of the platform.

AI/recommendation features may be added later as optional extensions.

---

## 4. Target Users

### 4.1 Customer

Customers can:

- Register and log in.
- Manage their profile.
- Manage delivery addresses.
- Browse products and categories.
- Search and filter products.
- Add/remove products from cart.
- Manage wishlist.
- Apply coupons.
- Checkout.
- Make test payments.
- View and cancel eligible orders.
- Track active orders.
- View order history.
- Reorder previous purchases.
- Receive notifications.
- Rate products and deliveries.

### 4.2 Store Manager

Store managers can:

- Log in securely.
- Access only their assigned store.
- View incoming orders.
- Manage store inventory.
- Update stock quantities.
- Identify low-stock products.
- Pack orders.
- Mark orders ready for pickup.
- View store-level operational metrics.

### 4.3 Delivery Partner

Delivery partners can:

- Log in.
- Go online/offline.
- View available/assigned deliveries.
- Accept or reject eligible deliveries.
- Pick up orders.
- Update delivery status.
- Complete deliveries.
- View delivery history.
- View basic earnings information.

### 4.4 Administrator

Administrators can:

- Manage users.
- Manage stores.
- Manage products.
- Manage categories.
- Manage inventory.
- Manage coupons.
- Manage delivery partners.
- View all orders.
- Manage selected platform settings.
- View platform analytics.
- Suspend or reactivate accounts.

---

## 5. Core Functional Requirements

### 5.1 Authentication

The system shall support:

- User registration.
- Login.
- Logout.
- Password hashing.
- JWT access tokens.
- Refresh tokens.
- Token expiration.
- Password reset flow.
- Input validation.
- Authentication middleware.

Authentication answers:

> Who is this user?

---

### 5.2 Authorization

The system shall support role-based authorization.

Roles:

- CUSTOMER
- STORE_MANAGER
- DELIVERY_PARTNER
- ADMIN

The system shall also support resource-level authorization where appropriate.

Example:

A Store Manager can update inventory only for their assigned store.

Authorization answers:

> What is this authenticated user allowed to do?

---

### 5.3 Address and Location Management

Customers shall be able to:

- Add addresses.
- Edit addresses.
- Delete addresses.
- Set a default address.
- Select an address during checkout.

The system should associate a customer's delivery location with an appropriate nearby store.

---

### 5.4 Store Management

The platform shall support multiple stores/dark stores.

A store shall have:

- Store ID.
- Name.
- Address.
- Latitude/longitude.
- Operating status.
- Assigned manager.
- Inventory.
- Associated delivery partners.

Admins can create, update, enable, and disable stores.

---

### 5.5 Product Catalog

Products shall support:

- Name.
- Description.
- Brand.
- Category.
- Images.
- Weight/quantity.
- Unit.
- Price.
- Discount.
- Availability.
- Store-specific inventory.

Customers shall be able to browse products by category and view detailed product information.

---

### 5.6 Product Search

The platform shall support:

- Full-text search.
- Fuzzy search.
- Autocomplete.
- Category filtering.
- Brand filtering.
- Price filtering.
- Discount filtering.
- Availability filtering.
- Sorting.

Elasticsearch should be introduced for advanced search.

---

### 5.7 Cart

Customers shall be able to:

- Add items.
- Remove items.
- Increase quantity.
- Decrease quantity.
- Clear the cart.
- View subtotal.
- Apply/remove coupons.
- See delivery fees.
- See the final payable amount.

The backend must calculate authoritative prices and totals rather than trusting values sent by the frontend.

Redis may be used for active cart storage/caching.

---

### 5.8 Wishlist

Customers shall be able to:

- Add products to wishlist.
- Remove products.
- View wishlist.
- Move wishlist products to cart.

---

### 5.9 Coupons and Discounts

The platform shall support:

- Percentage discounts.
- Flat discounts.
- Minimum-order requirements.
- Maximum discount limits.
- Expiration dates.
- Usage limits.
- First-order coupons.
- Product/category-specific coupons.

Coupon validation must happen on the backend.

---

## 6. Inventory Requirements

Inventory is a critical backend component.

Each store shall maintain product-specific inventory.

The system shall support:

- Stock quantity.
- Reserved quantity.
- Available quantity.
- Inventory adjustments.
- Inventory transaction history.
- Low-stock detection.
- Stock replenishment.

### Inventory Reservation

When an order is being processed, inventory shall be reserved before final confirmation.

Example:

```text
Available Stock
      ↓
Reserve Stock
      ↓
Payment Success
      ↓
Confirm Reservation
```

If payment fails or the order is cancelled within the applicable window:

```text
Reserved Stock
      ↓
Release Reservation
      ↓
Available Stock
```

### Concurrency Requirement

The system must prevent overselling when multiple customers attempt to purchase the same limited-stock product simultaneously.

Possible implementation techniques:

- Database transactions.
- Optimistic locking.
- Pessimistic locking where justified.
- Atomic Redis operations for suitable use cases.

---

## 7. Checkout and Order Creation

Checkout shall validate:

1. Customer authentication.
2. Delivery address.
3. Store availability.
4. Product availability.
5. Current product prices.
6. Cart quantities.
7. Coupon validity.
8. Delivery fee.
9. Final order total.

The frontend must never be treated as the source of truth for price or inventory.

---

## 8. Order Lifecycle

The order state machine shall include:

```text
CREATED
   ↓
PAYMENT_PENDING
   ↓
CONFIRMED
   ↓
PACKING
   ↓
READY_FOR_PICKUP
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

Possible terminal/error states:

```text
PAYMENT_FAILED
CANCELLED
REFUNDED
```

Only valid state transitions shall be allowed.

---

## 9. Payment Requirements

The project shall use a payment gateway in test/sandbox mode.

The system should support:

- Payment initiation.
- Payment status.
- Payment success.
- Payment failure.
- Payment webhook handling.
- Refund initiation/status.

### Idempotency

Payment webhooks and payment-related requests must be idempotent.

If the same payment-success event arrives multiple times, the system must not:

- Create duplicate orders.
- Process payment twice.
- Reserve inventory twice.
- Send duplicate critical notifications unnecessarily.

---

## 10. Delivery Management

The system shall support delivery partner management.

### Delivery Assignment

When an order becomes ready:

```text
Order Ready
    ↓
Find eligible delivery partners
    ↓
Select suitable partner
    ↓
Assign delivery
```

Initial assignment can use:

- Availability.
- Distance.
- Current workload.

More advanced optimization may be added later.

### Delivery States

```text
ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
ARRIVED
DELIVERED
```

---

## 11. Real-Time Order Tracking

Customers shall be able to view order progress in near real time.

Possible implementation:

- Socket.IO / WebSockets.

Example:

```text
Order Confirmed       ✓
Packing               ✓
Ready for Pickup      ✓
Out for Delivery      ●
Delivered             ○
```

Delivery partners can update their status and delivery progress.

---

## 12. Notifications

The platform shall support notifications for important events.

Examples:

- Registration.
- Order created.
- Payment successful.
- Payment failed.
- Order confirmed.
- Order packed.
- Delivery assigned.
- Out for delivery.
- Order delivered.
- Order cancelled.
- Refund initiated.

Notification delivery can initially use in-app notifications and email.

Kafka can later be used to decouple notification processing from order processing.

---

## 13. Reviews and Ratings

After eligible completed orders, customers can:

- Rate products.
- Rate delivery.
- Write reviews.

The system shall prevent inappropriate review actions such as reviewing an item that was never purchased, where applicable.

---

## 14. Analytics

The platform should expose business metrics such as:

- Total orders.
- Daily orders.
- Revenue.
- Average order value.
- Popular products.
- Popular categories.
- Cancellation rate.
- Delivery time.
- Active users.
- Low-stock products.

Admin can view platform-level analytics.

Store managers can view store-level analytics.

---

## 15. Backend Architecture

### Initial Architecture

Start with a modular monolith.

```text
Node.js
   ↓
Express.js
   ↓
Modules
   ├── Auth
   ├── Users
   ├── Addresses
   ├── Stores
   ├── Products
   ├── Search
   ├── Inventory
   ├── Cart
   ├── Wishlist
   ├── Coupons
   ├── Orders
   ├── Payments
   ├── Delivery
   ├── Notifications
   └── Analytics
```

The architecture should keep modules sufficiently isolated so they can later be extracted into services.

---

## 16. Recommended Technology Stack

### Frontend

- React.
- Vite.
- JavaScript.
- React Router.
- Tailwind CSS.
- Axios.
- Context API or Zustand.
- Socket.IO client.

### Backend

- JavaScript.
- Node.js.
- Express.js.
- REST APIs.
- Prisma ORM.

### Data

- Neon PostgreSQL (managed cloud PostgreSQL).
- Redis.

### Distributed/Event Systems

- Apache Kafka.

### Search

- Elasticsearch.

### Real-Time

- Socket.IO.

### Validation/Security

- Zod or equivalent validation library.
- JWT.
- Secure password hashing.
- RBAC.
- Rate limiting.

### Testing

- Jest.
- Supertest.
- Testcontainers for integration testing.

### DevOps

- Docker.
- Docker Compose.
- GitHub Actions.

### Observability

- Winston or Pino for structured logging.
- Prometheus.
- Grafana.
- Health checks.

---

## 17. API Architecture

Frontend and backend shall communicate through REST APIs.

Example API groups:

```text
/api/auth
/api/users
/api/addresses
/api/stores
/api/products
/api/categories
/api/search
/api/cart
/api/wishlist
/api/coupons
/api/inventory
/api/orders
/api/payments
/api/delivery
/api/reviews
/api/notifications
/api/admin
```

The backend shall use a consistent response and error format.

---

## 18. Core Request Pipeline

A typical request should follow:

```text
Client
  ↓
Route
  ↓
Authentication Middleware
  ↓
Authorization Middleware
  ↓
Validation Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository / Prisma
  ↓
PostgreSQL
```

For event-driven workflows:

```text
Order Service
      ↓
Kafka Event
      ↓
Consumers
 ┌────┼──────────────┐
 ↓    ↓              ↓
Inventory Notification Delivery
```

---

## 19. Caching and Performance

Redis should be used where it provides a clear benefit.

Potential use cases:

- Product caching.
- Active carts.
- OTP storage with TTL.
- Rate limiting.
- Frequently accessed data.
- Distributed locks for suitable operations.

The application should also use:

- Database indexes.
- Pagination.
- Efficient queries.
- Connection pooling.
- Appropriate cache expiration.

---

## 20. Rate Limiting

Rate limiting should protect sensitive/high-cost APIs.

Examples:

- Login attempts.
- Registration.
- Search.
- Payment endpoints.
- OTP requests.

The exact limits should be configurable using environment/configuration values.

---

## 21. Fault Tolerance

The system should gracefully handle:

- Database failures.
- Redis failures.
- Kafka failures.
- Payment failures.
- Network timeouts.
- Duplicate requests.
- Invalid input.
- Missing resources.

For asynchronous processing, the project may implement:

```text
Event
  ↓
Consumer
  ↓
Failure
  ↓
Retry
  ↓
Retry
  ↓
Dead Letter Queue
```

---

## 22. Database Requirements

QuickKart will use **Neon PostgreSQL** as its primary transactional database. Neon provides managed cloud PostgreSQL, so a local PostgreSQL server is not required for development. The Node.js backend connects to Neon through Prisma using the `DATABASE_URL` environment variable.

Development and production database environments should be separated appropriately (for example, using separate Neon projects/branches).

The initial relational database should contain entities similar to:

```text
users
roles
addresses

stores
store_managers

products
categories
brands

inventory
inventory_transactions

carts
cart_items

wishlists
wishlist_items

orders
order_items

payments
refunds

delivery_partners
deliveries

coupons
coupon_usage

reviews
notifications
```

The exact schema can evolve during implementation.

### Database Environment

QuickKart will use **Neon PostgreSQL** as its managed cloud database.

```text
QuickKart Backend
      ↓
    Prisma
      ↓
  Internet
      ↓
Neon PostgreSQL
```

The application should connect through an environment variable:

```env
DATABASE_URL="<NEON_POSTGRESQL_CONNECTION_STRING>"
```

The Neon connection string must never be committed to GitHub. The `.env` file must remain ignored by Git, while `.env.example` may document the required variable format without containing real credentials.

A local PostgreSQL server is **not required** for the QuickKart development environment.

---

## 23. Security Requirements

The system shall:

- Hash passwords securely.
- Use JWT securely.
- Protect privileged routes.
- Validate request payloads.
- Prevent unauthorized resource access.
- Apply rate limiting.
- Avoid exposing secrets.
- Use environment variables for credentials.
- Avoid committing `.env` files to Git.
- Validate webhook authenticity where supported.
- Sanitize/validate user-controlled data.

---

## 24. Frontend Requirements

The frontend shall provide separate experiences for:

### Customer

- Home.
- Product listing.
- Search.
- Product details.
- Cart.
- Wishlist.
- Checkout.
- Payment.
- Orders.
- Order tracking.
- Account.
- Notifications.
- Reviews.

### Admin

- Dashboard.
- Users.
- Products.
- Categories.
- Stores.
- Inventory.
- Orders.
- Coupons.
- Delivery partners.
- Analytics.

### Store Manager

- Dashboard.
- Inventory.
- Orders.
- Packing workflow.
- Store analytics.

### Delivery Partner

- Dashboard.
- Online/offline status.
- Assigned delivery.
- Pickup.
- Delivery completion.
- Delivery history.
- Earnings.

---

## 25. Frontend UX Requirements

The frontend should be:

- Responsive.
- Mobile-friendly.
- Fast.
- Accessible.
- Consistent.
- Professional.

It should provide:

- Loading states.
- Skeleton loaders.
- Empty states.
- Error states.
- Retry actions.
- Toast notifications.
- Form validation.
- Responsive navigation.

The frontend must not contain core business rules that belong on the backend.

---

## 26. Testing Requirements

### Unit Tests

Test:

- Services.
- Business rules.
- Coupon calculation.
- Order state transitions.
- Inventory calculations.
- Authorization rules.

### Integration Tests

Test:

- Database operations.
- Redis interactions.
- API flows.
- Authentication.
- Order creation.
- Inventory reservation.

### End-to-End Tests

Test important user journeys:

```text
Register
  ↓
Login
  ↓
Browse products
  ↓
Add to cart
  ↓
Checkout
  ↓
Payment
  ↓
Order
  ↓
Delivery
  ↓
Completed order
```

---

## 27. Observability Requirements

The backend should expose:

- Health status.
- Request metrics.
- Response latency.
- Error rate.
- Database metrics where appropriate.
- Kafka consumer/lag metrics where applicable.
- Cache hit/miss information where useful.

Recommended pipeline:

```text
Application
   ↓
Metrics / Logs
   ↓
Prometheus / Logging System
   ↓
Grafana / Log Dashboard
```

---

## 28. Deployment Requirements

The application should be containerized.

Development environment should be able to run using Docker Compose.

Expected infrastructure may include:

```text
Frontend
Backend
Neon PostgreSQL
Redis
Kafka
Elasticsearch
Prometheus
Grafana
```

The exact deployment provider can be selected later.

---

## 29. CI/CD Requirements

GitHub Actions should eventually:

1. Install dependencies.
2. Run linting.
3. Run tests.
4. Build the application.
5. Build Docker images where applicable.
6. Deploy after successful checks.

---

## 30. Development Roadmap

### Phase 1 — Project Setup

- Repository setup.
- Frontend setup.
- Node.js/Express setup.
- Environment configuration.
- Neon PostgreSQL connection.
- Prisma setup.
- Basic project architecture.

### Phase 2 — Authentication and Users

- Registration.
- Login.
- JWT.
- Refresh tokens.
- Roles.
- Authorization.
- User profile.

### Phase 3 — Products

- Categories.
- Products.
- Product details.
- Store association.
- Search API.
- Admin product management.

### Phase 4 — Cart and Wishlist

- Cart.
- Cart items.
- Wishlist.
- Price calculation.

### Phase 5 — Inventory

- Store inventory.
- Stock updates.
- Reservation.
- Transactions.
- Concurrency handling.

### Phase 6 — Checkout and Orders

- Checkout.
- Order creation.
- Order state machine.
- Cancellation.
- Order history.

### Phase 7 — Payments

- Test payment gateway.
- Payment status.
- Webhooks.
- Idempotency.
- Refunds.

### Phase 8 — Delivery

- Delivery partners.
- Assignment.
- Delivery state.
- Tracking.

### Phase 9 — Redis

- Product caching.
- Cart caching.
- Rate limiting.
- TTL-based data.

### Phase 10 — Kafka

- Order events.
- Payment events.
- Inventory events.
- Notification events.
- Retry/DLQ strategy.

### Phase 11 — Elasticsearch and Real-Time

- Advanced product search.
- Autocomplete.
- Socket.IO order tracking.

### Phase 12 — Testing and Quality

- Unit tests.
- Integration tests.
- E2E tests.
- API documentation.

### Phase 13 — DevOps and Observability

- Docker.
- Docker Compose.
- GitHub Actions.
- Logging.
- Prometheus.
- Grafana.
- Deployment.

### Phase 14 — Optional Microservices Evolution

After the modular monolith is stable, selected modules may be extracted into independent services.

Potential services:

```text
Auth Service
Product Service
Inventory Service
Order Service
Payment Service
Delivery Service
Notification Service
```

Do not introduce microservices before there is a clear architectural reason.

---

## 31. Success Criteria

QuickKart will be considered successful when:

- Customers can complete the full purchase flow.
- Authentication and authorization work correctly.
- Inventory remains consistent under concurrent purchase attempts.
- Orders follow valid state transitions.
- Payment processing is idempotent.
- Delivery can be assigned and completed.
- Customers can track orders.
- Redis provides measurable performance benefits for appropriate use cases.
- Kafka handles selected asynchronous workflows.
- Search works through Elasticsearch.
- Tests cover critical business logic.
- The application can run through Docker.
- APIs are documented.
- Monitoring and health checks are available.
- The repository has clear documentation and meaningful Git history.

---

## 32. Key Engineering Principles

1. Backend is the source of truth for business logic.
2. Never trust prices or inventory values supplied by the frontend.
3. Protect all privileged operations with authorization.
4. Use transactions where consistency requires them.
5. Make payment/webhook processing idempotent.
6. Use asynchronous events where they provide clear decoupling.
7. Use caching only where it solves a demonstrated performance problem.
8. Prefer a modular monolith before introducing microservices.
9. Keep services/modules independently testable.
10. Never commit secrets or credentials.
11. Build features incrementally instead of adding technologies without a purpose.
12. Optimize for learning real backend engineering concepts rather than maximizing the technology list.

---

## 33. Final End-to-End Flow

The primary customer journey is:

```text
Register / Login
      ↓
Select Location
      ↓
Identify Nearby Store
      ↓
Browse / Search Products
      ↓
View Product
      ↓
Add to Cart
      ↓
Apply Coupon
      ↓
Checkout
      ↓
Validate Address + Price + Inventory
      ↓
Reserve Inventory
      ↓
Create Payment
      ↓
Payment Success
      ↓
Confirm Order
      ↓
Publish Order Event
      ↓
Store Packs Order
      ↓
Order Ready
      ↓
Assign Delivery Partner
      ↓
Partner Picks Up Order
      ↓
Real-Time Tracking
      ↓
Order Delivered
      ↓
Review / Rating
```

The engineering pipeline behind it is:

```text
React
  ↓
Axios / REST
  ↓
Node.js + Express
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Business Services
  ↓
Prisma
  ↓
PostgreSQL

Additional infrastructure:
Redis → caching / carts / rate limiting
Kafka → asynchronous events
Elasticsearch → product search
Socket.IO → real-time tracking
Docker → containerization
GitHub Actions → CI/CD
Prometheus + Grafana → monitoring
```

---

## 34. Project Positioning

QuickKart should be presented as:

> **A production-style quick-commerce platform built to explore modern backend engineering using JavaScript, Node.js, Neon PostgreSQL, Redis, Kafka, Elasticsearch, real-time communication, Docker, automated testing, and observability.**

The project is not merely a Blinkit clone. Its primary purpose is to demonstrate understanding of:

- Backend architecture.
- Database design.
- API design.
- Authentication and authorization.
- Transactions and concurrency.
- Caching.
- Event-driven systems.
- Distributed-system concepts.
- Real-time communication.
- Testing.
- DevOps.
- Observability.
