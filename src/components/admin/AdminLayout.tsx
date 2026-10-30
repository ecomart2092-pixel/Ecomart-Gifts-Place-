import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  History, 
  Users, 
  Settings, 
  Store, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DashboardOverview } from './DashboardOverview';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { InventoryLogs } from './InventoryLogs';
import { UserManager } from './UserManager';
import { ResellerManager } from './ResellerManager';
import { SettingsManager } from './SettingsManager';
import { GSTInvoiceModal } from './GSTInvoiceModal';
import { Order } from '../../types';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const { currentUser, logout, devAdminBypass } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'users' | 'resellers' | 'settings'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [dashboardSelectedOrder, setDashboardSelectedOrder] = useState<Order | null>(null);

  const handleSelectOrderFromDashboard = (order: Order) => {
    setDashboardSelectedOrder(order);
    setActiveTab('orders');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Direct Upload', icon: Package },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory Audit Logs', icon: History },
    { id: 'users', label: 'User & Partner Approvals', icon: UserCheck },
    { id: 'resellers', label: 'Commissions & Payouts', icon: Users },
    { id: 'settings', label: 'Settings & GST', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col md:flex-row text-stone-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-stone-900 text-sm">ECOMART ADMIN</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-stone-600 hover:text-stone-900"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 text-stone-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand & Identity */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white">ECOMART ADMIN</h1>
                <p className="text-[10px] text-stone-400 font-medium">Control Panel v3.0</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Identity Status */}
          <div className="p-4 bg-stone-950/60 border-b border-stone-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Session</span>
              {devAdminBypass ? (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Dev Preview
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  Verified Admin
                </span>
              )}
            </div>
            <p className="text-stone-300 font-mono text-[11px] truncate mt-1">
              {currentUser?.email || (devAdminBypass ? 'ecomart2092@gmail.com' : 'Guest')}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Store className="w-4 h-4 text-amber-300" />
            <span>Switch to Storefront</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-stone-400 hover:text-red-400 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'overview' && (
            <DashboardOverview 
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onSelectOrder={handleSelectOrderFromDashboard}
            />
          )}

          {activeTab === 'products' && (
            <ProductManager />
          )}

          {activeTab === 'orders' && (
            <OrderManager 
              onViewInvoice={(ord) => setInvoiceOrder(ord)}
              selectedOrderFromDashboard={dashboardSelectedOrder}
              onClearSelectedOrder={() => setDashboardSelectedOrder(null)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryLogs />
          )}

          {activeTab === 'users' && (
            <UserManager />
          )}

          {activeTab === 'resellers' && (
            <ResellerManager />
          )}

          {activeTab === 'settings' && (
            <SettingsManager />
          )}
        </div>
      </main>

      {/* GST Invoice Modal */}
      {invoiceOrder && (
        <GSTInvoiceModal 
          order={invoiceOrder} 
          onClose={() => setInvoiceOrder(null)} 
        />
      )}
    </div>
  );
};
