import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import { useStore } from '../../context/StoreContext';

interface GSTInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const GSTInvoiceModal: React.FC<GSTInvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();

  if (!order) return null;

  const isInterState = order.state && settings.state && 
    order.state.trim().toLowerCase() !== settings.state.trim().toLowerCase();

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to basic words for the invoice
  const numberToWords = (num: number): string => {
    return `Indian Rupees ${num.toLocaleString('en-IN')} Only`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl border border-stone-200 flex flex-col gap-6 relative print:shadow-none print:border-none print:max-h-none print:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">GST Tax Invoice Preview</h3>
              <p className="text-xs text-stone-500">Invoice #{order.invoiceNumber || order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="border border-stone-300 rounded-2xl p-6 sm:p-8 space-y-6 text-stone-900 text-xs font-sans print:border-stone-400">
          {/* Top Title */}
          <div className="text-center border-b border-stone-200 pb-3">
            <h2 className="text-xl font-extrabold uppercase tracking-widest text-stone-900">
              TAX INVOICE
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">
              (Issued under Section 31 of Central Goods and Services Tax Act, 2017)
            </p>
            <div className="inline-block mt-1 text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
              ORIGINAL FOR RECIPIENT
            </div>
          </div>

          {/* Seller and Invoice Info Grid */}
          <div className="grid grid-cols-2 gap-6 border-b border-stone-200 pb-5">
            {/* Seller Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-emerald-950 uppercase">
                  {settings.businessName}
                </span>
              </div>
              <p className="text-stone-600 font-medium">{settings.tradeName}</p>
              <p className="text-stone-600 leading-relaxed">{settings.address}, {settings.city} - {settings.pincode}</p>
              <p className="text-stone-700">
                <span className="font-bold">State:</span> {settings.state} (Code: {settings.stateCode})
              </p>
              <p className="text-stone-700">
                <span className="font-bold">GSTIN:</span> <span className="font-mono font-bold text-emerald-900">{settings.gstin}</span>
              </p>
              <p className="text-stone-700">
                <span className="font-bold">PAN:</span> <span className="font-mono">{settings.pan}</span>
              </p>
              <p className="text-stone-500 text-[11px]">
                Email: {settings.email} • WhatsApp: +{settings.whatsappNumber}
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 self-start">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Invoice Number:</span>
                <span className="font-mono font-bold text-stone-900 text-sm">{order.invoiceNumber || order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Invoice Date:</span>
                <span className="font-bold text-stone-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Order Number:</span>
                <span className="font-mono font-medium text-stone-700">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Place of Supply:</span>
                <span className="font-bold text-stone-800">{order.state || settings.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-emerald-800">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Buyer & Consignee Details */}
          <div className="grid grid-cols-2 gap-6 border-b border-stone-200 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Details of Receiver (Billed To)
              </span>
              <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
              <p className="text-stone-600 leading-relaxed">{order.customerAddress}</p>
              <p className="text-stone-600">
                {order.city || ''}, {order.state || ''} - {order.pincode || ''}
              </p>
              <p className="text-stone-600">Phone: {order.customerPhone}</p>
              <p className="text-stone-600">Email: {order.customerEmail}</p>
              <p className="text-stone-500 text-[11px]">
                Customer Category: <span className="font-bold uppercase text-emerald-900">{order.customerType}</span>
              </p>
            </div>

            <div className="space-y-1 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Dispatch & Courier Information
              </span>
              <p className="text-stone-700">
                <span className="font-semibold">Courier Partner:</span> {order.courierName || 'Standard Express Gifting'}
              </p>
              <p className="text-stone-700">
                <span className="font-semibold">Tracking AWB:</span> <span className="font-mono font-bold">{order.trackingNumber || 'Pending Dispatch'}</span>
              </p>
              <p className="text-stone-700">
                <span className="font-semibold">Order Fulfillment:</span> <span className="font-bold uppercase text-emerald-800">{order.orderStatus}</span>
              </p>
              {order.notes && (
                <p className="text-amber-900 text-[11px] pt-1 italic">
                  Gifting Note: "{order.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Itemized Goods Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-stone-200">
              <thead className="bg-stone-100 text-stone-700 font-bold text-[11px] uppercase">
                <tr>
                  <th className="border border-stone-200 p-2 text-center w-8">#</th>
                  <th className="border border-stone-200 p-2">Description of Goods</th>
                  <th className="border border-stone-200 p-2 text-center">HSN/SAC</th>
                  <th className="border border-stone-200 p-2 text-center">Qty</th>
                  <th className="border border-stone-200 p-2 text-right">Unit Rate</th>
                  <th className="border border-stone-200 p-2 text-right">Taxable Value</th>
                  {isInterState ? (
                    <th className="border border-stone-200 p-2 text-right">IGST (18%)</th>
                  ) : (
                    <>
                      <th className="border border-stone-200 p-2 text-right">CGST (9%)</th>
                      <th className="border border-stone-200 p-2 text-right">SGST (9%)</th>
                    </>
                  )}
                  <th className="border border-stone-200 p-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const lineTaxable = item.unitPrice * item.quantity;
                  const lineCgst = Math.round(lineTaxable * 0.09);
                  const lineSgst = Math.round(lineTaxable * 0.09);
                  const lineIgst = Math.round(lineTaxable * 0.18);
                  const lineTotal = lineTaxable + (isInterState ? lineIgst : (lineCgst + lineSgst));

                  return (
                    <tr key={idx} className="border-b border-stone-200">
                      <td className="border border-stone-200 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-stone-200 p-2 font-medium">
                        <div>{item.productName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="border border-stone-200 p-2 text-center font-mono text-[10px]">
                        9983
                      </td>
                      <td className="border border-stone-200 p-2 text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="border border-stone-200 p-2 text-right font-mono">
                        ₹{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-stone-200 p-2 text-right font-mono font-medium">
                        ₹{lineTaxable.toFixed(2)}
                      </td>
                      {isInterState ? (
                        <td className="border border-stone-200 p-2 text-right font-mono">
                          ₹{lineIgst.toFixed(2)}
                        </td>
                      ) : (
                        <>
                          <td className="border border-stone-200 p-2 text-right font-mono">
                            ₹{lineCgst.toFixed(2)}
                          </td>
                          <td className="border border-stone-200 p-2 text-right font-mono">
                            ₹{lineSgst.toFixed(2)}
                          </td>
                        </>
                      )}
                      <td className="border border-stone-200 p-2 text-right font-mono font-bold">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="grid grid-cols-2 gap-6 items-start pt-2">
            <div className="space-y-2 text-[11px] text-stone-600">
              <p className="font-bold text-stone-800">
                Total in Words: <span className="font-normal italic">{numberToWords(order.total)}</span>
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-800 block text-[10px] uppercase">
                  Terms & Conditions:
                </span>
                <p>1. Goods once sold will not be taken back unless damaged in transit.</p>
                <p>2. Discrepancies if any should be notified within 24 hours of receipt.</p>
                <p>3. Subject to {settings.city} jurisdiction only.</p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-600">
                <span>Total Taxable Amount:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {!isInterState ? (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>Central GST (CGST 9%):</span>
                    <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>State GST (SGST 9%):</span>
                    <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-stone-600">
                  <span>Integrated GST (IGST 18%):</span>
                  <span>₹{order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Shipping & Packaging:</span>
                <span>₹{order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-300 pt-2 text-sm font-black text-stone-900">
                <span>Invoice Total:</span>
                <span className="text-emerald-900">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-6 border-t border-stone-200 flex justify-between items-end">
            <div className="text-[10px] text-stone-400">
              Computer Generated Tax Invoice • ECOMART GIFTS PLACE
            </div>
            <div className="text-center space-y-6">
              <p className="font-bold text-xs text-stone-800">
                For {settings.businessName}
              </p>
              <div className="border-t border-stone-400 pt-1 text-[11px] font-semibold text-stone-600 min-w-[160px]">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
