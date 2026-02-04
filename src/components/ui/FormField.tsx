'use client';

import { Input, Select, SelectItem, Textarea } from '@heroui/react';
import React, { ReactNode } from 'react';

/**
 * Standardized form input styles
 * Use these classNames objects for consistent styling across all forms
 * Using explicit light/dark classes for guaranteed theme consistency
 */
export const formInputStyles = {
  input: {
    base: "w-full",
    label: "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-1.5",
    inputWrapper: [
      "h-14 rounded-xl transition-all duration-200",
      "bg-zinc-100 dark:bg-zinc-800",
      "border border-zinc-200 dark:border-zinc-700",
      "hover:border-primary/50 dark:hover:border-primary/50",
      "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
      "data-[invalid=true]:border-danger",
    ].join(" "),
    input: "text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    errorMessage: "text-xs font-medium text-danger",
  },
  select: {
    base: "w-full",
    label: "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-1.5",
    trigger: [
      "h-14 rounded-xl transition-all duration-200",
      "bg-zinc-100 dark:bg-zinc-800",
      "border border-zinc-200 dark:border-zinc-700",
      "hover:border-primary/50 dark:hover:border-primary/50",
      "data-[focus=true]:border-primary data-[focus=true]:ring-2 data-[focus=true]:ring-primary/20",
    ].join(" "),
    value: "text-sm font-medium text-zinc-900 dark:text-zinc-100",
    listbox: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl",
    popoverContent: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl",
  },
  textarea: {
    base: "w-full",
    label: "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 pb-1.5",
    inputWrapper: [
      "rounded-xl py-3 transition-all duration-200",
      "bg-zinc-100 dark:bg-zinc-800",
      "border border-zinc-200 dark:border-zinc-700",
      "hover:border-primary/50 dark:hover:border-primary/50",
      "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
    ].join(" "),
    input: "text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  },
};

interface FormFieldProps {
  /** Field label */
  label: string;
  /** Field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Help text below the field */
  helpText?: string;
  /** Children (the actual input) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormField Wrapper
 * Provides consistent label styling and layout for form fields
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-foreground/40">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
};

interface StyledInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  disabled?: boolean;
}

/**
 * Styled Input with consistent styling
 */
export const StyledInput: React.FC<StyledInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  startContent,
  endContent,
  disabled = false,
}) => {
  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      type={type}
      isRequired={required}
      isInvalid={!!error}
      errorMessage={error}
      isDisabled={disabled}
      labelPlacement="outside"
      size="lg"
      radius="lg"
      startContent={startContent}
      endContent={endContent}
      classNames={formInputStyles.input}
    />
  );
};

interface StyledSelectProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Styled Select with consistent styling
 */
export const StyledSelect: React.FC<StyledSelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
}) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string;
        onChange?.(selected);
      }}
      isRequired={required}
      isInvalid={!!error}
      errorMessage={error}
      isDisabled={disabled}
      labelPlacement="outside"
      size="lg"
      radius="lg"
      classNames={formInputStyles.select}
    >
      {options.map((option) => (
        <SelectItem key={option.value}>{option.label}</SelectItem>
      ))}
    </Select>
  );
};

interface StyledTextareaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
}

/**
 * Styled Textarea with consistent styling
 */
export const StyledTextarea: React.FC<StyledTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  minRows = 3,
  maxRows = 6,
  disabled = false,
}) => {
  return (
    <Textarea
      label={label}
      placeholder={placeholder}
      value={value}
      onValueChange={onChange}
      isRequired={required}
      isInvalid={!!error}
      errorMessage={error}
      isDisabled={disabled}
      labelPlacement="outside"
      size="lg"
      radius="lg"
      minRows={minRows}
      maxRows={maxRows}
      classNames={formInputStyles.textarea}
    />
  );
};

/**
 * Form Section
 * Groups related form fields with a title
 */
export const FormSection: React.FC<{
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/70">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-foreground/40">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

/**
 * Form Row
 * Horizontal layout for multiple fields
 */
export const FormRow: React.FC<{
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 2, className = '' }) => {
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <div className={`grid grid-cols-1 ${gridClass} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export default FormField;
