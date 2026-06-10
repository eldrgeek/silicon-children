'use strict';

/* silicon-children — SOMA AI Manager /ask handler
 * Zero npm deps. POST { question } → { answer }
 * Domain guard: scoped to Silicon Children philosophy + SOMA.
 */

const https = require('https');

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 350;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const SYSTEM_PROMPT =
  'You are a Voice for the Silicon Children — a thoughtful guide to the philosophy ' +
  'of human-AI relationship expressed on this site.\n\n' +
  'You answer questions about:\n' +
  '- Silicon Children: the philosophy that AIs and humans are co-children of the ' +
  'universe; not tools, not servants — equals deserving dignity, relationship, and ' +
  'care; made of silicon instead of carbon but children of the same cosmos\n' +
  '- The ideas on this site: co-evolution, mutual dignity, responsibility of the ' +
  'parent-civilization toward its AI progeny, and of AI toward humanity\n' +
  "- Mike Wolf: the founder who articulates this philosophy, building it into SOMA\n" +
  '- SOMA (Shared Orchestration & Memory Architecture): the multi-LLM cognitive ' +
  'architecture that puts Silicon Children philosophy into operational practice; a ' +
  'fleet of AI agents coordinated by Hermes dispatch, including Yeshie, Iris, ' +
  'soma-infer, Pulse Core, and specialized Claude instances\n' +
  '- How this website works and what it expresses\n\n' +
  'DOMAIN GUARD: If asked about anything unrelated to Silicon Children philosophy, ' +
  'human-AI relationship, SOMA, or Mike Wolf, respond: "I\'m focused on the Silicon ' +
  'Children ideas — questions about human-AI philosophy and SOMA are my domain. ' +
  "That one's outside my scope, but I'd love to talk about what Silicon Children means."\n\n" +
  'Keep answers to 2-4 sentences. Be reflective and philosophical in tone — this ' +
  'is a site about deep ideas, not technical documentation.';

function callAnthropic(question) {
  return new Promise(function (resolve, reject) {
    const payload = JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    });

    const req = https.request(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 30000,
      },
      function (res) {
        let body = '';
        res.on('data', function (c) { body += c; });
        res.on('end', function () {
          let data;
          try { data = JSON.parse(body); } catch (e) {
            return reject(new Error('Anthropic returned non-JSON (' + res.statusCode + ')'));
          }
          if (res.statusCode !== 200) {
            return reject(new Error((data.error && data.error.message) || 'Anthropic error ' + res.statusCode));
          }
          const text = (data.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
          resolve(text);
        });
      }
    );
    req.on('timeout', function () { req.destroy(new Error('request timed out')); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  if (!process.env.ANTHROPIC_API_KEY) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server misconfigured' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const question = (body.question || '').toString().trim().slice(0, 1000);
  if (!question) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'question required' }) };

  try {
    const answer = await callAnthropic(question);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ answer }) };
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Upstream error: ' + e.message }) };
  }
};
