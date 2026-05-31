# PicReview · Live Demo

A static, interactive demo of [PicReview](https://github.com/willowding/picreview) — a lightweight team image-review tool I built solo at my product internship.

> **Live demo:** https://willowding.github.io/picreview-demo/
>
> **Production version (used internally by my team):** https://willowding.github.io/picreview/

## What you can try

- Switch between the **Upload** and **Review** roles after a one-tap login.
- Browse 9 pre-seeded sample images in the demo project (`英语绘本 L3 · 演示项目`), pre-populated with three fictional users and a mix of states: 3 pending / 2 approved / 2 rejected (with rejection comments and tags) / 2 claimed.
- Walk through the full state machine: **Pending → Rejected → Pending → Approved**, plus `Claimed` as a parallel state.
- Try card view and table view, the tag library, comment threads, multi-select bulk actions, and uploading your own images.

## Demo vs. Production

| | Demo (this repo) | Production |
|---|---|---|
| Backend | None — `mock-sb.js` reimplements the supabase-js API surface in memory | Real Supabase (PostgreSQL + Realtime + Storage) |
| Image storage | Local `URL.createObjectURL` for new uploads | Cloudinary |
| Realtime multi-user sync | Not available (single-browser session) | Yes |
| Data persistence | Reset on page refresh | Persistent |

Everything else — UI, interactions, state transitions, validation — is the same code as the production app.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire application (single-file SPA, ~150 KB) |
| `mock-sb.js` | In-browser mock of `@supabase/supabase-js` + Cloudinary upload interception |
| `style.css` | Legacy stylesheet (most styles are inlined in `index.html`) |
| `sample/` | 9 seed images shown in the demo project |

## Deployment

This repo is served from `main` branch root via GitHub Pages.

## Acknowledgements

Huge thanks to Claude for being a patient co-pilot through every line of the original PicReview code 💙
