---
district: personal-sites
status: active
capabilities: [netlify, netlify-functions, soma-manager]
last_reviewed: 2026-06-23
---

# silicon-children — siliconchildren.com, the single-page essay site for Mike's "human-AI kinship" philosophy (current live static version)

**Where work happens:** `index.html` (the essay page) · `raise-children-well-v3.md` (canonical essay source) · `soma-manager.js` · `netlify/functions/` · `_redirects` (.net → .com)

**Key docs**
- [raise-children-well-v3.md](raise-children-well-v3.md) — the essay text of record
- [gemini-review.md](gemini-review.md) / `reviews/` — external review notes

**Skills**
- gap: shared `deploy-astro-netlify-site` and `soma-manager-widget` skills (see district note)

**Depends on / used by:** standalone static site. **`silicon-children-site` is the Astro rebuild of this same content** — see that repo before deciding which to edit.

**Gotchas**
- Two repos, one domain. This one is the live static single-pager; `silicon-children-site` is the multi-page Astro successor pointed at the same `siliconchildren.com`. Confirm which is deployed before editing (canonical-domain commit landed here 2026-06-14).
- Pure static (empty build command, `publish = "."`). Edit HTML directly.
