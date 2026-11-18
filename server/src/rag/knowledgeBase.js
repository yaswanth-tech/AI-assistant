const path = require('path');
const fs = require('fs');

let internationalFees = [];
let campusLocations = [];

try {
  const feesPath = path.join(__dirname, '../data/international.json');
  if (fs.existsSync(feesPath)) {
    const raw = JSON.parse(fs.readFileSync(feesPath, 'utf8'));
    internationalFees = raw.InternationalFees || [];
  }
} catch (e) {
  console.warn('Could not load international.json', e.message);
}

try {
  const locPath = path.join(__dirname, '../data/location.json');
  if (fs.existsSync(locPath)) {
    campusLocations = JSON.parse(fs.readFileSync(locPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not load location.json', e.message);
}

// Comprehensive RAG Knowledge Corpus Chunks for Woxsen University, Hyderabad
const campusKnowledgeCorpus = [
  {
    id: 'overview-woxsen',
    category: 'About Campus',
    title: 'Woxsen University Hyderabad Overview & Global Accreditations',
    content: `Woxsen University is a premier, private 200-acre residential institution situated at Kamkole, Sadasivpet, Sangareddy District, Hyderabad, Telangana 502345, India. 
Recognized by the UGC and approved by AICTE, Woxsen holds prestigious international accreditations and memberships including EFMD Global, AMBA (Association of MBAs), AACSB Business Education Alliance, and the Association of Commonwealth Universities (ACU).
Known for its striking modern architecture, sustainability-first green campus, Bloomberg Finance Lab, Trade Tower startup incubator, and world-class sports arena 'The League', Woxsen ranks among the top private universities in India for technology, management, design, and architecture.`
  },
  {
    id: 'schools-programs',
    category: 'Academic Programs',
    title: 'Woxsen University Schools & Degree Offerings',
    content: `Woxsen University encompasses seven constituent schools delivering interdisciplinary, industry-aligned curricula:
1. School of Technology: B.Tech in Computer Science & Engineering (AI & Machine Learning, Data Science, Cyber Security, IoT & Blockchain, Robotics), Ph.D. in Engineering.
2. School of Business: MBA (General, Business Analytics, Financial Services), Executive MBA, BBA (Hons), BBA (E-Commerce & Digital Marketing), Ph.D. in Management.
3. School of Arts & Design: B.Des (Fashion Design, Industrial Design, Interior Design, Communication Design), M.Des.
4. School of Architecture & Planning: B.Arch (5-year Council of Architecture approved program) and M.Arch.
5. School of Law: BA LLB (Hons), BBA LLB (Hons) 5-year integrated law, LLM.
6. School of Liberal Arts & Humanities: BA (Hons) in Psychology, Economics, English Literature, Journalism & Mass Communication.
7. School of Sciences: B.Sc (Hons) in Applied Mathematics, Physics, Chemistry, and Data Analytics.`
  },
  {
    id: 'admissions-process',
    category: 'Admissions & Eligibility',
    title: 'Woxsen Admission Process, Eligibility & Entrance Tests',
    content: `Admissions at Woxsen University are evaluated holistically based on academic track record, entrance examination score, and personal interview:
- Step 1: Submit the online application at woxsen.edu.in.
- Step 2: Appear for entrance test or submit valid national scores:
  • B.Tech: WAT (Woxsen Aptitude Test), JEE Main, VITEEE, or SAT score.
  • MBA: WAT, CAT, XAT, NMAT, GMAT, GRE, or CMAT score.
  • BBA: WAT or SAT.
  • B.Des: WDT (Woxsen Design Test) + Design Portfolio review.
  • Law: WAT, CLAT, or LSAT India.
- Step 3: Psychometric Assessment & Personal Interview with the Faculty Admissions Panel.
- Step 4: Offer letter issuance and seat confirmation via initial deposit.`
  },
  {
    id: 'fees-structure-woxsen',
    category: 'Tuition Fees & Payments',
    title: 'Woxsen University Program Fees & Installment Schedules',
    content: `Official Woxsen University Fee Schedule (Annual / Program Basis):
• B.Tech (Computer Science & Engineering): ₹3,60,000 / year tuition fee + ₹25,000 admission fee. Installments: 2 payments of ₹1,80,000 per semester.
• MBA (2-Year Master of Business Administration): ₹7,50,000 / year (Total ₹15,00,000 for 2 years). Installments: 4 payments of ₹3,50,000 across semesters.
• BBA (Hons) / Digital Marketing: ₹3,25,000 / year tuition fee. Installments: 2 payments of ₹1,62,500.
• B.Des (Fashion, Industrial, Interior, Communication): ₹3,50,000 / year tuition fee. Installments: 2 payments of ₹1,75,000.
• BA LLB / BBA LLB (5-Year Integrated): ₹2,75,000 / year tuition fee. Installments: 2 payments of ₹1,37,500.
• B.Arch (5-Year Architecture): ₹2,85,000 / year tuition fee. Installments: 2 payments of ₹1,42,500.
• Hostel & Dining: ₹1,50,000 to ₹1,80,000 / year depending on single or twin-sharing air-conditioned room preferences.`
  },
  {
    id: 'scholarships-woxsen',
    category: 'Tuition Fees & Payments',
    title: 'Woxsen Merit Scholarships & Financial Grants',
    content: `Woxsen University awards competitive merit scholarships based on entrance test ranks and previous academic scores:
1. Woxsen Merit Scholarship: Up to 50% tuition fee reduction awarded to top scorers in WAT/WDT/CAT/JEE/SAT/CLAT.
2. Sports Scholarships: Up to 40% fee waiver for national and state-level athletes across cricket, football, tennis, and swimming.
3. Girl Child Empowerment Scholarship: Dedicated financial aid to promote female participation in STEM, Technology, and Architecture.
4. Early Decision Incentive: ₹25,000 - ₹50,000 waiver for applicants confirming admission in Round 1.`
  },
  {
    id: 'labs-innovation-woxsen',
    category: 'Campus Facilities & Research',
    title: 'Advanced Labs, Bloomberg Terminals & Trade Tower Incubator',
    content: `World-Class Research & Innovation Centers at Woxsen University:
• Vithal Gandhi Central Library: 70,000 sq.ft state-of-the-art facility holding over 30,000 printed volumes, IEEE Xplore, EBSCO, ScienceDirect, and quiet research pods.
• Bloomberg Finance Lab: 20 dedicated Bloomberg professional terminals providing real-time global market data, equities, commodities, and risk analytics—one of the largest Bloomberg labs in educational India.
• AI & Robotics Lab: High-performance GPU computing clusters, autonomous drone testbeds, mobile robots, LiDAR systems, and computer vision workstations.
• Trade Tower (Startup Incubation Hub): Provides budding entrepreneurs with co-working spaces, legal counsel, angel investor access, and seed funding pools of up to ₹1 Crore.
• Design Studios: 3D printing, laser cutters, CNC milling, VR/AR spatial headsets, and ceramics casting.`
  },
  {
    id: 'sports-the-league',
    category: 'Athletics & Recreation',
    title: 'The League - International Standard Sports Arena',
    content: `Woxsen's sports complex 'The League' is recognized as one of the finest collegiate sports facilities in South Asia:
- Cricket: ICC-standard cricket ground with floodlights and professional pitch curator wickets.
- Football: FIFA-certified synthetic turf football ground with professional drainage and spectator gallery.
- Tennis: 8 ITF-standard synthetic tennis courts.
- Aquatics: Olympic-length competition swimming pool and training lanes.
- Indoor Sports: 4 wooden-floored badminton courts, squash courts, table tennis hall, and high-performance gymnasium.
- Outdoor Sports: FIBA-standard basketball courts, volleyball, and skating rinks.`
  },
  {
    id: 'hostels-student-life',
    category: 'Campus Life & Housing',
    title: 'Residential Hostels, Multi-Cuisine Dining & Campus Transport',
    content: `Campus Life at Woxsen University:
• Hostels: 100% residential campus. Fully furnished, air-conditioned student residences with en-suite washrooms, 24/7 security, biometric access, laundromat, and high-speed Wi-Fi.
• Food Court: Central dining facility providing nutritious breakfast, lunch, snacks, and dinner. Multi-cuisine menus include North Indian, South Indian, Continental, vegetarian, non-veg, and live egg/juice counters.
• Campus Shuttles: Dedicated air-conditioned transport connecting the Kamkole campus with Hyderabad city hubs: Miyapur Metro, Lingampally Railway Station, Gachibowli, and Rajiv Gandhi International Airport (RGIA).
• Healthcare: 24/7 campus health center staffed with medical doctors, resident nurses, and emergency ambulance on standby.`
  },
  {
    id: 'placements-careers',
    category: 'Careers & Placements',
    title: 'Woxsen Placement Track Record & Top Corporate Recruiters',
    content: `Placements & Industry Relations:
- 100% placement track record across MBA, B.Tech, and B.Des graduating batches.
- Top Corporate Recruiters: Amazon, Dell Technologies, Deloitte, KPMG, Morgan Stanley, Ernst & Young (EY), Aditya Birla Group, HDFC Bank, Tech Mahindra, Arcesium, and Cognizant.
- Compensation Highlights:
  • Highest Package: ₹17.0+ LPA
  • MBA Average Package: ₹9.04 LPA
  • B.Tech CSE Average Package: ₹8.60 LPA
- Mandatory 2-3 month summer corporate internships with leading Fortune 500 enterprises.`
  },
  {
    id: 'academic-calendar-woxsen',
    category: 'Academic Calendar',
    title: 'Academic Calendar, Examination Timelines & Holidays',
    content: `Woxsen Academic Year Schedule:
• Fall Semester (Odd Semester):
  - Student Orientation & Onboarding: Early August
  - Mid-Term Examinations: October
  - Diwali / Dussehra Break: October/November
  - End-Term Final Examinations: December
• Spring Semester (Even Semester):
  - Classes Commence: Second week of January
  - 'Infinity' Annual Cultural Fest: February
  - Mid-Term Examinations: March
  - End-Term Final Examinations: May
  - Summer Corporate Internships: June - July`
  }
];

// TF-IDF Tokenizer & Vector Similarity Engine
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function computeTF(tokens) {
  const tf = {};
  tokens.forEach(t => {
    tf[t] = (tf[t] || 0) + 1;
  });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => {
    tf[k] = tf[k] / total;
  });
  return tf;
}

// Precompute IDF for the corpus
const docTokensList = campusKnowledgeCorpus.map(doc => tokenize(doc.title + ' ' + doc.content));
const totalDocs = campusKnowledgeCorpus.length;
const idfDict = {};

docTokensList.forEach(tokens => {
  const unique = new Set(tokens);
  unique.forEach(term => {
    idfDict[term] = (idfDict[term] || 0) + 1;
  });
});

Object.keys(idfDict).forEach(term => {
  idfDict[term] = Math.log((totalDocs + 1) / (idfDict[term] + 1)) + 1;
});

function computeVector(tokens) {
  const tf = computeTF(tokens);
  const vec = {};
  Object.keys(tf).forEach(term => {
    const idf = idfDict[term] || Math.log(totalDocs + 1) + 1;
    vec[term] = tf[term] * idf;
  });
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const k in vecA) {
    if (vecB[k]) dot += vecA[k] * vecB[k];
    normA += vecA[k] * vecA[k];
  }
  for (const k in vecB) {
    normB += vecB[k] * vecB[k];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

const corpusVectors = docTokensList.map(tokens => computeVector(tokens));

/**
 * Retrieve top-k relevant knowledge chunks using vector cosine similarity
 */
function retrieveRelevantContexts(query, topK = 3) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return campusKnowledgeCorpus.slice(0, topK).map(d => ({ ...d, score: 0 }));
  }

  const queryVec = computeVector(queryTokens);

  const scored = campusKnowledgeCorpus.map((doc, idx) => {
    const sim = cosineSimilarity(queryVec, corpusVectors[idx]);
    let titleBoost = 0;
    const docTitleLower = doc.title.toLowerCase();
    queryTokens.forEach(t => {
      if (docTitleLower.includes(t)) titleBoost += 0.15;
    });
    return {
      ...doc,
      score: sim + titleBoost
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = {
  campusKnowledgeCorpus,
  campusLocations,
  internationalFees,
  retrieveRelevantContexts
};
