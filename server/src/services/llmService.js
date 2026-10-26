const { OpenAI } = require('openai');

let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

let activeProvider = process.env.DEFAULT_LLM_PROVIDER || 'hybrid'; // 'openai' | 'ollama' | 'hybrid'
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

function setProvider(provider) {
  if (['openai', 'ollama', 'hybrid'].includes(provider)) {
    activeProvider = provider;
  }
}

function getProviderStatus() {
  return {
    activeProvider,
    openaiAvailable: !!process.env.OPENAI_API_KEY,
    ollamaHost: OLLAMA_HOST,
    ollamaModel: OLLAMA_MODEL
  };
}

// Generate grounded response from prompt & contexts
async function generateResponse({ systemPrompt, userPrompt, contexts = [], provider = activeProvider }) {
  // 1. Try OpenAI if selected or in hybrid mode with API key
  if ((provider === 'openai' || (provider === 'hybrid' && process.env.OPENAI_API_KEY)) && openaiClient) {
    try {
      const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      });
      return {
        reply: completion.choices[0]?.message?.content?.trim() || 'No response generated.',
        model: completion.model || 'OpenAI GPT-3.5',
        source: 'openai'
      };
    } catch (err) {
      console.warn(`[LLM Service] OpenAI API error: ${err.message}. Falling back.`);
    }
  }

  // 2. Try Ollama (LLaMA2) if selected or fallback
  if (provider === 'ollama' || provider === 'hybrid') {
    try {
      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          reply: data.response.trim(),
          model: `Ollama (${OLLAMA_MODEL})`,
          source: 'ollama'
        };
      }
    } catch (err) {
      // Ollama not reachable, fall through to RAG synthesizer
    }
  }

  // 3. Grounded Campus Context Synthesizer (Zero-Failure Engine)
  const synthesis = synthesizeGroundedResponse(userPrompt, contexts);
  return {
    reply: synthesis,
    model: 'Campus RAG Synthesizer (Context Grounded)',
    source: 'rag-engine'
  };
}

function synthesizeGroundedResponse(userPrompt, contexts) {
  if (!contexts || contexts.length === 0) {
    return "I am here to assist with Middlesex University Mauritius. You can ask about our undergraduate and postgraduate degree programs, tuition fees and installment schedules, campus buildings and navigation, or book an appointment with our admissions advisory!";
  }

  const primaryContext = contexts[0];
  const secondaryContext = contexts[1];

  let response = `${primaryContext.content}`;

  if (secondaryContext && secondaryContext.category !== primaryContext.category) {
    response += `\n\n📌 Related Information (${secondaryContext.title}):\n${secondaryContext.content}`;
  }

  return response;
}

module.exports = {
  generateResponse,
  setProvider,
  getProviderStatus
};
