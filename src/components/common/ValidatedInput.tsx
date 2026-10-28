import React, { useState, useEffect, useId } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateNumeric, validateText, validateCoordinate } from '../../utils/formValidation';

export interface ValidatedInputProps {
  id?: string;
  label?: string;
  type?: 'text' | 'number';
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: string;
  integerOnly?: boolean;
  coordinateType?: 'lat' | 'lng';
  customValidator?: (value: string) => { isValid: boolean; error?: string };
  helperText?: string;
  className?: string;
  inputClassName?: string;
  addonRight?: React.ReactNode;
  disabled?: boolean;
  showSuccessIndicator?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  id: propId,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  maxLength,
  min,
  max,
  step,
  integerOnly = false,
  coordinateType,
  customValidator,
  helperText,
  className = '',
  inputClassName = '',
  addonRight,
  disabled = false,
  showSuccessIndicator = true
}) => {
  const generatedId = useId();
  const inputId = propId || generatedId;

  const [touched, setTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stringValue = value !== undefined && value !== null ? String(value) : '';

  // Run validation
  useEffect(() => {
    // If not touched and empty, don't show aggressive error yet unless it was modified
    if (customValidator) {
      const res = customValidator(stringValue);
      setErrorMessage(res.isValid ? null : (res.error || 'Nilai tidak valid'));
      return;
    }

    if (coordinateType) {
      const res = validateCoordinate(stringValue, coordinateType);
      setErrorMessage(res.isValid ? null : (res.error || 'Format koordinat tidak valid'));
      return;
    }

    if (type === 'number') {
      const res = validateNumeric(stringValue, {
        min,
        max,
        required,
        integerOnly,
        label: label || 'Nilai ini'
      });
      setErrorMessage(res.isValid ? null : (res.error || 'Angka tidak valid'));
      return;
    }

    // Default text validation
    const res = validateText(stringValue, {
      minLength,
      maxLength,
      required,
      label: label || 'Kolom ini'
    });
    setErrorMessage(res.isValid ? null : (res.error || 'Teks tidak valid'));
  }, [stringValue, type, min, max, required, integerOnly, minLength, maxLength, coordinateType, customValidator, label]);

  const hasError = Boolean(errorMessage && (touched || stringValue.trim().length > 0 || required));
  const isValid = !errorMessage && stringValue.trim().length > 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {minLength && minLength > 0 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Min. {minLength} karakter
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <input
          id={inputId}
          type={type}
          step={step}
          value={stringValue}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={() => setTouched(true)}
          onChange={(e) => {
            if (!touched) setTouched(true);
            onChange(e.target.value);
          }}
          className={`w-full px-3 py-2 text-sm rounded-lg transition-all border outline-hidden ${
            hasError
              ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
              : isValid && showSuccessIndicator
              ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/10 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
          } ${addonRight ? 'pr-2' : hasError ? 'pr-9' : isValid && showSuccessIndicator ? 'pr-9' : ''} ${inputClassName}`}
        />

        {/* Status icons inside right side if no addonRight */}
        {!addonRight && (
          <div className="absolute right-2.5 flex items-center pointer-events-none">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : isValid && showSuccessIndicator ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : null}
          </div>
        )}

        {addonRight && <div className="ml-2 shrink-0">{addonRight}</div>}
      </div>

      {/* Real-time error message badge */}
      {hasError && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium pt-0.5 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Helper text if no error */}
      {!hasError && helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          {helperText}
        </p>
      )}
    </div>
  );
};
