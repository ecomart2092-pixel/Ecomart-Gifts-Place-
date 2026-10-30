import { Product, StoreSettings } from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 'general',
  businessName: 'ECOMART GIFTS PLACE',
  tradeName: 'EcoMart Corporate & Festive Gifting Solutions',
  gstin: '27AAECE1234F1Z5',
  pan: 'AAECE1234F',
  state: 'Maharashtra',
  stateCode: '27',
  address: 'Unit 402, Green Avenue, Industrial Estate, Andheri East',
  city: 'Mumbai',
  pincode: '400069',
  phone: '+91 98200 12345',
  email: 'ecomart2092@gmail.com',
  whatsappNumber: '919820012345',
  defaultGSTRate: 18,
  invoicePrefix: 'EMG-2026-',
  nextInvoiceNumber: 1042,
  currencySymbol: '₹',
  freeShippingAbove: 999,
  defaultShippingFee: 99,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Artisanal Soy Wax Aroma Candle Gift Box (Set of 4)',
    sku: 'EM-CND-01',
    category: 'Home & Living',
    description: 'Eco-friendly hand-poured soy wax scented candles in reusable ceramic jars. Fragrances include Sandalwood & Amber, French Lavender, Vanilla Cinnamon, and Fresh Jasmine. Packaged in a magnetic-closure kraft gift box with gold foil accent.',
    mrp: 1499,
    retailPrice: 999,
    retailerPrice: 750,
    resellerPrice: 799,
    stockQuantity: 45,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572726729437-3732641194ac?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Eco-Friendly', 'Handcrafted', 'Bestseller'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Royal Heritage Kashmiri Dry Fruits & Honey Luxury Hamper',
    sku: 'EM-HMP-02',
    category: 'Festive Hampers',
    description: 'A lavish assortment of Jumbo California Almonds (200g), Kashmiri Walnut Kernels (200g), Roasted Salted Cashews (200g), and Organic Forest Raw Honey (250g) in traditional handcrafted brass finish jars with an ornate keepsake wooden tray.',
    mrp: 2999,
    retailPrice: 2199,
    retailerPrice: 1699,
    resellerPrice: 1799,
    stockQuantity: 28,
    lowStockThreshold: 8,
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Festive Special', 'Corporate Favorite', 'Premium'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Personalized Vintage Leather Journal & Brass Rollerball Pen',
    sku: 'EM-JRN-03',
    category: 'Executive & Stationery',
    description: 'Full-grain cruelty-free vegetable tanned leather diary with refillable 240 unruled parchment pages. Accompanied by a weighted solid brass rollerball pen. Ideal for executives, corporate onboarding, and personalized birthday gifts.',
    mrp: 1899,
    retailPrice: 1249,
    retailerPrice: 949,
    resellerPrice: 999,
    stockQuantity: 8,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Low Stock', 'Customizable', 'B2B Hit'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Eco-Friendly Bamboo Wireless Charging Desk Organizer',
    sku: 'EM-ORG-04',
    category: 'Eco & Tech',
    description: '100% natural sustainably harvested bamboo multi-compartment station with built-in 15W Qi fast wireless charging pad for smartphones and AirPods, pen slots, and business card dock. Eliminates desk clutter with natural charm.',
    mrp: 2499,
    retailPrice: 1699,
    retailerPrice: 1299,
    resellerPrice: 1350,
    stockQuantity: 34,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Eco-Friendly', 'Corporate Tech'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Handcrafted Ceramic Pastel Teapot & Double Cup Set',
    sku: 'EM-TEA-05',
    category: 'Home & Living',
    description: 'Lead-free stoneware ceramic teapot (650ml) with stainless steel fine mesh tea infuser and 2 matching matte ceramic tea cups. Microwave and dishwasher safe, packaged in an insulated velvet-lined travel keepsake box.',
    mrp: 1799,
    retailPrice: 1199,
    retailerPrice: 899,
    resellerPrice: 950,
    stockQuantity: 19,
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Artisan', 'Housewarming'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Aromatherapy Pure Essential Oil Spa & Wellness Box',
    sku: 'EM-SPA-06',
    category: 'Wellness & Beauty',
    description: 'Rejuvenating self-care kit featuring Cold-Pressed Jojoba carrier oil, 100% therapeutic grade Lavender, Sweet Orange, and Peppermint oils, a natural rose quartz face roller, and handcrafted loofah soap bar.',
    mrp: 2199,
    retailPrice: 1499,
    retailerPrice: 1149,
    resellerPrice: 1199,
    stockQuantity: 4,
    lowStockThreshold: 6,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-5f2122d259c6?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Wellness', 'Low Stock Alert'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Antique Brass Handcrafted Peacock Diya & Dhoop Stand',
    sku: 'EM-DYA-07',
    category: 'Festive Hampers',
    description: 'Heavy gauge pure brass etched peacock oil lamp with engraved dhoop burner dome. Brings traditional auspicious charm to festive pooja rooms, Diwali celebrations, and wedding return gifts.',
    mrp: 1299,
    retailPrice: 849,
    retailerPrice: 599,
    resellerPrice: 650,
    stockQuantity: 52,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1604928141064-207cea6f571f?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Wedding Return', 'Pooja Decor'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Executive Insulated Stainless Steel Tumbler & Coffee Flask Set',
    sku: 'EM-TLS-08',
    category: 'Eco & Tech',
    description: 'Double wall vacuum insulated 18/8 food-grade stainless steel bottle (500ml) with temperature LED touch indicator and 2 matching double-wall travel mugs with leakproof lids. Keeps beverages hot for 12 hours or cold for 24 hours.',
    mrp: 1699,
    retailPrice: 1099,
    retailerPrice: 820,
    resellerPrice: 870,
    stockQuantity: 22,
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
    ],
    isVisible: true,
    isAvailable: true,
    tags: ['Best Value', 'Office Carry'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
