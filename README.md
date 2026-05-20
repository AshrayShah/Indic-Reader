# Indic Reader

A web app that reads and narrates Gujarati and Sanskrit scriptures — from PDFs, scans, DOCX files, or pasted text. Auto-detects chhand (meter), highlights words during narration, supports Sandhi viccheda for Sanskrit.

## Live demo

Once deployed, this will be available at `https://<your-username>.github.io/indic-reader/`

## Setup (5 minutes, one-time)

### Step 1 — Create the repo

You're already here, so this is done if you used a template button. Otherwise: click **Use this template** at the top right, name it `indic-reader`, leave it public, **Create repository**.

### Step 2 — Enable GitHub Pages

1. Click the **Settings** tab in your repo
2. In the left sidebar, click **Pages**
3. Under **Source**, select **GitHub Actions**
4. (Don't pick "Deploy from a branch" — pick the Actions option)
5. Save

That's it. The included workflow file (`.github/workflows/deploy.yml`) will automatically build and deploy every time you push to the `main` branch.

### Step 3 — Trigger the first deploy

Click the **Actions** tab. You'll see a workflow running (or queued). Wait for the green check (≈ 1–2 minutes).

### Step 4 — Open the app

Back to **Settings → Pages**. At the top it shows your live URL:

```
Your site is live at https://<username>.github.io/indic-reader/
```

Click it. The app loads.

### Step 5 — Install as an app on your phone

**iPhone**: open the URL in **Safari** (not Chrome). Tap the Share button → **Add to Home Screen**.

**Android**: open in Chrome. Three-dot menu → **Install app**.

**Windows / Mac**: open in Edge or Chrome. Install icon in the address bar → click.

You now have an icon that opens the app full-screen, no browser bar, works offline after first load.

## Updating the app

Edit any file in this repo through the GitHub web UI (click a file → pencil icon → commit). The workflow re-deploys automatically. Refresh the app to see changes.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The app (everything in one file) |
| `manifest.json` | PWA metadata so it installs like a native app |
| `sw.js` | Service worker — caches the app for offline use |
| `icon-192.png`, `icon-512.png` | App icons |
| `.github/workflows/deploy.yml` | Auto-deploy on push |

## Credit

Free to use, modify, and share. Credit appreciated but not required.
