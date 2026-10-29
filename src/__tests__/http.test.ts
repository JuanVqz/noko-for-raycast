import { EventEmitter } from "events";
import https from "https";
import { httpRequest } from "../lib/http";

jest.mock("https", () => {
  const actual = jest.requireActual("https");
  return {
    __esModule: true,
    default: { ...actual, request: jest.fn(), Agent: actual.Agent },
  };
});

type FakeRequest = EventEmitter & {
  end: jest.Mock;
  destroy: jest.Mock;
};

const mockRequest = https.request as unknown as jest.Mock;

const fakeRequest = (status: number, body: string): FakeRequest => {
  const req: FakeRequest = Object.assign(new EventEmitter(), {
    end: jest.fn(),
    destroy: jest.fn((error: Error) => req.emit("error", error)),
  });
  mockRequest.mockImplementation((_url, _opts, callback) => {
    const res = Object.assign(new EventEmitter(), {
      statusCode: status,
      statusMessage: "OK",
      headers: { "content-type": "application/json" },
    });
    req.end.mockImplementation(() => {
      callback(res);
      res.emit("data", Buffer.from(body));
      res.emit("end");
    });
    return req;
  });
  return req;
};

describe("httpRequest", () => {
  it("resolves a Response-like object without keep-alive", async () => {
    const req = fakeRequest(200, '{"a":1}');

    const response = await httpRequest("https://example.com/x", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: '{"b":2}',
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(await response.text()).toBe('{"a":1}');
    expect(req.end).toHaveBeenCalledWith('{"b":2}');
    const options = mockRequest.mock.calls[0][1];
    expect(options.agent.options.keepAlive).toBe(false);
    expect(options.headers["Content-Length"]).toBe(7);
  });

  it("marks non-2xx responses as not ok", async () => {
    fakeRequest(404, "");
    const response = await httpRequest("https://example.com/x", {
      method: "GET",
      headers: {},
    });
    expect(response.ok).toBe(false);
  });

  it("rejects with AbortError when the signal aborts", async () => {
    const req: FakeRequest = Object.assign(new EventEmitter(), {
      end: jest.fn(),
      destroy: jest.fn((error: Error) => req.emit("error", error)),
    });
    mockRequest.mockReturnValue(req);
    const controller = new AbortController();

    const pending = httpRequest("https://example.com/x", {
      method: "GET",
      headers: {},
      signal: controller.signal,
    });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
