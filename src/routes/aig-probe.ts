import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { resolveSecret } from '../secrets';

/**
 * Debug-only OpenAI probe.
 * Runs entirely in the Worker (not inside the container) so it can use
 * Secrets Store bindings safely.
 *
 * Protected by Cloudflare Access because this route should only be mounted
 * under /debug and DEBUG_ROUTES=true.
 */
export const aigProbe = new Hono<AppEnv>();

// Keep the existing path for compatibility, but it now probes direct OpenAI.
aigProbe.get('/aig-probe', async (c) => {
  const openaiToken = await resolveSecret(c.env.OPENAI_API_KEY);
  if (!openaiToken) return c.json({ ok: false, error: 'OPENAI_API_KEY not set/resolvable' }, 500);

  const model = c.req.query('model') || 'openai/gpt-5';
  const prompt = c.req.query('prompt') || 'ping';

  const url = 'https://api.openai.com/v1/responses';
  const reqBody = {
    model,
    input: prompt,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${openaiToken}`,
    },
    body: JSON.stringify(reqBody),
  });

  const text = await resp.text();
  return c.json({
    ok: resp.ok,
    status: resp.status,
    url,
    request: reqBody,
    responseHeaders: Object.fromEntries(resp.headers.entries()),
    responseText: text,
  });
});
