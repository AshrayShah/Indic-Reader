# Indic Reader

**🌐 Live app: [https://indic-reader.pages.dev/](https://indic-reader.pages.dev/)**

A single-file web app for reading, narrating, and translating Indic-script scriptures (Sanskrit, Hindi, Gujarati). Works in any modern browser. Everything runs locally on your device by default — no server, no tracking, no cookies. Cloud-based features (OCR, translation, dictionary) are optional and opt-in with explicit consent.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Loading documents](#loading-documents)
3. [Reading & narration](#reading--narration)
4. [Layouts (A / B / C)](#layouts-a--b--c)
5. [Language filter](#language-filter)
6. [Outline / table of contents](#outline--table-of-contents)
7. [Word meanings & translation](#word-meanings--translation)
8. [Split Sandhi (word separation)](#split-sandhi-word-separation)
9. [Correcting language & text](#correcting-language--text)
10. [Vedabase deep links](#vedabase-deep-links)
11. [OCR for scanned documents](#ocr-for-scanned-documents)
12. [Re-OCR a region](#re-ocr-a-region)
13. [Cloud OCR setup](#cloud-ocr-setup)
14. [Google Drive integration](#google-drive-integration)
15. [Settings & preferences](#settings--preferences)
16. [Keyboard shortcuts](#keyboard-shortcuts)
17. [Privacy & data handling](#privacy--data-handling)
18. [Troubleshooting](#troubleshooting)
19. [Known limitations](#known-limitations)

---

## Quick start

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge — desktop or mobile)
2. Drag a file onto the drop zone, or tap **📁 Choose Files**
3. For PDFs, select page range, tap **▶ Process Pages**
4. Use the **▶ Play** button to narrate, or scroll/tap to read

For scanned PDFs (image-only), turn on **Force OCR** before processing.

---

## Loading documents

Five ways to load content:

| Method | When to use |
|--------|-------------|
| **📁 Choose Files** | Pick files from your device — most common path |
| **📂 Browse** | Open a folder on desktop (File System Access API); falls back to multi-file picker on mobile |
| **🟢 Drive** | Pick from Google Drive (requires one-time OAuth setup — see [Drive integration](#google-drive-integration)) |
| **✍️ Paste Text** | Paste Sanskrit/Hindi/Gujarati text directly |
| **Drag & drop** | Drop files anywhere in the page |
| **Drive share link** | Paste a public Drive URL — file must be set to "Anyone with the link can view" |

Supported file types: PDF, DOCX, TXT, RTF, HTML, XML, images (JPG, PNG, etc.)

---

## Reading & narration

Two views, switchable via the tabs at the top of the reader:

- **📝 Text View** — extracted text reflowed for screen reading. One line/verse per row. Each row has a ★ favorite button.
- **📄 Document View** — original page rendered as image with text overlay highlighting. Shows the page exactly as printed.

### Player controls (bottom bar)

| Button | Action |
|--------|--------|
| ⏮ | Previous line / verse |
| ▶ / ⏸ | Play / pause narration |
| ⏹ | Stop narration |
| ⏭ | Next line / verse |
| Page chip | Tap to jump to a specific page |

### Narration toggles

- **🕉 Chant** — slow, contemplative narration speed (overrides per-language sliders)
- **Auto-scroll** — scrolls the page automatically as narration progresses
- **Pause at skip** — when narration encounters a line in a language you've filtered out, pause briefly so you can decide whether to skip or include it
- **📖 Continuous** — auto-advance through pages without manual ⏭

### Speed sliders

Three independent sliders, one per language (Gujarati, Hindi, Sanskrit). Adjust narration speed per script. Sanskrit chanting traditionally slower; Hindi/Gujarati prose can be faster.

### Screen wake lock

While narrating, the screen stays on automatically. When you stop narration or close the tab, it releases. Requires HTTPS; some browsers (older Safari) don't support it and screen behavior falls back to OS default.

### Chhand (verse metre)

Each Sanskrit verse shows a metre pill, e.g. `📐 Anuṣṭubh · 32 akṣ`. The metre is detected from the syllable count across the **whole verse** (joining the pādas even when a śloka is split across two display lines); the pill appears on the line that completes the verse, and mid-verse lines show just their syllable count.

- **Anuṣṭubh (32)** and **Gāyatrī (24)** are detected reliably by syllable count.
- **Triṣṭubh, Jagatī, and longer metres** are shown as an *approximate* family match (labelled "(approx.)"), because these depend on the precise guru/laghu (heavy/light) pattern, not just the syllable count — verify them yourself.
- If no standard metre matches, the pill shows the syllable count with "meter unclear" (common for prose or OCR-garbled verses).

The metre also shapes chant-mode recitation (pitch contour and pauses per pāda).

---

## Layouts (A / B / C)

Top of the reader has a layout selector. Choose what suits your reading style:

- **A — Single column** (default): on-demand translation. Tap "Translate verse" on each line if you want it.
- **B — Side-by-side**: Sanskrit on the left, translations on the right. Auto-translates as lines scroll into view. Desktop-only — falls back to C below 768px width.
- **C — Stacked pairs**: each Sanskrit verse followed immediately by its Gujarati + Hindi + English translation. Auto-translates everything. Best for mobile.

Choice is saved in your browser; persists across sessions.

Switching to B or C the first time will prompt for consent (translation sends text to Google Translate's public endpoint).

---

## Language filter

Buttons above the text: **All / ગુ Guj / સં Sans / હિ Hin**

- Filters which lines are visible AND which lines are narrated
- Useful when reading scripture with both Sanskrit verses and Gujarati commentary — you can hear just the Sanskrit, or just the commentary

---

## Outline / table of contents

For DOCX files, the **📑 Outline** button appears in the reader header. Tap it to see the document's structure as a navigable list.

The outline shows different things depending on the document:

| Strategy | When used | What you see |
|----------|-----------|--------------|
| **Headings** | DOCX uses Word's Heading 1/2/3 styles | Hierarchical TOC indented by heading level |
| **Author page breaks** | DOCX has explicit page breaks (Ctrl+Enter in Word) | "Page 1, Page 2, …" matching author intent |
| **Auto-chunked** | Document has neither headings nor page breaks | "Chunk 1, Chunk 2, …" — each ≈500 words |

Tap any entry to scroll the reader to that section. Brief highlight pulse shows where you landed.

---

## Word meanings & translation

### Show Meanings (Sanskrit only)

Below each Sanskrit verse, tap **Show Meanings** to look up each word:

1. Queries the Cologne University Monier-Williams dictionary (the authoritative Sanskrit lexicon)
2. Returns English definitions, then auto-translates them to Gujarati
3. Cached per-session — repeated lookups are instant

Source badge per word:
- **MW** (green) — from Monier-Williams (authoritative)
- **GT** (grey) — Google Translate fallback (less reliable for technical Sanskrit terms)

### Translate verse

Below each line, tap **🌐 Translate verse** to get full-verse translations:

- Gujarati, Hindi, and English translations all shown
- Each has a 🔊 button to hear it spoken in that language's voice
- Cached per source — same verse won't be translated twice

This sends the verse text to Google Translate's public endpoint. Disabled by default; first use prompts for consent.

---

## Split Sandhi (word separation)

Sanskrit verses fuse words together through sandhi (e.g. `तपोवनम्` = `तपस् + वनम्`). The **✂️ Split Sandhi** button (on every Sanskrit verse, next to Show Meanings) separates them.

**How it works — accuracy first, with honest fallback:**

1. **Real morphology** — it first sends the verse text to the **University of Hyderabad Heritage segmenter**, an academic Sanskrit morphological analyzer, routed through your own Cloudflare Worker (the same one used for Cloud OCR). The badge shows "University of Hyderabad Heritage segmenter ✓" when this succeeds.
2. **On-device fallback** — if the service is unreachable, it falls back to a built-in rule-based assistant that handles the reliable cases (avagraha `ऽ`, visarga sandhi). The badge then says "Guided assistant".

**The overlay lets you edit the result directly:**

- A **live split-out line** below the original verse shows the current split joined together, updating as you merge/split
- Each separated word is a chip showing its **meaning translated** in your chosen language beneath it
- A **Meaning in: ગુ Gujarati / हि Hindi / EN English** toggle switches all word meanings (defaults to Gujarati; remembers your choice)
- **Tap a word** to also see its full **Monier-Williams dictionary** entry, and **🔊** to hear it
- **· merge ·** between any two words joins them back
- **✂** on a word opens an inline picker right in that row — tap a cut-point between letters to split there (no separate popup)
- **🔊 Chant all padas** speaks the separated words in sequence
- **💾 Save** remembers your split for that verse; **🔄 Re-split from API** re-queries; **↺ Reset** restores the original

**Honest limitation:** Sanskrit segmentation is inherently ambiguous — even the academic engine returns the *ranked best* analysis, not a guaranteed-correct one. And per-word translations come from Google Translate, which is weak on isolated/inflected Sanskrit words — treat the inline translation as a quick gloss and the tap-for-dictionary (Monier-Williams) as the more reliable source. The split/merge editing exists precisely so you have the final say. Treat all of it as a study aid.

Setup: Split Sandhi reuses your Cloud OCR Worker URL. If you haven't set that up (see [Cloud OCR setup](#cloud-ocr-setup)), it uses the on-device assistant only. Per-word meanings require online lookups to be enabled (same consent as Show Meanings).

---

## Correcting language & text

Automatic script detection is good but not perfect, especially on OCR'd pages. Two manual overrides give you the final say, and both **persist** (saved in your browser):

**Language override** — **long-press any word** (or right-click on desktop) to open a picker:
- Set that word to **Sanskrit / Hindi / Gujarati**, or back to **Auto-detect**
- Or **set the whole line's language** — this is what controls the **narration voice** (voice is chosen per line)

Use this when a Sanskrit verse is being read in the Hindi voice, or a word shows the wrong dictionary.

**Text correction** — when OCR garbles a verse, use **[Re-OCR a region](#re-ocr-a-region)** (in Document View) to fix the actual text. Corrections are keyed to the original text and survive re-processing.

---

## Vedabase deep links

For recognized scriptures (Śrīmad-Bhāgavatam, Bhagavad-gītā), each verse gets a 📖 link to the official Vedabase entry:

- Filename hint helps: name files like `SB_3.25.pdf` or `BG_2.pdf` for auto-detection
- Source chip shows "SB — set canto/ch" — tap to enter chapter/verse context
- Once context is set, every verse line has `📖 SB 3.25.6 on vedabase.io ↗` pointing to the official commentary

**Manual reference entry (when auto-detection fails):** if a Sanskrit verse has no working link, it shows a **🔗 Set reference** button. Tap it to enter the details by hand:

- Choose the scripture (Śrīmad-Bhāgavatam or Bhagavad-gītā)
- Enter **Skand**, **Adhyay**, and **Shlok** (for BG, just Adhyay and Shlok)
- A live preview shows the resulting vedabase.io link before you save
- Once saved, the verse shows its 📖 link, and a **✎** appears to edit it later

Your manual references are saved (keyed to the verse text) and persist across reloads and re-processing. Use **↺ Clear my reference** in the dialog to remove one.

Vedabase content is BBT-copyrighted; we deep-link only, never copy text.

---

## OCR for scanned documents

OCR (Optical Character Recognition) extracts text from images and scanned PDFs.

### When to use OCR

| File type | OCR needed? |
|-----------|-------------|
| Digital PDF with embedded text | **No** — text extracted directly (perfect accuracy) |
| Scanned PDF (image-only) | **Yes** — turn on **Force OCR** |
| JPEG / PNG of a page | **Yes** — runs automatically |
| DOCX / RTF / TXT / HTML | **No** — text already structured |

### Force OCR toggle

Located near "Clear All" on the main screen. Turn ON when:
- You uploaded a scanned PDF and see "No Indic text found"
- The PDF's embedded text is garbage (font mapping broken)
- You want to re-run OCR with a different engine

### Local OCR (default)

Uses Tesseract.js running entirely in your browser. Free, private, works offline once language data is cached. Slower (~5–15 seconds per page) and less accurate than cloud OCR on poor scans.

Language data (~5MB for Gujarati + Devanagari) is downloaded from `tessdata.projectnaptha.com` on first OCR, then cached.

### OCR quality indicator

After processing, a small badge near each source shows which engine processed it:

- **☁️ Google** (green) — Google Cloud Vision (via your Cloudflare Worker)
- **☁️ OCR.space** (green) — OCR.space free tier
- **📱 Local** (grey) — Tesseract.js fallback

A confidence banner appears for low-quality results (< 60% confidence) — verify against the original page.

You can tap the engine badge any time to see a **per-page diagnostic**: which engine OCR'd each page, your current settings, and why cloud failed (if it did).

---

## Re-OCR a region

When OCR mis-reads part of a page — most commonly an **inline Sanskrit verse** embedded in Gujarati/Hindi prose — you can re-OCR just that area instead of the whole page.

**In Document View**, each page has a **🔍 Re-OCR a region** button:

1. Tap it, then **drag a box** over the text that was mis-read
2. A dialog shows the **cropped image** and runs OCR automatically
3. Choose the **language** for that region — **Sanskrit only** (default, best for verses), Gujarati only, Hindi only, or Auto
4. Choose the **engine** — ☁️ Google Vision (if configured) or 📱 Local
5. Edit the result **by hand** in the text box if needed
6. Pick **which line to replace** and tap **✓ Replace line text**

The correction is saved and survives re-processing.

**Why this helps:** OCR engines assign one dominant script per visual line, so short inline Sanskrit gets misread as the surrounding script. Cropping just the verse and forcing **Sanskrit-only** removes that conflict and usually reads the verse correctly. If the scan is poor, you can also just type the correction directly — re-OCR is optional.

This works with **local OCR too** — no cloud account needed for the on-device option.

---

## Cloud OCR setup

Cloud OCR significantly improves accuracy on poor scans, photos, and books with marginalia. **Optional and opt-in** — disabled by default.

### Why a proxy?

Google Cloud Vision blocks direct browser calls (CORS). The app uses a free **Cloudflare Worker** as a proxy between your browser and Google. Your API key lives on Cloudflare as an encrypted secret — never exposed in browser source code.

### One-time setup (≈ 10 minutes)

Two parts:

#### Part 1: Get a Google Cloud Vision API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. `indic-reader`)
3. **Billing → Link a billing account** (free tier covers 1,000 calls/month at $0, but a card is required)
4. **Billing → Budgets & alerts → Create budget**: set amount to **$1** with default thresholds — this emails you BEFORE any charge
5. **APIs & Services → Library**: search "Cloud Vision API", click ENABLE
6. **APIs & Services → Credentials → + Create credentials → API key**
7. Copy the key. Click "Edit API key":
   - **API restrictions**: Restrict key → check ONLY "Cloud Vision API"
   - **Application restrictions**: None (Worker calls don't preserve referrer)
   - SAVE

#### Part 2: Deploy a Cloudflare Worker

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages
2. Create → Hello World → name it (e.g. `indic-ocr-proxy`) → Deploy
3. Open Worker → Edit code → delete the template → paste the entire `cloudflare-worker-google-ocr.js` file
4. Save and Deploy
5. Worker → Settings → Variables and Secrets, add two:
   - `GOOGLE_API_KEY` = (your key from Part 1) — mark as **Encrypt** (Secret)
   - `ALLOWED_ORIGIN` = your app's URL (e.g. `https://indic-reader.pages.dev`) — use `*` only for testing
6. Save

#### Part 3: Configure the app

1. In the app, tap **⚙ Cloud OCR** (gear icon near Cloud OCR toggle)
2. Provider: **⭐ Cloudflare Worker → Google Vision**
3. Paste your Worker URL (e.g. `https://indic-ocr-proxy.YOUR.workers.dev`)
4. Tap **🔍 Test connection** — should show `✓ Connection works. Detected: "TEST"`
5. **Save credentials**
6. Flip **☁️ Cloud OCR** toggle ON

### OCR.space alternative (Gujarati only, no setup)

For Gujarati-only documents and quick testing:

1. Get a free key at [ocr.space/ocrapi/freekey](https://ocr.space/ocrapi/freekey)
2. ⚙ Cloud OCR → choose OCR.space → paste key → save

Free tier: 25,000 pages/month. No Sanskrit support in free tier.

### Cost reality

| Provider | Free tier | After free tier |
|----------|-----------|-----------------|
| Google Cloud Vision | 1,000 calls/mo | $1.50 per 1,000 calls |
| OCR.space | 25,000 calls/mo | Need paid plan |
| Cloudflare Workers | 100,000 calls/day | $0.50 per million |

For personal reading (a few dozen pages a day), you'll never exceed any free tier. Set the $1 Google budget alert and you can't be surprised.

---

## Google Drive integration

**Optional and OAuth-gated.** Lets you pick files directly from your Drive instead of downloading then uploading.

### Setup

1. In Google Cloud Console (same project as Vision), enable:
   - **Google Drive API**
   - **Google Picker API**
2. Create credentials:
   - **OAuth 2.0 Client ID** (Web application)
     - Authorized JavaScript origins: your app URL (e.g. `https://indic-reader.pages.dev`)
   - **API key** (separate from the Vision key)
     - API restrictions: Drive API + Picker API
     - Application restrictions: HTTP referrers → `https://YOUR-APP-URL/*`
3. **OAuth consent screen** → set up as External + Testing → add your own email as Test User
4. In the app: tap **🟢 Drive** → enter OAuth Client ID and API key → save

### Usage

- Tap **🟢 Drive** → **🔐 Sign in & pick from Drive**
- Google's Picker UI opens; select files
- Files are downloaded into the app and processed

Drive integration is fiddly to set up. If you have trouble, the local file picker works perfectly without any setup.

---

## Settings & preferences

Saved automatically in browser localStorage:

| Setting | Default | Description |
|---------|---------|-------------|
| Theme | Auto | Light / dark / follow system |
| Layout | A | Single column |
| Voice per language | First available | Use **Voice Settings** to choose |
| Speed per language | 1.0× | Three sliders |
| Bookmarks (★ stars) | None | Per-line favorites |
| Show Meanings consent | Off | Required for Sanskrit dictionary |
| Translate consent | Off | Required for verse translation |
| Cloud OCR consent | Off | Required for cloud OCR |
| Drive credentials | None | OAuth Client ID + API key |
| Cloud OCR credentials | None | Worker URL or OCR.space key |

### Reset privacy choices

Bottom of the page → "Reset privacy choices" — revokes all consents and re-shows the privacy banner. Doesn't delete credentials.

### Clear All

Top of the file-input section → wipes loaded documents and in-memory state. Doesn't touch settings or credentials.

---

## Keyboard shortcuts

Desktop only:

| Key | Action |
|-----|--------|
| **Space** | Play / pause narration |
| **←** | Previous line |
| **→** | Next line |
| **↑** | Decrease speed |
| **↓** | Increase speed |
| **T** | Toggle Text / Document view |
| **F** | Cycle language filter (All → Guj → Sans → Hin → All) |
| **S** | Toggle Auto-scroll |
| **Esc** | Stop narration / close dialogs |

---

## Privacy & data handling

**Files stay on your device by default.** The app runs entirely in your browser — there's no Indic Reader server.

### What's sent externally and when

| Feature | Sends data to | When |
|---------|---------------|------|
| **Cloud OCR** | Cloudflare Worker → Google Vision (or OCR.space) | Each page processed (only when toggle is ON) |
| **Re-OCR a region** | Cloudflare Worker → Google Vision (or OCR.space) | When you re-OCR a selected region with a cloud engine (local option sends nothing) |
| **Split Sandhi** | Cloudflare Worker → UoH Heritage segmenter (verse text only, no files); Google Translate for per-word meanings | When you tap "Split Sandhi" (segmenter falls back to on-device if unreachable; meanings need online lookups enabled) |
| **Show Meanings** | Cologne University MW API + Google Translate | When you tap "Show Meanings" |
| **Translate verse** | Google Translate (public endpoint) | When you tap "Translate verse" or use layout B/C |
| **Vedabase link** | vedabase.io (link only, no content) | When you tap the 📖 link (opens in new tab) |
| **Drive Picker** | Google (drive.google.com) | When you tap Drive sign-in |
| **First-launch CDN** | cdn.jsdelivr.net | Loading PDF/OCR/DOCX libraries (cached afterward) |
| **Tesseract language data** | tessdata.projectnaptha.com | First local OCR run (cached afterward) |

### What's NOT sent

- No analytics or telemetry
- No tracking pixels
- No cookies
- No data sent to Anthropic or any other party
- Your text is never sent anywhere unless you explicitly trigger an external feature

### Stored only on your device (never uploaded)

Your preferences and manual corrections live in this browser's `localStorage` and are never sent anywhere: language/text overrides, **manual verse references** (the canto/chapter/verse you enter for vedabase.io links), saved sandhi splits, translation cache, voice/theme preferences, and Drive credentials. A manual verse reference only ever produces a vedabase.io link, sent solely when *you* tap that link.

### Your data rights (GDPR/DPDP)

- **Access/Portability**: use "Copy Text" to export all extracted content
- **Erasure**: "Clear All" wipes in-memory state; browser "Clear site data" wipes preferences
- **Withdraw consent**: "Reset privacy choices" link at the bottom

---

## Troubleshooting

### "No Indic text found"

Usually means the document has no embedded text. Solutions:
1. Turn ON **Force OCR**, re-process
2. If the file is a Google Docs PDF, font mapping may be broken — Force OCR fixes it
3. For images: make sure the script is clearly readable (clean scan, no glare)

### Cloud OCR shows "Local (cloud failed)"

**First, tap the engine badge** — it now shows a per-page diagnostic: your current settings (Cloud ON/OFF, fallback ON/OFF), which engine OCR'd each page, and the run log with the specific failure reason. This tells you exactly what happened.

If a page genuinely fell back to local, common causes:
- Worker URL wrong or Worker not deployed
- Google API key invalid or restrictions blocking it
- ALLOWED_ORIGIN on Worker doesn't match your app URL
- Free quota exceeded
- Network down

Note: the badge reflects the **last processing run**. Turning Cloud OCR on does *not* re-OCR already-loaded pages — you must re-process the page (or use **Re-OCR a region** for a targeted fix).

### Sanskrit being read as Gujarati (or vice versa)

Two fixes:
1. **Quick fix (classification):** long-press the word → set its language, or "Set line → Sanskrit" to fix the narration voice. See [Correcting language & text](#correcting-language--text).
2. **Root fix (garbled text):** if the text itself is wrong from OCR, use [Re-OCR a region](#re-ocr-a-region) in Document View to re-read just that verse with Sanskrit-only hints.

The underlying cause is a known OCR limitation: inline script-switching within a single line confuses every OCR engine. Standalone verses work; short embedded quotes may misread.

### "Drive Picker error"

Usually means API key restrictions are too strict. Quick fixes:
1. Edit the Drive Picker API key in Google Cloud Console
2. Application restrictions → temporarily set to "None"
3. Wait 5 minutes for propagation
4. Reload the app

If still broken, just skip Drive — use the regular file picker.

### Narration sounds wrong / weird voice

System TTS voices vary by device. Tap **Voice Settings** in the reader and pick a better voice:
- Android: install "Google Text-to-Speech" + the language packs
- Windows: Settings → Time & Language → Speech → Add voices
- macOS/iOS: System Settings → Accessibility → Spoken Content → System Voice

For Sanskrit specifically, Hindi voices are usually the best fallback since true Sanskrit TTS is rare.

### Page won't scroll on mobile

Pull down firmly to refresh. If the player bar is hiding the bottom of content, try landscape orientation. The bottom bar's height adapts but can occasionally need a refresh.

---

## Known limitations

Things this app **does not** and **cannot** do well:

- **Vedic pitch accents (svara marks)** — Web Speech API can't render them. Pre-recorded chanting audio would be needed.
- **Real-time collaboration** — no shared state across devices/users.
- **Note-taking** — bookmarks (★) only; no annotations or highlights.
- **Inline script-switching OCR** — short embedded Sanskrit quotes in Gujarati prose often misread (limitation of all OCR engines, not specific to this app). Mitigated by [Re-OCR a region](#re-ocr-a-region) with Sanskrit-only hints, and manual text/language correction.
- **Vedabase content scraping** — BBT-copyrighted; we deep-link to the official site only, never copy text.
- **Translation quality for technical Sanskrit** — Google Translate handles colloquial Sanskrit poorly. Use the MW dictionary for word meanings, treat full-verse auto-translation as approximate.
- **Sandhi splitting is not guaranteed correct** — the Heritage segmenter gives the ranked best analysis, but Sanskrit segmentation is inherently ambiguous. The on-device fallback is heuristic only. Always verify with the built-in split/merge editing. See [Split Sandhi](#split-sandhi-word-separation).
- **Offline-first PWA install** — the file works offline once loaded, but proper PWA install with home-screen icon requires the GitHub Pages bundle.
- **Persistent translation cache** — currently per-session. Reloading the page loses cached translations. (Language/text corrections and saved sandhi splits *do* persist.)

---

## File structure — what each file is for

The project ships in a few bundles. Here's what every file does and whether you need it.

### Core app (the only truly required file)

| File | Purpose | Required? |
|------|---------|-----------|
| `index.html` | **The entire application** — all HTML, CSS, and JavaScript in one self-contained file (~350 KB). Open it directly in a browser and everything works: reading, narration, OCR, meanings, sandhi splitting. Everything else is optional enhancement. | ✅ Yes |

### Offline & install support (PWA)

| File | Purpose | Required? |
|------|---------|-----------|
| `sw.js` | **Service worker.** Caches the app so it loads offline after the first visit, and powers "install to home screen". The version string inside (e.g. `indic-reader-v46`) is bumped on every update to force browsers to fetch the new version. | Optional (enables offline) |
| `manifest.json` | **PWA manifest** — app name, icons, theme color, display mode. Lets phones offer "Add to Home Screen" with a proper icon. | Optional |
| `icon-192.png` | App icon (192×192) for home screen / launcher. | Optional |
| `icon-512.png` | App icon (512×512) for splash screen / high-DPI. | Optional |

### Hosting & security (Cloudflare Pages / GitHub Pages)

| File | Purpose | Required? |
|------|---------|-----------|
| `_headers` | **Security headers** for Cloudflare Pages — Content-Security-Policy (restricts which domains the app may contact), plus standard hardening headers. This is what allows the Worker, dictionary, and translate endpoints while blocking everything else. | Recommended when hosting |
| `_headers-no-csp` | A **fallback** version with the CSP relaxed, in case the strict policy ever blocks something on your setup. Rename to `_headers` only if you hit a CSP problem. | Optional |
| `.github/workflows/deploy.yml` | **GitHub Actions** workflow that auto-deploys the repo to GitHub Pages on every push. Only relevant if you host on GitHub. | Optional (GitHub only) |
| `README.md` | This documentation file. | Reference |

### Cloud OCR & Sandhi (the Cloudflare Worker)

| File | Purpose | Required? |
|------|---------|-----------|
| `cloudflare-worker-google-ocr.js` | **The Worker proxy** — paste this into a Cloudflare Worker (it is *not* part of the website; it runs separately on Cloudflare's edge). It does two jobs: (1) proxies page/region images to **Google Cloud Vision** for OCR, and (2) proxies verse text to the **UoH Heritage segmenter** for Split Sandhi. Both are needed only because browsers can't call those services directly (CORS). Needs your Google API key set as a Worker secret. | Only for Cloud OCR & API sandhi |
| `cloudflare-worker-azure-ocr.js` | An **alternative Worker** using Azure Computer Vision instead of Google, if you prefer Azure. Use one or the other, not both. | Optional alternative |

### Convenience bundles & local testing

| File | Purpose | Required? |
|------|---------|-----------|
| `indic-reader-github.zip` | Zipped copy of the GitHub Pages bundle (app + PWA + headers + workflow), ready to upload to a repo. | Convenience |
| `indic-reader-standalone.zip` | Zipped copy of the standalone/PWA bundle for offline or self-hosting. | Convenience |
| `serve.py` | A tiny **local web server** (Python, in the standalone/PWA bundle) — run `python serve.py` to test the app at `localhost` with correct headers, since some features need `http://` rather than `file://`. | Local testing only |
| `android-wrapper/`, `ios-wrapper/`, `windows-wrapper/` | Thin **native wrappers** (in the standalone/PWA bundle) that load the app in a WebView, if you want to package it as an installable app for each platform. | Optional |

### Minimal setups

- **Just try it:** `index.html` alone.
- **Offline-capable website:** `index.html` + `sw.js` + `manifest.json` + both icons + `_headers`.
- **Full features (Cloud OCR + API sandhi):** the above, plus deploy `cloudflare-worker-google-ocr.js` to a Cloudflare Worker and paste its URL into the app's Cloud OCR settings.

---

## Credits & sources

- **Monier-Williams dictionary**: Cologne South Asia Studies / cologne-digital-sanskrit-lexicon
- **Sandhi segmentation**: University of Hyderabad Sanskrit Heritage / Saṃsādhanī tools (sanskrit.uohyd.ac.in)
- **OCR**: Tesseract.js (local), Google Cloud Vision (cloud)
- **DOCX parsing**: mammoth.js
- **PDF rendering**: pdf.js (Mozilla)
- **Sanskrit transliteration**: IAST scheme
- **Vedabase**: deep links to vedabase.io (BBT Inc.)

---

## License & copyright

App code is provided for educational and personal study use. Scripture texts loaded into the app retain their original copyrights — verify your right to OCR or process any document before doing so. Vedabase content is BBT-copyrighted; this app links to but does not redistribute their text.

No commercial redistribution of this app or its output.
