/**
 * MaskedSSNInput — SSN input with focus/blur masking
 *
 * When FOCUSED: shows actual digits formatted as XXX-XX-XXXX so user can see
 * what they are typing.
 * When BLURRED: shows masked version with bullets for first 5 digits and the
 * last 4 visible (e.g. •••-••-1234).
 * The eye toggle overrides blur masking to reveal/hide the full value.
 *
 * The parent stores only raw digits (up to 9). This component never feeds
 * bullets back into the digit-stripping logic.
 */

import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { RADIUS, COLORS, TYPE } from '@/lib/heritageDesignSystem';

interface MaskedSSNInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MaskedSSNInput({ value, onChange, error }: MaskedSSNInputProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Always derive digits from the parent value (raw digits only)
  const digits = value.replace(/\D/g, '').slice(0, 9);

  // Format with dashes: XXX-XX-XXXX
  const formatSSN = (raw: string): string => {
    if (raw.length <= 3) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`;
  };

  // Masked display: bullets for first 5 digits, last 4 visible
  const maskedDisplay = (raw: string): string => {
    if (raw.length === 0) return '';
    if (raw.length <= 5) {
      const masked = '\u2022'.repeat(raw.length);
      if (raw.length <= 3) return masked;
      return `${masked.slice(0, 3)}-${masked.slice(3)}`;
    }
    const last = raw.slice(5);
    return `\u2022\u2022\u2022-\u2022\u2022-${last}`;
  };

  // When focused or eye-toggled visible: show real digits formatted
  // When blurred and not visible: show masked
  const showReal = focused || visible;
  const displayValue = showReal ? formatSSN(digits) : maskedDisplay(digits);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Since the input shows real digits when focused, stripping non-digits
      // works correctly — no bullets are present in the input value.
      const rawInput = e.target.value.replace(/\D/g, '').slice(0, 9);
      onChange(rawInput);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="XXX-XX-XXXX"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={11} /* XXX-XX-XXXX = 11 chars */
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
        style={{
          borderRadius: RADIUS.input,
          fontSize: TYPE.meta,
          paddingRight: 44,
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onMouseDown={(e) => {
          // Prevent the button click from stealing focus from the input
          e.preventDefault();
          setVisible((v) => !v);
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        style={{ borderRadius: RADIUS.input }}
        aria-label={visible ? 'Hide SSN' : 'Show SSN'}
      >
        {visible ? (
          <EyeOff size={16} style={{ color: COLORS.gray[500] }} />
        ) : (
          <Eye size={16} style={{ color: COLORS.gray[500] }} />
        )}
      </Button>
    </div>
  );
}
