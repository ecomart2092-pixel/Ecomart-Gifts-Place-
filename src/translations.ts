export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Taglines
  brandTagline: {
    en: 'Curated Luxury & Corporate Gifting',
    hi: 'शानदार उपहार एवं कॉर्पोरेट गिफ्टिंग',
  },
  topAnnouncement: {
    en: 'Luxury Artisanal Hampers, Corporate Keepsakes & Wedding Favors • PAN India Dispatch',
    hi: 'शाही हैंपर्स, कॉर्पोरेट उपहार एवं विवाह तोहफे • पूरे भारत में सुरक्षित डिलीवरी',
  },
  curatedGifting: {
    en: 'Curated Gifting',
    hi: 'चुनिंदा तोहफे',
  },
  signedInAs: {
    en: 'Signed in as:',
    hi: 'लॉग इन किया गया:',
  },
  openDashboard: {
    en: 'Open Dashboard',
    hi: 'डैशबोर्ड खोलें',
  },

  // Navigation & Portals
  retailerPortal: {
    en: 'Retailer Portal',
    hi: 'रिटेलर पोर्टल',
  },
  resellerPortal: {
    en: 'Reseller Portal',
    hi: 'रीसेलर पोर्टल',
  },
  retailerDesk: {
    en: 'Retailer Desk',
    hi: 'रिटेलर डेस्क',
  },
  resellerDesk: {
    en: 'Reseller Desk',
    hi: 'रीसेलर डेस्क',
  },
  adminPanel: {
    en: 'Admin Panel',
    hi: 'एडमिन पैनल',
  },
  cart: {
    en: 'Cart',
    hi: 'कार्ट',
  },
  whatsAppEnquiry: {
    en: 'WhatsApp Enquiry',
    hi: 'व्हाट्सएप पूछताछ',
  },
  searchPlaceholder: {
    en: 'Search luxury hampers, candles, diaries, brass items...',
    hi: 'शाही हैंपर्स, सुगंधित मोमबत्तियां, डायरी, पीतल के उपहार खोजें...',
  },

  // Hero Section
  heroBadge: {
    en: "India's Premier Luxury & Corporate Gifting Hub",
    hi: 'भारत का अग्रणी लक्जरी एवं कॉर्पोरेट उपहार केंद्र',
  },
  heroTitle: {
    en: 'Curated Gifts, Crafted with Elegance.',
    hi: 'सलीके और नफासत से तैयार किए गए चुनिंदा तोहफे।',
  },
  heroDesc: {
    en: 'Handcrafted artisanal hampers, royal dry fruit gift boxes, personalized executive diaries, and eco-friendly treasures for corporate events, weddings, and festive occasions.',
    hi: 'हस्तनिर्मित लक्जरी हैंपर्स, शाही ड्राई फ्रूट बॉक्स, कस्टमाइज्ड डायरी और पर्यावरण अनुकूल उपहार शादी, त्यौहार और कॉर्पोरेट आयोजनों के लिए।',
  },
  freeShippingBanner: {
    en: 'Free Shipping Above',
    hi: 'मुफ्त डिलीवरी न्यूनतम खरीद',
  },
  quickWhatsAppOrders: {
    en: 'Quick WhatsApp Orders',
    hi: 'त्वरित व्हाट्सएप ऑर्डर',
  },
  zeroGatewayFees: {
    en: 'Zero Gateway Fees',
    hi: 'शून्य गेटवे शुल्क',
  },
  customBrandingTitle: {
    en: 'Need customized gift packaging or corporate branding?',
    hi: 'कस्टमाइज्ड गिफ्ट बॉक्स या कॉर्पोरेट लोगो प्रिंटिंग चाहिए?',
  },
  customBrandingDesc: {
    en: 'Order via our direct WhatsApp desk for customized logo engraving, custom greeting cards, and special corporate gifting packages.',
    hi: 'सीधे हमारे व्हाट्सएप डेस्क पर संपर्क करें और लोगो प्रिंटिंग, कस्टमाइज्ड ग्रीटिंग कार्ड्स एवं विशेष डिस्काउंट प्राप्त करें।',
  },
  chatOnWhatsApp: {
    en: 'Chat on WhatsApp',
    hi: 'व्हाट्सएप पर चैट करें',
  },
  viewGiftCart: {
    en: 'View Gift Cart',
    hi: 'गिफ्ट कार्ट देखें',
  },

  // Catalogue & Products
  allGifts: {
    en: 'All Gift Collections',
    hi: 'सभी उपहार संग्रह',
  },
  allItems: {
    en: 'All',
    hi: 'सभी',
  },
  itemsCount: {
    en: 'items',
    hi: 'उत्पाद',
  },
  publicVisitorPricing: {
    en: 'Public visitor pricing. Retailers and Resellers sign in for approved discount pricing.',
    hi: 'सार्वजनिक मूल्य। रिटेलर्स और रीसेलर्स विशेष डिस्काउंट रेट के लिए लॉगिन करें।',
  },
  addToCart: {
    en: 'Add to Cart',
    hi: 'कार्ट में जोड़ें',
  },
  outOfStock: {
    en: 'Out of Stock',
    hi: 'स्टॉक समाप्त',
  },
  onlyLeft: {
    en: 'Only',
    hi: 'केवल',
  },
  unitsLeft: {
    en: 'left',
    hi: 'बचे हैं',
  },
  inStock: {
    en: 'In Stock',
    hi: 'उपलब्ध है',
  },
  resetSearch: {
    en: 'Reset Search',
    hi: 'सर्च रीसेट करें',
  },
  noGiftsFound: {
    en: 'No gifts found',
    hi: 'कोई उपहार नहीं मिला',
  },
  noGiftsFoundDesc: {
    en: 'No products match your search. Try clearing your search or switching categories.',
    hi: 'आपकी खोज से मेल खाता कोई उत्पाद नहीं मिला। सर्च साफ़ करें या श्रेणी बदलें।',
  },
  loadingCatalogue: {
    en: 'Loading live product catalogue...',
    hi: 'उत्पाद कैटलॉग लोड हो रहा है...',
  },
  retailerTier: {
    en: 'Retailer Tier',
    hi: 'रिटेलर मूल्य',
  },
  resellerTier: {
    en: 'Reseller Tier',
    hi: 'रीसेलर मूल्य',
  },
  retailerLoginRegister: {
    en: 'Retailer Login / Register',
    hi: 'रिटेलर लॉगिन / पंजीकरण',
  },
  resellerLoginRegister: {
    en: 'Reseller Login / Register',
    hi: 'रीसेलर लॉगिन / पंजीकरण',
  },
  adminControlPanel: {
    en: 'Admin Control Panel',
    hi: 'एडमिन कंट्रोल पैनल',
  },
  whatsAppSupport: {
    en: 'WhatsApp Support',
    hi: 'व्हाट्सएप सहायता',
  },
  shoppingCart: {
    en: 'Shopping Cart',
    hi: 'शॉपिंग कार्ट',
  },
  orderItems: {
    en: 'Order Items',
    hi: 'ऑर्डर के सामान',
  },
  endCustomerDeliveryAddress: {
    en: 'End Customer Delivery Address',
    hi: 'अंतिम ग्राहक का डिलीवरी पता',
  },
  resellerProfitMargin: {
    en: 'Reseller Profit Margin:',
    hi: 'रीसेलर मुनाफा मार्जिन:',
  },
  resellerProfitMarginDesc: {
    en: 'Add your customer-facing profit margin. This will be added to the customer billing total and recorded in your commission ledger.',
    hi: 'ग्राहक के लिए अपना लाभ मार्जिन जोड़ें। यह कुल बिल में जुड़ेगा और आपके कमीशन खाते में दर्ज होगा।',
  },
  enterMarginAmount: {
    en: 'Enter margin amount (e.g. 500)',
    hi: 'मार्जिन राशि दर्ज करें (उदा. 500)',
  },
  emailForInvoice: {
    en: 'Email (For GST Invoice)',
    hi: 'ईमेल (जीएसटी बिल हेतु)',
  },
  paymentOptionNoGateway: {
    en: 'Payment Option (No Gateway Fees)',
    hi: 'भुगतान विकल्प (शून्य गेटवे शुल्क)',
  },
  instantOrderConfirmation: {
    en: 'Instant Order Confirmation',
    hi: 'तुरंत व्हाट्सएप पुष्टि',
  },
  giftingMessageNotes: {
    en: 'Gifting Message / Notes',
    hi: 'गिफ्ट संदेश / विशेष निर्देश',
  },
  giftingMessagePlaceholder: {
    en: "e.g. Add birthday note: 'Best wishes to Anita!'",
    hi: "उदा. जन्मदिन का नोट जोड़ें: 'अनीता को हार्दिक शुभकामनाएं!'",
  },
  processingOrder: {
    en: 'Processing Order...',
    hi: 'ऑर्डर प्रोसेस हो रहा है...',
  },
  sendConfirmationWhatsApp: {
    en: 'Send Confirmation via WhatsApp',
    hi: 'व्हाट्सएप पर पुष्टि भेजें',
  },
  orderIdLabel: {
    en: 'Order ID:',
    hi: 'ऑर्डर आईडी:',
  },
  invoiceNoLabel: {
    en: 'Invoice No:',
    hi: 'चालान (Invoice) सं.:',
  },
  totalAmountLabel: {
    en: 'Total Amount:',
    hi: 'कुल देय राशि:',
  },
  statusLabel: {
    en: 'Status:',
    hi: 'स्थिति:',
  },

  // Trust Strip
  panIndiaDelivery: {
    en: 'Express PAN India Shipping',
    hi: 'अखिल भारतीय सुपरफास्ट डिलीवरी',
  },
  panIndiaDeliveryDesc: {
    en: 'Shock-resistant insulated tamperproof gift packaging',
    hi: 'सुरक्षित, थर्माकोल इन्सुलेटेड और सुंदर गिफ्ट पैकिंग',
  },
  gstInvoice: {
    en: 'GST Compliant Invoicing',
    hi: 'जीएसटी प्रमाणित पक्का बिल',
  },
  gstInvoiceDesc: {
    en: 'Claim B2B GST tax credit on corporate gifting orders',
    hi: 'कॉर्पोरेट ऑर्डर्स पर पूर्ण जीएसटी इनपुट टैक्स क्रेडिट लें',
  },
  premiumQuality: {
    en: 'Handcrafted Premium Quality',
    hi: '100% शुद्ध हस्तनिर्मित गुणवत्ता',
  },
  premiumQualityDesc: {
    en: '100% natural soy wax, authentic brass & gourmet dry fruits',
    hi: 'प्राकृतिक सोया वैक्स, शुद्ध पीतल और प्रीमियम ड्राई फ्रूट्स',
  },
  whatsAppSupportDesk: {
    en: 'Dedicated WhatsApp Desk',
    hi: 'समर्पित व्हाट्सएप हेल्पलाइन',
  },
  whatsAppSupportDeskDesc: {
    en: 'Direct assistance with live corporate updates',
    hi: 'ऑर्डर ट्रैकिंग और पैकेजिंग सहायता के लिए सीधा संपर्क',
  },

  // Cart & Checkout
  yourGiftCart: {
    en: 'Your Gift Cart',
    hi: 'आपकी गिफ्ट कार्ट',
  },
  cartEmpty: {
    en: 'Your cart is empty',
    hi: 'आपकी कार्ट खाली है',
  },
  cartEmptyDesc: {
    en: 'Explore our curated gift boxes, hampers, candles, and corporate essentials to get started.',
    hi: 'शुरुआत करने के लिए हमारे लक्जरी गिफ्ट हैंपर्स, मोमबत्तियां और डायरी संग्रह देखें।',
  },
  browseCatalogue: {
    en: 'Browse Catalogue',
    hi: 'कैटलॉग देखें',
  },
  customerDetails: {
    en: 'Customer & Shipping Address',
    hi: 'ग्राहक एवं डिलीवरी का पता',
  },
  fullName: {
    en: 'Full Name',
    hi: 'पूरा नाम',
  },
  phoneMobile: {
    en: 'WhatsApp / Mobile Number',
    hi: 'व्हाट्सएप / मोबाइल नंबर',
  },
  deliveryAddress: {
    en: 'Delivery Address',
    hi: 'डिलीवरी का पूरा पता',
  },
  city: {
    en: 'City',
    hi: 'शहर',
  },
  state: {
    en: 'State',
    hi: 'राज्य',
  },
  pincode: {
    en: 'Pincode',
    hi: 'पिनकोड',
  },
  cashOnDelivery: {
    en: 'Cash on Delivery (COD)',
    hi: 'कैश ऑन डिलीवरी (COD)',
  },
  payOnArrival: {
    en: 'Pay Cash/UPI on Arrival',
    hi: 'पार्सल मिलने पर नकद या UPI दें',
  },
  directWhatsApp: {
    en: 'Direct WhatsApp Order',
    hi: 'डायरेक्ट व्हाट्सएप ऑर्डर',
  },
  cartSubtotal: {
    en: 'Cart Subtotal:',
    hi: 'उप-कुल (Subtotal):',
  },
  deliveryCharges: {
    en: 'Delivery Charges:',
    hi: 'डिलीवरी शुल्क:',
  },
  free: {
    en: 'FREE',
    hi: 'मुफ्त',
  },
  grandTotal: {
    en: 'Grand Total:',
    hi: 'कुल देय राशि:',
  },
  orderViaWhatsApp: {
    en: 'Order via WhatsApp',
    hi: 'व्हाट्सएप से ऑर्डर करें',
  },
  confirmCOD: {
    en: 'Confirm & Pay on Delivery',
    hi: 'ऑर्डर कन्फर्म करें (कैश ऑन डिलीवरी)',
  },
  paymentGatewayClosedNotice: {
    en: 'Payment Gateway Closed: 100% Free Direct Ordering (Zero Gateway Charges)',
    hi: 'पेमेंट गेटवे बंद है: 100% सुरक्षित डायरेक्ट ऑर्डरिंग (शून्य गेटवे शुल्क)',
  },
  orderConfirmed: {
    en: 'Order Confirmed!',
    hi: 'ऑर्डर सफलतापूर्वक दर्ज हुआ!',
  },
  orderConfirmedDesc: {
    en: 'Your order has been recorded in the database and inventory has been deducted.',
    hi: 'आपका ऑर्डर डेटाबेस में दर्ज हो गया है और स्टॉक आरक्षित कर लिया गया है।',
  },
  printGSTInvoice: {
    en: 'View & Print GST Tax Invoice',
    hi: 'जीएसटी टैक्स बिल देखें / प्रिंट करें',
  },
  continueShopping: {
    en: 'Continue Shopping',
    hi: 'खरीदारी जारी रखें',
  },
  rightsReserved: {
    en: 'All rights reserved.',
    hi: 'सर्वाधिकार सुरक्षित।',
  },
};
