// Mock data for Admin Dashboard

export interface Enterprise {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  walletBalance: number;
  createdAt: string;
  address: string;
  industry: string;
  companyType: string;
  country: string;
  documents: { name: string; type: string; uploadedAt: string }[];
  poc: {
    name: string;
    email: string;
    phone: string;
    designation: string;
    status: 'verified' | 'pending';
  };
}

export interface Employee {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  walletBalance: number;
  createdAt: string;
  documents: { name: string; type: string; uploadedAt: string }[];
}

export interface Individual {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  walletBalance: number;
  kycStatus: 'verified' | 'pending' | 'rejected';
  createdAt: string;
  documents: { name: string; type: string; uploadedAt: string }[];
}

export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'enterprise' | 'employee' | 'individual';
  receiverId: string;
  receiverName: string;
  receiverType: 'enterprise' | 'employee' | 'individual';
  amount: number;
  type: 'credit' | 'debit' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'enterprise' | 'employee' | 'individual' | 'wallet' | 'system';
  targetId: string;
  details: string;
  timestamp: string;
}

export const mockEnterprises: Enterprise[] = [
  {
    id: 'ent-001',
    name: 'Acme Technologies Pvt Ltd',
    email: 'admin@acmetech.com',
    status: 'active',
    walletBalance: 1245678,
    createdAt: '2024-01-15',
    address: '123 Tech Park, Bangalore, Karnataka 560001',
    industry: 'Technology',
    companyType: 'Private Limited',
    country: 'India',
    documents: [
      { name: 'GST Certificate.pdf', type: 'GST', uploadedAt: '2024-01-15' },
      { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-01-15' },
    ],
    poc: {
      name: 'Rajesh Kumar',
      email: 'rajesh@acmetech.com',
      phone: '+91 98765 43210',
      designation: 'CFO',
      status: 'verified',
    },
  },
  {
    id: 'ent-002',
    name: 'Global Logistics Corp',
    email: 'finance@globallogistics.com',
    status: 'active',
    walletBalance: 856000,
    createdAt: '2024-02-20',
    address: '456 Industrial Area, Mumbai, Maharashtra 400001',
    industry: 'Logistics',
    companyType: 'LLP',
    country: 'India',
    documents: [
      { name: 'GST Certificate.pdf', type: 'GST', uploadedAt: '2024-02-20' },
    ],
    poc: {
      name: 'Priya Sharma',
      email: 'priya@globallogistics.com',
      phone: '+91 87654 32109',
      designation: 'Finance Manager',
      status: 'verified',
    },
  },
  {
    id: 'ent-003',
    name: 'Fresh Foods India',
    email: 'accounts@freshfoods.in',
    status: 'suspended',
    walletBalance: 0,
    createdAt: '2024-03-10',
    address: '789 Market Street, Delhi 110001',
    industry: 'Food & Beverage',
    companyType: 'Partnership',
    country: 'India',
    documents: [],
    poc: {
      name: 'Amit Singh',
      email: 'amit@freshfoods.in',
      phone: '+91 76543 21098',
      designation: 'Owner',
      status: 'pending',
    },
  },
  {
    id: 'ent-004',
    name: 'TechStart Solutions',
    email: 'hello@techstart.io',
    status: 'pending',
    walletBalance: 50000,
    createdAt: '2024-04-05',
    address: '321 Startup Hub, Hyderabad, Telangana 500001',
    industry: 'Technology',
    companyType: 'Private Limited',
    country: 'India',
    documents: [
      { name: 'Incorporation Certificate.pdf', type: 'Incorporation', uploadedAt: '2024-04-05' },
    ],
    poc: {
      name: 'Neha Patel',
      email: 'neha@techstart.io',
      phone: '+91 65432 10987',
      designation: 'CEO',
      status: 'pending',
    },
  },
  {
    id: 'ent-005',
    name: 'Green Energy Systems',
    email: 'contact@greenenergy.com',
    status: 'active',
    walletBalance: 2340000,
    createdAt: '2024-01-25',
    address: '555 Solar Park, Chennai, Tamil Nadu 600001',
    industry: 'Energy',
    companyType: 'Private Limited',
    country: 'India',
    documents: [
      { name: 'GST Certificate.pdf', type: 'GST', uploadedAt: '2024-01-25' },
      { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-01-25' },
      { name: 'Trade License.pdf', type: 'License', uploadedAt: '2024-01-25' },
    ],
    poc: {
      name: 'Vikram Reddy',
      email: 'vikram@greenenergy.com',
      phone: '+91 54321 09876',
      designation: 'Director',
      status: 'verified',
    },
  },
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    enterpriseId: 'ent-001',
    enterpriseName: 'Acme Technologies Pvt Ltd',
    name: 'Rahul Verma',
    email: 'rahul.verma@acmetech.com',
    phone: '+91 98765 11111',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'active',
    walletBalance: 25000,
    createdAt: '2024-01-20',
    documents: [
      { name: 'Aadhaar.pdf', type: 'Aadhaar', uploadedAt: '2024-01-20' },
    ],
  },
  {
    id: 'emp-002',
    enterpriseId: 'ent-001',
    enterpriseName: 'Acme Technologies Pvt Ltd',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@acmetech.com',
    phone: '+91 98765 22222',
    role: 'Product Manager',
    department: 'Product',
    status: 'active',
    walletBalance: 35000,
    createdAt: '2024-01-22',
    documents: [
      { name: 'PAN.pdf', type: 'PAN', uploadedAt: '2024-01-22' },
    ],
  },
  {
    id: 'emp-003',
    enterpriseId: 'ent-002',
    enterpriseName: 'Global Logistics Corp',
    name: 'Karan Malhotra',
    email: 'karan@globallogistics.com',
    phone: '+91 87654 11111',
    role: 'Operations Lead',
    department: 'Operations',
    status: 'active',
    walletBalance: 18000,
    createdAt: '2024-02-25',
    documents: [],
  },
  {
    id: 'emp-004',
    enterpriseId: 'ent-001',
    enterpriseName: 'Acme Technologies Pvt Ltd',
    name: 'Anita Krishnan',
    email: 'anita@acmetech.com',
    phone: '+91 98765 33333',
    role: 'HR Manager',
    department: 'Human Resources',
    status: 'inactive',
    walletBalance: 0,
    createdAt: '2024-01-25',
    documents: [
      { name: 'Aadhaar.pdf', type: 'Aadhaar', uploadedAt: '2024-01-25' },
    ],
  },
  {
    id: 'emp-005',
    enterpriseId: 'ent-005',
    enterpriseName: 'Green Energy Systems',
    name: 'Deepak Nair',
    email: 'deepak@greenenergy.com',
    phone: '+91 54321 11111',
    role: 'Engineer',
    department: 'Technical',
    status: 'active',
    walletBalance: 42000,
    createdAt: '2024-02-01',
    documents: [],
  },
];

export const mockIndividuals: Individual[] = [
  {
    id: 'ind-001',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@gmail.com',
    phone: '+91 99887 76655',
    status: 'active',
    walletBalance: 15600,
    kycStatus: 'verified',
    createdAt: '2024-01-10',
    documents: [
      { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-01-10' },
      { name: 'Aadhaar Card.pdf', type: 'Aadhaar', uploadedAt: '2024-01-10' },
    ],
  },
  {
    id: 'ind-002',
    name: 'Meera Joshi',
    email: 'meera.joshi@yahoo.com',
    phone: '+91 88776 65544',
    status: 'active',
    walletBalance: 8900,
    kycStatus: 'verified',
    createdAt: '2024-02-05',
    documents: [
      { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-02-05' },
    ],
  },
  {
    id: 'ind-003',
    name: 'Sanjay Rao',
    email: 'sanjay.rao@outlook.com',
    phone: '+91 77665 54433',
    status: 'suspended',
    walletBalance: 0,
    kycStatus: 'rejected',
    createdAt: '2024-02-15',
    documents: [],
  },
  {
    id: 'ind-004',
    name: 'Kavita Deshmukh',
    email: 'kavita.d@gmail.com',
    phone: '+91 66554 43322',
    status: 'pending',
    walletBalance: 500,
    kycStatus: 'pending',
    createdAt: '2024-03-01',
    documents: [
      { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-03-01' },
    ],
  },
  {
    id: 'ind-005',
    name: 'Rohan Kapoor',
    email: 'rohan.kapoor@gmail.com',
    phone: '+91 55443 32211',
    status: 'active',
    walletBalance: 45000,
    kycStatus: 'verified',
    createdAt: '2024-01-05',
    documents: [
      { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-01-05' },
      { name: 'Aadhaar Card.pdf', type: 'Aadhaar', uploadedAt: '2024-01-05' },
    ],
  },
  {
    id: 'ind-006',
    name: 'Pallavi Nair',
    email: 'pallavi.nair@gmail.com',
    phone: '+91 44332 21100',
    status: 'active',
    walletBalance: 22500,
    kycStatus: 'verified',
    createdAt: '2024-02-20',
    documents: [
      { name: 'Passport.pdf', type: 'Passport', uploadedAt: '2024-02-20' },
    ],
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    senderId: 'ent-001',
    senderName: 'Acme Technologies Pvt Ltd',
    senderType: 'enterprise',
    receiverId: 'emp-001',
    receiverName: 'Rahul Verma',
    receiverType: 'employee',
    amount: 85000,
    type: 'transfer',
    status: 'completed',
    timestamp: '2024-04-01 10:30:00',
    description: 'Salary - April 2024',
  },
  {
    id: 'txn-002',
    senderId: 'ind-001',
    senderName: 'Arjun Mehta',
    senderType: 'individual',
    receiverId: 'ind-002',
    receiverName: 'Meera Joshi',
    receiverType: 'individual',
    amount: 5000,
    type: 'transfer',
    status: 'completed',
    timestamp: '2024-04-01 11:45:00',
    description: 'Personal transfer',
  },
  {
    id: 'txn-003',
    senderId: 'ent-002',
    senderName: 'Global Logistics Corp',
    senderType: 'enterprise',
    receiverId: 'ent-001',
    receiverName: 'Acme Technologies Pvt Ltd',
    receiverType: 'enterprise',
    amount: 250000,
    type: 'transfer',
    status: 'completed',
    timestamp: '2024-04-01 14:20:00',
    description: 'Invoice Payment #INV-2024-089',
  },
  {
    id: 'txn-004',
    senderId: 'emp-002',
    senderName: 'Sneha Gupta',
    senderType: 'employee',
    receiverId: 'ind-005',
    receiverName: 'Rohan Kapoor',
    receiverType: 'individual',
    amount: 15000,
    type: 'transfer',
    status: 'pending',
    timestamp: '2024-04-01 15:00:00',
    description: 'Freelance payment',
  },
  {
    id: 'txn-005',
    senderId: 'ent-005',
    senderName: 'Green Energy Systems',
    senderType: 'enterprise',
    receiverId: 'emp-005',
    receiverName: 'Deepak Nair',
    receiverType: 'employee',
    amount: 42000,
    type: 'transfer',
    status: 'completed',
    timestamp: '2024-04-01 09:00:00',
    description: 'Expense reimbursement',
  },
  {
    id: 'txn-006',
    senderId: 'ind-004',
    senderName: 'Kavita Deshmukh',
    senderType: 'individual',
    receiverId: 'ent-001',
    receiverName: 'Acme Technologies Pvt Ltd',
    receiverType: 'enterprise',
    amount: 12000,
    type: 'transfer',
    status: 'failed',
    timestamp: '2024-04-01 16:30:00',
    description: 'Product purchase',
  },
  {
    id: 'txn-007',
    senderId: 'ent-001',
    senderName: 'Acme Technologies Pvt Ltd',
    senderType: 'enterprise',
    receiverId: 'emp-002',
    receiverName: 'Sneha Gupta',
    receiverType: 'employee',
    amount: 95000,
    type: 'transfer',
    status: 'completed',
    timestamp: '2024-04-01 10:35:00',
    description: 'Salary - April 2024',
  },
  {
    id: 'txn-008',
    senderId: 'ind-005',
    senderName: 'Rohan Kapoor',
    senderType: 'individual',
    receiverId: 'ind-006',
    receiverName: 'Pallavi Nair',
    receiverType: 'individual',
    amount: 3500,
    type: 'transfer',
    status: 'completed',
    timestamp: '2024-03-31 18:45:00',
    description: 'Split bill payment',
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    adminId: 'admin-001',
    adminEmail: 'admin@surepay.com',
    action: 'ENTERPRISE_SUSPENDED',
    targetType: 'enterprise',
    targetId: 'ent-003',
    details: 'Suspended enterprise "Fresh Foods India" due to policy violation',
    timestamp: '2024-04-01 14:30:00',
  },
  {
    id: 'log-002',
    adminId: 'admin-001',
    adminEmail: 'admin@surepay.com',
    action: 'WALLET_CREDITED',
    targetType: 'wallet',
    targetId: 'ent-001',
    details: 'Credited ₹5,00,000 to Acme Technologies wallet',
    timestamp: '2024-04-01 11:00:00',
  },
  {
    id: 'log-003',
    adminId: 'admin-001',
    adminEmail: 'admin@surepay.com',
    action: 'INDIVIDUAL_CREATED',
    targetType: 'individual',
    targetId: 'ind-006',
    details: 'Created new individual user "Pallavi Nair"',
    timestamp: '2024-03-31 16:20:00',
  },
  {
    id: 'log-004',
    adminId: 'admin-001',
    adminEmail: 'admin@surepay.com',
    action: 'EMPLOYEE_DEACTIVATED',
    targetType: 'employee',
    targetId: 'emp-004',
    details: 'Deactivated employee "Anita Krishnan" from Acme Technologies',
    timestamp: '2024-03-30 10:15:00',
  },
  {
    id: 'log-005',
    adminId: 'admin-001',
    adminEmail: 'admin@surepay.com',
    action: 'WALLET_FROZEN',
    targetType: 'wallet',
    targetId: 'ind-003',
    details: 'Frozen wallet for "Sanjay Rao" pending investigation',
    timestamp: '2024-03-29 09:00:00',
  },
];

// Analytics data
export const analyticsData = {
  totalEnterprises: mockEnterprises.length,
  totalEmployees: mockEmployees.length,
  totalIndividuals: mockIndividuals.length,
  totalWalletBalance: mockEnterprises.reduce((sum, e) => sum + e.walletBalance, 0) +
    mockEmployees.reduce((sum, e) => sum + e.walletBalance, 0) +
    mockIndividuals.reduce((sum, i) => sum + i.walletBalance, 0),
  totalTransactions: mockTransactions.length,
  moneySentVsReceived: [
    { month: 'Jan', sent: 1250000, received: 980000 },
    { month: 'Feb', sent: 1450000, received: 1200000 },
    { month: 'Mar', sent: 1680000, received: 1450000 },
    { month: 'Apr', sent: 1920000, received: 1680000 },
  ],
  transactionsPerDay: [
    { date: '2024-03-26', count: 45 },
    { date: '2024-03-27', count: 52 },
    { date: '2024-03-28', count: 38 },
    { date: '2024-03-29', count: 61 },
    { date: '2024-03-30', count: 28 },
    { date: '2024-03-31', count: 55 },
    { date: '2024-04-01', count: 72 },
  ],
  walletDistribution: [
    { name: 'Enterprises', value: mockEnterprises.reduce((sum, e) => sum + e.walletBalance, 0) },
    { name: 'Employees', value: mockEmployees.reduce((sum, e) => sum + e.walletBalance, 0) },
    { name: 'Individuals', value: mockIndividuals.reduce((sum, i) => sum + i.walletBalance, 0) },
  ],
  topEnterprisesByVolume: [
    { name: 'Acme Technologies', volume: 4500000 },
    { name: 'Green Energy Systems', volume: 3200000 },
    { name: 'Global Logistics', volume: 2100000 },
    { name: 'TechStart Solutions', volume: 850000 },
    { name: 'Fresh Foods India', volume: 320000 },
  ],
};