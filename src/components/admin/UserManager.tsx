import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Building2,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserProfile, AccountStatus } from '../../types';

export const UserManager: React.FC = () => {
  const { usersList, updateUserStatus } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'retailer' | 'reseller'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null);

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.phone && user.phone.includes(searchTerm)) ||
                          (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateStatus = async (uid: string, newStatus: AccountStatus) => {
    try {
      await updateUserStatus(uid, newStatus);
      if (inspectUser && inspectUser.uid === uid) {
        setInspectUser(prev => prev ? ({ ...prev, status: newStatus }) : null);
      }
    } catch (err: any) {
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">User & Partner Account Approvals</h2>
          <p className="text-xs text-stone-500">
            Review registered Retailers & Resellers, approve special wholesale/discount access, and manage account statuses.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="retailer">Retailers</option>
            <option value="reseller">Resellers</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved & Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-xs text-stone-400">
            No registered users found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5 pl-5">User & Contact</th>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Registered Date</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 pr-5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-stone-900">{user.displayName}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-stone-700 font-medium">
                      {user.businessName || '—'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.role === 'retailer' ? 'bg-emerald-100 text-emerald-800' :
                        user.role === 'reseller' ? 'bg-purple-100 text-purple-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        user.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-stone-200 text-stone-700'
                      }`}>
                        {user.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {user.status === 'pending' && <Clock className="w-3 h-3" />}
                        {user.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {user.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(user.uid, 'approved')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                            title="Approve Account"
                          >
                            Approve
                          </button>
                        )}
                        {user.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(user.uid, 'suspended')}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                            title="Suspend Account"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(user.uid, 'rejected')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 rounded-lg font-bold text-xs transition-colors"
                            title="Reject Application"
                          >
                            Reject
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => handleUpdateStatus(user.uid, 'approved')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
                            title="Reactivate Account"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
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
