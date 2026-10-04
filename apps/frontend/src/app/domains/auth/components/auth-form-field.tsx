import type { ComponentProps, ReactNode } from 'react';
import { FormInput } from 'geometry-sdk/components';

type AuthFormFieldProps = Omit<
  ComponentProps<typeof FormInput>,
  'inputId' | 'startAdornment'
> & {
  icon: ReactNode;
};

export function AuthFormField({
  icon,
  ...props
}: AuthFormFieldProps) {
  const id = `auth-${props.name}`;
  return (
    <FormInput {...props} inputId={id} startAdornment={icon} />
  );
}
