export const mockVendors = [
  { id: 'VEN-101', name: 'Rajesh Kumar', shopName: 'Rajesh Fresh Mart', contact: '+91 98765 43210', email: 'rajesh@freshmart.com', status: 'Active', productsCount: 42, rating: 4.8, category: 'Grocery', joinDate: '2025-01-15' },
  { id: 'VEN-102', name: 'Priya Sharma', shopName: 'Green Leaf Organics', contact: '+91 98123 45678', email: 'priya@greenleaf.in', status: 'Active', productsCount: 28, rating: 4.9, category: 'Organic', joinDate: '2025-02-01' },
  { id: 'VEN-103', name: 'Amit Patel', shopName: 'Tech Hub Spares', contact: '+91 97234 56789', email: 'amit@techhub.com', status: 'Pending', productsCount: 15, rating: 4.3, category: 'Electronics', joinDate: '2025-03-10' },
  { id: 'VEN-104', name: 'Sunita Verma', shopName: 'Ethnic Threads', contact: '+91 96345 67890', email: 'sunita@ethnicthreads.com', status: 'Active', productsCount: 64, rating: 4.7, category: 'Fashion', joinDate: '2025-01-20' },
  { id: 'VEN-105', name: 'Vikram Singh', shopName: 'Apex Tools & Hardware', contact: '+91 95456 78901', email: 'vikram@apextools.io', status: 'Suspended', productsCount: 19, rating: 3.9, category: 'Hardware', joinDate: '2025-02-18' },
  { id: 'VEN-106', name: 'Deepa Roy', shopName: 'Flavor Street Spices', contact: '+91 94567 89012', email: 'deepa@flavorstreet.com', status: 'Active', productsCount: 31, rating: 4.6, category: 'Spices', joinDate: '2025-03-01' }
];

export const mockCustomers = [
  { id: 'CUST-301', name: 'Aarav Mehta', email: 'aarav.m@gmail.com', phone: '+91 99887 76655', status: 'Active', totalOrders: 14, totalSpent: 28450, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', address: '24 MG Road, Indiranagar, Bengaluru' },
  { id: 'CUST-302', name: 'Ananya Deshmukh', email: 'ananya.d@outlook.com', phone: '+91 98776 65544', status: 'Active', totalOrders: 9, totalSpent: 16200, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', address: '102 Park Street, Kolkata' },
  { id: 'CUST-303', name: 'Rohan Kapoor', email: 'rohan.k@yahoo.in', phone: '+91 97665 54433', status: 'Active', totalOrders: 22, totalSpent: 54100, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', address: '45 Connaught Place, New Delhi' },
  { id: 'CUST-304', name: 'Sneha Rao', email: 'sneha.rao@gmail.com', phone: '+91 96554 43322', status: 'Inactive', totalOrders: 3, totalSpent: 4200, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', address: '88 Jubilee Hills, Hyderabad' },
  { id: 'CUST-305', name: 'Kabir Nair', email: 'kabir.nair@hotmail.com', phone: '+91 95443 32211', status: 'Active', totalOrders: 17, totalSpent: 38900, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150', address: '12 Marine Drive, Mumbai' }
];

export const mockProducts = [
  { id: 'PROD-501', name: 'Organic Alphonso Mangoes (1 Dozen)', category: 'Grocery', vendor: 'Rajesh Fresh Mart', price: 899, stock: 45, status: 'In Stock', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300' },
  { id: 'PROD-502', name: 'Cold Pressed Virgin Coconut Oil 500ml', category: 'Organic', vendor: 'Green Leaf Organics', price: 450, stock: 8, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300' },
  { id: 'PROD-503', name: 'Handcrafted Cotton Kurti - Royal Blue', category: 'Fashion', vendor: 'Ethnic Threads', price: 1299, stock: 24, status: 'In Stock', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300' },
  { id: 'PROD-504', name: 'Wireless Bluetooth Earbuds Pro', category: 'Electronics', vendor: 'Tech Hub Spares', price: 2499, stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300' },
  { id: 'PROD-505', name: 'Artisanal Malabar Black Pepper 250g', category: 'Spices', vendor: 'Flavor Street Spices', price: 320, stock: 60, status: 'In Stock', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300' },
  { id: 'PROD-506', name: 'Precision Cordless Power Drill Set', category: 'Hardware', vendor: 'Apex Tools & Hardware', price: 3850, stock: 4, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300' }
];

export const mockCategories = [
  { id: 'CAT-1', name: 'Grocery & Essentials', description: 'Fresh fruits, vegetables, grains, and daily household food items.', productCount: 142, icon: 'ShoppingBag', status: 'Active' },
  { id: 'CAT-2', name: 'Organic & Wellness', description: 'Certified organic produce, herbal teas, and eco-friendly products.', productCount: 88, icon: 'Leaf', status: 'Active' },
  { id: 'CAT-3', name: 'Fashion & Apparel', description: 'Handcrafted sarees, kurtis, men wear, and traditional accessories.', productCount: 210, icon: 'Shirt', status: 'Active' },
  { id: 'CAT-4', name: 'Electronics & Gadgets', description: 'Smart accessories, mobile spares, audio gear, and home gadgets.', productCount: 95, icon: 'Smartphone', status: 'Active' },
  { id: 'CAT-5', name: 'Spices & Condiments', description: 'Authentic regional spices, pickles, pastes, and seasonings.', productCount: 64, icon: 'Flame', status: 'Active' },
  { id: 'CAT-6', name: 'Hardware & Tools', description: 'Construction tools, repair kits, plumbing fixtures, and supplies.', productCount: 52, icon: 'Wrench', status: 'Active' }
];

export const mockOrders = [
  { id: 'ORD-8901', customer: 'Aarav Mehta', vendor: 'Rajesh Fresh Mart', products: 'Organic Mangoes (2x), Malabar Pepper (1x)', totalAmount: 2118, paymentStatus: 'Paid', deliveryStatus: 'Delivered', date: '2026-07-31' },
  { id: 'ORD-8902', customer: 'Ananya Deshmukh', vendor: 'Ethnic Threads', products: 'Cotton Kurti (1x)', totalAmount: 1299, paymentStatus: 'Paid', deliveryStatus: 'Shipped', date: '2026-07-30' },
  { id: 'ORD-8903', customer: 'Rohan Kapoor', vendor: 'Tech Hub Spares', products: 'Bluetooth Earbuds (1x)', totalAmount: 2499, paymentStatus: 'Pending', deliveryStatus: 'Processing', date: '2026-07-30' },
  { id: 'ORD-8904', customer: 'Kabir Nair', vendor: 'Green Leaf Organics', products: 'Virgin Coconut Oil (2x)', totalAmount: 900, paymentStatus: 'Paid', deliveryStatus: 'Pending', date: '2026-07-29' },
  { id: 'ORD-8905', customer: 'Sneha Rao', vendor: 'Flavor Street Spices', products: 'Black Pepper (3x)', totalAmount: 960, paymentStatus: 'Refunded', deliveryStatus: 'Cancelled', date: '2026-07-28' }
];

export const mockPayments = [
  { id: 'TXN-99101', orderId: 'ORD-8901', customer: 'Aarav Mehta', date: '2026-07-31', amount: 2118, method: 'UPI (GPay)', status: 'Success' },
  { id: 'TXN-99102', orderId: 'ORD-8902', customer: 'Ananya Deshmukh', date: '2026-07-30', amount: 1299, method: 'Credit Card', status: 'Success' },
  { id: 'TXN-99103', orderId: 'ORD-8903', customer: 'Rohan Kapoor', date: '2026-07-30', amount: 2499, method: 'Net Banking', status: 'Pending' },
  { id: 'TXN-99104', orderId: 'ORD-8904', customer: 'Kabir Nair', date: '2026-07-29', amount: 900, method: 'UPI (PhonePe)', status: 'Success' },
  { id: 'TXN-99105', orderId: 'ORD-8905', customer: 'Sneha Rao', date: '2026-07-28', amount: 960, method: 'Debit Card', status: 'Refunded' }
];

export const mockRefundRequests = [
  { id: 'REF-701', orderId: 'ORD-8905', customer: 'Sneha Rao', amount: 960, reason: 'Damaged packaging during transit', status: 'Approved', date: '2026-07-28' },
  { id: 'REF-702', orderId: 'ORD-8890', customer: 'Vikram Patel', amount: 1450, reason: 'Delayed delivery requested cancellation', status: 'Under Review', date: '2026-07-27' }
];

export const mockNotifications = [
  { id: 'NOTIF-1', title: 'New Vendor Registration', message: 'Amit Patel registered "Tech Hub Spares" and is awaiting approval.', time: '10 mins ago', type: 'vendor', read: false },
  { id: 'NOTIF-2', title: 'Low Stock Alert', message: 'Cold Pressed Virgin Coconut Oil is down to 8 units.', time: '1 hour ago', type: 'alert', read: false },
  { id: 'NOTIF-3', title: 'High Order Volume', message: 'Over 150 orders placed today in Grocery category.', time: '3 hours ago', type: 'order', read: true },
  { id: 'NOTIF-4', title: 'Refund Requested', message: 'Customer Vikram Patel filed a refund request for ORD-8890.', time: '5 hours ago', type: 'payment', read: true }
];

export const mockActivities = [
  { id: 1, user: 'Admin System', action: 'Approved Vendor "Green Leaf Organics"', time: '20 mins ago', type: 'success' },
  { id: 2, user: 'Aarav Mehta', action: 'Placed Order #ORD-8901 worth ₹2,118', time: '45 mins ago', type: 'info' },
  { id: 3, user: 'Rajesh Kumar', action: 'Updated stock for Organic Mangoes (+50)', time: '2 hours ago', type: 'warning' },
  { id: 4, user: 'Priya Sharma', action: 'Added new product "Organic Honey 250g"', time: '4 hours ago', type: 'info' }
];

export const salesChartData = [
  { month: 'Jan', sales: 450000, orders: 1200, vendors: 24 },
  { month: 'Feb', sales: 520000, orders: 1450, vendors: 28 },
  { month: 'Mar', sales: 610000, orders: 1700, vendors: 35 },
  { month: 'Apr', sales: 580000, orders: 1580, vendors: 38 },
  { month: 'May', sales: 720000, orders: 1950, vendors: 42 },
  { month: 'Jun', sales: 840000, orders: 2200, vendors: 48 },
  { month: 'Jul', sales: 980000, orders: 2650, vendors: 54 }
];
