import assert from "node:assert/strict";
import test from "node:test";
import { getClientIp, hashIp } from "./visitors.js";

test("uses Vercel's trusted visitor address before forwarding fallbacks", () => {
  const ip = getClientIp({
    headers: {
      "x-vercel-forwarded-for": "2001:db8::1",
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    },
  });
  assert.equal(ip, "2001:db8::1");
});

test("normalizes common IPv4 proxy representations", () => {
  assert.equal(
    getClientIp({ headers: { "x-real-ip": "::ffff:203.0.113.8" } }),
    "203.0.113.8",
  );
  assert.equal(
    getClientIp({ headers: { "x-real-ip": "[2001:DB8::2]:443" } }),
    "2001:db8::2",
  );
});

test("IP hashes are stable but cannot reveal the raw address", () => {
  const first = hashIp("203.0.113.8", "a-long-random-secret");
  const repeat = hashIp("203.0.113.8", "a-long-random-secret");
  const other = hashIp("203.0.113.9", "a-long-random-secret");

  assert.equal(first, repeat);
  assert.notEqual(first, other);
  assert.equal(first.length, 64);
  assert.ok(!first.includes("203.0.113.8"));
});
