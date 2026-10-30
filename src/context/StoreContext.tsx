import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { 
  User, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  db, 
  auth, 
  googleProvider, 
  storage, 
  storageRef, 
  uploadBytesResumable, 
  getDownloadURL,
  isUserAdmin, 
  handleFirestoreError, 
  OperationType, 
  testConnection, 
  BOOTSTRAPPED_ADMIN_EMAIL 
} from '../firebase';
import { 
  Product, 
  CartItem, 
  Order, 
  InventoryLog, 
  StoreSettings, 
  UserRole,
  AccountStatus,
  UserProfile,
  Commission,
  PayoutRequest,
  BankDetails,
  OrderStatus, 
  PaymentStatus,
} from '../types';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '../data/seedData';
import { Language, TRANSLATIONS } from '../translations';

interface StoreContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Auth & Roles
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isRetailer: boolean;
  isReseller: boolean;
  isAuthLoading: boolean;
  devAdminBypass: boolean;
  toggleDevAdminBypass: () => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  // Auth Operations
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string, 
    pass: string, 
    displayName: string, 
    role: 'retailer' | 'reseller', 
    phone: string, 
    businessName?: string, 
    address?: string,
    payoutUpi?: string,
    payoutBankDetails?: BankDetails
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, changeAmount: number, reason: 'restock' | 'adjustment', note?: string) => Promise<void>;
  uploadProductImage: (file: File, onProgress?: (pct: number) => void) => Promise<{ downloadUrl: string; storagePath: string }>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  cartSubtotal: number;
  cartTaxAmount: number;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, tracking?: { courierName?: string; trackingNumber?: string }) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;

  // Commissions & Payouts (Reseller)
  commissions: Commission[];
  payoutRequests: PayoutRequest[];
  requestPayout: (amount: number, method: 'upi' | 'bank', upiId?: string, bankDetails?: BankDetails) => Promise<void>;
  processPayoutRequest: (id: string, status: 'approved' | 'paid' | 'rejected', transactionRef?: string, notes?: string) => Promise<void>;

  // User Management (Admin)
  usersList: UserProfile[];
  updateUserStatus: (uid: string, status: AccountStatus) => Promise<void>;

  // Inventory
  inventoryLogs: InventoryLog[];

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;

  // WhatsApp Helpers
  generateWhatsAppOrderLink: (order: Order) => string;
  generateWhatsAppChatLink: (message?: string) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [devAdminBypass, setDevAdminBypass] = useState<boolean>(() => {
    return localStorage.getItem('ecomart_dev_admin_bypass') === 'true';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ecomart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ecomart_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ecomart_language', lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language] || TRANSLATIONS[key]['en'];
    }
    return key;
  };

  // Effective Admin status
  const isAdmin = useMemo(() => {
    if (devAdminBypass) return true;
    if (isUserAdmin(currentUser)) return true;
    if (userProfile?.role === 'admin') return true;
    return false;
  }, [currentUser, userProfile, devAdminBypass]);

  // Role booleans
  const isRetailer = useMemo(() => {
    return userProfile?.role === 'retailer' && userProfile?.status === 'approved';
  }, [userProfile]);

  const isReseller = useMemo(() => {
    return userProfile?.role === 'reseller' && userProfile?.status === 'approved';
  }, [userProfile]);

  // Active view role
  const [activeRoleOverride, setActiveRoleOverride] = useState<UserRole | null>(null);
  const activeRole: UserRole = useMemo(() => {
    if (activeRoleOverride) return activeRoleOverride;
    if (isAdmin) return 'admin';
    if (isReseller) return 'reseller';
    if (isRetailer) return 'retailer';
    return 'public';
  }, [activeRoleOverride, isAdmin, isReseller, isRetailer]);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecomart_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Auth Listener
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or listen to user document in /users/{uid}
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else if (user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
            // Auto bootstrap admin profile
            const adminProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Super Admin',
              role: 'admin',
              phone: '',
              status: 'approved',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, adminProfile);
            setUserProfile(adminProfile);
          }
        } catch (err) {
          console.warn('Could not fetch user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to current user profile updates
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    }, (err) => {
      console.warn("User profile listener warning:", err.message);
    });
    return () => unsub();
  }, [currentUser]);

  // Seed Products and Settings if empty
  const seedInitialDataIfEmpty = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      if (productsSnapshot.empty) {
        console.log('Seeding initial products into Firestore...');
        for (const item of INITIAL_PRODUCTS) {
          const docRef = doc(collection(db, 'products'));
          const newProduct: Product = {
            ...item,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProduct);

          // Seed inventory log
          const logRef = doc(collection(db, 'inventory_logs'));
          const initLog: InventoryLog = {
            id: logRef.id,
            productId: docRef.id,
            productName: newProduct.name,
            sku: newProduct.sku,
            changeAmount: newProduct.stockQuantity,
            reason: 'initial_seed',
            previousStock: 0,
            newStock: newProduct.stockQuantity,
            timestamp: new Date().toISOString(),
            createdBy: 'System Seed'
          };
          await setDoc(logRef, initLog);
        }
      }

      // Settings doc
      const settingsDocRef = doc(db, 'settings', 'general');
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (settingsSnap.empty) {
        await setDoc(settingsDocRef, DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.warn('Initial seeding fallback to memory: ', err);
      if (products.length === 0) {
        setProducts(INITIAL_PRODUCTS.map((p, idx) => ({
          ...p,
          id: `seed-${idx + 1}`
        })));
      }
    }
  };

  // Sync Settings
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'settings'), (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data() as StoreSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...docData, id: snapshot.docs[0].id });
      }
    }, (err) => {
      console.warn("Could not sync settings from Firestore, using defaults: ", err.message);
    });
    return () => unsub();
  }, []);

  // Sync Products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product));
        setProducts(items);
      } else {
        seedInitialDataIfEmpty();
      }
      setIsLoadingProducts(false);
    }, (error) => {
      console.warn("Products sync error: ", error.message);
      if (products.length === 0) {
        setProducts(INITIAL_PRODUCTS.map((p, idx) => ({ ...p, id: `seed-${idx + 1}` })));
      }
      setIsLoadingProducts(false);
    });
    return () => unsub();
  }, []);

  // Sync Orders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(items);
      setIsLoadingOrders(false);
    }, (err) => {
      console.warn("Orders sync error (normal for guest viewers):", err.message);
      setIsLoadingOrders(false);
    });
    return () => unsub();
  }, [currentUser, devAdminBypass]);

  // Sync Inventory Logs
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventory_logs'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as InventoryLog));
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setInventoryLogs(items);
    }, (err) => {
      console.warn("Inventory logs sync error:", err.message);
    });
    return () => unsub();
  }, [currentUser, devAdminBypass]);

  // Sync Commissions
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'commissions'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Commission));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCommissions(items);
    }, (err) => {
      console.warn("Commissions sync error:", err.message);
    });
    return () => unsub();
  }, [currentUser, devAdminBypass]);

  // Sync Payout Requests
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'payout_requests'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PayoutRequest));
      items.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      setPayoutRequests(items);
    }, (err) => {
      console.warn("Payout requests sync error:", err.message);
    });
    return () => unsub();
  }, [currentUser, devAdminBypass]);

  // Sync Registered Users (For Admin)
  useEffect(() => {
    if (!isAdmin && !devAdminBypass) return;
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsersList(items);
    }, (err) => {
      console.warn("Users sync error:", err.message);
    });
    return () => unsub();
  }, [isAdmin, devAdminBypass]);

  // Auth Functions
  const loginWithEmail = async (email: string, pass: string) => {
    const trimmedEmail = email.trim();
    const isAdminEmail = trimmedEmail.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      setCurrentUser(cred.user);
    } catch (error: any) {
      console.warn("Primary email sign-in attempt:", error?.code, error?.message);

      // If it's the registered Admin email (ecomart2092@gmail.com)
      if (isAdminEmail) {
        // Attempt first-time auto-creation in Firebase Auth if account doesn't exist yet
        try {
          const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
          await updateProfile(cred.user, { displayName: 'Admin' });
          setCurrentUser(cred.user);

          const now = new Date().toISOString();
          const adminProfile: UserProfile = {
            uid: cred.user.uid,
            email: trimmedEmail,
            displayName: 'Admin',
            role: 'admin',
            phone: '+91 98200 12345',
            status: 'approved',
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(doc(db, 'users', cred.user.uid), adminProfile);
          await setDoc(doc(db, 'admins', cred.user.uid), {
            email: trimmedEmail,
            role: 'admin',
            createdAt: now,
          });
          setUserProfile(adminProfile);
          return;
        } catch (createErr: any) {
          console.warn("Admin auto-creation attempt:", createErr?.code, createErr?.message);
        }

        // If credentials match user's explicit admin password 'MD@ibran2092'
        if (pass === 'MD@ibran2092' || pass === 'ecomart2092') {
          setDevAdminBypass(true);
          localStorage.setItem('ecomart_dev_admin_bypass', 'true');
          const adminProfile: UserProfile = {
            uid: 'admin-ecomart-root',
            email: BOOTSTRAPPED_ADMIN_EMAIL,
            displayName: 'Admin (EcoMart)',
            role: 'admin',
            phone: '+91 98200 12345',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUserProfile(adminProfile);
          return;
        }
      }

      console.error("Email login failed:", error);
      throw error;
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    displayName: string, 
    role: 'retailer' | 'reseller', 
    phone: string, 
    businessName = '', 
    address = '',
    payoutUpi = '',
    payoutBankDetails?: BankDetails
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName });
      const now = new Date().toISOString();

      // Retailers require Admin approval by default; Resellers start active/pending
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: email.trim(),
        displayName: displayName.trim(),
        role,
        phone: phone.trim(),
        businessName: businessName.trim(),
        address: address.trim(),
        status: 'pending', // Awaiting Admin approval
        payoutUpi: payoutUpi.trim(),
        payoutBankDetails: payoutBankDetails || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setDevAdminBypass(false);
      localStorage.removeItem('ecomart_dev_admin_bypass');
      setUserProfile(null);
      setActiveRoleOverride(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateCurrentProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const now = new Date().toISOString();
      const updated = { ...updates, updatedAt: now };
      await updateDoc(doc(db, 'users', currentUser.uid), updated);
      setUserProfile(prev => prev ? ({ ...prev, ...updated }) : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      throw error;
    }
  };

  const toggleDevAdminBypass = () => {
    setDevAdminBypass(prev => {
      const nextVal = !prev;
      localStorage.setItem('ecomart_dev_admin_bypass', String(nextVal));
      return nextVal;
    });
  };

  // Direct Image Upload to Firebase Storage
  const uploadProductImage = async (
    file: File, 
    onProgress?: (pct: number) => void
  ): Promise<{ downloadUrl: string; storagePath: string }> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Invalid image file format. Supported formats: JPG, JPEG, PNG, WebP.');
    }
    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Image size exceeds 8MB. Please select a smaller photo.');
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `products/${Date.now()}_${cleanName}`;
    const fileRef = storageRef(storage, path);

    return new Promise((resolve, reject) => {
      try {
        const uploadTask = uploadBytesResumable(fileRef, file);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          },
          (error) => {
            console.warn('Firebase Storage upload error, falling back to local object preview:', error);
            // Create local object URL as responsive fallback
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                downloadUrl: reader.result as string,
                storagePath: path,
              });
            };
            reader.onerror = () => reject(new Error('Failed to read image file.'));
            reader.readAsDataURL(file);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ downloadUrl, storagePath: path });
            } catch (err) {
              // Fallback
              const reader = new FileReader();
              reader.onload = () => resolve({ downloadUrl: reader.result as string, storagePath: path });
              reader.readAsDataURL(file);
            }
          }
        );
      } catch (err) {
        // Fallback for offline/iframe storage restrictions
        const reader = new FileReader();
        reader.onload = () => resolve({ downloadUrl: reader.result as string, storagePath: path });
        reader.readAsDataURL(file);
      }
    });
  };

  // Pricing resolver per active role
  const getProductPriceForRole = (product: Product, role: UserRole): number => {
    switch (role) {
      case 'reseller':
        return product.resellerPrice || product.retailPrice;
      case 'retailer':
        return product.retailerPrice || product.retailPrice;
      case 'public':
      case 'admin':
      default:
        return product.retailPrice;
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stockQuantity <= 0) return false;

    const unitPrice = getProductPriceForRole(product, activeRole);
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: newQty, unitPrice, roleApplied: activeRole }
            : item
        );
      } else {
        const qty = Math.min(quantity, product.stockQuantity);
        return [...prevCart, { product, quantity: qty, unitPrice, roleApplied: activeRole }];
      }
    });
    return true;
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(quantity, item.product.stockQuantity);
          return { ...item, quantity: clampedQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const cartTaxAmount = useMemo(() => {
    const rate = settings.defaultGSTRate || 18;
    return Math.round((cartSubtotal * rate) / 100);
  }, [cartSubtotal, settings.defaultGSTRate]);

  const cartTotal = useMemo(() => {
    const shipping = cartSubtotal >= settings.freeShippingAbove || cartSubtotal === 0 ? 0 : settings.defaultShippingFee;
    return cartSubtotal + cartTaxAmount + shipping;
  }, [cartSubtotal, cartTaxAmount, settings.freeShippingAbove, settings.defaultShippingFee]);

  // Product CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const docRef = doc(collection(db, 'products'));
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, newProduct);

      // Log initial inventory
      const logRef = doc(collection(db, 'inventory_logs'));
      const log: InventoryLog = {
        id: logRef.id,
        productId: docRef.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        changeAmount: newProduct.stockQuantity,
        reason: 'restock',
        previousStock: 0,
        newStock: newProduct.stockQuantity,
        timestamp: now,
        createdBy: currentUser?.email || 'Admin',
      };
      await setDoc(logRef, log);

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${docRef.id}`);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const productRef = doc(db, 'products', id);
    const now = new Date().toISOString();

    try {
      const existingProduct = products.find(p => p.id === id);
      const isStockChanged = updates.stockQuantity !== undefined && existingProduct && updates.stockQuantity !== existingProduct.stockQuantity;

      await updateDoc(productRef, {
        ...updates,
        updatedAt: now,
      });

      if (isStockChanged && existingProduct && updates.stockQuantity !== undefined) {
        const diff = updates.stockQuantity - existingProduct.stockQuantity;
        const logRef = doc(collection(db, 'inventory_logs'));
        const log: InventoryLog = {
          id: logRef.id,
          productId: id,
          productName: updates.name || existingProduct.name,
          sku: updates.sku || existingProduct.sku,
          changeAmount: diff,
          reason: diff > 0 ? 'restock' : 'adjustment',
          previousStock: existingProduct.stockQuantity,
          newStock: updates.stockQuantity,
          timestamp: now,
          createdBy: currentUser?.email || 'Admin',
        };
        await setDoc(logRef, log);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      throw error;
    }
  };

  const adjustStock = async (productId: string, changeAmount: number, reason: 'restock' | 'adjustment', note?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const previousStock = product.stockQuantity;
    const newStock = Math.max(0, previousStock + changeAmount);
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'products', productId), {
        stockQuantity: newStock,
        updatedAt: now,
      });

      const logRef = doc(collection(db, 'inventory_logs'));
      const log: InventoryLog = {
        id: logRef.id,
        productId,
        productName: product.name,
        sku: product.sku,
        changeAmount,
        reason,
        previousStock,
        newStock,
        timestamp: now,
        createdBy: `${currentUser?.email || 'Admin'}${note ? ` (${note})` : ''}`,
      };
      await setDoc(logRef, log);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
      throw error;
    }
  };

  // Orders Management & Inventory Atomic Protection & Commission Creation
  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const orderDocRef = doc(collection(db, 'orders'));
    const now = new Date().toISOString();
    const orderNumber = `EMG-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `${settings.invoicePrefix || 'EMG-'}${settings.nextInvoiceNumber || 1042}`;

    const newOrder: Order = {
      ...orderData,
      id: orderDocRef.id,
      orderNumber,
      invoiceNumber,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Verify stock availability
        for (const item of orderData.items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Product ${item.productName} no longer exists.`);
          }

          const currentStock = productDoc.data().stockQuantity ?? 0;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for "${item.productName}". Available: ${currentStock}, Requested: ${item.quantity}`);
          }

          // Decrement stock
          const updatedStock = currentStock - item.quantity;
          transaction.update(productRef, {
            stockQuantity: updatedStock,
            updatedAt: now,
          });

          // Log inventory
          const logRef = doc(collection(db, 'inventory_logs'));
          const logData: InventoryLog = {
            id: logRef.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            changeAmount: -item.quantity,
            reason: 'order_placed',
            previousStock: currentStock,
            newStock: updatedStock,
            orderId: orderDocRef.id,
            timestamp: now,
            createdBy: orderData.customerName || 'Customer',
          };
          transaction.set(logRef, logData);
        }

        // 2. Set the order document
        transaction.set(orderDocRef, newOrder);

        // 3. Increment invoice counter
        const settingsRef = doc(db, 'settings', 'general');
        transaction.update(settingsRef, {
          nextInvoiceNumber: (settings.nextInvoiceNumber || 1042) + 1,
          updatedAt: now,
        });

        // 4. If Reseller commission applies, record commission document atomically
        if (orderData.resellerId && orderData.resellerCommission && orderData.resellerCommission > 0) {
          const commRef = doc(collection(db, 'commissions'));
          const commissionData: Commission = {
            id: commRef.id,
            orderId: orderDocRef.id,
            orderNumber,
            resellerId: orderData.resellerId,
            resellerName: orderData.resellerName || orderData.customerName,
            resellerEmail: currentUser?.email || 'reseller@ecomart.com',
            amount: orderData.resellerCommission,
            status: 'pending',
            orderStatus: 'pending',
            createdAt: now,
            updatedAt: now,
          };
          transaction.set(commRef, commissionData);
        }
      });

      clearCart();
      return newOrder;
    } catch (error) {
      console.error("Order creation failed: ", error);
      handleFirestoreError(error, OperationType.CREATE, `orders/${orderDocRef.id}`);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, tracking?: { courierName?: string; trackingNumber?: string }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const previousStatus = order.orderStatus;
    const now = new Date().toISOString();
    const updates: Partial<Order> = {
      orderStatus: status,
      updatedAt: now,
      ...(tracking?.courierName ? { courierName: tracking.courierName } : {}),
      ...(tracking?.trackingNumber ? { trackingNumber: tracking.trackingNumber } : {}),
    };

    try {
      // If moving to CANCELLED: RESTOCK items and REVERSE commission!
      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        for (const item of order.items) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const previousStock = product.stockQuantity;
            const newStock = previousStock + item.quantity;

            await updateDoc(doc(db, 'products', item.productId), {
              stockQuantity: newStock,
              updatedAt: now,
            });

            const logRef = doc(collection(db, 'inventory_logs'));
            const log: InventoryLog = {
              id: logRef.id,
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              changeAmount: +item.quantity,
              reason: 'order_cancelled',
              previousStock,
              newStock,
              orderId,
              timestamp: now,
              createdBy: `${currentUser?.email || 'Admin'} (Order Cancelled)`,
            };
            await setDoc(logRef, log);
          }
        }

        // Reverse matching commission
        const matchingComm = commissions.find(c => c.orderId === orderId);
        if (matchingComm) {
          await updateDoc(doc(db, 'commissions', matchingComm.id), {
            status: 'reversed',
            orderStatus: 'cancelled',
            updatedAt: now,
          });
        }
      }

      // If moving to DELIVERED: Approve commission
      if (status === 'delivered') {
        const matchingComm = commissions.find(c => c.orderId === orderId);
        if (matchingComm && matchingComm.status === 'pending') {
          await updateDoc(doc(db, 'commissions', matchingComm.id), {
            status: 'approved',
            orderStatus: 'delivered',
            updatedAt: now,
          });
        }
      }

      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      throw error;
    }
  };

  const updatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        paymentStatus: status,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      throw error;
    }
  };

  // Commission & Payout Actions
  const requestPayout = async (amount: number, method: 'upi' | 'bank', upiId?: string, bankDetails?: BankDetails) => {
    if (!currentUser) throw new Error('Must be logged in to request payout');
    const now = new Date().toISOString();
    const reqRef = doc(collection(db, 'payout_requests'));

    const newRequest: PayoutRequest = {
      id: reqRef.id,
      resellerId: currentUser.uid,
      resellerName: userProfile?.displayName || currentUser.displayName || 'Reseller',
      resellerEmail: currentUser.email || '',
      resellerPhone: userProfile?.phone || '',
      amount,
      status: 'pending',
      payoutMethod: method,
      upiId: method === 'upi' ? (upiId || userProfile?.payoutUpi) : undefined,
      bankDetails: method === 'bank' ? (bankDetails || userProfile?.payoutBankDetails) : undefined,
      requestedAt: now,
    };

    try {
      await setDoc(reqRef, newRequest);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `payout_requests/${reqRef.id}`);
      throw error;
    }
  };

  const processPayoutRequest = async (
    id: string, 
    status: 'approved' | 'paid' | 'rejected', 
    transactionRef?: string, 
    notes?: string
  ) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'payout_requests', id), {
        status,
        ...(transactionRef ? { transactionRef } : {}),
        ...(notes ? { adminNotes: notes } : {}),
        processedAt: now,
      });

      // If marked paid, also mark matching commissions as paid
      if (status === 'paid') {
        const req = payoutRequests.find(p => p.id === id);
        if (req) {
          const eligibleComms = commissions.filter(c => c.resellerId === req.resellerId && c.status === 'approved');
          let runningTotal = 0;
          for (const c of eligibleComms) {
            if (runningTotal < req.amount) {
              await updateDoc(doc(db, 'commissions', c.id), {
                status: 'paid',
                payoutRequestId: id,
                updatedAt: now,
              });
              runningTotal += c.amount;
            }
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payout_requests/${id}`);
      throw error;
    }
  };

  // User Management
  const updateUserStatus = async (uid: string, status: AccountStatus) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'users', uid), {
        status,
        updatedAt: now,
      });
      setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, status, updatedAt: now } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const now = new Date().toISOString();
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        ...newSettings,
        updatedAt: now,
      }, { merge: true });
      setSettings(prev => ({ ...prev, ...newSettings, updatedAt: now }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/general');
      throw error;
    }
  };

  // WhatsApp Deep Link Generators
  const generateWhatsAppOrderLink = (order: Order): string => {
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const itemsText = order.items
      .map(i => `• ${i.productName} (SKU: ${i.sku}) x ${i.quantity} @ ₹${i.unitPrice} = ₹${i.total}`)
      .join('\n');

    const message = `🛍️ *NEW ORDER: ${order.orderNumber}*\n` +
      `--------------------------------\n` +
      `👤 *Customer:* ${order.customerName}\n` +
      `📞 *Phone:* ${order.customerPhone}\n` +
      `🏷️ *Tier:* ${order.customerType.toUpperCase()}\n` +
      `📍 *Address:* ${order.customerAddress}, ${order.city || ''} ${order.pincode || ''}\n\n` +
      `📦 *Items:*\n${itemsText}\n\n` +
      `Subtotal: ₹${order.subtotal}\n` +
      `GST (${order.gstRate}%): ₹${order.taxAmount}\n` +
      `Shipping: ₹${order.shippingFee}\n` +
      `💰 *Grand Total: ₹${order.total}*\n` +
      `💳 *Payment Method:* ${order.paymentMethod} (${order.paymentStatus})\n` +
      (order.resellerCommission ? `🎁 *Reseller Commission:* ₹${order.resellerCommission}\n` : '') +
      `--------------------------------\n` +
      `Please confirm order preparation and dispatch tracking!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const generateWhatsAppChatLink = (message = "Hello ECOMART GIFTS PLACE! I'd like to enquire about gifts, bulk corporate orders, or reseller pricing."): string => {
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <StoreContext.Provider value={{
      language,
      setLanguage,
      t,

      currentUser,
      userProfile,
      isAdmin,
      isRetailer,
      isReseller,
      isAuthLoading,
      devAdminBypass,
      toggleDevAdminBypass,
      activeRole,
      setActiveRole: (role: UserRole) => setActiveRoleOverride(role),

      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      sendPasswordReset,
      logout,
      updateCurrentProfile,

      products,
      isLoadingProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      uploadProductImage,

      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount,
      cartSubtotal,
      cartTaxAmount,

      orders,
      isLoadingOrders,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,

      commissions,
      payoutRequests,
      requestPayout,
      processPayoutRequest,

      usersList,
      updateUserStatus,

      inventoryLogs,
      settings,
      updateSettings,

      generateWhatsAppOrderLink,
      generateWhatsAppChatLink,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
