/** Pure helper — keep out of recharts bundle for StatCard. */
export function sparkFromTrend(trend = 0, points = 12): number[] {
  const base = 40;
  const direction = trend >= 0 ? 1 : -1;
  const volatility = Math.min(Math.abs(trend) / 4, 8);
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i * 0.9) * volatility;
    const climb = (i / (points - 1)) * direction * (8 + Math.abs(trend) / 5);
    return Math.max(8, base + wave + climb + ((i * 7) % 5));
  });
}
