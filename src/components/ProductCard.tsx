import React from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  AlertTriangle, 
  Eye, 
  Users,
  Store,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { activeRole, isRetailer, isReseller, addToCart, settings, t } = useStore();

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity <= 0;

  // Active pricing based on role (Strictly isolated!)
  let currentPrice = product.retailPrice;
  let savingsBadge = '';

  if (isReseller) {
    currentPrice = product.resellerPrice || product.retailPrice;
    const margin = product.retailPrice - currentPrice;
    savingsBadge = `₹${margin} Reseller Profit`;
  } else if (isRetailer) {
    currentPrice = product.retailerPrice || product.retailPrice;
    const saved = product.retailPrice - currentPrice;
    if (saved > 0) savingsBadge = `Saved ₹${saved} (Retailer)`;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = `Hello ECOMART GIFTS PLACE! I am interested in: *${product.name}* (SKU: ${product.sku}). ` +
      `Price: ₹${currentPrice}. Stock Available: ${product.stockQuantity}. Please share availability and delivery options.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Box */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.tags && product.tags[0] && (
            <span className="bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {product.tags[0]}
            </span>
          )}
          {isReseller && (
            <span className="bg-purple-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Users className="w-3 h-3" /> {t('resellerTier')}
            </span>
          )}
          {isRetailer && (
            <span className="bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Store className="w-3 h-3" /> {t('retailerTier')}
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-stone-800 p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">
              {t('outOfStock')}
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {t('onlyLeft')} {product.stockQuantity} {t('unitsLeft')}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {product.category}
            </span>
            <span className="font-mono text-stone-400">SKU: {product.sku}</span>
          </div>

          <h3 className="font-bold text-stone-900 text-sm line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>

          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-stone-900">
                ₹{currentPrice.toLocaleString()}
              </span>
              {product.mrp > currentPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.mrp.toLocaleString()}
                </span>
              )}
            </div>

            {savingsBadge && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {savingsBadge}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('addToCart')}</span>
            </button>

            <button
              onClick={handleWhatsAppInquiry}
              className="py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              title="Enquire on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
