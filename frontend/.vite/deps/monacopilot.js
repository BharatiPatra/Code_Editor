import "./chunk-V4OQ3NZ2.js";

// node_modules/@monacopilot/core/dist/index.mjs
var E = `

`;
var m = ["mistral"];
var O = { codestral: "codestral-latest" };
var l = { mistral: ["codestral"] };
var v = { mistral: "https://api.mistral.ai/v1/fim/completions" };
var a = class {
};
var p = class extends a {
  createEndpoint() {
    return v.mistral;
  }
  createRequestBody(t, o, r) {
    return { model: O[t], prompt: `${o.context}
${o.instruction}
${r.textBeforeCursor}`, suffix: r.textAfterCursor, stream: false, top_p: 0.1, temperature: 0.1, max_tokens: 256, stop: E };
  }
  createHeaders(t) {
    return { "Content-Type": "application/json", Authorization: `Bearer ${t}` };
  }
  parseCompletion(t) {
    var _a, _b;
    let o = (_b = (_a = t.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message.content;
    return o ? Array.isArray(o) ? o.filter((r) => "text" in r).map((r) => r.text).join("") : o : null;
  }
};
var d = { mistral: new p() };
var R = (e, t, o) => d[o].createEndpoint(e, t);
var x = (e, t, o, r) => d[t].createRequestBody(e, o, r);
var T = (e, t) => d[t].createHeaders(e);
var D = (e, t) => d[t].parseCompletion(e);
var c = "\x1B[0m";
var P = "\x1B[1m";
var A = (e) => e instanceof Error ? e.message : typeof e == "string" ? e : "An unknown error occurred";
var I = (e) => {
  let t = A(e), o = `${P}[MONACOPILOT ERROR] ${t}${c}`;
  return console.error(o), { message: t };
};
var k = (e, t) => {
  console.warn(`${P}[MONACOPILOT WARN] ${e}${t ? `
${A(t)}` : ""}${c}`);
};
var L = (e, t, o) => console.warn(`${P}[MONACOPILOT DEPRECATED] "${e}" is deprecated${o ? ` in ${o}` : ""}. Please use "${t}" instead. It will be removed in a future version.${c}`);
var w = { report: I, warn: k, warnDeprecated: L };
var _ = async (e, t = {}, o = 2e4) => {
  let r = new AbortController(), { signal: s } = r, n = setTimeout(() => {
    r.abort();
  }, o);
  try {
    return await fetch(e, { ...t, signal: s });
  } catch (i) {
    throw i instanceof DOMException && i.name === "AbortError" ? new Error(`Request timed out after ${o}ms`) : i;
  } finally {
    clearTimeout(n);
  }
};
var u = (e) => !e || e.length === 0 ? "" : e.length === 1 ? e[0] : `${e.slice(0, -1).join(", ")} and ${e.slice(-1)}`;
var $ = (e, t) => {
  if (!e && typeof t.model != "function") throw new Error(t.provider ? `Please provide the ${t.provider} API key.` : "Please provide an API key.");
  if (!t || typeof t == "object" && Object.keys(t).length === 0) throw new Error('Please provide required Copilot options, such as "model" and "provider".');
};
var B = (e, t) => {
  if (typeof e == "function" && t !== void 0) throw new Error("Provider should not be specified when using a custom model.");
  if (typeof e != "function" && (!t || !m.includes(t))) throw new Error(`Provider must be specified and supported when using built-in models. Please choose from: ${u(m)}`);
  if (typeof e == "string" && t !== void 0 && !l[t].includes(e)) throw new Error(`Model "${e}" is not supported by the "${t}" provider. Supported models: ${u(l[t])}`);
};
var f = { params: $, inputs: B };
var C = class {
  constructor(t, o) {
    f.params(t, o), this.apiKey = t ?? "", this.provider = o.provider, this.model = o.model, f.inputs(this.model, this.provider);
  }
  generatePrompt(t, o) {
    let r = this.getDefaultPrompt(t);
    return o ? { ...r, ...o(t) } : r;
  }
  async makeAIRequest(t, o = {}) {
    try {
      let r = this.generatePrompt(t, o.customPrompt);
      if (this.isCustomModel()) return this.model(r);
      {
        let { customHeaders: s = {} } = o, n = await this.prepareRequest(r, t), i = await this.sendRequest(n.endpoint, n.requestBody, { ...n.headers, ...s });
        return this.processResponse(i);
      }
    } catch (r) {
      return this.handleError(r);
    }
  }
  async prepareRequest(t, o) {
    if (!this.provider) throw new Error("Provider is required for non-custom models");
    return { endpoint: R(this.model, this.apiKey, this.provider), headers: T(this.apiKey, this.provider), requestBody: x(this.model, this.provider, t, o) };
  }
  processResponse(t) {
    if (!this.provider) throw new Error("Provider is required for non-custom models");
    return { text: D(t, this.provider), raw: t };
  }
  isCustomModel() {
    return typeof this.model == "function";
  }
  async sendRequest(t, o, r) {
    let s = await _(t, { method: "POST", headers: { "Content-Type": "application/json", ...r }, body: JSON.stringify(o) });
    if (!s.ok) throw new Error(await s.text());
    return s.json();
  }
  handleError(t) {
    return { text: null, error: w.report(t).message };
  }
};

// node_modules/monacopilot/dist/index.mjs
var B2 = (n) => !n || n.length === 0 ? "" : n.length === 1 ? n[0] : `${n.slice(0, -1).join(", ")} and ${n.slice(-1)}`;
var w2 = (n, e, t = {}) => {
  if (e <= 0) return "";
  let o = n.split(`
`), r = o.length;
  if (e >= r) return n;
  if (t.truncateDirection === "keepEnd") {
    let s = o.slice(-e);
    return s.every((a2) => a2 === "") ? `
`.repeat(e) : s.join(`
`);
  }
  let i = o.slice(0, e);
  return i.every((s) => s === "") ? `
`.repeat(e) : i.join(`
`);
};
var re = "<|developer_cursor_is_here|>";
var U = (n) => ({ instruction: ie(), context: se(n), fileContent: ae(n) });
var ie = () => "Provide concise and readable code completions that are syntactically and logically accurate, and seamlessly integrate with the existing context. Output only the raw code to be inserted at the cursor location without any additional text, comments, or text before or after the cursor.";
var se = (n) => {
  let { technologies: e = [], filename: t, relatedFiles: o = [], language: r } = n, i = B2([r, ...e].filter((l2) => !!l2)), s = o.length === 0 ? "" : o.map(({ path: l2, content: c2 }) => `### ${l2}
${c2}`).join(`

`), a2 = [i ? `Technology stack: ${i}` : "", `File: ${t || "unknown"}`].filter(Boolean).join(`
`);
  return `${s ? `${s}

` : ""}${a2}`;
};
var ae = (n) => {
  let { textBeforeCursor: e, textAfterCursor: t } = n;
  return `**Current code:**
\`\`\`
${e}${re}${t}
\`\`\``;
};
var T2 = class extends C {
  async complete(e) {
    let { body: t, options: o } = e, { customPrompt: r, headers: i } = o ?? {}, { completionMetadata: s } = t, { text: a2, raw: l2, error: c2 } = await this.makeAIRequest(s, { customPrompt: r, customHeaders: i });
    return { completion: a2, raw: l2, error: c2 };
  }
  getDefaultPrompt(e) {
    return U(e);
  }
};
var q = 100;
var K = true;
var v2 = "onIdle";
var V = true;
var H = 120;
var $2 = 400;
var W = 0;
var h = (n, e) => e.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: n.lineNumber, endColumn: n.column });
var z = (n, e) => e.getValueInRange({ startLineNumber: n.lineNumber, startColumn: n.column, endLineNumber: e.getLineCount(), endColumn: e.getLineMaxColumn(e.getLineCount()) });
var G = (n) => n.getValue();
var P2 = class {
  constructor(e) {
    this.capacity = e;
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.buffer = new Array(e);
  }
  enqueue(e) {
    let t;
    return this.size === this.capacity && (t = this.dequeue()), this.buffer[this.tail] = e, this.tail = (this.tail + 1) % this.capacity, this.size++, t;
  }
  dequeue() {
    if (this.size === 0) return;
    let e = this.buffer[this.head];
    return this.buffer[this.head] = void 0, this.head = (this.head + 1) % this.capacity, this.size--, e;
  }
  getAll() {
    return this.buffer.filter((e) => e !== void 0);
  }
  clear() {
    this.buffer = new Array(this.capacity), this.head = 0, this.tail = 0, this.size = 0;
  }
  getSize() {
    return this.size;
  }
  isEmpty() {
    return this.size === 0;
  }
  isFull() {
    return this.size === this.capacity;
  }
};
var L2 = class L3 {
  constructor() {
    this.cache = new P2(L3.MAX_CACHE_SIZE);
  }
  get(e, t) {
    return this.cache.getAll().filter((o) => this.isValidCacheItem(o, e, t));
  }
  add(e) {
    e.completion.trim() && this.cache.enqueue(e);
  }
  clear() {
    this.cache.clear();
  }
  isValidCacheItem(e, t, o) {
    let r = e.textBeforeCursor.trim(), i = h(t, o), s = i, a2 = o.getLineContent(t.lineNumber);
    if (t.column === a2.length + 1 && t.lineNumber < o.getLineCount()) {
      let c2 = o.getLineContent(t.lineNumber + 1);
      s = `${i}
${c2}`;
    }
    if (!(s.trim().includes(r) || r.includes(s.trim()))) return false;
    let l2 = o.getValueInRange(e.range);
    return this.isPartialMatch(l2, e.completion) ? this.isPositionValid(e, t) : false;
  }
  isPartialMatch(e, t) {
    let o = e.trim(), r = t.trim();
    return r.startsWith(o) || o.startsWith(r);
  }
  isPositionValid(e, t) {
    let { range: o } = e, { startLineNumber: r, startColumn: i, endLineNumber: s, endColumn: a2 } = o, { lineNumber: l2, column: c2 } = t;
    return l2 < r || l2 > s ? false : r === s ? c2 >= i - 1 && c2 <= a2 + 1 : l2 === r ? c2 >= i - 1 : l2 === s ? c2 <= a2 + 1 : true;
  }
};
L2.MAX_CACHE_SIZE = 20;
var M = L2;
var I2 = class {
  constructor(e) {
    this.formattedCompletion = "";
    this.formattedCompletion = e;
  }
  setCompletion(e) {
    return this.formattedCompletion = e, this;
  }
  removeInvalidLineBreaks() {
    return this.formattedCompletion = this.formattedCompletion.trimEnd(), this;
  }
  removeMarkdownCodeSyntax() {
    return this.formattedCompletion = this.removeMarkdownCodeBlocks(this.formattedCompletion), this;
  }
  removeMarkdownCodeBlocks(e) {
    let t = e.split(`
`), o = [], r = false;
    for (let i = 0; i < t.length; i++) {
      let s = t[i], a2 = s.trim().startsWith("```");
      if (a2 && !r) {
        r = true;
        continue;
      }
      if (a2 && r) {
        r = false;
        continue;
      }
      o.push(s);
    }
    return o.join(`
`);
  }
  removeExcessiveNewlines() {
    return this.formattedCompletion = this.formattedCompletion.replace(/\n{3,}/g, `

`), this;
  }
  build() {
    return this.formattedCompletion;
  }
};
var O2 = class {
  findOverlaps(e, t, o) {
    if (!e) return { startOverlapLength: 0, maxOverlapLength: 0 };
    let r = e.length, i = t.length, s = o.length, a2 = 0, l2 = 0, c2 = 0, m2 = Math.min(r, i);
    for (let p2 = 1; p2 <= m2; p2++) {
      let f2 = e.substring(0, p2), u2 = t.slice(-p2);
      f2 === u2 && (c2 = p2);
    }
    let g = Math.min(r, s);
    for (let p2 = 0; p2 < g && e[p2] === o[p2]; p2++) a2++;
    for (let p2 = 1; p2 <= g; p2++) e.slice(-p2) === o.slice(0, p2) && (l2 = p2);
    let d2 = Math.max(a2, l2);
    if (d2 === 0) {
      for (let p2 = 1; p2 < r; p2++) if (o.startsWith(e.substring(p2))) {
        d2 = r - p2;
        break;
      }
    }
    return { startOverlapLength: c2, maxOverlapLength: d2 };
  }
};
var A2 = class {
  constructor(e) {
    this.monaco = e;
    this.textOverlapCalculator = new O2();
  }
  computeInsertionRange(e, t, o) {
    if (!t) return this.createEmptyRange(e);
    let r = o.getOffsetAt(e), i = o.getValue().substring(0, r), s = o.getValue().substring(r);
    if (r >= o.getValue().length) return this.createEmptyRange(e);
    if (s.length === 0) return this.createEmptyRange(e);
    let { startOverlapLength: a2, maxOverlapLength: l2 } = this.textOverlapCalculator.findOverlaps(t, i, s), c2 = a2 > 0 ? o.getPositionAt(r - a2) : e, m2 = r + l2, g = o.getPositionAt(m2);
    return new this.monaco.Range(c2.lineNumber, c2.column, g.lineNumber, g.column);
  }
  computeCacheRange(e, t) {
    let o = e.lineNumber, r = e.column, i = t.split(`
`), s = i.length - 1, a2 = o + s, l2 = s === 0 ? r + i[0].length : i[s].length + 1;
    return new this.monaco.Range(o, r, a2, l2);
  }
  createEmptyRange(e) {
    return new this.monaco.Range(e.lineNumber, e.column, e.lineNumber, e.column);
  }
};
var X = async (n) => {
  let { endpoint: e, body: t } = n, o = await fetch(e, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
  if (!o.ok) throw new Error(`Error while fetching completion item: ${o.statusText}`);
  let { completion: r, error: i } = await o.json();
  if (i) throw new Error(i);
  return { completion: r };
};
var Y = ({ pos: n, mdl: e, options: t }) => {
  let { filename: o, language: r, technologies: i, relatedFiles: s, maxContextLines: a2 = q } = t, c2 = s && s.length > 0 ? 3 : 2, m2 = a2 ? Math.floor(a2 / c2) : void 0, g = (C2, E2, F) => {
    let b = C2(n, e);
    return E2 ? w2(b, E2, F) : b;
  }, d2 = (C2, E2) => !C2 || !E2 ? C2 : C2.map(({ content: F, ...b }) => ({ ...b, content: w2(F, E2) })), p2 = g(h, m2, { truncateDirection: "keepEnd" }), f2 = g(z, m2, { truncateDirection: "keepStart" }), u2 = d2(s, m2);
  return { filename: o, language: r, technologies: i, relatedFiles: u2, textBeforeCursor: p2, textAfterCursor: f2, cursorPosition: n };
};
var Z = (n, e = 300) => {
  let t = null, o = null, r = (...i) => {
    if (o) return o.args = i, o.promise;
    let s, a2, l2 = new Promise((c2, m2) => {
      s = c2, a2 = m2;
    });
    return o = { args: i, promise: l2, resolve: s, reject: a2 }, t && (clearTimeout(t), t = null), t = setTimeout(async () => {
      let c2 = o;
      if (c2) {
        o = null, t = null;
        try {
          let m2 = await n(...c2.args);
          c2.resolve(m2);
        } catch (m2) {
          c2.reject(m2);
        }
      }
    }, e), l2;
  };
  return r.cancel = () => {
    t && (clearTimeout(t), t = null), o && (o.reject(new Error("Cancelled")), o = null);
  }, r;
};
var J = (n) => typeof n == "string" ? n === "Cancelled" || n === "AbortError" : n instanceof Error ? n.message === "Cancelled" || n.name === "AbortError" : false;
var y = (n) => ({ items: n, enableForwardStability: true });
var S = new M();
var Q = async ({ monaco: n, mdl: e, pos: t, token: o, isCompletionAccepted: r, options: i }) => {
  let { trigger: s = v2, endpoint: a2, enableCaching: l2 = K, allowFollowUpCompletions: c2 = V, onError: m2, requestHandler: g } = i;
  if (l2 && !r) {
    let d2 = S.get(t, e).map((p2) => ({ insertText: p2.completion, range: p2.range }));
    if (d2.length > 0) return y(d2);
  }
  if (o.isCancellationRequested || !c2 && r) return y([]);
  try {
    let d2 = Z(async (u2) => {
      var _a, _b;
      (_a = i.onCompletionRequested) == null ? void 0 : _a.call(i, u2);
      let C2 = await ((g == null ? void 0 : g(u2)) ?? X(u2));
      return (_b = i.onCompletionRequestFinished) == null ? void 0 : _b.call(i, u2, C2), C2;
    }, { onTyping: H, onIdle: $2, onDemand: W }[s]);
    o.onCancellationRequested(() => {
      d2.cancel();
    });
    let p2 = Y({ pos: t, mdl: e, options: i }), { completion: f2 } = await d2({ endpoint: a2, body: { completionMetadata: p2 } });
    if (f2) {
      let u2 = new I2(f2).removeMarkdownCodeSyntax().removeExcessiveNewlines().removeInvalidLineBreaks().build(), C2 = new A2(n);
      return l2 && S.add({ completion: u2, range: C2.computeCacheRange(t, u2), textBeforeCursor: h(t, e) }), y([{ insertText: u2, range: C2.computeInsertionRange(t, u2, e) }]);
    }
  } catch (d2) {
    if (J(d2)) return y([]);
    m2 ? m2(d2) : w.warn("Cannot provide completion", d2);
  }
  return y([]);
};
var D2 = /* @__PURE__ */ new WeakMap();
var R2 = (n) => D2.get(n);
var ee = (n, e) => {
  D2.set(n, e);
};
var N = (n) => {
  D2.delete(n);
};
var te = () => ({ isCompletionAccepted: false, isCompletionVisible: false, isExplicitlyTriggered: false, hasRejectedCurrentCompletion: false });
var oe = (n, e, t) => {
  let o = R2(e);
  return o ? n.languages.registerInlineCompletionsProvider(t.language, { provideInlineCompletions: (r, i, s, a2) => {
    if (!(t.trigger === "onDemand" && !o.isExplicitlyTriggered || t.triggerIf && !t.triggerIf({ text: G(e), position: i, triggerType: t.trigger ?? v2 }))) return Q({ monaco: n, mdl: r, pos: i, token: a2, isCompletionAccepted: o.isCompletionAccepted, options: t });
  }, handleItemDidShow: (r, i, s) => {
    var _a;
    o.isExplicitlyTriggered = false, o.hasRejectedCurrentCompletion = false, !o.isCompletionAccepted && (o.isCompletionVisible = true, (_a = t.onCompletionShown) == null ? void 0 : _a.call(t, s, i.range));
  }, freeInlineCompletions: () => {
  } }) : null;
};
var ce = { TAB: (n, e) => e.keyCode === n.KeyCode.Tab, CMD_RIGHT_ARROW: (n, e) => e.keyCode === n.KeyCode.RightArrow && e.metaKey };
var _2 = class {
  constructor(e, t, o) {
    this.monaco = e;
    this.state = t;
    this.options = o;
  }
  handleKeyEvent(e) {
    let t = { monaco: this.monaco, event: e, state: this.state, options: this.options };
    this.handleCompletionAcceptance(t), this.handleCompletionRejection(t);
  }
  handleCompletionAcceptance(e) {
    var _a, _b;
    return e.state.isCompletionVisible && this.isAcceptanceKey(e.event) ? ((_b = (_a = e.options).onCompletionAccepted) == null ? void 0 : _b.call(_a), e.state.isCompletionAccepted = true, e.state.isCompletionVisible = false, true) : (e.state.isCompletionAccepted = false, false);
  }
  handleCompletionRejection(e) {
    var _a, _b;
    return this.shouldRejectCompletion(e) ? ((_b = (_a = e.options).onCompletionRejected) == null ? void 0 : _b.call(_a), e.state.hasRejectedCurrentCompletion = true, true) : false;
  }
  shouldRejectCompletion(e) {
    return e.state.isCompletionVisible && !e.state.hasRejectedCurrentCompletion && !e.state.isCompletionAccepted && !this.isAcceptanceKey(e.event);
  }
  isAcceptanceKey(e) {
    return Object.values(ce).some((t) => t(this.monaco, e));
  }
};
var ne = (n, e, t, o) => {
  let r = new _2(n, t, o);
  return e.onKeyDown((i) => r.handleKeyEvent(i));
};
var x2 = null;
var me = (n, e, t) => {
  x2 && x2.deregister();
  let o = [];
  ee(e, te()), e.updateOptions({ inlineSuggest: { enabled: true } });
  try {
    let r = R2(e);
    if (!r) return w.warn("Completion is not registered properly. State not found."), ue();
    let i = oe(n, e, t);
    i && o.push(i);
    let s = ne(n, e, r, t);
    o.push(s);
    let a2 = { deregister: () => {
      for (let l2 of o) l2.dispose();
      S.clear(), N(e), x2 = null;
    }, trigger: () => de(e) };
    return x2 = a2, a2;
  } catch (r) {
    return t.onError ? t.onError(r) : w.report(r), { deregister: () => {
      for (let i of o) i.dispose();
      N(e), x2 = null;
    }, trigger: () => {
    } };
  }
};
var de = (n) => {
  let e = R2(n);
  if (!e) {
    w.warn("Completion is not registered. Use `registerCompletion` to register completion first.");
    return;
  }
  e.isExplicitlyTriggered = true, n.trigger("keyboard", "editor.action.inlineSuggest.trigger", {});
};
var ue = () => ({ deregister: () => {
}, trigger: () => {
} });
var ut = T2;
export {
  T2 as CompletionCopilot,
  ut as Copilot,
  me as registerCompletion
};
//# sourceMappingURL=monacopilot.js.map
