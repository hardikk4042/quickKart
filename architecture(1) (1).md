# QuickKart — System Architecture

## Database Environment

QuickKart uses **Neon PostgreSQL** as its primary transactional database. Neon is a managed cloud PostgreSQL service, so a local PostgreSQL server is not required for development.

The connection flow is:

```text
QuickKart Backend
      ↓
    Prisma
      ↓
  Internet
      ↓
Neon PostgreSQL
```

The backend receives the Neon connection string through an environment variable:

```env
DATABASE_URL="<NEON_POSTGRESQL_CONNECTION_STRING>"
```

The real connection string must remain in `.env` and must never be committed to GitHub. An `.env.example` file may document the variable without containing real credentials.

Development and production data should use separate Neon environments/projects/branches as appropriate.

**Neon PostgreSQL is the source of truth for transactional data. Redis is used only for caching, rate limiting, carts, and other suitable short-lived/high-speed workloads.**

---



**Version:** 1.0  
**Project:** QuickKart — Production-Style Quick-Commerce Platform  
**Primary Stack:** JavaScript, Node.js, Express.js, Neon PostgreSQL, Prisma, Redis, Kafka, Elasticsearch, Socket.IO, Docker

---

## 1. Architecture Goal

QuickKart is designed as a production-style quick-commerce system rather than a simple CRUD e-commerce application.

The architecture prioritizes:

- Clear separation of concerns.
- Strong backend business logic.
- Transactional consistency.
- Inventory concurrency control.
- Secure authentication and authorization.
- Caching and performance.
- Event-driven asynchronous processing.
- Real-time order tracking.
- Search.
- Testing.
- Observability.
- Easy future migration from a modular monolith to microservices.

The initial implementation should use a **modular monolith**. Microservices should be introduced only after the domain boundaries are understood and there is a clear reason to split them.

---

# 2. High-Level Architecture

```text
                         QUICKKART
                             |
                             v
                    +----------------+
                    | React Frontend |
                    +-------+--------+
                            |
                       HTTPS / REST
                            |
                            v
                    +----------------+
                    | Node.js Server |
                    |   Express.js   |
                    +-------+--------+
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
      Neon PostgreSQL          Redis            Elasticsearch
       + Prisma          Cache/State          Search
          |
          |
          v
      Business Modules
          |
    +-----+------+------+------+------+------+
    |     |      |      |      |      |      |
   Auth Products Cart Inventory Orders Payment
    |     |      |      |      |      |
    +-----+------+------+------+------+------+
                            |
                            v
                          Kafka
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
        Notifications   Inventory     Delivery
          Processing     Events        Events
              |
              v
          Socket.IO
              |
              v
         Customer/Partner
```

---

# 3. Initial Architecture: Modular Monolith

The first implementation should be a modular monolith.

```text
backend/
└── src/
    ├── config/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── addresses/
    │   ├── stores/
    │   ├── products/
    │   ├── categories/
    │   ├── search/
    │   ├── inventory/
    │   ├── cart/
    │   ├── wishlist/
    │   ├── coupons/
    │   ├── orders/
    │   ├── payments/
    │   ├── delivery/
    │   ├── reviews/
    │   ├── notifications/
    │   └── analytics/
    ├── middleware/
    ├── events/
    ├── jobs/
    ├── sockets/
    ├── utils/
    ├── app.js
    └── server.js
```

Each module should own its business logic and expose a clean interface to other modules.

---

# 4. Request Processing Pipeline

Every normal API request should follow this pattern:

```text
Client
  |
  v
Express Route
  |
  v
Authentication Middleware
  |
  v
Authorization Middleware
  |
  v
Validation Middleware
  |
  v
Controller
  |
  v
Service
  |
  v
Repository / Prisma
  |
  v
Neon PostgreSQL
```

### Responsibilities

**Route**
- Maps HTTP method and URL to a controller.

**Authentication Middleware**
- Verifies JWT.
- Identifies the user.

**Authorization Middleware**
- Checks role and permissions.

**Validation Middleware**
- Validates request body, parameters, and query values.

**Controller**
- Handles HTTP-specific concerns.
- Calls the appropriate service.
- Returns the API response.

**Service**
- Contains business logic.
- Coordinates transactions and other modules.

**Repository / Prisma**
- Handles database access.

---

# 5. Frontend Architecture

```text
React
 |
 +-- Pages
 |
 +-- Reusable Components
 |
 +-- Global State
 |
 +-- API Service Layer
 |
 +-- Socket.IO Client
 |
 v
REST API / WebSocket
```

Frontend should never directly access Neon PostgreSQL, Redis, Kafka, or Elasticsearch.

The frontend communicates only with the backend.

---

# 6. Backend Module Architecture

Each major module follows:

```text
module/
├── controller.js
├── service.js
├── repository.js
├── routes.js
├── validation.js
└── constants.js
```

For example:

```text
orders/
├── order.controller.js
├── order.service.js
├── order.repository.js
├── order.routes.js
├── order.validation.js
└── order.constants.js
```

### Controller

Handles:

```text
HTTP request
HTTP response
status codes
```

### Service

Handles:

```text
Order creation
Order state transitions
Inventory coordination
Payment coordination
Business rules
```

### Repository

Handles:

```text
Database queries
CRUD
Transactions where appropriate
```

---

# 7. Authentication Architecture

```text
Client
  |
  | email + password
  v
Auth Controller
  |
  v
Auth Service
  |
  +--> Verify password
  |
  +--> Generate access token
  |
  +--> Generate refresh token
  |
  v
Client
```

For protected requests:

```text
Client
  |
  | Authorization: Bearer <JWT>
  v
Auth Middleware
  |
  +--> Verify JWT
  |
  +--> Identify user
  |
  v
Controller
```

Passwords must never be stored as plaintext.

---

# 8. Authorization Architecture

QuickKart has four primary roles:

```text
CUSTOMER
STORE_MANAGER
DELIVERY_PARTNER
ADMIN
```

Authorization pipeline:

```text
Authenticated User
       |
       v
     Role
       |
       v
Permission Check
       |
       v
Resource Ownership Check
       |
       v
Allow / Deny
```

Example:

```text
STORE_MANAGER
      |
      v
Update Inventory
      |
      v
Does product belong to manager's store?
      |
   +--+--+
   |     |
  YES    NO
   |     |
  Allow Deny
```

This combines role-based authorization with resource-level authorization.

---

# 9. Product Architecture

```text
Customer
   |
   v
Product API
   |
   +--> Neon PostgreSQL
   |
   +--> Redis Cache
   |
   +--> Elasticsearch
```

Neon PostgreSQL is the source of truth.

Redis is used for appropriate caching.

Elasticsearch provides advanced search.

---

# 10. Product Search Architecture

```text
Customer
   |
   v
Search API
   |
   v
Elasticsearch
   |
   +--> Full-text search
   +--> Fuzzy search
   +--> Autocomplete
   +--> Filters
   +--> Sorting
   |
   v
Search Results
```

Product data should be synchronized into Elasticsearch.

Neon PostgreSQL remains the authoritative source.

---

# 11. Store Selection Architecture

The customer provides a delivery address/location.

```text
Customer Location
       |
       v
Store Selection Logic
       |
       +--> Find active nearby stores
       |
       +--> Check serviceability
       |
       +--> Check inventory
       |
       v
Selected Fulfillment Store
```

The selected store is associated with the order.

---

# 12. Cart Architecture

The active cart can be stored/cached using Redis.

```text
Customer
   |
   v
Cart API
   |
   v
Redis
   |
   +--> Add item
   +--> Remove item
   +--> Update quantity
   +--> Read cart
   +--> Clear cart
```

The backend must recalculate prices using authoritative product data.

The client cannot determine the final payable amount.

---

# 13. Inventory Architecture

Inventory is associated with a store and product.

```text
Store
 |
 +-- Product A
 |     Available: 20
 |     Reserved: 2
 |
 +-- Product B
       Available: 10
       Reserved: 0
```

Inventory operations:

```text
Available Stock
      |
      v
Reserve
      |
      +--> Payment Success --> Confirm
      |
      +--> Payment Failure --> Release
```

---

# 14. Inventory Concurrency

Example:

```text
Stock = 1

User A ----             >---- Inventory Service
User B ----/
```

The backend must guarantee that only one request successfully reserves the final item.

Possible mechanisms:

- Neon PostgreSQL transactions.
- Optimistic locking.
- Pessimistic locking.
- Atomic Redis operations where suitable.

The exact mechanism should be selected based on the operation and consistency requirements.

---

# 15. Checkout Architecture

```text
Cart
 |
 v
Checkout
 |
 +--> Authenticate Customer
 |
 +--> Validate Address
 |
 +--> Select Store
 |
 +--> Validate Products
 |
 +--> Validate Current Prices
 |
 +--> Validate Inventory
 |
 +--> Validate Coupon
 |
 +--> Calculate Delivery Fee
 |
 +--> Calculate Final Total
 |
 v
Inventory Reservation
 |
 v
Order Creation
 |
 v
Payment
```

The backend must be authoritative for:

- Product price.
- Quantity.
- Discounts.
- Taxes/fees.
- Inventory.
- Final order total.

---

# 16. Order Architecture

Order creation:

```text
Checkout
   |
   v
Order Service
   |
   +--> Validate cart
   +--> Reserve inventory
   +--> Create order
   +--> Create order items
   +--> Create payment record
   |
   v
PAYMENT_PENDING
```

After successful payment:

```text
Payment Success
      |
      v
Confirm Order
      |
      v
CONFIRMED
      |
      v
Publish OrderConfirmed Event
```

---

# 17. Order State Machine

```text
CREATED
   |
   v
PAYMENT_PENDING
   |
   +-----------> PAYMENT_FAILED
   |
   v
CONFIRMED
   |
   v
PACKING
   |
   v
READY_FOR_PICKUP
   |
   v
OUT_FOR_DELIVERY
   |
   v
DELIVERED
```

Cancellation/refund transitions must be explicitly defined.

Invalid transitions must be rejected.

Example:

```text
DELIVERED
   |
   X
CANCELLED
```

A delivered order should not simply transition to cancelled.

---

# 18. Payment Architecture

```text
Customer
   |
   v
QuickKart Backend
   |
   v
Payment Service
   |
   v
Payment Gateway
   |
   v
Payment Result
   |
   v
Webhook
   |
   v
QuickKart Backend
```

The webhook should be treated as an important source of payment confirmation.

Payment events must be idempotent.

---

# 19. Idempotency Architecture

For operations such as order creation and payment processing:

```text
Request
   |
   +--> Idempotency Key
   |
   v
Idempotency Check
   |
   +--> Already processed --> Return existing result
   |
   +--> New request --> Process
```

This protects against duplicate requests caused by retries, network failures, or repeated client actions.

---

# 20. Kafka Event Architecture

Kafka is used for asynchronous workflows.

Example:

```text
Order Service
     |
     | OrderConfirmed
     v
   Kafka
     |
     +----------------+----------------+
     |                |                |
     v                v                v
Inventory        Notification       Analytics
Consumer           Consumer          Consumer
```

Potential topics:

```text
order.created
order.confirmed
order.cancelled
payment.completed
payment.failed
inventory.reserved
inventory.released
order.ready
delivery.assigned
order.delivered
```

Kafka should be introduced only where asynchronous communication provides a clear benefit.

---

# 21. Event Processing

Example: order confirmation.

```text
Order Service
     |
     v
Publish OrderConfirmed
     |
     v
Kafka Topic
     |
     +------------+-------------+
     |            |             |
     v            v             v
Inventory     Notification   Analytics
Consumer       Consumer       Consumer
```

The Order Service does not need to synchronously call every downstream component.

---

# 22. Retry and Dead Letter Queue

For recoverable event-processing failures:

```text
Kafka Event
    |
    v
Consumer
    |
    v
Processing Failure
    |
    v
Retry
    |
    v
Retry
    |
    v
Retry Exhausted
    |
    v
Dead Letter Queue
```

The system should avoid infinite retry loops.

---

# 23. Delivery Architecture

```text
Order READY_FOR_PICKUP
          |
          v
Delivery Service
          |
          +--> Find available partners
          +--> Calculate distance
          +--> Check workload
          |
          v
Select Partner
          |
          v
Assign Delivery
```

Delivery partner updates:

```text
ASSIGNED
   ↓
PICKED_UP
   ↓
OUT_FOR_DELIVERY
   ↓
ARRIVED
   ↓
DELIVERED
```

---

# 24. Real-Time Architecture

Socket.IO can be used for real-time order/delivery updates.

```text
Delivery Partner
       |
       | status/location update
       v
Socket.IO Server
       |
       v
Customer Socket
       |
       v
Live Tracking UI
```

REST remains appropriate for normal CRUD operations.

Socket.IO is used for real-time state updates.

---

# 25. Notification Architecture

Notifications should be decoupled from core order processing.

```text
Order Service
     |
     v
Kafka
     |
     v
Notification Consumer
     |
     +--> In-App Notification
     +--> Email
     +--> Future SMS/Push
```

This prevents notification processing from unnecessarily blocking order operations.

---

# 26. Redis Architecture

Redis can support several independent use cases.

```text
                    Redis
                      |
       +--------------+--------------+
       |              |              |
       v              v              v
    Caching          Cart        Rate Limiting
       |
       +--> Product cache
       +--> Frequently accessed data
```

Other potential uses:

- OTP with TTL.
- Short-lived session/state data.
- Distributed locks where appropriate.

Redis should not automatically replace Neon PostgreSQL as the source of truth.

---

# 27. Database Architecture

Neon PostgreSQL is the primary transactional database.

Core entities:

```text
users
roles
addresses
stores
products
categories
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

Prisma provides the application data-access layer.

---

# 28. Database Transaction Example

Inventory + order creation should use transactional boundaries where required.

```text
BEGIN TRANSACTION
      |
      +--> Verify inventory
      |
      +--> Reserve inventory
      |
      +--> Create order
      |
      +--> Create order items
      |
      +--> Create payment record
      |
COMMIT
```

If a critical operation fails:

```text
ROLLBACK
```

The exact transaction boundary should be designed carefully around external payment calls.

---

# 29. API Gateway / Edge Layer

During the modular-monolith phase, Express can serve as the main API entry point.

A future microservice version can introduce an API Gateway:

```text
Client
  |
  v
API Gateway
  |
  +--> Auth Service
  +--> Product Service
  +--> Cart Service
  +--> Order Service
  +--> Payment Service
  +--> Delivery Service
```

Gateway responsibilities may include:

- Routing.
- Authentication at the edge.
- Rate limiting.
- CORS.
- Request logging.

---

# 30. Future Microservices Architecture

Only after the modular monolith is stable:

```text
                         API Gateway
                              |
       +----------+-----------+-----------+----------+
       |          |           |           |          |
       v          v           v           v          v
     Auth      Product     Inventory     Order     Payment
   Service     Service      Service     Service    Service
                                          |
                                        Kafka
                                          |
                              +-----------+-----------+
                              |                       |
                              v                       v
                         Notification              Delivery
                           Service                  Service
```

Each service can eventually own its domain and, where justified, its own database.

---

# 31. Observability Architecture

```text
QuickKart Backend
       |
       +--> Structured Logs
       |
       +--> Metrics
       |
       +--> Health Checks
       |
       v
Monitoring Stack
       |
       +--> Prometheus
       |
       +--> Grafana
```

Metrics may include:

- Request count.
- Request latency.
- Error rate.
- Database connection usage.
- Cache hit/miss rate.
- Kafka consumer lag.
- Application health.

---

# 32. Logging Architecture

Use structured logging.

Example:

```json
{
  "level": "info",
  "event": "ORDER_CREATED",
  "orderId": "QK10293",
  "userId": "user_123",
  "timestamp": "..."
}
```

Logs should not contain:

- Passwords.
- Access tokens.
- Payment secrets.
- Sensitive credentials.

---

# 33. Security Architecture

Security layers:

```text
Client
  |
  v
HTTPS
  |
  v
Rate Limiting
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Input Validation
  |
  v
Business Logic
  |
  v
Database
```

Security practices:

- Password hashing.
- JWT validation.
- Role-based authorization.
- Resource ownership checks.
- Input validation.
- Rate limiting.
- Secure environment variables.
- Secret management.
- Webhook verification.
- No sensitive information in logs.

---

# 34. Testing Architecture

```text
                 QuickKart
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
    Unit Tests   Integration     E2E Tests
                    Tests
       |             |             |
       v             v             v
   Jest/Mocks   Testcontainers   API/User Flow
```

Critical flows to test:

```text
Registration
Login
Authorization
Product search
Cart
Inventory reservation
Concurrent purchase
Checkout
Payment webhook
Order state transitions
Cancellation
Delivery
```

---

# 35. CI/CD Architecture

```text
Developer
    |
    v
Git Push
    |
    v
GitHub
    |
    v
GitHub Actions
    |
    +--> Install
    +--> Lint
    +--> Unit Tests
    +--> Integration Tests
    +--> Build
    +--> Docker Build
    |
    v
Deployment
```

---

# 36. Docker Architecture

Development environment:

```text
Docker Compose
 |
 +-- frontend
 +-- backend
 +-- redis
 +-- kafka
 +-- elasticsearch
 +-- prometheus
 +-- grafana

Neon (managed externally)
 |
 +-- PostgreSQL
```

The exact service set can be introduced incrementally rather than all at once.

---

# 37. End-to-End Customer Flow

```text
1. Register/Login
        |
2. Select Location
        |
3. Identify Nearby Store
        |
4. Browse/Search Products
        |
5. View Product
        |
6. Add to Cart
        |
7. Apply Coupon
        |
8. Checkout
        |
9. Validate Inventory
        |
10. Reserve Inventory
        |
11. Create Order
        |
12. Initiate Payment
        |
13. Payment Webhook
        |
14. Confirm Order
        |
15. Publish Kafka Event
        |
16. Store Packs Order
        |
17. Order Ready
        |
18. Delivery Assignment
        |
19. Pickup
        |
20. Out for Delivery
        |
21. Real-Time Tracking
        |
22. Delivered
        |
23. Review
```

---

# 38. Failure Scenarios

## Payment Failure

```text
Checkout
  ↓
Reserve Inventory
  ↓
Payment Failed
  ↓
Release Inventory
  ↓
Order Payment Failed
```

## Duplicate Payment Webhook

```text
Webhook
  ↓
Idempotency Check
  ↓
Already Processed
  ↓
Return / Ignore Duplicate
```

## Inventory Conflict

```text
User A ─┐
        ├--> Inventory
User B ─┘

One request successfully reserves stock.
The other receives OUT_OF_STOCK.
```

## Notification Failure

```text
Order Event
   ↓
Kafka
   ↓
Notification Consumer
   ↓
Failure
   ↓
Retry
   ↓
DLQ if retries exhausted
```

---

# 39. Scalability Strategy

The system should scale progressively.

### Stage 1

Single Node.js application:

```text
Frontend
   ↓
Node.js
   ↓
Neon PostgreSQL
```

### Stage 2

Add:

```text
Redis
```

for caching and short-lived state.

### Stage 3

Add:

```text
Kafka
```

for asynchronous workflows.

### Stage 4

Add:

```text
Elasticsearch
Socket.IO
```

for search and real-time functionality.

### Stage 5

Run multiple backend instances:

```text
              Load Balancer
                  |
        +---------+---------+
        |         |         |
        v         v         v
     Node.js   Node.js   Node.js
```

### Stage 6

Extract services only where justified.

---

# 40. Architectural Principles

1. **Neon PostgreSQL is the source of truth for transactional data.**
2. **Backend owns business rules.**
3. **Frontend never determines authoritative prices or inventory.**
4. **Authentication and authorization are separate concerns.**
5. **Inventory operations must be concurrency-safe.**
6. **Payment processing must be idempotent.**
7. **Kafka is for asynchronous/event-driven workflows, not every request.**
8. **Redis is used selectively for performance and short-lived state.**
9. **Elasticsearch is a search system, not the primary transactional database.**
10. **Socket.IO is for real-time communication, not normal CRUD.**
11. **Modules should have clear ownership and boundaries.**
12. **Start with a modular monolith before introducing microservices.**
13. **Critical workflows must be tested.**
14. **Observability is part of the architecture, not an afterthought.**
15. **Secrets must never be committed to Git.**
16. **Architecture should evolve based on actual requirements rather than technology hype.**

---

# 41. Final Architecture Summary

```text
                         QUICKKART
                             |
                             v
                    +----------------+
                    | React Frontend |
                    +-------+--------+
                            |
                    REST + Socket.IO
                            |
                            v
                    +----------------+
                    | Node.js/Express|
                    +-------+--------+
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
     Auth / RBAC       Business Modules      Validation
                            |
       +--------------------+--------------------+
       |          |          |         |         |
       v          v          v         v         v
   Products     Cart     Inventory   Orders   Payments
       |          |          |         |         |
       +----------+----------+---------+---------+
                            |
                +-----------+-----------+
                |                       |
                v                       v
           Neon PostgreSQL                 Redis
            + Prisma
                |
                v
              Kafka
                |
       +--------+--------+--------+
       |                 |        |
       v                 v        v
 Notification        Delivery  Analytics
       |
       v
   Socket.IO
       |
       v
 Customer / Partner

Additional infrastructure:
Elasticsearch → Search
Docker → Containers
GitHub Actions → CI/CD
Prometheus → Metrics
Grafana → Monitoring
```

This architecture should be treated as the **technical blueprint for QuickKart**. The implementation should progress from the modular monolith toward distributed components only when each added technology solves a real problem.
