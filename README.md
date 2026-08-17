# Graphic Miles — Portfolio

Personal portfolio website built as a single-page Vite site and deployed on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Build, preview, and test:

```bash
npm run build
npm test
npm run preview
```

The visual site is self-contained in `index.html` (inline CSS and JavaScript).

## Persistent unique visitor counter

The hero ticker displays a live total from `POST /api/visitors`. The Vercel serverless function stores a keyed hash of each visitor IP in a persistent Redis set:

- Redis `SADD` atomically adds a visitor only when that IP hash is new.
- Redis `SCARD` returns the unique total.
- Repeat visits from the same IP do not increase the count, even in another browser or after local storage/cookies are cleared.
- Raw IP addresses are never stored. They are HMAC-SHA-256 hashed with a private server-side salt.
- Common bots and link-preview crawlers are read-only and do not increase the count.
- No database credentials or salt are exposed to browser code.

Because identity is intentionally based on IP, multiple people sharing one public IP (for example, one office or mobile carrier gateway) count as one visitor. Existing historical visitors cannot be reconstructed; counting starts when the Redis database is connected.

### Vercel setup

1. Open the portfolio project in Vercel.
2. Go to **Storage** (or **Marketplace**) and add an **Upstash Redis** database to the project.
3. Ensure the integration exposes `KV_REST_API_URL` and `KV_REST_API_TOKEN`. The API also accepts Upstash's standard `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` names.
4. Add a server-only environment variable named `VISITOR_HASH_SALT`. Generate a strong value locally:

   ```bash
   openssl rand -hex 32
   ```

5. Apply the variables to Production, Preview, and Development as needed, then redeploy.

See `.env.example` for local variable names. Do not commit real credentials. Vite alone serves only the static frontend during local development; use `vercel dev` when testing the serverless API locally.
