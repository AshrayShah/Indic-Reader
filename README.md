# Indic Reader

A web app that reads and narrates Gujarati, Hindi and Sanskrit scriptures — from PDFs, scans, DOCX files, or pasted text. Auto-detects chhand (meter), highlights words during narration, supports Sandhi viccheda for Sanskrit.

Where the app stands now
To give you an honest picture of what is built:

OCR for Gujarati, Hindi, Sanskrit (via Devanagari recognition) (Limitation on Numbers detection in OCR - to improve accuracy of words)
PDF text extraction (native + OCR fallback) with proper line/word segmentation
DOCX, paste, HTML, RTF, XML, TXT input
Three-way language detection 
Tap-to-jump narration with word highlighting (now properly synchronized for all three languages with akshara-aware timing)
Sanskrit chhand detection (Gāyatrī, Anuṣṭubh, Triṣṭubh, Jagatī) with per-pada pitch contours
Sandhi-viccheda for Sanskrit compound words with translation validation
Google Drive integration (link + Picker with OAuth)
GDPR/DPDP-compliant privacy banner with consent gating
XSS hardening via DOMPurify and proper CSP via HTTP headers
Service worker with smart caching and version-aware invalidation
Three speed sliders, three voice pickers, dark/light/auto theme

Known limitations I've been upfront about:
Web Speech API timing is approximate; perfect onboundary sync isn't possible for Indic voices
DOCX images currently stripped by DOMPurify (security trade-off)
Drive Picker doesn't work in browsers that block apis.google.com (Brave Shields, DuckDuckGo, etc.) — link-paste path is the workaround
Sandhi-viccheda is heuristic, not a full Pāṇinian engine
Show Meanings uses Google Translate (not a Sanskrit dictionary), so glosses are approximate
Sandhi splitting and Show Meanings both require consent (privacy-by-default)
Hindi narration quality depends on installed voices — best results need Google's Hindi voice (Android: install Google TTS; Windows: install via Settings → Speech)
