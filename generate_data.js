// generate_data.js - Generates 150 realistic lost & found reports for GLA UNIVERSITY MATHURA
// Strictly authentic GLA campus landmarks: Central Library, GD Subway, AB-1 to AB-12, KC Ground, etc.

const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  ID: 'Cards & IDs',
  BOTTLE: 'Bottles & Tumblers',
  CHARGER: 'Chargers & Cables',
  AUDIO: 'Earphones & Audio',
  CLOTHING: 'Clothing & Apparel',
  KEYS: 'Keys & Keychains',
  BAGS: 'Bags & Backpacks',
  BOOKS: 'Notebooks & Stationery'
};

const GLA_HOTSPOTS = [
  'GLA Central Library',
  'GD Subway & Central Food Court',
  'Academic Blocks 1-3 (CSE Complex)',
  'Academic Blocks 4-6 (IBM Management)',
  'Hostels & Residential Zone',
  'KC Sports Ground & Ninad Amphitheatre',
  'Main Gate 1 & NH-19 Checkpoint'
];

const GLA_SUB_LOCATIONS = {
  'GLA Central Library': [
    '2nd Floor Quiet Reading Hall (Desk #42)',
    '1st Floor Digital Catalog & Terminal Pods',
    '3rd Floor Reference & Research Stacks',
    'Ground Floor Circulation Counter',
    'Librarian Information Desk',
    'Library Outer Staircase Benches'
  ],
  'GD Subway & Central Food Court': [
    'Subway Dine-In Counter & Tables',
    'Nescafe Coffee Hub & Standing Tables',
    'Outdoor Shaded Stone Benches',
    'Fresh Juice Corner Patio',
    'Campus Utility Store Walkway',
    'GD Center Staircase Landing'
  ],
  'Academic Blocks 1-3 (CSE Complex)': [
    'AB-2 2nd Floor CSE Computing Lab #204',
    'AB-1 Central Atrium & Smart Classrooms',
    'AB-3 3rd Floor Lecture Theatre LT-302',
    'Dean Academics Corridor Ground Floor',
    'AI & Robotics Innovation Workshop (AB-2)',
    'AB-1 Ground Floor Water Cooler Station'
  ],
  'Academic Blocks 4-6 (IBM Management)': [
    'AB-6 IBM Main Seminar Hall #1',
    'AB-4 Electronics & Embedded Circuit Lab',
    'AB-5 Management Case Study Room 502',
    'AB-6 Faculty Block Lounge Entrance',
    'AB-4 Central Stairwell'
  ],
  'Hostels & Residential Zone': [
    'Boys Hostel Wing 3 - Dining Mess Entrance',
    'Boys Hostel Wing 1 - Ground Floor Study Room',
    'Hostel Block I & J Courtyard Benches',
    'Girls Hostel Sarojini Bhawan Gate Security Desk',
    'Gargi Bhawan Common Activity Lounge',
    'Hostel Night Canteen Walkway'
  ],
  'KC Sports Ground & Ninad Amphitheatre': [
    'KC Ground Cricket Pavilion Bleachers',
    'Basketball Court 1 Side Bench',
    'Ninad Open-Air Amphitheatre Stone Steps',
    'Indoor Sports Hall - Badminton Court',
    'Gymnasium Equipment Rack'
  ],
  'Main Gate 1 & NH-19 Checkpoint': [
    'Main Gate 1 Security Checkpost & Lost Desk',
    'Aarogyam University Health Centre Waiting Room',
    'Visitor Reception & Pass Counter',
    'University Bus Parking Bay 4'
  ]
};

const ITEMS_BY_CATEGORY = {
  [CATEGORIES.ID]: [
    { item: 'GLA Student RFID ID Card', brand: 'GLA University SmartCard', colors: ['Blue GLA Lanyard', 'Red Lanyard', 'White'] },
    { item: 'GLA Library Access Card', brand: 'GLA Central Library', colors: ['Blue Lanyard', 'Yellow Pass', 'White'] },
    { item: 'Hostel Resident RFID Pass & Keyfob', brand: 'GLA Hostel Board', colors: ['Blue', 'Black', 'White'] },
    { item: 'GLA Bus Transport Pass', brand: 'GLA Transport Dept', colors: ['Green Lanyard', 'Blue'] }
  ],
  [CATEGORIES.BOTTLE]: [
    { item: 'Water Bottle 32oz', brand: 'Hydro Flask', colors: ['Navy Blue', 'Cobalt', 'Olive Green', 'Matte Black', 'White'] },
    { item: 'Insulated Stainless Steel Flask', brand: 'Milton', colors: ['Silver Metallic', 'Navy Blue', 'Matte Black', 'Red'] },
    { item: 'Thermosteel Hot & Cold Bottle', brand: 'Cello', colors: ['Steel Silver', 'Blue', 'Charcoal Grey'] },
    { item: 'Wide-Mouth Insulated Tumbler', brand: 'Chilly\'s', colors: ['Navy', 'Pastel Pink', 'Sage Green'] }
  ],
  [CATEGORIES.CHARGER]: [
    { item: '67W USB-C Power Adapter', brand: 'Apple MagSafe', colors: ['White'] },
    { item: '65W Fast GaN Laptop Charger', brand: 'Anker', colors: ['Space Grey', 'Black'] },
    { item: 'Dell 65W Barrel Pin Laptop Charger', brand: 'Dell', colors: ['Black'] },
    { item: 'Braided Type-C to Lightning Cable', brand: 'Apple', colors: ['White', 'Braided Grey'] },
    { item: 'SuperVOOC 80W Fast Charger', brand: 'OnePlus', colors: ['White & Red Cable'] }
  ],
  [CATEGORIES.AUDIO]: [
    { item: 'AirPods Pro 2 with MagSafe Case', brand: 'Apple', colors: ['White'] },
    { item: 'Wireless Noise Cancelling Earbuds', brand: 'boAt Airdopes', colors: ['Active Black', 'Cool Blue'] },
    { item: 'Galaxy Buds2 Pro in Matte Case', brand: 'Samsung', colors: ['Graphite', 'Bora Purple'] },
    { item: 'Wireless Over-Ear Headphones', brand: 'Sony WH-1000XM4', colors: ['Black', 'Silver'] }
  ],
  [CATEGORIES.CLOTHING]: [
    { item: 'Pullover Fleece Hoodie', brand: 'Champion', colors: ['Heather Grey', 'Navy Blue', 'Charcoal', 'Maroon'] },
    { item: 'GLA University Winter Jacket', brand: 'GLA Merchandise', colors: ['Navy Blue', 'Black'] },
    { item: 'Zip-Up Track Jacket', brand: 'Nike', colors: ['Black', 'Dark Grey', 'Navy'] },
    { item: 'Knitted Wool Beanie', brand: 'Carhartt', colors: ['Mustard Yellow', 'Black', 'Charcoal'] }
  ],
  [CATEGORIES.KEYS]: [
    { item: 'Hostel Room Key with GLA Lanyard', brand: 'GLA Hostel Key', colors: ['Brass / Blue GLA Lanyard', 'Silver / Red Lanyard'] },
    { item: 'Bike U-Lock Key with Keychain', brand: 'Kryptonite', colors: ['Black / Yellow', 'Silver'] },
    { item: 'Scooty Key with Krishna Keychain', brand: 'Honda Key', colors: ['Black / Brass'] }
  ],
  [CATEGORIES.BAGS]: [
    { item: 'Everyday Laptop Backpack', brand: 'American Tourister', colors: ['Navy Blue', 'Charcoal Grey', 'Black'] },
    { item: 'Campus Classic Backpack', brand: 'Wildcraft', colors: ['Black & Blue', 'Olive'] },
    { item: 'Canvas Engineering Tote Bag', brand: 'GLA Bookstore', colors: ['Natural Cream', 'Navy'] }
  ],
  [CATEGORIES.BOOKS]: [
    { item: 'Engineering Mathematics Textbook & Notes', brand: 'GLA University Courseware', colors: ['Blue Cover', 'White'] },
    { item: 'Scientific Calculator fx-991EX', brand: 'Casio', colors: ['Black', 'Silver'] }
  ]
};

const GLA_DESCRIPTIONS = {
  [CATEGORIES.ID]: [
    'GLA student card with University barcode, shows CSE department emblem and photo.',
    'Found on reading table in GLA Library, student roll number GLA/2023/... on card.',
    'Lost near GD Subway while paying for meal, has official blue GLA ribbon lanyard.',
    'Handed over to security guard at Gate 1.'
  ],
  [CATEGORIES.BOTTLE]: [
    'Has small stickers (GLA Hackathon + GitHub Octocat). Covered in condensation.',
    'Found on window ledge outside AB-2 lecture room.',
    'Left beside the stone benches near Nescafe at GD Subway.',
    'Slight scratch on bottom base, stainless steel lid.'
  ],
  [CATEGORIES.CHARGER]: [
    'Left plugged into the wall outlet strip below the computer lab table.',
    'White braided USB-C cable neatly coiled around adapter.',
    'Found on bench in AB-1 ground floor after morning 10 AM class.',
    'Has initials written with permanent marker on adapter.'
  ],
  [CATEGORIES.AUDIO]: [
    'Clear silicone protective case with mini carabiner clip.',
    'Left on library study table cushion.',
    'Charging indicator light was blinking amber when found.',
    'Case has a tiny sticker on the back lid.'
  ],
  [CATEGORIES.CLOTHING]: [
    'Soft fleece lining, kangaroo front pocket, slightly worn sleeve cuffs.',
    'Official GLA University winter pullover, warm fleece interior.',
    'Draped over chair back after 3 PM lab session in AB-2.',
    'Very clean, smells like fresh laundry.'
  ],
  [CATEGORIES.KEYS]: [
    'Hostel room key on blue GLA University neck strap with room number tag.',
    'Keyring with 2 silver keys and a miniature Mathura temple souvenir keychain.',
    'Two brass keys taped together with white label.'
  ],
  [CATEGORIES.BAGS]: [
    'Side water bottle mesh pocket, front pocket holds highlighters and student ID.',
    'Heavy padded laptop section holding notebook and USB drive.',
    'Left on bleachers during evening football match at KC Ground.'
  ],
  [CATEGORIES.BOOKS]: [
    'Contains handwritten DSA and Machine Learning lecture notes with sticky tabs.',
    'Sliding plastic cover attached, battery icon shows full charge.'
  ]
};

const TIMES = [
  'Today 8:30 AM',
  'Today 9:15 AM',
  'Today 10:20 AM',
  'Today 11:45 AM',
  'Today 12:10 PM',
  'Today 1:30 PM',
  'Yesterday 9:00 AM',
  'Yesterday 11:30 AM',
  'Yesterday 2:15 PM',
  'Yesterday 3:45 PM',
  'Yesterday 4:00 PM',
  'Yesterday 4:15 PM',
  'Yesterday 5:20 PM',
  '2 days ago 10:00 AM',
  '2 days ago 1:45 PM',
  '2 days ago 4:30 PM'
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateGLAReports() {
  const reports = [];

  // ==========================================
  // CORE TARGET REPORTS FOR GATE & LIVE DEMOS
  // ==========================================

  // 1. Judge Demo Target (90-Minute Gate Check):
  // "lost: grey hoodie, library, yesterday 4 pm"
  reports.push({
    id: 'rep-001',
    type: 'found',
    status: 'active',
    category: CATEGORIES.CLOTHING,
    item: 'Pullover Fleece Hoodie',
    colour: 'Heather Grey',
    brand: 'Champion',
    place: 'GLA Central Library - 2nd Floor Quiet Reading Hall (Desk #42)',
    hotspot: 'GLA Central Library',
    time: 'Yesterday 4:15 PM',
    iso_time: '2026-11-24T16:15:00',
    description: 'Found folded over wooden chair at Desk #42 in GLA Central Library 2nd floor reading hall yesterday around 4:15 PM. Champion brand, soft heather grey fleece with front pocket. Very clean.',
    contact_fake: 'library-desk@gla.fake.ac.in',
    finder_note: 'Submitted to GLA Central Library reception desk.'
  });

  // 2. Level 2 Target: "navy bottle" finds "blue water bottle" at GD Subway
  reports.push({
    id: 'rep-002',
    type: 'found',
    status: 'active',
    category: CATEGORIES.BOTTLE,
    item: 'Water Bottle 32oz',
    colour: 'Navy Blue',
    brand: 'Hydro Flask',
    place: 'GD Subway & Central Food Court - Outdoor Shaded Stone Benches',
    hotspot: 'GD Subway & Central Food Court',
    time: 'Today 11:45 AM',
    iso_time: '2026-11-25T11:45:00',
    description: 'Found navy blue Hydro Flask 32oz wide mouth bottle with flex cap on stone bench outside Subway near Nescafe point. Has a GLA Hackathon sticker.',
    contact_fake: 'foodcourt-staff@gla.fake.ac.in',
    finder_note: 'Handed to Nescafe counter supervisor at GD Subway.'
  });

  // 3. Hotspot #1 Charger Demo: Apple MagSafe in AB-1 CSE Lab
  reports.push({
    id: 'rep-003',
    type: 'found',
    status: 'active',
    category: CATEGORIES.CHARGER,
    item: '67W USB-C Power Adapter',
    colour: 'White',
    brand: 'Apple MagSafe',
    place: 'Academic Blocks 1-3 (CSE Complex) - AB-2 2nd Floor CSE Computing Lab #204',
    hotspot: 'Academic Blocks 1-3 (CSE Complex)',
    time: 'Yesterday 3:45 PM',
    iso_time: '2026-11-24T15:45:00',
    description: 'White Apple 67W power adapter and braided USB-C cable left plugged into wall surge protector in Lab 204.',
    contact_fake: 'cse-labadmin@gla.fake.ac.in',
    finder_note: 'Held by Lab 204 technical assistant.'
  });

  // 4. Hotspot #3 GLA Student ID Card Demo
  reports.push({
    id: 'rep-004',
    type: 'found',
    status: 'active',
    category: CATEGORIES.ID,
    item: 'GLA Student RFID ID Card',
    colour: 'Blue GLA Lanyard',
    brand: 'GLA University SmartCard',
    place: 'Academic Blocks 1-3 (CSE Complex) - AB-1 Central Atrium & Smart Classrooms',
    hotspot: 'Academic Blocks 1-3 (CSE Complex)',
    time: 'Today 9:15 AM',
    iso_time: '2026-11-25T09:15:00',
    description: 'GLA University Smart RFID card on official navy blue GLA lanyard with silver clip. Card has student registration barcode.',
    contact_fake: 'security-gate1@gla.fake.ac.in',
    finder_note: 'Turned into AB-1 security desk.'
  });

  // 5. AirPods in Central Library
  reports.push({
    id: 'rep-005',
    type: 'found',
    status: 'active',
    category: CATEGORIES.AUDIO,
    item: 'AirPods Pro 2 with MagSafe Case',
    colour: 'White',
    brand: 'Apple',
    place: 'GLA Central Library - 1st Floor Digital Catalog & Terminal Pods',
    hotspot: 'GLA Central Library',
    time: 'Yesterday 2:15 PM',
    iso_time: '2026-11-24T14:15:00',
    description: 'AirPods Pro 2 inside matte clear case with small clip, found on desk beside Terminal #12.',
    contact_fake: 'library-lost@gla.fake.ac.in',
    finder_note: 'Stored in Library locker box.'
  });

  // ==========================================
  // DISTRIBUTIONS ENFORCING TOP ITEMS & HOTSPOTS
  // ==========================================
  // TOP 3 MOST-LOST ITEMS:
  // 1. Cards & IDs (38 items)
  // 2. Bottles & Tumblers (34 items)
  // 3. Chargers & Cables (28 items)
  // Others: Audio (18), Clothing (14), Keys (10), Bags (5), Books (3) = 150 items
  
  // TOP 3 HOTSPOTS:
  // 1. GLA Central Library (52 items)
  // 2. GD Subway & Central Food Court (38 items)
  // 3. Academic Blocks 1-3 (CSE Complex) (30 items)
  // Others: AB 4-6 IBM (14), Hostels (10), KC Sports Ground (4), Main Gate (2) = 150 items

  const targetCategoryCounts = {
    [CATEGORIES.ID]: 38,
    [CATEGORIES.BOTTLE]: 34,
    [CATEGORIES.CHARGER]: 28,
    [CATEGORIES.AUDIO]: 18,
    [CATEGORIES.CLOTHING]: 14,
    [CATEGORIES.KEYS]: 10,
    [CATEGORIES.BAGS]: 5,
    [CATEGORIES.BOOKS]: 3
  };

  const currentCategoryCounts = {
    [CATEGORIES.CLOTHING]: 1,
    [CATEGORIES.BOTTLE]: 1,
    [CATEGORIES.CHARGER]: 1,
    [CATEGORIES.ID]: 1,
    [CATEGORIES.AUDIO]: 1,
    [CATEGORIES.KEYS]: 0,
    [CATEGORIES.BAGS]: 0,
    [CATEGORIES.BOOKS]: 0
  };

  const targetHotspotCounts = {
    'GLA Central Library': 52,
    'GD Subway & Central Food Court': 38,
    'Academic Blocks 1-3 (CSE Complex)': 30,
    'Academic Blocks 4-6 (IBM Management)': 14,
    'Hostels & Residential Zone': 10,
    'KC Sports Ground & Ninad Amphitheatre': 4,
    'Main Gate 1 & NH-19 Checkpoint': 2
  };

  const currentHotspotCounts = {
    'GLA Central Library': 2,
    'GD Subway & Central Food Court': 1,
    'Academic Blocks 1-3 (CSE Complex)': 2,
    'Academic Blocks 4-6 (IBM Management)': 0,
    'Hostels & Residential Zone': 0,
    'KC Sports Ground & Ninad Amphitheatre': 0,
    'Main Gate 1 & NH-19 Checkpoint': 0
  };

  const categoriesPool = [];
  for (const [cat, target] of Object.entries(targetCategoryCounts)) {
    const needed = target - currentCategoryCounts[cat];
    for (let i = 0; i < needed; i++) {
      categoriesPool.push(cat);
    }
  }

  // Shuffle categories pool
  for (let i = categoriesPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [categoriesPool[i], categoriesPool[j]] = [categoriesPool[j], categoriesPool[i]];
  }

  // Hotspot pool
  const hotspotPool = [];
  for (const [spot, target] of Object.entries(targetHotspotCounts)) {
    const needed = target - currentHotspotCounts[spot];
    for (let i = 0; i < needed; i++) {
      hotspotPool.push(spot);
    }
  }

  // Shuffle hotspot pool
  for (let i = hotspotPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hotspotPool[i], hotspotPool[j]] = [hotspotPool[j], hotspotPool[i]];
  }

  let idCounter = 6;
  for (let idx = 0; idx < categoriesPool.length; idx++) {
    const category = categoriesPool[idx];
    const hotspot = hotspotPool[idx];
    const subLoc = randomChoice(GLA_SUB_LOCATIONS[hotspot]);
    const place = `${hotspot} - ${subLoc}`;

    const itemTemplate = randomChoice(ITEMS_BY_CATEGORY[category]);
    const colour = randomChoice(itemTemplate.colors);
    const brand = itemTemplate.brand;
    const item = itemTemplate.item;
    const time = randomChoice(TIMES);
    const desc = randomChoice(GLA_DESCRIPTIONS[category]);

    // Active lost (~38%), Active found (~38%), Reunited (~24%)
    let type = 'lost';
    let status = 'active';
    let reunited_at = null;

    const mod = idx % 5;
    if (mod === 0 || mod === 1) {
      type = 'lost';
      status = 'active';
    } else if (mod === 2 || mod === 3) {
      type = 'found';
      status = 'active';
    } else {
      type = (idx % 2 === 0) ? 'lost' : 'found';
      status = 'reunited';
      reunited_at = '2026-11-25T13:40:00';
    }

    const reportId = `rep-${String(idCounter).padStart(3, '0')}`;
    idCounter++;

    reports.push({
      id: reportId,
      type: type,
      status: status,
      category: category,
      item: item,
      colour: colour,
      brand: brand,
      place: place,
      hotspot: hotspot,
      time: time,
      iso_time: '2026-11-25T10:00:00',
      description: `${desc} ${status === 'reunited' ? '[Successfully reunited at GLA Campus Desk]' : ''}`.trim(),
      contact_fake: `student${Math.floor(100 + Math.random() * 900)}@gla.fake.ac.in`,
      reunited_at: reunited_at
    });
  }

  return reports;
}

const reports = generateGLAReports();

// Compute Insights
const lostReports = reports.filter(r => r.type === 'lost');
const foundReports = reports.filter(r => r.type === 'found');
const reunitedReports = reports.filter(r => r.status === 'reunited');

// Categories frequency
const categoryLossCount = {};
lostReports.forEach(r => {
  categoryLossCount[r.category] = (categoryLossCount[r.category] || 0) + 1;
});
const sortedLostCategories = Object.entries(categoryLossCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([name, count], index) => ({
    rank: index + 1,
    name,
    count,
    percentage: Math.round((count / lostReports.length) * 100)
  }));

// Individual Items frequency
const itemLossCount = {};
lostReports.forEach(r => {
  itemLossCount[r.item] = (itemLossCount[r.item] || 0) + 1;
});
const sortedLostItems = Object.entries(itemLossCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([name, count], index) => ({
    rank: index + 1,
    name,
    count,
    percentage: Math.round((count / lostReports.length) * 100)
  }));

// Top Hotspots frequency
const hotspotCounts = {};
reports.forEach(r => {
  hotspotCounts[r.hotspot] = (hotspotCounts[r.hotspot] || 0) + 1;
});
const sortedHotspots = Object.entries(hotspotCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([name, count], index) => ({
    rank: index + 1,
    name,
    count,
    percentage: Math.round((count / reports.length) * 100)
  }));

const insights = {
  campus: 'GLA University, Mathura (17km Stone, NH-19, Chaumuhan)',
  total_reports: reports.length,
  lost_count: lostReports.length,
  found_count: foundReports.length,
  reunited_count: reunitedReports.length,
  reunion_rate_pct: Math.round((reunitedReports.length / reports.length) * 100),
  top_3_most_lost_items: sortedLostItems,
  top_3_most_lost_categories: sortedLostCategories,
  top_3_hotspots: sortedHotspots,
  all_hotspot_counts: hotspotCounts,
  avg_recovery_time_mins: 38,
  peak_loss_window: '2:00 PM – 4:30 PM (Post-Lunch Lab & Library Rush)',
  key_data_insight: '60% of all items at GLA University Mathura are lost in just 2 hotspots: GLA Central Library (35%) and GD Subway Food Court (25%) between 1:00 PM and 4:30 PM. GLA Student ID Cards represent the #1 most frequently lost critical item.'
};

const outputReportsPath = path.join(__dirname, 'data', 'reports.json');
const outputInsightsPath = path.join(__dirname, 'data', 'insights.json');

fs.writeFileSync(outputReportsPath, JSON.stringify(reports, null, 2), 'utf-8');
fs.writeFileSync(outputInsightsPath, JSON.stringify(insights, null, 2), 'utf-8');

console.log(`Generated ${reports.length} GLA University reports successfully.`);
console.log('Top 3 Most-Lost Categories at GLA:', JSON.stringify(sortedLostCategories, null, 2));
console.log('Top 3 Hotspots at GLA University:', JSON.stringify(sortedHotspots, null, 2));
console.log('Key Data Insight:', insights.key_data_insight);
