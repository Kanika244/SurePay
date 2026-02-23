export interface EnterpriseEmployee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  department: string;
  designation: string;
  role: 'Employee' | 'Manager' | 'Finance' | 'Admin';
  dateOfJoining: string;
  employmentType: 'Full-time' | 'Contract' | 'Intern';
  govIdType: 'Aadhaar' | 'PAN' | 'Passport' | 'Other';
  govIdNumber: string;
  profilePhoto?: string;
  documents: { name: string; type: string; uploadedAt: string }[];
  walletBalance: number;
  spendingLimit: number;
  salaryBand?: string;
  status: 'active' | 'suspended';
  kycVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface EnterpriseTransaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  type: 'credit' | 'debit' | 'transfer' | 'salary' | 'reimbursement';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}

export interface EnterpriseProfile {
  companyName: string;
  registrationNumber: string;
  gstNumber: string;
  businessType: string;
  industry: string;
  website: string;
  registeredAddress: string;
  documents: { name: string; type: string; uploadedAt: string; status: 'verified' | 'pending' }[];
  poc: {
    name: string;
    email: string;
    phone: string;
    designation: string;
    kycDocuments: { name: string; type: string; uploadedAt: string }[];
    status: 'verified' | 'pending';
  };
}

export const enterpriseProfile: EnterpriseProfile = {
  companyName: 'Acme Technologies Pvt Ltd',
  registrationNumber: 'U72200KA2020PTC123456',
  gstNumber: '29ABCDE1234F1Z5',
  businessType: 'Private Limited',
  industry: 'Technology',
  website: 'https://acmetech.com',
  registeredAddress: '123 Tech Park, Whitefield, Bangalore, Karnataka 560066',
  documents: [
    { name: 'Certificate of Incorporation.pdf', type: 'Incorporation', uploadedAt: '2024-01-15', status: 'verified' },
    { name: 'GST Certificate.pdf', type: 'GST', uploadedAt: '2024-01-15', status: 'verified' },
    { name: 'PAN Card.pdf', type: 'PAN', uploadedAt: '2024-01-15', status: 'verified' },
    { name: 'Trade License.pdf', type: 'License', uploadedAt: '2024-02-01', status: 'pending' },
  ],
  poc: {
    name: 'Rajesh Kumar',
    email: 'rajesh@acmetech.com',
    phone: '+91 98765 43210',
    designation: 'CFO',
    kycDocuments: [
      { name: 'POC Aadhaar.pdf', type: 'Aadhaar', uploadedAt: '2024-01-15' },
      { name: 'POC PAN.pdf', type: 'PAN', uploadedAt: '2024-01-15' },
    ],
    status: 'verified',
  },
};

export const enterpriseEmployees: EnterpriseEmployee[] = [
  {
    id: 'eemp-001', employeeId: 'ACM-001', firstName: 'Rahul', lastName: 'Verma',
    email: 'rahul.verma@acmetech.com', phone: '+91 98765 11111', dateOfBirth: '1992-05-15',
    gender: 'Male', department: 'Engineering', designation: 'Senior Developer',
    role: 'Employee', dateOfJoining: '2024-01-20', employmentType: 'Full-time',
    govIdType: 'Aadhaar', govIdNumber: '1234 5678 9012',
    documents: [{ name: 'Aadhaar.pdf', type: 'Aadhaar', uploadedAt: '2024-01-20' }, { name: 'PAN.pdf', type: 'PAN', uploadedAt: '2024-01-20' }],
    walletBalance: 25000, spendingLimit: 50000, salaryBand: '₹8L-12L',
    status: 'active', kycVerified: true, twoFactorEnabled: true, lastLogin: '2024-04-01 09:30:00', createdAt: '2024-01-20',
  },
  {
    id: 'eemp-002', employeeId: 'ACM-002', firstName: 'Sneha', lastName: 'Gupta',
    email: 'sneha.gupta@acmetech.com', phone: '+91 98765 22222', dateOfBirth: '1990-08-22',
    gender: 'Female', department: 'Product', designation: 'Product Manager',
    role: 'Manager', dateOfJoining: '2024-01-22', employmentType: 'Full-time',
    govIdType: 'PAN', govIdNumber: 'ABCDE1234F',
    documents: [{ name: 'PAN.pdf', type: 'PAN', uploadedAt: '2024-01-22' }],
    walletBalance: 35000, spendingLimit: 75000, salaryBand: '₹12L-18L',
    status: 'active', kycVerified: true, twoFactorEnabled: false, lastLogin: '2024-04-01 10:15:00', createdAt: '2024-01-22',
  },
  {
    id: 'eemp-003', employeeId: 'ACM-003', firstName: 'Anita', lastName: 'Krishnan',
    email: 'anita@acmetech.com', phone: '+91 98765 33333', dateOfBirth: '1988-12-10',
    gender: 'Female', department: 'Human Resources', designation: 'HR Manager',
    role: 'Admin', dateOfJoining: '2024-01-25', employmentType: 'Full-time',
    govIdType: 'Aadhaar', govIdNumber: '9876 5432 1098',
    documents: [{ name: 'Aadhaar.pdf', type: 'Aadhaar', uploadedAt: '2024-01-25' }],
    walletBalance: 0, spendingLimit: 100000,
    status: 'suspended', kycVerified: true, twoFactorEnabled: true, lastLogin: '2024-03-15 14:00:00', createdAt: '2024-01-25',
  },
  {
    id: 'eemp-004', employeeId: 'ACM-004', firstName: 'Vikram', lastName: 'Patel',
    email: 'vikram.p@acmetech.com', phone: '+91 98765 44444', dateOfBirth: '1995-03-28',
    gender: 'Male', department: 'Engineering', designation: 'Junior Developer',
    role: 'Employee', dateOfJoining: '2024-02-15', employmentType: 'Full-time',
    govIdType: 'PAN', govIdNumber: 'FGHIJ5678K',
    documents: [{ name: 'PAN.pdf', type: 'PAN', uploadedAt: '2024-02-15' }, { name: 'Address Proof.pdf', type: 'Address', uploadedAt: '2024-02-15' }],
    walletBalance: 18000, spendingLimit: 30000, salaryBand: '₹4L-6L',
    status: 'active', kycVerified: false, twoFactorEnabled: false, lastLogin: '2024-04-01 08:45:00', createdAt: '2024-02-15',
  },
  {
    id: 'eemp-005', employeeId: 'ACM-005', firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.s@acmetech.com', phone: '+91 98765 55555', dateOfBirth: '1993-07-14',
    gender: 'Female', department: 'Finance', designation: 'Financial Analyst',
    role: 'Finance', dateOfJoining: '2024-03-01', employmentType: 'Full-time',
    govIdType: 'Passport', govIdNumber: 'J1234567',
    documents: [{ name: 'Passport.pdf', type: 'Passport', uploadedAt: '2024-03-01' }],
    walletBalance: 42000, spendingLimit: 60000, salaryBand: '₹6L-10L',
    status: 'active', kycVerified: true, twoFactorEnabled: true, lastLogin: '2024-04-01 11:00:00', createdAt: '2024-03-01',
  },
  {
    id: 'eemp-006', employeeId: 'ACM-006', firstName: 'Deepak', lastName: 'Nair',
    email: 'deepak.n@acmetech.com', phone: '+91 98765 66666', dateOfBirth: '1991-11-05',
    gender: 'Male', department: 'Operations', designation: 'Operations Lead',
    role: 'Manager', dateOfJoining: '2024-01-30', employmentType: 'Contract',
    govIdType: 'Aadhaar', govIdNumber: '5678 1234 9012',
    documents: [],
    walletBalance: 15000, spendingLimit: 40000,
    status: 'active', kycVerified: false, twoFactorEnabled: false, lastLogin: '2024-03-30 16:30:00', createdAt: '2024-01-30',
  },
  {
    id: 'eemp-007', employeeId: 'ACM-007', firstName: 'Meera', lastName: 'Joshi',
    email: 'meera.j@acmetech.com', phone: '+91 98765 77777', dateOfBirth: '1997-09-20',
    gender: 'Female', department: 'Engineering', designation: 'Intern',
    role: 'Employee', dateOfJoining: '2024-03-15', employmentType: 'Intern',
    govIdType: 'Aadhaar', govIdNumber: '3456 7890 1234',
    documents: [{ name: 'Aadhaar.pdf', type: 'Aadhaar', uploadedAt: '2024-03-15' }],
    walletBalance: 5000, spendingLimit: 10000,
    status: 'active', kycVerified: false, twoFactorEnabled: false, lastLogin: '2024-04-01 09:00:00', createdAt: '2024-03-15',
  },
];

export const enterpriseTransactions: EnterpriseTransaction[] = [
  { id: 'etxn-001', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'eemp-001', receiverName: 'Rahul Verma', amount: 85000, type: 'salary', status: 'completed', timestamp: '2024-04-01 10:30:00', description: 'Salary - April 2024' },
  { id: 'etxn-002', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'eemp-002', receiverName: 'Sneha Gupta', amount: 95000, type: 'salary', status: 'completed', timestamp: '2024-04-01 10:35:00', description: 'Salary - April 2024' },
  { id: 'etxn-003', senderId: 'eemp-004', senderName: 'Vikram Patel', receiverId: 'enterprise', receiverName: 'Acme Technologies', amount: 12500, type: 'reimbursement', status: 'pending', timestamp: '2024-04-01 14:20:00', description: 'Travel reimbursement' },
  { id: 'etxn-004', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'eemp-005', receiverName: 'Priya Sharma', amount: 75000, type: 'salary', status: 'completed', timestamp: '2024-04-01 10:40:00', description: 'Salary - April 2024' },
  { id: 'etxn-005', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'eemp-006', receiverName: 'Deepak Nair', amount: 42000, type: 'transfer', status: 'completed', timestamp: '2024-03-31 09:00:00', description: 'Contract payment - March' },
  { id: 'etxn-006', senderId: 'external', senderName: 'Global Logistics Corp', receiverId: 'enterprise', receiverName: 'Acme Technologies', amount: 250000, type: 'credit', status: 'completed', timestamp: '2024-04-01 14:20:00', description: 'Invoice Payment #INV-2024-089' },
  { id: 'etxn-007', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'eemp-007', receiverName: 'Meera Joshi', amount: 15000, type: 'salary', status: 'completed', timestamp: '2024-04-01 10:45:00', description: 'Stipend - April 2024' },
  { id: 'etxn-008', senderId: 'eemp-001', senderName: 'Rahul Verma', receiverId: 'eemp-002', receiverName: 'Sneha Gupta', amount: 5000, type: 'transfer', status: 'completed', timestamp: '2024-03-30 15:30:00', description: 'Personal transfer' },
  { id: 'etxn-009', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'vendor', receiverName: 'AWS India', amount: 125000, type: 'debit', status: 'completed', timestamp: '2024-03-28 11:00:00', description: 'Cloud infrastructure - March' },
  { id: 'etxn-010', senderId: 'enterprise', senderName: 'Acme Technologies', receiverId: 'eemp-004', receiverName: 'Vikram Patel', amount: 8000, type: 'reimbursement', status: 'failed', timestamp: '2024-03-25 16:00:00', description: 'Expense claim rejected' },
];

export const departments = ['Engineering', 'Product', 'Human Resources', 'Finance', 'Operations', 'Marketing', 'Sales'];

export const csvTemplateHeaders = [
  'First Name', 'Last Name', 'Employee ID', 'Email', 'Phone', 'Department',
  'Designation', 'Role', 'Date of Joining', 'Government ID Type',
  'Government ID Number', 'Initial Wallet Credit', 'Spending Limit',
];

export const sampleCSVData = `First Name,Last Name,Employee ID,Email,Phone,Department,Designation,Role,Date of Joining,Government ID Type,Government ID Number,Initial Wallet Credit,Spending Limit
John,Doe,ACM-100,john.doe@acmetech.com,+91 99999 11111,Engineering,Software Engineer,Employee,2024-05-01,Aadhaar,1111 2222 3333,10000,30000
Jane,Smith,ACM-101,jane.smith@acmetech.com,+91 99999 22222,Product,Product Analyst,Employee,2024-05-01,PAN,ABCDE1234F,15000,40000`;