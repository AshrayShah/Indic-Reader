// ============================================================================
// Indic Reader — Cloudflare Worker proxy for Google Cloud Vision OCR
// ============================================================================
//
// PURPOSE
// -------
// Google Cloud Vision does NOT support browser CORS. Direct browser→Google
// calls fail. This Worker fixes that by acting as a same-origin proxy:
//
//   Browser → your Worker (sends CORS headers) → Google Cloud Vision → back
//
// Your Google API key lives on Cloudflare as an encrypted secret. The browser
// never sees it.
//
// ----------------------------------------------------------------------------
// SETUP (one time, ~10 minutes)
// ----------------------------------------------------------------------------
//
// PART 1 — Get a Google Cloud Vision API key
//
// 1. Go to https://console.cloud.google.com/
// 2. Sign in with a Google account. If first time: accept terms.
// 3. Top bar: click the project picker → "NEW PROJECT" →
//    name it (e.g. "indic-reader") → CREATE
// 4. Make sure the new project is selected (top bar picker shows it)
// 5. ☰ menu → "APIs & Services" → "Library"
// 6. Search "Cloud Vision API" → click it → "ENABLE"
//    (If asked to enable billing first, see PART 1B below)
// 7. ☰ menu → "APIs & Services" → "Credentials"
// 8. "+ CREATE CREDENTIALS" (top) → "API key"
// 9. A popup shows your new API key. Click "Copy". Save it somewhere safe.
// 10. Click "EDIT API KEY" on that popup (or find the key in Credentials list)
// 11. Under "API restrictions": select "Restrict key" → check ONLY
//     "Cloud Vision API" in the dropdown
// 12. Under "Application restrictions": select "None" (Worker calls don't
//     come from a referrer/IP we control)
// 13. SAVE
//
// PART 1B — Enable billing (required even for free tier)
//
// 1. ☰ menu → "Billing"
// 2. "LINK A BILLING ACCOUNT" → add a credit/debit card
// 3. The free tier gives 1,000 Vision API calls/month at no cost
// 4. CRITICAL: Set a budget alert:
//    - ☰ → Billing → Budgets & alerts → "CREATE BUDGET"
//    - Name: "vision-alert", Amount: $1
//    - Threshold rules: alert at 50%, 90%, 100% (default)
//    - Save
//    This emails you BEFORE any charge happens if you exceed free tier.
//
// PART 2 — Deploy this Worker
//
// 1. Go to https://dash.cloudflare.com → Workers & Pages
// 2. If you already have an existing Worker (e.g. indic-ocr-proxy), use it.
//    Otherwise: Create → Hello World → name it (e.g. indic-ocr-proxy) → Deploy
// 3. Open the Worker → Edit code
// 4. Select all the existing code → delete → paste this entire file
// 5. Save and Deploy
// 6. Worker settings → "Variables and Secrets" → add two:
//    - GOOGLE_API_KEY = (paste your key from PART 1 step 9) → Encrypt
//    - ALLOWED_ORIGIN = your app URL, e.g. https://indic-reader.pages.dev
//      (use "*" only during testing)
// 7. Save → Worker auto-redeploys
//
// PART 3 — Configure the app
//
// 1. Open Indic Reader → ⚙ Cloud OCR
// 2. Provider: "Cloudflare Worker → Google Vision"
// 3. Paste your Worker URL (e.g. https://indic-ocr-proxy.YOUR.workers.dev)
// 4. 🔍 Test connection → should show "✓ Connection works"
// 5. Save credentials
// 6. Toggle ☁️ Cloud OCR ON
//
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);

    // --- Sandhi splitter proxy (GET /sandhi?word=...) ---
    // Proxies to the University of Hyderabad Heritage segmenter, which has no
    // CORS headers and so can't be called directly from a browser. This Worker
    // adds the CORS headers. No API key needed — it's a public academic service.
    if (url.pathname.endsWith('/sandhi')) {
      try {
        return await handleSandhi(request, env, url);
      } catch (e) {
        return jsonError(500, `Sandhi proxy error: ${e.message}`, env);
      }
    }

    // --- OCR proxy (POST /ocr) ---
    if (request.method !== 'POST') {
      return jsonError(405, 'Method not allowed. Use POST /ocr or GET /sandhi', env);
    }

    if (!env.GOOGLE_API_KEY) {
      return jsonError(500, 'Worker not configured: missing GOOGLE_API_KEY', env);
    }

    if (!url.pathname.endsWith('/ocr')) {
      return jsonError(404, 'Unknown path. Use POST /ocr or GET /sandhi', env);
    }

    try {
      return await handleOcr(request, env);
    } catch (e) {
      return jsonError(500, `Worker error: ${e.message}`, env);
    }
  }
};

// ----------------------------------------------------------------------------
// Sandhi splitter — proxy to UoH Heritage segmenter
// GET /sandhi?word=<devanagari>&mode=word|sent
// Returns: { kind:'sandhi', input, mode, raw, splits: [...] }
// ----------------------------------------------------------------------------
async function handleSandhi(request, env, url) {
  const word = url.searchParams.get('word');
  const mode = url.searchParams.get('mode') === 'sent' ? 'sent' : 'word';
  if (!word) {
    return jsonError(400, 'Missing ?word= parameter', env);
  }
  if (word.length > 200) {
    return jsonError(413, 'Word too long (>200 chars)', env);
  }

  // Build upstream URL. We send Unicode Devanagari (URL-encoded) and ask for
  // Devanagari JSON output.
  const upstream = 'https://sanskrit.uohyd.ac.in/cgi-bin/scl/MT/prog/sandhi_splitter/sandhi_splitter.cgi'
    + '?word=' + encodeURIComponent(word)
    + '&encoding=Unicode&outencoding=D&mode=' + mode + '&disp_mode=json';

  let resp;
  try {
    resp = await fetch(upstream, {
      method: 'GET',
      headers: { 'Accept': 'application/json, text/html' },
      // The academic server can be slow; Workers cap subrequests at ~30s.
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
  } catch (e) {
    return jsonError(502, `Cannot reach segmenter: ${e.message}`, env);
  }

  if (!resp.ok) {
    return jsonError(resp.status, `Segmenter returned HTTP ${resp.status}`, env);
  }

  const bodyText = await resp.text();

  // The server sometimes returns JSON, sometimes HTML-wrapped JSON, sometimes
  // "No Output Found". Try to extract a splits array robustly.
  let splits = [];
  let parsed = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch (e) {
    // Try to find a JSON array/object embedded in HTML
    const m = bodyText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch (e2) {}
    }
  }

  // Normalize various possible shapes into a flat list of segment strings.
  // The Heritage/SCL JSON shape has varied over versions; handle the common
  // ones and fall back to returning the raw text for the app to display.
  if (parsed) {
    splits = normalizeSandhiJson(parsed);
  }

  const noOutput = /No Output Found/i.test(bodyText);

  return jsonResponse(200, {
    kind: 'sandhi',
    input: word,
    mode,
    found: splits.length > 0,
    splits,                       // best-effort parsed segments
    raw: splits.length ? undefined : bodyText.slice(0, 2000), // for debugging when parse fails
    noOutput,
  }, env);
}

// Try to pull a list of segments out of whatever JSON shape the server sent.
function normalizeSandhiJson(parsed) {
  // Shape A: { "splits": ["राम", "आलयः"] }
  if (parsed && Array.isArray(parsed.splits)) return parsed.splits.filter(Boolean);
  // Shape B: array of strings
  if (Array.isArray(parsed) && parsed.every(x => typeof x === 'string')) return parsed;
  // Shape C: array of objects with a word/segment field
  if (Array.isArray(parsed)) {
    const out = [];
    for (const item of parsed) {
      if (typeof item === 'string') out.push(item);
      else if (item && (item.word || item.segment || item.pada)) {
        out.push(item.word || item.segment || item.pada);
      }
    }
    if (out.length) return out;
  }
  // Shape D: { "1": {...}, "2": {...} } ranked solutions — take the first
  if (parsed && typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    for (const k of keys) {
      const v = parsed[k];
      if (Array.isArray(v)) {
        const seg = v.map(x => (typeof x === 'string' ? x : (x.word || x.segment || x.pada))).filter(Boolean);
        if (seg.length) return seg;
      }
    }
  }
  return [];
}

// ----------------------------------------------------------------------------
// OCR via Google Cloud Vision
// Uses DOCUMENT_TEXT_DETECTION which is optimized for dense text and pages
// (vs TEXT_DETECTION which targets scenes/photos). Better for scriptures.
// ----------------------------------------------------------------------------
async function handleOcr(request, env) {
  // Optional language hints override via ?hints=sa,gu  (comma-separated BCP-47).
  // Used by the per-region re-OCR feature to request e.g. Sanskrit-only.
  const reqUrl = new URL(request.url);
  const hintsParam = reqUrl.searchParams.get('hints');
  let languageHints = ['sa', 'gu', 'hi'];
  if (hintsParam) {
    const parsed = hintsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);
    if (parsed.length) languageHints = parsed;
  }

  const imageBytes = await request.arrayBuffer();
  if (imageBytes.byteLength === 0) {
    return jsonError(400, 'Empty image body', env);
  }
  if (imageBytes.byteLength > 20 * 1024 * 1024) {
    return jsonError(413, 'Image too large (>20MB)', env);
  }

  // Google Vision wants base64-encoded image in JSON.
  // Convert ArrayBuffer → base64 (efficiently, in chunks for large images)
  const b64 = arrayBufferToBase64(imageBytes);

  const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(env.GOOGLE_API_KEY)}`;
  const body = {
    requests: [{
      image: { content: b64 },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
      // languageHints behavior trade-off:
      //
      // - No hints: Google auto-detects per region. Works well for pages with
      //   clean script-per-region separation (full Sanskrit verses standalone,
      //   Gujarati commentary standalone). BUT short inline Sanskrit phrases
      //   embedded mid-Gujarati-sentence get classified as Gujarati and
      //   transliterated incorrectly (e.g. भगवान् काव्यः → માવાનું વાસ્થ્યઃ).
      //
      // - Sanskrit first ['sa', 'gu', 'hi']: gives the Devanagari model
      //   precedence for ambiguous regions, helping inline Sanskrit phrases.
      //   May cause some pure-Gujarati pages to over-detect Devanagari, but
      //   in practice Gujarati glyphs are distinct enough that mis-classification
      //   the other direction is rare.
      //
      // Empirical testing on the Bhāgavatam-Rasāsvāda commentary edition shows
      // Sanskrit-first gives better overall results because the book has
      // frequent inline Sanskrit citations within Gujarati prose.
      imageContext: {
        languageHints: languageHints,
      },
    }],
  };

  const resp = await fetch(visionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    let detail = '';
    try {
      const err = await resp.json();
      detail = err.error?.message || JSON.stringify(err);
    } catch (e) {}
    let hint = '';
    if (resp.status === 400 && detail.includes('API key')) {
      hint = ' — likely wrong API key, or key not restricted to Vision API';
    } else if (resp.status === 403) {
      hint = ' — Vision API not enabled, or billing not active on the GCP project';
    } else if (resp.status === 429) {
      hint = ' — rate limit (1,800 requests/minute) or quota exceeded';
    }
    return jsonError(resp.status, `Google Vision failed: HTTP ${resp.status}${hint} — ${detail}`, env);
  }

  const data = await resp.json();
  const r = data.responses?.[0];
  if (!r) return jsonError(502, 'Google Vision returned no response', env);
  if (r.error) return jsonError(502, `Google Vision error: ${r.error.message}`, env);

  return jsonResponse(200, { kind: 'google-vision', result: r }, env);
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function arrayBufferToBase64(buffer) {
  // Cloudflare Workers don't have Buffer; convert via Uint8Array + btoa.
  // Process in chunks of 32KB to avoid call stack overflows on large images.
  const bytes = new Uint8Array(buffer);
  const chunkSize = 32768;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function corsHeaders(env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonResponse(status, body, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  });
}

function jsonError(status, message, env) {
  return jsonResponse(status, { error: message }, env);
}
