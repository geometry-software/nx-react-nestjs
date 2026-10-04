import { useId, type ComponentProps, type ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export type FormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  htmlFor?: string;
  invalid?: boolean;
  label: string;
  requiredLabel?: string;
};

export function FormField({
  children,
  className,
  error,
  htmlFor,
  invalid = false,
  label,
  requiredLabel,
}: FormFieldProps) {
  return (
    <div className={`grid content-start gap-2${className ? ` ${className}` : ''}`}>
      <Label
        className={[
          requiredLabel && 'flex items-center justify-between',
          invalid && 'text-destructive',
        ]
          .filter(Boolean)
          .join(' ') || undefined}
        htmlFor={htmlFor}
      >
        {label}
        {requiredLabel && <Badge variant="secondary">{requiredLabel}</Badge>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export type FormInputProps = Omit<
  ComponentProps<typeof Input>,
  'aria-invalid' | 'id'
> & {
  error?: string;
  fieldClassName?: string;
  inputId?: string;
  invalid?: boolean;
  label: string;
  requiredLabel?: string;
  startAdornment?: ReactNode;
};

export function FormInput({
  error,
  fieldClassName,
  inputId,
  invalid = false,
  label,
  requiredLabel,
  startAdornment,
  className,
  ...inputProps
}: FormInputProps) {
  const generatedId = useId();
  const id = inputId ?? generatedId;

  return (
    <FormField
      error={error}
      className={fieldClassName}
      htmlFor={id}
      invalid={invalid}
      label={label}
      requiredLabel={requiredLabel}
    >
      {startAdornment ? (
        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            {startAdornment}
          </span>
          <Input
            {...inputProps}
            aria-invalid={invalid}
            className={`pl-9${className ? ` ${className}` : ''}`}
            id={id}
          />
        </div>
      ) : (
        <Input
          {...inputProps}
          aria-invalid={invalid}
          className={className}
          id={id}
        />
      )}
    </FormField>
  );
}
