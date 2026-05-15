import {
  TextField as HeroTextField,
  Label,
  Input,
  TextArea,
  Description,
  FieldError,
} from '@heroui/react'
import type { ReactNode } from 'react'

type TextFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'search'
  | 'number'

type TextFieldProps = {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  type?: TextFieldType
  name?: string
  isRequired?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  fullWidth?: boolean
  multiline?: boolean
  rows?: number
  className?: string
  inputClassName?: string
}

// Flat wrapper for HeroUI TextField. Passes `error` to render a FieldError automatically,
// otherwise falls back to `description`. Toggle `multiline` for a TextArea.
export function TextField({
  label,
  description,
  error,
  placeholder,
  value,
  defaultValue,
  onChange,
  type = 'text',
  name,
  isRequired,
  isDisabled,
  isInvalid,
  fullWidth,
  multiline,
  rows,
  className,
  inputClassName,
}: TextFieldProps) {
  const invalid = isInvalid ?? error != null
  return (
    <HeroTextField
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      type={type}
      name={name}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={invalid}
      fullWidth={fullWidth}
      className={className}
    >
      {label != null && <Label>{label}</Label>}
      {multiline ? (
        <TextArea placeholder={placeholder} rows={rows} className={inputClassName} />
      ) : (
        <Input placeholder={placeholder} className={inputClassName} />
      )}
      {error != null ? (
        <FieldError>{error}</FieldError>
      ) : description != null ? (
        <Description>{description}</Description>
      ) : null}
    </HeroTextField>
  )
}
