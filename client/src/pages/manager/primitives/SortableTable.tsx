/**
 * SortableTable — Reusable sortable data table
 * Heritage Design System — Emerald theme
 *
 * Glass card container with clickable column headers for sort.
 * Rows animate in with staggerFast variant.
 */

import { useState, useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  RADIUS,
  SHADOW,
  TYPE,
  LAYOUT,
  staggerFast,
  fadeInUp,
} from '@/lib/heritageDesignSystem';
import { glassCard } from '../managerConstants';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  defaultSortKey?: string;
  defaultSortDir?: 'asc' | 'desc';
  onRowClick?: (row: T) => void;
  rowKey: keyof T | ((row: T) => string);
  maxRows?: number;
  className?: string;
}

export function SortableTable<T extends Record<string, unknown>>({
  columns,
  data,
  defaultSortKey,
  defaultSortDir = 'desc',
  onRowClick,
  rowKey,
  maxRows,
  className,
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [showAll, setShowAll] = useState(false);

  const getKey = (row: T) =>
    typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null || bVal == null) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDir]);

  const visibleData = maxRows && !showAll ? sortedData.slice(0, maxRows) : sortedData;
  const hasMore = maxRows ? sortedData.length > maxRows : false;

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} className="text-gray-400 ml-1" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-emerald-600 ml-1" />
      : <ArrowDown size={12} className="text-emerald-600 ml-1" />;
  };

  return (
    <div
      className={className}
      style={{
        ...glassCard,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.card,
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable !== false ? () => toggleSort(col.key) : undefined}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  style={{
                    padding: '12px 16px',
                    textAlign: col.align ?? 'left',
                    fontSize: TYPE.caption,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: col.width,
                    height: LAYOUT.rowHeight,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {col.label}
                    {col.sortable !== false && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={staggerFast} initial="hidden" animate="visible">
            {visibleData.map((row, idx) => (
              <motion.tr
                key={getKey(row)}
                variants={fadeInUp}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  borderBottom: idx < visibleData.length - 1 ? '1px solid rgba(0, 0, 0, 0.04)' : undefined,
                  cursor: onRowClick ? 'pointer' : 'default',
                  height: LAYOUT.rowHeight,
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.03)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '8px 16px',
                      fontSize: TYPE.meta,
                      color: '#374151',
                      textAlign: col.align ?? 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.render ? col.render(row, idx) : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {hasMore && !showAll && (
        <div style={{ padding: '12px 16px', textAlign: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.04)' }}>
          <button
            onClick={() => setShowAll(true)}
            style={{
              fontSize: TYPE.caption,
              color: '#059669',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Show all {sortedData.length} rows
          </button>
        </div>
      )}
    </div>
  );
}

export default SortableTable;
