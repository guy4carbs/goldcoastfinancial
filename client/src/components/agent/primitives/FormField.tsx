import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'date' | 'time';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  inputClassName?: string;
  rows?: number;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      hint,
      required = false,
      disabled = false,
      icon: Icon,
      className,
      inputClassName,
      rows = 3,
    },
    ref
  ) => {
    const isTextarea = type === 'textarea';
    const InputComponent = isTextarea ? Textarea : Input;

    return (
      <div className={cn("space-y-1.5", className)}>
        <Label
          htmlFor={name}
          className="text-xs font-medium text-gray-700 flex items-center gap-1.5"
        >
          {Icon && <Icon className="w-3 h-3 text-gray-400" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>

        <div className="relative">
          <InputComponent
            ref={ref as any}
            id={name}
            name={name}
            type={isTextarea ? undefined : type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            rows={isTextarea ? rows : undefined}
            className={cn(
              "transition-all",
              error && "border-red-500 focus:ring-red-500",
              inputClassName
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          />
        </div>

        {error && (
          <p
            id={`${name}-error`}
            className="text-xs text-red-500 flex items-center gap-1"
            role="alert"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${name}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
