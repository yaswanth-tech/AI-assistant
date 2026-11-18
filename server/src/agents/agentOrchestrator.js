const { generateNaturalResponse } = require('../services/llmService');

async function runAgentPipeline({
  query,
  conversationHistory = [],
  provider = 'hybrid',
  apiKey = null,
  attachment = null,
  onAgentStep = null
}) {
  return await generateNaturalResponse({
    message: query,
    conversationHistory,
    provider,
    apiKey,
    attachment,
    onStep: onAgentStep
  });
}

module.exports = {
  runAgentPipeline
};
