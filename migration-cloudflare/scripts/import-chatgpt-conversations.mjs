import fs from 'node:fs';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const getArg = (name, fallback = undefined) => {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  return args[idx + 1] ?? fallback;
};

const filePath = getArg('--file');
const apiBase = getArg('--api', process.env.MEMORY_API_URL || 'https://bb-worker-dev.chaas.workers.dev/memory');
const secret = getArg('--secret', process.env.MEMORY_API_SECRET || '');
const chunkSize = Number.parseInt(getArg('--chunk', '2000'), 10);
const concurrency = Number.parseInt(getArg('--concurrency', '2'), 10);
const delayMs = Number.parseInt(getArg('--delay', '200'), 10);
const skipCount = Number.parseInt(getArg('--skip', '0'), 10);
const limitCount = Number.parseInt(getArg('--limit', '0'), 10);

if (!filePath) {
  console.error('Missing --file');
  process.exit(1);
}
if (!secret) {
  console.error('Missing MEMORY_API_SECRET (use --secret or env)');
  process.exit(1);
}

const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);
const conversations = Array.isArray(data) ? data : (data.conversations || data.items || data.data || []);

const baseUrl = new URL(apiBase);
const basePath = baseUrl.pathname.replace(/\/$/, '');
const storePath = `${basePath}/store`;
const storeUrl = new URL(storePath, baseUrl.origin);

const logDir = new URL('.', import.meta.url);
const logPath = new URL('../artifacts/import-log.jsonl', logDir).pathname;
fs.mkdirSync(new URL('../artifacts', logDir).pathname, { recursive: true });
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

const toIso = (t) => {
  if (!t) return '';
  const ms = t > 1e12 ? t : t * 1000;
  try {
    return new Date(ms).toISOString();
  } catch {
    return '';
  }
};

function contentToText(content) {
  if (!content || typeof content !== 'object') return '';
  const type = content.content_type || 'unknown';
  if (type === 'text' && Array.isArray(content.parts)) {
    return content.parts.filter(Boolean).join('\n').trim();
  }
  if (type === 'multimodal_text' && Array.isArray(content.parts)) {
    return content.parts.map((p) => {
      if (typeof p === 'string') return p;
      if (p && typeof p === 'object' && typeof p.text === 'string') return p.text;
      return JSON.stringify(p);
    }).join('\n').trim();
  }
  if ((type === 'code' || type === 'execution_output') && typeof content.text === 'string') {
    return content.text.trim();
  }
  if (type === 'user_editable_context') {
    const parts = [];
    if (content.user_profile) parts.push(String(content.user_profile));
    if (content.user_instructions) parts.push(String(content.user_instructions));
    return parts.join('\n').trim();
  }
  if (type === 'tether_quote') {
    const parts = [];
    if (content.title) parts.push(`title: ${content.title}`);
    if (content.url) parts.push(`url: ${content.url}`);
    if (content.text) parts.push(String(content.text));
    return parts.join('\n').trim();
  }
  if (typeof content.text === 'string') return content.text.trim();
  return JSON.stringify(content).trim();
}

function chunkText(text, size) {
  if (!text) return [];
  if (text.length <= size) return [text];
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

function buildPayload({ text, category, importance, source, tags }) {
  const payload = { text, category, importance, source, tags };
  return JSON.stringify(payload);
}

function signPayload(path, timestamp, body) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`POST\n${path}\n${timestamp}\n${body}`);
  return hmac.digest('hex');
}

async function callStore(payloadJson) {
  const timestamp = Date.now().toString();
  const signature = signPayload(storePath, timestamp, payloadJson);
  const res = await fetch(storeUrl.toString(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-memory-timestamp': timestamp,
      'x-memory-signature': signature,
    },
    body: payloadJson,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { error: text };
  }
  return { status: res.status, json };
}

const jobs = [];
let totalMessages = 0;
let totalChunks = 0;

for (const convo of conversations) {
  const title = convo.title || '';
  const convoId = convo.conversation_id || convo.id || '';
  const mapping = convo.mapping || {};
  for (const [nodeId, node] of Object.entries(mapping)) {
    const msg = node && node.message;
    if (!msg || !msg.content) continue;
    totalMessages += 1;
    const role = msg.author?.role || 'unknown';
    const contentType = msg.content?.content_type || 'unknown';
    const text = contentToText(msg.content);
    const iso = toIso(msg.create_time || msg.update_time || '');
    const header = [
      `conversation: ${title || convoId || 'untitled'}`,
      convoId ? `conversation_id: ${convoId}` : null,
      nodeId ? `node_id: ${nodeId}` : null,
      role ? `role: ${role}` : null,
      contentType ? `content_type: ${contentType}` : null,
      iso ? `time: ${iso}` : null,
      '',
    ].filter(Boolean).join('\n');
    const fullText = `${header}${text || ''}`.trim();
    const chunks = chunkText(fullText, chunkSize);
    for (let i = 0; i < chunks.length; i += 1) {
      totalChunks += 1;
      jobs.push({
        text: chunks[i],
        category: 'other',
        importance: 0.7,
        source: 'chatgpt_export',
        tags: [convoId, role, contentType, nodeId].filter(Boolean),
      });
    }
  }
}

console.log(`Conversations: ${conversations.length}`);
console.log(`Messages: ${totalMessages}`);
console.log(`Chunks: ${totalChunks}`);
console.log(`API: ${storeUrl.toString()}`);
console.log(`Concurrency: ${concurrency} | Delay: ${delayMs}ms | Chunk size: ${chunkSize}`);
if (skipCount > 0) console.log(`Skipping first ${skipCount} chunks`);
if (limitCount > 0) console.log(`Limiting to ${limitCount} chunks`);

if (skipCount > 0) jobs.splice(0, Math.min(skipCount, jobs.length));
if (limitCount > 0 && jobs.length > limitCount) jobs.splice(limitCount);

let success = 0;
let duplicates = 0;
let failures = 0;

async function worker(workerId) {
  for (;;) {
    const job = jobs.shift();
    if (!job) return;
    const body = buildPayload(job);
    try {
      const res = await callStore(body);
      if (res.status === 200 && res.json?.status === 'duplicate') {
        duplicates += 1;
      } else if (res.status === 200 && res.json?.status === 'stored') {
        success += 1;
      } else {
        failures += 1;
      }
      logStream.write(JSON.stringify({
        worker: workerId,
        status: res.status,
        response: res.json,
      }) + '\n');
    } catch (err) {
      failures += 1;
      logStream.write(JSON.stringify({
        worker: workerId,
        status: 'error',
        error: String(err),
      }) + '\n');
    }
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
await Promise.all(workers);

logStream.end();

console.log('Import finished');
console.log(`stored: ${success}`);
console.log(`duplicates: ${duplicates}`);
console.log(`failures: ${failures}`);
