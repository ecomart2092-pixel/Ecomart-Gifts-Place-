import React, { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Search, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  LogOut, 
  Package, 
  FileText, 
  Save,
  MessageCircle,
  Truck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import { GSTInvoiceModal } from '../admin/GSTInvoiceModal';
import { Order, Product } from '../../types';

interface RetailerDashboardProps {
  onBackToStore: () => void;
  onOpenCart: () => void;
  onQuickView: (product: Product) => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({ 
  onBackToStore, 
  onOpenCart, 
  onQuickView 
}) => {
  const { 
    currentUser, 
    userProfile, 
    products, 
    orders, 
    logout, 
    updateCurrentProfile,
    generateWhatsAppChatLink
  } = useStore();

  const [activeTab, setActiveTab] = useState<'catalogue' | 'orders' | 'profile'>('catalogue');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editBusiness, setEditBusiness] = useState(userProfile?.businessName || '');
  const [editAddress, setEditAddress] = useState(userProfile?.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const isApproved = userProfile?.status === 'approved';

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const retailerProducts = products.filter(p => {
    const isVisible = p.isVisible !== false;
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return isVisible && matchesCat && matchesSearch;
  });

  // Filter retailer orders (by retailerId or customerEmail)
  const myOrders = orders.filter(o => 
    (currentUser && o.retailerId === currentUser.uid) || 
    (currentUser && o.customerEmail.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateCurrentProfile({
        displayName: editName,
        phone: editPhone,
        businessName: editBusiness,
        address: editAddress,
      });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-2xs">
              <Store className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-stone-900">
                  RETAILER PORTAL
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {userProfile?.status || 'Pending Approval'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">{userProfile?.businessName || userProfile?.displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCart}
              className="py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">My Cart</span>
            </button>

            <button
              onClick={onBackToStore}
              className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Public Store
            </button>

            <button
              onClick={logout}
              className="p-2 text-stone-400 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 text-xs font-bold border-t border-stone-100">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'catalogue' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Retailer Catalogue</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Orders ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Retailer Profile</span>
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Pending Approval Notice */}
        {!isApproved && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Account Status: Pending Admin Verification</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Your Retailer registration is under review by our admin team. Once approved, your exclusive discounted Retailer pricing tier will activate automatically on checkout!
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Catalogue */}
        {activeTab === 'catalogue' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalogue by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1 rounded-full font-medium ${
                    selectedCategory === 'All' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All ({products.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1 rounded-full font-medium ${
                      selectedCategory === c ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {retailerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: My Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Retailer Order History</h3>
                <p className="text-xs text-stone-500">Track order statuses and download official GST invoices</p>
              </div>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400 space-y-3">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-stone-600 font-medium">No orders placed yet</p>
                <button
                  onClick={() => setActiveTab('catalogue')}
                  className="py-2 px-4 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-3.5 pl-5">Order ID & Date</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Fulfillment Status</th>
                      <th className="p-3.5 pr-5 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {myOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-mono font-bold text-stone-900">{ord.orderNumber}</div>
                          <div className="text-[11px] text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3.5 text-stone-700">
                          {ord.items.length} items ({ord.items.map(i => i.productName).join(', ').slice(0, 30)}...)
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          ₹{ord.total.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className="capitalize font-semibold text-[11px] text-stone-700">
                            {ord.paymentStatus} ({ord.paymentMethod})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ord.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            ord.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => setInvoiceOrder(ord)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                            title="View GST Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 max-w-xl mx-auto shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Retailer Profile Management</h3>
            <p className="text-xs text-stone-500">Update your contact information and registered business shipping address.</p>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Registered Email (Cannot be changed)</label>
                <input
                  type="email"
                  disabled
                  value={userProfile?.email || currentUser?.email || ''}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Company / Store Name</label>
                <input
                  type="text"
                  value={editBusiness}
                  onChange={(e) => setEditBusiness(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Registered Business Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-2 shadow-2xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <GSTInvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
