import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ThumbsUp, Wrench, UserCheck, Eye, Tag, X, Send } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { ErrorMessage } from '#/components/ui/error-message'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '#/components/ui/dialog'
import { feedbackService } from '#/services/feedback.service'
import { useAuthStore } from '#/stores/auth.store'
import { useUsersQuery } from '#/hooks/useUsersQuery'
import { formatUserOption } from '#/lib/utils'
import { FEEDBACK_CATEGORY_OPTIONS } from '#/constants/feedback'
import type { CreateFeedbackDto, FeedbackCategory, FeedbackType } from '#/types'

type SendFeedbackForm = {
  to: string
  type: FeedbackType
  category: FeedbackCategory
  content: string
  isAnonymous: boolean
  isPublic: boolean
}

interface SendFeedbackDialogProps {
  open: boolean
  onClose: () => void
}

export function SendFeedbackDialog({ open, onClose }: SendFeedbackDialogProps) {
  const qc = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [serverError, setServerError] = useState('')

  const { data: usersData } = useUsersQuery(open)
  const userOptions = (usersData?.data ?? [])
    .filter((u) => u._id !== currentUser?._id)
    .map((u) => ({ value: u._id, label: formatUserOption(u) }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendFeedbackForm>({
    defaultValues: {
      to: '',
      type: 'positive',
      category: 'communication',
      content: '',
      isAnonymous: false,
      isPublic: true,
    },
  })

  const { mutateAsync } = useMutation({
    mutationFn: (data: CreateFeedbackDto) => feedbackService.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['feedback-sent'] })
      reset()
      setTags([])
      onClose()
    },
  })

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  async function onSubmit(data: SendFeedbackForm) {
    setServerError('')
    try {
      await mutateAsync({ ...data, tags })
    } catch {
      setServerError('No se pudo enviar el feedback. Inténtalo de nuevo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <Controller
              control={control}
              name="to"
              rules={{ required: 'Selecciona a quién va dirigido el feedback.' }}
              render={({ field }) => (
                <Select
                  label="Para"
                  options={userOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona un compañero…"
                  error={errors.to?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-(--sea-ink)">Tipo</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['positive', 'constructive'] as FeedbackType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => field.onChange(t)}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          field.value === t
                            ? t === 'positive'
                              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700'
                              : 'border-amber-400 bg-amber-500/10 text-amber-700'
                            : 'border-(--line) bg-(--surface) text-(--sea-ink-soft) hover:border-(--lagoon-deep)'
                        }`}
                      >
                        {t === 'positive' ? (
                          <ThumbsUp className="h-4 w-4" />
                        ) : (
                          <Wrench className="h-4 w-4" />
                        )}
                        {t === 'positive' ? 'Positivo' : 'Constructivo'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  label="Categoría"
                  options={FEEDBACK_CATEGORY_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />

            <Textarea
              label="Feedback"
              placeholder="Sé específico y constructivo. Describe situaciones concretas y su impacto…"
              rows={4}
              error={errors.content?.message}
              {...register('content', {
                required: 'El feedback es obligatorio.',
                minLength: { value: 20, message: 'El feedback debe tener al menos 20 caracteres.' },
              })}
            />

            <div className="space-y-1.5">
              <span className="text-sm font-medium text-(--sea-ink)">Tags</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  leftIcon={<Tag className="h-4 w-4" />}
                />
                <Button type="button" variant="secondary" size="sm" onClick={addTag}>
                  Añadir
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--lagoon-tint-8)] px-2.5 py-1 text-xs text-(--lagoon-deep)"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {[
                { key: 'isAnonymous' as const, label: 'Enviar anónimamente', icon: <UserCheck className="h-4 w-4" /> },
                { key: 'isPublic' as const, label: 'Hacer público', icon: <Eye className="h-4 w-4" /> },
              ].map(({ key, label, icon }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-(--sea-ink-soft) select-none"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-(--line) accent-(--lagoon-deep)"
                    {...register(key)}
                  />
                  {icon}
                  {label}
                </label>
              ))}
            </div>

            {serverError && <ErrorMessage>{serverError}</ErrorMessage>}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
              Enviar feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
