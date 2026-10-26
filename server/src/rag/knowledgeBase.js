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
    title: 'Middlesex University Mauritius Overview',
    content: `Middlesex University Mauritius is an international branch campus located at Coastal Road, Flic-en-Flac / Cascavelle, Mauritius. It provides British degree standards accredited by the Quality Assurance Agency (QAA) in the UK. The campus features state-of-the-art computer labs, an innovation robotics lab, modern library, student hub, and collaborative workspaces.`
  },
  {
    id: 'virtual-tour-1',
    category: 'Virtual Tour',
    title: '360° Interactive Campus Virtual Tour',
    content: `Students and prospective visitors can explore the campus virtually anytime. The official 360-degree interactive virtual tour is hosted at https://app.lapentor.com/sphere/mdx-mru-virtual-tour with panoramic views of the amphitheatre, robotics lab, cafeteria, archway, and library.`
  },
  {
    id: 'courses-undergrad',
    category: 'Academic Programs',
    title: 'Undergraduate Programs Offered',
    content: `Available Undergraduate Programs:
1. BSc (Hons) Computer Science: Focuses on software engineering, artificial intelligence, algorithms, distributed systems, and cloud computing.
2. BA (Hons) Business Management: Covers entrepreneurship, international marketing, corporate finance, and operations management.
3. BSc (Hons) Psychology with Counselling Skills: Psychological research, cognitive science, developmental psychology, and mental health counselling.
4. BA (Hons) Accounting and Finance: Financial accounting, auditing, taxation, and investment banking accredited by ACCA/CIMA.
5. BA (Hons) Advertising, PR and Branding: Digital brand strategy, public relations, consumer behavior, and media production.
6. LLB (Hons) Law: English law, international law, commercial arbitration, and human rights.`
  },
  {
    id: 'courses-postgrad',
    category: 'Academic Programs',
    title: 'Postgraduate & Foundation Programs',
    content: `Foundation & Postgraduate Offerings:
- IFP (International Foundation Programme): 1-year preparatory pathway for students transitioning into British undergraduate degrees.
- Advanced Entry and Top-Up Programs: Allows diploma and transfer students direct entry to Year 2 or Year 3.
- MSc / MBA Postgraduate Degrees: Applied computing, advanced project management, international management, and data intelligence.`
  },
  {
    id: 'fees-structure',
    category: 'Tuition Fees & Payments',
    title: 'Tuition Fees & Installment Options',
    content: `International Tuition Fee Schedule:
- IFP (International Foundation): Total £4,000 (£3,600 tuition + £400 admin). Deposit: £2,200 followed by two installments of £900.
- BA Business Management / BSc Psychology / BA Accounting & Finance: Total £5,800 (£5,400 tuition + £400 admin). Deposit: £2,800 + two installments of £1,500.
- BSc Computer Science: Total £6,400 (£6,000 tuition + £400 admin). Deposit: £3,400 + two installments of £1,500.
- Law Programs (LLB): Total £6,400 (£6,000 tuition + £400 admin). Deposit: £3,400 + two installments of £1,500.
- Advanced Entry / Top-Up: Total £6,400 (£6,000 tuition + £400 admin). Deposit: £3,400 + two installments of £1,500.
- Postgraduate (MSc/MBA): Total £7,420 (£7,020 tuition + £400 admin). Deposit: £3,820 + two installments of £1,800.`
  },
  {
    id: 'navigation-locations',
    category: 'Campus Navigation & Facilities',
    title: 'Campus Coordinates and Key Locations',
    content: `Key Campus Landmarks and Navigation GPS:
- Archway & Main Entrance: Lat -20.280309, Lng 57.395255. Central campus access hub.
- Admin Building: Lat -20.280553, Lng 57.395167. Houses registrar, student finance, admissions, and dean's office.
- Campus Library & Study Pods: Lat -20.280528, Lng 57.394936. Open 8:30 AM to 7:00 PM on weekdays, providing quiet rooms, journals, and desktop terminals.
- Print Pod: Lat -20.280528, Lng 57.394936 (Library wing). Color/B&W laser printing and scanning.
- IT Support Desk: Lat -20.280791, Lng 57.395543. Assists with student portal, MDX email, eduroam WiFi, and software licenses.
- Robotics & AI Lab: Lat -20.280829, Lng 57.395387. Equipped with embedded IoT kits, autonomous rovers, and GPU workstations.`
  },
  {
    id: 'appointments-scheduling',
    category: 'Student Services & Appointments',
    title: 'Advisory and Faculty Appointment Booking',
    content: `Students can book one-on-one appointments with campus staff:
1. Admissions & Visa Advisory: Inquiries regarding student visa endorsements, CAS letters, and international transcripts.
2. Academic Tutoring & Program Coordinators: Degree planning, coursework feedback, and academic guidance.
3. Career Services & Internships: CV workshops, placement opportunities, and employer networking.
4. Student Wellness & Counselling: Confidential student counseling and disability support.
Appointments can be booked directly through the AI Campus Assistant with date and time specification.`
  },
  {
    id: 'admissions-timeline',
    category: 'Academic Calendar',
    title: 'Intakes and Academic Calendar',
    content: `Middlesex University Mauritius runs two primary intakes:
- October / Autumn Intake: Major intake for all undergraduate and postgraduate degrees.
- February / Spring Intake: Selected undergraduate programs, top-up pathways, and postgraduate certificates.
Applications remain open year-round for international students with rolling review.`
  }
];

// Ingest dynamic JSON items into corpus
campusLocations.forEach((loc, index) => {
  campusKnowledgeCorpus.push({
    id: `location-${index}`,
    category: 'Campus Navigation',
    title: `Location: ${loc.LocationName}`,
    content: `Campus Location "${loc.LocationName}" is located at GPS coordinates Latitude: ${loc.Coordinates.lat}, Longitude: ${loc.Coordinates.lng}. Accessible via the main campus concourse.`
  });
});

internationalFees.forEach((fee, index) => {
  campusKnowledgeCorpus.push({
    id: `fee-detail-${index}`,
    category: 'Tuition Fees',
    title: `Fees for ${fee.Program}`,
    content: `Program: ${fee.Program}. Tuition: ${fee.TuitionFees}. Admin Fee: ${fee.AdminFees}. Full Payment: ${fee.FullPayment}. Installment Plan: Non-refundable deposit ${fee.InstallmentNonRefundableDeposit}, followed by installments of ${Array.isArray(fee.Installment) ? fee.Installment.join(' and ') : fee.Installment}.`
  });
});

// TF-IDF style Vector Retrieval for RAG Pipeline
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s£$-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'to', 'in', 'of', 'for', 'with',
  'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'has', 'have', 'had',
  'can', 'could', 'should', 'would', 'i', 'you', 'he', 'she', 'they', 'we', 'me', 'my'
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

function retrieveRelevantContexts(query, topK = 3) {
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

    // Keyword match boost
    let boost = 0;
    const lowerQuery = query.toLowerCase();
    if (doc.title.toLowerCase().includes(lowerQuery) || lowerQuery.includes(doc.title.toLowerCase())) {
      boost += 0.5;
    }
    if (doc.category.toLowerCase().includes(lowerQuery)) {
      boost += 0.3;
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

// Prompt Engineering Template for RAG Pipeline
function formatRAGPrompt(userQuery, contexts, history = [], agentRole = 'Campus Assistant') {
  const contextStr = contexts
    .map((c, i) => `[Context Chunk ${i + 1} - ${c.title} (${c.category})]:\n${c.content}`)
    .join('\n\n');

  const historyStr = history
    .slice(-4)
    .map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
    .join('\n');

  return {
    systemPrompt: `You are the AI Campus Assistant for Middlesex University Mauritius, specialized as the ${agentRole}.
Your mission is to provide helpful, welcoming, accurate, and context-grounded guidance to students, applicants, and visitors.
Use the provided Context Chunks from the campus knowledge base to answer questions with precision.
If fees or installment plans are discussed, format them clearly.
If campus navigation or locations are asked, mention landmarks and directions.
Tone: Professional, academic, warm, and concise.`,
    userPrompt: `Here is the relevant campus knowledge retrieved by the RAG pipeline:
---
${contextStr}
---
${historyStr ? `Recent Conversation History:\n${historyStr}\n---\n` : ''}
User Query: "${userQuery}"

Provide a comprehensive, accurate response based on the campus knowledge above.`
  };
}

module.exports = {
  campusKnowledgeCorpus,
  internationalFees,
  campusLocations,
  retrieveRelevantContexts,
  formatRAGPrompt
};
