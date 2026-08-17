import { createHmac } from "node:crypto";

const VISITOR_SET_KEY = "portfolio:visitors:v1";
const BOT_USER_AGENT = /bot|crawler|spider|crawling|headless|preview|facebookexternalhit|slurp|bingpreview|whatsapp|telegram/i;

function firstHeaderValue(value) {
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value.split(",")[0].trim() : "";
}

export function getClientIp(req) {
  const headers = req.headers || {};
  const raw =
    firstHeaderValue(headers["x-vercel-forwarded-for"]) ||
    firstHeaderValue(headers["cf-connecting-ip"]) ||
    firstHeaderValue(headers["x-real-ip"]) ||
    firstHeaderValue(headers["x-forwarded-for"]) ||
    req.socket?.remoteAddress ||
    "";

  // Keep a stable representation for common proxy formats. Vercel supplies the
  // same canonical address on repeat visits, including IPv6 addresses.
  return raw
    .trim()
    .replace(/^\[([^\]]+)\](?::\d+)?$/, "$1")
    .replace(/^::ffff:/i, "")
    .replace(/%[a-z0-9_.-]+$/i, "")
    .toLowerCase();
}

export function hashIp(ip, salt) {
  return createHmac("sha256", salt).update(ip).digest("hex");
}

function redisConfig() {
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    salt: process.env.VISITOR_HASH_SALT,
  };
}

async function runRedisPipeline(commands, config) {
  const response = await fetch(`${config.url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Visitor store returned HTTP ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.some((item) => item?.error)) {
    throw new Error("Visitor store returned an invalid response");
  }
  return results.map((item) => item.result);
}

function sendJson(res, status, body) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const config = redisConfig();
  if (!config.url || !config.token || !config.salt) {
    console.error("Visitor counter is missing Redis or VISITOR_HASH_SALT configuration");
    return sendJson(res, 503, { error: "Visitor counter is not configured" });
  }

  try {
    // GET only reads the public total. POST records this request when it is a
    // human-looking visit with an IP address.
    if (req.method === "GET") {
      const [count] = await runRedisPipeline([["SCARD", VISITOR_SET_KEY]], config);
      return sendJson(res, 200, { count: Number(count) || 0, counted: false });
    }

    const ip = getClientIp(req);
    const userAgent = firstHeaderValue(req.headers?.["user-agent"]);
    const isBot = !userAgent || BOT_USER_AGENT.test(userAgent);

    if (!ip || isBot) {
      const [count] = await runRedisPipeline([["SCARD", VISITOR_SET_KEY]], config);
      return sendJson(res, 200, { count: Number(count) || 0, counted: false });
    }

    const visitorHash = hashIp(ip, config.salt);
    // Redis SADD is atomic: it returns 1 only for a new hash and 0 when this IP
    // has visited before. SCARD returns the persistent unique total.
    const [added, count] = await runRedisPipeline(
      [["SADD", VISITOR_SET_KEY, visitorHash], ["SCARD", VISITOR_SET_KEY]],
      config,
    );

    return sendJson(res, 200, {
      count: Number(count) || 0,
      counted: Number(added) === 1,
    });
  } catch (error) {
    console.error("Visitor counter failed", error);
    return sendJson(res, 500, { error: "Unable to load visitor count" });
  }
}
