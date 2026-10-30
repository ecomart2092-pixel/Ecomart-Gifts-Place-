import React, { useState } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Package, 
  ListFilter, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  History, 
  Send, 
  User, 
  LogOut, 
  Share2, 
  MessageCircle, 
  ArrowUpRight,
  AlertCircle,
  Save,
  Store,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import { Product, BankDetails } from '../../types';

interface ResellerDashboardProps {
  onBackToStore: () => void;
  onOpenCart: () => void;
  onQuickView: (product: Product) => void;
}

export const ResellerDashboard: React.FC<ResellerDashboardProps> = ({ 
  onBackToStore, 
  onOpenCart, 
  onQuickView 
}) => {
  const { 
    currentUser, 
    userProfile, 
    products, 
    orders, 
    commissions, 
    payoutRequests, 
    requestPayout, 
    updateCurrentProfile, 
    logout,
    settings 
  } = useStore();

  const [activeSection, setActiveSection] = useState<
    | 'overview' 
    | 'products' 
    | 'price_list' 
    | 'orders' 
    | 'sales_summary' 
    | 'total_commission' 
    | 'pending_commission' 
    | 'approved_commission' 
    | 'paid_commission' 
    | 'transaction_history' 
    | 'payout_requests' 
    | 'profile'
  >('overview');

  // Payout request form state
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState(userProfile?.payoutUpi || '');
  const [bankDetails, setBankDetails] = useState<BankDetails>(userProfile?.payoutBankDetails || {
    bankName: '',
    accountNumber: '',
    ifsc: '',
    holderName: '',
  });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // Profile Edit State
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editStoreName, setEditStoreName] = useState(userProfile?.businessName || '');
  const [editUpi, setEditUpi] = useState(userProfile?.payoutUpi || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Real data filtered for this authenticated Reseller
  const resellerId = currentUser?.uid;

  const myOrders = orders.filter(o => 
    (resellerId && o.resellerId === resellerId) || 
    (currentUser && o.customerEmail.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const myCommissions = commissions.filter(c => resellerId && c.resellerId === resellerId);
  const myPayouts = payoutRequests.filter(p => resellerId && p.resellerId === resellerId);

  // Exact Real Calculations
  const totalCommissionEarned = myCommissions
    .filter(c => c.status !== 'reversed')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingCommissionAmount = myCommissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const approvedCommissionAmount = myCommissions
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + c.amount, 0);

  const paidCommissionAmount = myCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalGrossSales = myOrders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // Handlers
  const handleRequestPayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) {
      setPayoutError('Please enter a valid payout amount.');
      return;
    }
    if (payoutAmount > approvedCommissionAmount) {
      setPayoutError(`Amount exceeds available approved balance (₹${approvedCommissionAmount}).`);
      return;
    }
    if (payoutMethod === 'upi' && !upiId.trim()) {
      setPayoutError('Please enter your receiving UPI ID.');
      return;
    }
    if (payoutMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifsc)) {
      setPayoutError('Please provide complete bank account details.');
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutError('');
    setPayoutSuccess('');

    try {
      await requestPayout(payoutAmount, payoutMethod, upiId, bankDetails);
      setPayoutSuccess('Payout withdrawal request submitted successfully! Admin will process transfer.');
      setPayoutAmount(0);
    } catch (err: any) {
      setPayoutError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateCurrentProfile({
        displayName: editName,
        phone: editPhone,
        businessName: editStoreName,
        payoutUpi: editUpi,
        payoutBankDetails: bankDetails,
      });
      setProfileSuccess('Profile details saved successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleShareProductWhatsApp = (prod: Product) => {
    const margin = prod.retailPrice - prod.resellerPrice;
    const msg = `🎁 *${prod.name}*\n` +
      `Special Price: ₹${prod.retailPrice} (MRP: ₹${prod.mrp})\n` +
      `📦 Luxury gifting & festive hampers curated by ECOMART.\n` +
      `Order via WhatsApp today!`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(shareUrl, '_blank');
  };

  // Nav items list representing all 13 sections
  const navSections = [
    { id: 'overview', label: '1. Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: '2. My Products & Share', icon: Package },
    { id: 'price_list', label: '3. Reseller Price List', icon: ListFilter },
    { id: 'orders', label: '4. My Orders', icon: ShoppingBag },
    { id: 'sales_summary', label: '5. Sales Summary', icon: TrendingUp },
    { id: 'total_commission', label: '6. Total Commission', icon: DollarSign },
    { id: 'pending_commission', label: '7. Pending Commission', icon: Clock },
    { id: 'approved_commission', label: '8. Approved Commission', icon: CheckCircle2 },
    { id: 'paid_commission', label: '9. Paid Commission', icon: CreditCard },
    { id: 'transaction_history', label: '10. Commission History', icon: History },
    { id: 'payout_requests', label: '11. Payout Requests', icon: Send },
    { id: 'profile', label: '12. My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900 font-sans">
      {/* Sidebar Navigation (13 Sections) */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm tracking-tight text-white">RESELLER PORTAL</h2>
                <p className="text-[10px] text-purple-300 font-medium">Commission Hub</p>
              </div>
            </div>
          </div>

          {/* Reseller Info Badge */}
          <div className="p-4 bg-stone-950/60 border-b border-stone-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-stone-400">Partner</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                Reseller Tier
              </span>
            </div>
            <p className="text-white font-bold text-xs truncate mt-1">
              {userProfile?.displayName || currentUser?.displayName || 'Reseller Partner'}
            </p>
            <p className="text-stone-400 font-mono text-[11px] truncate">
              {currentUser?.email}
            </p>
          </div>

          {/* Navigation Items (1-12) */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
                  <span className="truncate">{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 13: Logout & Back Buttons */}
        <div className="p-3 border-t border-stone-800 space-y-1.5">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-amber-300" />
            <span>Public Storefront</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-stone-400 hover:text-red-400 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>13. Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Section 1: Dashboard Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Banner */}
              <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800">
                  Reseller Partner Hub
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                  Welcome, {userProfile?.displayName || 'Reseller'}!
                </h2>
                <p className="text-purple-200 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-xl">
                  Track your customer orders, browse reseller-exclusive pricing margins, review real-time earned commissions, and withdraw approved balances directly to your UPI or Bank.
                </p>
              </div>

              {/* Real Commission KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveSection('total_commission')}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-medium">Total Commission</span>
                    <DollarSign className="w-4 h-4 text-purple-700" />
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900">
                    ₹{totalCommissionEarned.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">Across all eligible orders</p>
                </div>

                <div 
                  onClick={() => setActiveSection('pending_commission')}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-amber-300 transition-all"
                >
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-medium">Pending Delivery</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-800">
                    ₹{pendingCommissionAmount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">In processing / dispatch</p>
                </div>

                <div 
                  onClick={() => setActiveSection('approved_commission')}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-medium">Approved Balance</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-blue-800">
                    ₹{approvedCommissionAmount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">Available to withdraw</p>
                </div>

                <div 
                  onClick={() => setActiveSection('paid_commission')}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs cursor-pointer hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between text-stone-500 mb-2">
                    <span className="text-xs font-medium">Paid Commission</span>
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-800">
                    ₹{paidCommissionAmount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">Successfully transferred</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Need to Request a Commission Payout?</h3>
                  <p className="text-xs text-stone-500">Available approved balance ready for payout: <span className="font-bold text-blue-800">₹{approvedCommissionAmount}</span></p>
                </div>
                <button
                  disabled={approvedCommissionAmount <= 0}
                  onClick={() => setActiveSection('payout_requests')}
                  className="py-2 px-4 bg-purple-800 hover:bg-purple-900 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Payout Transfer</span>
                </button>
              </div>

              {/* Recent Commission Entries */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm">Recent Commission Activity</h3>
                  <button
                    onClick={() => setActiveSection('transaction_history')}
                    className="text-xs font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1"
                  >
                    <span>View All History</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {myCommissions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400">
                    No commission entries recorded yet. Place your first reseller order with margin!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="p-3 pl-5">Order ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Margin Amount</th>
                          <th className="p-3">Fulfillment</th>
                          <th className="p-3 pr-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {myCommissions.slice(0, 5).map((comm) => (
                          <tr key={comm.id} className="hover:bg-stone-50/80">
                            <td className="p-3 pl-5 font-mono font-bold text-stone-900">{comm.orderNumber}</td>
                            <td className="p-3 text-stone-500">{new Date(comm.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-purple-900">₹{comm.amount.toLocaleString()}</td>
                            <td className="p-3 capitalize text-stone-600">{comm.orderStatus}</td>
                            <td className="p-3 pr-5 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                comm.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                comm.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                comm.status === 'reversed' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {comm.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: My Products & Share */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">My Reseller Products & Share</h3>
                  <p className="text-xs text-stone-500">
                    Browse gift hampers with your reseller margin and share directly with customers on WhatsApp.
                  </p>
                </div>
                <button
                  onClick={onOpenCart}
                  className="py-2 px-4 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Reseller Cart</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.filter(p => p.isVisible !== false).map((prod) => {
                  const margin = prod.retailPrice - prod.resellerPrice;
                  return (
                    <div key={prod.id} className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="relative aspect-4/3 bg-stone-100">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-purple-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          ₹{margin} Profit Margin
                        </span>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-stone-400 font-mono mb-1">SKU: {prod.sku}</div>
                          <h4 className="font-bold text-stone-900 text-sm">{prod.name}</h4>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 space-y-2">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-stone-500">Public Retail Price:</span>
                            <span className="font-bold text-stone-900">₹{prod.retailPrice}</span>
                          </div>
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-purple-800 font-bold">Your Reseller Cost:</span>
                            <span className="font-extrabold text-purple-900 text-sm">₹{prod.resellerPrice}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => handleShareProductWhatsApp(prod)}
                              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => onQuickView(prod)}
                              className="py-1.5 px-2 bg-purple-800 hover:bg-purple-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                            >
                              <span>Order</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Reseller Price List */}
          {activeSection === 'price_list' && (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-200">
                <h3 className="font-bold text-stone-900 text-base">Complete Reseller Price List</h3>
                <p className="text-xs text-stone-500">Official catalog pricing table with public selling price, reseller rate, and calculated profit margins.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-3.5 pl-5">Product & SKU</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">MRP</th>
                      <th className="p-3.5">Public Price</th>
                      <th className="p-3.5">Reseller Rate</th>
                      <th className="p-3.5 font-bold text-purple-800">Your Margin</th>
                      <th className="p-3.5 pr-5">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((p) => {
                      const margin = p.retailPrice - p.resellerPrice;
                      return (
                        <tr key={p.id} className="hover:bg-stone-50/80">
                          <td className="p-3.5 pl-5">
                            <span className="font-bold text-stone-900 block">{p.name}</span>
                            <span className="font-mono text-stone-400 text-[11px]">SKU: {p.sku}</span>
                          </td>
                          <td className="p-3.5 text-stone-600">{p.category}</td>
                          <td className="p-3.5 text-stone-400 line-through">₹{p.mrp}</td>
                          <td className="p-3.5 font-bold text-stone-900">₹{p.retailPrice}</td>
                          <td className="p-3.5 font-extrabold text-purple-900">₹{p.resellerPrice}</td>
                          <td className="p-3.5 font-extrabold text-emerald-800">+ ₹{margin}</td>
                          <td className="p-3.5 pr-5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.stockQuantity <= 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: My Orders */}
          {activeSection === 'orders' && (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-200">
                <h3 className="font-bold text-stone-900 text-base">My Customer & Reseller Orders</h3>
                <p className="text-xs text-stone-500">Orders placed by you with attributed reseller commissions.</p>
              </div>

              {myOrders.length === 0 ? (
                <div className="p-10 text-center text-xs text-stone-400">
                  No orders placed under your reseller account yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="p-3.5 pl-5">Order ID & Date</th>
                        <th className="p-3.5">Customer Name</th>
                        <th className="p-3.5">Items</th>
                        <th className="p-3.5">Order Total</th>
                        <th className="p-3.5">Earned Commission</th>
                        <th className="p-3.5 pr-5">Fulfillment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {myOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50/80">
                          <td className="p-3.5 pl-5 font-mono font-bold text-stone-900">
                            {ord.orderNumber}
                            <span className="block text-stone-400 text-[11px] font-normal">{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="p-3.5 text-stone-800 font-medium">{ord.customerName}</td>
                          <td className="p-3.5 text-stone-600">{ord.items.length} items</td>
                          <td className="p-3.5 font-bold text-stone-900">₹{ord.total.toLocaleString()}</td>
                          <td className="p-3.5 font-bold text-purple-900">₹{ord.resellerCommission?.toLocaleString() || 0}</td>
                          <td className="p-3.5 pr-5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              ord.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              ord.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Sales Summary */}
          {activeSection === 'sales_summary' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-base">Sales Performance Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 font-medium">Gross Attributed Sales</span>
                    <div className="text-2xl font-extrabold text-stone-900 mt-1">₹{totalGrossSales.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 font-medium">Total Orders Placed</span>
                    <div className="text-2xl font-extrabold text-stone-900 mt-1">{myOrders.length}</div>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-xs text-stone-500 font-medium">Delivered & Fulfilled</span>
                    <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                      {myOrders.filter(o => o.orderStatus === 'delivered').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Total Commission */}
          {activeSection === 'total_commission' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Section 6: Total Commission Ledger</h3>
              <p className="text-xs text-stone-500">
                Sum of all valid commissions generated across your account orders (excluding cancelled/reversed items).
              </p>
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">All-Time Earned Margin</span>
                <div className="text-4xl font-black text-purple-950 mt-1">₹{totalCommissionEarned.toLocaleString()}</div>
                <p className="text-xs text-purple-800 mt-2">
                  Recorded from {myCommissions.filter(c => c.status !== 'reversed').length} eligible order transactions.
                </p>
              </div>
            </div>
          )}

          {/* Section 7: Pending Commission */}
          {activeSection === 'pending_commission' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Section 7: Pending Commission</h3>
              <p className="text-xs text-stone-500">
                Commissions on orders currently in processing or transit. Once the customer receives delivery, the amount automatically shifts to Approved Commission!
              </p>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">In-Transit / Unfulfilled Balance</span>
                <div className="text-4xl font-black text-amber-950 mt-1">₹{pendingCommissionAmount.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Section 8: Approved Commission */}
          {activeSection === 'approved_commission' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Section 8: Approved Commission</h3>
                  <p className="text-xs text-stone-500">Verified delivered orders eligible for instant withdrawal.</p>
                </div>
                <button
                  disabled={approvedCommissionAmount <= 0}
                  onClick={() => setActiveSection('payout_requests')}
                  className="py-2 px-4 bg-purple-800 hover:bg-purple-900 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Withdraw Now</span>
                </button>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Available Balance</span>
                <div className="text-4xl font-black text-blue-950 mt-1">₹{approvedCommissionAmount.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Section 9: Paid Commission */}
          {activeSection === 'paid_commission' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Section 9: Paid Commission</h3>
              <p className="text-xs text-stone-500">Total funds successfully credited to your bank or UPI account.</p>
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Settled Payouts</span>
                <div className="text-4xl font-black text-emerald-950 mt-1">₹{paidCommissionAmount.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Section 10: Commission Transaction History */}
          {activeSection === 'transaction_history' && (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-200">
                <h3 className="font-bold text-stone-900 text-base">Section 10: Commission Transaction History</h3>
                <p className="text-xs text-stone-500">Complete audit log of order numbers, commission amounts, and status changes.</p>
              </div>

              {myCommissions.length === 0 ? (
                <div className="p-10 text-center text-xs text-stone-400">
                  No commission transactions found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="p-3.5 pl-5">Date</th>
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Commission Margin</th>
                        <th className="p-3.5">Fulfillment Stage</th>
                        <th className="p-3.5 pr-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {myCommissions.map((comm) => (
                        <tr key={comm.id} className="hover:bg-stone-50/80">
                          <td className="p-3.5 pl-5 text-stone-500">{new Date(comm.createdAt).toLocaleString()}</td>
                          <td className="p-3.5 font-mono font-bold text-stone-900">{comm.orderNumber}</td>
                          <td className="p-3.5 font-bold text-purple-900">₹{comm.amount.toLocaleString()}</td>
                          <td className="p-3.5 capitalize text-stone-700">{comm.orderStatus}</td>
                          <td className="p-3.5 pr-5 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              comm.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                              comm.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              comm.status === 'reversed' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {comm.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Section 11: Payout Requests */}
          {activeSection === 'payout_requests' && (
            <div className="space-y-6">
              {/* Withdrawal Request Form */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-base">Section 11: Payout Requests</h3>
                <p className="text-xs text-stone-500">
                  Submit a withdrawal request for your approved commission balance.
                </p>

                {payoutError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{payoutError}</span>
                  </div>
                )}

                {payoutSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{payoutSuccess}</span>
                  </div>
                )}

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-purple-900">Available Approved Balance for Withdrawal:</span>
                  <span className="text-lg font-black text-purple-950">₹{approvedCommissionAmount.toLocaleString()}</span>
                </div>

                <form onSubmit={handleRequestPayoutSubmit} className="space-y-3 text-xs max-w-lg">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Withdrawal Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={approvedCommissionAmount}
                      value={payoutAmount || ''}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Payout Destination *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('upi')}
                        className={`py-2 px-3 rounded-xl border font-bold text-center ${
                          payoutMethod === 'upi' ? 'bg-purple-800 text-white border-purple-800' : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        UPI ID (Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('bank')}
                        className={`py-2 px-3 rounded-xl border font-bold text-center ${
                          payoutMethod === 'bank' ? 'bg-purple-800 text-white border-purple-800' : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        Direct Bank Transfer
                      </button>
                    </div>
                  </div>

                  {payoutMethod === 'upi' ? (
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Receiving UPI ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="block text-stone-700 mb-0.5">Bank Name</label>
                        <input
                          type="text"
                          placeholder="HDFC / SBI / ICICI"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                          className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-stone-700 mb-0.5">Account Number</label>
                          <input
                            type="text"
                            placeholder="Account Number"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 mb-0.5">IFSC Code</label>
                          <input
                            type="text"
                            placeholder="HDFC0001234"
                            value={bankDetails.ifsc}
                            onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingPayout || approvedCommissionAmount <= 0}
                    className="py-2.5 px-5 bg-purple-800 hover:bg-purple-900 disabled:opacity-40 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    {isSubmittingPayout ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                  </button>
                </form>
              </div>

              {/* Payout Requests History Table */}
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Your Payout Request History</h4>
                </div>

                {myPayouts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400">
                    No payout requests submitted yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                        <tr>
                          <th className="p-3 pl-5">Requested Date</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Destination</th>
                          <th className="p-3">Transaction Reference</th>
                          <th className="p-3 pr-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {myPayouts.map((req) => (
                          <tr key={req.id} className="hover:bg-stone-50/80">
                            <td className="p-3 pl-5 text-stone-500">{new Date(req.requestedAt).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-purple-900 text-sm">₹{req.amount.toLocaleString()}</td>
                            <td className="p-3 font-mono text-stone-700">{req.payoutMethod === 'upi' ? req.upiId : req.bankDetails?.bankName}</td>
                            <td className="p-3 font-mono text-stone-500">{req.transactionRef || 'Pending bank processing'}</td>
                            <td className="p-3 pr-5 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                req.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 12: My Profile */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 max-w-xl mx-auto shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Section 12: Reseller Profile & Payout Details</h3>
              <p className="text-xs text-stone-500">Manage your contact details and default receiving UPI/bank information.</p>

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                    value={currentUser?.email || ''}
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Store / Affiliate Channel Name</label>
                  <input
                    type="text"
                    value={editStoreName}
                    onChange={(e) => setEditStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">Default Payout UPI ID</label>
                  <input
                    type="text"
                    value={editUpi}
                    onChange={(e) => setEditUpi(e.target.value)}
                    placeholder="e.g. name@paytm"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-2.5 px-5 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl flex items-center gap-2 shadow-2xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
