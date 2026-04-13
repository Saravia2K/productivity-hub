import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '#/components/ui/dialog'
import { ObjectiveFormFields, type ObjectiveFormValues } from './ObjectiveFormFields'
import { objectiveService } from '#/services/objective.service'
import { useUsersQuery } from '#/hooks/useUsersQuery'
import { formatUserOption } from '#/lib/utils'
import type { CreateObjectiveDto, ObjectiveStatus } from '#/types'

interface CreateObjectiveDialogProps {
  open: boolean
  defaultStatus: ObjectiveStatus
  onClose: () => void
}

export function CreateObjectiveDialog({ open, defaultStatus, onClose }: CreateObjectiveDialogProps) {
  const qc = useQueryClient()
  const [serverError, setServerError] = useState('')

  const { data: usersData } = useUsersQuery(open)
  const assigneeOptions = (usersData?.data ?? []).map((u) => ({
    value: u._id,
    label: formatUserOption(u),
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ObjectiveFormValues>({
    defaultValues: { title: '', description: '', status: defaultStatus, assignee: '', dueDate: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ title: '', description: '', status: defaultStatus, assignee: '', dueDate: '' })
    }
  }, [open, defaultStatus, reset])

  const { mutateAsync } = useMutation({
    mutationFn: (data: CreateObjectiveDto) => objectiveService.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['objectives'] })
      onClose()
    },
  })

  async function onSubmit(data: ObjectiveFormValues) {
    setServerError('')
    try {
      await mutateAsync({ ...data, dueDate: data.dueDate || undefined } as CreateObjectiveDto)
    } catch {
      setServerError('No se pudo crear el objetivo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo objetivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <ObjectiveFormFields
              register={register}
              control={control}
              errors={errors}
              assigneeOptions={assigneeOptions}
              serverError={serverError}
              statusLabel="Estado inicial"
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} leftIcon={<Plus className="h-4 w-4" />}>
              Crear objetivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
