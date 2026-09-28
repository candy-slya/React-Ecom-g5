import { createBrowserRouter } from 'react-router-dom';
import { StorefrontLayout } from '../components/common/StorefrontLayout';
import { HomePage } from '../features/product/pages/HomePage';
import { ProductListPage } from '../features/product/pages/ProductListPage';
import { ProductDetailPage } from '../features/product/pages/ProductDetailPage';
import { BrandListPage } from '../features/brand/pages/BrandListPage';
import { BrandDetailPage } from '../features/brand/pages/BrandDetailPage';
import { CategoryListPage } from '../features/category/pages/CategoryListPage';
import { CategoryDetailPage } from '../features/category/pages/CategoryDetailPage';


import { CartPage } from '../features/cart/pages/CartPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CheckoutPage } from '../features/checkout/pages/CheckoutPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { PaymentPage } from '../features/payment/pages/PaymentPage';
import { MockG3Page } from '../features/payment/pages/MockG3Page';
import { OrderHistoryPage } from '../features/order/pages/OrderHistoryPage';
import { OrderDetailPage } from '../features/order/pages/OrderDetailPage';
import { ReceiptPage } from '../features/order/pages/ReceiptPage';
import { RefundHistoryPage } from '../features/refund/pages/RefundHistoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'categories',
        element: <CategoryListPage />,
      },
      {
        path: 'categories/:categoryId',
        element: <CategoryDetailPage />,
      },
      {
        path: 'brands',
        element: <BrandListPage />,
      },
      {
        path: 'brands/:brandId',
        element: <BrandDetailPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'payment/:orderId',
        element: <PaymentPage />,
      },
      {
        path: 'orders',
        element: <OrderHistoryPage />,
      },
      {
        path: 'orders/:orderId',
        element: <OrderDetailPage />,
      },
      {
        path: 'orders/:orderId/receipt',
        element: <ReceiptPage />,
      },
      {
        path: 'refunds',
        element: <RefundHistoryPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/mock-g3/:transactionRef',
    element: <MockG3Page />,
  },
]);
