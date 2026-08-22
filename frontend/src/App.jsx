// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import SplashScreen from '@components/common/SplashScreen';

// Layout
import Navbar from '@components/navbar/Navbar';
import BottomNav from '@components/navbar/BottomNav';
import LocationPicker from '@components/common/LocationPicker';
import ProtectedRoute from '@routes/ProtectedRoute';

// Pages
import Home          from '@pages/Home';
import Search        from '@pages/Search';
import CategoryListPage from '@pages/CategoryListPage';
import CategoryPage  from '@pages/CategoryPage';
import ProductDetails from '@pages/ProductDetails';
import Cart          from '@pages/Cart';
import Checkout      from '@pages/Checkout';
import OrderConfirmation from '@pages/OrderConfirmation';
import OrderTracking from '@pages/OrderTracking';
import Orders        from '@pages/Orders';
import Wishlist      from '@pages/Wishlist';
import Login         from '@pages/Login';
import Register      from '@pages/Register';
import Account       from '@pages/Account';
import EditProfilePage from '@pages/EditProfilePage';
import AddressesPage from '@pages/AddressesPage';
import Notifications from '@pages/Notifications';
import ReviewPage    from '@pages/ReviewPage';
import NotFound      from '@pages/NotFound';

// Admin
import AdminLayout      from '@/admin/AdminLayout';
import AdminDashboard   from '@/admin/AdminDashboard';
import AdminProducts    from '@/admin/AdminProducts';
import AdminOrders      from '@/admin/AdminOrders';
import AdminStores      from '@/admin/AdminStores';
import AdminCategories  from '@/admin/AdminCategories';
import AdminPlaceholder from '@/admin/AdminPlaceholder';

// Store Manager
import StoreLayout    from '@/storeManager/StoreLayout';
import StoreDashboard from '@/storeManager/StoreDashboard';
import StoreProducts  from '@/storeManager/StoreProducts';

// Delivery
import DeliveryDashboard from '@/delivery/DeliveryDashboard';

// Layout wrapper for customer pages (with navbar + bottom nav)
function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark-50">
        {children}
      </main>
      <BottomNav />
      <LocationPicker />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Customer Routes ─────────────────────────── */}
      <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
      <Route path="/search" element={<CustomerLayout><Search /></CustomerLayout>} />
      <Route path="/category" element={<CustomerLayout><CategoryListPage /></CustomerLayout>} />
      <Route path="/category/:slug" element={<CustomerLayout><CategoryPage /></CustomerLayout>} />
      <Route path="/product/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
      <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
      <Route path="/wishlist" element={<CustomerLayout><Wishlist /></CustomerLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<CustomerLayout><Account /></CustomerLayout>} />
      <Route path="/account/edit" element={<CustomerLayout><ProtectedRoute><EditProfilePage /></ProtectedRoute></CustomerLayout>} />
      <Route path="/account/addresses" element={<CustomerLayout><ProtectedRoute><AddressesPage /></ProtectedRoute></CustomerLayout>} />
      <Route path="/notifications" element={<CustomerLayout><Notifications /></CustomerLayout>} />
      <Route path="/review/:orderId" element={<CustomerLayout><ReviewPage /></CustomerLayout>} />

      {/* Protected customer routes */}
      <Route path="/checkout" element={
        <CustomerLayout><ProtectedRoute><Checkout /></ProtectedRoute></CustomerLayout>
      } />
      <Route path="/order-confirmed/:id" element={
        <CustomerLayout><ProtectedRoute><OrderConfirmation /></ProtectedRoute></CustomerLayout>
      } />
      <Route path="/track/:id" element={
        <CustomerLayout><ProtectedRoute><OrderTracking /></ProtectedRoute></CustomerLayout>
      } />
      <Route path="/orders" element={
        <CustomerLayout><ProtectedRoute><Orders /></ProtectedRoute></CustomerLayout>
      } />
      <Route path="/orders/:id" element={
        <CustomerLayout><ProtectedRoute><Orders /></ProtectedRoute></CustomerLayout>
      } />

      {/* ── Admin Routes ─────────────────────────────── */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users"      element={<AdminPlaceholder title="Users"         icon="👥" />} />
        <Route path="inventory"  element={<AdminPlaceholder title="Inventory"     icon="📦" />} />
        <Route path="coupons"    element={<AdminPlaceholder title="Coupons"       icon="🏷️" />} />
        <Route path="stores"     element={<AdminStores />} />
        <Route path="delivery"   element={<AdminPlaceholder title="Delivery Partners" icon="🛵" />} />
        <Route path="analytics"  element={<AdminPlaceholder title="Analytics"     icon="📊" />} />
        <Route path="settings"   element={<AdminPlaceholder title="Settings"      icon="⚙️" />} />
      </Route>

      {/* ── Store Manager Routes ────────────────────── */}
      <Route path="/store" element={<ProtectedRoute requiredRole="store_manager"><StoreLayout /></ProtectedRoute>}>
        <Route index element={<StoreDashboard />} />
        <Route path="orders"    element={<AdminPlaceholder title="Store Orders"    icon="📋" />} />
        <Route path="products"  element={<StoreProducts />} />
        <Route path="inventory" element={<AdminPlaceholder title="Store Inventory" icon="📦" />} />
      </Route>

      {/* ── Delivery Partner Routes ──────────────────── */}
      <Route path="/delivery" element={<ProtectedRoute requiredRole="delivery_partner"><DeliveryDashboard /></ProtectedRoute>} />

      {/* ── 404 ──────────────────────────────────────── */}
      <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      {/* Splash screen — renders on top of everything, unmounts itself after animation */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1A1A1A',
            color: '#fff',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  );
}
