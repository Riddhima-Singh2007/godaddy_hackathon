// matcher.js - Multi-Factor Semantic Lost & Found Matcher for GLA UNIVERSITY MATHURA
// Handles synonyms, color ontology (e.g. navy -> blue), GLA hotspot clustering & temporal proximity

const COLOR_FAMILIES = {
  blue: ['blue', 'navy', 'navy blue', 'sky blue', 'cobalt', 'royal blue', 'sapphire', 'baby blue', 'teal', 'cyan', 'azure', 'gla blue'],
  grey: ['grey', 'gray', 'heather grey', 'charcoal', 'slate', 'graphite', 'ash', 'silver', 'smoke', 'dark grey'],
  black: ['black', 'matte black', 'jet black', 'asphalt black', 'space grey', 'onyx'],
  white: ['white', 'cream', 'ivory', 'natural cream', 'pearl', 'oatmeal'],
  red: ['red', 'maroon', 'burgundy', 'crimson', 'scarlet', 'ox red', 'wine', 'ruby'],
  green: ['green', 'olive', 'forest green', 'sage', 'mint', 'emerald', 'seafoam', 'khaki'],
  yellow: ['yellow', 'gold', 'mustard', 'amber', 'lemon'],
  purple: ['purple', 'violet', 'lavender', 'lilac', 'plum', 'bora purple'],
  pink: ['pink', 'rose', 'rose gold', 'salmon', 'pastel pink', 'blush'],
  brown: ['brown', 'tan', 'caramel', 'chocolate', 'beige']
};

const SYNONYM_GROUPS = [
  ['bottle', 'water bottle', 'tumbler', 'flask', 'hydro flask', 'hydroflask', 'chilly', 'nalgene', 'yeti', 'thermos', 'canteen', 'sipper', 'milton', 'cello'],
  ['hoodie', 'pullover', 'sweatshirt', 'fleece', 'sweater', 'jacket', 'track jacket', 'windbreaker', 'hoody'],
  ['id', 'id card', 'student card', 'campus card', 'badge', 'proxcard', 'smartcard', 'keycard', 'pass', 'access card', 'dining card', 'student id', 'gla card', 'rfid card', 'gla id'],
  ['charger', 'adapter', 'cable', 'cord', 'power adapter', 'fast charger', 'barrel charger', 'magsafe', 'powerbank', 'power brick', 'usb-c', 'lightning', 'gan charger', 'supervooc'],
  ['airpods', 'earbuds', 'earphones', 'headphones', 'galaxy buds', 'bose', 'buds', 'airpod', 'earphone', 'airdopes', 'boat'],
  ['backpack', 'bag', 'tote', 'tote bag', 'rucksack', 'bookbag', 'kanken', 'duffel', 'laptop bag', 'wildcraft'],
  ['key', 'keys', 'keychain', 'fob', 'keyring', 'u-lock', 'car key', 'dorm key', 'hostel key', 'room key'],
  ['laptop', 'macbook', 'dell', 'computer', 'notebook computer', 'lenovo', 'hp'],
  ['calculator', 'ti-84', 'scientific calculator', 'fx-991ex', 'casio'],
  ['glasses', 'sunglasses', 'spectacles', 'shades', 'frames']
];

// GLA University Mathura Landmark Clusters
const HOTSPOT_CLUSTERS = {
  'gla central library': [
    'library', 'central library', 'gla library', 'lib', 'quiet reading hall', 'reading hall', 'reading room',
    'study pod', 'silent study', 'stacks', 'floor 2', 'floor 1', 'desk 42', 'cubicle', '2nd floor', 'circulation desk', 'digital catalog'
  ],
  'gd subway & central food court': [
    'subway', 'gd subway', 'food court', 'canteen', 'gla canteen', 'nescafe', 'cafe', 'stone benches',
    'juice corner', 'patio', 'central food court', 'utility store', 'snack counter', 'dine in'
  ],
  'academic blocks 1-3 (cse complex)': [
    'ab1', 'ab-1', 'ab2', 'ab-2', 'ab3', 'ab-3', 'cse', 'computer science', 'cse complex', 'lab 204',
    'computing center', 'smart classroom', 'lecture theatre', 'lt-302', 'atrium', 'dean academics', 'robotics'
  ],
  'academic blocks 4-6 (ibm management)': [
    'ab4', 'ab-4', 'ab5', 'ab-5', 'ab6', 'ab-6', 'ibm', 'management', 'business', 'seminar hall', 'electronics lab'
  ],
  'hostels & residential zone': [
    'hostel', 'boys hostel', 'girls hostel', 'wing 1', 'wing 2', 'wing 3', 'wing 4', 'wing 5',
    'sarojini', 'sarojini bhawan', 'gargi', 'gargi bhawan', 'i&j', 'block i', 'block j', 'hostel mess', 'night canteen'
  ],
  'kc sports ground & ninad amphitheatre': [
    'kc ground', 'k c ground', 'sports ground', 'ninad', 'amphitheatre', 'cricket', 'football', 'basketball', 'badminton', 'gym'
  ],
  'main gate 1 & nh-19 checkpoint': [
    'main gate', 'gate 1', 'gate 2', 'nh19', 'nh-19', 'highway', 'security', 'aarogyam', 'dispensary', 'health centre', 'bus parking'
  ]
};

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getColorFamily(colorStr) {
  if (!colorStr) return null;
  const norm = normalizeText(colorStr);
  for (const [family, members] of Object.entries(COLOR_FAMILIES)) {
    for (const member of members) {
      if (norm.includes(member) || member.includes(norm)) {
        return family;
      }
    }
  }
  return null;
}

function matchColor(colorA, colorB, descA = '', descB = '') {
  if (!colorA && !colorB) return { score: 0.8, reason: 'Color unspecified' };
  
  const normA = normalizeText(colorA);
  const normB = normalizeText(colorB);
  
  if (normA && normB && (normA === normB || normA.includes(normB) || normB.includes(normA))) {
    return { score: 1.0, reason: `Exact color match ('${colorA}' matches '${colorB}')` };
  }

  const famA = getColorFamily(colorA) || getColorFamily(descA);
  const famB = getColorFamily(colorB) || getColorFamily(descB);

  if (famA && famB && famA === famB) {
    return { 
      score: 0.95, 
      reason: `Color family match (${famA.toUpperCase()} family: '${colorA}' matches '${colorB}')` 
    };
  }

  if (famA && (descB.toLowerCase().includes(famA) || COLOR_FAMILIES[famA].some(c => descB.toLowerCase().includes(c)))) {
    return { score: 0.85, reason: `Color '${colorA}' detected in item description` };
  }

  return { score: 0.1, reason: `Different color spectrum ('${colorA}' vs '${colorB}')` };
}

function matchItem(itemA, itemB, descA = '', descB = '') {
  const normA = normalizeText(itemA);
  const normB = normalizeText(itemB);

  if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
    return { score: 1.0, reason: `Direct item name match ('${itemA}')` };
  }

  for (const group of SYNONYM_GROUPS) {
    const inA = group.some(syn => normA.includes(syn) || normA === syn || descA.toLowerCase().includes(syn));
    const inB = group.some(syn => normB.includes(syn) || normB === syn || descB.toLowerCase().includes(syn));
    if (inA && inB) {
      return { score: 0.96, reason: `Semantic item synonym match ('${itemA}' matches '${itemB}')` };
    }
  }

  const wordsA = normA.split(' ').filter(w => w.length > 2);
  const wordsB = normB.split(' ').filter(w => w.length > 2);
  const intersection = wordsA.filter(w => wordsB.includes(w));
  if (intersection.length > 0) {
    return { score: 0.8, reason: `Shared keywords: [${intersection.join(', ')}]` };
  }

  return { score: 0.15, reason: 'Item categories differ' };
}

function matchLocation(placeA, placeB) {
  if (!placeA || !placeB) return { score: 0.7, reason: 'Location generalized' };

  const normA = normalizeText(placeA);
  const normB = normalizeText(placeB);

  if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
    return { score: 1.0, reason: `Exact location match ('${placeA}')` };
  }

  for (const [clusterKey, keywords] of Object.entries(HOTSPOT_CLUSTERS)) {
    const aInCluster = normA.includes(clusterKey) || keywords.some(k => normA.includes(k));
    const bInCluster = normB.includes(clusterKey) || keywords.some(k => normB.includes(k));
    if (aInCluster && bInCluster) {
      return { score: 0.95, reason: `GLA Landmark match: ${clusterKey.toUpperCase()}` };
    }
  }

  return { score: 0.3, reason: `Different campus zones ('${placeA}' vs '${placeB}')` };
}

function matchBrand(brandA, brandB, descA = '', descB = '') {
  if (!brandA || !brandB) {
    return { score: 0.75, reason: 'Brand not specified' };
  }

  const normA = normalizeText(brandA);
  const normB = normalizeText(brandB);

  if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
    return { score: 1.0, reason: `Brand verified match ('${brandA}')` };
  }

  if (descB.toLowerCase().includes(normA) || descA.toLowerCase().includes(normB)) {
    return { score: 0.9, reason: `Brand mentioned in report description` };
  }

  return { score: 0.3, reason: `Brand difference ('${brandA}' vs '${brandB}')` };
}

function matchTime(timeA, timeB) {
  if (!timeA || !timeB) return { score: 0.8, reason: 'Approximate time' };

  const normA = normalizeText(timeA);
  const normB = normalizeText(timeB);

  if (normA === normB) {
    return { score: 1.0, reason: `Same loss and recovery timeframe ('${timeA}')` };
  }

  const bothYesterday = normA.includes('yesterday') && normB.includes('yesterday');
  const bothToday = normA.includes('today') && normB.includes('today');

  if (bothYesterday || bothToday) {
    const extractHour = (str) => {
      const match = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
      if (!match) return null;
      let hour = parseInt(match[1], 10);
      const min = match[2] ? parseInt(match[2], 10) : 0;
      const ampm = match[3].toLowerCase();
      if (ampm === 'pm' && hour < 12) hour += 12;
      if (ampm === 'am' && hour === 12) hour = 0;
      return hour * 60 + min;
    };

    const minA = extractHour(timeA);
    const minB = extractHour(timeB);

    if (minA !== null && minB !== null) {
      const diff = Math.abs(minA - minB);
      if (diff <= 30) {
        return { score: 0.98, reason: `Recorded within ${diff} minutes (${timeA} vs ${timeB})` };
      } else if (diff <= 120) {
        return { score: 0.88, reason: `Within 2-hour window on same day` };
      } else {
        return { score: 0.75, reason: `Same day timeframe` };
      }
    }

    return { score: 0.8, reason: bothYesterday ? 'Both occurred yesterday' : 'Both occurred today' };
  }

  return { score: 0.5, reason: 'Different days' };
}

function calculateMatchScore(query, candidate) {
  const itemMatch = matchItem(query.item, candidate.item, query.description, candidate.description);
  const colorMatch = matchColor(query.colour, candidate.colour, query.description, candidate.description);
  const locMatch = matchLocation(query.place, candidate.place);
  const brandMatch = matchBrand(query.brand, candidate.brand, query.description, candidate.description);
  const timeMatch = matchTime(query.time, candidate.time);

  // Weights
  const weighted = 
    (itemMatch.score * 0.35) +
    (colorMatch.score * 0.25) +
    (locMatch.score * 0.20) +
    (brandMatch.score * 0.10) +
    (timeMatch.score * 0.10);

  const finalScore = Math.min(100, Math.max(0, Math.round(weighted * 100)));

  let tier = 'Possible Match';
  if (finalScore >= 85) tier = 'Exceptional Match';
  else if (finalScore >= 70) tier = 'Strong Match';

  return {
    score: finalScore,
    tier: tier,
    breakdown: [
      { factor: 'Item Match', score: Math.round(itemMatch.score * 100), reason: itemMatch.reason },
      { factor: 'Color Match', score: Math.round(colorMatch.score * 100), reason: colorMatch.reason },
      { factor: 'Location Match', score: Math.round(locMatch.score * 100), reason: locMatch.reason },
      { factor: 'Brand & Details', score: Math.round(brandMatch.score * 100), reason: brandMatch.reason },
      { factor: 'Time Window', score: Math.round(timeMatch.score * 100), reason: timeMatch.reason }
    ]
  };
}

module.exports = {
  calculateMatchScore,
  matchItem,
  matchColor,
  matchLocation,
  COLOR_FAMILIES,
  SYNONYM_GROUPS,
  HOTSPOT_CLUSTERS
};
