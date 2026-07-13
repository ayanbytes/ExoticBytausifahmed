import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Storefront Layout (not lazy — needed immediately)
import { StorefrontLayout } from './storefront/StorefrontLayout';
import { PageTransition } from './components/motion/PageTransition';

// Lazy-loaded storefront pages
const HomePage = lazy(() => import('./storefront/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./storefront/pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import('./storefront/pages/ProductPage').then((m) => ({ default: m.ProductPage })));
const LookbookPage = lazy(() => import('./storefront/pages/LookbookPage').then((m) => ({ default: m.LookbookPage })));
const CheckoutPage = lazy(() => import('./storefront/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const AboutPage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.ContactPage })));
const ShippingPage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.ShippingPage })));
const PrivacyPage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.TermsPage })));
const SizeGuidePage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.SizeGuidePage })));
const NotFoundPage = lazy(() => import('./storefront/pages/StaticPages').then((m) => ({ default: m.NotFoundPage })));

// Admin pages
const AdminLayout = lazy(() => import('./admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminOrdersPage = lazy(() => import('./admin/pages/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminLookbookPage = lazy(() => import('./admin/pages/AdminLookbookPage').then((m) => ({ default: m.AdminLookbookPage })));
const AdminContentPage = lazy(() => import('./admin/pages/AdminContentPage').then((m) => ({ default: m.AdminContentPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function StorefrontPage({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* ─── Admin routes ─── */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminProductsPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="lookbook" element={<AdminLookbookPage />} />
                <Route path="content" element={<AdminContentPage />} />
              </Route>

              {/* ─── Storefront routes ─── */}
              <Route element={<StorefrontLayout />}>
                <Route index element={<StorefrontPage><HomePage /></StorefrontPage>} />
                <Route path="/shop" element={<StorefrontPage><ShopPage /></StorefrontPage>} />
                <Route path="/product/:slug" element={<StorefrontPage><ProductPage /></StorefrontPage>} />
                <Route path="/lookbook" element={<StorefrontPage><LookbookPage /></StorefrontPage>} />
                <Route path="/checkout" element={<StorefrontPage><CheckoutPage /></StorefrontPage>} />
                <Route path="/about" element={<StorefrontPage><AboutPage /></StorefrontPage>} />
                <Route path="/contact" element={<StorefrontPage><ContactPage /></StorefrontPage>} />
                <Route path="/shipping" element={<StorefrontPage><ShippingPage /></StorefrontPage>} />
                <Route path="/privacy" element={<StorefrontPage><PrivacyPage /></StorefrontPage>} />
                <Route path="/terms" element={<StorefrontPage><TermsPage /></StorefrontPage>} />
                <Route path="/size-guide" element={<StorefrontPage><SizeGuidePage /></StorefrontPage>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
