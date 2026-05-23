const db = require('../config/db');

async function runSeed() {
  console.log('[Database Seed] Starting database seeding...');

  try {
    // 1. Seed Default User (Password: 'password123')
    console.log('[Database Seed] Seeding users...');
    const userRes = await db.query(`
      INSERT INTO users (email, password_hash, name, phone)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `, ['amit.kumar@example.com', '$2b$10$Ep.CjGq.z7hKkLz634.y/.Gj4V93D6d9e0u2q8yL.n8i6L1q2m3o4', 'Amit Kumar', '9876543210']);

    const userId = userRes.rows[0].id;
    console.log(`[Database Seed] Seeded default user with ID: ${userId}`);

    // 2. Seed Default Addresses
    console.log('[Database Seed] Seeding addresses...');
    await db.query(`
      INSERT INTO addresses (user_id, name, phone, pincode, locality, address_line, city, state, landmark, address_type, is_default)
      VALUES 
      ($1, 'Amit Kumar (Home)', '9876543210', '700091', 'Salt Lake Sector V', 'Block EP & GP, Sector V', 'Kolkata', 'West Bengal', 'Near College More', 'home', true),
      ($1, 'Amit Kumar (Office)', '9900887766', '560103', 'Outer Ring Road', 'EcoSpace Business Park, Tower 2B, Bellandur', 'Bengaluru', 'Karnataka', 'Next to Central Mall', 'work', false)
      ON CONFLICT DO NOTHING;
    `, [userId]);

    // 3. Seed Categories (4 Categories: Mobiles, Electronics, Fashion, Home & Kitchen)
    console.log('[Database Seed] Seeding categories...');
    const categories = [
      { name: 'Mobiles', slug: 'mobiles', image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=150&q=80' },
      { name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80' },
      { name: 'Fashion', slug: 'fashion', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80' },
      { name: 'Home & Kitchen', slug: 'home-kitchen', image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=150&q=80' }
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const catRes = await db.query(`
        INSERT INTO categories (name, slug, image_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url
        RETURNING id, name;
      `, [cat.name, cat.slug, cat.image_url]);
      categoryIds[cat.slug] = catRes.rows[0].id;
    }
    console.log('[Database Seed] Seeded categories successfully.');

    // 4. Seed Products (5 per category, total 20 products)
    console.log('[Database Seed] Seeding products...');

    const products = [
      // ========== MOBILES (5 products) ==========
      {
        category_id: categoryIds['mobiles'],
        title: 'Apple iPhone 15 Pro (Natural Titanium, 128 GB)',
        brand: 'Apple',
        description: 'iPhone 15 Pro forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
        price: 119900.00,
        original_price: 134900.00,
        stock: 15,
        rating: 4.70,
        rating_count: 1420,
        review_count: 120,
        specifications: {
          'Model Name': 'iPhone 15 Pro',
          'Color': 'Natural Titanium',
          'Internal Storage': '128 GB',
          'RAM': '8 GB',
          'Processor': 'A17 Pro Chip',
          'Primary Camera': '48MP + 12MP + 12MP',
          'Screen Size': '6.1 inch Super Retina XDR'
        },
        images: [
          'https://goldenshield.in/cdn/shop/files/15prothincase_2_5039f0da-9034-4d12-ac51-37d6ff46eff3.jpg?v=1718351594&width=2048',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTqlFivdS7VVi1g-IgAdmtm2nGoXUMJuEL-XKmQloXI3XZ1sXVXioQPg1KdhRw9yr3Zl_d3uBXef0dumOHX2T-PmdxN1lhipmiDuCENxeIZ26_j_q2Pg2K731XifK7EvKYqbFnfcaSBOA&usqp=CAc'
        ]
      },
      {
        category_id: categoryIds['mobiles'],
        title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)',
        brand: 'Samsung',
        description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
        price: 109999.00,
        original_price: 129999.00,
        stock: 25,
        rating: 4.80,
        rating_count: 890,
        review_count: 85,
        specifications: {
          'Model Name': 'Galaxy S24 Ultra',
          'Color': 'Titanium Gray',
          'Internal Storage': '256 GB',
          'RAM': '12 GB',
          'Processor': 'Snapdragon 8 Gen 3',
          'Primary Camera': '200MP + 50MP + 12MP + 10MP',
          'Screen Size': '6.8 inch QHD+'
        },
        images: [
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTBqZChhLwbNhYmWuwuTrCGL6EtV71PGGmusLDeIbTs2QS6pTbGEuqlXovDccb3zMOD7WVPc5CIsCrWsRseI6nN6gtkLmT3hKbCUFMtBzaMKKzTc3-V-rjCdm8Ex6GVQLpRGMR3rw&usqp=CAc',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSMLJZF7K2RlVSEl44WFjeZ07O9Vmon4e_7n9Jts-B_ortBYLxUvhdI1bXxS3d1JQk5x90ly1yjf7TyO8_AOaLZLX8GtC3nTMRIZ4rygUNQCthdHBf32s9TDQ'
        ]
      },
      {
        category_id: categoryIds['mobiles'],
        title: 'Google Pixel 8 Pro (Obsidian, 128 GB)',
        brand: 'Google',
        description: 'The all-pro phone engineered by Google. Powered by Google Tensor G3, it has advanced photo & video features, and a sleek matte finish.',
        price: 93999.00,
        original_price: 106999.00,
        stock: 12,
        rating: 4.60,
        rating_count: 420,
        review_count: 55,
        specifications: {
          'Model Name': 'Pixel 8 Pro',
          'Color': 'Obsidian',
          'Internal Storage': '128 GB',
          'RAM': '12 GB',
          'Processor': 'Google Tensor G3',
          'Primary Camera': '50MP + 48MP + 48MP',
          'Screen Size': '6.7 inch Super Actua'
        },
        images: [
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRVUQcXKI6PZuJP4zPQMyhSGbJHIOz4W3teRBkar0CSpuYCuWPt45Bx3Kd5EMwRLrgxHSMuktxQ0XoTphB1Way2dV3bIWVjMSCZTVYgSr1mMgiOSw-spWVdZg',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcS_hNcYlPRRQBBsB7Qq1MZebw-y7Psa4rLsZZwHf5S22EUgvsyJury7zZrRZc-Lq_bsaXRHtltqRjqdcSXl13rZVuqbePV_YjpSI-pnYdENSqFhT6n5TTox'
        ]
      },
      {
        category_id: categoryIds['mobiles'],
        title: 'OnePlus 12 5G (Flowy Emerald, 256 GB)',
        brand: 'OnePlus',
        description: 'Elite performance powered by Snapdragon 8 Gen 3, a highly responsive 2K 120Hz display, and 100W SUPERVOOC charging.',
        price: 64999.00,
        original_price: 69999.00,
        stock: 30,
        rating: 4.50,
        rating_count: 2200,
        review_count: 190,
        specifications: {
          'Model Name': 'OnePlus 12',
          'Color': 'Flowy Emerald',
          'Internal Storage': '256 GB',
          'RAM': '12 GB',
          'Processor': 'Snapdragon 8 Gen 3',
          'Primary Camera': '50MP + 48MP + 64MP',
          'Screen Size': '6.82 inch 2K AMOLED'
        },
        images: [
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTWbtzMbDszZKndTSHYmALr1siYfXLNk-0te2-JPH3VAOmQg1ANyNLyaTz1bnTKbGSgKUfmH_h_eu569rC5Ebt18IM8HP8SWbolMeW0GSqC',
          'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRJqiCKq7MfYPFV75ZvaA8nAjLPNBUcJb1--PIs0rC51Tg0fFLr_BJ2y05jYwv-WABba6tD5IspC41MgYHO9A8ajFTpLSwQmewXelvDKyavQ25JvVvdmC4C'
        ]
      },
      {
        category_id: categoryIds['mobiles'],
        title: 'Xiaomi Redmi Note 13 Pro+ (Fusion Black, 256 GB)',
        brand: 'Xiaomi',
        description: 'Features a brilliant 200MP main camera, curved AMOLED display, and 120W HyperCharge capability that charges to 100% in 19 minutes.',
        price: 31999.00,
        original_price: 35999.00,
        stock: 45,
        rating: 4.40,
        rating_count: 15300,
        review_count: 1420,
        specifications: {
          'Model Name': 'Redmi Note 13 Pro+',
          'Color': 'Fusion Black',
          'Internal Storage': '256 GB',
          'RAM': '8 GB',
          'Processor': 'Dimensity 7200 Ultra',
          'Primary Camera': '200MP + 8MP + 2MP',
          'Screen Size': '6.67 inch Curved AMOLED'
        },
        images: [
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR5mqjc0xLKNofLBm58Mg6YPT0nROb0em9i5gqgrfgZZ3ts4MFSYy-bG4CibXt2SaHcYoYMCFY5klhwrqlvNHPU_AAoivkafdARTGVld2bl',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ3wrdMYUCYwGQBHKr1szxRPwGEtcmhFKEXsfS78iuRAu9K16fd0INcI35Da1LA30ZbDZfQ7pLeAzS4jBEV4-Me_ZcB4rT5JllClMtph-1rgjBK3VIhyKTAAQ'
        ]
      },

      // ========== ELECTRONICS (5 products) ==========
      {
        category_id: categoryIds['electronics'],
        title: 'Apple MacBook Air M3 (Space Grey, 8GB RAM, 256GB SSD)',
        brand: 'Apple',
        description: 'MacBook Air sails through work and play - and the M3 chip brings even greater capabilities and advanced AI features to this super-portable laptop.',
        price: 99900.00,
        original_price: 114900.00,
        stock: 12,
        rating: 4.80,
        rating_count: 530,
        review_count: 42,
        specifications: {
          'Model Name': 'MacBook Air M3',
          'Color': 'Space Grey',
          'Processor': 'Apple M3 Chip',
          'RAM': '8 GB Unified',
          'SSD Capacity': '256 GB',
          'Screen Size': '13.6 inch Liquid Retina'
        },
        images: [
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSQidzXPnAMtFjXMkEBpLQSaIJXVBV8qC-k59uDaYpIhK4HkUfWX6v6v0PEkQsSa53WgyzKjt_ZYUDuh0gE6jOw1yb7CNF1tj6RyzAyViyjDpuV3HgBT5mubA',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTY4grFL7RRk8qnHCiL7IrkafW2wjnPStAgL-VewAM4sxrSB3_tSLvNIGbhNPDScSLEnMYTFa8NuchkynoCC5a1m6mgkv1O2n-JcPPtOfkbIcArb14U6G3c'
        ]
      },
      {
        category_id: categoryIds['electronics'],
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones (Black)',
        brand: 'Sony',
        description: 'Sony WH-1000XM5 wireless active noise cancelling headphones deliver industry-leading sound and silent listening with dual processors and 8 microphones.',
        price: 29990.00,
        original_price: 34990.00,
        stock: 45,
        rating: 4.60,
        rating_count: 2800,
        review_count: 310,
        specifications: {
          'Headphone Type': 'Over-Ear Wireless',
          'Noise Cancelling': 'Yes (ANC)',
          'Battery Life': 'Up to 30 Hours',
          'Connectivity': 'Bluetooth 5.2'
        },
        images: [
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSubxQM30tfWlaFB0wn-nD-b6CXYPi4-CA7yMdWSHGOvIEY73Su-pOBqT80VddOITqtaNzw7PX3wwSq94ZXw1G_pv0Q-FLgU_ppykTQcuYAPw-Iuc6l1fSv',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQKFVE3h4r_zhCcvZnGT8j2WJd0DosK-HgQPtOA9f_VaRJAJYAhzlrxxy5xeotWzTYbHX6r3js1ol5hz2oZPJuVtHR4QqtT'
        ]
      },
      {
        category_id: categoryIds['electronics'],
        title: 'Apple Watch Series 9 GPS (Midnight Aluminum, 45mm)',
        brand: 'Apple',
        description: 'The smart watch that helps you stay active, healthy, safe, and connected. Features double tap gesture, Siri on-device, and blood oxygen monitoring.',
        price: 41900.00,
        original_price: 44900.00,
        stock: 18,
        rating: 4.70,
        rating_count: 580,
        review_count: 65,
        specifications: {
          'Case Size': '45 mm',
          'Case Material': 'Aluminum',
          'Connectivity': 'GPS Only',
          'Always-On Display': 'Yes'
        },
        images: [
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR0md6eKg415FTSd-t12mVr9U8yI1ft23lAFEYN79DZlXBVyQPDORGLkbJQUqnxG4nn9lA1W9GOOdxndrbgeI7_CynwivYfoUWbKH6OncMkbe1h2wyzD12c',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT3VF179gAOFc2rs9YtxVOgtwRQ7b2g-Bt3lN2mtAR_gjmx9ttiYdg2ktqyI3c2FcelEfeO7k31SshBN1b2jgEiEG3mup2h4jlRu-ftmyc'
        ]
      },
      {
        category_id: categoryIds['electronics'],
        title: 'Sony PlayStation 5 Console (Slim Model)',
        brand: 'Sony',
        description: 'Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.',
        price: 44990.00,
        original_price: 54990.00,
        stock: 40,
        rating: 4.80,
        rating_count: 5400,
        review_count: 420,
        specifications: {
          'Console Type': 'Slim Disc Edition',
          'Storage Capacity': '1 TB SSD',
          'Resolution Support': '4K HDR at 120Hz',
          'Sound': 'Tempest 3D AudioTech'
        },
        images: [
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRpyaWdbZWeHV-5qxpmGnOPGsQQAJjuSqz8AxsgCjFdisaUwT4KxvAX2a27kNEt2-5eeZL3ssN38jIOfEysZq9kzLCFk8yPhp6Cl7D1Q6ZGwcHRGTVuRW81',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRJSNvOtCDPU0Nu9Saqylke5zKvGqTxIq_3EF0XvT339Vtn6QnrqdHBRqNPbwY93VhBZSweC6ISolKUmwkD4GMOAqFMBQRC'
        ]
      },
      {
        category_id: categoryIds['electronics'],
        title: 'Nintendo Switch Console (OLED Model, Neon Blue/Red)',
        brand: 'Nintendo',
        description: 'Vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.',
        price: 29990.00,
        original_price: 34990.00,
        stock: 30,
        rating: 4.70,
        rating_count: 1980,
        review_count: 220,
        specifications: {
          'Screen Size': '7.0 inch OLED',
          'Storage': '64 GB',
          'Battery Life': '4.5 to 9 Hours'
        },
        images: [
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR8v4nX2GKEYnKCP1XsEghiiGx-9qUiO5qPkyeMJSAEab_u0OJImFQnTP70DYa8p1JUorsxikE-NsznEHO77gZ5RNgbpvI_WJ_S2fA5dPI',
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRapKn9c8COu2vxMrkH3PPV7ZPyJvcMgZmypkbNopeTG7VWZbf_cXTakox6aIZWLk8M46-_OE5Ry0FLRSfxLvrcN8CSYIffxA'
        ]
      },

      // ========== FASHION (5 products) ==========
      {
        category_id: categoryIds['fashion'],
        title: "Levi's Men's 511 Slim Fit Stretchable Jeans (Dark Indigo)",
        brand: "Levi's",
        description: "A modern slim fit with room to move. These stretchable denim jeans are built to sit below the waist with a slim leg from hip to ankle.",
        price: 2199.00,
        original_price: 3799.00,
        stock: 90,
        rating: 4.30,
        rating_count: 12500,
        review_count: 990,
        specifications: {
          'Fabric': '98% Cotton, 2% Elastane',
          'Fit': 'Slim Fit',
          'Rise': 'Mid Rise',
          'Stretchable': 'Yes'
        },
        images: [
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTAbrjj5FhUzq8rbirowCCkHfElLH4fnfVjeNbJ_GZaN9ZCYVCwTSxs02ZS9RPTk-lqSDu-S1Hv6-WSal0URXm90m1CE06VPqSvzrMkMT1oQiM2tcygE01PEw',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSsDWNp5XIqdi5-p8tbDuQoGEESnP-bHL_hfKvqIuA8fk8M7JN_MAkS7I2HYWxqLKFOwWoGWvAAbgK3Fm41IwTPUVnH4cVJ9oKWW0PwPdQGAoAXfJQ4J0QLSg'
        ]
      },
      {
        category_id: categoryIds['fashion'],
        title: "Nike Air Force 1 '07 Leather Sneakers (All White)",
        brand: 'Nike',
        description: 'The legend lives on in the Nike Air Force 1, featuring classic stitched leather overlays, clean white-on-white aesthetics, and Nike Air cushioning.',
        price: 7495.00,
        original_price: 9695.00,
        stock: 28,
        rating: 4.60,
        rating_count: 3200,
        review_count: 240,
        specifications: {
          'Type': 'Casual Sneakers',
          'Outer Material': 'Premium Leather',
          'Sole': 'Stitched Rubber with Air'
        },
        images: [
          'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTfF60t3sO2ctTIRgHUuuZffmXcU5eDA5mbY2clSsoRb6g-XxnMr4apL4lQwW7Lby_CbbXbl1EuNy8WWuSFiia2QGTTH3jYifBBgUuweERut4vjZXTC-V5xE-0',
          'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTmExPQGSGID9r5H4_itwRdV8Xt2flbLWPvOL1DtIQ-GNyrrFvpsgZs5aAjhbVs9PYpX3bBQBvfQWFPnIVcwgck4I33ezd7'
        ]
      },
      {
        category_id: categoryIds['fashion'],
        title: 'Casio Vintage Digital Unisex Watch (Silver)',
        brand: 'Casio',
        description: 'Classic retro digital watch featuring micro-light, stopwatch, daily alarm, and automatic calendar. Water-resistant stainless steel band.',
        price: 1695.00,
        original_price: 2295.00,
        stock: 80,
        rating: 4.40,
        rating_count: 8700,
        review_count: 640,
        specifications: {
          'Dial Color': 'Grey Display',
          'Strap Material': 'Stainless Steel',
          'Movement': 'Quartz Digital',
          'Features': 'Stopwatch, Alarm, LED Light'
        },
        images: [
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ8nOnZVZVdi7UvL-CcZ7y74FhxkDUAZbgl9e5vlX3StnNQAYnIq2o-tgc3YsRi0frdORAXZj46EbCrQ3hx5OihOWj5OQhW_gF3Y25o7puo4qWkdGYmIuy7MDI',
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTPCoLvCbYP40sweXjzUcslWXPZ8gldr7TGMeYEUcQJshw5lOYfR-pjnrDHv3IA-TixXI_qvYsrsT77zYwm-9FeZue__ZkY3Evj3iuP4fSqsWTU2ywdSiIm'
        ]
      },
      {
        category_id: categoryIds['fashion'],
        title: "Adidas Ultraboost Light Running Shoes (Core Black)",
        brand: 'Adidas',
        description: 'Experience epic energy with the lightest Ultraboost ever, featuring the next generation of Light BOOST midsole cushioning.',
        price: 14999.00,
        original_price: 19999.00,
        stock: 35,
        rating: 4.50,
        rating_count: 850,
        review_count: 92,
        specifications: {
          'Type': 'Road Running Shoes',
          'Outer Material': 'Primeknit textile',
          'Sole': 'Continental Rubber'
        },
        images: [
          'https://rukmini1.flixcart.com/image/1500/1500/xif0q/shoe/5/0/6/-original-imahgbrwwhcwrm8p.jpeg?q=70',
          'https://rukminim2.flixcart.com/image/1500/1500/xif0q/shoe/p/z/x/-original-imahgbrwda69cj2f.jpeg'
        ]
      },
      {
        category_id: categoryIds['fashion'],
        title: "Allen Solly Men's Slim Fit Polo T-Shirt (Navy Blue)",
        brand: 'Allen Solly',
        description: 'Upgrade your casual styling with this navy polo neck solid t-shirt. Tailored in a regular fit using premium breathable organic cotton.',
        price: 899.00,
        original_price: 1499.00,
        stock: 120,
        rating: 4.20,
        rating_count: 4300,
        review_count: 320,
        specifications: {
          'Fabric': '100% Combed Cotton',
          'Fit': 'Slim Fit',
          'Neck': 'Polo Collar',
          'Pattern': 'Solid'
        },
        images: [
          'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpQpyBSEqjupwu_ms94sZGo1o7-y-HH2XbmaMFMfidiNNRY6m6Y6e2cI24Z5wgiQ_B6TiRsBYxGiOZdW67rFConuZD5vD0',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSN0ewzzpjr8pxTG7kMqgqHIuZtObOfVJwxzWBKpxCPiRC-Y9iwqooUdDc2FNRabPCuqcOWST7wDW8XwinTXGpvccJRIwEfaw'
        ]
      },

      // ========== HOME & KITCHEN (5 products) ==========
      {
        category_id: categoryIds['home-kitchen'],
        title: 'Pigeon Cruise 1800W Induction Cooktop (Black)',
        brand: 'Pigeon',
        description: 'Smartly designed cruise induction cooktop from Stovekraft with LED display, preset timer, high-grade crystal glass microplate, and preset Indian cooking menus.',
        price: 1599.00,
        original_price: 3195.00,
        stock: 200,
        rating: 4.10,
        rating_count: 145000,
        review_count: 12300,
        specifications: {
          'Power Consumption': '1800 W',
          'Control Panel': 'Push Button',
          'Worktop Material': 'Micro Crystal Glass Plate',
          'Timer Settings': 'Up to 3 Hours'
        },
        images: [
          'https://rukminim2.flixcart.com/image/1500/1500/xif0q/induction-cook-top/8/h/9/cruise-cruise-pigeon-original-imahd2upy97s575n.jpeg',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSbnL88IOb-Hv1SRCp8Kbv3o7mUqQtxEK0CIfP-kBs-rf-juJ0H_03A6MTO0O4hVhh7JmJhG7w3UseagbEJnvSo-4M7MmP5Y2_cLCPh2plHoTqR-5P1h23L8z4'
        ]
      },
      {
        category_id: categoryIds['home-kitchen'],
        title: 'Prestige Iris 750 Watt Mixer Grinder (3 Stainless Steel Jars)',
        brand: 'Prestige',
        description: 'Prestige Iris mixer grinder for daily kitchen use. 750W powerful motor, 3 stainless steel jars of different sizes, and efficient blades.',
        price: 2499.00,
        original_price: 4195.00,
        stock: 65,
        rating: 4.30,
        rating_count: 52000,
        review_count: 4200,
        specifications: {
          'Power': '750 W',
          'Number of Jars': '3 Jars',
          'Speed Settings': '3 Speed + Pulse'
        },
        images: [
          'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcShYTLZL1-a684c-tIwIF7BGZzrahxThNMf0VA6bY2jHduVNBQev50OD26mKOBMcZcxtetq5sEqM-mt19T0djFPOpdODR0Lq7Iqt8_tTIntKommJEKV8ZmpiA',
          'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTcBlStswQS1V-udmVxs_cHJ1VtK6nTIqPLu7qQfUe4mEYBYkHFwp0KffYk902j_elCTg8sDTiDEAApRz4EWJ6waE9sEmRBdaJRkOfs83-Wp_e_1esjb0OY'
        ]
      },
      {
        category_id: categoryIds['home-kitchen'],
        title: 'Hawkins Classic 5 Litre Pressure Cooker (Silver)',
        brand: 'Hawkins',
        description: 'Made from commercially pure virgin aluminum. The inside-fitting lid is pressure-locked for safety. Extra thick base heats quickly and evenly.',
        price: 1899.00,
        original_price: 2150.00,
        stock: 75,
        rating: 4.30,
        rating_count: 18400,
        review_count: 1420,
        specifications: {
          'Capacity': '5 Litres',
          'Material': 'Virgin Aluminum',
          'Base Thickness': '3.25 mm'
        },
        images: [
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR4jVmWgbHrFfYVCvqsAy0dwg6Pg39rNPfRQE5Rm4CEn0iXyXHw9HTpIMxn9ogAax5kHinXwRPeZ-7UXYvb3sGqVKRt4pbeW13DRcK_5xqddO5SGrve4U5PgQ',
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRXIj5Dgn8jH6E6KuNmuQsGoaXkWE5wtZe9NvgncD0y07BoaM5gdbzddX_SQhzZJQxZTa7KqDq0bVDpGdTSvtYJEsMLHUAVznwc_fuIWOS9aQ0XZb3h7BocrA'
        ]
      },
      {
        category_id: categoryIds['home-kitchen'],
        title: 'Milton Thermosteel Flip Lid Flask 1000 ml (Steel Plain)',
        brand: 'Milton',
        description: 'Milton Thermosteel vacuum insulated flask, keeps beverages hot for 24 hours and cold for 24 hours. Durable stainless steel body.',
        price: 799.00,
        original_price: 1399.00,
        stock: 130,
        rating: 4.20,
        rating_count: 42300,
        review_count: 3200,
        specifications: {
          'Capacity': '1000 ml',
          'Material': '18/8 Stainless Steel',
          'Insulation': 'Double Wall Vacuum'
        },
        images: [
          'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQtyVG9kCAyL3tJNj7JUIjZRYpTHfCyhpTbxfkhjgMxIgArdlqgulBh55KPWOKBL-kmImJ0Hb9jnJxCmSVnrJqGxHFpSSsiTRcT6z8pUa0WTs7-QhRc1m4_',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQh1aIHVxDanIesyPm4JZ5LF66uU0Lyi4kt9X_XOFujxVITCVdfsPyZHGJJf-GE4XughTA1t0YAkF301t9lz0uHY0vJIw36fqo5YLQSdFU6-kV7SVN8a-5G1bQ'
        ]
      },
      {
        category_id: categoryIds['home-kitchen'],
        title: 'Wakefit Orthopedic Memory Foam 6-inch Queen Size Mattress',
        brand: 'Wakefit',
        description: 'Designed scientific memory foam mattress to support your spine and adjust to your body curves, giving you deep sleep.',
        price: 8999.00,
        original_price: 14999.00,
        stock: 50,
        rating: 4.60,
        rating_count: 67800,
        review_count: 5400,
        specifications: {
          'Mattress Size': 'Queen (72 x 60 x 6 inches)',
          'Mattress Material': 'Orthopedic Memory Foam',
          'Firmness Scale': 'Medium Firm'
        },
        images: [
          'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ8m-jTfRATzpaOTJGJQugkT4q8FCIbXPqBRKeeIPf-W3VF9KQkDAiZVpRuUxp_4ljW28RGObvFIgz1fbZLJNLze4-3OwOrdNubDGpNVv8U',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRcVhRdM_AUhdaLRDJL_3rODrjf2e22jfMGfC2-ndD23u6j7S5gC9j3rDqBTnkQZiQsjPRyb9od8sPNUGQmDNAtBVMjEW7Z'
        ]
      }
    ];

    for (const p of products) {
      // 4.a Insert Product
      const prodRes = await db.query(`
        INSERT INTO products (category_id, title, brand, description, price, original_price, stock, rating, rating_count, review_count, specifications)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id;
      `, [p.category_id, p.title, p.brand, p.description, p.price, p.original_price, p.stock, p.rating, p.rating_count, p.review_count, JSON.stringify(p.specifications)]);

      const productId = prodRes.rows[0].id;

      // 4.b Insert Images
      for (let i = 0; i < p.images.length; i++) {
        await db.query(`
          INSERT INTO product_images (product_id, image_url, is_primary)
          VALUES ($1, $2, $3);
        `, [productId, p.images[i], i === 0]);
      }
    }

    console.log('[Database Seed] All products and product images seeded successfully!');
    console.log('[Database Seed] Seeding process finished successfully.');
  } catch (err) {
    console.error('[Database Error] Error during seeding:', err);
    throw err;
  }
}

module.exports = {
  runSeed
};
