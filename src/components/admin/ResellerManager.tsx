import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Search,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PayoutRequest, Commission } from '../../types';

export const ResellerManager: React.FC = () => {
  const { commissions, payoutRequests, processPayoutRequest } = useStore();

  const [activeTab, setActiveTab] = useState<'payouts' | 'commissions'>('payouts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Financial Stats from real commissions
  const totalEarned = commissions.filter(c => c.status !== 'reversed').reduce((s, c) => s + c.amount, 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);
  const approvedCommissions = commissions.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0);
  const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);

  const handleOpenProcessModal = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setTransactionRef(payout.transactionRef || `TXN-${Date.now().toString().slice(-6)}`);
    setAdminNotes(payout.adminNotes || '');
  };

  const handleExecutePayoutStatus = async (status: 'approved' | 'paid' | 'rejected') => {
    if (!selectedPayout) return;
    setIsProcessing(true);
    try {
      await processPayoutRequest(selectedPayout.id, status, transactionRef, adminNotes);
      setSelectedPayout(null);
    } catch (err: any) {
      alert(`Error updating payout request: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayouts = payoutRequests.filter(p => {
    return p.resellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.resellerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.upiId && p.upiId.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const filteredCommissions = commissions.filter(c => {
    return c.resellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Reseller Commission & Payout Management</h2>
          <p className="text-xs text-stone-500">
            Review earned partner margins, approve eligible payout balances, and track payment transaction IDs.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Total Reseller Margins</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            ₹{totalEarned.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Across all reseller orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Pending Delivery</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-800">
            ₹{pendingCommissions.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Awaiting order fulfillment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Approved Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-800">
            ₹{approvedCommissions.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Eligible for payout withdrawal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Total Paid Out</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">
            ₹{paidCommissions.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Transferred via UPI/Bank</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payouts'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Withdrawal Payout Requests ({payoutRequests.filter(p => p.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'commissions'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Commission Audit Ledger ({commissions.length})
        </button>
      </div>

      {/* Tab 1: Payout Requests */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">Reseller Withdrawal Requests</h3>
            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reseller or UPI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
          </div>

          {filteredPayouts.length === 0 ? (
            <div className="p-10 text-center text-xs text-stone-400">
              No payout requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5 pl-5">Reseller Partner</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payout Method & Details</th>
                    <th className="p-3.5">Requested Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPayouts.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-stone-900">{req.resellerName}</div>
                        <div className="text-[11px] text-stone-400">{req.resellerEmail} • {req.resellerPhone}</div>
                      </td>
                      <td className="p-3.5 font-bold text-purple-900 text-sm">
                        ₹{req.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        {req.payoutMethod === 'upi' ? (
                          <div className="font-mono text-stone-800">
                            UPI: <span className="font-bold text-emerald-800">{req.upiId || 'Not provided'}</span>
                          </div>
                        ) : (
                          <div className="text-stone-700">
                            Bank: {req.bankDetails?.bankName} (A/C: {req.bankDetails?.accountNumber})
                          </div>
                        )}
                        {req.transactionRef && (
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                            Ref: {req.transactionRef}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-stone-500">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => handleOpenProcessModal(req)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-purple-50 text-stone-800 hover:text-purple-800 rounded-lg font-bold text-xs transition-colors border border-stone-200"
                        >
                          Process Payout
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

      {/* Tab 2: Commission Ledger */}
      {activeTab === 'commissions' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">Reseller Order & Commission Ledger</h3>
            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID or reseller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
          </div>

          {filteredCommissions.length === 0 ? (
            <div className="p-10 text-center text-xs text-stone-400">
              No commission entries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5 pl-5">Order ID & Date</th>
                    <th className="p-3.5">Reseller Name</th>
                    <th className="p-3.5">Commission Margin</th>
                    <th className="p-3.5">Fulfillment Stage</th>
                    <th className="p-3.5 pr-5 text-right">Commission Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCommissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-mono font-bold text-stone-900">{comm.orderNumber}</div>
                        <div className="text-[11px] text-stone-400">{new Date(comm.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-800">{comm.resellerName}</div>
                        <div className="text-[11px] text-stone-400">{comm.resellerEmail}</div>
                      </td>
                      <td className="p-3.5 font-bold text-purple-900 text-sm">
                        ₹{comm.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full text-[11px]">
                          {comm.orderStatus}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

      {/* Payout Processing Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-900 text-base">
              Process Payout: {selectedPayout.resellerName}
            </h3>
            
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Requested Amount:</span>
                <span className="font-bold text-purple-900 text-sm">₹{selectedPayout.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Method:</span>
                <span className="font-semibold uppercase">{selectedPayout.payoutMethod}</span>
              </div>
              {selectedPayout.payoutMethod === 'upi' ? (
                <div className="flex justify-between">
                  <span className="text-stone-500">UPI ID:</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedPayout.upiId || '—'}</span>
                </div>
              ) : (
                <div className="text-stone-700 pt-1">
                  Bank: {selectedPayout.bankDetails?.bankName} | A/C: {selectedPayout.bankDetails?.accountNumber} | IFSC: {selectedPayout.bankDetails?.ifsc}
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Bank / UPI Transaction Reference ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-20261029-98124"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Admin Note / Bank Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Successfully transferred via IMPS / GPay"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
              </div>

              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleExecutePayoutStatus('rejected')}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleExecutePayoutStatus('approved')}
                  className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold"
                >
                  Approve (Unpaid)
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleExecutePayoutStatus('paid')}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold shadow-2xs"
                >
                  Mark Paid & Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
