const products = [
  // --- BANNER HERO ITEMS ---
  {
    "id": "hero-001",
    "type": "banner",
    "name": "Malta 3 Seater Sofa",
    "category": "Sofa",
    "description": "A comfortable 3-seater sofa with velvet finish.",
    "price": 399.,
    "currency": "GBP",
    "image": "./assets/images/banner-1.jpg",
    "link": "#",
    "badge": "trending item"
  },
  {
    "id": "hero-002",
    "type": "banner",
    "name": "Sycylia High Gloss Sliding Door Wardrobe New Branding",
    "category": "Accessories",
    "description": "Stylish protection for sunny days.",
    "price": 15.00,
    "currency": "USD",
    "image": "https://slidingwardrobes4u.com/wp-content/uploads/2025/06/White-sycylia-3-door-with-LED-Light-sliding-door-1536x1536.jpg",
    "link": "#",
    "badge": "Trending accessories"
  },

  // --- DEAL OF THE DAY (Featured with Timer & Stock) ---
  {
    "id": "deal-001",
    "type": "deal",
    "name": "Shampoo, Conditioner & Facewash Packs",
    "category": "Cosmetics",
    "description": "Complete care package for your daily routine. Limited time offer.",
    "price": 150.00,
    "original_price": 200.00,
    "currency": "USD",
    "rating": 3,
    "image": "https://slidingwardrobes4u.com/wp-content/uploads/2024/03/white-oak-2-1536x1536.jpg",
    "stock_status": {
      "sold": 20,
      "available": 40,
      "total": 60
    },
    "offer_end_date": "2025-12-31T23:59:59" 
  },
  {
    "id": "deal-002",
    "type": "deal",
    "name": "Rose Gold Diamond Earring",
    "category": "Jewellery",
    "description": "Elegant rose gold earrings embedded with premium diamonds.",
    "price": 1990.00,
    "original_price": 2000.00,
    "currency": "USD",
    "rating": 5,
    "image": "./assets/images/products/jewellery-1.jpg",
    "stock_status": {
      "sold": 15,
      "available": 40,
      "total": 55
    },
    "offer_end_date": "2025-12-31T23:59:59"
  },

  // --- STANDARD FURNITURE PRODUCTS (Grid & New Arrivals) ---
  {
    "id": "prod-101",
    "name": "Mens Winter Leathers Jackets",
    "category": "Jacket",
    "price": 48.00,
    "original_price": 75.00,
    "currency": "USD",
    "rating": 4,
    "images": {
      "default": "./assets/images/products/jacket-3.jpg",
      "hover": "./assets/images/products/jacket-4.jpg"
    },
    "badges": [
      { "text": "15%", "color": "ocean-green", "type": "rect" }
    ],
    "actions": ["heart", "eye", "repeat", "bag"],
    "is_new_arrival": false,
    "is_best_seller": false
  },
  {
    "id": "prod-102",
    "name": "Pure Garment Dyed Cotton Shirt",
    "category": "Shirt",
    "price": 45.00,
    "original_price": 56.00,
    "currency": "USD",
    "rating": 5,
    "images": {
      "default": "./assets/images/products/shirt-1.jpg",
      "hover": "./assets/images/products/shirt-2.jpg"
    },
    "badges": [
      { "text": "sale", "color": "eerie-black", "type": "angle" }
    ],
    "is_new_arrival": true,
    "is_best_seller": false
  },
  {
    "id": "prod-103",
    "name": "Black Floral Wrap Midi Skirt",
    "category": "Skirt",
    "price": 25.00,
    "original_price": 35.00,
    "currency": "USD",
    "rating": 5,
    "images": {
      "default": "./assets/images/products/clothes-3.jpg",
      "hover": "./assets/images/products/clothes-4.jpg"
    },
    "badges": [
      { "text": "new", "color": "salmon-pink", "type": "angle" }
    ],
    "is_new_arrival": true,
    "is_best_seller": false
  },
  {
    "id": "prod-104",
    "name": "Casual Men's Brown Shoes",
    "category": "Casual",
    "price": 99.00,
    "original_price": 105.00,
    "currency": "USD",
    "rating": 5,
    "images": {
      "default": "./assets/images/products/shoe-2.jpg",
      "hover": "./assets/images/products/shoe-2_1.jpg"
    },
    "badges": [],
    "is_new_arrival": false,
    "is_best_seller": true
  },
  {
    "id": "prod-105",
    "name": "Pocket Watch Leather Pouch",
    "category": "Watches",
    "price": 150.00,
    "original_price": 170.00,
    "currency": "USD",
    "rating": 4,
    "images": {
      "default": "./assets/images/products/watch-3.jpg",
      "hover": "./assets/images/products/watch-4.jpg"
    },
    "badges": [
  { "text": "new", "color": "pink", "type": "angle" } // Changed salmon-pink to pink
],
    "is_new_arrival": false,
    "is_best_seller": false
  }
];