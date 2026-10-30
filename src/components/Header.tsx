import React from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  ShieldCheck, 
  Search, 
  Store, 
  Sparkles, 
  Users, 
  Globe 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (role: 'retailer' | 'reseller') => void;
  onOpenRetailerDashboard: () => void;
  onOpenResellerDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onOpenCart,
  onOpenAdmin,
  onOpenAuth,
  onOpenRetailerDashboard,
  onOpenResellerDashboard,
}) => {
  const { 
    cartCount, 
    cartSubtotal, 
    isAdmin, 
    isRetailer,
    isReseller,
    currentUser,
    userProfile,
    generateWhatsAppChatLink,
    language,
    setLanguage,
    t
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner: Language Selector & Portals */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" /> {t('curatedGifting')}
            </span>
            <span className="truncate">{t('topAnnouncement')}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Language Switcher: Hindi / English */}
            <div className="inline-flex items-center rounded-lg bg-emerald-950/80 p-0.5 border border-emerald-700/80 text-[11px]">
              <span className="px-1.5 text-emerald-400 flex items-center">
                <Globe className="w-3 h-3" />
              </span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  language === 'en' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  language === 'hi' ? 'bg-emerald-500 text-emerald-950 shadow-2xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Quick role-based login links */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('retailer')}
                  className="text-emerald-200 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                >
                  <Store className="w-3 h-3 text-emerald-400" />
                  <span>{t('retailerPortal')}</span>
                </button>
                <span className="text-emerald-700">|</span>
                <button
                  onClick={() => onOpenAuth('reseller')}
                  className="text-purple-200 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                >
                  <Users className="w-3 h-3 text-purple-300" />
                  <span>{t('resellerPortal')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-emerald-300">{t('signedInAs')}</span>
                <span className="font-bold text-white uppercase">{userProfile?.role || 'User'}</span>
                {isRetailer && (
                  <button
                    onClick={onOpenRetailerDashboard}
                    className="ml-1 bg-emerald-800 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    {t('openDashboard')}
                  </button>
                )}
                {isReseller && (
                  <button
                    onClick={onOpenResellerDashboard}
                    className="ml-1 bg-purple-700 hover:bg-purple-600 text-white px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    {t('openDashboard')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-800/20 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors">
                ECOMART
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                GIFTS PLACE
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">{t('brandTagline')}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 transition-all text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* WhatsApp Direct Inquiries */}
          <a
            href={generateWhatsAppChatLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>{t('whatsAppEnquiry')}</span>
          </a>

          {/* Retailer / Reseller Quick Hub buttons */}
          {isRetailer ? (
            <button
              onClick={onOpenRetailerDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t('retailerDesk')}</span>
            </button>
          ) : isReseller ? (
            <button
              onClick={onOpenResellerDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-purple-800" />
              <span>{t('resellerDesk')}</span>
            </button>
          ) : null}

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isAdmin 
                ? 'bg-emerald-900 text-white border-emerald-800 hover:bg-emerald-950 shadow-xs' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-300'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-amber-400' : 'text-stone-500'}`} />
            <span className="hidden sm:inline">{t('adminPanel')}</span>
            <span className="sm:hidden">Admin</span>
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-all shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-semibold text-xs hidden sm:inline">{t('cart')}</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-emerald-950 font-bold text-[11px] px-1.5 py-0.2 rounded-full min-w-5 text-center">
                {cartCount}
              </span>
            )}
            {cartSubtotal > 0 && (
              <span className="text-xs font-medium text-emerald-200 hidden md:inline border-l border-emerald-700 pl-2">
                ₹{cartSubtotal.toLocaleString()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      {categories.length > 0 && (
        <div className="border-t border-stone-100 bg-stone-50/70 overflow-x-auto scrollbar-none py-2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200/80 border border-stone-200'
              }`}
            >
              {language === 'hi' ? 'सभी उपहार' : 'All Gifts'} ({categories.length ? 'Catalogue' : ''})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
