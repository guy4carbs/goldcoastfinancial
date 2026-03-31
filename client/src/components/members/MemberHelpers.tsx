import { RADIUS, TYPE, COLORS, GLASS } from '@/lib/heritageDesignSystem';
import { FileText, Download, Check, Clock, type LucideIcon } from 'lucide-react';

// Role badge with color coding
export function RoleBadge({ role }: { role: string }) {
  // Map role to color scheme (check existing implementation in ExecutiveLoungeAccess)
  const roleColors: Record<string, { bg: string; text: string }> = {
    owner: { bg: '#fef3c7', text: '#92400e' },
    system_admin: { bg: '#dbeafe', text: '#1e40af' },
    manager: { bg: '#d1fae5', text: '#065f46' },
    sales_agent: { bg: '#f3e8ff', text: '#6b21a8' },
    client: { bg: '#f1f5f9', text: '#334155' },
    investor: { bg: '#fff7ed', text: '#9a3412' },
    marketing_staff: { bg: '#fce7f3', text: '#9d174d' },
  };
  const colors = roleColors[role] || { bg: '#f3f4f6', text: '#374151' };
  const label = role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      borderRadius: RADIUS.pill,
      padding: '2px 10px',
      fontSize: TYPE.micro,
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

// Status indicator dot
export function StatusDot({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      <span style={{ fontSize: TYPE.meta, color: active ? COLORS.semantic.success : COLORS.gray[500] }}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}

// Info row for detail drawer
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}>
      <span style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>{label}</span>
      <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{value}</span>
    </div>
  );
}

// Document row for documents section
export function DocumentRow({ name, category, date, onDownload }: { name: string; category: string; date?: string; onDownload?: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 transition-colors" style={{ borderRadius: RADIUS.input }}>
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4" style={{ color: COLORS.gray[400] }} />
        <div>
          <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{name}</p>
          {date && <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>{date}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: TYPE.micro, color: COLORS.gray[500], background: COLORS.gray[100], borderRadius: RADIUS.pill, padding: '2px 8px' }}>
          {category}
        </span>
        {onDownload && (
          <button onClick={onDownload} className="p-1.5 hover:bg-gray-100 transition-colors" style={{ borderRadius: RADIUS.input }}>
            <Download className="w-4 h-4" style={{ color: COLORS.gray[500] }} />
          </button>
        )}
      </div>
    </div>
  );
}

// DocuSign status row
export function DocSignRow({ name, signed, onDownload }: { name: string; signed: boolean; onDownload?: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 px-3" style={{ borderRadius: RADIUS.input }}>
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4" style={{ color: signed ? COLORS.semantic.success : COLORS.gray[400] }} />
        <span style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>{name}</span>
      </div>
      <div className="flex items-center gap-2">
        {signed ? (
          <span className="flex items-center gap-1" style={{ fontSize: TYPE.micro, color: COLORS.semantic.success, background: '#d1fae5', borderRadius: RADIUS.pill, padding: '2px 8px' }}>
            <Check className="w-3 h-3" /> Signed
          </span>
        ) : (
          <span className="flex items-center gap-1" style={{ fontSize: TYPE.micro, color: COLORS.gray[500], background: COLORS.gray[100], borderRadius: RADIUS.pill, padding: '2px 8px' }}>
            <Clock className="w-3 h-3" /> Pending
          </span>
        )}
        {signed && onDownload && (
          <button onClick={onDownload} className="p-1.5 hover:bg-gray-100 transition-colors" style={{ borderRadius: RADIUS.input }}>
            <Download className="w-4 h-4" style={{ color: COLORS.gray[500] }} />
          </button>
        )}
      </div>
    </div>
  );
}
