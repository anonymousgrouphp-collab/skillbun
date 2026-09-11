import { getTokenRouterModel } from './env.js';

export const TOKENROUTER_CHAT_URL = 'https://api.tokenrouter.com/v1/chat/completions';

export async function fetchTokenRouterCompletion(apiKey, messages, { json = false, timeoutMs = 30000 } = {}, fetcher = fetch) {
  if (!apiKey) return '';
  const response = await fetcher(TOKENROUTER_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: getTokenRouterModel(), messages, max_tokens: 4096,
      // GLM-5.3 rejects disabling thinking. Do not reuse other providers' reasoning flags.
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`TokenRouter HTTP ${response.status}`);
  const data = await response.json();
  const choice = data?.choices?.[0];
  if (choice?.finish_reason && choice.finish_reason !== 'stop') return '';
  const text = choice?.message?.content;
  return typeof text === 'string' ? text.trim() : '';
}
