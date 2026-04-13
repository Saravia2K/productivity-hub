import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Building2, FileText, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { Avatar } from '#/components/ui/avatar'
import { authService } from '#/services/auth.service'
import { useAuthStore } from '#/stores/auth.store'

type ProfileForm = { name: string; bio: string; department: string }

export function ProfileTab() {
  const { user, setUser } = useAuthStore()
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      department: user?.department ?? '',
    },
  })

  const { mutateAsync } = useMutation({
    mutationFn: (data: ProfileForm) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  return (
    <Card>
      <CardHeader className="p-5">
        <CardTitle>Información de perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutateAsync(data))} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name ?? 'U'} src={user?.avatar} size="xl" />
            <div>
              <Button variant="outline" size="sm" leftIcon={<Camera className="h-4 w-4" />}>
                Cambiar foto
              </Button>
              <p className="mt-1.5 text-xs text-(--sea-ink-soft)">JPG, PNG o WebP. Máx 2MB.</p>
            </div>
          </div>

          <Input
            label="Nombre completo"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name', { required: 'El nombre es obligatorio.' })}
          />

          <Input
            label="Email"
            value={user?.email ?? ''}
            disabled
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Input
            label="Departamento"
            leftIcon={<Building2 className="h-4 w-4" />}
            placeholder="Ingeniería, Producto, Diseño…"
            {...register('department')}
          />

          <Textarea
            label="Bio"
            placeholder="Cuéntale a tu equipo sobre ti…"
            rows={3}
            {...register('bio')}
          />

          {success && (
            <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">
              Perfil actualizado correctamente.
            </p>
          )}

          <Button type="submit" loading={isSubmitting} leftIcon={<FileText className="h-4 w-4" />}>
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
