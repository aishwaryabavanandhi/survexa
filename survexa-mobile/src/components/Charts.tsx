const barData = [
  { label: "Mon", value: 72, color: "var(--chart-bar-1)" },
  { label: "Tue", value: 88, color: "var(--chart-bar-2)" },
  { label: "Wed", value: 56, color: "var(--chart-bar-3)" },
  { label: "Thu", value: 94, color: "var(--chart-bar-4)" },
  { label: "Fri", value: 68, color: "var(--chart-bar-1)" },
];

export function BarChartView() {
  const max = Math.max(...barData.map((d) => d.value));
  return (
    <div className="chart-wrap">
      <div className="row-between mb-4">
        <span className="heading-md">Weekly responses</span>
        <span className="badge badge-live">Live</span>
      </div>
      <div className="bar-chart" role="img" aria-label="Bar chart of weekly responses">
        {barData.map((d) => (
          <div key={d.label} style={{ flex: 1, textAlign: "center" }}>
            <div
              className="bar"
              style={{
                height: `${(d.value / max) * 120}px`,
                background: d.color,
                margin: "0 auto",
                maxWidth: 36,
              }}
            />
            <span className="caption mt-2" style={{ display: "block" }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const pieSegments = [
  { label: "Promoters", pct: 42, color: "var(--chart-pie-1)" },
  { label: "Passives", pct: 33, color: "var(--chart-pie-2)" },
  { label: "Detractors", pct: 25, color: "var(--chart-pie-3)" },
];

export function PieChartView() {
  let offset = 0;
  const gradient = pieSegments
    .map((s) => {
      const start = offset;
      offset += s.pct;
      return `${s.color} ${start}% ${offset}%`;
    })
    .join(", ");

  return (
    <div className="chart-wrap">
      <p className="heading-md mb-4">NPS distribution</p>
      <div
        className="pie-chart"
        style={{ background: `conic-gradient(${gradient})` }}
        role="img"
        aria-label="Pie chart NPS distribution"
      />
      <div className="pie-legend">
        {pieSegments.map((s) => (
          <div key={s.label} className="legend-item">
            <span className="legend-dot" style={{ background: s.color }} />
            {s.label} — {s.pct}%
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChartView() {
  return (
    <div className="chart-wrap">
      <p className="heading-md mb-4">Response trend</p>
      <svg className="line-chart-svg" viewBox="0 0 320 120" aria-hidden>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--chart-line-start)" />
            <stop offset="100%" stopColor="var(--chart-line-end)" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line-start)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--chart-line-end)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 90 L40 70 L80 75 L120 45 L160 55 L200 30 L240 40 L280 20 L320 35 L320 120 L0 120 Z"
          fill="url(#areaGrad)"
        />
        <path
          className="line-path"
          d="M0 90 L40 70 L80 75 L120 45 L160 55 L200 30 L240 40 L280 20 L320 35"
        />
      </svg>
      <div className="row-between">
        <span className="caption">Jan</span>
        <span className="caption">Jun</span>
      </div>
    </div>
  );
}

export function QRPattern() {
  const pattern = [
    1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ];
  return (
    <div className="qr-pattern">
      {pattern.map((cell, i) => (
        <div key={i} className={`qr-cell ${cell ? "" : "light"}`} />
      ))}
    </div>
  );
}
