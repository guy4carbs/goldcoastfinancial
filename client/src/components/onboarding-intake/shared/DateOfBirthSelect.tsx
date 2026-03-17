/**
 * DateOfBirthSelect — Month / Day / Year dropdown pickers
 * Much easier to navigate than a native date input
 *
 * Supports two modes:
 *  - "dob" (default): years go from currentYear-18 backward 80 years
 *  - "future": years go from currentYear-5 forward 20 years (for expirations, effective dates)
 */

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { RADIUS, TYPE } from '@/lib/heritageDesignSystem';

interface DateOfBirthSelectProps {
  value: string; // ISO string YYYY-MM-DD or ''
  onChange: (isoDate: string) => void;
  /** "dob" = past years only, "future" = includes upcoming years, "exam" = current year + next 4 */
  mode?: 'dob' | 'future' | 'exam';
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

const currentYear = new Date().getFullYear();
const DOB_YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
const FUTURE_YEARS = Array.from({ length: 25 }, (_, i) => currentYear - 5 + i);
const EXAM_YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i);

export function DateOfBirthSelect({
  value,
  onChange,
  mode = 'dob',
}: DateOfBirthSelectProps) {
  const parts = value ? value.split('-') : ['', '', ''];
  const year = parts[0] || '';
  const month = parts[1] || '';
  const day = parts[2] || '';

  const daysCount = getDaysInMonth(
    month ? parseInt(month, 10) : 0,
    year ? parseInt(year, 10) : currentYear,
  );
  const DAYS = Array.from({ length: daysCount }, (_, i) =>
    String(i + 1).padStart(2, '0'),
  );

  const years = mode === 'exam' ? EXAM_YEARS : mode === 'future' ? FUTURE_YEARS : DOB_YEARS;

  const update = (m: string, d: string, y: string) => {
    if (m && d && y) {
      onChange(`${y}-${m}-${d}`);
    } else if (m || d || y) {
      // Partial — store what we have so user can continue picking
      onChange(`${y || '____'}-${m || '__'}-${d || '__'}`);
    }
  };

  const selectStyle = { borderRadius: RADIUS.input, fontSize: TYPE.meta };

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Month */}
      <Select value={month} onValueChange={(v) => update(v, day, year)}>
        <SelectTrigger style={selectStyle}>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Day */}
      <Select value={day} onValueChange={(v) => update(month, v, year)}>
        <SelectTrigger style={selectStyle}>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((d) => (
            <SelectItem key={d} value={d}>
              {parseInt(d, 10)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={year} onValueChange={(v) => update(month, day, v)}>
        <SelectTrigger style={selectStyle}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
