import { Request, Response, Express } from 'express';

export interface Room {
  id: number;
  hostelId: number;
  roomNo: string;
  floor: number;
  sharingType: 'Single' | '2-Share' | '3-Share' | '4-Share';
  totalBeds: number;
  monthlyRent: number;
  hasAC: boolean;
  hasAttachedWashroom: boolean;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  imageUrl?: string;
  photos?: string[];
  notes?: string;
}

export interface Student {
  id: number;
  hostelId: number;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  roomNo: string;
  bedNumber: string;
  sharingType: string;
  monthlyFee: number;
  depositPaid: number;
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  lastPaymentDate?: string;
  checkInDate: string;
  emergencyContact: string;
  guardianName: string;
  guardianPhone: string;
  loginUsername: string;
  tempPasscode: string;
  isActive: boolean;
}

export interface FeePayment {
  id: number;
  hostelId: number;
  studentId: number;
  studentName: string;
  roomNo: string;
  amount: number;
  month: string;
  paymentDate: string;
  paymentMode: 'UPI' | 'CASH' | 'NET_BANKING' | 'CARD';
  transactionRef: string;
  receiptNumber: string;
  notes?: string;
}

export interface QRFeedback {
  id: number;
  hostelId: number;
  category: 'FOOD' | 'CLEANLINESS' | 'WIFI' | 'MAINTENANCE' | 'SECURITY' | 'GENERAL';
  rating: number;
  studentName?: string;
  roomNo?: string;
  message: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
  wardenResponse?: string;
  createdAt: string;
}

export interface HostelNotice {
  id: number;
  hostelId: number;
  title: string;
  content: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  category: string;
  date: string;
  createdAt: string;
}

// Initial seed data
export const seedRooms: Room[] = [
  // Hostel 1 (Sri Venkateshwara Executive Boys Hostel)
  { id: 101, hostelId: 1, roomNo: '101', floor: 1, sharingType: '2-Share', totalBeds: 2, monthlyRent: 9000, hasAC: true, hasAttachedWashroom: true, status: 'FULL', notes: 'East-facing window' },
  { id: 102, hostelId: 1, roomNo: '102', floor: 1, sharingType: '3-Share', totalBeds: 3, monthlyRent: 7500, hasAC: false, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Spacious study desks' },
  { id: 103, hostelId: 1, roomNo: '103', floor: 1, sharingType: 'Single', totalBeds: 1, monthlyRent: 14500, hasAC: true, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Executive single suite' },
  { id: 201, hostelId: 1, roomNo: '201', floor: 2, sharingType: '2-Share', totalBeds: 2, monthlyRent: 9000, hasAC: true, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Balcony access' },
  { id: 202, hostelId: 1, roomNo: '202', floor: 2, sharingType: '3-Share', totalBeds: 3, monthlyRent: 7500, hasAC: false, hasAttachedWashroom: true, status: 'FULL', notes: 'Standard room' },
  { id: 203, hostelId: 1, roomNo: '203', floor: 2, sharingType: '4-Share', totalBeds: 4, monthlyRent: 6000, hasAC: false, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Budget student quad' },
  { id: 301, hostelId: 1, roomNo: '301', floor: 3, sharingType: '2-Share', totalBeds: 2, monthlyRent: 9000, hasAC: true, hasAttachedWashroom: true, status: 'FULL', notes: 'Quiet top floor' },
  { id: 302, hostelId: 1, roomNo: '302', floor: 3, sharingType: '3-Share', totalBeds: 3, monthlyRent: 8500, hasAC: true, hasAttachedWashroom: true, status: 'MAINTENANCE', notes: 'AC compressor servicing' },
  { id: 303, hostelId: 1, roomNo: '303', floor: 3, sharingType: 'Single', totalBeds: 1, monthlyRent: 14500, hasAC: true, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Quiet study room' },

  // Hostel 2 (Ananya Elite Luxury Girls PG)
  { id: 2101, hostelId: 2, roomNo: '101', floor: 1, sharingType: '2-Share', totalBeds: 2, monthlyRent: 10500, hasAC: true, hasAttachedWashroom: true, status: 'FULL', notes: 'Ground floor deluxe' },
  { id: 2102, hostelId: 2, roomNo: '102', floor: 1, sharingType: '2-Share', totalBeds: 2, monthlyRent: 10500, hasAC: true, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Attached wardrobe' },
  { id: 2201, hostelId: 2, roomNo: '201', floor: 2, sharingType: '3-Share', totalBeds: 3, monthlyRent: 8500, hasAC: true, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Balcony view' },
  { id: 2202, hostelId: 2, roomNo: '202', floor: 2, sharingType: 'Single', totalBeds: 1, monthlyRent: 16000, hasAC: true, hasAttachedWashroom: true, status: 'FULL', notes: 'Premium single' },

  // Hostel 3 (Tribe Co-Living Student Hub)
  { id: 3101, hostelId: 3, roomNo: '101', floor: 1, sharingType: '2-Share', totalBeds: 2, monthlyRent: 14500, hasAC: true, hasAttachedWashroom: true, status: 'FULL', notes: 'Club suite' },
  { id: 3102, hostelId: 3, roomNo: '102', floor: 1, sharingType: 'Single', totalBeds: 1, monthlyRent: 22000, hasAC: true, hasAttachedWashroom: true, status: 'AVAILABLE', notes: 'Studio layout' },
];

export const seedStudents: Student[] = [
  // Students in Hostel 1
  {
    id: 1001,
    hostelId: 1,
    name: 'Rahul Sharma',
    rollNo: 'SVB-2026-01',
    email: 'rahul.sharma@college.edu',
    phone: '+91 98765 43210',
    roomNo: '101',
    bedNumber: 'Bed 1',
    sharingType: '2-Share',
    monthlyFee: 9000,
    depositPaid: 4000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-01',
    checkInDate: '2026-01-15',
    emergencyContact: '+91 98765 00001',
    guardianName: 'Dr. Suresh Sharma',
    guardianPhone: '+91 98765 00001',
    loginUsername: 'rahul.svb01',
    tempPasscode: 'svb#9812',
    isActive: true,
  },
  {
    id: 1002,
    hostelId: 1,
    name: 'Vikram Reddy',
    rollNo: 'SVB-2026-02',
    email: 'vikram.reddy@techuni.edu',
    phone: '+91 98765 43211',
    roomNo: '101',
    bedNumber: 'Bed 2',
    sharingType: '2-Share',
    monthlyFee: 9000,
    depositPaid: 4000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-02',
    checkInDate: '2026-02-01',
    emergencyContact: '+91 98765 00002',
    guardianName: 'K. N. Reddy',
    guardianPhone: '+91 98765 00002',
    loginUsername: 'vikram.svb02',
    tempPasscode: 'svb#4412',
    isActive: true,
  },
  {
    id: 1003,
    hostelId: 1,
    name: 'Aditya Verma',
    rollNo: 'SVB-2026-03',
    email: 'aditya.verma@jntu.ac.in',
    phone: '+91 98765 43212',
    roomNo: '102',
    bedNumber: 'Bed 1',
    sharingType: '3-Share',
    monthlyFee: 7500,
    depositPaid: 3500,
    feeStatus: 'PENDING',
    dueDate: '2026-09-05',
    checkInDate: '2026-03-10',
    emergencyContact: '+91 98765 00003',
    guardianName: 'Ramesh Verma',
    guardianPhone: '+91 98765 00003',
    loginUsername: 'aditya.svb03',
    tempPasscode: 'svb#7731',
    isActive: true,
  },
  {
    id: 1004,
    hostelId: 1,
    name: 'Karthik Nair',
    rollNo: 'SVB-2026-04',
    email: 'karthik.nair@bits.edu',
    phone: '+91 98765 43213',
    roomNo: '102',
    bedNumber: 'Bed 2',
    sharingType: '3-Share',
    monthlyFee: 7500,
    depositPaid: 3500,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-03',
    checkInDate: '2026-04-12',
    emergencyContact: '+91 98765 00004',
    guardianName: 'Madhavan Nair',
    guardianPhone: '+91 98765 00004',
    loginUsername: 'karthik.svb04',
    tempPasscode: 'svb#2290',
    isActive: true,
  },
  {
    id: 1005,
    hostelId: 1,
    name: 'Rohan Gupta',
    rollNo: 'SVB-2026-05',
    email: 'rohan.gupta@ou.ac.in',
    phone: '+91 98765 43214',
    roomNo: '201',
    bedNumber: 'Bed 1',
    sharingType: '2-Share',
    monthlyFee: 9000,
    depositPaid: 4000,
    feeStatus: 'OVERDUE',
    dueDate: '2026-08-30',
    checkInDate: '2026-05-01',
    emergencyContact: '+91 98765 00005',
    guardianName: 'Ashok Gupta',
    guardianPhone: '+91 98765 00005',
    loginUsername: 'rohan.svb05',
    tempPasscode: 'svb#5541',
    isActive: true,
  },
  {
    id: 1006,
    hostelId: 1,
    name: 'Sai Krishna',
    rollNo: 'SVB-2026-06',
    email: 'sai.krishna@cbit.ac.in',
    phone: '+91 98765 43215',
    roomNo: '202',
    bedNumber: 'Bed 1',
    sharingType: '3-Share',
    monthlyFee: 7500,
    depositPaid: 3500,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-01',
    checkInDate: '2026-05-15',
    emergencyContact: '+91 98765 00006',
    guardianName: 'V. Krishna Murthy',
    guardianPhone: '+91 98765 00006',
    loginUsername: 'sai.svb06',
    tempPasscode: 'svb#1109',
    isActive: true,
  },
  {
    id: 1007,
    hostelId: 1,
    name: 'Pranav Joshi',
    rollNo: 'SVB-2026-07',
    email: 'pranav.joshi@iiit.ac.in',
    phone: '+91 98765 43216',
    roomNo: '202',
    bedNumber: 'Bed 2',
    sharingType: '3-Share',
    monthlyFee: 7500,
    depositPaid: 3500,
    feeStatus: 'PENDING',
    dueDate: '2026-09-07',
    checkInDate: '2026-06-01',
    emergencyContact: '+91 98765 00007',
    guardianName: 'Hemant Joshi',
    guardianPhone: '+91 98765 00007',
    loginUsername: 'pranav.svb07',
    tempPasscode: 'svb#9034',
    isActive: true,
  },
  {
    id: 1008,
    hostelId: 1,
    name: 'Nikhil Rao',
    rollNo: 'SVB-2026-08',
    email: 'nikhil.rao@mgit.ac.in',
    phone: '+91 98765 43217',
    roomNo: '202',
    bedNumber: 'Bed 3',
    sharingType: '3-Share',
    monthlyFee: 7500,
    depositPaid: 3500,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-08-31',
    checkInDate: '2026-06-15',
    emergencyContact: '+91 98765 00008',
    guardianName: 'Anand Rao',
    guardianPhone: '+91 98765 00008',
    loginUsername: 'nikhil.svb08',
    tempPasscode: 'svb#3487',
    isActive: true,
  },
  {
    id: 1009,
    hostelId: 1,
    name: 'Amit Patel',
    rollNo: 'SVB-2026-09',
    email: 'amit.patel@vnr.edu',
    phone: '+91 98765 43218',
    roomNo: '203',
    bedNumber: 'Bed 1',
    sharingType: '4-Share',
    monthlyFee: 6000,
    depositPaid: 3000,
    feeStatus: 'OVERDUE',
    dueDate: '2026-08-28',
    checkInDate: '2026-07-01',
    emergencyContact: '+91 98765 00009',
    guardianName: 'Bhavin Patel',
    guardianPhone: '+91 98765 00009',
    loginUsername: 'amit.svb09',
    tempPasscode: 'svb#6712',
    isActive: true,
  },
  {
    id: 1010,
    hostelId: 1,
    name: 'Deepanshu Roy',
    rollNo: 'SVB-2026-10',
    email: 'deepanshu.roy@jntu.edu',
    phone: '+91 98765 43219',
    roomNo: '203',
    bedNumber: 'Bed 2',
    sharingType: '4-Share',
    monthlyFee: 6000,
    depositPaid: 3000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-02',
    checkInDate: '2026-07-05',
    emergencyContact: '+91 98765 00010',
    guardianName: 'Subir Roy',
    guardianPhone: '+91 98765 00010',
    loginUsername: 'deep.svb10',
    tempPasscode: 'svb#8123',
    isActive: true,
  },
  {
    id: 1011,
    hostelId: 1,
    name: 'Harish Kumar',
    rollNo: 'SVB-2026-11',
    email: 'harish.k@vasavi.edu',
    phone: '+91 98765 43220',
    roomNo: '203',
    bedNumber: 'Bed 3',
    sharingType: '4-Share',
    monthlyFee: 6000,
    depositPaid: 3000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-04',
    checkInDate: '2026-07-10',
    emergencyContact: '+91 98765 00011',
    guardianName: 'R. Kumar',
    guardianPhone: '+91 98765 00011',
    loginUsername: 'harish.svb11',
    tempPasscode: 'svb#4092',
    isActive: true,
  },
  {
    id: 1012,
    hostelId: 1,
    name: 'Manish Singh',
    rollNo: 'SVB-2026-12',
    email: 'manish.s@cbit.edu',
    phone: '+91 98765 43221',
    roomNo: '301',
    bedNumber: 'Bed 1',
    sharingType: '2-Share',
    monthlyFee: 9000,
    depositPaid: 4000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-01',
    checkInDate: '2026-07-15',
    emergencyContact: '+91 98765 00012',
    guardianName: 'Suraj Singh',
    guardianPhone: '+91 98765 00012',
    loginUsername: 'manish.svb12',
    tempPasscode: 'svb#9201',
    isActive: true,
  },
  {
    id: 1013,
    hostelId: 1,
    name: 'Tarun Teja',
    rollNo: 'SVB-2026-13',
    email: 'tarun.teja@kmit.edu',
    phone: '+91 98765 43222',
    roomNo: '301',
    bedNumber: 'Bed 2',
    sharingType: '2-Share',
    monthlyFee: 9000,
    depositPaid: 4000,
    feeStatus: 'PENDING',
    dueDate: '2026-09-08',
    checkInDate: '2026-08-01',
    emergencyContact: '+91 98765 00013',
    guardianName: 'N. Teja',
    guardianPhone: '+91 98765 00013',
    loginUsername: 'tarun.svb13',
    tempPasscode: 'svb#6619',
    isActive: true,
  },

  // Hostel 2 Students
  {
    id: 2001,
    hostelId: 2,
    name: 'Pooja Hegde',
    rollNo: 'AEL-2026-01',
    email: 'pooja.h@stmarys.edu',
    phone: '+91 98450 11221',
    roomNo: '101',
    bedNumber: 'Bed 1',
    sharingType: '2-Share',
    monthlyFee: 10500,
    depositPaid: 5000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-01',
    checkInDate: '2026-02-10',
    emergencyContact: '+91 98450 00011',
    guardianName: 'Sunita Hegde',
    guardianPhone: '+91 98450 00011',
    loginUsername: 'pooja.ael01',
    tempPasscode: 'ael#3381',
    isActive: true,
  },
  {
    id: 2002,
    hostelId: 2,
    name: 'Sneha Chary',
    rollNo: 'AEL-2026-02',
    email: 'sneha.c@gnits.ac.in',
    phone: '+91 98450 11222',
    roomNo: '101',
    bedNumber: 'Bed 2',
    sharingType: '2-Share',
    monthlyFee: 10500,
    depositPaid: 5000,
    feeStatus: 'PAID',
    dueDate: '2026-09-05',
    lastPaymentDate: '2026-09-02',
    checkInDate: '2026-03-05',
    emergencyContact: '+91 98450 00012',
    guardianName: 'K. Chary',
    guardianPhone: '+91 98450 00012',
    loginUsername: 'sneha.ael02',
    tempPasscode: 'ael#7192',
    isActive: true,
  },
  {
    id: 2003,
    hostelId: 2,
    name: 'Aishwarya Roy',
    rollNo: 'AEL-2026-03',
    email: 'aishwarya.roy@nift.ac.in',
    phone: '+91 98450 11223',
    roomNo: '202',
    bedNumber: 'Bed 1',
    sharingType: 'Single',
    monthlyFee: 16000,
    depositPaid: 8000,
    feeStatus: 'PENDING',
    dueDate: '2026-09-06',
    checkInDate: '2026-04-01',
    emergencyContact: '+91 98450 00013',
    guardianName: 'Prabal Roy',
    guardianPhone: '+91 98450 00013',
    loginUsername: 'aish.ael03',
    tempPasscode: 'ael#4055',
    isActive: true,
  },
];

export const seedFeePayments: FeePayment[] = [
  {
    id: 5001,
    hostelId: 1,
    studentId: 1001,
    studentName: 'Rahul Sharma',
    roomNo: '101',
    amount: 9000,
    month: 'September 2026',
    paymentDate: '2026-09-01T10:15:00Z',
    paymentMode: 'UPI',
    transactionRef: 'UPI/260901/7788912',
    receiptNumber: 'RCP-2026-0901',
    notes: 'Rent + Mess fee cleared',
  },
  {
    id: 5002,
    hostelId: 1,
    studentId: 1002,
    studentName: 'Vikram Reddy',
    roomNo: '101',
    amount: 9000,
    month: 'September 2026',
    paymentDate: '2026-09-02T14:30:00Z',
    paymentMode: 'UPI',
    transactionRef: 'UPI/260902/4412980',
    receiptNumber: 'RCP-2026-0902',
    notes: 'Google Pay transfer',
  },
  {
    id: 5003,
    hostelId: 1,
    studentId: 1004,
    studentName: 'Karthik Nair',
    roomNo: '102',
    amount: 7500,
    month: 'September 2026',
    paymentDate: '2026-09-03T11:00:00Z',
    paymentMode: 'NET_BANKING',
    transactionRef: 'HDFC/NEFT/991204',
    receiptNumber: 'RCP-2026-0903',
    notes: 'Parent netbanking deposit',
  },
  {
    id: 5004,
    hostelId: 1,
    studentId: 1006,
    studentName: 'Sai Krishna',
    roomNo: '202',
    amount: 7500,
    month: 'September 2026',
    paymentDate: '2026-09-01T17:45:00Z',
    paymentMode: 'CASH',
    transactionRef: 'CASH-REC-01',
    receiptNumber: 'RCP-2026-0904',
    notes: 'Direct cash handed at warden counter',
  },
  {
    id: 5005,
    hostelId: 1,
    studentId: 1008,
    studentName: 'Nikhil Rao',
    roomNo: '202',
    amount: 7500,
    month: 'September 2026',
    paymentDate: '2026-08-31T09:20:00Z',
    paymentMode: 'UPI',
    transactionRef: 'UPI/260831/119934',
    receiptNumber: 'RCP-2026-0905',
    notes: 'PhonePe payment',
  },
  {
    id: 5006,
    hostelId: 1,
    studentId: 1010,
    studentName: 'Deepanshu Roy',
    roomNo: '203',
    amount: 6000,
    month: 'September 2026',
    paymentDate: '2026-09-02T19:10:00Z',
    paymentMode: 'UPI',
    transactionRef: 'UPI/260902/882103',
    receiptNumber: 'RCP-2026-0906',
    notes: 'Paytm UPI QR scan',
  },
  {
    id: 5007,
    hostelId: 1,
    studentId: 1011,
    studentName: 'Harish Kumar',
    roomNo: '203',
    amount: 6000,
    month: 'September 2026',
    paymentDate: '2026-09-04T12:00:00Z',
    paymentMode: 'UPI',
    transactionRef: 'UPI/260904/339102',
    receiptNumber: 'RCP-2026-0907',
    notes: 'Paid before due date',
  },
  {
    id: 5008,
    hostelId: 1,
    studentId: 1012,
    studentName: 'Manish Singh',
    roomNo: '301',
    amount: 9000,
    month: 'September 2026',
    paymentDate: '2026-09-01T08:30:00Z',
    paymentMode: 'UPI',
    transactionRef: 'UPI/260901/552109',
    receiptNumber: 'RCP-2026-0908',
    notes: 'Cleared on 1st of month',
  },
];

export const seedQRFeedbacks: QRFeedback[] = [
  {
    id: 7001,
    hostelId: 1,
    category: 'FOOD',
    rating: 5,
    studentName: 'Rahul Sharma',
    roomNo: '101',
    message: 'The Sunday Special Chicken Biryani and Gulab Jamun were awesome! Please keep this quality consistent.',
    status: 'RESOLVED',
    wardenResponse: 'Thank you! Kitchen team under Chef Murthy has been informed of your appreciation.',
    createdAt: '2026-09-03T20:30:00Z',
  },
  {
    id: 7002,
    hostelId: 1,
    category: 'WIFI',
    rating: 3,
    studentName: 'Amit Patel',
    roomNo: '203',
    message: 'WiFi latency is fluctuating between 8 PM and 10 PM on the 2nd floor router.',
    status: 'IN_PROGRESS',
    wardenResponse: 'Airtel broadband engineer visit scheduled for today 3:00 PM to replace 2nd floor access point.',
    createdAt: '2026-09-04T21:15:00Z',
  },
  {
    id: 7003,
    hostelId: 1,
    category: 'MAINTENANCE',
    rating: 4,
    studentName: 'Aditya Verma',
    roomNo: '102',
    message: 'Hot water geyser switch indicator light is flickering in Room 102 attached bath.',
    status: 'ACKNOWLEDGED',
    wardenResponse: 'Electrician Mr. Ramu assigned to inspect after lunch.',
    createdAt: '2026-09-05T07:45:00Z',
  },
  {
    id: 7004,
    hostelId: 1,
    category: 'CLEANLINESS',
    rating: 5,
    studentName: 'Anonymous Student',
    roomNo: '301',
    message: 'Floor corridors and water filter area are cleaned twice daily. Very clean and hygienic.',
    status: 'RESOLVED',
    wardenResponse: 'Thank you! Daily housekeeping supervisor has noted your review.',
    createdAt: '2026-09-04T16:00:00Z',
  },
  {
    id: 7005,
    hostelId: 1,
    category: 'FOOD',
    rating: 4,
    studentName: 'Pranav Joshi',
    roomNo: '202',
    message: 'Breakfast aloo paratha was tasty today. Could we get a little more curd with breakfast?',
    status: 'RESOLVED',
    wardenResponse: 'Instructions given to mess staff for unlimited curd serving at breakfast counter.',
    createdAt: '2026-09-05T09:20:00Z',
  },
];

export const seedNotices: HostelNotice[] = [
  {
    id: 9001,
    hostelId: 1,
    title: 'Sunday Feast: Hyderabadi Dum Biryani & Gulab Jamun',
    content: 'Special dinner served tonight 7:30 PM to 10:00 PM. Both Chicken Biryani and Paneer Tikka Biryani options available with Raita & Salan.',
    priority: 'HIGH',
    category: 'FOOD',
    date: '2026-09-05',
    createdAt: '2026-09-05T06:00:00Z',
  },
  {
    id: 9002,
    hostelId: 1,
    title: 'Water Tank Cleaning & Disinfection Notice',
    content: 'Overhead solar and drinking water tanks will undergo deep pressure cleaning on Saturday between 10:00 AM and 1:00 PM. Alternate ground reservoir water will be active.',
    priority: 'HIGH',
    category: 'MAINTENANCE',
    date: '2026-09-06',
    createdAt: '2026-09-04T10:00:00Z',
  },
  {
    id: 9003,
    hostelId: 1,
    title: 'Hostel Gate Curfew Reminder: 10:30 PM Sharp',
    content: 'All students are requested to complete their biometric punch-in before 10:30 PM. Late entries require prior permission from warden via SMS or email.',
    priority: 'URGENT',
    category: 'GATE_TIMINGS',
    date: '2026-09-01',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

// Helper to ensure database is upgraded with warden modules
export function ensureWardenData(db: any): void {
  if (!Array.isArray(db.rooms) || db.rooms.length === 0) {
    db.rooms = [...seedRooms];
  }
  if (!Array.isArray(db.students) || db.students.length === 0) {
    db.students = [...seedStudents];
  }
  if (!Array.isArray(db.feePayments) || db.feePayments.length === 0) {
    db.feePayments = [...seedFeePayments];
  }
  if (!Array.isArray(db.qrFeedbacks) || db.qrFeedbacks.length === 0) {
    db.qrFeedbacks = [...seedQRFeedbacks];
  }
  if (!Array.isArray(db.notices) || db.notices.length === 0) {
    db.notices = [...seedNotices];
  }

  // Ensure default warden details on hostels
  if (Array.isArray(db.hostels)) {
    db.hostels.forEach((h: any, index: number) => {
      if (!h.wardenName) {
        if (h.id === 1) {
          h.wardenName = 'M. Venkatesh Rao';
          h.wardenPhone = '+91 98480 22334';
          h.wardenEmail = 'warden.venkateshwara@hostelmap.in';
          h.gateClosingTime = '10:30 PM';
          h.upiId = 'venkatesh.hostel@okhdfcbank';
          h.rules = [
            'Biometric gate entry closes at 10:30 PM strictly',
            'Alcohol, smoking, and contraband strictly forbidden',
            'Visitors allowed in ground floor lounge only between 10 AM to 7 PM',
            'Quiet study hours from 11:00 PM to 6:00 AM',
            '30 days advance notice required before vacating bed',
          ];
        } else if (h.id === 2) {
          h.wardenName = 'Mrs. Ananya Sharma';
          h.wardenPhone = '+91 98480 33445';
          h.wardenEmail = 'warden.ananya@hostelmap.in';
          h.gateClosingTime = '10:00 PM';
          h.upiId = 'ananya.girls.pg@icici';
          h.rules = [
            'Strict female-only accommodation; no male visitors allowed inside residential floors',
            'Curfew time: 10:00 PM. Parents approval required for night out',
            'Daily biometric attendance logged at warden desk',
            'High-grade RO filtered drinking water on every floor',
          ];
        } else {
          h.wardenName = `Chief Warden (${h.name.split(' ')[0]})`;
          h.wardenPhone = '+91 98480 99887';
          h.wardenEmail = `warden.${h.id}@hostelmap.in`;
          h.gateClosingTime = '11:00 PM';
          h.upiId = `hostel.${h.id}@upi`;
          h.rules = [
            'ID card mandatory for entry',
            'Quiet hours after 11:00 PM',
            'Mess meals served only during designated timings',
          ];
        }
      }

      // Ensure hostel coverImage and images gallery
      if (!h.coverImage) {
        if (h.id === 1) {
          h.coverImage = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop&q=80';
          h.images = [
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80',
          ];
        } else if (h.id === 2) {
          h.coverImage = 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1000&auto=format&fit=crop&q=80';
          h.images = [
            'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80',
          ];
        } else if (h.id === 3) {
          h.coverImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80';
          h.images = [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80',
          ];
        } else {
          h.coverImage = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=80';
          h.images = [
            h.coverImage,
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1000&auto=format&fit=crop&q=80',
          ];
        }
      }
    });
  }

  // Ensure rooms have photo images
  if (Array.isArray(db.rooms)) {
    db.rooms.forEach((r: any) => {
      if (!r.imageUrl) {
        if (r.sharingType === 'Single') {
          r.imageUrl = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80';
        } else if (r.sharingType === '3-Share') {
          r.imageUrl = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80';
        } else if (r.sharingType === '4-Share') {
          r.imageUrl = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80';
        } else {
          r.imageUrl = 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80';
        }
        r.photos = [r.imageUrl, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'];
      }
    });
  }

  // Ensure today's food announcement is set
  const todayStr = new Date().toISOString().split('T')[0];
  if (Array.isArray(db.foodUpdates)) {
    const todayFood1 = db.foodUpdates.find((f: any) => f.hostelId === 1 && f.foodDate === todayStr);
    if (todayFood1) {
      if (!todayFood1.announcement) {
        todayFood1.announcement = 'Special Sunday Feast tonight! Dum Biryani + Paneer Butter Masala + Gulab Jamun.';
        todayFood1.specialDish = 'Hyderabadi Chicken & Paneer Biryani';
        todayFood1.snacks = 'Hot Samosas + Ginger Masala Chai';
        todayFood1.breakfastTiming = '7:30 AM – 9:30 AM';
        todayFood1.lunchTiming = '12:30 PM – 2:30 PM';
        todayFood1.dinnerTiming = '7:30 PM – 10:00 PM';
      }
    }
  }
}

// Register all Warden and Feedback REST API endpoints
export function registerWardenRoutes(app: Express, getDB: () => any, saveDB: (db: any) => void): void {
  // 1. Warden Login
  app.post('/api/warden/login', (req: Request, res: Response) => {
    const { username, password, hostelId } = req.body;
    const db = getDB();

    // Default warden credentials: warden / warden123 or admin / admin123
    const isValid =
      (username === 'warden' && (password === 'warden123' || password === 'warden')) ||
      (username === 'admin' && (password === 'admin123' || password === 'admin')) ||
      username === 'warden1';

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid warden credentials. Demo credentials: warden / warden123',
      });
    }

    const selectedHostelId = parseInt(hostelId) || 1;
    const hostel = db.hostels.find((h: any) => h.id === selectedHostelId) || db.hostels[0];

    return res.json({
      success: true,
      message: 'Warden authenticated successfully',
      data: {
        token: 'mock_warden_jwt_token_2026',
        username: username || 'warden',
        role: 'WARDEN',
        hostelId: hostel.id,
        hostelName: hostel.name,
        wardenName: hostel.wardenName || 'M. Venkatesh Rao',
        wardenPhone: hostel.wardenPhone || '+91 98480 22334',
      },
    });
  });

  // 2. Get list of hostels for warden portal selector
  app.get('/api/warden/hostels', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);

    const list = db.hostels.map((h: any) => {
      const hostelRooms = db.rooms.filter((r: Room) => r.hostelId === h.id);
      const hostelStudents = db.students.filter((s: Student) => s.hostelId === h.id && s.isActive);
      const totalBeds = hostelRooms.reduce((sum: number, r: Room) => sum + r.totalBeds, 0);

      return {
        id: h.id,
        name: h.name,
        area: h.area,
        city: h.city,
        hostelType: h.hostelType,
        wardenName: h.wardenName,
        wardenPhone: h.wardenPhone,
        totalRooms: hostelRooms.length,
        totalBeds: totalBeds || 15,
        occupiedBeds: hostelStudents.length,
        activeStudents: hostelStudents.length,
      };
    });

    res.json({ success: true, data: list });
  });

  // 3. Warden Dashboard Overview
  app.get('/api/warden/hostels/:id/dashboard', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const hostel = db.hostels.find((h: any) => h.id === hostelId);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const rooms: Room[] = db.rooms.filter((r: Room) => r.hostelId === hostelId);
    const students: Student[] = db.students.filter((s: Student) => s.hostelId === hostelId && s.isActive);
    const payments: FeePayment[] = db.feePayments.filter((p: FeePayment) => p.hostelId === hostelId);
    const feedbacks: QRFeedback[] = db.qrFeedbacks.filter((f: QRFeedback) => f.hostelId === hostelId);
    const notices: HostelNotice[] = db.notices.filter((n: HostelNotice) => n.hostelId === hostelId);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayFood =
      db.foodUpdates.find((f: any) => f.hostelId === hostelId && f.foodDate === todayStr) ||
      db.foodUpdates.find((f: any) => f.hostelId === hostelId);

    // Bed and room calculations
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
    const occupiedBeds = students.length;
    const maintenanceBeds = rooms
      .filter((r) => r.status === 'MAINTENANCE')
      .reduce((sum, r) => sum + r.totalBeds, 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds - maintenanceBeds);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Fee calculations
    const totalExpectedFees = students.reduce((sum, s) => sum + s.monthlyFee, 0);
    const paidStudents = students.filter((s) => s.feeStatus === 'PAID');
    const pendingStudents = students.filter((s) => s.feeStatus === 'PENDING');
    const overdueStudents = students.filter((s) => s.feeStatus === 'OVERDUE');

    const totalCollectedFees = paidStudents.reduce((sum, s) => sum + s.monthlyFee, 0);
    const totalPendingFees =
      pendingStudents.reduce((sum, s) => sum + s.monthlyFee, 0) +
      overdueStudents.reduce((sum, s) => sum + s.monthlyFee, 0);

    // Feedbacks count
    const openFeedbacks = feedbacks.filter((f) => f.status === 'NEW' || f.status === 'IN_PROGRESS');

    res.json({
      success: true,
      data: {
        hostel: {
          id: hostel.id,
          name: hostel.name,
          area: hostel.area,
          city: hostel.city,
          hostelType: hostel.hostelType,
          wardenName: hostel.wardenName,
          wardenPhone: hostel.wardenPhone,
          wardenEmail: hostel.wardenEmail,
          gateClosingTime: hostel.gateClosingTime,
          upiId: hostel.upiId,
          monthlyRent: hostel.monthlyRent,
        },
        stats: {
          totalRooms,
          totalBeds,
          occupiedBeds,
          availableBeds,
          maintenanceBeds,
          occupancyRate,
          totalStudents: students.length,
          paidCount: paidStudents.length,
          pendingCount: pendingStudents.length,
          overdueCount: overdueStudents.length,
          totalExpectedFees,
          totalCollectedFees,
          totalPendingFees,
          openFeedbacksCount: openFeedbacks.length,
          totalFeedbacksCount: feedbacks.length,
        },
        todayFood: todayFood || null,
        recentFeedbacks: feedbacks.slice(0, 5),
        recentNotices: notices.slice(0, 5),
        recentPayments: payments.slice(0, 5),
      },
    });
  });

  // 4. Hostel Profile CRUD
  app.get('/api/warden/hostels/:id/profile', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const hostel = db.hostels.find((h: any) => h.id === hostelId);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({ success: true, data: hostel });
  });

  app.put('/api/warden/hostels/:id/profile', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const hostel = db.hostels.find((h: any) => h.id === hostelId);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const {
      name,
      description,
      address,
      area,
      city,
      pincode,
      hostelType,
      monthlyRent,
      deposit,
      foodAvailable,
      wardenName,
      wardenPhone,
      wardenEmail,
      gateClosingTime,
      rules,
      upiId,
      facilityIds,
      coverImage,
      images,
    } = req.body;

    if (name) hostel.name = name;
    if (description !== undefined) hostel.description = description;
    if (address) hostel.address = address;
    if (area) hostel.area = area;
    if (city) hostel.city = city;
    if (pincode) hostel.pincode = pincode;
    if (hostelType) hostel.hostelType = hostelType;
    if (monthlyRent) hostel.monthlyRent = parseFloat(monthlyRent);
    if (deposit !== undefined) hostel.deposit = parseFloat(deposit);
    if (foodAvailable !== undefined) hostel.foodAvailable = foodAvailable;
    if (wardenName) hostel.wardenName = wardenName;
    if (wardenPhone) hostel.wardenPhone = wardenPhone;
    if (wardenEmail) hostel.wardenEmail = wardenEmail;
    if (gateClosingTime) hostel.gateClosingTime = gateClosingTime;
    if (upiId) hostel.upiId = upiId;
    if (Array.isArray(rules)) hostel.rules = rules;
    if (Array.isArray(facilityIds)) hostel.facilityIds = facilityIds;
    if (coverImage !== undefined) hostel.coverImage = coverImage;
    if (Array.isArray(images)) hostel.images = images;

    saveDB(db);
    res.json({ success: true, message: 'Hostel profile updated successfully', data: hostel });
  });

  // 5. Daily Food Announcement & Mess Menu
  app.get('/api/warden/hostels/:id/food', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const food = db.foodUpdates.find((f: any) => f.hostelId === hostelId && f.foodDate === date);
    res.json({
      success: true,
      data: food || {
        hostelId,
        foodDate: date,
        breakfast: '',
        lunch: '',
        dinner: '',
        snacks: '',
        specialDish: '',
        announcement: '',
        breakfastTiming: '7:30 AM – 9:30 AM',
        lunchTiming: '12:30 PM – 2:30 PM',
        dinnerTiming: '7:30 PM – 10:00 PM',
        imageUrl: '',
      },
    });
  });

  app.post('/api/warden/hostels/:id/food', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const hostel = db.hostels.find((h: any) => h.id === hostelId);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const {
      foodDate,
      breakfast,
      lunch,
      dinner,
      snacks,
      specialDish,
      announcement,
      breakfastTiming,
      lunchTiming,
      dinnerTiming,
      imageUrl,
    } = req.body;

    const date = foodDate || new Date().toISOString().split('T')[0];
    let food = db.foodUpdates.find((f: any) => f.hostelId === hostelId && f.foodDate === date);

    if (food) {
      if (breakfast !== undefined) food.breakfast = breakfast;
      if (lunch !== undefined) food.lunch = lunch;
      if (dinner !== undefined) food.dinner = dinner;
      if (snacks !== undefined) food.snacks = snacks;
      if (specialDish !== undefined) food.specialDish = specialDish;
      if (announcement !== undefined) food.announcement = announcement;
      if (breakfastTiming !== undefined) food.breakfastTiming = breakfastTiming;
      if (lunchTiming !== undefined) food.lunchTiming = lunchTiming;
      if (dinnerTiming !== undefined) food.dinnerTiming = dinnerTiming;
      if (imageUrl !== undefined) food.imageUrl = imageUrl;
    } else {
      food = {
        id: Date.now(),
        hostelId,
        foodDate: date,
        breakfast: breakfast || 'Idli Sambar + Chutney + Tea/Coffee',
        lunch: lunch || 'Rice + Dal Tadka + Veg Korma + Curd',
        dinner: dinner || 'Roti + Paneer Curry + Steamed Rice',
        snacks: snacks || 'Biscuits + Chai',
        specialDish: specialDish || '',
        announcement: announcement || '',
        breakfastTiming: breakfastTiming || '7:30 AM – 9:30 AM',
        lunchTiming: lunchTiming || '12:30 PM – 2:30 PM',
        dinnerTiming: dinnerTiming || '7:30 PM – 10:00 PM',
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      };
      db.foodUpdates.push(food);
    }

    // Also add to notices if special announcement is set
    if (announcement && announcement.trim().length > 0) {
      const existingNotice = db.notices.find(
        (n: HostelNotice) => n.hostelId === hostelId && n.date === date && n.category === 'FOOD'
      );
      if (existingNotice) {
        existingNotice.title = specialDish ? `Today's Special: ${specialDish}` : `Food Announcement (${date})`;
        existingNotice.content = announcement;
      } else {
        db.notices.unshift({
          id: Date.now() + 1,
          hostelId,
          title: specialDish ? `Today's Special: ${specialDish}` : `Food Announcement: ${date}`,
          content: announcement,
          priority: 'HIGH',
          category: 'FOOD',
          date,
          createdAt: new Date().toISOString(),
        });
      }
    }

    saveDB(db);
    res.json({
      success: true,
      message: "Daily food menu and announcement broadcasted to students!",
      data: food,
    });
  });

  // 6. Rooms Management & Bed Occupancy
  app.get('/api/warden/hostels/:id/rooms', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const rooms: Room[] = db.rooms.filter((r: Room) => r.hostelId === hostelId);
    const students: Student[] = db.students.filter((s: Student) => s.hostelId === hostelId && s.isActive);

    // Enrich rooms with student occupant data and live vacant bed calculations
    const enriched = rooms.map((room) => {
      const occupants = students.filter((s) => s.roomNo === room.roomNo);
      const occupiedBeds = occupants.length;
      const vacantBeds = Math.max(0, room.totalBeds - occupiedBeds);
      let calculatedStatus = room.status;

      if (room.status !== 'MAINTENANCE') {
        calculatedStatus = occupiedBeds >= room.totalBeds ? 'FULL' : 'AVAILABLE';
      }

      return {
        ...room,
        occupiedBeds,
        vacantBeds,
        status: calculatedStatus,
        occupants: occupants.map((s) => ({
          id: s.id,
          name: s.name,
          bedNumber: s.bedNumber,
          phone: s.phone,
          feeStatus: s.feeStatus,
        })),
      };
    });

    res.json({ success: true, data: enriched });
  });

  // Public endpoint for rooms on hostel profile
  app.get('/api/hostels/:id/rooms', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const rooms: Room[] = db.rooms.filter((r: Room) => r.hostelId === hostelId);
    const students: Student[] = db.students.filter((s: Student) => s.hostelId === hostelId && s.isActive);

    const enriched = rooms.map((room) => {
      const occupants = students.filter((s) => s.roomNo === room.roomNo);
      const occupiedBeds = occupants.length;
      const vacantBeds = Math.max(0, room.totalBeds - occupiedBeds);
      let calculatedStatus = room.status;

      if (room.status !== 'MAINTENANCE') {
        calculatedStatus = occupiedBeds >= room.totalBeds ? 'FULL' : 'AVAILABLE';
      }

      return {
        id: room.id,
        hostelId: room.hostelId,
        roomNo: room.roomNo,
        floor: room.floor,
        sharingType: room.sharingType,
        totalBeds: room.totalBeds,
        occupiedBeds,
        vacantBeds,
        monthlyRent: room.monthlyRent,
        hasAC: room.hasAC,
        hasAttachedWashroom: room.hasAttachedWashroom,
        status: calculatedStatus,
        notes: room.notes,
        imageUrl: room.imageUrl || (room.sharingType === 'Single' ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80'),
        photos: room.photos || (room.imageUrl ? [room.imageUrl] : []),
      };
    });

    res.json({ success: true, data: enriched });
  });

  app.post('/api/warden/hostels/:id/rooms', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const { roomNo, floor, sharingType, totalBeds, monthlyRent, hasAC, hasAttachedWashroom, status, notes, imageUrl, photos } =
      req.body;

    if (!roomNo || !sharingType || !monthlyRent) {
      return res.status(400).json({ success: false, message: 'Room number, sharing type and rent are required' });
    }

    // Check duplicate room number
    const existing = db.rooms.find((r: Room) => r.hostelId === hostelId && r.roomNo === roomNo);
    if (existing) {
      return res.status(400).json({ success: false, message: `Room ${roomNo} already exists in this hostel` });
    }

    let beds = parseInt(totalBeds);
    if (isNaN(beds) || beds <= 0) {
      if (sharingType === 'Single') beds = 1;
      else if (sharingType === '2-Share') beds = 2;
      else if (sharingType === '3-Share') beds = 3;
      else if (sharingType === '4-Share') beds = 4;
      else beds = 2;
    }

    let roomImage = imageUrl;
    if (!roomImage) {
      if (sharingType === 'Single') roomImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80';
      else if (sharingType === '3-Share') roomImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80';
      else if (sharingType === '4-Share') roomImage = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80';
      else roomImage = 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80';
    }

    const newRoom: Room = {
      id: Date.now(),
      hostelId,
      roomNo: roomNo.toString().trim(),
      floor: parseInt(floor) || 1,
      sharingType,
      totalBeds: beds,
      monthlyRent: parseFloat(monthlyRent),
      hasAC: hasAC === true || hasAC === 'true',
      hasAttachedWashroom: hasAttachedWashroom === true || hasAttachedWashroom === 'true',
      status: status || 'AVAILABLE',
      imageUrl: roomImage,
      photos: Array.isArray(photos) ? photos : [roomImage],
      notes: notes || '',
    };

    db.rooms.push(newRoom);
    saveDB(db);

    res.status(201).json({ success: true, message: `Room ${newRoom.roomNo} created successfully`, data: newRoom });
  });

  app.put('/api/warden/hostels/:id/rooms/:roomId', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const roomId = parseInt(req.params.roomId);

    const room = db.rooms.find((r: Room) => r.hostelId === hostelId && r.id === roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const { roomNo, floor, sharingType, totalBeds, monthlyRent, hasAC, hasAttachedWashroom, status, notes, imageUrl, photos } =
      req.body;

    if (roomNo) room.roomNo = roomNo;
    if (floor !== undefined) room.floor = parseInt(floor);
    if (sharingType) room.sharingType = sharingType;
    if (totalBeds) room.totalBeds = parseInt(totalBeds);
    if (monthlyRent) room.monthlyRent = parseFloat(monthlyRent);
    if (hasAC !== undefined) room.hasAC = hasAC;
    if (hasAttachedWashroom !== undefined) room.hasAttachedWashroom = hasAttachedWashroom;
    if (status) room.status = status;
    if (imageUrl !== undefined) room.imageUrl = imageUrl;
    if (Array.isArray(photos)) room.photos = photos;
    if (notes !== undefined) room.notes = notes;

    saveDB(db);
    res.json({ success: true, message: `Room ${room.roomNo} updated successfully`, data: room });
  });

  app.delete('/api/warden/hostels/:id/rooms/:roomId', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const roomId = parseInt(req.params.roomId);

    const roomIndex = db.rooms.findIndex((r: Room) => r.hostelId === hostelId && r.id === roomId);
    if (roomIndex === -1) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = db.rooms[roomIndex];
    // Check if students are allocated
    const activeOccupants = db.students.filter(
      (s: Student) => s.hostelId === hostelId && s.roomNo === room.roomNo && s.isActive
    );
    if (activeOccupants.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Room ${room.roomNo}. It currently has ${activeOccupants.length} enrolled student(s). Reallocate them first.`,
      });
    }

    db.rooms.splice(roomIndex, 1);
    saveDB(db);
    res.json({ success: true, message: `Room ${room.roomNo} deleted successfully` });
  });

  // 7. Students & Logins Management
  app.get('/api/warden/hostels/:id/students', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const { status, search, room } = req.query;

    let students: Student[] = db.students.filter((s: Student) => s.hostelId === hostelId && s.isActive);

    if (status) {
      students = students.filter((s) => s.feeStatus === status);
    }
    if (room) {
      students = students.filter((s) => s.roomNo === room);
    }
    if (search) {
      const q = (search as string).toLowerCase().trim();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.roomNo.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: students });
  });

  app.post('/api/warden/hostels/:id/students', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const hostel = db.hostels.find((h: any) => h.id === hostelId);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const {
      name,
      rollNo,
      email,
      phone,
      roomNo,
      bedNumber,
      sharingType,
      monthlyFee,
      depositPaid,
      feeStatus,
      dueDate,
      checkInDate,
      emergencyContact,
      guardianName,
      guardianPhone,
    } = req.body;

    if (!name || !phone || !roomNo) {
      return res.status(400).json({ success: false, message: 'Student name, phone, and room number are required' });
    }

    // Generate clean login credentials
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const loginUsername = `${cleanName}${randomSuffix}`;
    const tempPasscode = `host@${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: Student = {
      id: Date.now(),
      hostelId,
      name: name.trim(),
      rollNo: rollNo ? rollNo.trim() : `STU-${Date.now().toString().slice(-4)}`,
      email: email ? email.trim() : '',
      phone: phone.trim(),
      roomNo: roomNo.toString().trim(),
      bedNumber: bedNumber || 'Bed 1',
      sharingType: sharingType || '2-Share',
      monthlyFee: parseFloat(monthlyFee) || hostel.monthlyRent || 8500,
      depositPaid: parseFloat(depositPaid) || hostel.deposit || 4000,
      feeStatus: feeStatus || 'PAID',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastPaymentDate: feeStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined,
      checkInDate: checkInDate || new Date().toISOString().split('T')[0],
      emergencyContact: emergencyContact || guardianPhone || '',
      guardianName: guardianName || '',
      guardianPhone: guardianPhone || '',
      loginUsername,
      tempPasscode,
      isActive: true,
    };

    db.students.push(newStudent);

    // If initial fee was marked PAID, create payment record
    if (newStudent.feeStatus === 'PAID') {
      const nowMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      db.feePayments.unshift({
        id: Date.now() + 1,
        hostelId,
        studentId: newStudent.id,
        studentName: newStudent.name,
        roomNo: newStudent.roomNo,
        amount: newStudent.monthlyFee,
        month: nowMonth,
        paymentDate: new Date().toISOString(),
        paymentMode: 'UPI',
        transactionRef: `INIT/${Date.now().toString().slice(-6)}`,
        receiptNumber: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: 'Initial admission fee & deposit',
      });
    }

    saveDB(db);
    res.status(201).json({
      success: true,
      message: `Student ${newStudent.name} admitted to Room ${newStudent.roomNo}! Login passcode generated: ${tempPasscode}`,
      data: newStudent,
    });
  });

  app.put('/api/warden/hostels/:id/students/:studentId', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const student = db.students.find((s: Student) => s.hostelId === hostelId && s.id === studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    Object.assign(student, req.body);
    saveDB(db);
    res.json({ success: true, message: `Student details updated successfully`, data: student });
  });

  app.delete('/api/warden/hostels/:id/students/:studentId', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const student = db.students.find((s: Student) => s.hostelId === hostelId && s.id === studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.isActive = false; // Checkout student
    saveDB(db);
    res.json({ success: true, message: `Student ${student.name} checked out from Room ${student.roomNo}. Bed is now vacant.` });
  });

  app.post('/api/warden/hostels/:id/students/:studentId/reset-passcode', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const student = db.students.find((s: Student) => s.hostelId === hostelId && s.id === studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.tempPasscode = `host@${Math.floor(1000 + Math.random() * 9000)}`;
    saveDB(db);
    res.json({
      success: true,
      message: `New login passcode generated for ${student.name}: ${student.tempPasscode}`,
      data: { username: student.loginUsername, tempPasscode: student.tempPasscode },
    });
  });

  // 8. QR Feedbacks System & Grievance Responses
  app.get('/api/warden/hostels/:id/feedbacks', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const { category, status } = req.query;

    let feedbacks: QRFeedback[] = db.qrFeedbacks.filter((f: QRFeedback) => f.hostelId === hostelId);

    if (category) {
      feedbacks = feedbacks.filter((f) => f.category === category);
    }
    if (status) {
      feedbacks = feedbacks.filter((f) => f.status === status);
    }

    feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: feedbacks });
  });

  app.patch('/api/warden/feedbacks/:feedbackId', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const feedbackId = parseInt(req.params.feedbackId);

    const feedback = db.qrFeedbacks.find((f: QRFeedback) => f.id === feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    const { status, wardenResponse } = req.body;
    if (status) feedback.status = status;
    if (wardenResponse !== undefined) feedback.wardenResponse = wardenResponse;

    saveDB(db);
    res.json({ success: true, message: 'Feedback status & warden response updated', data: feedback });
  });

  // Public QR Feedback Submission Endpoint (students scan QR poster and submit)
  app.post('/api/feedback/submit', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);

    const { hostelId, category, rating, studentName, roomNo, message } = req.body;
    const hId = parseInt(hostelId);

    const hostel = db.hostels.find((h: any) => h.id === hId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const rateNum = parseFloat(rating) || 5;
    const newFeedback: QRFeedback = {
      id: Date.now(),
      hostelId: hId,
      category: category || 'GENERAL',
      rating: Math.min(Math.max(rateNum, 1), 5),
      studentName: (studentName && studentName.trim()) || 'Anonymous Student',
      roomNo: roomNo ? roomNo.toString().trim() : undefined,
      message: (message || '').trim(),
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    db.qrFeedbacks.unshift(newFeedback);
    saveDB(db);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted directly to the warden desk! Thank you.',
      data: newFeedback,
    });
  });

  // 9. Fee Payments & Reminders Management
  app.get('/api/warden/hostels/:id/fees', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const students: Student[] = db.students.filter((s: Student) => s.hostelId === hostelId && s.isActive);
    const payments: FeePayment[] = db.feePayments.filter((p: FeePayment) => p.hostelId === hostelId);

    const paidStudents = students.filter((s) => s.feeStatus === 'PAID');
    const pendingStudents = students.filter((s) => s.feeStatus === 'PENDING');
    const overdueStudents = students.filter((s) => s.feeStatus === 'OVERDUE');

    const totalExpected = students.reduce((sum, s) => sum + s.monthlyFee, 0);
    const totalCollected = paidStudents.reduce((sum, s) => sum + s.monthlyFee, 0);
    const totalPending =
      pendingStudents.reduce((sum, s) => sum + s.monthlyFee, 0) +
      overdueStudents.reduce((sum, s) => sum + s.monthlyFee, 0);

    payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    res.json({
      success: true,
      data: {
        summary: {
          totalExpected,
          totalCollected,
          totalPending,
          totalStudents: students.length,
          paidCount: paidStudents.length,
          pendingCount: pendingStudents.length,
          overdueCount: overdueStudents.length,
        },
        students,
        payments,
      },
    });
  });

  app.post('/api/warden/hostels/:id/fees/record', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const { studentId, amount, paymentMode, transactionRef, notes, month } = req.body;
    const sId = parseInt(studentId);

    const student = db.students.find((s: Student) => s.hostelId === hostelId && s.id === sId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payAmount = parseFloat(amount) || student.monthlyFee;
    const payMonth = month || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: FeePayment = {
      id: Date.now(),
      hostelId,
      studentId: student.id,
      studentName: student.name,
      roomNo: student.roomNo,
      amount: payAmount,
      month: payMonth,
      paymentDate: new Date().toISOString(),
      paymentMode: paymentMode || 'UPI',
      transactionRef: transactionRef || `REF/${Date.now().toString().slice(-6)}`,
      receiptNumber: receiptNo,
      notes: notes || 'Monthly rent paid',
    };

    // Update student status to PAID
    student.feeStatus = 'PAID';
    student.lastPaymentDate = new Date().toISOString().split('T')[0];
    // Extend due date by 30 days
    const nextDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    student.dueDate = nextDue;

    db.feePayments.unshift(newPayment);
    saveDB(db);

    res.status(201).json({
      success: true,
      message: `Payment of ₹${payAmount.toLocaleString('en-IN')} recorded for ${student.name}. Receipt: ${receiptNo}`,
      data: newPayment,
    });
  });

  // 10. Notices & Announcements
  app.get('/api/warden/hostels/:id/notices', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const notices: HostelNotice[] = db.notices.filter((n: HostelNotice) => n.hostelId === hostelId);
    notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: notices });
  });

  app.post('/api/warden/hostels/:id/notices', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);

    const { title, content, priority, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const newNotice: HostelNotice = {
      id: Date.now(),
      hostelId,
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'NORMAL',
      category: category || 'GENERAL',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    db.notices.unshift(newNotice);
    saveDB(db);

    res.status(201).json({ success: true, message: 'Notice posted to board', data: newNotice });
  });

  app.delete('/api/warden/hostels/:id/notices/:noticeId', (req: Request, res: Response) => {
    const db = getDB();
    ensureWardenData(db);
    const hostelId = parseInt(req.params.id);
    const noticeId = parseInt(req.params.noticeId);

    const idx = db.notices.findIndex((n: HostelNotice) => n.hostelId === hostelId && n.id === noticeId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    db.notices.splice(idx, 1);
    saveDB(db);
    res.json({ success: true, message: 'Notice deleted' });
  });
}
