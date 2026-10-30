import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Package, 
  Calendar 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const InventoryLogs: React.FC = () => {
  const { inventoryLogs } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');

  const filteredLogs = inventoryLogs.filter(log => {
    const matchesSearch = log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.createdBy && log.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesReason = reasonFilter === 'all' || log.reason === reasonFilter;
    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Inventory Movement & Audit Logs</h2>
          <p className="text-xs text-stone-500">
            Real-time server-side tracking of stock reductions, order sales, cancellations, and restocks.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product, SKU, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="all">All Movement Reasons</option>
            <option value="order_placed">Order Placed (- Stock)</option>
            <option value="order_cancelled">Order Cancelled (+ Stock Return)</option>
            <option value="restock">Restock (+ Stock Inflow)</option>
            <option value="adjustment">Manual Audit Adjustment</option>
            <option value="initial_seed">Initial Seed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs text-stone-400">
            No inventory movement logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5 pl-5">Timestamp</th>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Movement</th>
                  <th className="p-3.5">Stock Shift</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5 pr-5">Triggered By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => {
                  const isPositive = log.changeAmount > 0;
                  return (
                    <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 pl-5 text-stone-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{log.productName}</div>
                        <div className="text-[11px] font-mono text-stone-400">SKU: {log.sku}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-md ${
                          isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {isPositive ? `+${log.changeAmount}` : log.changeAmount} units
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-stone-700">
                        <span className="text-stone-400">{log.previousStock}</span>
                        <span className="mx-1.5 text-stone-300">→</span>
                        <span className="font-bold text-stone-900">{log.newStock}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize font-semibold text-[11px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                          {log.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-stone-600 font-medium text-[11px]">
                        {log.createdBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
