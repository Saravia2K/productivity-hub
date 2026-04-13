import type { UseFormRegister, Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Calendar } from 'lucide-react'
import { Input, Textarea } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { ErrorMessage } from '#/components/ui/error-message'
import { OBJECTIVE_COLUMNS } from '#/constants/objectives'
import type { ObjectiveStatus } from '#/types'

export type ObjectiveFormValues = {
  title: string
  description: string
  status: ObjectiveStatus
  assignee: string
  dueDate: string
}

interface ObjectiveFormFieldsProps {
  register: UseFormRegister<ObjectiveFormValues>
  control: Control<ObjectiveFormValues>
  errors: FieldErrors<ObjectiveFormValues>
  assigneeOptions: { value: string; label: string }[]
  serverError: string
  statusLabel?: string
}

export function ObjectiveFormFields({
  register,
  control,
  errors,
  assigneeOptions,
  serverError,
  statusLabel = 'Estado',
}: ObjectiveFormFieldsProps) {
  return (
    <>
      <Input
        label="Título"
        placeholder="¿Qué quieres lograr?"
        error={errors.title?.message}
        {...register('title', { required: 'El título es obligatorio.' })}
      />
      <Textarea
        label="Descripción (opcional)"
        placeholder="Contexto adicional…"
        rows={3}
        {...register('description')}
      />
      <Controller
        control={control}
        name="assignee"
        rules={{ required: 'Selecciona un responsable.' }}
        render={({ field }) => (
          <Select
            label="Responsable"
            options={assigneeOptions}
            value={field.value}
            onValueChange={field.onChange}
            placeholder="Asignar a…"
            error={errors.assignee?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <Select
            label={statusLabel}
            options={OBJECTIVE_COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Input
        label="Fecha límite (opcional)"
        type="date"
        leftIcon={<Calendar className="h-4 w-4" />}
        {...register('dueDate')}
      />
      {serverError && <ErrorMessage>{serverError}</ErrorMessage>}
    </>
  )
}
