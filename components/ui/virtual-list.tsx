'use client';

import { useState, useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Virtual Scrolling List (Phase 6.6)
// Renders only the visible window of items — keeps long lists
// (vocabulary, test history, mistakes) fast.
// ============================================================

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height?: number; // viewport height in px
  overscan?: number; // extra items above/below viewport
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  getKey?: (item: T, index: number) => string | number;
  columns?: number; // grid mode: items per row (rowHeight = itemHeight)
  itemClassName?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height = 480,
  overscan = 5,
  renderItem,
  className,
  getKey,
  columns = 1,
  itemClassName,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const cols = Math.max(1, columns);
  const rowCount = Math.ceil(items.length / cols);

  const handleScroll = useCallback(() => {
    setScrollTop(containerRef.current?.scrollTop ?? 0);
  }, []);

  const total = items.length;
  const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endRow = Math.min(
    rowCount,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );
  const startIndex = startRow * cols;
  const endIndex = Math.min(total, endRow * cols);
  const visible = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-y-auto', className)}
      style={{ height }}
      role="list"
    >
      <div style={{ height: rowCount * itemHeight, position: 'relative' }}>
        {Array.from({ length: endRow - startRow }, (_, r) => {
          const rowIndex = startRow + r;
          const rowItems = items.slice(rowIndex * cols, rowIndex * cols + cols);
          return (
            <div
              key={rowIndex}
              style={{
                position: 'absolute',
                top: rowIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
                display: 'flex',
                gap: 12,
                alignItems: 'stretch',
              }}
            >
              {rowItems.map((item, c) => {
                const index = rowIndex * cols + c;
                return (
                  <div
                    key={getKey ? getKey(item, index) : index}
                    role="listitem"
                    className={cn('min-w-0 flex-1 overflow-hidden', itemClassName)}
                  >
                    {renderItem(item, index)}
                  </div>
                );
              })}
              {rowItems.length < cols &&
                Array.from({ length: cols - rowItems.length }, (_, i) => (
                  <div key={`pad-${i}`} className="min-w-0 flex-1" aria-hidden />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
