import React, { useState } from 'react';
import { 
  Building2, 
  MessageCircle, 
  FileText, 
  Truck, 
  Save, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';

export const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      await updateSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update store settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Store Settings & GST Configuration</h2>
          <p className="text-xs text-stone-500">
            Configure legal tax credentials, invoice numbering, WhatsApp notification triggers, and shipping rules.
          </p>
        </div>

        {isSaved && (
          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Business & GST Profile */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Building2 className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-stone-900 text-sm">
              Business Profile & GST Tax Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Legal Business Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Trade / Brand Name</label>
              <input
                type="text"
                value={formData.tradeName || ''}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">GSTIN Number *</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold text-stone-900"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">PAN Number *</label>
              <input
                type="text"
                required
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-900"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">State & State Code *</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                />
                <input
                  type="text"
                  placeholder="Code (27)"
                  value={formData.stateCode}
                  onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                  className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Registered Business Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Invoicing Rules */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              WhatsApp Order Channel & Invoicing Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">WhatsApp Business Phone *</label>
              <input
                type="text"
                placeholder="919820012345 (with country code)"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold text-stone-900"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Used for instant 1-click customer checkouts & order alerts.
              </p>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-stone-900"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Default GST Rate (%)</label>
              <select
                value={formData.defaultGSTRate}
                onChange={(e) => setFormData({ ...formData, defaultGSTRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-bold text-stone-900"
              >
                <option value={5}>5% (Basic Confectionery/Food)</option>
                <option value={12}>12% (Apparel/Crafts)</option>
                <option value={18}>18% (Standard Gifting & Luxury Hampers)</option>
                <option value={28}>28% (Luxury Electronic Token Gifts)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Free Shipping Above (₹)</label>
              <input
                type="number"
                value={formData.freeShippingAbove}
                onChange={(e) => setFormData({ ...formData, freeShippingAbove: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Default Delivery Fee (₹)</label>
              <input
                type="number"
                value={formData.defaultShippingFee}
                onChange={(e) => setFormData({ ...formData, defaultShippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Updates...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
