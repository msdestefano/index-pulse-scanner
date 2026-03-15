const express = require("express");
const cors = require("cors");
const path = require("path");

const { UNIVERSE } = require("./engine/universe");
const { buildFeatureSnapshot } = require("./engine/features");
const { scoreFromFeatures } = require("./engine/scoring");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let latestSignals = [];

const MIN_SCORE = 60;

const SCAN_INTERVAL_MS = process.env.SCAN_INTERVAL_MS
  ? parseInt(process.env.SCAN_INTERVAL_MS, 10)
  : 30_000;

function runScan() {
  const now = new Date();
  const signals = UNIVERSE.map((t) => {
    const snapshot = buildFeatureSnapshot(t.symbol);
    const scoring = scoreFromFeatures(snapshot);

    return {
      symbol: t.symbol,
      index: t.index,
      timestamp: now.toISOString(),
      score: scoring.score,
      bias: scoring.bias,
      tags: scoring.tags,
      breakout: snapshot.breakout,
      momentum: snapshot.momentum,
      range: snapshot.range
    };
  }).filter((s) => s.score >= MIN_SCORE);

  latestSignals = signals;
  console.log(`[SCAN] ${now.toISOString()} - signals: ${signals.length}`);
}

runScan();
setInterval(runScan, SCAN_INTERVAL_MS);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/signals", (req, res) => {
  res.json({
    updatedAt: new Date().toISOString(),
    minScore: MIN_SCORE,
    signals: latestSignals
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Scanner server running on http://localhost:${PORT}`);
});
