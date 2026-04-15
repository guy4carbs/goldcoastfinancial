import { useState, useMemo, type ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";

export interface Column<T> { key: string; label: string; sortable?: boolean; render?: (value: any, row: T) => ReactNode; width?: number | string; align?: "left" | "center" | "right"; }

export interface GCDataTableProps<T extends Record<string, any>> {
  columns: Column<T>[]; data: T[]; searchable?: boolean; searchPlaceholder?: string; pageSize?: number;
}

type SortDir = "asc" | "desc" | null;

export function GCDataTable<T extends Record<string, any>>({ columns, data, searchable, searchPlaceholder = "Search...", pageSize = 10 }: GCDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q)));
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = useMemo(() => sorted.slice(page * pageSize, (page + 1) * pageSize), [sorted, page, pageSize]);
  const totalPages = Math.ceil(sorted.length / pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === "asc" ? "desc" : d === "desc" ? null : "asc"); if (sortDir === "desc") setSortKey(null); }
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)" }}>
      {searchable && (
        <div className="p-3" style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--gc-text-muted)" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2" style={{ backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-sm)", color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", outline: "none" }} />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gc-border)" }}>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3"
                  style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-secondary)", cursor: col.sortable ? "pointer" : "default", userSelect: "none", textAlign: col.align || "left", width: col.width, minWidth: col.width }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={e => col.sortable && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSort(col.key))}>
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (sortKey === col.key ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-30" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="group" style={{ borderBottom: "1px solid var(--gc-border-subtle)", transition: "background-color var(--gc-transition-fast)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)", textAlign: col.align || "left", width: col.width, minWidth: col.width }}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-muted)" }}>No data found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--gc-border-subtle)" }}>
          <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-muted)" }}>
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "4px 12px", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? "default" : "pointer" }}>Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: "4px 12px", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", opacity: page >= totalPages - 1 ? 0.4 : 1, cursor: page >= totalPages - 1 ? "default" : "pointer" }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
