function simulateBar(prevClose) {
  const change = (Math.random() - 0.5) * 0.01;
  const close = prevClose * (1 + change);
  const high = Math.max(prevClose, close) * (1 + Math.random() * 0.002);
  const low = Math.min(prevClose, close) * (1 - Math.random() * 0.002);
  const volume = 100000 + Math.floor(Math.random() * 200000);
  return { open: prevClose, high, low, close, volume };
}

function computeBreakoutFeatures(bar, prevDayHigh, prevDayLow, openingRangeHigh, openingRangeLow, vwap) {
  const { close } = bar;
  return {
    breakoutPrevHigh: close > prevDayHigh,
    breakoutPrevLow: close < prevDayLow,
    breakoutORHigh: close > openingRangeHigh,
    breakoutORLow: close < openingRangeLow,
    breakoutVWAP: close > vwap,
    distanceFromPrevHigh: (close - prevDayHigh) / prevDayHigh,
    distanceFromPrevLow: (prevDayLow - close) / prevDayLow
  };
}

function computeMomentumFeatures(recentCloses) {
  if (recentCloses.length < 5) {
    return {
      rocShort: 0,
      rsiShort: 50
    };
  }

  const last = recentCloses[recentCloses.length - 1];
  const prev = recentCloses[recentCloses.length - 5];
  const rocShort = (last - prev) / prev;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i < recentCloses.length; i++) {
    const diff = recentCloses[i] - recentCloses[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const rs = losses === 0 ? 1 : gains / losses;
  const rsiShort = 100 - 100 / (1 + rs);

  return {
    rocShort,
    rsiShort
  };
}

function computeRangeFeatures(bar, avgTrueRange) {
  const trueRange = bar.high - bar.low;
  const rangeVsAvg = avgTrueRange > 0 ? trueRange / avgTrueRange : 1;
  return {
    trueRange,
    rangeVsAvg
  };
}

function buildFeatureSnapshot(symbol) {
  const prevClose = 100 + Math.random() * 50;
  const bar = simulateBar(prevClose);

  const prevDayHigh = prevClose * 1.01;
  const prevDayLow = prevClose * 0.99;
  const openingRangeHigh = prevClose * 1.005;
  const openingRangeLow = prevClose * 0.995;
  const vwap = prevClose;

  const recentCloses = Array.from({ length: 10 }).map(
    () => prevClose * (1 + (Math.random() - 0.5) * 0.01)
  );
  recentCloses[recentCloses.length - 1] = bar.close;

  const avgTrueRange = (prevDayHigh - prevDayLow) * 0.6;

  const breakout = computeBreakoutFeatures(
    bar,
    prevDayHigh,
    prevDayLow,
    openingRangeHigh,
    openingRangeLow,
    vwap
  );
  const momentum = computeMomentumFeatures(recentCloses);
  const range = computeRangeFeatures(bar, avgTrueRange);

  return {
    symbol,
    bar,
    breakout,
    momentum,
    range
  };
}

module.exports = {
  buildFeatureSnapshot
};
