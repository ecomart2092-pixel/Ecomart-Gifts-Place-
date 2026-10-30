import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab, onSelectOrder }) => {
  const { 
    products, 
    orders, 
    inventoryLogs, 
    adjustStock, 
    updateOrderStatus 
  } = useStore();

  // Metrics
  const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0);
  const outOfStockProducts = products.filter(p => p.stockQuantity <= 0);
  
  const totalResellerCommissions = orders.reduce((sum, o) => sum + (o.resellerCommission || 0), 0);

  // Status breakdown
  const statusCounts: Record<OrderStatus, number> = {
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/50">
            Store Performance & Real-Time Stats
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            ECOMART Admin Command Center
          </h2>
          <p className="text-emerald-200 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Live overview of sales, order processing pipelines, inventory movements, retailer & reseller partner accounts, and GST compliance.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              From {validOrders.length} confirmed orders
            </p>
          </div>
        </div>

        {/* Total Orders & AOV */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Average Order: ₹{avgOrderValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Product Catalogue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              {products.length}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {products.filter(p => p.isVisible).length} active on store
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Stock Warnings</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              lowStockProducts.length + outOfStockProducts.length > 0 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-emerald-50 text-emerald-800'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-stone-900">
              {lowStockProducts.length + outOfStockProducts.length}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {outOfStockProducts.length} out of stock, {lowStockProducts.length} low
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Replenishment Action Banner */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <h4 className="font-bold text-amber-900 text-sm">
                Attention: Products Requiring Immediate Restock
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>Manage Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {[...outOfStockProducts, ...lowStockProducts].slice(0, 3).map((prod) => (
              <div 
                key={prod.id} 
                className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{prod.name}</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    SKU: {prod.sku} • Stock: <span className={prod.stockQuantity <= 0 ? 'text-red-600 font-bold' : 'text-amber-700 font-bold'}>{prod.stockQuantity}</span>
                  </p>
                </div>
                <button
                  onClick={() => adjustStock(prod.id, 10, 'restock', 'Quick 10x restock from dashboard')}
                  className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-2xs"
                  title="Add 10 units to inventory"
                >
                  <Plus className="w-3 h-3" /> +10
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Lifecycle Pipeline Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Order Pipeline Status Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="block text-amber-800 font-bold text-lg">{statusCounts.pending}</span>
            <span className="text-amber-700 font-medium text-[11px]">Pending</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="block text-blue-800 font-bold text-lg">{statusCounts.confirmed}</span>
            <span className="text-blue-700 font-medium text-[11px]">Confirmed</span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <span className="block text-indigo-800 font-bold text-lg">{statusCounts.processing}</span>
            <span className="text-indigo-700 font-medium text-[11px]">Processing</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span className="block text-purple-800 font-bold text-lg">{statusCounts.shipped}</span>
            <span className="text-purple-700 font-medium text-[11px]">Shipped</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="block text-emerald-800 font-bold text-lg">{statusCounts.delivered}</span>
            <span className="text-emerald-700 font-medium text-[11px]">Delivered</span>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
            <span className="block text-stone-700 font-bold text-lg">{statusCounts.cancelled}</span>
            <span className="text-stone-500 font-medium text-[11px]">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Recent Orders</h3>
            <p className="text-xs text-stone-500">Latest customer and B2B purchases</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            No orders placed yet. Place an order from the store or checkout via WhatsApp to test!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5 pl-5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Tier</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-stone-900">
                      {ord.orderNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-stone-900">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-400">{ord.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        ord.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
