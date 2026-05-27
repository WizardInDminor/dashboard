import axios from "axios";

export const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Streaming helper. Axios buffers responses in the browser, so streamed
// endpoints (AI briefing/chat) go through fetch's ReadableStream here —
// kept in lib/api.ts so all backend calls still share one baseURL.
export async function streamRequest(
  path: string,
  {
    method = "GET",
    body,
    onChunk,
    signal,
  }: {
    method?: string;
    body?: unknown;
    onChunk: (text: string) => void;
    signal?: AbortSignal;
  }
): Promise<void> {
  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export default api;
