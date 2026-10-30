import React, { useState, useMemo } from 'react';
import { 
  StoreProvider, 
  useStore 
} from './context/StoreContext';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AuthModal } from './components/auth/AuthModal';
import { RetailerDashboard } from './components/retailer/RetailerDashboard';
import { ResellerDashboard } from './components/reseller/ResellerDashboard';
import { GSTInvoiceModal } from './components/admin/GSTInvoiceModal';
import { Product, Order } from './types';
import { 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Users, 
  Award,
  Store,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

function MainStore() {
  const { 
    products, 
    isLoadingProducts, 
    isAdmin, 
    isRetailer,
    isReseller,
    currentUser,
    userProfile,
    settings, 
    generateWhatsAppChatLink,
    language,
    t
  } = useStore();

  const [isAdminView, setIsAdminView] = useState(false);
  const [isRetailerView, setIsRetailerView] = useState(false);
  const [isResellerView, setIsResellerView] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; defaultRole: 'retailer' | 'reseller' }>({
    isOpen: false,
    defaultRole: 'retailer',
  });
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  }, [products]);

  const visibleProducts = useMemo(() => {
    return products.filter(p => {
      const isVisible = p.isVisible !== false;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return isVisible && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminView(true);
      setIsRetailerView(false);
      setIsResellerView(false);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleOpenAuth = (role: 'retailer' | 'reseller') => {
    setAuthModalState({ isOpen: true, defaultRole: role });
  };

  const handleOpenRetailerDashboard = () => {
    if (isRetailer) {
      setIsRetailerView(true);
      setIsAdminView(false);
      setIsResellerView(false);
    } else {
      handleOpenAuth('retailer');
    }
  };

  const handleOpenResellerDashboard = () => {
    if (isReseller) {
      setIsResellerView(true);
      setIsAdminView(false);
      setIsRetailerView(false);
    } else {
      handleOpenAuth('reseller');
    }
  };

  // Switch to views if requested
  if (isAdminView) {
    return (
      <AdminLayout onBackToStore={() => setIsAdminView(false)} />
    );
  }

  if (isRetailerView) {
    return (
      <RetailerDashboard
        onBackToStore={() => setIsRetailerView(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onQuickView={(p) => setQuickViewProduct(p)}
      />
    );
  }

  if (isResellerView) {
    return (
      <ResellerDashboard
        onBackToStore={() => setIsResellerView(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onQuickView={(p) => setQuickViewProduct(p)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenAuth={handleOpenAuth}
        onOpenRetailerDashboard={handleOpenRetailerDashboard}
        onOpenResellerDashboard={handleOpenResellerDashboard}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/60 shadow-inner">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur-xs text-emerald-200 border border-emerald-700/80 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {t('heroTitle')}
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl leading-relaxed">
                {t('heroDesc')}
              </p>

              {/* Tier Navigation Cards */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleOpenAuth('retailer')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Store className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('retailerLoginRegister')}</span>
                </button>

                <button
                  onClick={() => handleOpenAuth('reseller')}
                  className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 border border-purple-700 text-purple-100 font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 text-purple-300" />
                  <span>{t('resellerLoginRegister')}</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/90 text-emerald-300">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{t('freeShippingBanner')} ₹{settings.freeShippingAbove}</span>
                </div>
              </div>
            </div>

            {/* Right Feature Card / Announcement */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {t('quickWhatsAppOrders')}
                </span>
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  {t('zeroGatewayFees')}
                </span>
              </div>

              <h3 className="font-bold text-lg text-white">
                {t('customBrandingTitle')}
              </h3>

              <p className="text-xs text-emerald-100/80 leading-relaxed">
                {t('customBrandingDesc')}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={generateWhatsAppChatLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-950 text-emerald-950" />
                  <span>{t('chatOnWhatsApp')}</span>
                </a>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-white/20 transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  <span>{t('viewGiftCart')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Store Catalogue Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                  {selectedCategory === 'All' ? t('allGifts') : selectedCategory}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {visibleProducts.length} {t('itemsCount')}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('publicVisitorPricing')}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {isLoadingProducts ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-stone-500">{t('loadingCatalogue')}</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 space-y-3">
              <Gift className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">{t('noGiftsFound')}</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {searchTerm ? `${t('noGiftsFoundDesc')} ("${searchTerm}")` : t('noGiftsFoundDesc')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="py-2 px-4 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900"
              >
                {t('resetSearch')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Trust & Guarantee Strip */}
      <section className="bg-white border-t border-stone-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-900">{t('panIndiaDelivery')}</h4>
            <p className="text-[11px] text-stone-500">{t('panIndiaDeliveryDesc')}</p>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-900">{t('gstInvoice')}</h4>
            <p className="text-[11px] text-stone-500">{t('gstInvoiceDesc')}</p>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-900">{t('premiumQuality')}</h4>
            <p className="text-[11px] text-stone-500">{t('premiumQualityDesc')}</p>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-stone-900">{t('whatsAppSupportDesk')}</h4>
            <p className="text-[11px] text-stone-500">{t('whatsAppSupportDeskDesc')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-black text-white text-base tracking-tight">ECOMART</span>
              <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-2 py-0.2 rounded">
                GIFTS PLACE
              </span>
            </div>
            <p className="text-[11px] text-stone-400">{settings.tradeName}</p>
            <p className="text-[11px] text-stone-500">
              GSTIN: <span className="font-mono text-stone-300">{settings.gstin}</span> • PAN: <span className="font-mono text-stone-300">{settings.pan}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button 
              onClick={() => handleOpenAuth('retailer')} 
              className="hover:text-emerald-400 transition-colors"
            >
              {t('retailerPortal')}
            </button>
            <span>•</span>
            <button 
              onClick={() => handleOpenAuth('reseller')} 
              className="hover:text-purple-400 transition-colors"
            >
              {t('resellerPortal')}
            </button>
            <span>•</span>
            <a href={generateWhatsAppChatLink()} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              {t('whatsAppSupport')}
            </a>
            <span>•</span>
            <button onClick={() => setIsCartOpen(true)} className="hover:text-emerald-400 transition-colors">
              {t('shoppingCart')}
            </button>
            <span>•</span>
            <button 
              onClick={handleOpenAdmin} 
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('adminControlPanel')}</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-500 text-center md:text-right">
            © {new Date().getFullYear()} {settings.businessName}. {t('rightsReserved')}
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onViewInvoice={(ord) => setViewInvoiceOrder(ord)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminView(true);
        }}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        defaultRole={authModalState.defaultRole}
        onClose={() => setAuthModalState({ isOpen: false, defaultRole: 'retailer' })}
      />

      {viewInvoiceOrder && (
        <GSTInvoiceModal
          order={viewInvoiceOrder}
          onClose={() => setViewInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainStore />
    </StoreProvider>
  );
}
