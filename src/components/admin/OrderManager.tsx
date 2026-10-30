import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  FileText, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';

interface OrderManagerProps {
  onViewInvoice: (order: Order) => void;
  selectedOrderFromDashboard?: Order | null;
  onClearSelectedOrder?: () => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({ 
  onViewInvoice, 
  selectedOrderFromDashboard,
  onClearSelectedOrder 
}) => {
  const { orders, updateOrderStatus, updatePaymentStatus, settings } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'retailer' | 'reseller' | 'public'>('all');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(selectedOrderFromDashboard || null);

  // Tracking info form in inspection modal
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  // Sync if dashboard passed order
  React.useEffect(() => {
    if (selectedOrderFromDashboard) {
      setInspectOrder(selectedOrderFromDashboard);
      setCourierName(selectedOrderFromDashboard.courierName || '');
      setTrackingNumber(selectedOrderFromDashboard.trackingNumber || '');
    }
  }, [selectedOrderFromDashboard]);

  const handleOpenInspect = (order: Order) => {
    setInspectOrder(order);
    setCourierName(order.courierName || '');
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleCloseInspect = () => {
    setInspectOrder(null);
    if (onClearSelectedOrder) onClearSelectedOrder();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, { courierName, trackingNumber });
      if (inspectOrder && inspectOrder.id === orderId) {
        setInspectOrder(prev => prev ? ({ ...prev, orderStatus: newStatus }) : null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      if (inspectOrder && inspectOrder.id === orderId) {
        setInspectOrder(prev => prev ? ({ ...prev, paymentStatus: newStatus }) : null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update payment status');
    }
  };

  const handleSaveTracking = async () => {
    if (!inspectOrder) return;
    setIsUpdatingTracking(true);
    try {
      await updateOrderStatus(inspectOrder.id, inspectOrder.orderStatus, { courierName, trackingNumber });
      setInspectOrder(prev => prev ? ({ ...prev, courierName, trackingNumber }) : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleSendWhatsAppUpdate = (order: Order) => {
    const phone = order.customerPhone.replace(/[^0-9]/g, '');
    let msg = `Hello ${order.customerName}! Updates on your ECOMART GIFTS order *${order.orderNumber}*:\n` +
      `Current Status: *${order.orderStatus.toUpperCase()}*\n`;

    if (order.trackingNumber) {
      msg += `📦 Courier: ${order.courierName || 'Standard Express'}\n` +
        `🔎 Tracking AWB: ${order.trackingNumber}\n`;
    }

    msg += `Total Amount: ₹${order.total} (${order.paymentStatus.toUpperCase()})\n` +
      `Thank you for choosing ECOMART GIFTS PLACE!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchesTier = tierFilter === 'all' || o.customerType === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Order Management & Fulfillment</h2>
          <p className="text-xs text-stone-500">
            Track customer orders, manage processing lifecycle, send WhatsApp tracking, and issue GST tax invoices.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, customer name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e: any) => setTierFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="all">All Customer Tiers</option>
            <option value="public">Public Visitor</option>
            <option value="retailer">Retailer</option>
            <option value="reseller">Reseller</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-xs text-stone-400">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5 pl-5">Order ID & Date</th>
                  <th className="p-3.5">Customer & Contact</th>
                  <th className="p-3.5">Tier</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Fulfillment</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-mono font-bold text-stone-900">{ord.orderNumber}</div>
                      <div className="text-[11px] text-stone-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-500">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.customerType === 'retailer' ? 'bg-emerald-100 text-emerald-800' :
                        ord.customerType === 'reseller' ? 'bg-purple-100 text-purple-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {ord.customerType}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-600">
                      {ord.items.length} items
                    </td>
                    <td className="p-3.5 font-bold text-stone-900">
                      ₹{ord.total.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        ord.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        ord.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenInspect(ord)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onViewInvoice(ord)}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                          title="Generate GST Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSendWhatsAppUpdate(ord)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                          title="WhatsApp Notify"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Status Inspector Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 flex flex-col gap-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseInspect}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Order Inspection
                </span>
                <h3 className="text-xl font-bold font-mono text-stone-900">
                  {inspectOrder.orderNumber}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Placed on:</span>
                <span className="text-xs font-semibold text-stone-700">
                  {new Date(inspectOrder.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Status Control Row */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Fulfillment Status:</label>
                <select
                  value={inspectOrder.orderStatus}
                  onChange={(e: any) => handleStatusChange(inspectOrder.id, e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Restocks Items!)</option>
                </select>
                {inspectOrder.orderStatus === 'cancelled' && (
                  <p className="text-[10px] text-red-600 mt-1 font-medium">
                    ⚠️ Order is cancelled: items have been automatically restored to inventory.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Payment Status:</label>
                <select
                  value={inspectOrder.paymentStatus}
                  onChange={(e: any) => handlePaymentStatusChange(inspectOrder.id, e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (Verified)</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="failed">Failed / Refunded</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block mb-1">
                  Customer Profile
                </span>
                <p className="font-bold text-stone-900">{inspectOrder.customerName}</p>
                <p className="text-stone-600">Phone: {inspectOrder.customerPhone}</p>
                <p className="text-stone-600">Email: {inspectOrder.customerEmail}</p>
                <p className="text-stone-500 font-medium">
                  Tier: <span className="font-bold text-emerald-800 uppercase">{inspectOrder.customerType}</span>
                </p>
                {inspectOrder.resellerCommission && (
                  <p className="text-purple-800 font-bold">
                    Reseller Margin: ₹{inspectOrder.resellerCommission}
                  </p>
                )}
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block mb-1">
                  Delivery Destination
                </span>
                <p className="text-stone-800 leading-relaxed">{inspectOrder.customerAddress}</p>
                <p className="text-stone-600">
                  {inspectOrder.city || ''}, {inspectOrder.state || ''} - {inspectOrder.pincode || ''}
                </p>
                {inspectOrder.notes && (
                  <p className="text-amber-800 font-medium pt-1">
                    Note: "{inspectOrder.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Courier & Tracking Manager */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block">
                Courier & Dispatch Tracking
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 mb-0.5">Courier Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart, Delhivery, DTDC"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-0.5">Tracking AWB #</label>
                  <input
                    type="text"
                    placeholder="e.g. BD98712345"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-mono text-stone-900"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  disabled={isUpdatingTracking}
                  onClick={handleSaveTracking}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-bold text-xs"
                >
                  Save Tracking
                </button>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block">
                Ordered Products ({inspectOrder.items.length})
              </span>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {inspectOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white">
                    <div>
                      <p className="font-bold text-stone-900">{item.productName}</p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        SKU: {item.sku} • ₹{item.unitPrice} x {item.quantity} pcs
                      </p>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹{item.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>₹{inspectOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST ({inspectOrder.gstRate || 18}%):</span>
                  <span>₹{inspectOrder.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping:</span>
                  <span>₹{inspectOrder.shippingFee}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1 text-sm font-extrabold text-stone-900">
                  <span>Total Bill:</span>
                  <span className="text-emerald-800">₹{inspectOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-stone-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => onViewInvoice(inspectOrder)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-stone-200"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print GST Tax Invoice</span>
              </button>

              <button
                onClick={() => handleSendWhatsAppUpdate(inspectOrder)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>WhatsApp Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
