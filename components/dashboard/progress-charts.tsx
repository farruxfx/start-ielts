'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { getTestResults, getProgressHistory } from '@/lib/store';
import type { TestResult } from '@/lib/types';

interface ChartData {
  date: string;
  overall: number;
  reading?: number;
  listening?: number;
  writing?: number;
  speaking?: number;
}

export function ProgressCharts() {
  const [data, setData] = useState<ChartData[]>([]);
  const [activeSkill, setActiveSkill] = useState<string>('overall');

  useEffect(() => {
    const results = getTestResults();
    const history = getProgressHistory();

    if (history.length > 0) {
      // Build chart data from history
      const chartData: ChartData[] = history.map(h => ({
        date: h.date,
        overall: h.overall,
      }));
      setData(chartData);
    } else if (results.length > 0) {
      // Build from test results
      const dateMap = new Map<string, ChartData>();
      results.forEach((r: TestResult) => {
        const date = new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = dateMap.get(date) || { date, overall: 0 };
        existing.overall = r.overallBand;
        
        dateMap.set(date, existing);
      });
      setData(Array.from(dateMap.values()).slice(-10));
    }
  }, []);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Progress Over Time</h3>
        </div>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p>Complete some tests to see your progress</p>
          </div>
        </div>
      </div>
    );
  }

  const maxBand = 9;
  const minBand = 0;
  const range = maxBand - minBand;

  // Simple SVG chart
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.overall - minBand) / range) * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Progress Over Time</h3>
        </div>
        <span className="text-xs text-muted-foreground">{data.length} data points</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
          {/* Grid lines */}
          {[0, 3, 5, 6, 7, 8, 9].map(band => {
            const y = padding.top + innerHeight - ((band - minBand) / range) * innerHeight;
            return (
              <g key={band}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="currentColor"
                  opacity={0.5}
                >
                  {band}
                </text>
              </g>
            );
          })}

          {/* Area */}
          <path d={areaD} fill="url(#gradient)" opacity={0.3} />

          {/* Line */}
          <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" />
              <text
                x={p.x}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                opacity={0.6}
              >
                {p.date}
              </text>
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="hsl(var(--primary))"
              >
                {p.overall.toFixed(1)}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Latest</p>
          <p className="text-lg font-bold">{data[data.length - 1]?.overall.toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Best</p>
          <p className="text-lg font-bold text-green-600">{Math.max(...data.map(d => d.overall)).toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="text-[10px] text-muted-foreground">Average</p>
          <p className="text-lg font-bold">{(data.reduce((a, d) => a + d.overall, 0) / data.length).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
