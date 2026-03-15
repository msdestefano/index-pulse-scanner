function scoreFromFeatures(snapshot) {
  const { breakout, momentum, range } = snapshot;

  let score = 0;
  let tags = [];

  if (breakout.breakoutPrevHigh || breakout.breakoutORHigh || breakout.breakoutVWAP) {
    score += 25;
    tags.push("breakout_up");
  }
  if (breakout.breakoutPrevLow || breakout.breakoutORLow) {
    score += 25;
    tags.push("breakout_down");
  }

  if (momentum.rocShort > 0.01 && momentum.rsiShort > 60) {
    score += 25;
    tags.push("strong_momentum_up");
  } else if (momentum.rocShort < -0.01 && momentum.rsiShort < 40) {
    score += 25;
    tags.push("strong_momentum_down");
  }

  if (range.rangeVsAvg > 1.5) {
    score += 25;
    tags.push("range_expansion");
  }

  if (score > 100) score = 100;

  let bias = "mixed";
  if (tags.includes("breakout_up") || tags.includes("strong_momentum_up")) {
    bias = "historically_bullish_like";
  }
  if (tags.includes("breakout_down") || tags.includes("strong_momentum_down")) {
    bias = "historically_bearish_like";
  }

  return {
    score,
    bias,
    tags
  };
}

module.exports = {
  scoreFromFeatures
};
