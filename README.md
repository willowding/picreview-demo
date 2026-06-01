# PicReview · Live Demo

An interactive, **no-backend** demo of **PicReview** — a lightweight image-review
tool for small teams, designed and built solo during my product internship.

🔗 **Live demo:** https://willowding.github.io/picreview-demo/

> PicReview 是我在实习期间独立设计并开发的轻量团队审图工具。
> 本仓库是一个**无需后端、打开即玩**的演示版，数据均为示例，刷新后重置。

---

## The problem it solves / 解决的痛点

Small content teams often review images by pinging files back and forth in chat:
no shared status, rejected versions get lost, and no one can tell what still
needs work. PicReview turns that mess into one shared, stateful board.

> 小团队审图常靠在聊天里来回甩图——状态不同步、打回的版本丢失、
> 没人说得清还有哪些待处理，PicReview 把这套混乱收敛成一块共享、带状态的看板。

---

## What you can try / 你可以体验什么

- **One-tap login** to switch between the **Upload** and **Review** roles.
- **9 pre-seeded sample images** in a demo project, mixing every state:
  3 pending / 2 approved / 2 rejected (with reasons & tags) / 2 claimed.
- The full **state machine**: `Pending → Rejected → Pending → Approved`,
  with `Claimed` as a parallel state.
- **An imported table** (10 rows) so you can see the table view as a checklist:
  rows 1–9 are matched to uploaded images, while row 10 has no image yet and
  shows as **“未上传 / not uploaded”** — exactly how a team spots what's missing.
- **Card view & table view**, the tag library, comment threads,
  multi-select bulk actions, and uploading your own images.

> 一键登录切换「上传 / 审核」角色；演示项目预置 9 张示例图，覆盖
> 待审核 / 已通过 / 已打回（含理由与标签）/ 已认领 全部状态；并预置了一张 10 行的
> 导入表格——前 9 行已匹配到图片，第 10 行尚无图片、显示「未上传」，直观演示
> 「用表格盘点还差哪些图」的用法；可体验卡片视图、表格视图、标签库、评论、
> 多选批量操作与自助上传。

---

## Demo vs. the real app / 演示版与真实版

The demo runs **entirely in your browser** — same UI, interactions, state
transitions and validation as the real app, just with the backend swapped out.

| | This demo | Real app |
|---|---|---|
| Backend | In-memory mock of the database API | Managed Postgres + realtime |
| Image storage | Local object URLs | Cloud image hosting |
| Multi-user realtime sync | — (single browser) | Yes |
| Data persistence | Resets on refresh | Persistent |

> 演示版**完全跑在浏览器里**，UI、交互、状态流转和校验逻辑与真实版一致，
> 只是把后端换成了内存模拟。真实版接入了托管数据库、实时同步与云端图床。

---

## Tech / 技术

- **Frontend:** single-file `index.html` (HTML + CSS + vanilla JS, no build step)
- **Demo backend:** `mock-sb.js` — an in-browser mock that reimplements the
  database client's API surface in memory, plus upload interception
- **Hosting:** GitHub Pages

> 前端为单文件 `index.html`（原生 HTML/CSS/JS，无构建步骤）；
> `mock-sb.js` 在浏览器内模拟数据库客户端 API 与上传逻辑；部署在 GitHub Pages。

---

## Files / 文件结构

| File | Purpose |
|---|---|
| `index.html` | The entire application (single-file SPA, ~150 KB) |
| `mock-sb.js` | In-browser mock of the database client + upload interception |
| `style.css` | Legacy stylesheet (most styles are inlined in `index.html`) |
| `sample/` | Seed images shown in the demo project |

---

## Acknowledgements / 致谢

Sample illustrations are by **鸟鸟一** (Niaoniaoyi), created for the album
**《FOCUS》**, used here with appreciation purely for demonstration.

This was my first project taken solo from idea to deployment, built with Claude
as a patient co-pilot. 💙

> 示例插图由**鸟鸟一**老师为专辑《FOCUS》创作，此处仅用于演示展示，
> 特此致谢。这也是我第一个从想法到上线全程独立完成的项目，感谢 Claude 一路陪跑。
