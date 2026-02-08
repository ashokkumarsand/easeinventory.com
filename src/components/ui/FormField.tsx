'use client';

import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Form input style classes for consistent styling
 */
export const formInputStyles = {
  input: 'h-12 rounded-xl bg-background border-foreground/10 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/10',
  select: 'h-12 rounded-xl bg-background border-foreground/10 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/10',
  textarea: 'rounded-xl bg-background border-foreground/10 hover:border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[120px]',
};

/**
 * Inline input styles for direct usage
 */
export const inputClassNames = {
  inputWrapper: 'h-12 rounded-xl border-foreground/10 hover:border-foreground/20 focus-within:border-primary bg-background',
  input: 'text-sm placeholder:text-foreground/40',
};

export const selectClassNames = {
  trigger: 'h-12 rounded-xl border-foreground/10 hover:border-foreground/20 data-[state=open]:border-primary bg-background',
  value: 'text-sm placeholder:text-foreground/40',
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
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label className="text-sm font-semibold text-foreground/70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-foreground/40">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
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
  className?: string;
}

/**
 * Styled Input - wrapper with consistent styling
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
  className,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold text-foreground/70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        {startContent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {startContent}
          </div>
        )}
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            formInputStyles.input,
            error && 'border-destructive focus:ring-destructive/10',
            startContent && 'pl-10',
            endContent && 'pr-10',
            className
          )}
        />
        {endContent && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {endContent}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
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
  className?: string;
}

/**
 * Styled Select - wrapper with consistent styling
 */
export const StyledSelect: React.FC<StyledSelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  className,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold text-foreground/70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            formInputStyles.select,
            error && 'border-destructive focus:ring-destructive/10',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.filter((option) => option.value !== '').map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
};

interface StyledTextareaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Styled Textarea - wrapper with consistent styling
 */
export const StyledTextarea: React.FC<StyledTextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  rows = 4,
  disabled = false,
  className,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold text-foreground/70">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={cn(
          formInputStyles.textarea,
          error && 'border-destructive focus:ring-destructive/10',
          className
        )}
      />
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
};

/**
 * Form Section - groups related form fields with a title
 */
export const FormSection: React.FC<{
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-foreground/50">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

/**
 * Form Row - horizontal layout for multiple fields
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
    <div className={cn('grid grid-cols-1 gap-5', gridClass, className)}>
      {children}
    </div>
  );
};

export default FormField;
