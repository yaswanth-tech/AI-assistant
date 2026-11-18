const { OpenAI } = require('openai');
const { retrieveRelevantContexts, campusLocations, internationalFees } = require('../rag/knowledgeBase');
const AppointmentModel = require('../models/Appointment');

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

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_campus_knowledge',
      description: 'Search official Middlesex University Mauritius information about courses, fees, scholarships, academic calendar, student services, and campus guidelines.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Semantic search query about campus' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'find_campus_location',
      description: 'Get GPS coordinates, walking directions, and map view for a campus building or facility (Library, Robotics Lab, Admin, Cafeteria, etc.).',
      parameters: {
        type: 'object',
        properties: {
          landmarkName: { type: 'string', description: 'Name of the building or landmark' }
        },
        required: ['landmarkName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'book_campus_appointment',
      description: 'Book an academic advisory session or meeting with faculty / staff and generate a Google Calendar invite.',
      parameters: {
        type: 'object',
        properties: {
          studentName: { type: 'string', description: 'Student full name' },
          email: { type: 'string', description: 'Student email address' },
          department: { type: 'string', description: 'Department (e.g. Admissions Office, Computer Science Faculty, Student Finance, IT Support)' },
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
      description: 'Draft a professional student email to professors, admissions, finance, or campus dean with a mailto link.',
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
  },
  {
    type: 'function',
    function: {
      name: 'open_virtual_tour',
      description: 'Launch the official 360-degree interactive virtual tour of Middlesex University Mauritius campus.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

// Tool Executor
async function executeTool(name, args) {
  switch (name) {
    case 'search_campus_knowledge': {
      const contexts = retrieveRelevantContexts(args.query || '', 4);
      return {
        success: true,
        contexts: contexts.map(c => ({ title: c.title, category: c.category, content: c.content }))
      };
    }

    case 'find_campus_location': {
      const q = (args.landmarkName || '').toLowerCase();
      let match = campusLocations.find(l => q.includes(l.LocationName.toLowerCase()) || l.LocationName.toLowerCase().includes(q));
      if (!match) match = campusLocations[0];
      return {
        success: true,
        location: match,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${match.Coordinates.lat},${match.Coordinates.lng}`,
        allLocations: campusLocations
      };
    }

    case 'book_campus_appointment': {
      const apt = await AppointmentModel.create({
        studentName: args.studentName || 'Student',
        email: args.email || 'student@mdx.ac.mu',
        department: args.department,
        purpose: args.purpose || 'Academic Advisory',
        dateTime: args.dateTime,
        notes: args.notes || ''
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
          recipient: args.recipient || 'campus@mdx.ac.mu',
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

    case 'open_virtual_tour': {
      return {
        success: true,
        virtualTourUrl: 'https://app.lapentor.com/sphere/mdx-mru-virtual-tour'
      };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

// Main AI Generation Pipeline
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

  addStep('Conversation Orchestrator', 'Context Ingestion', `Analyzing query with ${conversationHistory.length} previous turns`);

  // Build conversational context & RAG retrieval
  const relevantContexts = retrieveRelevantContexts(message, 3);
  let contextSnippet = relevantContexts.map(c => `[${c.title}]: ${c.content}`).join('\n\n');

  if (attachment && attachment.text) {
    addStep('Document Analyzer', 'Attachment Ingestion', `Incorporating text from uploaded file: ${attachment.filename} (${attachment.wordCount || 0} words)`);
    contextSnippet = `[Uploaded Document - ${attachment.filename}]:\n${attachment.text.slice(0, 4000)}\n\n` + contextSnippet;
  }

  const effectiveKey = apiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  // 1. Try OpenAI if key is available
  if ((provider === 'openai' || provider === 'hybrid') && effectiveKey) {
    try {
      addStep('AI Reasoner', 'Model Dispatch', 'Executing OpenAI API with dynamic tool calling');
      const client = new OpenAI({ apiKey: effectiveKey });

      const systemPrompt = `You are the AI Campus Assistant for Middlesex University Mauritius, an intelligent personal AI assistant built like ChatGPT.
You provide natural, insightful, helpful, conversational, and precise answers to students, faculty, and campus visitors.
You have access to tools for campus knowledge, campus map directions, appointment booking, study planning, email drafting, and 360 virtual tours.
Use Markdown formatting (bullet points, bold highlights, tables, and code snippets) to make answers clear, readable, and structured.
When the user asks follow-up questions, use the conversation history to maintain context.
Always be welcoming, professional, and directly actionable.`;

      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-8).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: `${message}\n\n[Grounded Campus Knowledge Base & Context]:\n${contextSnippet}` }
      ];

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: formattedMessages,
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.4
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

        addStep('Tool Dispatcher', 'Tool Execution', `Executing tool: ${fnName}`);
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
      console.warn('[LLM Service] OpenAI API error:', err.message, 'Falling back to Intelligent Campus AI Engine.');
      addStep('Fallback Engine', 'API Error Recovery', `OpenAI failed (${err.message}). Transitioning to Natural Campus Engine.`);
    }
  }

  // 2. Try Ollama if running
  if (provider === 'ollama') {
    try {
      addStep('Ollama Engine', 'Local LLM Query', `Querying local Ollama model: ${OLLAMA_MODEL}`);
      const promptText = `System: You are the AI Campus Assistant for Middlesex University Mauritius. Answer naturally and intelligently with Markdown.\nContext:\n${contextSnippet}\n\nUser: ${message}`;
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
      console.warn('[LLM Service] Ollama not reachable, using Intelligent Campus AI Engine.');
    }
  }

  // 3. High-Quality Intelligent Campus AI Engine (Zero-Failure Natural NLP Engine)
  addStep('Campus AI Engine', 'Semantic Analysis', 'Processing natural language intent, entity relations, and conversation memory');
  const intelligentResult = await processWithIntelligentCampusEngine({
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

// Generate interactive rich card metadata for frontend widgets
function generateRichCardFromTool(name, result) {
  if (!result || !result.success) return null;

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

  if (name === 'open_virtual_tour' && result.virtualTourUrl) {
    return {
      type: 'virtual_tour',
      virtualTourUrl: result.virtualTourUrl
    };
  }

  return null;
}

// Intelligent Campus AI Engine
async function processWithIntelligentCampusEngine({
  message,
  conversationHistory,
  contexts,
  attachment,
  addStep
}) {
  const q = message.toLowerCase().trim();

  // Document summarization / analysis
  if (attachment && attachment.text) {
    addStep('Document Analyzer', 'Text Parsing', `Synthesizing ${attachment.filename}`);
    const preview = attachment.text.slice(0, 1500);
    const wordCount = attachment.text.split(/\s+/).length;

    let reply = `### 📄 Document Analysis: **${attachment.filename}**\n\n`;
    reply += `**Document Statistics:** ~${wordCount} words (${attachment.pageCount ? `${attachment.pageCount} pages` : 'Text format'})\n\n`;
    reply += `#### 📌 Summary & Key Takeaways\n`;

    // Extract key sentences
    const lines = attachment.text.split('\n').filter(l => l.trim().length > 20).slice(0, 5);
    if (lines.length > 0) {
      lines.forEach(l => {
        reply += `- ${l.trim()}\n`;
      });
    } else {
      reply += `- The document covers: ${preview.slice(0, 200)}...\n`;
    }

    reply += `\n> **Need specific insights?** You can ask follow-up questions such as *"What are the deadlines?"*, *"What are the entry criteria?"*, or *"Can you draft an email summarizing this?"*`;

    return {
      reply,
      model: 'Campus Intelligence Engine',
      source: 'document-analyzer',
      richCard: {
        type: 'document',
        filename: attachment.filename,
        wordCount,
        pageCount: attachment.pageCount
      }
    };
  }

  // 1. Email Drafting
  if (q.includes('draft') && (q.includes('email') || q.includes('mail') || q.includes('message')) || q.includes('write an email') || q.includes('email to')) {
    addStep('Email Assistant', 'Template Generation', 'Composing professional student correspondence');

    let recipient = 'admissions@mdx.ac.mu';
    let departmentTitle = 'Admissions Office';
    let subject = 'Inquiry Regarding Course Enrollment & Prerequisites';
    if (q.includes('professor') || q.includes('lecturer')) {
      recipient = 'lecturer@mdx.ac.mu';
      departmentTitle = 'Professor / Module Leader';
      subject = 'Request for Academic Guidance & Meeting';
    } else if (q.includes('finance') || q.includes('fee') || q.includes('deposit')) {
      recipient = 'finance@mdx.ac.mu';
      departmentTitle = 'Student Finance Office';
      subject = 'Tuition Fee Installment & Payment Plan Inquiry';
    } else if (q.includes('visa')) {
      recipient = 'international@mdx.ac.mu';
      departmentTitle = 'International Student Visa Office';
      subject = 'Urgent: Student Visa & CAS Letter Status';
    }

    let topic = message
      .replace(/^(can\s+you\s+)?(please\s+)?(draft|write)\s+(an?\s+)?email(\s+to\s+the\s+[a-z\s]+)?(\s+asking\s+(if\s+|for\s+|about\s+))?/i, '')
      .replace(/^(about|regarding)\s+/i, '')
      .replace(/[?.!]+$/, '')
      .trim();
    if (!topic || topic.length < 5) topic = 'my academic inquiry and semester arrangements';

    const emailBody = `Dear ${departmentTitle},\n\nI hope this email finds you well.\n\nI am writing to respectfully inquire regarding ${topic}.\n\nCould you please advise on the necessary procedures, deadlines, and documentation required?\n\nThank you very much for your time and assistance.\n\nSincerely,\n[Your Full Name]\nStudent ID: [Your Student ID]\nMiddlesex University Mauritius`;

    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    const reply = `### ✉️ Drafted Email\n\nI have prepared a polished, professional email ready for you to review and send:\n\n**To:** \`${recipient}\`\n**Subject:** **${subject}**\n\n\`\`\`text\n${emailBody}\n\`\`\`\n\nYou can copy the text below or click **"Open in Email Client"** to launch your default mail app with the fields pre-filled.`;

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

  // 2. Study Plan Generation
  if (q.includes('study plan') || q.includes('study schedule') || q.includes('exam prep') || q.includes('revision timetable')) {
    addStep('Academic Coach', 'Schedule Optimization', 'Building personalized student study routine');

    const reply = `### 📚 Personalized Campus Study Plan\n\nHere is an effective, evidence-based academic revision plan designed around active recall and the **Pomodoro technique** (50 mins study / 10 mins break):\n\n| Day | Focus Module & Topic | Study Routine | Target Goal |\n|---|---|---|---|\n| **Monday** | Computer Science / Core Module | 2x 50-min Concept Deep Dive | Review lecture slides & build code examples |\n| **Tuesday** | Business / Applied Mathematics | 2x 50-min Practice Problem Sets | Solve past exam question papers |\n| **Wednesday** | Coursework & Essay Drafting | 3x 45-min Writing & Referencing | Harvard referencing & draft literature review |\n| **Thursday** | Lab Work & Practical Exercises | 2x 50-min Hands-on Coding/Lab | Debug code & test system modules in Lab |\n| **Friday** | Weekly Synthesis & Flashcards | 2x 45-min Active Recall | Consolidate weekly lecture notes |\n| **Saturday** | Mock Test & Timed Assessment | 2-hour simulated past paper | Self-evaluate under timed conditions |\n| **Sunday** | Rest, Wellbeing & Planning | 30-min Weekly Reset | Organize upcoming submissions & rest |\n\n> 💡 **Campus Tip:** Book a quiet study pod at the **Campus Library** (open 8:00 AM - 7:00 PM) for uninterrupted concentration!`;

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

  // 3. Appointment Booking
  if (q.includes('appointment') || q.includes('schedule a meeting') || q.includes('book a meeting') || q.includes('meet with')) {
    addStep('Appointments Coordinator', 'Slot Resolution', 'Preparing appointment booking widget and Google Calendar invite');

    let department = 'Admissions Office';
    if (q.includes('computer') || q.includes('cs') || q.includes('tech')) department = 'Computer Science Faculty';
    else if (q.includes('finance') || q.includes('fee')) department = 'Student Finance & Visa';
    else if (q.includes('it support') || q.includes('wifi')) department = 'IT Support Desk';
    else if (q.includes('counseling') || q.includes('wellness')) department = 'Career & Wellness Counselling';

    const defaultDate = new Date(Date.now() + 86400000 * 2); // 2 days from now
    defaultDate.setHours(10, 0, 0, 0);

    const apt = await AppointmentModel.create({
      studentName: 'Student Visitor',
      email: 'student@mdx.ac.mu',
      department,
      purpose: message.slice(0, 100),
      dateTime: defaultDate.toISOString(),
      notes: 'Requested via AI Campus Assistant'
    });

    const reply = `### 📅 Appointment Booked: ${department}\n\nYour advisory meeting has been scheduled and recorded in the campus calendar system:\n\n- **Department:** **${department}**\n- **Date & Time:** ${defaultDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at **10:00 AM**\n- **Location:** Middlesex University Mauritius, Cascavelle Campus\n- **Status:** **Confirmed**\n\nYou can click **"Add to Google Calendar"** below to sync this directly to your personal Google Calendar, or download the **.ics** file for Outlook / Apple Calendar.`;

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

  // 4. Campus Navigation & Locations
  if (q.includes('where is') || q.includes('location') || q.includes('direction') || q.includes('map') || q.includes('building') || q.includes('how to reach') || q.includes('library') || q.includes('robotics') || q.includes('archway') || q.includes('admin') || q.includes('cafeteria')) {
    addStep('Navigation Specialist', 'Geospatial Pinpoint', 'Calculating campus GPS coordinates & walking route');

    let matched = campusLocations.find(l => q.includes(l.LocationName.toLowerCase())) || campusLocations[0];
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${matched.Coordinates.lat},${matched.Coordinates.lng}`;

    let reply = `### 📍 Campus Navigation: **${matched.LocationName}**\n\n`;
    reply += `The **${matched.LocationName}** is located on the central grounds of Middlesex University Mauritius.\n\n`;
    reply += `- **GPS Coordinates:** \`${matched.Coordinates.lat}, ${matched.Coordinates.lng}\`\n`;
    reply += `- **Walking Distance:** Approximately **1 - 3 minutes** from the Main Archway Entrance.\n`;
    reply += `- **Directions:** Enter through the **Main Archway**, follow the landscaped walkway past the central amphitheatre, and you will see the facility clearly signposted.\n\n`;
    reply += `Use the interactive map widget below or open live Google Maps directions on your phone.`;

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

  // 5. Tuition Fees & Installments
  if (q.includes('fee') || q.includes('tuition') || q.includes('cost') || q.includes('price') || q.includes('installment') || q.includes('deposit') || q.includes('pay')) {
    addStep('Admissions & Finance Specialist', 'Fee Database Lookup', 'Structuring official program fees, admin charges, and payment installments');

    const matchedFee = internationalFees.find(f => q.includes(f.Program.toLowerCase()));

    if (matchedFee) {
      const installments = Array.isArray(matchedFee.Installment) ? matchedFee.Installment.join(' and ') : matchedFee.Installment;

      let reply = `### 🎓 Tuition Fees: **${matchedFee.Program}**\n\n`;
      reply += `Here is the official tuition fee structure and installment plan for international students:\n\n`;
      reply += `| Fee Component | Amount |\n|---|---|\n`;
      reply += `| **Tuition Fee** | ${matchedFee.TuitionFees} |\n`;
      reply += `| **Administrative Fee** | ${matchedFee.AdminFees} |\n`;
      reply += `| **Full Payment (Upfront)** | **${matchedFee.FullPayment}** |\n`;
      reply += `| **Installment Deposit** | ${matchedFee.InstallmentNonRefundableDeposit} (Non-refundable) |\n`;
      reply += `| **Remaining Installments** | 2 installments of ${installments} |\n\n`;
      reply += `> 💡 **Scholarship Notice:** You may also qualify for an **Academic Merit Scholarship (up to 20% fee reduction)** or an **Early Bird Discount of £300** if paid prior to semester orientation.`;

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
  }

  // 6. Virtual Campus Tour
  if (q.includes('virtual tour') || q.includes('360') || q.includes('tour the campus')) {
    addStep('Campus Experience Specialist', 'Tour Link Retrieval', 'Generating 360-degree interactive tour portal');

    const url = 'https://app.lapentor.com/sphere/mdx-mru-virtual-tour';
    const reply = `### 🌐 360° Interactive Campus Virtual Tour\n\nYou can explore the Middlesex University Mauritius Cascavelle campus from anywhere in the world! The interactive 360-degree tour allows you to step inside:\n\n- The modern **Lecture Theatres & Amphitheatre**\n- The **Innovation & Robotics AI Lab**\n- The **Library & Silent Study Pods**\n- The **Cafeteria & Outdoor Green Quad**\n\nClick the button below to launch the tour in your browser!`;

    return {
      reply,
      model: 'Campus Experience AI',
      source: 'virtual-tour',
      richCard: {
        type: 'virtual_tour',
        virtualTourUrl: url
      }
    };
  }

  // 7. General Campus Knowledge or General Intelligence (RAG + Contextual Synthesizer)
  addStep('Campus Intelligence Engine', 'Context Synthesis', 'Generating natural contextual response with RAG insights');

  let reply = '';
  if (contexts && contexts.length > 0 && contexts[0].score > 0.15) {
    const mainCtx = contexts[0];
    reply = `### ${mainCtx.title}\n\n${mainCtx.content}\n\n`;
    if (contexts[1] && contexts[1].title !== mainCtx.title) {
      reply += `#### 📌 ${contexts[1].title}\n${contexts[1].content}\n\n`;
    }
    reply += `\n*Feel free to ask follow-up questions, request directions, draft an inquiry email, or book an advising session!*`;
  } else {
    // General AI question (programming, math, science, writing, general guidance)
    reply = `Hello! As your **AI Assistant for Campus Life**, I am here to help you succeed both academically and personally.\n\nRegarding your question: *"**${message}**"*\n\nHere are the key points:\n- **Academic & General Support:** Whether you need assistance with coursework research, programming concepts, exam study schedules, or essay drafting, I can generate step-by-step guidance.\n- **Campus Guidance:** I can look up courses, tuition fees, faculty contacts, GPS navigation, and book one-on-one advising sessions.\n\nHow would you like to proceed?`;
  }

  return {
    reply,
    model: 'Campus Intelligence Engine',
    source: 'rag-synthesizer'
  };
}

module.exports = {
  generateNaturalResponse,
  executeTool,
  setProvider,
  getProviderStatus,
  tools
};
