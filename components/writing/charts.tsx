'use client';

// ══════════════════════════════════════
//  BAR CHART
// ══════════════════════════════════════
export function BarChart({ data, title }: { data: { labels: string[]; datasets: { name: string; values: number[]; color: string }[] }; title: string }) {
  const maxValue = Math.max(...data.datasets.flatMap(d => d.values));
  const barGroupWidth = 100 / data.labels.length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-center mb-4">{title}</p>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {data.datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ds.color }} />
            <span className="text-muted-foreground">{ds.name}</span>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="relative h-48 flex items-end gap-1 px-8 pb-6">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-muted-foreground w-7">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end gap-0.5" style={{ marginLeft: '28px' }}>
          {data.labels.map((label, li) => (
            <div key={li} className="flex-1 flex flex-col items-center">
              <div className="flex items-end gap-px w-full" style={{ height: '140px' }}>
                {data.datasets.map((ds, di) => (
                  <div
                    key={di}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${(ds.values[li] / maxValue) * 100}%`,
                      backgroundColor: ds.color,
                      minHeight: '2px',
                    }}
                    title={`${ds.name}: ${ds.values[li]}`}
                  />
                ))}
              </div>
              <span className="text-[8px] text-muted-foreground mt-1 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  LINE GRAPH
// ══════════════════════════════════════
export function LineGraph({ data, title }: { data: { labels: string[]; datasets: { name: string; values: number[]; color: string }[] }; title: string }) {
  const maxValue = Math.max(...data.datasets.flatMap(d => d.values));
  const minValue = Math.min(0, Math.min(...data.datasets.flatMap(d => d.values)));
  const range = maxValue - minValue;
  const chartH = 140;
  const chartW = 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-center mb-4">{title}</p>
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {data.datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: ds.color }} />
            <span className="text-muted-foreground">{ds.name}</span>
          </div>
        ))}
      </div>
      <div className="relative px-8 pb-6">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-muted-foreground w-7">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.66 + minValue * 0.33)}</span>
          <span>{Math.round(maxValue * 0.33 + minValue * 0.66)}</span>
          <span>{minValue}</span>
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: '140px', marginLeft: '28px' }}>
          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((p, i) => (
            <line key={i} x1="0" y1={chartH * p} x2={chartW} y2={chartH * p} stroke="#e5e7eb" strokeWidth="0.3" />
          ))}
          {/* Lines */}
          {data.datasets.map((ds, di) => {
            const points = ds.values.map((v, vi) => {
              const x = (vi / (ds.values.length - 1)) * chartW;
              const y = chartH - ((v - minValue) / range) * chartH;
              return `${x},${y}`;
            }).join(' ');
            return (
              <g key={di}>
                <polyline points={points} fill="none" stroke={ds.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                {ds.values.map((v, vi) => {
                  const x = (vi / (ds.values.length - 1)) * chartW;
                  const y = chartH - ((v - minValue) / range) * chartH;
                  return <circle key={vi} cx={x} cy={y} r="1.5" fill={ds.color} />;
                })}
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[8px] text-muted-foreground mt-1" style={{ marginLeft: '28px' }}>
          {data.labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  PIE CHART
// ══════════════════════════════════════
export function PieChart({ data, title }: { data: { segments: { name: string; value: number; color: string }[] }; title: string }) {
  const total = data.segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;

  const paths = data.segments.map((seg) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += seg.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const largeArc = seg.value / total > 0.5 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(startAngle);
    const y1 = 50 + 40 * Math.sin(startAngle);
    const x2 = 50 + 40 * Math.cos(endAngle);
    const y2 = 50 + 40 * Math.sin(endAngle);
    return { d: `M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`, color: seg.color, name: seg.name, pct: ((seg.value / total) * 100).toFixed(1) };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-center mb-4">{title}</p>
      <div className="flex items-center justify-center gap-6">
        <svg viewBox="0 0 100 100" className="w-36 h-36">
          {paths.map((p, i) => (
            <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth="0.5" />
          ))}
        </svg>
        <div className="space-y-1.5">
          {data.segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-muted-foreground">{seg.name}</span>
              <span className="font-semibold">{((seg.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  TABLE
// ══════════════════════════════════════
export function DataTable({ data, title }: { data: { headers: string[]; rows: string[][] }; title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-center mb-4">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {data.headers.map((h, i) => (
                <th key={i} className={`border border-border bg-muted/50 px-3 py-2 font-semibold ${i === 0 ? 'text-left' : 'text-center'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className={`border border-border px-3 py-2 ${ci === 0 ? 'text-left font-medium' : 'text-center'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  PROCESS DIAGRAM
// ══════════════════════════════════════
export function ProcessDiagram({ data, title }: { data: { steps: string[] }; title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-center mb-4">{title}</p>
      <div className="flex flex-col items-center gap-1">
        {data.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="rounded-lg border border-border bg-muted/50 px-4 py-2 text-xs font-medium text-center max-w-[200px]">
              {step}
            </div>
            {i < data.steps.length - 1 && (
              <svg width="16" height="20" viewBox="0 0 16 20" className="flex-shrink-0 text-muted-foreground">
                <path d="M8,0 L8,14 M4,10 L8,14 L12,10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  MAP DIAGRAM
// ══════════════════════════════════════
export function MapDiagram({ data, title }: { data: { before: string[]; after: string[]; year1: string; year2: string }; title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-center mb-4">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-[10px] font-semibold text-center mb-2 text-muted-foreground">{data.year1}</p>
          <div className="space-y-1">
            {data.before.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-[10px] font-semibold text-center mb-2 text-primary">{data.year2}</p>
          <div className="space-y-1">
            {data.after.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
