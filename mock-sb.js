// mock-sb.js — drop-in replacement for @supabase/supabase-js, demo-only.
// 所有数据存在浏览器内存，刷新即恢复初始示例数据；不会触达任何真实后端。

const SAMPLE_BASE = (() => {
  const p = location.pathname.replace(/index\.html$/, "").replace(/\/?$/, "/");
  return p + "sample/";
})();

const NOW = Date.now();
const ago = (ms) => new Date(NOW - ms).toISOString();
const PROJ_ID = "demo-proj-1";

// ---- 种子数据：1 个项目 + 9 张图（3 待审 / 2 已通过 / 2 已打回 / 2 已认领）----
const seedProjects = [
  {
    id: PROJ_ID,
    name: "英语绘本 L3 · 演示项目",
    created_by: "PM·小 C",
    created_at: ago(7 * 24 * 3600 * 1000),
    metadata: {},
  },
];

const seedImages = [
  // 3 pending
  { f: "1.jpg", filename: "L3_demo_01_封面.jpg", uploader: "设计·小 A", status: "pending", h: 2.0 },
  { f: "2.jpg", filename: "L3_demo_02.jpg",     uploader: "设计·小 A", status: "pending", h: 2.0 },
  { f: "3.jpg", filename: "L3_demo_03.jpg",     uploader: "设计·小 B", status: "pending", h: 1.5 },
  // 2 approved
  {
    f: "4.jpg", filename: "L3_demo_04.jpg", uploader: "设计·小 A", status: "approved",
    reviewed_by: "PM·小 C", h: 5,
    comments: [{ user: "PM·小 C", text: "构图、色彩 OK，通过。", tags: [], time: ago(60 * 60 * 1000), action: "approved" }],
  },
  {
    f: "5.jpg", filename: "L3_demo_05.jpg", uploader: "设计·小 B", status: "approved",
    reviewed_by: "PM·小 C", h: 4,
    comments: [{ user: "PM·小 C", text: "通过", tags: [], time: ago(45 * 60 * 1000), action: "approved" }],
  },
  // 2 rejected
  {
    f: "6.jpg", filename: "L3_demo_06.jpg", uploader: "设计·小 A", status: "rejected",
    reviewed_by: "PM·小 C", reject_reason: "主角描边过粗，整体偏离系列风格",
    tags: ["有描边", "风格问题"], h: 6,
    comments: [{ user: "PM·小 C", text: "主角描边过粗，整体偏离系列风格", tags: ["有描边", "风格问题"], time: ago(30 * 60 * 1000), action: "rejected" }],
  },
  {
    f: "7.jpg", filename: "L3_demo_07.jpg", uploader: "设计·小 B", status: "rejected",
    reviewed_by: "PM·小 C", reject_reason: "动作与剧情不符，第二格人物应在跑而不是站立",
    tags: ["剧情问题"], h: 6,
    comments: [{ user: "PM·小 C", text: "动作与剧情不符，第二格人物应在跑而不是站立", tags: ["剧情问题"], time: ago(20 * 60 * 1000), action: "rejected" }],
  },
  // 2 claimed (rejected + 被认领准备重做)
  {
    f: "8.jpg", filename: "L3_demo_08.jpg", uploader: "设计·小 A", status: "rejected",
    reviewed_by: "PM·小 C", reject_reason: "色彩对比度不够，主体不突出",
    tags: ["色彩/文字问题"], claimed_by: "设计·小 A", claimed_at: ago(10 * 60 * 1000), h: 7,
    comments: [
      { user: "PM·小 C", text: "色彩对比度不够，主体不突出", tags: ["色彩/文字问题"], time: ago(40 * 60 * 1000), action: "rejected" },
      { user: "设计·小 A", text: "我来改！", type: "claim", time: ago(10 * 60 * 1000) },
    ],
  },
  {
    f: "9.jpg", filename: "L3_demo_09_封底.jpg", uploader: "设计·小 B", status: "rejected",
    reviewed_by: "PM·小 C", reject_reason: "封底缺少品牌 logo",
    tags: ["形象/场景问题"], claimed_by: "设计·小 B", claimed_at: ago(5 * 60 * 1000), h: 8,
    comments: [
      { user: "PM·小 C", text: "封底缺少品牌 logo", tags: ["形象/场景问题"], time: ago(35 * 60 * 1000), action: "rejected" },
      { user: "设计·小 B", text: "我来改！", type: "claim", time: ago(5 * 60 * 1000) },
    ],
  },
];

const TABLES = {
  projects: seedProjects.map((p) => ({ ...p })),
  images: seedImages.map((s, i) => ({
    id: "img-" + (i + 1),
    project_id: PROJ_ID,
    url: SAMPLE_BASE + s.f,
    storage_path: "demo/" + s.f,
    filename: s.filename,
    uploader: s.uploader,
    status: s.status,
    tags: s.tags || [],
    comments: s.comments || [],
    reject_reason: s.reject_reason || "",
    reviewed_by: s.reviewed_by || null,
    replaced_by: null,
    claimed_by: s.claimed_by || null,
    claimed_at: s.claimed_at || null,
    file_hash: "demo-hash-" + (i + 1),
    created_at: ago(s.h * 3600 * 1000),
    updated_at: ago(s.h * 3600 * 1000),
  })),
  notifications: [],
};

// realtime 订阅模拟：每张表维护 listener 列表，CRUD 后回调
const listeners = {};
function emit(table, event, row, old) {
  (listeners[table] || []).forEach(({ event: e, cb }) => {
    if (e === "*" || e === event) {
      try { cb({ eventType: event, new: row, old: old || null }); } catch {}
    }
  });
}

function matchFilters(row, filters) {
  for (const f of filters) {
    if (f.op === "eq" && row[f.col] !== f.val) return false;
    if (f.op === "neq" && row[f.col] === f.val) return false;
    if (f.op === "gt" && !(row[f.col] > f.val)) return false;
    if (f.op === "is") {
      if (f.val === null) { if (row[f.col] != null) return false; }
      else if (row[f.col] !== f.val) return false;
    }
  }
  return true;
}

function pickCols(row, cols) {
  if (!cols || cols === "*") return { ...row };
  const out = {};
  cols.split(",").map((c) => c.trim()).forEach((c) => { out[c] = row[c]; });
  return out;
}

const uuid = () => "demo-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

class QB {
  constructor(table) {
    this.table = table;
    this._cols = "*";
    this._filters = [];
    this._order = null;
    this._limit = null;
    this._range = null;
    this._single = false;
    this._action = "select";
    this._values = null;
  }
  select(cols) { this._cols = cols || "*"; this._action = "select"; return this; }
  order(col, opt) { this._order = { col, asc: !!(opt && opt.ascending) }; return this; }
  eq(col, val) { this._filters.push({ op: "eq", col, val }); return this; }
  neq(col, val) { this._filters.push({ op: "neq", col, val }); return this; }
  gt(col, val) { this._filters.push({ op: "gt", col, val }); return this; }
  is(col, val) { this._filters.push({ op: "is", col, val }); return this; }
  limit(n) { this._limit = n; return this; }
  range(from, to) { this._range = { from, to }; return this; }
  maybeSingle() { this._single = true; return this; }
  insert(values) { this._action = "insert"; this._values = values; return this; }
  update(values) { this._action = "update"; this._values = values; return this; }
  delete() { this._action = "delete"; return this; }

  _exec() {
    const tbl = TABLES[this.table] || (TABLES[this.table] = []);

    if (this._action === "select") {
      let rows = tbl.filter((r) => matchFilters(r, this._filters));
      if (this._order) {
        const { col, asc } = this._order;
        rows.sort((a, b) => {
          const va = a[col], vb = b[col];
          if (va == null && vb == null) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          return asc ? (va > vb ? 1 : va < vb ? -1 : 0) : (va < vb ? 1 : va > vb ? -1 : 0);
        });
      }
      if (this._range) rows = rows.slice(this._range.from, this._range.to + 1);
      else if (this._limit != null) rows = rows.slice(0, this._limit);
      rows = rows.map((r) => pickCols(r, this._cols));
      if (this._single) return { data: rows[0] || null, error: null };
      return { data: rows, error: null };
    }

    if (this._action === "insert") {
      const arr = Array.isArray(this._values) ? this._values : [this._values];
      const inserted = arr.map((v) => {
        const row = { id: v.id || uuid(), ...v };
        tbl.push(row);
        return row;
      });
      inserted.forEach((r) => emit(this.table, "INSERT", r));
      return { data: inserted, error: null };
    }

    if (this._action === "update") {
      const matched = tbl.filter((r) => matchFilters(r, this._filters));
      const updated = matched.map((r) => {
        const old = { ...r };
        Object.assign(r, this._values);
        emit(this.table, "UPDATE", r, old);
        return r;
      });
      return { data: updated, error: null };
    }

    if (this._action === "delete") {
      const matched = tbl.filter((r) => matchFilters(r, this._filters));
      matched.forEach((r) => {
        const idx = tbl.indexOf(r);
        if (idx >= 0) tbl.splice(idx, 1);
        emit(this.table, "DELETE", null, r);
      });
      return { data: matched, error: null };
    }

    return { data: null, error: new Error("unsupported: " + this._action) };
  }

  then(resolve) {
    try { resolve(this._exec()); }
    catch (e) { resolve({ data: null, error: e }); }
  }
}

class Channel {
  constructor(name) { this.name = name; this._subs = []; }
  on(_type, filter, cb) {
    const table = filter && filter.table;
    const event = (filter && filter.event) || "*";
    if (!listeners[table]) listeners[table] = [];
    const entry = { event, cb };
    listeners[table].push(entry);
    this._subs.push({ table, entry });
    return this;
  }
  subscribe(cb) { if (cb) cb("SUBSCRIBED"); return this; }
  unsubscribe() {
    this._subs.forEach(({ table, entry }) => {
      const list = listeners[table] || [];
      const i = list.indexOf(entry);
      if (i >= 0) list.splice(i, 1);
    });
  }
}

class StorageBucket {
  constructor(name) { this.name = name; }
  async upload() { return { data: { path: "demo" }, error: null }; }
  getPublicUrl(path) { return { data: { publicUrl: SAMPLE_BASE + path } }; }
}

export function createClient() {
  return {
    from: (table) => new QB(table),
    channel: (name) => new Channel(name),
    storage: { from: (b) => new StorageBucket(b) },
  };
}

// 拦截 Cloudinary 上传 fetch：换成本地 blob URL，不消耗云端额度
const _origFetch = window.fetch.bind(window);
window.fetch = function patchedFetch(input, init) {
  const urlStr = typeof input === "string" ? input : (input && input.url) || "";
  if (urlStr.indexOf("api.cloudinary.com") !== -1 && init && init.method === "POST") {
    const fd = init.body;
    let file = null;
    if (fd && typeof fd.get === "function") file = fd.get("file");
    if (file && file instanceof Blob) {
      const localUrl = URL.createObjectURL(file);
      const fakeId = "demo/" + Date.now() + "_" + (file.name || "upload");
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ secure_url: localUrl, public_id: fakeId }),
        text: async () => JSON.stringify({ secure_url: localUrl, public_id: fakeId }),
      });
    }
  }
  return _origFetch(input, init);
};

// 给浏览器控制台留个调试入口
window.__demoStore = TABLES;
