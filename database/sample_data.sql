-- ==========================================================
-- HOSTEL MAP — Realistic Seed Data (Sample Data)
-- ==========================================================

-- 1. Users
-- password_hash for 'admin123' and 'student123' (bcrypt)
INSERT INTO users (id, username, email, phone, password_hash, role) VALUES
(1, 'admin', 'admin@hostelmap.internal', '+919876543210', '$2a$10$w8c3R3cO1k9V4V6Z6j4Y6u0gL1a1t4e8s8p8o8r8t8s8e8c8u8r8e', 'ADMIN'),
(2, 'rahul_kumar', 'rahul@student.ac.in', '+919876543211', '$2a$10$w8c3R3cO1k9V4V6Z6j4Y6u0gL1a1t4e8s8p8o8r8t8s8e8c8u8r8e', 'STUDENT'),
(3, 'priya_sharma', 'priya@student.ac.in', '+919876543212', '$2a$10$w8c3R3cO1k9V4V6Z6j4Y6u0gL1a1t4e8s8p8o8r8t8s8e8c8u8r8e', 'STUDENT'),
(4, 'hostel_owner_raj', 'owner@srivenkateshwara.com', '+919876543213', '$2a$10$w8c3R3cO1k9V4V6Z6j4Y6u0gL1a1t4e8s8p8o8r8t8s8e8c8u8r8e', 'HOSTEL_OWNER');

-- 2. Facilities
INSERT INTO facilities (id, name) VALUES
(1, 'WiFi'),
(2, 'Food Included'),
(3, 'AC Rooms'),
(4, 'Laundry Service'),
(5, 'CCTV Security'),
(6, 'Power Backup'),
(7, 'Hot Water / Geyser'),
(8, 'Attached Washroom'),
(9, '2-Wheeler Parking'),
(10, 'Daily Housekeeping'),
(11, 'Gym'),
(12, 'Study Hall / Desk');

-- 3. Hostels (Hyderabad Student Hubs: Gachibowli, Madhapur, Kondapur, JNTU Kukatpally)
INSERT INTO hostels (id, name, description, address, area, city, state, pincode, latitude, longitude, hostel_type, monthly_rent, deposit, food_available, verified, status) VALUES
(1, 'Sri Venkateshwara Executive Boys Hostel', 'Modern 4-floor student hostel located 800m from DLF Cyber City. High speed fiber internet, 3-times North & South Indian meals, daily housekeeping, and biometric security.', 'Plot 42, Telecom Nagar, Near DLF Gate 3', 'Gachibowli', 'Hyderabad', 'Telangana', '500032', 17.4435000, 78.3582000, 'BOYS', 8500.00, 4000.00, TRUE, TRUE, 'ACTIVE'),
(2, 'Ananya Elite Luxury Girls PG & Hostel', 'Premium safe accommodation for female college students and interns. 24/7 female warden, digital entry logs, CCTV on each floor, nutritional home-cooked food.', 'Road No. 3, Beside Chaitanya College, Kakatiya Hills', 'Madhapur', 'Hyderabad', 'Telangana', '500081', 17.4486000, 78.3908000, 'GIRLS', 9500.00, 5000.00, TRUE, TRUE, 'ACTIVE'),
(3, 'Tribe Co-Living Student Hub', 'Vibrant co-living hostel with dedicated collaborative study lounges, gaming room, high speed dual ISP WiFi, and international breakfast spread.', 'Sy No 115, Financial District, Behind Wipro Circle', 'Gachibowli', 'Hyderabad', 'Telangana', '500032', 17.4208000, 78.3421000, 'CO_LIVING', 14500.00, 10000.00, TRUE, TRUE, 'ACTIVE'),
(4, 'Siddhi Vinayaka Budget Boys Hostel', 'Affordable student stay 5 minutes walk from JNTU Hyderabad campus. Ideal for engineering students preparing for exams. Clean sharing rooms and hygienic food.', 'KPHB 5th Phase, Near JNTU Metro Station', 'JNTU', 'Hyderabad', 'Telangana', '500085', 17.4942000, 78.3912000, 'BOYS', 5500.00, 2000.00, TRUE, TRUE, 'ACTIVE'),
(5, 'Sai Balaji Comfort PG for Girls', 'Comfortable AC and Non-AC rooms near Hitec City MMTS and universities. Strictly vegetarian food, washing machines on each floor, quiet study hours.', 'Lane 4, Silicon Valley, Near Inorbit Mall', 'Madhapur', 'Hyderabad', 'Telangana', '500081', 17.4372000, 78.3845000, 'GIRLS', 7800.00, 3500.00, TRUE, TRUE, 'ACTIVE'),
(6, 'Metro View Modern Boys Hostel', 'Direct view of the metro line, 200 Mbps mesh WiFi in every room, gaming console in common hall, and 3 times chicken weekly.', 'Opposite Pillar 742, KPHB Colony Main Road', 'Kukatpally', 'Hyderabad', 'Telangana', '500072', 17.4890000, 78.4020000, 'BOYS', 6800.00, 3000.00, TRUE, FALSE, 'ACTIVE'),
(7, 'Greenwoods Scholar Living', 'Eco-friendly hostel campus with lush garden, rooftop cafeteria, solar hot water, ergonomic study desks, and gym.', 'Whitefields, Near Botanical Gardens', 'Kondapur', 'Hyderabad', 'Telangana', '500084', 17.4615000, 78.3610000, 'CO_LIVING', 11000.00, 6000.00, TRUE, TRUE, 'ACTIVE'),
(8, 'Padmavathi Ladies Student Home', 'Traditional, caring hostel managed by a senior retired educator. Freshly ground spices, pure filter water, secure gated premise, strict 9 PM curfew.', 'Beside Vignana Jyothi Institute, Bachupally Road', 'Nizampet', 'Hyderabad', 'Telangana', '500090', 17.5140000, 78.3810000, 'GIRLS', 6200.00, 2500.00, TRUE, TRUE, 'ACTIVE'),
(9, 'TechZone Executive PG & Hostel', 'Budget friendly hostel preferred by coding bootcamp and university students. Power backup for non-stop study sessions and uninterrupted internet.', 'Behind Sarath City Capital Mall, Gachibowli-Miyapur Road', 'Kondapur', 'Hyderabad', 'Telangana', '500084', 17.4720000, 78.3540000, 'BOYS', 7200.00, 3000.00, TRUE, FALSE, 'ACTIVE'),
(10, 'CampusNest Premium Student Residency', 'All-inclusive student living with study booths, laundry pickup, daily sanitized rooms, buffet meals, and weekly shuttle to major colleges.', 'Nanakramguda, Near Oakridge International School', 'Financial District', 'Hyderabad', 'Telangana', '500032', 17.4150000, 78.3490000, 'CO_LIVING', 13500.00, 8000.00, TRUE, TRUE, 'ACTIVE'),
(11, 'Kukatpally Scholars PG for Boys', 'Economical twin and triple sharing rooms right opposite coaching centers and colleges. Unlimited South Indian rice and curd daily.', 'Road No 1, KPHB Phase 1, Near Remedy Hospital', 'Kukatpally', 'Hyderabad', 'Telangana', '500072', 17.4830000, 78.4110000, 'BOYS', 4900.00, 2000.00, TRUE, FALSE, 'ACTIVE'),
(12, 'Starlight International Girls Residency', 'Modern luxury student residency with biometric elevator access, reading library, high speed LAN ports, and dietitian planned meals.', 'Gowlidoddy, Near University of Hyderabad South Gate', 'Gachibowli', 'Hyderabad', 'Telangana', '500075', 17.4310000, 78.3390000, 'GIRLS', 10500.00, 5000.00, TRUE, TRUE, 'ACTIVE');

-- 4. Hostel Facilities mappings
INSERT INTO hostel_facilities (hostel_id, facility_id) VALUES
-- Sri Venkateshwara (1)
(1, 1), (1, 2), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 10),
-- Ananya Elite (2)
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 10), (2, 12),
-- Tribe Co-Living (3)
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12),
-- Siddhi Vinayaka (4)
(4, 1), (4, 2), (4, 5), (4, 6), (4, 7), (4, 9),
-- Sai Balaji (5)
(5, 1), (5, 2), (5, 4), (5, 5), (5, 6), (5, 7), (5, 8), (5, 10),
-- Metro View (6)
(6, 1), (6, 2), (6, 5), (6, 6), (6, 7), (6, 9), (6, 10),
-- Greenwoods (7)
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9), (7, 10), (7, 11), (7, 12),
-- Padmavathi (8)
(8, 1), (8, 2), (8, 5), (8, 6), (8, 7), (8, 8), (8, 10),
-- TechZone (9)
(9, 1), (9, 2), (9, 4), (9, 5), (9, 6), (9, 7), (9, 9),
-- CampusNest (10)
(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8), (10, 10), (10, 11), (10, 12),
-- Kukatpally Scholars (11)
(11, 1), (11, 2), (11, 5), (11, 7), (11, 9),
-- Starlight International (12)
(12, 1), (12, 2), (12, 3), (12, 4), (12, 5), (12, 6), (12, 7), (12, 8), (12, 10), (12, 12);

-- 5. Food Updates (Today's food menu)
INSERT INTO food_updates (hostel_id, food_date, breakfast, lunch, dinner, image_url) VALUES
(1, CURRENT_DATE, 'Ghee Karam Dosa + Coconut Chutney + Tea/Coffee', 'Basmati Rice + Tomato Pappu + Chicken Curry / Paneer Butter Masala + Curd', 'Phulka Rotis (unlimited) + Aloo Gobi + Dal Tadka + Gulab Jamun', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'),
(2, CURRENT_DATE, 'Steamed Idly & Medu Vada + Sambar + Peanut Chutney', 'Jeera Rice + Mixed Dal Tadka + Bhindi Fry + Fresh Curd & Papad', 'Soft Rotis + Paneer Tikka Masala + Steamed Rice + Rasam', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'),
(3, CURRENT_DATE, 'Poha / Oats / Eggs to order + Fresh Juice & Cold Brew', 'Continental Bowl + Mexican Rice / Dal Khichdi + Mint Raita', 'Woodfire style flatbreads + Kadai Mushroom / Butter Chicken + Salad bar', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'),
(4, CURRENT_DATE, 'Upma with Podi & Chutney + Hot Tea', 'White Rice + Gongura Pappu + Egg Curry / Sambar + Buttermilk', 'Chapati + Mixed Veg Kurma + Curd Rice', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'),
(5, CURRENT_DATE, 'Mysore Bonda + Ginger Chutney + Filter Coffee', 'Steamed Rice + Palak Dal + Raw Banana Fry + Rasam + Curd', 'Phulka + Paneer Mutter + Dal Fry + Sweet Kheer', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'),
(6, CURRENT_DATE, 'Puri & Aloo Masala + Masala Tea', 'Bagara Rice + Chicken Sherva / Veg Paneer Curry + Onion Raita', 'Roti + Dal Makhani + White Rice + Curd', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'),
(7, CURRENT_DATE, 'Multi-grain Paratha with Curd + Herbal Tea', 'Brown / White Rice + Drumstick Sambar + Beetroot Poriyal + Curd', 'Millet Rotis + Methi Chaman + Yellow Dal + Green Salad', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'),
(8, CURRENT_DATE, 'Rava Idly with Ghee + Sambar + Filter Coffee', 'Traditional South Indian Thali (Pappu, Vepudu, Rasam, Curd)', 'Chapati + Aloo Palak + Rice + More-Kuzhambu', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'),
(9, CURRENT_DATE, 'Semiya Upma + Coconut Chutney + Tea', 'White Rice + Tomato Dal + Egg Bhurji / Soya Chunks Curry', 'Rotis + Chana Masala + Curd Rice', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'),
(10, CURRENT_DATE, 'Continental & South Indian Breakfast Buffet', 'Hyderabadi Dum Biryani (Chicken/Veg) + Mirchi ka Salan + Raita', 'Gourmet Rotis + Paneer Lababdar + Dal Bukhara + Fruit Custard', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'),
(11, CURRENT_DATE, 'Pulihora & Curd Rice + Tea', 'Full Meals with Pappu, Sambar, Majjiga (Buttermilk)', 'Hot Chapatis + Mixed Veg Curry + Rice', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'),
(12, CURRENT_DATE, 'Alu Paratha with Amul Butter + Green Chutney + Coffee', 'Veg Pulao + Dal Tadka + Paneer Korma + Fresh Salad & Curd', 'Phulkas + Shahi Paneer + Steamed Rice + Rasam', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80');

-- 6. Reviews (Realistic student reviews, weighted ratings, approved status)
INSERT INTO reviews (hostel_id, user_id, food_rating, cleanliness_rating, safety_rating, wifi_rating, management_rating, value_rating, comment, recommend, verified_student, status, created_at) VALUES
-- Sri Venkateshwara (1)
(1, 2, 4.5, 4.0, 4.8, 4.2, 4.0, 4.5, 'Staying here for 8 months now. The food is much better than typical PGs in Gachibowli, especially Sunday chicken biryani. Wi-Fi has low latency which helps for online exams.', TRUE, TRUE, 'APPROVED', '2026-08-15 10:30:00'),
(1, NULL, 4.0, 4.5, 4.5, 3.8, 4.2, 4.0, 'Hot water available 24/7 without fail. Rooms cleaned daily. Safe biometric entrance and peaceful study environment.', TRUE, TRUE, 'APPROVED', '2026-08-28 14:15:00'),
(1, NULL, 3.8, 4.0, 4.2, 4.0, 3.5, 4.0, 'Management responds within a day if there is any plumbing issue. Rent is reasonable compared to nearby towers.', TRUE, FALSE, 'APPROVED', '2026-09-01 09:00:00'),

-- Ananya Elite (2)
(2, 3, 4.8, 4.9, 5.0, 4.5, 4.7, 4.6, 'Best girls hostel in Madhapur area. Warden aunty is super supportive and caring. Security is strictly monitored with biometric and CCTV. Food is like home cooking.', TRUE, TRUE, 'APPROVED', '2026-08-20 18:40:00'),
(2, NULL, 4.5, 4.8, 4.9, 4.2, 4.5, 4.4, 'Very close to metro and bus stops. Rooms have good ventilation and high quality beds. Washing machines are always in working order.', TRUE, TRUE, 'APPROVED', '2026-08-30 11:20:00'),

-- Tribe Co-Living (3)
(3, NULL, 4.6, 4.8, 4.7, 4.9, 4.5, 4.2, 'Incredible amenities and international vibe. High-speed dual fiber lines never drop even during heavy rains. Expensive but 100% worth it if you have the budget.', TRUE, TRUE, 'APPROVED', '2026-08-10 16:50:00'),
(3, NULL, 4.2, 4.7, 4.5, 4.8, 4.0, 3.9, 'The common lounge and gym are top notch. Food variety is unbeatable with both health bowls and regular Indian meals.', TRUE, TRUE, 'APPROVED', '2026-08-24 13:00:00'),

-- Siddhi Vinayaka (4)
(4, NULL, 3.8, 3.5, 4.0, 3.5, 3.8, 4.8, 'Very affordable for JNTU students. Within 5 minutes walking distance to campus gate. Food is simple South Indian, but unlimited and hearty.', TRUE, TRUE, 'APPROVED', '2026-08-18 19:10:00'),
(4, NULL, 3.5, 3.8, 4.0, 3.2, 4.0, 4.7, 'Great value for money. Rent is just 5500 with food included. Roommates are all engineering students so group study is easy.', TRUE, FALSE, 'APPROVED', '2026-08-29 08:30:00'),

-- Greenwoods (7)
(7, NULL, 4.3, 4.6, 4.5, 4.4, 4.2, 4.3, 'Quiet and green surroundings near Botanical Gardens. Great study desk in the room and gym is maintained well.', TRUE, TRUE, 'APPROVED', '2026-08-22 17:00:00'),

-- Metro View (6)
(6, NULL, 3.9, 3.7, 4.1, 4.5, 3.8, 4.2, 'WiFi speed is 200 Mbps as promised. Sometimes traffic noise from main road, but metro connectivity is super convenient.', TRUE, TRUE, 'APPROVED', '2026-08-26 12:45:00'),

-- Pending Reviews for Admin Moderation demo
(1, NULL, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 'Just moved in this week. First impression is positive, food is tasty and warden was helpful.', TRUE, TRUE, 'PENDING', '2026-09-04 11:10:00'),
(2, NULL, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 'Extremely safe and comfortable. Highly recommended for students who prioritize peace of mind.', TRUE, TRUE, 'PENDING', '2026-09-04 13:25:00');

-- 7. Review Reports
INSERT INTO review_reports (id, review_id, reported_by, reason, status) VALUES
(1, 4, 'Anonymous Student', 'Inaccurate information about water timings', 'PENDING');
