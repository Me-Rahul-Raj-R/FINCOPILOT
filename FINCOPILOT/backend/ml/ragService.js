const { TfIdfIndex } = require("./tfidfIndex");
const { KNOWLEDGE_BASE } = require("../data/knowledgeBase");
const { answer: keywordAnswer } = require("./chatAssistantService");

const RELEVANCE_THRESHOLD = 0.06;
let index = null;

function getIndex() {
  if (!index) {
    index = new TfIdfIndex(KNOWLEDGE_BASE);
  }
  return index;
}

/**
 * Retrieval-augmented answer: retrieve the most relevant knowledge-base
 * chunks for the query, then compose an answer that's grounded in (and
 * cites) those chunks. Falls back to the keyword-intent assistant for
 * conversational queries (greetings, navigation) that don't match any
 * knowledge chunk well, and to a generic message if neither matches.
 *
 * This is the actual retrieval architecture a hosted-LLM "generation"
 * step could be dropped into later - swap composeAnswer() for an API
 * call that's given the same retrieved chunks as context.
 */
function answer(query) {
  if (!query || !query.trim()) {
    return { reply: keywordAnswer(query), sources: [] };
  }

  const hits = getIndex().retrieve(query, 3).filter((h) => h.score >= RELEVANCE_THRESHOLD);

  if (hits.length === 0) {
    return { reply: keywordAnswer(query), sources: [] };
  }

  const reply = composeAnswer(hits);
  const sources = hits.map((h) => ({ title: h.title, tag: h.tag, score: Math.round(h.score * 100) / 100 }));
  return { reply, sources };
}

function composeAnswer(hits) {
  const primary = hits[0];
  let reply = primary.text;

  const secondary = hits.slice(1).filter((h) => h.score >= RELEVANCE_THRESHOLD * 1.4);
  if (secondary.length) {
    reply += `\n\nRelated: ${secondary.map((h) => h.title).join("; ")}.`;
  }
  return reply;
}

module.exports = { answer, getIndex };
