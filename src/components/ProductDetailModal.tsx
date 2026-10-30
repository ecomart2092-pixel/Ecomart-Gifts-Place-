import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Minus,
  Users,
  Store
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { isRetailer, isReseller, addToCart, settings } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity <= 0;

  // Active pricing based on role
  let currentPrice = product.retailPrice;
  let savingsTag = '';
  if (isReseller) {
    currentPrice = product.resellerPrice || product.retailPrice;
    savingsTag = `₹${product.retailPrice - currentPrice} Reseller Margin`;
  } else if (isRetailer) {
    currentPrice = product.retailerPrice || product.retailPrice;
    savingsTag = `₹${product.retailPrice - currentPrice} Retailer Discount`;
  }

  const handleAdd = () => {
    if (quantity > product.stockQuantity) return;
    addToCart(product, quantity);
    onClose();
  };

  const handleWhatsAppInquiry = () => {
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = `Hello ECOMART GIFTS PLACE! I want to order/enquire about:\n` +
      `Product: *${product.name}*\n` +
      `SKU: ${product.sku}\n` +
      `Desired Quantity: ${quantity} units\n` +
      `Unit Rate: ₹${currentPrice} (Total: ₹${currentPrice * quantity})\n` +
      `Please confirm shipping time and packaging details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Images Section */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-2xl bg-stone-100 overflow-hidden border border-stone-200/80">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-emerald-700 shadow-xs' : 'border-stone-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Assurances */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-100">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Express PAN India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>GST Compliant Invoicing</span>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  SKU: {product.sku}
                </span>
              </div>

              <h2 className="text-xl font-bold text-stone-900 leading-snug">
                {product.name}
              </h2>

              {/* Price Banner */}
              <div className="mt-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-stone-900">
                    ₹{currentPrice.toLocaleString()}
                  </span>
                  {product.mrp > currentPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      MRP ₹{product.mrp.toLocaleString()}
                    </span>
                  )}
                  {savingsTag && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {savingsTag}
                    </span>
                  )}
                </div>

                {/* Role badge if logged in */}
                {isReseller && (
                  <div className="mt-2 text-xs text-purple-800 font-bold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Reseller Margin Applied (Cost: ₹{product.resellerPrice})</span>
                  </div>
                )}
                {isRetailer && (
                  <div className="mt-2 text-xs text-emerald-800 font-bold flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    <span>Approved Retailer Wholesale Discount Applied</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Product Details & Gifting Notes
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status Bar */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-stone-500">Live Inventory:</span>
                {isOutOfStock ? (
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Only {product.stockQuantity} left
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stockQuantity} units available)
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">Select Quantity:</span>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 hover:bg-stone-200 text-stone-700 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stockQuantity}
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                    className="p-2 hover:bg-stone-200 text-stone-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex items-center justify-between text-xs font-medium text-stone-600 bg-stone-50 p-2 rounded-lg">
                <span>Total Amount ({quantity} items):</span>
                <span className="font-bold text-stone-900 text-sm">
                  ₹{(currentPrice * quantity).toLocaleString()}
                </span>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-md'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleWhatsAppInquiry}
                  className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>WhatsApp Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
