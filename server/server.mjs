import http from "node:http";
import { scoreBooking, recommendCreditAction } from "./riskEngine.mjs";
import { recordOverride, listOverrides } from "./reviewStore.mjs";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5179;

function send(res, status, body) {
  const json = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": body === undefined ? "text/plain" : "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(json);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);

  try {
    if (req.url === "/api/health" && req.method === "GET") {
      return send(res, 200, { ok: true });
    }

    if (req.url === "/api/risk/score" && req.method === "POST") {
      const input = await readJson(req);
      return send(res, 200, scoreBooking(input));
    }

    if (req.url === "/api/credit/recommend" && req.method === "POST") {
      const input = await readJson(req);
      return send(res, 200, recommendCreditAction(input));
    }

    if (req.url === "/api/review/override" && req.method === "POST") {
      const input = await readJson(req);
      const saved = recordOverride({
        caseId: input?.caseId ?? null,
        bookingId: input?.bookingId ?? null,
        label: input?.label ?? null,
        rationale: input?.rationale ?? "",
        meta: input?.meta ?? {},
      });
      return send(res, 200, { ok: true, override: saved });
    }

    if (req.url?.startsWith("/api/review/overrides") && req.method === "GET") {
      return send(res, 200, { ok: true, overrides: listOverrides({ limit: 50 }) });
    }

    return send(res, 404, { error: "Not Found" });
  } catch (e) {
    return send(res, 400, { error: "Bad Request", message: String(e?.message ?? e) });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Risk API listening on http://localhost:${PORT}`);
});
