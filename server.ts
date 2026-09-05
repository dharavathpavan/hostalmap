import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { ensureWardenData, registerWardenRoutes } from './warden_service';

const rootDir = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure data directory exists
const DATA_DIR = path.join(rootDir, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'hostel_db.json');

// Interface types
interface Facility {
  id: number;
  name: string;
}

interface FoodUpdate {
  id: number;
  hostelId: number;
  foodDate: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  imageUrl?: string;
}

interface Review {
  id: number;
  hostelId: number;
  userId?: number | null;
  foodRating: number;
  cleanlinessRating: number;
  safetyRating: number;
  wifiRating: number;
  managementRating: number;
  valueRating: number;
  comment: string;
  recommend: boolean;
  verifiedStudent: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface ReviewReport {
  id: number;
  reviewId: number;
  reportedBy: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

interface Hostel {
  id: number;
  name: string;
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  hostelType: 'BOYS' | 'GIRLS' | 'CO_LIVING';
  monthlyRent: number;
  deposit: number;
  foodAvailable: boolean;
  verified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  facilityIds: number[];
  createdAt: string;
  coverImage?: string;
  images?: string[];
  wardenName?: string;
  wardenPhone?: string;
  wardenEmail?: string;
  gateClosingTime?: string;
  upiId?: string;
  rules?: string[];
}

interface DB {
  facilities: Facility[];
  hostels: Hostel[];
  foodUpdates: FoodUpdate[];
  reviews: Review[];
  reports: ReviewReport[];
}

const initialFacilities: Facility[] = [
  { id: 1, name: 'WiFi' },
  { id: 2, name: 'Food Included' },
  { id: 3, name: 'AC Rooms' },
  { id: 4, name: 'Laundry Service' },
  { id: 5, name: 'CCTV Security' },
  { id: 6, name: 'Power Backup' },
  { id: 7, name: 'Hot Water / Geyser' },
  { id: 8, name: 'Attached Washroom' },
  { id: 9, name: '2-Wheeler Parking' },
  { id: 10, name: 'Daily Housekeeping' },
  { id: 11, name: 'Gym' },
  { id: 12, name: 'Study Hall / Desk' },
];

const todayDateStr = new Date().toISOString().split('T')[0];

const initialHostels: Hostel[] = [
  {
    id: 1,
    name: 'Sri Venkateshwara Executive Boys Hostel',
    description: 'Modern 4-floor student hostel located 800m from DLF Cyber City. High speed fiber internet, 3-times North & South Indian meals, daily housekeeping, and biometric security.',
    address: 'Plot 42, Telecom Nagar, Near DLF Gate 3',
    area: 'Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    latitude: 17.4435,
    longitude: 78.3582,
    hostelType: 'BOYS',
    monthlyRent: 8500,
    deposit: 4000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 4, 5, 6, 7, 8, 10],
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Ananya Elite Luxury Girls PG & Hostel',
    description: 'Premium safe accommodation for female college students and interns. 24/7 female warden, digital entry logs, CCTV on each floor, nutritional home-cooked food.',
    address: 'Road No. 3, Beside Chaitanya College, Kakatiya Hills',
    area: 'Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    latitude: 17.4486,
    longitude: 78.3908,
    hostelType: 'GIRLS',
    monthlyRent: 9500,
    deposit: 5000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12],
    createdAt: '2026-07-05T00:00:00Z',
  },
  {
    id: 3,
    name: 'Tribe Co-Living Student Hub',
    description: 'Vibrant co-living hostel with dedicated collaborative study lounges, gaming room, high speed dual ISP WiFi, and international breakfast spread.',
    address: 'Sy No 115, Financial District, Behind Wipro Circle',
    area: 'Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    latitude: 17.4208,
    longitude: 78.3421,
    hostelType: 'CO_LIVING',
    monthlyRent: 14500,
    deposit: 10000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    createdAt: '2026-07-10T00:00:00Z',
  },
  {
    id: 4,
    name: 'Siddhi Vinayaka Budget Boys Hostel',
    description: 'Affordable student stay 5 minutes walk from JNTU Hyderabad campus. Ideal for engineering students preparing for exams. Clean sharing rooms and hygienic food.',
    address: 'KPHB 5th Phase, Near JNTU Metro Station',
    area: 'JNTU',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500085',
    latitude: 17.4942,
    longitude: 78.3912,
    hostelType: 'BOYS',
    monthlyRent: 5500,
    deposit: 2000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 5, 6, 7, 9],
    createdAt: '2026-07-15T00:00:00Z',
  },
  {
    id: 5,
    name: 'Sai Balaji Comfort PG for Girls',
    description: 'Comfortable AC and Non-AC rooms near Hitec City MMTS and universities. Strictly vegetarian food, washing machines on each floor, quiet study hours.',
    address: 'Lane 4, Silicon Valley, Near Inorbit Mall',
    area: 'Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    latitude: 17.4372,
    longitude: 78.3845,
    hostelType: 'GIRLS',
    monthlyRent: 7800,
    deposit: 3500,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 4, 5, 6, 7, 8, 10],
    createdAt: '2026-07-20T00:00:00Z',
  },
  {
    id: 6,
    name: 'Metro View Modern Boys Hostel',
    description: 'Direct view of the metro line, 200 Mbps mesh WiFi in every room, gaming console in common hall, and 3 times chicken weekly.',
    address: 'Opposite Pillar 742, KPHB Colony Main Road',
    area: 'Kukatpally',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    latitude: 17.4890,
    longitude: 78.4020,
    hostelType: 'BOYS',
    monthlyRent: 6800,
    deposit: 3000,
    foodAvailable: true,
    verified: false,
    status: 'ACTIVE',
    facilityIds: [1, 2, 5, 6, 7, 9, 10],
    createdAt: '2026-07-22T00:00:00Z',
  },
  {
    id: 7,
    name: 'Greenwoods Scholar Living',
    description: 'Eco-friendly hostel campus with lush garden, rooftop cafeteria, solar hot water, ergonomic study desks, and gym.',
    address: 'Whitefields, Near Botanical Gardens',
    area: 'Kondapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500084',
    latitude: 17.4615,
    longitude: 78.3610,
    hostelType: 'CO_LIVING',
    monthlyRent: 11000,
    deposit: 6000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    createdAt: '2026-07-25T00:00:00Z',
  },
  {
    id: 8,
    name: 'Padmavathi Ladies Student Home',
    description: 'Traditional, caring hostel managed by a senior retired educator. Freshly ground spices, pure filter water, secure gated premise, strict 9 PM curfew.',
    address: 'Beside Vignana Jyothi Institute, Bachupally Road',
    area: 'Nizampet',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500090',
    latitude: 17.5140,
    longitude: 78.3810,
    hostelType: 'GIRLS',
    monthlyRent: 6200,
    deposit: 2500,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 5, 6, 7, 8, 10],
    createdAt: '2026-07-28T00:00:00Z',
  },
  {
    id: 9,
    name: 'TechZone Executive PG & Hostel',
    description: 'Budget friendly hostel preferred by coding bootcamp and university students. Power backup for non-stop study sessions and uninterrupted internet.',
    address: 'Behind Sarath City Capital Mall, Gachibowli-Miyapur Road',
    area: 'Kondapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500084',
    latitude: 17.4720,
    longitude: 78.3540,
    hostelType: 'BOYS',
    monthlyRent: 7200,
    deposit: 3000,
    foodAvailable: true,
    verified: false,
    status: 'ACTIVE',
    facilityIds: [1, 2, 4, 5, 6, 7, 9],
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 10,
    name: 'CampusNest Premium Student Residency',
    description: 'All-inclusive student living with study booths, laundry pickup, daily sanitized rooms, buffet meals, and weekly shuttle to major colleges.',
    address: 'Nanakramguda, Near Oakridge International School',
    area: 'Financial District',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    latitude: 17.4150,
    longitude: 78.3490,
    hostelType: 'CO_LIVING',
    monthlyRent: 13500,
    deposit: 8000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12],
    createdAt: '2026-08-05T00:00:00Z',
  },
  {
    id: 11,
    name: 'Kukatpally Scholars PG for Boys',
    description: 'Economical twin and triple sharing rooms right opposite coaching centers and colleges. Unlimited South Indian rice and curd daily.',
    address: 'Road No 1, KPHB Phase 1, Near Remedy Hospital',
    area: 'Kukatpally',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    latitude: 17.4830,
    longitude: 78.4110,
    hostelType: 'BOYS',
    monthlyRent: 4900,
    deposit: 2000,
    foodAvailable: true,
    verified: false,
    status: 'ACTIVE',
    facilityIds: [1, 2, 5, 7, 9],
    createdAt: '2026-08-08T00:00:00Z',
  },
  {
    id: 12,
    name: 'Starlight International Girls Residency',
    description: 'Modern luxury student residency with biometric elevator access, reading library, high speed LAN ports, and dietitian planned meals.',
    address: 'Gowlidoddy, Near University of Hyderabad South Gate',
    area: 'Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500075',
    latitude: 17.4310,
    longitude: 78.3390,
    hostelType: 'GIRLS',
    monthlyRent: 10500,
    deposit: 5000,
    foodAvailable: true,
    verified: true,
    status: 'ACTIVE',
    facilityIds: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12],
    createdAt: '2026-08-12T00:00:00Z',
  },
];

const initialFoodUpdates: FoodUpdate[] = [
  {
    id: 1,
    hostelId: 1,
    foodDate: todayDateStr,
    breakfast: 'Ghee Karam Dosa + Coconut Chutney + Hot Filter Coffee',
    lunch: 'Basmati Rice + Tomato Pappu + Chicken Curry / Paneer Butter Masala + Thick Curd',
    dinner: 'Phulka Rotis (unlimited) + Aloo Gobi + Dal Tadka + Hot Gulab Jamun',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    hostelId: 2,
    foodDate: todayDateStr,
    breakfast: 'Steamed Idly & Medu Vada + Sambar + Peanut Chutney',
    lunch: 'Jeera Rice + Mixed Dal Tadka + Bhindi Fry + Fresh Curd & Crispy Papad',
    dinner: 'Soft Rotis + Paneer Tikka Masala + Steamed Rice + Pepper Rasam',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    hostelId: 3,
    foodDate: todayDateStr,
    breakfast: 'Poha / Rolled Oats / Farm Fresh Eggs + Seasonal Juice & Cold Brew',
    lunch: 'Continental Protein Bowl + Mexican Herb Rice / Dal Khichdi + Mint Raita',
    dinner: 'Woodfire Style Flatbreads + Kadai Mushroom / Butter Chicken + Fresh Greens',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    hostelId: 4,
    foodDate: todayDateStr,
    breakfast: 'Hot Rava Upma with Podi & Chutney + Masala Tea',
    lunch: 'White Rice + Andhra Gongura Pappu + Boiled Egg Curry / Sambar + Butter Milk',
    dinner: 'Warm Chapatis + Mixed Vegetable Kurma + Curd Rice',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    hostelId: 5,
    foodDate: todayDateStr,
    breakfast: 'Crispy Mysore Bonda + Allam (Ginger) Chutney + Coffee',
    lunch: 'Steamed Rice + Palak Dal + Raw Banana Fry + Pepper Rasam + Curd',
    dinner: 'Phulka + Paneer Mutter + Dal Fry + Sweet Kheer',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    hostelId: 6,
    foodDate: todayDateStr,
    breakfast: 'Hot Puri with Aloo Masala + Ginger Tea',
    lunch: 'Bagara Rice + Hyderabadi Chicken Curry / Veg Paneer + Onion Raita',
    dinner: 'Roti + Dal Makhani + White Rice + Sweet Curd',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    hostelId: 7,
    foodDate: todayDateStr,
    breakfast: 'Multi-grain Paratha with Fresh Curd + Green Herbal Tea',
    lunch: 'Organic Brown / White Rice + Drumstick Sambar + Beetroot Poriyal + Curd',
    dinner: 'Millet Rotis + Methi Chaman + Yellow Moong Dal + Garden Salad',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    hostelId: 8,
    foodDate: todayDateStr,
    breakfast: 'Rava Idly with Pure Ghee + Drumstick Sambar + Filter Coffee',
    lunch: 'Traditional South Indian Thali (Pappu, Vepudu, Rasam, Curd, Appalam)',
    dinner: 'Chapati + Aloo Palak Gravy + Steamed Rice + Mor Kuzhambu',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 9,
    hostelId: 9,
    foodDate: todayDateStr,
    breakfast: 'Semiya Upma + Fresh Coconut Chutney + Tea',
    lunch: 'White Rice + Tomato Dal + Egg Bhurji / Soya Chunks Curry',
    dinner: 'Rotis + Chana Masala + Curd Rice',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 10,
    hostelId: 10,
    foodDate: todayDateStr,
    breakfast: 'Buffet: Eggs, Idly-Sambar, Cornflakes, Fresh Fruits & Juices',
    lunch: 'Hyderabadi Dum Biryani (Chicken/Paneer) + Mirchi Ka Salan + Raita',
    dinner: 'Gourmet Rotis + Paneer Lababdar + Dal Bukhara + Fruit Custard',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 11,
    hostelId: 11,
    foodDate: todayDateStr,
    breakfast: 'Lemon Pulihora & Curd Rice + Tea',
    lunch: 'Full Meals with Andhra Pappu, Sambar, Majjiga (Spiced Buttermilk)',
    dinner: 'Hot Chapatis + Mixed Veg Curry + Rice',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 12,
    hostelId: 12,
    foodDate: todayDateStr,
    breakfast: 'Stuffed Aloo Paratha with Butter + Curd + Coffee',
    lunch: 'Veg Pulao + Dal Tadka + Paneer Korma + Fresh Salad & Curd',
    dinner: 'Soft Phulkas + Shahi Paneer + Steamed Rice + Rasam',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  },
];

const initialReviews: Review[] = [
  {
    id: 1,
    hostelId: 1,
    userId: 2,
    foodRating: 4.5,
    cleanlinessRating: 4.0,
    safetyRating: 4.8,
    wifiRating: 4.2,
    managementRating: 4.0,
    valueRating: 4.5,
    comment: 'Staying here for 8 months now. The food is much better than typical PGs in Gachibowli, especially Sunday chicken biryani. Wi-Fi has low latency which helps for online exams.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 2,
    hostelId: 1,
    userId: null,
    foodRating: 4.0,
    cleanlinessRating: 4.5,
    safetyRating: 4.5,
    wifiRating: 3.8,
    managementRating: 4.2,
    valueRating: 4.0,
    comment: 'Hot water available 24/7 without fail. Rooms cleaned daily. Safe biometric entrance and peaceful study environment.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-28T14:15:00Z',
  },
  {
    id: 3,
    hostelId: 1,
    userId: null,
    foodRating: 3.8,
    cleanlinessRating: 4.0,
    safetyRating: 4.2,
    wifiRating: 4.0,
    managementRating: 3.5,
    valueRating: 4.0,
    comment: 'Management responds within a day if there is any plumbing issue. Rent is reasonable compared to nearby corporate towers.',
    recommend: true,
    verifiedStudent: false,
    status: 'APPROVED',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 4,
    hostelId: 2,
    userId: 3,
    foodRating: 4.8,
    cleanlinessRating: 4.9,
    safetyRating: 5.0,
    wifiRating: 4.5,
    managementRating: 4.7,
    valueRating: 4.6,
    comment: 'Best girls hostel in Madhapur area. Warden aunty is super supportive and caring. Security is strictly monitored with biometric and CCTV. Food is like home cooking.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-20T18:40:00Z',
  },
  {
    id: 5,
    hostelId: 2,
    userId: null,
    foodRating: 4.5,
    cleanlinessRating: 4.8,
    safetyRating: 4.9,
    wifiRating: 4.2,
    managementRating: 4.5,
    valueRating: 4.4,
    comment: 'Very close to metro and bus stops. Rooms have good ventilation and high quality beds. Washing machines are always in working order.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-30T11:20:00Z',
  },
  {
    id: 6,
    hostelId: 3,
    userId: null,
    foodRating: 4.6,
    cleanlinessRating: 4.8,
    safetyRating: 4.7,
    wifiRating: 4.9,
    managementRating: 4.5,
    valueRating: 4.2,
    comment: 'Incredible amenities and international vibe. High-speed dual fiber lines never drop even during heavy rains. Expensive but 100% worth it if you have the budget.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-10T16:50:00Z',
  },
  {
    id: 7,
    hostelId: 3,
    userId: null,
    foodRating: 4.2,
    cleanlinessRating: 4.7,
    safetyRating: 4.5,
    wifiRating: 4.8,
    managementRating: 4.0,
    valueRating: 3.9,
    comment: 'The common lounge and gym are top notch. Food variety is unbeatable with both health bowls and regular Indian meals.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-24T13:00:00Z',
  },
  {
    id: 8,
    hostelId: 4,
    userId: null,
    foodRating: 3.8,
    cleanlinessRating: 3.5,
    safetyRating: 4.0,
    wifiRating: 3.5,
    managementRating: 3.8,
    valueRating: 4.8,
    comment: 'Very affordable for JNTU students. Within 5 minutes walking distance to campus gate. Food is simple South Indian, but unlimited and hearty.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-18T19:10:00Z',
  },
  {
    id: 9,
    hostelId: 4,
    userId: null,
    foodRating: 3.5,
    cleanlinessRating: 3.8,
    safetyRating: 4.0,
    wifiRating: 3.2,
    managementRating: 4.0,
    valueRating: 4.7,
    comment: 'Great value for money. Rent is just 5500 with food included. Roommates are all engineering students so group study is easy.',
    recommend: true,
    verifiedStudent: false,
    status: 'APPROVED',
    createdAt: '2026-08-29T08:30:00Z',
  },
  {
    id: 10,
    hostelId: 7,
    userId: null,
    foodRating: 4.3,
    cleanlinessRating: 4.6,
    safetyRating: 4.5,
    wifiRating: 4.4,
    managementRating: 4.2,
    valueRating: 4.3,
    comment: 'Quiet and green surroundings near Botanical Gardens. Great study desk in the room and gym is maintained well.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-22T17:00:00Z',
  },
  {
    id: 11,
    hostelId: 6,
    userId: null,
    foodRating: 3.9,
    cleanlinessRating: 3.7,
    safetyRating: 4.1,
    wifiRating: 4.5,
    managementRating: 3.8,
    valueRating: 4.2,
    comment: 'WiFi speed is 200 Mbps as promised. Sometimes traffic noise from main road, but metro connectivity is super convenient.',
    recommend: true,
    verifiedStudent: true,
    status: 'APPROVED',
    createdAt: '2026-08-26T12:45:00Z',
  },
  {
    id: 12,
    hostelId: 1,
    userId: null,
    foodRating: 4.0,
    cleanlinessRating: 4.0,
    safetyRating: 4.0,
    wifiRating: 4.0,
    managementRating: 4.0,
    valueRating: 4.0,
    comment: 'Just moved in this week. First impression is positive, food is tasty and warden was helpful.',
    recommend: true,
    verifiedStudent: true,
    status: 'PENDING',
    createdAt: '2026-09-04T11:10:00Z',
  },
  {
    id: 13,
    hostelId: 2,
    userId: null,
    foodRating: 5.0,
    cleanlinessRating: 5.0,
    safetyRating: 5.0,
    wifiRating: 5.0,
    managementRating: 5.0,
    valueRating: 5.0,
    comment: 'Extremely safe and comfortable. Highly recommended for students who prioritize peace of mind.',
    recommend: true,
    verifiedStudent: true,
    status: 'PENDING',
    createdAt: '2026-09-04T13:25:00Z',
  },
];

const initialReports: ReviewReport[] = [
  {
    id: 1,
    reviewId: 8,
    reportedBy: 'Anonymous Student',
    reason: 'Inaccurate comment on water timings',
    status: 'PENDING',
    createdAt: '2026-08-30T10:00:00Z',
  },
];

function loadDB(): DB {
  let db: any;
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // Fallback
    }
  }
  if (!db) {
    db = {
      facilities: initialFacilities,
      hostels: initialHostels,
      foodUpdates: initialFoodUpdates,
      reviews: initialReviews,
      reports: initialReports,
    };
  }
  ensureWardenData(db);
  return db as DB;
}

function saveDB(db: DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Score Calculation Logic (Section 15 & 16)
// Food: 25%, Cleanliness: 20%, Safety: 20%, Management: 15%, Facilities: 10%, Value: 10%
function calculateReviewScore(r: Review): number {
  const weighted =
    r.foodRating * 0.25 +
    r.cleanlinessRating * 0.20 +
    r.safetyRating * 0.20 +
    r.managementRating * 0.15 +
    r.wifiRating * 0.10 +
    r.valueRating * 0.10;
  return Math.round(weighted * 10) / 10;
}

function calculateAggregateRatings(reviews: Review[]) {
  if (!reviews || reviews.length === 0) {
    return {
      overallScore: 0.0,
      recentScore: 0.0,
      totalReviews: 0,
      food: 0.0,
      cleanliness: 0.0,
      safety: 0.0,
      wifi: 0.0,
      management: 0.0,
      value: 0.0,
      recommendationRate: 0.0,
    };
  }

  const count = reviews.length;
  let sumFood = 0;
  let sumClean = 0;
  let sumSafety = 0;
  let sumWifi = 0;
  let sumMgmt = 0;
  let sumVal = 0;
  let recommends = 0;

  const now = new Date().getTime();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  let recentWeightedSum = 0;
  let recentWeightsTotal = 0;

  for (const r of reviews) {
    sumFood += r.foodRating;
    sumClean += r.cleanlinessRating;
    sumSafety += r.safetyRating;
    sumWifi += r.wifiRating;
    sumMgmt += r.managementRating;
    sumVal += r.valueRating;
    if (r.recommend) recommends++;

    const score = calculateReviewScore(r);
    const reviewTime = new Date(r.createdAt).getTime();
    const isRecent = now - reviewTime <= ninetyDaysMs;
    const mult = isRecent ? 1.5 : 1.0;
    recentWeightedSum += score * mult;
    recentWeightsTotal += mult;
  }

  const avgFood = Math.round((sumFood / count) * 10) / 10;
  const avgClean = Math.round((sumClean / count) * 10) / 10;
  const avgSafety = Math.round((sumSafety / count) * 10) / 10;
  const avgWifi = Math.round((sumWifi / count) * 10) / 10;
  const avgMgmt = Math.round((sumMgmt / count) * 10) / 10;
  const avgVal = Math.round((sumVal / count) * 10) / 10;

  const overallScore =
    Math.round(
      (avgFood * 0.25 +
        avgClean * 0.20 +
        avgSafety * 0.20 +
        avgMgmt * 0.15 +
        avgWifi * 0.10 +
        avgVal * 0.10) *
        10
    ) / 10;

  const recentScore =
    recentWeightsTotal > 0
      ? Math.round((recentWeightedSum / recentWeightsTotal) * 10) / 10
      : overallScore;

  const recommendationRate = Math.round((recommends / count) * 100);

  return {
    overallScore,
    recentScore,
    totalReviews: count,
    food: avgFood,
    cleanliness: avgClean,
    safety: avgSafety,
    wifi: avgWifi,
    management: avgMgmt,
    value: avgVal,
    recommendationRate,
  };
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371 * c * 10) / 10;
}

function mapHostelDTO(h: Hostel, db: DB, userLat?: number, userLng?: number) {
  const approvedReviews = db.reviews.filter(
    (r) => r.hostelId === h.id && r.status === 'APPROVED'
  );
  const ratingBreakdown = calculateAggregateRatings(approvedReviews);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFood =
    db.foodUpdates.find((f) => f.hostelId === h.id && f.foodDate === todayStr) ||
    db.foodUpdates.find((f) => f.hostelId === h.id);

  const facilityMap = new Map(db.facilities.map((f) => [f.id, f.name]));
  const facilityNames = h.facilityIds.map((id) => facilityMap.get(id) || '').filter(Boolean);

  let distanceKm: number | undefined;
  if (userLat !== undefined && userLng !== undefined) {
    distanceKm = calculateDistanceKm(userLat, userLng, h.latitude, h.longitude);
  }

  return {
    id: h.id,
    name: h.name,
    description: h.description,
    address: h.address,
    area: h.area,
    city: h.city,
    state: h.state,
    pincode: h.pincode,
    latitude: h.latitude,
    longitude: h.longitude,
    hostelType: h.hostelType,
    monthlyRent: h.monthlyRent,
    deposit: h.deposit,
    foodAvailable: h.foodAvailable,
    verified: h.verified,
    status: h.status,
    distanceKm,
    rating: ratingBreakdown.overallScore,
    reviewCount: ratingBreakdown.totalReviews,
    ratingBreakdown,
    facilities: facilityNames,
    coverImage: h.coverImage || (h.images && h.images.length > 0 ? h.images[0] : null),
    images: h.images || [],
    wardenName: h.wardenName || null,
    wardenPhone: h.wardenPhone || null,
    wardenEmail: h.wardenEmail || null,
    gateClosingTime: h.gateClosingTime || null,
    upiId: h.upiId || null,
    rules: h.rules || [],
    todayFood: todayFood
      ? {
          id: todayFood.id,
          hostelId: h.id,
          hostelName: h.name,
          foodDate: todayFood.foodDate,
          breakfast: todayFood.breakfast,
          lunch: todayFood.lunch,
          dinner: todayFood.dinner,
          imageUrl: todayFood.imageUrl,
          foodRating: ratingBreakdown.food,
        }
      : null,
  };
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Hostel Map API', timestamp: new Date().toISOString() });
});

// 1. Config endpoint: provides public config like MAP_API_KEY
app.get('/api/config', (req: Request, res: Response) => {
  const mapKey = process.env.MAP_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  res.json({
    success: true,
    data: {
      mapApiKey: mapKey,
      appName: 'Hostel Map',
      defaultCenter: { lat: 17.4435, lng: 78.3582 }, // Gachibowli, Hyderabad
    },
  });
});

// 2. Facilities
app.get('/api/facilities', (req: Request, res: Response) => {
  const db = loadDB();
  res.json({ success: true, data: db.facilities });
});

// 3. Search Hostels
app.get('/api/hostels/search', (req: Request, res: Response) => {
  const db = loadDB();
  const q = ((req.query.q as string) || '').trim().toLowerCase();

  let results = db.hostels.filter((h) => h.status === 'ACTIVE');
  if (q) {
    results = results.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
    );
  }

  const dtos = results.map((h) => mapHostelDTO(h, db));
  res.json({ success: true, data: dtos });
});

// 4. Nearby Hostels
app.get('/api/hostels/nearby', (req: Request, res: Response) => {
  const db = loadDB();
  const lat = parseFloat(req.query.latitude as string);
  const lng = parseFloat(req.query.longitude as string);
  const radius = parseFloat((req.query.radius as string) || '15');

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, message: 'Valid latitude and longitude required' });
  }

  const nearby = db.hostels
    .filter((h) => h.status === 'ACTIVE')
    .map((h) => mapHostelDTO(h, db, lat, lng))
    .filter((h) => (h.distanceKm ?? 999) <= radius)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  res.json({ success: true, data: nearby });
});

// 5. Get All Hostels (with multi-criteria filter support)
app.get('/api/hostels', (req: Request, res: Response) => {
  const db = loadDB();
  let hostels = db.hostels.filter((h) => h.status === 'ACTIVE');

  // Filter: hostelType (BOYS, GIRLS, CO_LIVING)
  const type = req.query.type as string;
  if (type && type !== 'ALL') {
    hostels = hostels.filter((h) => h.hostelType === type);
  }

  // Filter: Price Range
  const priceRange = req.query.priceRange as string;
  if (priceRange) {
    if (priceRange === 'BELOW_5000') {
      hostels = hostels.filter((h) => h.monthlyRent < 5000);
    } else if (priceRange === '5000_8000') {
      hostels = hostels.filter((h) => h.monthlyRent >= 5000 && h.monthlyRent <= 8000);
    } else if (priceRange === '8000_12000') {
      hostels = hostels.filter((h) => h.monthlyRent > 8000 && h.monthlyRent <= 12000);
    } else if (priceRange === '12000_PLUS') {
      hostels = hostels.filter((h) => h.monthlyRent > 12000);
    }
  }

  // Filter: Food
  if (req.query.food === 'true') {
    hostels = hostels.filter((h) => h.foodAvailable);
  }

  // Filter: Facilities (e.g. WiFi=1, AC=3, Laundry=4)
  const facilityFilter = req.query.facility as string;
  if (facilityFilter) {
    const facIds = facilityFilter.split(',').map((id) => parseInt(id.trim())).filter(Boolean);
    if (facIds.length > 0) {
      hostels = hostels.filter((h) => facIds.every((fid) => h.facilityIds.includes(fid)));
    }
  }

  let dtos = hostels.map((h) => mapHostelDTO(h, db));

  // Filter: Rating (4+, 3+)
  const minRating = parseFloat(req.query.minRating as string);
  if (!isNaN(minRating)) {
    dtos = dtos.filter((h) => h.rating >= minRating);
  }

  res.json({ success: true, data: dtos });
});

// 6. Get Hostel Details by ID
app.get('/api/hostels/:id', (req: Request, res: Response) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  const hostel = db.hostels.find((h) => h.id === id);

  if (!hostel) {
    return res.status(404).json({ success: false, message: 'Hostel not found' });
  }

  const dto = mapHostelDTO(hostel, db);
  res.json({ success: true, data: dto });
});

// 7. Get Approved Reviews for a Hostel
app.get('/api/hostels/:id/reviews', (req: Request, res: Response) => {
  const db = loadDB();
  const id = parseInt(req.params.id);

  // Strict privacy: only APPROVED, and authorName is strictly "Anonymous Student"
  const reviews = db.reviews
    .filter((r) => r.hostelId === id && r.status === 'APPROVED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      id: r.id,
      hostelId: r.hostelId,
      authorName: 'Anonymous Student',
      verifiedStudent: r.verifiedStudent,
      foodRating: r.foodRating,
      cleanlinessRating: r.cleanlinessRating,
      safetyRating: r.safetyRating,
      wifiRating: r.wifiRating,
      managementRating: r.managementRating,
      valueRating: r.valueRating,
      weightedScore: calculateReviewScore(r),
      comment: r.comment,
      recommend: r.recommend,
      createdAt: r.createdAt,
    }));

  res.json({ success: true, data: reviews });
});

// 8. Submit Anonymous Student Review
app.post('/api/hostels/:id/reviews', (req: Request, res: Response) => {
  const db = loadDB();
  const hostelId = parseInt(req.params.id);
  const hostel = db.hostels.find((h) => h.id === hostelId);

  if (!hostel) {
    return res.status(404).json({ success: false, message: 'Hostel not found' });
  }

  const {
    foodRating,
    cleanlinessRating,
    safetyRating,
    wifiRating,
    managementRating,
    valueRating,
    comment,
    recommend,
    verifiedStudent,
  } = req.body;

  // Validation
  const ratings = [foodRating, cleanlinessRating, safetyRating, wifiRating, managementRating, valueRating];
  for (const r of ratings) {
    const num = parseFloat(r);
    if (isNaN(num) || num < 1 || num > 5) {
      return res.status(400).json({ success: false, message: 'All ratings must be between 1.0 and 5.0' });
    }
  }

  if (comment && comment.length > 1000) {
    return res.status(400).json({ success: false, message: 'Comment exceeds 1000 characters limit' });
  }

  const newReview: Review = {
    id: Date.now(),
    hostelId,
    userId: null, // Keep detached from public view
    foodRating: Math.round(parseFloat(foodRating) * 10) / 10,
    cleanlinessRating: Math.round(parseFloat(cleanlinessRating) * 10) / 10,
    safetyRating: Math.round(parseFloat(safetyRating) * 10) / 10,
    wifiRating: Math.round(parseFloat(wifiRating) * 10) / 10,
    managementRating: Math.round(parseFloat(managementRating) * 10) / 10,
    valueRating: Math.round(parseFloat(valueRating) * 10) / 10,
    comment: (comment || '').trim(),
    recommend: recommend !== false,
    verifiedStudent: verifiedStudent === true,
    status: 'APPROVED', // For active demo and user experience, auto-approve with moderation controls
    createdAt: new Date().toISOString(),
  };

  db.reviews.push(newReview);
  saveDB(db);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully! Thank you for sharing your experience.',
    data: {
      id: newReview.id,
      hostelId: newReview.hostelId,
      authorName: 'Anonymous Student',
      verifiedStudent: newReview.verifiedStudent,
      weightedScore: calculateReviewScore(newReview),
    },
  });
});

// 9. Report Review
app.post('/api/reviews/:id/report', (req: Request, res: Response) => {
  const db = loadDB();
  const reviewId = parseInt(req.params.id);
  const review = db.reviews.find((r) => r.id === reviewId);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const { reason, reportedBy } = req.body;
  const newReport: ReviewReport = {
    id: Date.now(),
    reviewId,
    reportedBy: reportedBy || 'Anonymous Student',
    reason: reason || 'Inappropriate content',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  db.reports.push(newReport);
  saveDB(db);

  res.json({
    success: true,
    message: 'Review reported. Our moderation team will investigate promptly.',
  });
});

// 10. Food endpoints
app.get('/api/hostels/:id/food/today', (req: Request, res: Response) => {
  const db = loadDB();
  const hostelId = parseInt(req.params.id);
  const todayStr = new Date().toISOString().split('T')[0];

  const food =
    db.foodUpdates.find((f) => f.hostelId === hostelId && f.foodDate === todayStr) ||
    db.foodUpdates.find((f) => f.hostelId === hostelId);

  res.json({
    success: true,
    data: food || null,
  });
});

app.post('/api/hostels/:id/food', (req: Request, res: Response) => {
  const db = loadDB();
  const hostelId = parseInt(req.params.id);
  const hostel = db.hostels.find((h) => h.id === hostelId);

  if (!hostel) {
    return res.status(404).json({ success: false, message: 'Hostel not found' });
  }

  const { breakfast, lunch, dinner, foodDate, imageUrl } = req.body;
  if (!breakfast || !lunch || !dinner) {
    return res.status(400).json({ success: false, message: 'Breakfast, lunch, and dinner are required' });
  }

  const date = foodDate || new Date().toISOString().split('T')[0];
  let food = db.foodUpdates.find((f) => f.hostelId === hostelId && f.foodDate === date);

  if (food) {
    food.breakfast = breakfast;
    food.lunch = lunch;
    food.dinner = dinner;
    if (imageUrl) food.imageUrl = imageUrl;
  } else {
    food = {
      id: Date.now(),
      hostelId,
      foodDate: date,
      breakfast,
      lunch,
      dinner,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    };
    db.foodUpdates.push(food);
  }

  saveDB(db);
  res.json({ success: true, message: 'Daily food menu updated successfully', data: food });
});

// 11. Admin Endpoints
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Default demo admin: admin / admin123
  if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
    return res.json({
      success: true,
      message: 'Admin authentication successful',
      data: { token: 'mock_admin_jwt_token_2026', username: 'admin', role: 'ADMIN' },
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials. Use admin / admin123' });
});

app.get('/api/admin/stats', (req: Request, res: Response) => {
  const db = loadDB();
  res.json({
    success: true,
    data: {
      totalHostels: db.hostels.length,
      totalReviews: db.reviews.length,
      pendingReviews: db.reviews.filter((r) => r.status === 'PENDING').length,
      pendingReports: db.reports.filter((r) => r.status === 'PENDING').length,
      totalFoodUpdates: db.foodUpdates.length,
    },
  });
});

app.post('/api/admin/hostels', (req: Request, res: Response) => {
  const db = loadDB();
  const {
    name,
    description,
    address,
    area,
    city,
    state,
    pincode,
    latitude,
    longitude,
    hostelType,
    monthlyRent,
    deposit,
    foodAvailable,
    verified,
    facilityIds,
  } = req.body;

  if (!name || !address || !area || !city || !latitude || !longitude || !monthlyRent) {
    return res.status(400).json({ success: false, message: 'Required hostel fields are missing' });
  }

  const newHostel: Hostel = {
    id: Date.now(),
    name,
    description: description || '',
    address,
    area,
    city,
    state: state || 'Telangana',
    pincode: pincode || '500032',
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    hostelType: hostelType || 'CO_LIVING',
    monthlyRent: parseFloat(monthlyRent),
    deposit: parseFloat(deposit || 0),
    foodAvailable: foodAvailable !== false,
    verified: verified === true,
    status: 'ACTIVE',
    facilityIds: Array.isArray(facilityIds) ? facilityIds : [1, 2, 4, 5],
    createdAt: new Date().toISOString(),
  };

  db.hostels.push(newHostel);
  saveDB(db);

  res.status(201).json({ success: true, message: 'Hostel created successfully', data: mapHostelDTO(newHostel, db) });
});

app.put('/api/admin/hostels/:id', (req: Request, res: Response) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  const hostel = db.hostels.find((h) => h.id === id);

  if (!hostel) {
    return res.status(404).json({ success: false, message: 'Hostel not found' });
  }

  Object.assign(hostel, req.body);
  saveDB(db);

  res.json({ success: true, message: 'Hostel updated successfully', data: mapHostelDTO(hostel, db) });
});

app.patch('/api/admin/hostels/:id/status', (req: Request, res: Response) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  const hostel = db.hostels.find((h) => h.id === id);

  if (!hostel) {
    return res.status(404).json({ success: false, message: 'Hostel not found' });
  }

  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  hostel.status = status;
  saveDB(db);

  res.json({ success: true, message: `Hostel status updated to ${status}` });
});

app.get('/api/admin/reviews', (req: Request, res: Response) => {
  const db = loadDB();
  const status = req.query.status as string;

  let reviews = db.reviews;
  if (status) {
    reviews = reviews.filter((r) => r.status === status);
  }

  const hostelMap = new Map(db.hostels.map((h) => [h.id, h.name]));
  const formatted = reviews.map((r) => ({
    ...r,
    hostelName: hostelMap.get(r.hostelId) || 'Unknown Hostel',
    weightedScore: calculateReviewScore(r),
  }));

  res.json({ success: true, data: formatted });
});

app.patch('/api/admin/reviews/:id/status', (req: Request, res: Response) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  const review = db.reviews.find((r) => r.id === id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const { status } = req.body;
  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  review.status = status;
  saveDB(db);

  res.json({ success: true, message: `Review status updated to ${status}` });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  const db = loadDB();
  const reviewsMap = new Map(db.reviews.map((r) => [r.id, r]));
  const hostelMap = new Map(db.hostels.map((h) => [h.id, h.name]));

  const reports = db.reports.map((rep) => {
    const rev = reviewsMap.get(rep.reviewId);
    return {
      ...rep,
      reviewComment: rev ? rev.comment : 'Review not found',
      hostelName: rev ? hostelMap.get(rev.hostelId) : 'Unknown',
    };
  });

  res.json({ success: true, data: reports });
});

app.patch('/api/admin/reports/:id/status', (req: Request, res: Response) => {
  const db = loadDB();
  const id = parseInt(req.params.id);
  const report = db.reports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const { status } = req.body;
  report.status = status;
  saveDB(db);

  res.json({ success: true, message: `Report status updated to ${status}` });
});

// Register Warden Portal & Feedback APIs
registerWardenRoutes(app, loadDB, saveDB);

// -------------------------------------------------------------
// FRONTEND STATIC FILE SERVING
// -------------------------------------------------------------
const frontendDir = path.join(rootDir, 'frontend');

// Serve static assets from frontend
app.get('/js/markerclusterer.min.js', (req: Request, res: Response) => {
  const markerClustererPath = path.join(rootDir, 'node_modules', '@googlemaps', 'markerclusterer', 'dist', 'index.min.js');
  if (fs.existsSync(markerClustererPath)) {
    res.sendFile(markerClustererPath);
  } else {
    res.redirect('https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js');
  }
});

app.use(express.static(frontendDir));
app.use('/frontend', express.static(frontendDir));

// Route handlers for multi-page vanilla HTML
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/index.html', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/hostel.html', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'hostel.html'));
});

app.get('/review.html', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'review.html'));
});

app.get('/admin.html', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'admin.html'));
});

app.get('/warden.html', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'warden.html'));
});

app.get('/feedback.html', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDir, 'feedback.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hostel Map] Server running on http://0.0.0.0:${PORT}`);
});
