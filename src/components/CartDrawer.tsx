import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice?: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onViewInvoice }) => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartTaxAmount, 
    cartTotal, 
    settings, 
    activeRole, 
    createOrder,
    generateWhatsAppOrderLink,
    t
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery (COD)' | 'WhatsApp Order'>('Cash on Delivery (COD)');
  const [resellerMargin, setResellerMargin] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const shippingFee = cartSubtotal >= settings.freeShippingAbove || cartSubtotal === 0 ? 0 : settings.defaultShippingFee;
  const effectiveTotal = cartTotal + (activeRole === 'reseller' ? Number(resellerMargin || 0) : 0);

  const handleSubmitOrder = async (isWhatsAppCheckout: boolean) => {
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage('Please fill in your name, contact phone number, and delivery address.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
        image: item.product.images[0] || '',
      }));

      const isInterState = state.toLowerCase() !== (settings.state || 'Maharashtra').toLowerCase();
      const gstRate = settings.defaultGSTRate || 18;
      const cgst = isInterState ? 0 : Math.round(cartTaxAmount / 2);
      const sgst = isInterState ? 0 : Math.round(cartTaxAmount / 2);
      const igst = isInterState ? cartTaxAmount : 0;

      const created = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'customer@ecomart.com',
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        customerType: activeRole,
        items: orderItems,
        subtotal: cartSubtotal,
        taxAmount: cartTaxAmount,
        cgst,
        sgst,
        igst,
        gstRate,
        shippingFee,
        total: effectiveTotal,
        paymentStatus: 'pending',
        paymentMethod: isWhatsAppCheckout ? 'WhatsApp Order' : paymentMethod,
        orderStatus: 'pending',
        resellerCommission: activeRole === 'reseller' ? Number(resellerMargin) : undefined,
        notes: orderNotes.trim(),
      });

      setOrderSuccess(created);

      if (isWhatsAppCheckout) {
        const waLink = generateWhatsAppOrderLink(created);
        window.open(waLink, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to place order. Please check stock availability and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setOrderSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">{t('yourGiftCart')}</h3>
              <p className="text-xs text-stone-500">
                Tier: <span className="font-semibold text-emerald-800 uppercase">{activeRole}</span> ({cart.length} {t('itemsCount')})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {orderSuccess ? (
            /* Order Placed Success View */
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">{t('orderConfirmed')}</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                {t('orderConfirmedDesc')} (<span className="font-mono font-bold text-emerald-800">{orderSuccess.orderNumber}</span>)
              </p>

              <div className="w-full bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">{t('orderIdLabel')}</span>
                  <span className="font-mono font-bold text-stone-800">{orderSuccess.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t('invoiceNoLabel')}</span>
                  <span className="font-mono text-stone-800">{orderSuccess.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t('totalAmountLabel')}</span>
                  <span className="font-bold text-stone-900">₹{orderSuccess.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t('statusLabel')}</span>
                  <span className="font-semibold text-emerald-700 uppercase">{orderSuccess.orderStatus}</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <a
                  href={generateWhatsAppOrderLink(orderSuccess)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 text-amber-300" />
                  <span>{t('sendConfirmationWhatsApp')}</span>
                </a>

                {onViewInvoice && (
                  <button
                    onClick={() => {
                      onViewInvoice(orderSuccess);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center gap-2 border border-stone-200"
                  >
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span>{t('printGSTInvoice')}</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-2 px-4 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  {t('continueShopping')}
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart View */
            <div className="py-16 flex flex-col items-center justify-center text-center text-stone-400 space-y-3">
              <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">{t('cartEmpty')}</p>
              <p className="text-xs text-stone-400 max-w-xs">
                {t('cartEmptyDesc')}
              </p>
              <button
                onClick={onClose}
                className="mt-2 py-2 px-4 bg-emerald-800 text-white text-xs font-semibold rounded-xl hover:bg-emerald-900"
              >
                {t('browseCatalogue')}
              </button>
            </div>
          ) : (
            /* Items List & Checkout Form */
            <>
              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t('orderItems')} ({cart.length})
                </h4>
                {cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 items-center justify-between"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl bg-white border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h5>
                      <p className="text-[11px] text-stone-500">
                        ₹{item.unitPrice} each <span className="text-stone-400 font-mono">({item.product.sku})</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.product.stockQuantity}
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600 disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-stone-900">
                          = ₹{(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reseller Margin Module */}
              {activeRole === 'reseller' && (
                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900">{t('resellerProfitMargin')}</span>
                    <span className="font-semibold text-purple-700">₹{resellerMargin || 0}</span>
                  </div>
                  <p className="text-[11px] text-purple-700">
                    {t('resellerProfitMarginDesc')}
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder={t('enterMarginAmount')}
                    value={resellerMargin || ''}
                    onChange={(e) => setResellerMargin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-lg text-purple-950 font-bold focus:outline-hidden"
                  />
                </div>
              )}

              {/* Delivery Details Form */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {activeRole === 'reseller' ? t('endCustomerDeliveryAddress') : t('customerDetails')}
                </h4>

                {errorMessage && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">{t('fullName')} *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">{t('phoneMobile')} *</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white text-stone-900"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-stone-600 font-medium mb-1">{t('emailForInvoice')}</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white text-stone-900"
                  />
                </div>

                <div className="text-xs">
                  <label className="block text-stone-600 font-medium mb-1">{t('deliveryAddress')} *</label>
                  <textarea
                    rows={2}
                    placeholder="House/Office No, Street, Landmark"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white text-stone-900 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">{t('city')}</label>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">{t('state')}</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">{t('pincode')}</label>
                    <input
                      type="text"
                      placeholder="400001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-stone-600 font-medium mb-1">{t('paymentOptionNoGateway')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'Cash on Delivery (COD)'
                          ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold shadow-2xs'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-xs">{t('cashOnDelivery')}</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-normal">{t('payOnArrival')}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('WhatsApp Order')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'WhatsApp Order'
                          ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold shadow-2xs'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        <span className="text-xs">{t('directWhatsApp')}</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-normal">{t('instantOrderConfirmation')}</p>
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-medium mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{t('paymentGatewayClosedNotice')}</span>
                  </p>
                </div>

                <div className="text-xs">
                  <label className="block text-stone-600 font-medium mb-1">{t('giftingMessageNotes')}</label>
                  <input
                    type="text"
                    placeholder={t('giftingMessagePlaceholder')}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 text-xs"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>{t('cartSubtotal')}</span>
                  <span className="font-semibold text-stone-800">₹{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST ({settings.defaultGSTRate}%):</span>
                  <span className="font-semibold text-stone-800">₹{cartTaxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t('deliveryCharges')}</span>
                  <span className="font-semibold text-stone-800">
                    {shippingFee === 0 ? <span className="text-emerald-700 font-bold">{t('free')}</span> : `₹${shippingFee}`}
                  </span>
                </div>
                {activeRole === 'reseller' && resellerMargin > 0 && (
                  <div className="flex justify-between text-purple-800">
                    <span>{t('resellerProfitMargin')}</span>
                    <span className="font-bold">+ ₹{resellerMargin.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-extrabold text-stone-900">
                  <span>{t('grandTotal')}</span>
                  <span className="text-emerald-800">₹{effectiveTotal.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Actions */}
        {!orderSuccess && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-2 shadow-lg">
            <button
              disabled={isSubmitting}
              onClick={() => handleSubmitOrder(true)}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{isSubmitting ? t('processingOrder') : `${t('orderViaWhatsApp')} (₹${effectiveTotal.toLocaleString()})`}</span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={() => handleSubmitOrder(false)}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-stone-200"
            >
              <Truck className="w-4 h-4 text-emerald-800" />
              <span>{t('confirmCOD')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
