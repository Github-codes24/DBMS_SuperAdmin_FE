export const platformInfo = {
  name: 'Local Trade Street',
  tagline: "India's Trusted Business Directory",
  description: "Find the best local services, businesses, and trending categories near you on Local Trade Street. Discover top-rated vendors and trusted local providers.",
  mission: 'Connecting local traders, vendors, SMEs & service providers with digital-first customers across India.',
  headquarters: 'Nagpur, Maharashtra, India',
  supportEmail: 'support@localtradestreet.com',
  supportHotline: '+91 712-299-1000',
  website: 'https://localtradestreet.com/'
};

export const vendorInfo = {
  vendorId: 'VEN-88204',
  shopName: 'Rajesh Central Mart',
  ownerName: 'Rajesh Kumar',
  gstNumber: '27ABCDE1234F1ZH',
  phone: '+91 98765 43210',
  email: 'rajesh@lts.com',
  category: 'Grocery & Organic Produce',
  address: 'Plot #42, Commercial Zone, Wardha Road, Nagpur, Maharashtra 440015',
  city: 'Nagpur',
  state: 'Maharashtra',
  rating: 4.8,
  reviewsCount: 342,
  joinedDate: '15 Jan 2025',
  logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
  bankAccount: 'HDFC Bank - •••• 4892',
  status: 'Verified Partner'
};

export const vendorKPIs = {
  totalProducts: 48,
  activeProducts: 42,
  ordersToday: 28,
  pendingOrders: 7,
  completedOrders: 1450,
  monthlyRevenue: 384500,
  growthPercent: '+18.4%'
};

export const vendorProducts = [
  {
    id: 'VPROD-101',
    sku: 'LTS-GRO-001',
    name: 'Organic Alphonso Mangoes (1 Dozen)',
    category: 'Grocery',
    price: 899,
    discount: 10,
    effectivePrice: 809,
    stock: 45,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300',
    description: 'Naturally ripened, premium Devgad Alphonso mangoes direct from organic orchards in Ratnagiri.',
    sales: 320
  },
  {
    id: 'VPROD-102',
    sku: 'LTS-ORG-002',
    name: 'Cold Pressed Virgin Coconut Oil 500ml',
    category: 'Organic',
    price: 450,
    discount: 5,
    effectivePrice: 427,
    stock: 8,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300',
    description: '100% pure raw unrefined coconut oil extracted using traditional wood-pressing methods.',
    sales: 184
  },
  {
    id: 'VPROD-103',
    sku: 'LTS-SPI-003',
    name: 'Artisanal Malabar Black Pepper 250g',
    category: 'Spices',
    price: 320,
    discount: 0,
    effectivePrice: 320,
    stock: 65,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300',
    description: 'Single-origin high-aroma whole black pepper berries harvested from Wayanad estates.',
    sales: 412
  },
  {
    id: 'VPROD-104',
    sku: 'LTS-GRO-004',
    name: 'Farm Fresh Organic Honey 500g',
    category: 'Grocery',
    price: 599,
    discount: 15,
    effectivePrice: 509,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300',
    description: 'Unprocessed wild forest raw honey rich in natural enzymes and antioxidants.',
    sales: 290
  },
  {
    id: 'VPROD-105',
    sku: 'LTS-ORG-005',
    name: 'Himalayan Pink Rock Salt 1kg',
    category: 'Organic',
    price: 180,
    discount: 0,
    effectivePrice: 180,
    stock: 120,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300',
    description: 'Pure mineral-rich natural pink salt crystals crushed directly from ancient salt beds.',
    sales: 560
  },
  {
    id: 'VPROD-106',
    sku: 'LTS-GRO-006',
    name: 'Pure Desi A2 Gir Cow Ghee 500ml',
    category: 'Grocery',
    price: 1150,
    discount: 8,
    effectivePrice: 1058,
    stock: 5,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=300',
    description: 'Traditional Bilona churned A2 ghee made from grass-fed Gir cows.',
    sales: 210
  }
];

export const vendorOrders = [
  {
    id: 'ORD-9401',
    customer: 'Aarav Mehta',
    phone: '+91 99887 76655',
    email: 'aarav.m@gmail.com',
    products: 'Organic Alphonso Mangoes (2x), Malabar Black Pepper (1x)',
    itemsCount: 3,
    amount: 1938,
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    date: '2026-08-04',
    time: '09:24 AM'
  },
  {
    id: 'ORD-9402',
    customer: 'Ananya Deshmukh',
    phone: '+91 98776 65544',
    email: 'ananya.d@outlook.com',
    products: 'Cold Pressed Virgin Coconut Oil (1x)',
    itemsCount: 1,
    amount: 427,
    paymentStatus: 'Paid',
    deliveryStatus: 'Confirmed',
    date: '2026-08-04',
    time: '08:15 AM'
  },
  {
    id: 'ORD-9403',
    customer: 'Rohan Kapoor',
    phone: '+91 97665 54433',
    email: 'rohan.k@yahoo.in',
    products: 'Desi A2 Gir Cow Ghee (2x), Pink Salt (1x)',
    itemsCount: 3,
    amount: 2296,
    paymentStatus: 'Pending',
    deliveryStatus: 'Pending',
    date: '2026-08-03',
    time: '06:45 PM'
  },
  {
    id: 'ORD-9404',
    customer: 'Sneha Rao',
    phone: '+91 96554 43322',
    email: 'sneha.rao@gmail.com',
    products: 'Organic Alphonso Mangoes (1x)',
    itemsCount: 1,
    amount: 809,
    paymentStatus: 'Paid',
    deliveryStatus: 'Delivered',
    date: '2026-08-03',
    time: '02:10 PM'
  },
  {
    id: 'ORD-9405',
    customer: 'Kabir Nair',
    phone: '+91 95443 32211',
    email: 'kabir.nair@hotmail.com',
    products: 'Artisanal Malabar Black Pepper (3x)',
    itemsCount: 3,
    amount: 960,
    paymentStatus: 'Failed',
    deliveryStatus: 'Cancelled',
    date: '2026-08-02',
    time: '11:05 AM'
  }
];

export const vendorCustomers = [
  {
    id: 'CUST-301',
    name: 'Aarav Mehta',
    phone: '+91 99887 76655',
    email: 'aarav.m@gmail.com',
    orders: 14,
    totalSpent: 28450,
    status: 'Active',
    lastOrder: '2026-08-04',
    location: 'Nagpur, Maharashtra'
  },
  {
    id: 'CUST-302',
    name: 'Ananya Deshmukh',
    phone: '+91 98776 65544',
    email: 'ananya.d@outlook.com',
    orders: 9,
    totalSpent: 16200,
    status: 'Active',
    lastOrder: '2026-08-04',
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'CUST-303',
    name: 'Rohan Kapoor',
    phone: '+91 97665 54433',
    email: 'rohan.k@yahoo.in',
    orders: 22,
    totalSpent: 54100,
    status: 'Active',
    lastOrder: '2026-08-03',
    location: 'Pune, Maharashtra'
  },
  {
    id: 'CUST-304',
    name: 'Sneha Rao',
    phone: '+91 96554 43322',
    email: 'sneha.rao@gmail.com',
    orders: 3,
    totalSpent: 4200,
    status: 'Inactive',
    lastOrder: '2026-08-03',
    location: 'Hyderabad, Telangana'
  },
  {
    id: 'CUST-305',
    name: 'Kabir Nair',
    phone: '+91 95443 32211',
    email: 'kabir.nair@hotmail.com',
    orders: 17,
    totalSpent: 38900,
    status: 'Active',
    lastOrder: '2026-08-02',
    location: 'Bengaluru, Karnataka'
  }
];

export const vendorInventory = [
  {
    id: 'VPROD-101',
    product: 'Organic Alphonso Mangoes (1 Dozen)',
    sku: 'LTS-GRO-001',
    currentStock: 45,
    minimumStock: 15,
    incomingStock: 100,
    status: 'In Stock',
    unit: 'Dozen'
  },
  {
    id: 'VPROD-102',
    product: 'Cold Pressed Virgin Coconut Oil 500ml',
    sku: 'LTS-ORG-002',
    currentStock: 8,
    minimumStock: 20,
    incomingStock: 50,
    status: 'Low Stock',
    unit: 'Bottles'
  },
  {
    id: 'VPROD-103',
    product: 'Artisanal Malabar Black Pepper 250g',
    sku: 'LTS-SPI-003',
    currentStock: 65,
    minimumStock: 25,
    incomingStock: 0,
    status: 'In Stock',
    unit: 'Packs'
  },
  {
    id: 'VPROD-104',
    product: 'Farm Fresh Organic Honey 500g',
    sku: 'LTS-GRO-004',
    currentStock: 0,
    minimumStock: 15,
    incomingStock: 40,
    status: 'Out of Stock',
    unit: 'Jars'
  },
  {
    id: 'VPROD-105',
    product: 'Himalayan Pink Rock Salt 1kg',
    sku: 'LTS-ORG-005',
    currentStock: 120,
    minimumStock: 30,
    incomingStock: 0,
    status: 'In Stock',
    unit: 'Packs'
  },
  {
    id: 'VPROD-106',
    product: 'Pure Desi A2 Gir Cow Ghee 500ml',
    sku: 'LTS-GRO-006',
    currentStock: 5,
    minimumStock: 10,
    incomingStock: 25,
    status: 'Low Stock',
    unit: 'Bottles'
  }
];

export const vendorSalesData = {
  todaySales: 34850,
  weeklySales: 186400,
  monthlySales: 384500,
  totalRevenue: 2450000,
  monthlyRevenueChart: [
    { month: 'Feb', revenue: 210000, orders: 340 },
    { month: 'Mar', revenue: 260000, orders: 410 },
    { month: 'Apr', revenue: 290000, orders: 460 },
    { month: 'May', revenue: 320000, orders: 510 },
    { month: 'Jun', revenue: 350000, orders: 580 },
    { month: 'Jul', revenue: 384500, orders: 640 }
  ],
  ordersTrendChart: [
    { day: 'Mon', orders: 42, revenue: 24500 },
    { day: 'Tue', orders: 58, revenue: 31200 },
    { day: 'Wed', orders: 50, revenue: 28900 },
    { day: 'Thu', orders: 64, revenue: 36800 },
    { day: 'Fri', orders: 75, revenue: 42100 },
    { day: 'Sat', orders: 88, revenue: 51400 },
    { day: 'Sun', orders: 92, revenue: 54900 }
  ],
  topSellingProducts: [
    { name: 'Organic Alphonso Mangoes', salesCount: 320, totalRevenue: 258880, percentage: '38%' },
    { name: 'Malabar Black Pepper 250g', salesCount: 412, totalRevenue: 131840, percentage: '26%' },
    { name: 'Cold Pressed Coconut Oil', salesCount: 184, totalRevenue: 78568, percentage: '18%' },
    { name: 'A2 Gir Cow Ghee 500ml', salesCount: 210, totalRevenue: 222180, percentage: '18%' }
  ]
};

export const vendorNotifications = [
  {
    id: 'NOT-1',
    category: 'New Orders',
    title: 'New Order Received #ORD-9401',
    message: 'Customer Aarav Mehta placed an order worth ₹1,938 for 3 items.',
    time: '12 mins ago',
    type: 'order',
    unread: true
  },
  {
    id: 'NOT-2',
    category: 'Stock Alerts',
    title: 'Low Stock Warning',
    message: 'Cold Pressed Virgin Coconut Oil is down to 8 units. Minimum threshold is 20.',
    time: '1 hour ago',
    type: 'alert',
    unread: true
  },
  {
    id: 'NOT-3',
    category: 'Payment Received',
    title: 'Payout Settlement Credited',
    message: 'Weekly payout of ₹84,250 has been transferred to your HDFC Bank Account.',
    time: '3 hours ago',
    type: 'payment',
    unread: false
  },
  {
    id: 'NOT-4',
    category: 'Directory Listing',
    title: 'Local Trade Street Spotlight Badge',
    message: "Your store in Nagpur central zone was featured in India's Trusted Business Directory spotlight.",
    time: '5 hours ago',
    type: 'system',
    unread: false
  }
];

export const vendorHelpData = {
  faqs: [
    { q: 'How do I add new products to my catalog?', a: 'Navigate to "04 Add Product" screen, fill in product details including SKU, price, stock, images, and click "Save Product".' },
    { q: 'When do I get my sales payouts?', a: 'Payouts are processed weekly every Monday directly to your registered bank account for all delivered orders.' },
    { q: 'How are shipping and logistics handled?', a: 'LTS logistics partners pick up prepared packages directly from your registered store address.' },
    { q: 'What happens when a product goes out of stock?', a: 'The product status updates to "Out of Stock" automatically and hides order buttons on the consumer marketplace.' }
  ],
  supportContact: {
    hotline: '+91 712-299-1000 (Nagpur HQ)',
    email: 'support@localtradestreet.com',
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
    headquarters: 'Nagpur, Maharashtra, India'
  }
};
