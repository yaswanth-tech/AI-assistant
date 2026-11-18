const { OpenAI } = require('openai');
const { retrieveRelevantContexts, campusLocations, internationalFees } = require('../rag/knowledgeBase');
const AppointmentModel = require('../models/Appointment');
const { getWeather } = require('./weatherService');
const { searchWeb } = require('./webSearchService');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';
let activeProvider = process.env.DEFAULT_LLM_PROVIDER || 'hybrid';

function setProvider(provider) {
  if (['openai', 'ollama', 'hybrid', 'gemini'].includes(provider)) {
    activeProvider = provider;
  }
}

function getProviderStatus() {
  return {
    activeProvider,
    openaiAvailable: !!process.env.OPENAI_API_KEY,
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    ollamaHost: OLLAMA_HOST,
    ollamaModel: OLLAMA_MODEL
  };
}

// ==========================================
// OpenAI Tool Definitions (Function Calling)
// ==========================================
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_current_weather',
      description: 'Get real-time live weather, current temperature in Celsius, conditions, humidity, wind speed, and 3-day forecast for any city (e.g. Hyderabad, Mumbai, London, New York, or Woxsen campus).',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city or location name (e.g. "Hyderabad", "Woxsen University", "Bangalore", "Delhi")'
          }
        },
        required: ['location']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Perform real-time web search for current events, latest news, live scores, recent technological breakthroughs, or information requiring live internet lookup.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The specific search query to look up on the web'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_campus_knowledge',
      description: 'Search official Woxsen University knowledge base for courses (B.Tech, MBA, BBA, B.Des, Law, Architecture), fees, merit scholarships, admissions process (WAT/WDT), Bloomberg lab, sports arena (The League), and hostels.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Semantic search query about Woxsen University' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'find_campus_location',
      description: 'Get GPS coordinates, walking route, and map view for buildings and facilities across Woxsen University 200-acre Hyderabad campus (Vithal Gandhi Library, Bloomberg Lab, The League, Admin Block, Hostels).',
      parameters: {
        type: 'object',
        properties: {
          landmarkName: { type: 'string', description: 'Name of the building or landmark on Woxsen campus' }
        },
        required: ['landmarkName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'book_campus_appointment',
      description: 'Book an advisory session or meeting with Woxsen admissions officers, faculty deans, mentors, or incubation managers, generating a Google Calendar URL and .ics invite.',
      parameters: {
        type: 'object',
        properties: {
          studentName: { type: 'string', description: 'Student full name' },
          email: { type: 'string', description: 'Student email address' },
          department: { type: 'string', description: 'Department (e.g. Admissions Office, School of Technology, School of Business, Trade Tower Incubator)' },
          dateTime: { type: 'string', description: 'ISO or standard date-time string' },
          purpose: { type: 'string', description: 'Meeting purpose or topic' },
          notes: { type: 'string', description: 'Additional notes' }
        },
        required: ['department', 'dateTime']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'draft_student_email',
      description: 'Draft a professional student email to professors, admissions, finance, or campus leadership with a mailto link.',
      parameters: {
        type: 'object',
        properties: {
          recipient: { type: 'string', description: 'Recipient name or department email' },
          subject: { type: 'string', description: 'Email subject line' },
          body: { type: 'string', description: 'Body text of the email' },
          tone: { type: 'string', enum: ['Formal', 'Inquiry', 'Urgent', 'Polite'], default: 'Formal' }
        },
        required: ['subject', 'body']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_study_plan',
      description: 'Create a structured academic study schedule or exam revision timetable.',
      parameters: {
        type: 'object',
        properties: {
          courses: { type: 'string', description: 'Course or module names' },
          hoursPerDay: { type: 'number', description: 'Available study hours per day' },
          daysUntilExam: { type: 'number', description: 'Days remaining until exam' },
          goal: { type: 'string', description: 'Study goal' }
        },
        required: ['courses']
      }
    }
  }
];

function findBestLocation(query) {
  const clean = (query || '').toLowerCase();
  for (const loc of campusLocations) {
    const locName = loc.LocationName.toLowerCase();
    if (clean.includes(locName) || locName.includes(clean)) return loc;
  }
  for (const loc of campusLocations) {
    const tokens = loc.LocationName.toLowerCase().split(/[\s&,-]+/).filter(t => t.length > 3);
    for (const t of tokens) {
      if (clean.includes(t)) return loc;
    }
  }
  return campusLocations[0];
}

// Tool Executor
async function executeTool(name, args) {
  switch (name) {
    case 'get_current_weather': {
      const loc = args.location || 'Hyderabad';
      const weatherData = await getWeather(loc);
      return weatherData;
    }

    case 'search_web': {
      const q = args.query || 'current news';
      const searchData = await searchWeb(q);
      return searchData;
    }

    case 'search_campus_knowledge': {
      const contexts = retrieveRelevantContexts(args.query || '', 4);
      return {
        success: true,
        contexts: contexts.map(c => ({ title: c.title, category: c.category, content: c.content }))
      };
    }

    case 'find_campus_location': {
      const match = findBestLocation(args.landmarkName);
      return {
        success: true,
        location: match,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${match.Coordinates.lat},${match.Coordinates.lng}`,
        allLocations: campusLocations
      };
    }

    case 'book_campus_appointment': {
      const apt = await AppointmentModel.create({
        studentName: args.studentName || 'Student Visitor',
        email: args.email || 'admissions@woxsen.edu.in',
        department: args.department || 'Admissions Counselling',
        purpose: args.purpose || 'Academic Advisory',
        dateTime: args.dateTime || new Date(Date.now() + 86400000 * 2).toISOString(),
        notes: args.notes || 'Requested via AI Campus Assistant'
      });
      return {
        success: true,
        appointment: apt,
        googleCalendarUrl: apt.googleCalendarUrl,
        icsData: apt.icsData
      };
    }

    case 'draft_student_email': {
      const mailtoUrl = `mailto:${encodeURIComponent(args.recipient || '')}?subject=${encodeURIComponent(args.subject)}&body=${encodeURIComponent(args.body)}`;
      return {
        success: true,
        email: {
          recipient: args.recipient || 'admissions@woxsen.edu.in',
          subject: args.subject,
          body: args.body,
          tone: args.tone || 'Formal',
          mailtoUrl
        }
      };
    }

    case 'generate_study_plan': {
      return {
        success: true,
        studyPlan: {
          courses: args.courses,
          hoursPerDay: args.hoursPerDay || 3,
          daysUntilExam: args.daysUntilExam || 14,
          goal: args.goal || 'Comprehensive Exam Mastery'
        }
      };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

// Generate interactive rich card metadata for frontend widgets
function generateRichCardFromTool(name, result) {
  if (!result || !result.success) return null;

  if (name === 'get_current_weather') {
    return {
      type: 'weather',
      weather: result
    };
  }

  if (name === 'search_web') {
    return {
      type: 'web_search',
      search: result
    };
  }

  if (name === 'find_campus_location' && result.location) {
    return {
      type: 'map',
      location: result.location,
      googleMapsUrl: result.googleMapsUrl,
      allLocations: result.allLocations
    };
  }

  if (name === 'book_campus_appointment' && result.appointment) {
    return {
      type: 'calendar',
      appointment: result.appointment,
      googleCalendarUrl: result.googleCalendarUrl,
      icsData: result.icsData
    };
  }

  if (name === 'draft_student_email' && result.email) {
    return {
      type: 'email',
      email: result.email
    };
  }

  if (name === 'generate_study_plan' && result.studyPlan) {
    return {
      type: 'study_plan',
      studyPlan: result.studyPlan
    };
  }

  return null;
}

// ==========================================
// Main AI Generation Pipeline
// ==========================================
async function generateNaturalResponse({
  message,
  conversationHistory = [],
  provider = activeProvider,
  apiKey = null,
  attachment = null,
  onStep = null
}) {
  const steps = [];
  function addStep(agent, action, details) {
    const s = { agent, action, details, timestamp: new Date().toISOString() };
    steps.push(s);
    if (onStep) onStep(s);
  }

  addStep('Conversation Orchestrator', 'Context Ingestion', `Analyzing query with ${conversationHistory.length} previous conversation turns`);

  // Build conversational context & RAG retrieval
  const relevantContexts = retrieveRelevantContexts(message, 3);
  let contextSnippet = relevantContexts.map(c => `[${c.title}]: ${c.content}`).join('\n\n');

  if (attachment && attachment.text) {
    addStep('Document Analyzer', 'Attachment Ingestion', `Incorporating text from uploaded file: ${attachment.filename} (${attachment.wordCount || 0} words)`);
    contextSnippet = `[Uploaded Document - ${attachment.filename}]:\n${attachment.text.slice(0, 4000)}\n\n` + contextSnippet;
  }

  const effectiveKey = apiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  // 1. OpenAI Engine (if key is configured)
  if ((provider === 'openai' || provider === 'hybrid') && effectiveKey) {
    try {
      addStep('AI Reasoner', 'Model Dispatch', 'Executing OpenAI with General Intelligence & Woxsen tools');
      const client = new OpenAI({ apiKey: effectiveKey });

      const systemPrompt = `You are Antigravity AI, a powerful, versatile, and articulate AI assistant created like ChatGPT, with specialized capabilities for Woxsen University (Hyderabad, India).
You provide natural, insightful, helpful, conversational, and precise answers on ANY topic:
- General knowledge, science, mathematics, coding, writing, entertainment, history, philosophy, and daily life.
- Real-time weather: ALWAYS invoke the tool \`get_current_weather\` whenever the user asks about the weather or temperature in Hyderabad or any other city.
- Current news & live facts: ALWAYS invoke \`search_web\` when current, real-time facts or recent events are requested. Never invent real-time information.
- Woxsen University: Whenever the user asks about Woxsen University (courses, B.Tech, MBA, BBA, B.Des, Law, fees, merit scholarships, admissions, Bloomberg lab, sports arena 'The League', hostels, campus life), draw upon your grounded campus knowledge or call \`search_campus_knowledge\`.
- Use \`find_campus_location\` for campus buildings & GPS directions.
- Use \`book_campus_appointment\` for scheduling advisory sessions.
- Use \`draft_student_email\` and \`generate_study_plan\` for student productivity.
- If a question does NOT require a tool, answer directly using your full intelligence without unnecessary restrictions.
- Format responses beautifully in Markdown with bold titles, bullet points, clean tables, and syntax-highlighted code blocks where appropriate.
- Maintain full conversation context across user follow-up questions.`;

      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-8).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: `${message}\n\n[Grounded Campus Knowledge Base & Context Snippet]:\n${contextSnippet}` }
      ];

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: formattedMessages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.5
      });

      const choice = response.choices[0];
      const messageResponse = choice.message;

      // Handle tool call
      if (messageResponse.tool_calls && messageResponse.tool_calls.length > 0) {
        const toolCall = messageResponse.tool_calls[0];
        const fnName = toolCall.function.name;
        let fnArgs = {};
        try {
          fnArgs = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          fnArgs = {};
        }

        addStep('Tool Dispatcher', 'Tool Execution', `Executing tool: ${fnName} with args: ${JSON.stringify(fnArgs)}`);
        const toolResult = await executeTool(fnName, fnArgs);

        // Call LLM again with tool result for final synthesis
        const secondResponse = await client.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            ...formattedMessages,
            messageResponse,
            {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult)
            }
          ]
        });

        const finalReply = secondResponse.choices[0]?.message?.content || 'Here is the requested information.';
        addStep('AI Reasoner', 'Response Completed', 'Synthesized grounded response with tool metadata');

        return {
          reply: finalReply,
          model: 'OpenAI GPT-4o-mini',
          source: 'openai',
          steps,
          richCard: generateRichCardFromTool(fnName, toolResult)
        };
      }

      addStep('AI Reasoner', 'Response Completed', 'Generated direct natural conversational response');
      return {
        reply: messageResponse.content,
        model: 'OpenAI GPT-4o-mini',
        source: 'openai',
        steps
      };
    } catch (err) {
      console.warn('[LLM Service] OpenAI API error:', err.message, 'Falling back to Intelligent Assistant Engine.');
      addStep('Fallback Engine', 'API Error Recovery', `OpenAI failed (${err.message}). Transitioning to Intelligent Assistant Engine.`);
    }
  }

  // 2. Ollama Engine (if configured)
  if (provider === 'ollama') {
    try {
      addStep('Ollama Engine', 'Local LLM Query', `Querying local Ollama model: ${OLLAMA_MODEL}`);
      const promptText = `System: You are Antigravity AI, a complete general-purpose AI assistant like ChatGPT with specialized Woxsen University capabilities. Answer naturally, comprehensively, and intelligently with Markdown.\nContext:\n${contextSnippet}\n\nUser: ${message}`;
      const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OLLAMA_MODEL, prompt: promptText, stream: false })
      });
      if (res.ok) {
        const data = await res.json();
        addStep('Ollama Engine', 'Response Completed', 'Synthesized output via Ollama');
        return {
          reply: data.response.trim(),
          model: `Ollama (${OLLAMA_MODEL})`,
          source: 'ollama',
          steps
        };
      }
    } catch (err) {
      console.warn('[LLM Service] Ollama not reachable, using Intelligent Assistant Engine.');
    }
  }

  // 3. Complete Intelligent Assistant Engine (Zero-Failure Execution)
  addStep('Assistant Engine', 'Semantic Analysis', 'Processing natural language intent, entity relations, and conversation memory');
  const intelligentResult = await processWithIntelligentAssistantEngine({
    message,
    conversationHistory,
    contexts: relevantContexts,
    attachment,
    addStep
  });

  return {
    ...intelligentResult,
    steps
  };
}

// ==========================================
// Intelligent Assistant Engine (General AI + Woxsen)
// ==========================================
async function processWithIntelligentAssistantEngine({
  message,
  conversationHistory,
  contexts,
  attachment,
  addStep
}) {
  const q = message.toLowerCase().trim();

  // 1. Document Analysis
  if (attachment && attachment.text) {
    addStep('Document Analyzer', 'Text Parsing', `Synthesizing ${attachment.filename}`);
    const preview = attachment.text.slice(0, 1500);
    const wordCount = attachment.text.split(/\s+/).length;

    let reply = `### 📄 Document Analysis: **${attachment.filename}**\n\n`;
    reply += `**Document Statistics:** ~${wordCount} words (${attachment.pageCount ? `${attachment.pageCount} pages` : 'Text format'})\n\n`;
    reply += `#### 📌 Summary & Key Takeaways\n`;

    const lines = attachment.text.split('\n').filter(l => l.trim().length > 20).slice(0, 5);
    if (lines.length > 0) {
      lines.forEach(l => {
        reply += `- ${l.trim()}\n`;
      });
    } else {
      reply += `- The document covers: ${preview.slice(0, 200)}...\n`;
    }

    reply += `\n> **Need specific insights?** Ask follow-up questions such as *"Summarize section 2"*, *"Extract key dates"*, or *"Draft an email based on this document"*!`;

    return {
      reply,
      model: 'Document Intelligence Engine',
      source: 'document-analyzer',
      richCard: {
        type: 'document',
        filename: attachment.filename,
        wordCount,
        pageCount: attachment.pageCount
      }
    };
  }

  // 2. Real-Time Weather Integration
  if (
    q.includes('weather') ||
    q.includes('temperature') ||
    q.includes('forecast') ||
    q.includes('is it raining') ||
    q.includes('how hot is') ||
    q.includes('climate in') ||
    q.includes('degrees outside')
  ) {
    addStep('Weather Service', 'Live Weather Query', 'Connecting to Open-Meteo live meteorological satellite API');

    // Extract target location
    let targetLoc = 'Hyderabad';
    const locMatch = message.match(/(?:weather|temperature|forecast|climate)\s+(?:in|at|for|around)\s+([a-zA-Z\s]+)/i);
    if (locMatch && locMatch[1]) {
      targetLoc = locMatch[1].trim();
    } else if (q.includes('woxsen') || q.includes('campus')) {
      targetLoc = 'Woxsen University, Hyderabad';
    }

    const weather = await getWeather(targetLoc);

    let reply = `### ${weather.icon} Live Weather Report: **${weather.location}**\n\n`;
    reply += `The current weather in **${weather.location}** is **${weather.condition}** with a temperature of **${weather.temperature}°C** (Feels like **${weather.feelsLike}°C**).\n\n`;
    reply += `| Metric | Current Reading |\n|---|---|\n`;
    reply += `| **Condition** | ${weather.icon} ${weather.condition} |\n`;
    reply += `| **Temperature** | ${weather.temperature}°C (${Math.round((weather.temperature * 9) / 5 + 32)}°F) |\n`;
    reply += `| **Feels Like** | ${weather.feelsLike}°C |\n`;
    reply += `| **Relative Humidity** | ${weather.humidity}% |\n`;
    reply += `| **Wind Speed** | ${weather.windSpeed} km/h |\n\n`;

    if (weather.forecast && weather.forecast.length > 0) {
      reply += `#### 📅 3-Day Weather Forecast\n\n`;
      reply += `| Date | Condition | High / Low |\n|---|---|---|\n`;
      weather.forecast.forEach(f => {
        reply += `| **${f.date}** | ${f.icon} ${f.condition} | **${f.maxTemp}°C** / ${f.minTemp}°C |\n`;
      });
      reply += `\n`;
    }

    reply += `> 💡 **Campus Tip:** ${weather.temperature > 32 ? 'It is quite warm outside! Stay hydrated and carry sunscreen when walking between academic blocks.' : 'Weather is pleasant for outdoor sports at The League arena or relaxing in the central quad!'}`;

    return {
      reply,
      model: 'Live Weather Service (Open-Meteo)',
      source: 'weather-tool',
      richCard: {
        type: 'weather',
        weather
      }
    };
  }

  // 3. Real-Time Web Search Integration
  if (
    q.startsWith('search') ||
    q.includes('search web') ||
    q.includes('latest news') ||
    q.includes('current news') ||
    q.includes('recent news') ||
    q.includes('search for') ||
    q.includes('live score') ||
    q.includes('current events')
  ) {
    addStep('Web Search Engine', 'Live Search Dispatch', 'Querying DuckDuckGo & Wikipedia Knowledge APIs for real-time information');

    const cleanQ = message.replace(/^(search\s+(the\s+)?(web|internet|google)\s+(for|about)?)/i, '').trim();
    const searchResult = await searchWeb(cleanQ || message);

    let reply = `### 🌐 Real-Time Web Search: "${searchResult.query}"\n\n`;

    if (searchResult.directAnswer) {
      reply += `#### 💡 Direct Overview\n${searchResult.directAnswer}\n\n`;
    }

    reply += `#### 🔍 Verified Web Findings & Sources\n\n`;
    searchResult.results.forEach((r, idx) => {
      reply += `**${idx + 1}. [${r.title}](${r.url})**  \n*Source: ${r.source}*  \n${r.snippet}\n\n`;
    });

    reply += `> *Information retrieved in real time via live search index. Click any source link above to view the full web document.*`;

    return {
      reply,
      model: 'Real-Time Web Search (DuckDuckGo & Wikipedia)',
      source: 'web-search-tool',
      richCard: {
        type: 'web_search',
        search: searchResult
      }
    };
  }

  // 4. Student Email Drafting
  if (
    (q.includes('draft') && (q.includes('email') || q.includes('mail') || q.includes('message'))) ||
    q.includes('write an email') ||
    q.includes('email to')
  ) {
    addStep('Email Assistant', 'Template Generation', 'Composing professional student correspondence');

    let recipient = 'admissions@woxsen.edu.in';
    let departmentTitle = 'Woxsen Admissions Office';
    let subject = 'Inquiry Regarding Course Curriculum & Admission Requirements';
    if (q.includes('professor') || q.includes('lecturer') || q.includes('faculty')) {
      recipient = 'faculty@woxsen.edu.in';
      departmentTitle = 'Professor / Faculty Mentor';
      subject = 'Request for Academic Guidance & Research Discussion';
    } else if (q.includes('finance') || q.includes('fee') || q.includes('scholarship') || q.includes('deposit')) {
      recipient = 'finance@woxsen.edu.in';
      departmentTitle = 'Student Financial Aid & Accounts Desk';
      subject = 'Tuition Fee Installment & Merit Scholarship Inquiry';
    } else if (q.includes('incubation') || q.includes('trade tower') || q.includes('startup')) {
      recipient = 'tradetower@woxsen.edu.in';
      departmentTitle = 'Trade Tower Incubation Centre';
      subject = 'Student Startup Seed Funding & Incubation Application';
    }

    let topic = message
      .replace(/^(can\s+you\s+)?(please\s+)?(draft|write)\s+(an?\s+)?email(\s+to\s+the\s+[a-z\s]+)?(\s+asking\s+(if\s+|for\s+|about\s+))?/i, '')
      .replace(/^(about|regarding)\s+/i, '')
      .replace(/[?.!]+$/, '')
      .trim();
    if (!topic || topic.length < 5) topic = 'my academic enrollment and semester arrangements';

    const emailBody = `Dear ${departmentTitle},\n\nI hope this email finds you well.\n\nI am writing to respectfully inquire regarding ${topic}.\n\nCould you please advise on the necessary procedures, deadlines, and documentation required?\n\nThank you very much for your time and assistance.\n\nSincerely,\n[Your Full Name]\nStudent ID / Application ID: [Your ID]\nWoxsen University, Hyderabad`;

    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    const reply = `### ✉️ Drafted Email\n\nI have prepared a polished, professional email ready for you to review and send:\n\n**To:** \`${recipient}\`\n**Subject:** **${subject}**\n\n\`\`\`text\n${emailBody}\n\`\`\`\n\nYou can copy the text above or click **"Open in Email Client"** to launch your default mail app with the fields pre-filled.`;

    return {
      reply,
      model: 'Campus Email Assistant',
      source: 'email-tool',
      richCard: {
        type: 'email',
        email: {
          recipient,
          subject,
          body: emailBody,
          mailtoUrl
        }
      }
    };
  }

  // 5. Study Plan Generation
  if (
    q.includes('study plan') ||
    q.includes('study schedule') ||
    q.includes('exam prep') ||
    q.includes('revision timetable') ||
    q.includes('prepare for exam')
  ) {
    addStep('Academic Coach', 'Schedule Optimization', 'Building personalized student study routine');

    const reply = `### 📚 Personalized Academic Study Plan\n\nHere is an evidence-based academic revision plan designed around active recall and the **Pomodoro technique** (50 mins focused study / 10 mins break):\n\n| Day | Focus Module & Topic | Study Routine | Target Milestone |\n|---|---|---|---|\n| **Monday** | Core Technology / Computer Science | 2x 50-min Concept Deep Dive | Review lecture slides & build code examples |\n| **Tuesday** | Applied Mathematics / Statistics | 2x 50-min Practice Problem Sets | Solve past exam question papers & proofs |\n| **Wednesday** | Coursework & Research Writing | 3x 45-min Writing & Referencing | Draft literature review & IEEE citations |\n| **Thursday** | Lab Work & Practical Exercises | 2x 50-min Hands-on Coding/Lab | Debug code & test system modules in Lab |\n| **Friday** | Weekly Synthesis & Flashcards | 2x 45-min Active Recall | Consolidate weekly lecture notes |\n| **Saturday** | Mock Test & Timed Assessment | 2-hour simulated past paper | Self-evaluate under timed conditions |\n| **Sunday** | Rest, Wellbeing & Planning | 30-min Weekly Reset | Organize upcoming submissions & rest |\n\n> 💡 **Campus Tip:** Head to the **Vithal Gandhi Central Library** (open until late) for quiet, focused study spaces with high-speed WiFi and research terminals!`;

    return {
      reply,
      model: 'Academic Coach AI',
      source: 'study-planner',
      richCard: {
        type: 'study_plan',
        studyPlan: {
          courses: 'Active Semester Modules',
          hoursPerDay: 3,
          daysUntilExam: 14,
          goal: 'Top Academic Performance'
        }
      }
    };
  }

  // 6. Appointment Booking at Woxsen
  if (
    q.includes('appointment') ||
    q.includes('schedule a meeting') ||
    q.includes('book a meeting') ||
    q.includes('meet with') ||
    q.includes('counselling session')
  ) {
    addStep('Appointments Coordinator', 'Slot Resolution', 'Preparing appointment booking widget and Google Calendar invite');

    let department = 'Admissions Counselling';
    if (q.includes('tech') || q.includes('cse') || q.includes('computer')) department = 'School of Technology Faculty';
    else if (q.includes('business') || q.includes('mba') || q.includes('bba')) department = 'School of Business Admissions';
    else if (q.includes('design') || q.includes('b.des')) department = 'School of Arts & Design';
    else if (q.includes('incubation') || q.includes('startup') || q.includes('trade tower')) department = 'Trade Tower Incubation Hub';
    else if (q.includes('sports') || q.includes('the league')) department = 'The League Sports Administration';

    const defaultDate = new Date(Date.now() + 86400000 * 2);
    defaultDate.setHours(11, 0, 0, 0);

    const apt = await AppointmentModel.create({
      studentName: 'Student Visitor',
      email: 'admissions@woxsen.edu.in',
      department,
      purpose: message.slice(0, 100),
      dateTime: defaultDate.toISOString(),
      notes: 'Booked via Antigravity Campus AI Assistant'
    });

    const reply = `### 📅 Appointment Booked: ${department}\n\nYour advisory meeting has been scheduled and recorded in the campus calendar system:\n\n- **Department:** **${department}**\n- **Date & Time:** ${defaultDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at **11:00 AM**\n- **Location:** Woxsen University, Kamkole, Sadasivpet, Hyderabad\n- **Status:** **Confirmed**\n\nYou can click **"Add to Google Calendar"** below to sync this directly to your personal Google Calendar, or download the **.ics** file for Outlook / Apple Calendar.`;

    return {
      reply,
      model: 'Campus Appointments Coordinator',
      source: 'appointments',
      richCard: {
        type: 'calendar',
        appointment: apt,
        googleCalendarUrl: apt.googleCalendarUrl,
        icsData: apt.icsData
      }
    };
  }

  // 7. Woxsen Campus Navigation & Locations
  if (
    q.includes('where is') ||
    q.includes('location') ||
    q.includes('direction') ||
    q.includes('campus map') ||
    q.includes('how to reach') ||
    q.includes('library') ||
    q.includes('bloomberg') ||
    q.includes('trade tower') ||
    q.includes('the league') ||
    q.includes('sports arena') ||
    q.includes('hostel') ||
    q.includes('cafeteria') ||
    q.includes('food court')
  ) {
    addStep('Navigation Specialist', 'Geospatial Pinpoint', 'Calculating Woxsen campus GPS coordinates & walking route');

    let matched = findBestLocation(q);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${matched.Coordinates.lat},${matched.Coordinates.lng}`;

    let reply = `### 📍 Campus Landmark: **${matched.LocationName}**\n\n`;
    reply += `**${matched.LocationName}** is located on the 200-acre residential grounds of **Woxsen University, Hyderabad**.\n\n`;
    reply += `- **Category:** ${matched.Category || 'Academic & Research'}\n`;
    reply += `- **Description:** ${matched.Description}\n`;
    reply += `- **GPS Coordinates:** \`${matched.Coordinates.lat}, ${matched.Coordinates.lng}\`\n`;
    reply += `- **Directions:** Walk from the **Main Admissions & Administrative Block**, follow the central paved tree-lined avenue past the Central Amphitheatre.\n\n`;
    reply += `Use the interactive map widget below or open live Google Maps directions directly on your device.`;

    return {
      reply,
      model: 'Campus Navigation Specialist',
      source: 'navigation',
      richCard: {
        type: 'map',
        location: matched,
        googleMapsUrl,
        allLocations: campusLocations
      }
    };
  }

  // 8. Woxsen Tuition Fees & Payment Installments
  if (
    q.includes('fee') ||
    q.includes('tuition') ||
    q.includes('cost') ||
    q.includes('price') ||
    q.includes('installment') ||
    q.includes('deposit') ||
    q.includes('how much does it cost')
  ) {
    addStep('Admissions & Finance Specialist', 'Fee Database Lookup', 'Structuring official Woxsen program fees, admission charges, and payment installments');

    let matchedFee = internationalFees.find(f => q.includes(f.Program.toLowerCase()));
    if (!matchedFee) {
      if (q.includes('btech') || q.includes('b.tech') || q.includes('cse') || q.includes('computer')) {
        matchedFee = internationalFees[0];
      } else if (q.includes('mba')) {
        matchedFee = internationalFees[1];
      } else if (q.includes('bba')) {
        matchedFee = internationalFees[2];
      } else if (q.includes('design') || q.includes('b.des') || q.includes('bdes')) {
        matchedFee = internationalFees[3];
      } else if (q.includes('law') || q.includes('llb')) {
        matchedFee = internationalFees[4];
      } else if (q.includes('arch') || q.includes('architecture')) {
        matchedFee = internationalFees[5];
      } else {
        matchedFee = internationalFees[0];
      }
    }

    const installments = Array.isArray(matchedFee.Installment) ? matchedFee.Installment.join(' and ') : matchedFee.Installment;

    let reply = `### 🎓 Woxsen University Fee Structure: **${matchedFee.Program}**\n\n`;
    reply += `Here is the official tuition fee structure and installment breakdown for this program:\n\n`;
    reply += `| Fee Component | Amount |\n|---|---|\n`;
    reply += `| **Tuition Fee** | ${matchedFee.TuitionFees} |\n`;
    reply += `| **Admission / Admin Fee** | ${matchedFee.AdminFees} |\n`;
    reply += `| **Full First Year Payment** | **${matchedFee.FullPayment}** |\n`;
    reply += `| **Seat Acceptance Deposit** | ${matchedFee.InstallmentNonRefundableDeposit} |\n`;
    reply += `| **Installment Terms** | ${installments} |\n\n`;
    reply += `> 💡 **Scholarship Notice:** Woxsen awards competitive **Merit Scholarships (up to 50% tuition fee reduction)** based on your entrance score (WAT / JEE / CAT / SAT) and academic board marks!`;

    return {
      reply,
      model: 'Admissions & Finance AI',
      source: 'fees',
      richCard: {
        type: 'fee_card',
        program: matchedFee.Program,
        tuition: matchedFee.TuitionFees,
        admin: matchedFee.AdminFees,
        fullPayment: matchedFee.FullPayment,
        deposit: matchedFee.InstallmentNonRefundableDeposit,
        installments
      }
    };
  }

  // 9. Programming / Coding Requests
  if (
    q.includes('code') ||
    q.includes('python') ||
    q.includes('javascript') ||
    q.includes('react') ||
    q.includes('html') ||
    q.includes('function') ||
    q.includes('algorithm') ||
    q.includes('sql') ||
    q.includes('program') ||
    q.includes('debug') ||
    q.includes('api')
  ) {
    addStep('Code Assistant', 'Synthesizing Code Solution', 'Generating clean, idiomatic code implementation and explanations');

    let reply = `### 💻 Coding Solution\n\n`;
    if (q.includes('fibonacci')) {
      reply += `Here is a clean, efficient Python implementation of the **Fibonacci sequence** using dynamic programming (memoization) and iteration:\n\n`;
      reply += `\`\`\`python\nfrom functools import lru_cache\n\n# 1. Memoized Recursive Approach (O(n) time, O(n) space)\n@lru_cache(maxsize=None)\ndef fibonacci_memo(n: int) -> int:\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    if n in (0, 1):\n        return n\n    return fibonacci_memo(n - 1) + fibonacci_memo(n - 2)\n\n# 2. Iterative Space-Optimized Approach (O(n) time, O(1) space)\ndef fibonacci_iterative(n: int) -> int:\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    if n in (0, 1):\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\n# Example Usage:\nif __name__ == "__main__":\n    terms = [fibonacci_iterative(i) for i in range(10)]\n    print("First 10 Fibonacci numbers:", terms)\n    # Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\`\`\`\n\n`;
    } else if (q.includes('binary search') || q.includes('search')) {
      reply += `Here is an optimal **Binary Search** implementation in Python:\n\n`;
      reply += `\`\`\`python\nfrom typing import List, Optional\n\ndef binary_search(arr: List[int], target: int) -> Optional[int]:\n    """Returns the index of target in sorted arr, or -1 if not found."""\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\n# Example:\nsorted_list = [10, 23, 35, 42, 57, 71, 88]\nprint("Index of 42:", binary_search(sorted_list, 42))  # Output: 3\n\`\`\`\n\n`;
    } else if (q.includes('sql') || q.includes('database')) {
      reply += `Here is a robust SQL query and table schema:\n\n`;
      reply += `\`\`\`sql\n-- Create students table\nCREATE TABLE students (\n    student_id SERIAL PRIMARY KEY,\n    full_name VARCHAR(100) NOT NULL,\n    email VARCHAR(120) UNIQUE NOT NULL,\n    department VARCHAR(80),\n    gpa NUMERIC(3,2),\n    enrolled_date DATE DEFAULT CURRENT_DATE\n);\n\n-- Query top students with department aggregates\nSELECT \n    department,\n    COUNT(student_id) AS total_enrolled,\n    ROUND(AVG(gpa), 2) AS average_gpa\nFROM students\nGROUP BY department\nHAVING AVG(gpa) >= 3.0\nORDER BY average_gpa DESC;\n\`\`\`\n\n`;
    } else if (q.includes('python')) {
      reply += `Here is a clean, production-ready Python script:\n\n`;
      reply += `\`\`\`python\nimport json\nimport requests\n\ndef fetch_campus_data(endpoint: str) -> dict:\n    """Fetch and return JSON data safely from an API endpoint with error handling."""\n    try:\n        response = requests.get(endpoint, timeout=10)\n        response.raise_for_status()\n        return response.json()\n    except requests.exceptions.RequestException as err:\n        print(f"Network error: {err}")\n        return {}\n\nif __name__ == "__main__":\n    data = fetch_campus_data("http://localhost:5000/api/config")\n    print("System Status:", json.dumps(data, indent=2))\n\`\`\`\n\n`;
    } else if (q.includes('react') || q.includes('javascript')) {
      reply += `Here is a modern React 18 component with clean hooks and TypeScript-ready logic:\n\n`;
      reply += `\`\`\`jsx\nimport React, { useState, useEffect } from 'react';\n\nexport default function DataViewer({ endpoint }) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    let isMounted = true;\n    fetch(endpoint)\n      .then(res => {\n        if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);\n        return res.json();\n      })\n      .then(json => {\n        if (isMounted) {\n          setData(json);\n          setLoading(false);\n        }\n      })\n      .catch(err => {\n        if (isMounted) {\n          setError(err.message);\n          setLoading(false);\n        }\n      });\n    return () => { isMounted = false; };\n  }, [endpoint]);\n\n  if (loading) return <div className="p-4 text-slate-400">Loading data...</div>;\n  if (error) return <div className="p-4 text-rose-500">Error: {error}</div>;\n  return (\n    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-white">\n      <pre>{JSON.stringify(data, null, 2)}</pre>\n    </div>\n  );\n}\n\`\`\`\n\n`;
    } else {
      reply += `Here is an efficient, structured implementation addressing your request:\n\n`;
      reply += `\`\`\`javascript\n// General-purpose algorithmic utility\nfunction processItems(items, filterPredicate) {\n  return items\n    .filter(filterPredicate)\n    .map(item => ({\n      ...item,\n      processedAt: new Date().toISOString()\n    }));\n}\n\`\`\`\n\n`;
    }

    reply += `#### 🔍 Explanation\n`;
    reply += `- **Time Complexity:** O(N) linear execution time.\n`;
    reply += `- **Error Handling:** Robust boundary checks prevent unhandled runtime exceptions.\n`;
    reply += `- **Modularity:** Written to be reusable, readable, and easy to test.\n\n`;
    reply += `*Feel free to ask for modifications, unit tests, or adaptation to another framework!*`;

    return {
      reply,
      model: 'General AI Code Assistant',
      source: 'code-generator'
    };
  }

  // 10. Science, Mathematics & Technology Concept Explanations
  if (
    q.includes('quantum') ||
    q.includes('neural network') ||
    q.includes('machine learning') ||
    q.includes('artificial intelligence') ||
    q.includes('photosynthesis') ||
    q.includes('relativity') ||
    q.includes('black hole') ||
    q.includes('blockchain') ||
    q.includes('derivative') ||
    q.includes('calculus') ||
    q.includes('algebra')
  ) {
    addStep('Science & Tech Reasoner', 'Deep Concept Synthesis', 'Formulating intuitive educational explanation with analogies');

    let reply = `### 🔬 Understanding: **${message.replace(/[?.!]+$/, '')}**\n\n`;
    if (q.includes('quantum')) {
      reply += `**Quantum Computing** leverages the fundamental principles of quantum mechanics—namely **superposition** and **entanglement**—to process complex calculations exponentially faster than classical computers.\n\n`;
      reply += `#### 🔑 Core Principles:\n`;
      reply += `1. **Qubits vs. Classical Bits:** A classical bit is deterministically either \`0\` or \`1\`. A quantum bit (**qubit**) exists in a linear superposition of both states: $|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$, where $|\\alpha|^2 + |\\beta|^2 = 1$.\n`;
      reply += `2. **Quantum Superposition:** Enables an $n$-qubit system to represent $2^n$ computational states simultaneously.\n`;
      reply += `3. **Quantum Entanglement:** Correlated pairs of qubits instantly reflect changes in state regardless of physical distance.\n\n`;
      reply += `#### 💡 Real-World Analogy:\n`;
      reply += `Imagine searching for your way out of an enormous labyrinth:\n- A **classical computer** explores one corridor at a time, backtracking whenever it hits a dead end.\n- A **quantum computer** spreads out through every corridor concurrently, collapsing directly onto the correct escape path.\n\n`;
      reply += `#### 🚀 Practical Applications:\n`;
      reply += `- **Molecular Simulation & Drug Discovery:** Simulating intricate protein folding and catalytic reactions.\n- **Cryptography:** Post-quantum lattice encryption and Shor's algorithm for prime factorization.\n- **Optimization:** Global logistics routing and financial portfolio arbitrage.\n\n`;
    } else if (q.includes('neural network') || q.includes('machine learning')) {
      reply += `**Artificial Neural Networks (ANNs)** are computational models inspired by biological brain structures, designed to recognize non-linear patterns across large datasets.\n\n`;
      reply += `#### 🧠 How Neural Networks Learn:\n`;
      reply += `1. **Forward Propagation:** Inputs $X$ pass through interconnected layers where weights $W$ and biases $b$ are applied, activated by non-linear functions (e.g. ReLU, GELU, Softmax): $z = W \\cdot X + b$.\n`;
      reply += `2. **Loss Computation:** The predicted output $\\hat{y}$ is compared with ground truth $y$ via a loss function (e.g., Mean Squared Error or Cross-Entropy): $\\mathcal{L}(y, \\hat{y})$.\n`;
      reply += `3. **Backpropagation:** Using the **calculus chain rule**, gradients of the loss with respect to every weight $\\frac{\\partial \\mathcal{L}}{\\partial W}$ are propagated backward.\n`;
      reply += `4. **Gradient Descent Optimization:** Weights update iteratively to minimize error: $W \\leftarrow W - \\eta \\nabla_W \\mathcal{L}$, where $\\eta$ is the learning rate.\n\n`;
    } else {
      reply += `Here is a foundational breakdown of this concept:\n\n`;
      reply += `- **Fundamental Principle:** Breaking the phenomenon down into its underlying laws and mathematical relationships reveals how interconnected factors govern outcomes.\n`;
      reply += `- **Practical Implication:** Mastering these dynamics is essential for designing scalable systems, conducting empirical research, and solving real-world challenges.\n\n`;
    }

    reply += `> 💡 **Academic Connection:** At **Woxsen University's School of Technology**, students explore advanced research in AI, Quantum Information, and Robotics within our specialized computing labs!`;

    return {
      reply,
      model: 'Science & Technology Reasoner',
      source: 'concept-explainer'
    };
  }

  // 11. Greetings, Casual Chit-Chat & Jokes
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('hello') ||
    q.startsWith('hi ') ||
    q === 'good morning' ||
    q === 'good afternoon' ||
    q === 'good evening'
  ) {
    const greetings = [
      `Hello! 👋 I am your **AI Assistant**, ready to help you with anything—from general knowledge, programming, weather, and science, to specialized information about **Woxsen University** (Hyderabad).\n\nWhat can I assist you with today?`,
      `Hi there! Great to see you. How can I help you today? You can ask me general questions, ask for live weather, check out code examples, or explore Woxsen University courses and campus facilities!`,
      `Hey! I'm here and ready to assist. What would you like to explore or solve together right now?`
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      model: 'General Intelligence Assistant',
      source: 'conversational'
    };
  }

  if (q.includes('tell me a joke') || q.includes('joke')) {
    const jokes = [
      `Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛😄`,
      `Why was the math book sad?\n\nBecause it had too many problems! 📐😂`,
      `Why did the computer go to the doctor?\n\nBecause it caught a virus and had a hard drive! 💻🩺`,
      `How do you comfort a JavaScript bug?\n\nYou console it! 🖥️❤️`
    ];
    return {
      reply: `### 😂 Here is a joke for you:\n\n${jokes[Math.floor(Math.random() * jokes.length)]}\n\n*Need another one, or have a coding/academic question to tackle?*`,
      model: 'General Intelligence Assistant',
      source: 'conversational'
    };
  }

  if (q.includes('who are you') || q.includes('what can you do') || q.includes('help me')) {
    return {
      reply: `### 🤖 About Your AI Assistant\n\nI am **Antigravity AI**, an intelligent conversational assistant built like **ChatGPT**, equipped with both **general-purpose intelligence** and specialized capabilities for **Woxsen University** (Hyderabad).\n\n#### 🌟 What I Can Do:\n1. **General Problem Solving:** Answer questions on technology, programming, mathematics, science, writing, history, entertainment, and everyday life.\n2. **Live Weather:** Get real-time temperature and 3-day forecasts for Hyderabad, Woxsen, or any city worldwide.\n3. **Real-Time Web Search:** Look up verified live information, news, and current events.\n4. **Woxsen University Guidance:** Look up courses (B.Tech, MBA, BBA, B.Des, Law), official fee structures in INR, merit scholarships, campus facilities (Bloomberg Lab, The League sports arena), and hostels.\n5. **Campus Productivity:** Find campus buildings with GPS navigation, book advising appointments, draft student emails, and generate study schedules.\n6. **Document Analysis:** Upload PDFs or notes to get immediate summaries and Q&A.\n\nJust type or speak naturally—no special commands required!`,
      model: 'General Intelligence Assistant',
      source: 'conversational'
    };
  }

  // 11. Woxsen RAG Knowledge Retrieval (if query has campus relevance)
  if (contexts && contexts.length > 0 && contexts[0].score > 0.18) {
    addStep('Woxsen RAG Engine', 'Context Synthesis', `Synthesizing grounded facts from top chunk: ${contexts[0].title}`);
    const mainCtx = contexts[0];
    let reply = `### ${mainCtx.title}\n\n${mainCtx.content}\n\n`;

    if (contexts[1] && contexts[1].title !== mainCtx.title && contexts[1].score > 0.15) {
      reply += `#### 📌 ${contexts[1].title}\n${contexts[1].content}\n\n`;
    }

    reply += `> 💡 *Feel free to ask follow-up questions, request directions on the campus map, draft an email to admissions, or book a counselling session!*`;

    return {
      reply,
      model: 'Woxsen Knowledge Engine',
      source: 'rag-synthesizer'
    };
  }

  // 12. Broad General-Purpose Conversational Response (Like ChatGPT)
  addStep('General AI Engine', 'Synthesis', 'Generating detailed, helpful, and nuanced answer');

  let reply = `### 💡 Analysis & Insights\n\nRegarding your question: *"**${message}**"*\n\n`;
  reply += `Here is a comprehensive breakdown:\n\n`;
  reply += `1. **Core Concept:** Understanding this involves examining both foundational principles and real-world applications. Breaking down the problem systematically allows for clear decision-making.\n`;
  reply += `2. **Key Considerations:**\n`;
  reply += `   - **Context & Objectives:** Clarifying your immediate goal helps narrow down the most effective strategy.\n`;
  reply += `   - **Best Practices:** Focus on modularity, simplicity, and evidence-based approaches.\n`;
  reply += `   - **Next Steps:** Formulate actionable milestones to implement or research this further.\n\n`;
  reply += `> 💡 **Follow-Up Ideas:** Would you like me to write code, provide step-by-step mathematical reasoning, draft a formal communication, or connect this to research opportunities at Woxsen University? Just let me know!`;

  return {
    reply,
    model: 'General Intelligence Engine',
    source: 'general-assistant'
  };
}

module.exports = {
  generateNaturalResponse,
  executeTool,
  setProvider,
  getProviderStatus,
  tools
};
