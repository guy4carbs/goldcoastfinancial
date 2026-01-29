import { forwardRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date' | 'time' | 'textarea';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  success?: boolean;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
  rows?: number;
  className?: string;
  inputClassName?: string;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  hint,
  required,
  disabled,
  icon,
  prefix,
  suffix,
  rows = 3,
  className,
  inputClassName,
}, ref) => {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  const inputClasses = cn(
    "transition-all duration-200",
    hasError && "border-red-300 focus:border-red-500 focus:ring-red-200",
    hasSuccess && "border-green-300 focus:border-green-500 focus:ring-green-200",
    icon && "pl-10",
    prefix && "pl-14",
    suffix && "pr-14",
    inputClassName
  );

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <Textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      );
    }

    return (
      <Input
        ref={ref as React.Ref<HTMLInputElement>}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={inputClasses}
      />
    );
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label */}
      <Label
        htmlFor={name}
        className={cn(
          "text-sm font-medium text-primary flex items-center gap-1",
          disabled && "opacity-50"
        )}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
            {prefix}
          </div>
        )}

        {renderInput()}

        {/* Suffix */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            {suffix}
          </div>
        )}

        {/* Status Icon */}
        <AnimatePresence>
          {(hasError || hasSuccess) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                suffix && "right-14"
              )}
            >
              {hasError ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error/Hint Messages */}
      <AnimatePresence mode="wait">
        {hasError ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-gray-400 flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
});

FormField.displayName = 'FormField';

export interface FormSelectProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function FormSelect({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder = "Select an option",
  className,
}: FormSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={name}
        className={cn(
          "text-sm font-medium text-primary flex items-center gap-1",
          disabled && "opacity-50"
        )}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
          "transition-all duration-200",
          error && "border-red-300 focus:border-red-500 focus:ring-red-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FormField;
