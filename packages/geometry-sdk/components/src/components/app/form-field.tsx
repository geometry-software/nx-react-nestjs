import { useId, type ComponentProps, type ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FieldValidationContext } from '../ui/field-validation-context';

type RequiredFieldProps = {
  required?: boolean;
  requiredLabel?: string;
};

export type FormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  htmlFor?: string;
  invalid?: boolean;
  label: string;
} & RequiredFieldProps;

export function FormField({
  children,
  className,
  error,
  htmlFor,
  invalid = false,
  label,
  required = false,
  requiredLabel,
}: FormFieldProps) {
  const errorId = `${useId()}-error`;
  const isInvalid = invalid || Boolean(error);
  return (
    <FieldValidationContext.Provider
      value={{ invalid: isInvalid, errorId: error ? errorId : undefined }}
    >
      <div
        aria-describedby={error ? errorId : undefined}
        aria-labelledby={`${errorId}-label`}
        className={`grid content-start gap-2${className ? ` ${className}` : ''}`}
        role="group"
      >
        <Label
          id={`${errorId}-label`}
          className={[
            required && 'flex items-center justify-between',
          ]
            .filter(Boolean)
            .join(' ') || undefined}
          htmlFor={htmlFor}
        >
          {label}
          {required && <Badge variant="secondary">{requiredLabel}</Badge>}
        </Label>
        {children}
        {error && (
          <p className="-mt-1 text-[12px] leading-[17px] text-destructive" id={errorId} role="alert">
            {error}
          </p>
        )}
      </div>
    </FieldValidationContext.Provider>
  );
}

export type FormInputProps = Omit<
  ComponentProps<typeof Input>,
  'aria-invalid' | 'id' | 'required'
> & {
  error?: string;
  fieldClassName?: string;
  inputId?: string;
  invalid?: boolean;
  label: string;
  startAdornment?: ReactNode;
} & RequiredFieldProps;

export function FormInput({
  error,
  fieldClassName,
  inputId,
  invalid = false,
  label,
  required = false,
  requiredLabel,
  startAdornment,
  className,
  style,
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
      {...(required ? { required, requiredLabel } : {})}
    >
      {startAdornment ? (
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-2.5 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground [&_svg]:size-4">
            {startAdornment}
          </span>
          <Input
            {...inputProps}
            aria-invalid={invalid}
            className={className}
            id={id}
            required={required}
            style={{ ...style, paddingLeft: '2rem' }}
          />
        </div>
      ) : (
        <Input
          {...inputProps}
          aria-invalid={invalid}
          className={className}
          id={id}
          required={required}
          style={style}
        />
      )}
    </FormField>
  );
}
