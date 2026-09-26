import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseScreenshotCount,
  mapScreenshot,
  reviewedMetrics,
} from "../src/domain/screenshot.ts";
import { analysisInsights } from "../src/domain/insights.ts";
import {
  emptyMetrics,
  emptyStore,
  type Analysis,
} from "../src/domain/model.ts";
import { createQuickReport, quickReportIssue } from "../src/domain/reports.ts";
const lines = (...text: string[]) =>
  text.map((text) => ({ text, confidence: 95 }));
const analysis: Analysis = {
  id: "test",
  accountId: "",
  campaignId: "",
  title: "Captura revisada",
  postId: "",
  platform: "instagram",
  method: "ig-reach",
  methodVersion: 1,
  start: "2026-09-01",
  end: "2026-09-26",
  capturedAt: "2026-09-26T12:00:00Z",
  mode: "period",
  scope: "mixed",
  timing: "activity",
  format: "post",
  source: "Captura",
  notes: "",
  metrics: {
    ...emptyMetrics(),
    likes: 240,
    comments: 45,
    shares: 15,
    saves: 20,
    reach: 8000,
  },
  goal: 5,
};
test("OCR counts distinguish separators, abbreviations and percentages", () => {
  for (const text of ["8.000", "8,000", "8 000", "8000"])
    assert.deepEqual(parseScreenshotCount(text), {
      value: 8000,
      approximate: false,
    });
  assert.deepEqual(parseScreenshotCount("1,2 mil"), {
    value: 1200,
    approximate: true,
  });
  assert.deepEqual(parseScreenshotCount("2.5M"), {
    value: 2500000,
    approximate: true,
  });
  for (const text of [
    "+23%",
    "-20",
    "3,75",
    "20 seguidores",
    "1.23.45",
    "12:30",
    "2026-09-26",
    "9999999999999999999",
  ])
    assert.equal(parseScreenshotCount(text), null, text);
  assert.deepEqual(parseScreenshotCount("0"), { value: 0, approximate: false });
});
test("Map Instagram labels without substituting reach, views or totals", () => {
  const c = mapScreenshot(
    lines(
      "Visualizaciones 10.000",
      "Cuentas alcanzadas 8.000",
      "Me gusta 240",
      "Comentarios 45",
      "Compartidos 15",
      "Guardados 20",
      "Interacciones 320",
      "Nuevos seguidores 300",
      "No seguidores 55%",
    ),
  );
  const values = Object.fromEntries(c.map((x) => [x.field, x.value]));
  assert.equal(values.views, 10000);
  assert.equal(values.reach, 8000);
  assert.equal(values.likes, 240);
  assert.equal(values.followers, null);
});
test("OCR conflicts, low confidence and neighboring ambiguity remain unresolved", () => {
  assert.equal(
    mapScreenshot(lines("Me gusta 50", "Me gusta 70")).find(
      (c) => c.field === "likes",
    )?.value,
    null,
  );
  assert.equal(
    mapScreenshot([{ text: "Likes 999", confidence: 30 }]).find(
      (c) => c.field === "likes",
    )?.value,
    null,
  );
  assert.equal(
    mapScreenshot(lines("120", "Guardados", "30")).find(
      (c) => c.field === "saves",
    )?.value,
    null,
  );
  assert.equal(
    mapScreenshot(lines("Guardados", "0")).find((c) => c.field === "saves")
      ?.value,
    0,
  );
});
test("Manual review preserves null and rejects invalid inputs", () => {
  const m = reviewedMetrics({ likes: "0", comments: "", reach: "8000" });
  assert.equal(m.likes, 0);
  assert.equal(m.comments, null);
  assert.equal(m.reach, 8000);
  for (const likes of ["-1", "1.5", "2,000", "Infinity"])
    assert.throws(() => reviewedMetrics({ likes }));
});
test("Partial report retains observed metrics without inventing engagement", () => {
  const a = {
    ...analysis,
    metrics: { ...emptyMetrics(), views: 10000, reach: 8000 },
  };
  assert.ok(quickReportIssue(a));
  assert.equal(quickReportIssue(a, true), null);
  const report = createQuickReport(a, emptyStore(), "Cliente", undefined, true);
  assert.equal(report.rows[0].metrics.likes, null);
  assert.equal(report.rows[0].metrics.views, 10000);
  assert.ok(analysisInsights(a).facts[0].includes("no es calculable"));
  assert.ok(quickReportIssue({ ...a, metrics: emptyMetrics() }, true));
  assert.throws(() =>
    createQuickReport(
      { ...a, metrics: { ...a.metrics, reach: -1 } },
      emptyStore(),
      "Cliente",
      undefined,
      true,
    ),
  );
});
test("Report interpretation uses real interactions and personal goals", () => {
  const insight = analysisInsights(analysis);
  assert.ok(insight.facts[0].includes("4,00 %"));
  assert.ok(insight.facts[1].includes("-1,00 puntos"));
  assert.equal(
    insight.distribution.reduce((s, item) => s + item.value!, 0),
    320,
  );
  const zero = analysisInsights({
    ...analysis,
    metrics: {
      ...analysis.metrics,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    },
  });
  assert.ok(zero.facts[0].includes("0,00 %"));
  assert.equal(
    zero.facts.some((f) => f.includes("mayor conteo")),
    false,
  );
});
