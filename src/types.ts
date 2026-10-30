export type UserRole = 'public' | 'retailer' | 'reseller' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  mrp: number; // Maximum Retail Price / Discount baseline
  retailPrice: number; // Public Selling Price
  retailerPrice: number; // Dedicated price for approved Retailers
  resellerPrice: number; // Reseller baseline price
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  storagePaths?: string[];
  isVisible: boolean;
  isAvailable: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  roleApplied: UserRole;
}

export type PaymentStatus = 'pending' | 'paid' | 'cod' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  customerType: UserRole;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstRate: number;
  shippingFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  invoiceNumber?: string;
  resellerId?: string;
  resellerName?: string;
  resellerCommission?: number;
  retailerId?: string;
  retailerName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  changeAmount: number; // e.g. -2 or +10
  reason: 'order_placed' | 'order_cancelled' | 'restock' | 'adjustment' | 'initial_seed';
  previousStock: number;
  newStock: number;
  orderId?: string;
  timestamp: string;
  createdBy: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  holderName: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'retailer' | 'reseller' | 'admin';
  phone: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: AccountStatus;
  payoutUpi?: string;
  payoutBankDetails?: BankDetails;
  createdAt: string;
  updatedAt: string;
}

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

export interface Commission {
  id: string;
  orderId: string;
  orderNumber: string;
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  amount: number;
  status: CommissionStatus;
  orderStatus: OrderStatus;
  payoutRequestId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface PayoutRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  resellerPhone: string;
  amount: number;
  status: PayoutStatus;
  payoutMethod: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: BankDetails;
  transactionRef?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface StoreSettings {
  id: string;
  businessName: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  state: string;
  stateCode: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  defaultGSTRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currencySymbol: string;
  freeShippingAbove: number;
  defaultShippingFee: number;
  updatedAt: string;
}
