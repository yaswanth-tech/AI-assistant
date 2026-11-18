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

// Comprehensive RAG Knowledge Corpus Chunks
const campusKnowledgeCorpus = [
  {
    id: 'overview-1',
    category: 'About Campus',
    title: 'Middlesex University Mauritius Overview & Accreditations',
    content: `Middlesex University Mauritius is an international branch campus of Middlesex University London, located at Coastal Road, Cascavelle / Flic-en-Flac, Mauritius. 
Degrees awarded are identical British qualifications accredited by the Quality Assurance Agency (QAA) in the United Kingdom. 
The campus boasts cutting-edge computer suites, an Innovation & Robotics Lab, modern library, collaborative student commons, high-speed campus-wide Eduroam WiFi, and scenic student recreation spaces.`
  },
  {
    id: 'virtual-tour-1',
    category: 'Virtual Tour',
    title: '360° Interactive Campus Virtual Tour',
    content: `Experience our Cascavelle campus virtually anytime! The official 360-degree interactive tour is accessible at:
https://app.lapentor.com/sphere/mdx-mru-virtual-tour
Explore panoramic views of the amphitheatre, modern lecture halls, robotics lab, cafeteria, student lounge, and the main archway entrance.`
  },
  {
    id: 'courses-undergrad',
    category: 'Academic Programs',
    title: 'Undergraduate Degree Programs (BSc & BA)',
    content: `Undergraduate Degree Offerings (3 Years Full-Time / 4 Years with Foundation):
1. BSc (Hons) Computer Science: Accredited by the British Computer Society (BCS). Covers full-stack software development, AI & machine learning, distributed cloud systems, cybersecurity, and algorithms.
2. BA (Hons) Business Management: Covers global strategic management, financial analysis, marketing strategies, entrepreneurship, and organizational leadership.
3. BSc (Hons) Psychology with Counselling Skills: Accredited by the British Psychological Society (BPS). Focuses on cognitive neuroscience, developmental psychology, mental health ethics, and therapeutic counselling skills.
4. BA (Hons) Accounting and Finance: Dual-accredited by ACCA, CIMA, and ICAEW, providing major exemptions from professional examinations.
5. BA (Hons) Advertising, PR and Branding: Digital brand storytelling, public relations campaigns, consumer psychology, and multimedia production.
6. LLB (Hons) Law: Qualifying English Law degree covering constitutional law, criminal law, international commercial arbitration, and human rights.`
  },
  {
    id: 'courses-postgrad',
    category: 'Academic Programs',
    title: 'Postgraduate, Top-Up & Foundation Programs',
    content: `Postgraduate & Pathway Programs:
- IFP (International Foundation Programme): 1-year pathway preparing international and local high school graduates for direct entry into UK undergraduate degrees.
- Advanced Entry & Top-Up Degrees (Final Year Entry): For holders of diplomas, BTEC HNDs, or transfer credits seeking to complete their UK bachelor's degree in 1 to 2 years.
- MSc / MBA Postgraduate Programs: Advanced applied computing, strategic corporate management, data intelligence, and executive leadership.`
  },
  {
    id: 'fees-structure',
    category: 'Tuition Fees & Payments',
    title: 'International Tuition Fees, Admin Fees & Installment Schedules',
    content: `Official Tuition Fee & Payment Plan Schedule:
• IFP (Foundation): Total £4,000 (£3,600 tuition + £400 admin). Deposit: £2,200, followed by 2 installments of £900.
• BA Business Management / BSc Psychology / BA Accounting & Finance: Total £5,800 (£5,400 tuition + £400 admin). Deposit: £2,800, followed by 2 installments of £1,500.
• BSc Computer Science: Total £6,400 (£6,000 tuition + £400 admin). Deposit: £3,400, followed by 2 installments of £1,500.
• LLB Law Programs: Total £6,400 (£6,000 tuition + £400 admin). Deposit: £3,400, followed by 2 installments of £1,500.
• Advanced Entry & Top-Up: Total £6,400 (£6,000 tuition + £400 admin). Deposit: £3,400, followed by 2 installments of £1,500.
• Postgraduate (MSc/MBA): Total £7,420 (£7,020 tuition + £400 admin). Deposit: £3,820, followed by 2 installments of £1,800.
Payment Methods: Bank wire transfer, online portal payment, or campus finance desk credit/debit card.`
  },
  {
    id: 'scholarships-aid',
    category: 'Tuition Fees & Payments',
    title: 'Scholarships, Bursaries & Early Payment Discounts',
    content: `Financial Aid & Scholarships at MDX Mauritius:
1. Academic Merit Scholarship: Up to 20% tuition fee reduction for students demonstrating outstanding A-Level, IB, or French Baccalaureate grades.
2. Early Bird Discount: £300 discount on full upfront payment before term start.
3. Sibling Bursary: 10% fee reduction for siblings enrolled concurrently.
4. Sports & Leadership Bursaries: Awarded to regional/national athletes and youth leaders.`
  },
  {
    id: 'navigation-locations',
    category: 'Campus Navigation & Facilities',
    title: 'Campus Coordinates, Buildings & Navigation GPS',
    content: `Campus Buildings and GPS Coordinates:
• Archway & Main Entrance: Lat -20.280309, Lng 57.395255. Primary access point, security gate, and visitor check-in.
• Admin Building: Lat -20.280553, Lng 57.395167. Houses the Registrar, Admissions Office, Student Finance, and Dean's Office.
• Campus Library & Study Pods: Lat -20.280528, Lng 57.394936. Open 8:00 AM to 7:00 PM on weekdays. Features silent reading pods, group study rooms, desktop terminals, and book borrowing.
• Print Pod: Lat -20.280528, Lng 57.394936 (within Library Wing). High-speed multi-function photocopiers, scanning, and color printing.
• IT Support Desk: Lat -20.280791, Lng 57.395543. Walk-in helpdesk for student portal access, campus WiFi (Eduroam), software licenses, and hardware diagnostics.
• Robotics & AI Lab: Lat -20.280829, Lng 57.395387. Equipped with autonomous robotic kits, IoT sensor stations, Raspberry Pi / Arduino benches, and high-performance GPU workstations.
• Cafeteria & Student Hub: Lat -20.280650, Lng 57.395420. Serving hot meals, snacks, coffee, and providing indoor recreation (table tennis, foosball, lounge).
• Outdoor Amphitheatre: Central quad for student assemblies, cultural showcases, and guest keynote lectures.`
  },
  {
    id: 'appointments-scheduling',
    category: 'Student Services',
    title: 'Advisory, Faculty & Staff Appointment Booking',
    content: `Students can schedule one-on-one appointments across key campus departments:
1. Admissions & Visa Advisory: Student visas, CAS statements, enrollment confirmation, document attestation.
2. Program Coordinators & Lecturers: Academic guidance, thesis supervision, coursework feedback, module selection.
3. Student Finance: Tuition fee installment plans, receipts, and sponsorship letters.
4. Career & Placement Services: Resume/CV review, internship applications, mock interviews, and industry networking.
5. Wellness & Counseling: Confidential psychological counseling, stress management, and disability accommodations.`
  },
  {
    id: 'student-clubs-events',
    category: 'Campus Life & Events',
    title: 'Clubs, Societies & Annual Campus Events',
    content: `Student Life, Clubs & Major Campus Events:
• Computing & Tech Club: Hosts annual 48-hour hackathons, competitive programming contests, and AI workshops.
• Business & Entrepreneurship Society: Business pitch competitions, guest industry speakers, and startup incubation.
• Law Society: Organizes mock trial court competitions (mooting) and visits to the Supreme Court of Mauritius.
• Sports Club: Football, badminton, basketball tournaments, and cross-country runs.
• Major Annual Events:
  - Orientation Week: Welcome fairs, campus tours, icebreakers, and club sign-ups.
  - TechFest & Innovation Expo: Student showcase of software and robotics projects.
  - Cultural Day: Celebrating international diversity with traditional cuisine, music, and attire.
  - Career Fair: Connecting students with top multinational employers across Mauritius and the Indian Ocean.`
  },
  {
    id: 'admissions-timeline',
    category: 'Academic Calendar',
    title: 'Intakes, Term Dates & Academic Calendar',
    content: `Academic Calendar & Intakes:
• October Intake (Autumn Semester): Primary intake for all undergraduate, postgraduate, and foundation degrees. Classes commence early October.
• February Intake (Spring Semester): Mid-year entry for select degrees, top-up programs, and postgraduates.
• Exam Periods: January (Semester 1 exams) and May/June (Semester 2 exams).
• Holidays: Christmas/New Year recess, Independence Day (March 12), and summer vacation (July - September).`
  },
  {
    id: 'accommodation-transport',
    category: 'Campus Services',
    title: 'Student Accommodation & Campus Shuttle Services',
    content: `Housing & Daily Commute:
• Student Housing: Approved student residences in Flic-en-Flac and Cascavelle with 24/7 security, WiFi, shared kitchens, and laundry facilities.
• Campus Shuttle Bus: Complimentary university shuttle buses operate between Flic-en-Flac beach residences, Quatre Bornes, Rose Hill, and the campus.
• Public Transit: Easy access via public buses along the Cascavelle / Black River Coastal road.`
  },
  {
    id: 'study-tips-support',
    category: 'Academic Skills',
    title: 'Study Planning, Academic Writing & Exam Preparation',
    content: `Academic Success Guidelines:
• Study Planning: Recommended 25-50 minute Pomodoro intervals with 5-10 minute rest periods. Allocate 15-20 hours weekly for independent study outside lectures.
• Harvard Referencing: Mandatory referencing format for all coursework essays and dissertations.
• Academic Writing Support: Weekly drop-in clinics at the Library for essay structuring, literature reviews, and critical analysis.
• Extension Requests: Extenuating circumstances (deferrals) must be lodged with medical evidence within 7 days via the student portal.`
  }
];

// Ingest dynamic JSON items into corpus
campusLocations.forEach((loc, index) => {
  campusKnowledgeCorpus.push({
    id: `location-${index}`,
    category: 'Campus Navigation',
    title: `Location: ${loc.LocationName}`,
    content: `Campus Landmark: "${loc.LocationName}". Located at Latitude: ${loc.Coordinates.lat}, Longitude: ${loc.Coordinates.lng}. Accessible directly from the central campus walkway.`
  });
});

internationalFees.forEach((fee, index) => {
  campusKnowledgeCorpus.push({
    id: `fee-detail-${index}`,
    category: 'Tuition Fees',
    title: `Tuition Fees for ${fee.Program}`,
    content: `Program: ${fee.Program}. Tuition Fee: ${fee.TuitionFees}. Administrative Fee: ${fee.AdminFees}. Total Full Payment: ${fee.FullPayment}. Installment Plan: Non-refundable deposit ${fee.InstallmentNonRefundableDeposit}, followed by 2 equal installments of ${Array.isArray(fee.Installment) ? fee.Installment.join(' and ') : fee.Installment}.`
  });
});

// TF-IDF Semantic Vector Retrieval for RAG Pipeline
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s£$-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'to', 'in', 'of', 'for', 'with',
  'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'has', 'have', 'had',
  'can', 'could', 'should', 'would', 'i', 'you', 'he', 'she', 'they', 'we', 'me', 'my', 'what',
  'how', 'when', 'who', 'where', 'why', 'tell', 'show', 'give', 'about', 'some', 'any'
]);

function computeIDF(corpus) {
  const docCount = corpus.length;
  const df = {};
  corpus.forEach(doc => {
    const tokens = new Set(tokenize(`${doc.title} ${doc.content}`));
    tokens.forEach(token => {
      df[token] = (df[token] || 0) + 1;
    });
  });

  const idf = {};
  Object.keys(df).forEach(token => {
    idf[token] = Math.log((docCount + 1) / (df[token] + 1)) + 1;
  });
  return idf;
}

const corpusIDF = computeIDF(campusKnowledgeCorpus);

function vectorize(tokens, idf) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const vector = {};
  let norm = 0;
  Object.keys(tf).forEach(t => {
    const weight = (tf[t] / tokens.length) * (idf[t] || 1);
    vector[t] = weight;
    norm += weight * weight;
  });
  return { vector, norm: Math.sqrt(norm) || 1 };
}

// Pre-vectorize all corpus documents
const docVectors = campusKnowledgeCorpus.map(doc => {
  const tokens = tokenize(`${doc.title} ${doc.content}`);
  return {
    ...doc,
    ...vectorize(tokens, corpusIDF)
  };
});

function retrieveRelevantContexts(query, topK = 4) {
  if (!query || typeof query !== 'string') {
    return campusKnowledgeCorpus.slice(0, topK);
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return campusKnowledgeCorpus.slice(0, topK).map(doc => ({ ...doc, score: 0.1 }));
  }

  const { vector: queryVec, norm: queryNorm } = vectorize(queryTokens, corpusIDF);

  const scoredDocs = docVectors.map(doc => {
    let dotProduct = 0;
    queryTokens.forEach(token => {
      if (doc.vector[token]) {
        dotProduct += (queryVec[token] || 0) * doc.vector[token];
      }
    });

    let boost = 0;
    const lowerQuery = query.toLowerCase();
    if (doc.title.toLowerCase().includes(lowerQuery) || lowerQuery.includes(doc.title.toLowerCase())) {
      boost += 0.6;
    }
    if (doc.category.toLowerCase().includes(lowerQuery)) {
      boost += 0.35;
    }

    const similarity = (dotProduct / (queryNorm * doc.norm)) + boost;
    return {
      id: doc.id,
      category: doc.category,
      title: doc.title,
      content: doc.content,
      score: similarity
    };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, topK);
}

module.exports = {
  campusKnowledgeCorpus,
  internationalFees,
  campusLocations,
  retrieveRelevantContexts
};
