import https from "https";

// Raycast's bundled fetch (undici) keeps HTTP/2 sessions open and tears them
// down from an idle timer, throwing an uncatchable "socket idle timeout" that
// kills the command. Node's https module speaks HTTP/1.1 and, with keepAlive
// off, leaves no idle connection behind.
const agent = new https.Agent({ keepAlive: false });

const REQUEST_TIMEOUT_MS = 30_000;

export interface HttpRequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export interface HttpResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get: (name: string) => string | null };
  text: () => Promise<string>;
}

const abortError = (): Error => {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
};

export const httpRequest = (
  url: string,
  { method, headers, body, signal }: HttpRequestOptions,
): Promise<HttpResponse> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const req = https.request(
      url,
      {
        method,
        agent,
        headers: body
          ? { ...headers, "Content-Length": Buffer.byteLength(body) }
          : headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("error", reject);
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            ok: status >= 200 && status < 300,
            status,
            statusText: res.statusMessage ?? "",
            headers: {
              get: (name) => {
                const value = res.headers[name.toLowerCase()];
                return Array.isArray(value)
                  ? value.join(", ")
                  : (value ?? null);
              },
            },
            text: async () => text,
          });
        });
      },
    );

    const onAbort = () => req.destroy(abortError());
    signal?.addEventListener("abort", onAbort, { once: true });
    req.setTimeout(REQUEST_TIMEOUT_MS, () =>
      req.destroy(new Error("Request timed out")),
    );
    req.on("close", () => signal?.removeEventListener("abort", onAbort));
    req.on("error", reject);
    req.end(body);
  });
