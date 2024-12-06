import { useCallback } from 'react'
import { FieldValues, useFormContext, UseFormSetValue } from 'react-hook-form'

export function useFormSetValue<TFieldValues extends FieldValues>() {
  const { setValue, getValues } = useFormContext<TFieldValues>()

  const setter: UseFormSetValue<TFieldValues> = useCallback(
    (key, value, options) => {
      const previousValue = getValues(key)

      setValue(key, value, {
        shouldDirty: !previousValue || previousValue !== value,
        shouldValidate: true,
        ...(options ?? {})
      })
    },
    [setValue, getValues]
  )

  return setter
}
