import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'hostel_db.json');

const hostelPhotos = {
  1: {
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80"
    ]
  },
  2: {
    coverImage: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1000&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&auto=format&fit=crop&q=80"
    ]
  },
  3: {
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80"
    ]
  },
  4: {
    coverImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&auto=format&fit=crop&q=80"
    ]
  },
  5: {
    coverImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80"
    ]
  }
};

const defaultHostelImages = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80"
];

const roomPhotosBySharing = {
  Single: [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80"
  ],
  "2-Share": [
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80"
  ],
  "3-Share": [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"
  ],
  "4-Share": [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&auto=format&fit=crop&q=80"
  ]
};

try {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  // 1. Enrich hostels
  if (Array.isArray(db.hostels)) {
    db.hostels.forEach((h, idx) => {
      const custom = hostelPhotos[h.id];
      if (custom) {
        h.coverImage = custom.coverImage;
        h.images = custom.images;
      } else {
        h.coverImage = defaultHostelImages[idx % defaultHostelImages.length];
        h.images = [
          h.coverImage,
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=1000&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80"
        ];
      }
    });
  }

  // 2. Enrich rooms
  if (Array.isArray(db.rooms)) {
    db.rooms.forEach((r, idx) => {
      const photos = roomPhotosBySharing[r.sharingType] || roomPhotosBySharing["2-Share"];
      r.imageUrl = photos[idx % photos.length];
      r.photos = [
        r.imageUrl,
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80" // attached bathroom
      ];
    });
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`Successfully enriched ${db.hostels.length} hostels and ${db.rooms.length} rooms with pictures!`);
} catch (e) {
  console.error('Error enriching photos:', e);
  process.exit(1);
}
