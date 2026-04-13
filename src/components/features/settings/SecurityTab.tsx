import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { authService } from '#/services/auth.service'

type PasswordForm = { current: string; next: string; confirm: string }

export function SecurityTab() {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>()

  const { mutateAsync } = useMutation({
    mutationFn: (data: PasswordForm) => authService.changePassword(data.current, data.next),
    onSuccess: () => {
      reset()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  return (
    <Card>
      <CardHeader className="p-5">
        <CardTitle>Cambiar contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutateAsync(data))} className="space-y-4">
          <Input
            label="Contraseña actual"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.current?.message}
            {...register('current', { required: 'Introduce tu contraseña actual.' })}
          />
          <Input
            label="Nueva contraseña"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.next?.message}
            {...register('next', {
              required: 'Introduce la nueva contraseña.',
              minLength: { value: 8, message: 'La nueva contraseña debe tener al menos 8 caracteres.' },
            })}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirm?.message}
            {...register('confirm', {
              required: 'Confirma la nueva contraseña.',
              validate: (v) => v === watch('next') || 'Las contraseñas nuevas no coinciden.',
            })}
          />

          {success && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              Contraseña actualizada correctamente.
            </p>
          )}

          <Button type="submit" loading={isSubmitting}>
            Cambiar contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
