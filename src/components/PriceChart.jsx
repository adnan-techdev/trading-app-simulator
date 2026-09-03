import { usePriceFeed } from "../context/PriceFeedContext";

export default function PriceChart({ assetId, compact = false, height = 180 }) {
  const { history, getPrice } = usePriceFeed();
  const candles = history[assetId] ?? [];

  if (!candles.length) {
    return <div className="chart-empty">No market data</div>;
  }

  if (compact) {
    const width = 180;
    const values = candles.map((candle) => candle.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * (width - 8);
        const y = height - 8 - ((value - min) / range) * (height - 16);
        return `${x},${y}`;
      })
      .join(" ");

    const isUp = values[values.length - 1] >= values[0];

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="market-chart compact" role="img" aria-label="Price sparkline">
        <polyline points={points} className={isUp ? "sparkline up" : "sparkline down"} />
      </svg>
    );
  }

  const width = 760;
  const padding = { top: 22, right: 88, bottom: 34, left: 72 };
  const chartHeight = height;
  const prices = candles.flatMap((candle) => [candle.low, candle.high]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const step = plotWidth / Math.max(candles.length, 1);
  const candleWidth = Math.max(step * 0.7, 6);
  const formatPrice = (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const xTicks = [0, Math.floor((candles.length - 1) / 2), candles.length - 1];
  const yTicks = [max, min + range / 2, min];
  const livePrice = getPrice(assetId);
  const livePriceY = Math.max(padding.top, Math.min(chartHeight - padding.bottom, chartHeight - ((livePrice - min) / range) * plotHeight - padding.bottom));
  const isIncreasing = candles[candles.length - 1].close >= candles[0].close;
  const trendColor = isIncreasing ? "#4ade80" : "#fb7185";

  return (
    <svg viewBox={`0 0 ${width} ${chartHeight}`} className="market-chart detail-chart" style={{ height: `${chartHeight}px` }} role="img" aria-label="Price chart with time and price axes">
      {yTicks.map((value, index) => {
        const y = padding.top + (plotHeight / 2) * index;
        return <g key={`y-${index}`}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-grid-line" /><text x={width - 10} y={y + 4} textAnchor="end" fill="#ffffff" fontSize="12">{formatPrice(value)}</text></g>;
      })}
      {xTicks.map((tick, index) => {
        const x = padding.left + (tick / Math.max(candles.length - 1, 1)) * plotWidth;
        return <text key={`x-${index}`} x={x} y={chartHeight - 8} textAnchor={index === 0 ? "start" : index === xTicks.length - 1 ? "end" : "middle"} className="chart-axis-label">{tick === candles.length - 1 ? "Now" : `${tick} ticks`}</text>;
      })}
      <line x1={padding.left} x2={width - padding.right} y1={livePriceY} y2={livePriceY} stroke={trendColor} strokeWidth="1.5" strokeDasharray="7 5" />
      <text x={width - 10} y={livePriceY - 7} textAnchor="end" fill={trendColor} fontSize="12" fontWeight="700">{formatPrice(livePrice)}</text>

      {candles.map((candle, index) => {
        const x = padding.left + index * step + step / 2;
        const openY = chartHeight - ((candle.open - min) / range) * plotHeight - padding.bottom;
        const closeY = chartHeight - ((candle.close - min) / range) * plotHeight - padding.bottom;
        const highY = chartHeight - ((candle.high - min) / range) * plotHeight - padding.bottom;
        const lowY = chartHeight - ((candle.low - min) / range) * plotHeight - padding.bottom;
        const isUp = candle.close >= candle.open;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

        return (
          <g key={`${assetId}-${index}`}>
            <line x1={x} x2={x} y1={highY} y2={lowY} className={isUp ? "chart-wick up" : "chart-wick down"} />
            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              rx={2}
              className={isUp ? "chart-body up" : "chart-body down"}
            />
          </g>
        );
      })}
    </svg>
  );
}
