/**
 * Executive Data Table — Sortable, filterable data table with search and export
 * Heritage Design System — Orange/Amber theme
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  GLASS,
  MOTION,
  fadeInUp,
} from '@/lib/heritageDesignSystem';
import { EXECUTIVE_GRADIENT_CSS } from '../executiveConstants';
import { toast } from 'sonner';

// ─── TYPES ───
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface ExecutiveDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

// ─── COMPONENT ───
export function ExecutiveDataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  onRowClick,
  emptyMessage = 'No data available',
}: ExecutiveDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  // ─── SORT CYCLE ───
  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortKey(null);
      setSortDir(null);
    }
  };

  // ─── FILTER + SORT ───
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        const keys = searchKeys.length > 0 ? searchKeys : Object.keys(item);
        return keys.some((key) => {
          const val = item[key];
          return val != null && String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDir === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, search, searchKeys, sortKey, sortDir]);

  // ─── SORT ICON ───
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey || !sortDir) {
      return <ChevronsUpDown style={{ width: 14, height: 14 }} className="text-gray-400" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp style={{ width: 14, height: 14 }} className="text-orange-600" />
    ) : (
      <ChevronDown style={{ width: 14, height: 14 }} className="text-orange-600" />
    );
  };

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="border-0 overflow-hidden"
        style={{
          ...GLASS.css.light,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        <CardContent className="p-0">
          {/* ─── TOOLBAR ─── */}
          <div
            className="flex items-center justify-between gap-3 flex-wrap"
            style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px` }}
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                style={{ width: 16, height: 16 }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-300"
                style={{
                  fontSize: TYPE.meta,
                  borderRadius: RADIUS.input,
                  border: `1px solid ${COLORS.gray[200]}`,
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              />
            </div>

            {/* Export Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => toast.success('Exporting data...')}
            >
              <Download style={{ width: 16, height: 16, marginRight: 6 }} />
              Export
            </Button>
          </div>

          {/* ─── TABLE ─── */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: COLORS.gray[50] }}>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`font-medium text-gray-500 ${
                        col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''
                      }`}
                      style={{
                        fontSize: TYPE.caption,
                        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                        textAlign: col.align || 'left',
                        width: col.width,
                        transition: `color ${MOTION.duration.hover}s`,
                      }}
                      onClick={
                        col.sortable !== false
                          ? () => handleSort(col.key)
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable !== false && (
                          <SortIcon columnKey={col.key} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center text-gray-400"
                      style={{
                        padding: `${GRID.spacing.xl}px ${GRID.spacing.sm}px`,
                        fontSize: TYPE.meta,
                      }}
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`transition-colors duration-150 ${
                        onRowClick ? 'cursor-pointer' : ''
                      }`}
                      style={{
                        borderBottom: `1px solid ${COLORS.gray[100]}`,
                      }}
                      onClick={onRowClick ? () => onRowClick(item) : undefined}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          COLORS.gray[50];
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          'transparent';
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="text-gray-700"
                          style={{
                            fontSize: TYPE.meta,
                            padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                            textAlign: col.align || 'left',
                          }}
                        >
                          {col.render
                            ? col.render(item)
                            : item[col.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ExecutiveDataTable;
