import { createQuickReport, quickReportIssue } from "../src/domain/reports.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyMetrics,
  emptyStore,
  type Analysis,
} from "../src/domain/model.ts";
import {
  calculate,
  aggregate,
  businessCalculate,
  delta,
} from "../src/domain/metrics.ts";
import {
  importCSV,
  templateCSV,
  exportCSV,
  parseCSV,
  fingerprint,
  csvCell,
} from "../src/domain/csv.ts";
import {
  validateStore,
  validateAnalysis,
  validDate,
} from "../src/domain/validation.ts";
const metrics = {
  ...emptyMetrics(),
  likes: 240,
  comments: 45,
  shares: 15,
  views: 8000,
};
function row(p: Partial<Analysis> = {}): Analysis {
  return {
    id: "a",
    accountId: "",
    campaignId: "",
    title: "Test",
    postId: "p1",
    platform: "tiktok",
    method: "tt-views",
    methodVersion: 1,
    start: "2026-09-01",
    end: "2026-09-01",
    capturedAt: "2026-09-02T00:00:00Z",
    mode: "post",
    scope: "organic",
    timing: "lifetime",
    format: "video",
    source: "Test",
    notes: "",
    metrics,
    goal: null,
    ...p,
  };
}
test("Engagement example is exactly 3.75%", () =>
  assert.equal(calculate("tt-views", metrics).value, 3.75));
test("Missing is not zero", () => {
  assert.equal(calculate("tt-views", { ...metrics, shares: null }).value, null);
  assert.equal(calculate("tt-views", { ...metrics, shares: 0 }).value, 3.5625);
});
test("Zero denominator, negatives, decimals and unsafe sums rejected", () => {
  for (const views of [0, -1, 0.5, Infinity])
    assert.equal(calculate("tt-views", { ...metrics, views }).value, null);
  assert.equal(
    calculate("tt-views", { ...metrics, likes: Number.MAX_SAFE_INTEGER }).value,
    null,
  );
});
test("Rates over 100 are not clipped", () =>
  assert.equal(calculate("tt-views", { ...metrics, views: 100 }).value, 300));
test("LinkedIn page clicks included and social separate", () => {
  const m = { ...metrics, impressions: 1000, clicks: 100 };
  assert.equal(calculate("li-page", m).value, 40);
  assert.equal(calculate("li-social", m).value, 30);
});
test("Instagram requires saves and correct denominator", () => {
  assert.equal(calculate("ig-reach", { ...metrics, reach: 1000 }).value, null);
  assert.equal(
    calculate("ig-reach", { ...metrics, reach: 1000, saves: 20 }).value,
    32,
  );
});
test("Weighted aggregation, no mean of percentages", () => {
  const a = row({
    metrics: { ...metrics, likes: 10, comments: 0, shares: 0, views: 100 },
  });
  const b = row({
    id: "b",
    postId: "p2",
    metrics: { ...metrics, likes: 90, comments: 0, shares: 0, views: 9000 },
  });
  assert.ok(Math.abs(aggregate([a, b]).value! - (100 / 9100) * 100) < 1e-9);
});
test("Incompatible groups and duplicate captures not summed", () => {
  assert.equal(
    aggregate([row(), row({ id: "b", scope: "paid", postId: "p2" })]).value,
    null,
  );
  assert.equal(aggregate([row(), row({ id: "b" })]).value, null);
});
test("Incomplete exclusion is symmetric with coverage", () => {
  const r = aggregate([
    row(),
    row({ id: "b", postId: "p2", metrics: { ...metrics, shares: null } }),
  ]);
  assert.equal(r.value, 3.75);
  assert.equal(r.count, 1);
  assert.equal(r.total, 2);
});
test("Period summaries not blindly summed", () =>
  assert.equal(
    aggregate([
      row({ mode: "period" }),
      row({ id: "b", postId: "p2", mode: "period" }),
    ]).value,
    null,
  ));
test("Follower rates use mean per post not total divided by followers", () => {
  const a = row({
    method: "tt-followers",
    metrics: { ...metrics, followers: 1000 },
  });
  const b = row({
    id: "b",
    postId: "p2",
    method: "tt-followers",
    metrics: { ...metrics, followers: 2000 },
  });
  assert.equal(aggregate([a, b]).value, 22.5);
});
test("Business exercise values and zero cases", () => {
  assert.equal(businessCalculate("conversion", [48, 1200]), 4);
  assert.equal(businessCalculate("cac", [1000, 500, 30]), 50);
  assert.equal(businessCalculate("roi", [966, 500]), 93.2);
  assert.equal(businessCalculate("roas", [1500, 500]), 3);
  assert.equal(businessCalculate("cpm", [50, 10000]), 5);
  assert.equal(businessCalculate("roi", [-50, 500]), -110.00000000000001);
  assert.equal(businessCalculate("cac", [100, 200, 0]), null);
  assert.equal(businessCalculate("clvm", [100, 2, 5, 50]), 500);
  assert.equal(businessCalculate("clvm", [100, 2, 5, 101]), null);
});
test("Percentage points and relative change", () => {
  assert.equal(delta(4, 3).points, 1);
  assert.ok(Math.abs(delta(4, 3).relative! - 100 / 3) < 1e-9);
  assert.equal(delta(4, 0).relative, null);
});
test("CSV quoted multiline, escaped quotes and semicolons", () => {
  assert.deepEqual(parseCSV('a,b\n"uno, dos","tres\ncuatro"'), [
    ["a", "b"],
    ["uno, dos", "tres\ncuatro"],
  ]);
  assert.deepEqual(parseCSV('a;b\n"un ""texto""";2'), [
    ["a", "b"],
    ['un "texto"', "2"],
  ]);
  assert.throws(() => parseCSV('a,b\n"oops'));
});
test("Template, roundtrip and import errors", () => {
  const r = importCSV(templateCSV, "acc", "batch");
  assert.equal(r.errors.length, 0);
  assert.equal(r.rows.length, 1);
  assert.equal(calculate(r.rows[0].method, r.rows[0].metrics).value, 3.75);
  const rt = importCSV(exportCSV([row()]), "acc", "b");
  assert.equal(rt.errors.length, 0);
  assert.equal(rt.rows[0].metrics.views, 8000);
  assert.throws(() => importCSV("a,b\n1,2", "", ""));
  assert.equal(
    importCSV(templateCSV.replace("8000", "8.000"), "", "").errors.length,
    1,
  );
});
test("CSV formula injection neutralized", () => {
  for (const s of ["=CMD()", "+x", "-1", "@x", " \t=bad"])
    assert.match(csvCell(s), /^"'/);
});
test("Dedup uses account and complete context", () => {
  assert.equal(fingerprint(row()), fingerprint(row({ id: "b" })));
  assert.notEqual(fingerprint(row()), fingerprint(row({ scope: "paid" })));
});
test("Backup rejects bad version, foreign keys and malformed metrics", () => {
  assert.equal(validateStore(emptyStore()).version, 1);
  assert.throws(() => validateStore({ ...emptyStore(), version: 2 }));
  assert.throws(() =>
    validateStore({
      ...emptyStore(),
      analyses: [row({ accountId: "missing" })],
    }),
  );
  assert.throws(() =>
    validateAnalysis(row({ metrics: { ...metrics, shares: -2 } })),
  );
  assert.throws(() => validateAnalysis(row({ start: "2026-02-30" })));
  assert.throws(() =>
    validateAnalysis(row({ method: "tt-followers", mode: "period" })),
  );
  assert.equal(validDate("2026-02-30"), false);
});

test("Quick report exports a complete draft without saving a client or changing its data", () => {
  const store = emptyStore();
  const analysis = row({
    title: "",
    source: "",
    notes: "Revisar próximos contenidos",
    goal: 5,
  });
  const before = structuredClone({ store, analysis });
  const report = createQuickReport(
    analysis,
    store,
    "Cliente de prueba",
    "2026-09-26T12:00:00Z",
  );
  assert.equal(report.clientName, "Cliente de prueba");
  assert.equal(report.title, "Informe de engagement · TikTok");
  assert.equal(report.rows[0].source, "Registro manual");
  assert.equal(report.rows[0].goal, 5);
  assert.equal(
    calculate(report.rows[0].method, report.rows[0].metrics).value,
    3.75,
  );
  report.rows[0].metrics.likes = 0;
  assert.deepEqual({ store, analysis }, before);
});

test("Quick report resolves the selected account and client", () => {
  const store = emptyStore();
  store.clients.push({
    id: "c",
    name: "Cliente A",
    sector: "Servicios",
    objective: "",
    archived: false,
  });
  store.accounts.push({
    id: "acct",
    clientId: "c",
    name: "@cliente",
    platform: "tiktok",
    type: "business",
    archived: false,
  });
  const report = createQuickReport(
    row({ accountId: "acct" }),
    store,
    "Otro nombre",
  );
  assert.equal(report.clientName, "Cliente A");
  assert.equal(report.rows[0].accountName, "@cliente");
  assert.equal(report.brand, store.settings.brand);
});

test("Quick export blocks incomplete metrics, invalid dates and invalid goals", () => {
  for (const analysis of [
    row({ metrics: { ...metrics, likes: null } }),
    row({ metrics: { ...metrics, views: 0 } }),
    row({ end: "2026-08-01" }),
    row({ start: "2026-02-30" }),
    row({ goal: 0 }),
    row({ goal: Infinity }),
  ]) {
    assert.ok(quickReportIssue(analysis));
    assert.throws(() => createQuickReport(analysis, emptyStore()));
  }
  assert.equal(quickReportIssue(row()), null);
});

test("Business calculations reject overflow instead of exporting Infinity", () => {
  assert.equal(businessCalculate("clv", [Number.MAX_VALUE, 12, 5]), null);
  assert.equal(
    businessCalculate("roi", [Number.MAX_VALUE, Number.MIN_VALUE]),
    null,
  );
  assert.equal(businessCalculate("roi", [966, 500]), 93.2);
});
