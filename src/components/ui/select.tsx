import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '#/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Seleccionar…',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-(--sea-ink)">{label}</span>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm',
            'bg-(--surface) text-(--sea-ink) border-(--line)',
            'focus:outline-none focus:border-(--lagoon-deep) focus:ring-2 focus:ring-(--lagoon)/20',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
            'data-[placeholder]:text-(--sea-ink-soft)',
            error && 'border-red-400',
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-(--sea-ink-soft)" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded-xl border border-(--line)',
              'bg-(--surface-strong) shadow-xl',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm',
                    'text-(--sea-ink) outline-none',
                    'focus:bg-[var(--lagoon-tint-10)] focus:text-(--lagoon-deep)',
                    'data-[highlighted]:bg-[var(--lagoon-tint-10)] data-[highlighted]:text-(--lagoon-deep)',
                  )}
                >
                  <SelectPrimitive.ItemIndicator className="absolute left-2">
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
