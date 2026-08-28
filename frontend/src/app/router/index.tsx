import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../../features/home/HomePage'
import { ExplorePage } from '../../features/explore/ExplorePage'
import { MenuPage } from '../../features/menu/MenuPage'
import { MenuItemPage } from '../../features/menu/MenuItemPage'
import { SearchPage } from '../../features/search/SearchPage'
import { CartPage } from '../../features/cart/CartPage'
import { CheckoutPage } from '../../features/checkout/CheckoutPage'
import { OrderConfirmedPage } from '../../features/checkout/OrderConfirmedPage'
import { OrderDetailsPage } from '../../features/orders/OrderDetailsPage'
import { CollectionsPage } from '../../features/collections/CollectionsPage'
import { CollectionDetailPage } from '../../features/collections/CollectionDetailPage'
import { OffersPage } from '../../features/offers/OffersPage'
import { RewardsPage } from '../../features/rewards/RewardsPage'
import { ProfilePage } from '../../features/profile/ProfilePage'
import { LoginPage } from '../../features/auth/LoginPage'
import { RegisterPage } from '../../features/auth/RegisterPage'
import { ResetPasswordPage } from '../../features/auth/ResetPasswordPage'
import { ComingSoonPage } from '../../features/ComingSoonPage'
import { RequireAdmin } from '../../features/admin/RequireAdmin'
import { AdminLoginPage } from '../../features/admin/AdminLoginPage'
import { DashboardPage } from '../../features/admin/DashboardPage'
import { OrdersPage as AdminOrdersPage } from '../../features/admin/OrdersPage'
import { MenuManagementPage } from '../../features/admin/MenuManagementPage'
import { CategoriesPage } from '../../features/admin/CategoriesPage'
import { CustomersPage } from '../../features/admin/CustomersPage'
import { DeliveryPartnersPage } from '../../features/admin/DeliveryPartnersPage'
import { AdminOffersPage } from '../../features/admin/AdminOffersPage'
import { AdminRewardsPage } from '../../features/admin/AdminRewardsPage'
import { AnalyticsPage } from '../../features/admin/AnalyticsPage'
import { SettingsPage } from '../../features/admin/SettingsPage'
import { RequireDeliveryPartner } from '../../features/delivery/RequireDeliveryPartner'
import { DeliveryLoginPage } from '../../features/delivery/DeliveryLoginPage'
import { DeliveryDashboardPage } from '../../features/delivery/DeliveryDashboardPage'
import { AvailableOrdersPage } from '../../features/delivery/AvailableOrdersPage'
import { ActiveDeliveryPage } from '../../features/delivery/ActiveDeliveryPage'
import { DeliveryHistoryPage } from '../../features/delivery/DeliveryHistoryPage'
import { EarningsPage } from '../../features/delivery/EarningsPage'
import { DeliveryProfilePage } from '../../features/delivery/DeliveryProfilePage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/menu/:slug" element={<MenuItemPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/cart" element={<CartPage />} />

      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmed/:id" element={<OrderConfirmedPage />} />
      <Route path="/orders/:id" element={<OrderDetailsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/collections/:slug" element={<CollectionDetailPage />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/rewards" element={<RewardsPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <DashboardPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RequireAdmin>
            <AdminOrdersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <RequireAdmin>
            <MenuManagementPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RequireAdmin>
            <CategoriesPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <RequireAdmin>
            <CustomersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/delivery-partners"
        element={
          <RequireAdmin>
            <DeliveryPartnersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/offers"
        element={
          <RequireAdmin>
            <AdminOffersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/rewards"
        element={
          <RequireAdmin>
            <AdminRewardsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <RequireAdmin>
            <AnalyticsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireAdmin>
            <SettingsPage />
          </RequireAdmin>
        }
      />

      <Route path="/delivery/login" element={<DeliveryLoginPage />} />
      <Route
        path="/delivery"
        element={
          <RequireDeliveryPartner>
            <DeliveryDashboardPage />
          </RequireDeliveryPartner>
        }
      />
      <Route
        path="/delivery/available"
        element={
          <RequireDeliveryPartner>
            <AvailableOrdersPage />
          </RequireDeliveryPartner>
        }
      />
      <Route
        path="/delivery/active"
        element={
          <RequireDeliveryPartner>
            <ActiveDeliveryPage />
          </RequireDeliveryPartner>
        }
      />
      <Route
        path="/delivery/history"
        element={
          <RequireDeliveryPartner>
            <DeliveryHistoryPage />
          </RequireDeliveryPartner>
        }
      />
      <Route
        path="/delivery/earnings"
        element={
          <RequireDeliveryPartner>
            <EarningsPage />
          </RequireDeliveryPartner>
        }
      />
      <Route
        path="/delivery/profile"
        element={
          <RequireDeliveryPartner>
            <DeliveryProfilePage />
          </RequireDeliveryPartner>
        }
      />

      <Route path="*" element={<ComingSoonPage title="Page not found" />} />
    </Routes>
  )
}
