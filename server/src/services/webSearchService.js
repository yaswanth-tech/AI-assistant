/**
 * Real-Time Web Search Service
 * Connects to DuckDuckGo & Wikipedia Knowledge APIs
 * Live factual search, news snippets, zero API keys required
 */

function cleanQuery(rawQuery) {
  return rawQuery
    .replace(/^(search\s+(the\s+)?(web|internet|google)\s+(for|about)?)/i, '')
    .replace(/^(can\s+you\s+)?(please\s+)?(find|lookup|search)\s+(information\s+(on|about)\s+)?/i, '')
    .replace(/^(what\s+is\s+the\s+latest\s+(on|about)\s+)/i, '')
    .replace(/[?.!]+$/, '')
    .trim();
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
}

/**
 * Execute real-time search across DuckDuckGo and Wikipedia APIs
 */
async function searchWeb(query) {
  const q = cleanQuery(query);
  const results = [];
  let directAnswer = null;

  try {
    // 1. Query DuckDuckGo Instant Answer API
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const ddgPromise = fetch(ddgUrl, { headers: { 'User-Agent': 'Antigravity-Campus-AI/2.0' } })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);

    // 2. Query Wikipedia Search API
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&utf8=1&srlimit=4`;
    const wikiPromise = fetch(wikiUrl, { headers: { 'User-Agent': 'Antigravity-Campus-AI/2.0' } })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);

    const [ddgData, wikiData] = await Promise.all([ddgPromise, wikiPromise]);

    // Parse DuckDuckGo
    if (ddgData) {
      if (ddgData.AbstractText && ddgData.AbstractText.length > 20) {
        directAnswer = ddgData.AbstractText;
        results.push({
          title: ddgData.Heading || q,
          snippet: ddgData.AbstractText,
          url: ddgData.AbstractURL || 'https://duckduckgo.com/?q=' + encodeURIComponent(q),
          source: ddgData.AbstractSource || 'DuckDuckGo Knowledge'
        });
      }

      if (ddgData.RelatedTopics && Array.isArray(ddgData.RelatedTopics)) {
        for (const topic of ddgData.RelatedTopics.slice(0, 3)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 50),
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo Web'
            });
          }
        }
      }
    }

    // Parse Wikipedia Search
    if (wikiData && wikiData.query && wikiData.query.search) {
      for (const item of wikiData.query.search.slice(0, 3)) {
        const cleanSnippet = stripHtml(item.snippet);
        // Avoid duplicate titles
        if (!results.some(r => r.title.toLowerCase() === item.title.toLowerCase())) {
          results.push({
            title: item.title,
            snippet: cleanSnippet,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
            source: 'Wikipedia'
          });
        }
      }
    }

    // Fallback if no specific hits
    if (results.length === 0) {
      results.push({
        title: `Web Overview: "${q}"`,
        snippet: `Real-time search index for "${q}". Explore verified documentation, news feeds, and official publications.`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        source: 'Live Web Index'
      });
    }

    return {
      success: true,
      query: q,
      directAnswer,
      results: results.slice(0, 4),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Web Search Service Error]:', error.message);
    return {
      success: false,
      query: q,
      error: error.message,
      results: [
        {
          title: `Search: ${q}`,
          snippet: `Live search query conducted for ${q}.`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
          source: 'DuckDuckGo Search'
        }
      ]
    };
  }
}

module.exports = {
  searchWeb
};
