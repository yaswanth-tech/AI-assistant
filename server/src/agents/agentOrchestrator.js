const { retrieveRelevantContexts, formatRAGPrompt, internationalFees, campusLocations } = require('../rag/knowledgeBase');
const { generateResponse } = require('../services/llmService');
const AppointmentModel = require('../models/Appointment');
const NotificationModel = require('../models/Notification');

// Intent Classifier
function classifyIntent(query) {
  const q = query.toLowerCase();

  if (q.includes('fee') || q.includes('tuition') || q.includes('cost') || q.includes('price') || q.includes('installment') || q.includes('deposit') || q.includes('pay')) {
    return 'FEES_INQUIRY';
  }
  if (q.includes('course') || q.includes('program') || q.includes('degree') || q.includes('major') || q.includes('undergraduate') || q.includes('postgraduate') || q.includes('bachelor') || q.includes('master')) {
    return 'COURSES_INQUIRY';
  }
  if (q.includes('where is') || q.includes('location') || q.includes('direction') || q.includes('map') || q.includes('building') || q.includes('archway') || q.includes('library') || q.includes('lab') || q.includes('entrance') || q.includes('it support') || q.includes('admin')) {
    return 'CAMPUS_NAVIGATION';
  }
  if (q.includes('appointment') || q.includes('book') || q.includes('schedule') || q.includes('meeting') || q.includes('meet with')) {
    return 'APPOINTMENT_BOOKING';
  }
  if (q.includes('virtual tour') || q.includes('tour') || q.includes('explore campus') || q.includes('360')) {
    return 'VIRTUAL_TOUR';
  }
  return 'GENERAL_KNOWLEDGE';
}

// Multi-Agent Execution Pipeline
async function runAgentPipeline({ query, conversationHistory = [], onAgentStep = null, provider = 'hybrid' }) {
  const steps = [];

  function recordStep(agentName, action, details) {
    const step = { agent: agentName, action, details, timestamp: new Date().toISOString() };
    steps.push(step);
    if (onAgentStep) onAgentStep(step);
  }

  // 1. Supervisor / Router Agent
  recordStep('Supervisor Agent', 'Intent Classification', `Analyzing user input: "${query}"`);
  const intent = classifyIntent(query);
  recordStep('Supervisor Agent', 'Handoff', `Classified intent as [${intent}]. Delegating to specialized sub-agent.`);

  // 2. Specialized Agent Execution
  switch (intent) {
    case 'VIRTUAL_TOUR': {
      recordStep('Campus Experience Agent', 'Tour Link Generation', 'Generating 360° interactive virtual tour payload.');
      return {
        reply: "You can take an immersive 360° virtual tour of the Middlesex University Mauritius Campus right here! Explore our amphitheatre, modern labs, cafeteria, and library.",
        action: 'OPEN_VIRTUAL_TOUR',
        virtualTourUrl: 'https://app.lapentor.com/sphere/mdx-mru-virtual-tour',
        agent: 'Campus Experience Agent',
        steps
      };
    }

    case 'CAMPUS_NAVIGATION': {
      recordStep('Navigation Agent', 'Geospatial Lookup', 'Querying campus coordinates index for landmarks.');
      const matchingLocation = campusLocations.find(l => query.toLowerCase().includes(l.LocationName.toLowerCase())) || campusLocations[0];

      recordStep('Navigation Agent', 'Route Calculation', `Found location: ${matchingLocation.LocationName} [${matchingLocation.Coordinates.lat}, ${matchingLocation.Coordinates.lng}]`);
      return {
        reply: `The ${matchingLocation.LocationName} is located at coordinates Latitude ${matchingLocation.Coordinates.lat}, Longitude ${matchingLocation.Coordinates.lng}. You can view the interactive campus map below.`,
        action: 'SHOW_CAMPUS_MAP',
        location: matchingLocation,
        allLocations: campusLocations,
        agent: 'Campus Navigation Agent',
        steps
      };
    }

    case 'FEES_INQUIRY': {
      recordStep('Admissions & Finance Agent', 'Fee Database Query', 'Retrieving official tuition fee structures and installment options.');
      const matchingFee = internationalFees.find(f => query.toLowerCase().includes(f.Program.toLowerCase()));

      if (matchingFee) {
        const installments = Array.isArray(matchingFee.Installment) ? matchingFee.Installment.join(' and ') : matchingFee.Installment;
        const feeSummary = `For ${matchingFee.Program}: The tuition fee is ${matchingFee.TuitionFees} plus ${matchingFee.AdminFees} admin fees (Total: ${matchingFee.FullPayment}). An installment option is available with a deposit of ${matchingFee.InstallmentNonRefundableDeposit} followed by installments of ${installments}.`;
        recordStep('Admissions & Finance Agent', 'Synthesis', 'Structured fee breakdown generated.');
        return {
          reply: feeSummary,
          feeData: matchingFee,
          agent: 'Admissions & Finance Agent',
          steps
        };
      }

      // If program not specified, retrieve via RAG
      const contexts = retrieveRelevantContexts(query, 3);
      recordStep('Admissions & Finance Agent', 'RAG Retrieval', `Retrieved ${contexts.length} fee-related contexts.`);
      const prompt = formatRAGPrompt(query, contexts, conversationHistory, 'Admissions and Finance Specialist');
      const response = await generateResponse({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
        contexts,
        provider
      });

      return {
        reply: response.reply,
        model: response.model,
        contexts,
        agent: 'Admissions & Finance Agent',
        steps
      };
    }

    case 'APPOINTMENT_BOOKING': {
      recordStep('Academic Appointments Agent', 'Schedule Request Detection', 'Triggering interactive appointment scheduler.');
      return {
        reply: "I can help you schedule an appointment with university admissions or academic advisors. Please select your preferred date, time, and department.",
        action: 'PROMPT_APPOINTMENT_FORM',
        agent: 'Academic Appointments Agent',
        steps
      };
    }

    case 'COURSES_INQUIRY':
    case 'GENERAL_KNOWLEDGE':
    default: {
      recordStep('RAG Knowledge Agent', 'Context Retrieval', 'Searching campus vector knowledge base for relevant chunks.');
      const contexts = retrieveRelevantContexts(query, 3);
      recordStep('RAG Knowledge Agent', 'Prompt Engineering', `Injected ${contexts.length} context documents into system prompt.`);

      const prompt = formatRAGPrompt(query, contexts, conversationHistory, 'Campus Knowledge Specialist');
      recordStep('LLM Synthesizer', 'Generation', `Dispatching prompt to active LLM engine [${provider}].`);

      const response = await generateResponse({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
        contexts,
        provider
      });

      recordStep('LLM Synthesizer', 'Response Completed', `Generated response via ${response.model}.`);
      return {
        reply: response.reply,
        model: response.model,
        contexts,
        agent: 'RAG Knowledge Agent',
        steps
      };
    }
  }
}

module.exports = {
  classifyIntent,
  runAgentPipeline
};
