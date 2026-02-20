// Basic linear regression for prediction
export const generatePredictions = (
  data: { x: number; y: number }[],
  futurePoints: number
) => {
  if (data.length < 2) {
    return []; // Not enough data to predict
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  const n = data.length;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions = [];
  const lastX = data[data.length - 1].x;

  for (let i = 1; i <= futurePoints; i++) {
    const futureX = lastX + i;
    const predictedY = slope * futureX + intercept;
    predictions.push({ x: futureX, y: Math.max(0, predictedY) }); // Ensure non-negative predictions
  }

  return predictions;
};
