import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Filter,
  MessageSquare,
  ThumbsUp,
  Wrench,
  UserCheck,
  Eye,
  EyeOff,
  Tag,
  X,
  Send,
} from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import { Input, Textarea } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import { EmptyState } from '#/components/ui/empty-state'
import { PageSpinner } from '#/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '#/components/ui/dialog'
import { feedbackService } from '#/services/feedback.service'
import { userService } from '#/services/user.service'
import { useAuthStore } from '#/stores/auth.store'
import { formatRelativeTime } from '#/lib/utils'
import type { CreateFeedbackDto, Feedback, FeedbackCategory, FeedbackType } from '#/types'

export const Route = createFileRoute('/_app/feedback')({
  component: FeedbackPage,
})

const CATEGORY_OPTIONS = [
  { value: 'communication', label: 'Comunicación' },
  { value: 'leadership', label: 'Liderazgo' },
  { value: 'technical', label: 'Técnica' },
  { value: 'collaboration', label: 'Colaboración' },
]

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  communication: 'Comunicación',
  leadership: 'Liderazgo',
  technical: 'Técnica',
  collaboration: 'Colaboración',
}

// ─── Feedback card ────────────────────────────────────────────────────────────
function FeedbackCard({ feedback, showFrom }: { feedback: Feedback; showFrom: boolean }) {
  const author = showFrom ? feedback.from : feedback.to
  const displayName = feedback.isAnonymous && showFrom ? 'Anónimo' : author.name

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          {feedback.isAnonymous && showFrom ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--surface) border border-(--line)">
              <UserCheck className="h-4 w-4 text-(--sea-ink-soft)" />
            </div>
          ) : (
            <Avatar name={displayName} src={(author as { avatar?: string }).avatar} size="sm" />
          )}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-sm font-semibold text-(--sea-ink)">{displayName}</span>
                <span className="ml-2 text-xs text-(--sea-ink-soft)">
                  {formatRelativeTime(feedback.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={feedback.type}>
                  {feedback.type === 'positive' ? (
                    <ThumbsUp className="h-3 w-3" />
                  ) : (
                    <Wrench className="h-3 w-3" />
                  )}
                  {feedback.type === 'positive' ? 'Positivo' : 'Constructivo'}
                </Badge>
                <Badge variant="info">{CATEGORY_LABELS[feedback.category]}</Badge>
                {feedback.isPublic ? (
                  <Badge variant="default">
                    <Eye className="h-3 w-3" /> Público
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <EyeOff className="h-3 w-3" /> Privado
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-(--sea-ink)">{feedback.content}</p>

            {feedback.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {feedback.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--lagoon-tint-8)] px-2 py-0.5 text-xs text-(--lagoon-deep)"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Send feedback dialog ─────────────────────────────────────────────────────
type SendFeedbackForm = {
  to: string
  type: FeedbackType
  category: FeedbackCategory
  content: string
  isAnonymous: boolean
  isPublic: boolean
}

function SendFeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [serverError, setServerError] = useState('')

  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled: open,
  })
  const userOptions = (usersData?.data ?? [])
    .filter((u) => u._id !== currentUser?._id)
    .map((u) => ({ value: u._id, label: u.name + (u.department ? ` · ${u.department}` : '') }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendFeedbackForm>({
    defaultValues: { to: '', type: 'positive', category: 'communication', content: '', isAnonymous: false, isPublic: true },
  })

  const { mutateAsync } = useMutation({
    mutationFn: feedbackService.create,
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

            {/* Type toggle */}
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
                        {t === 'positive' ? <ThumbsUp className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
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
                  options={CATEGORY_OPTIONS}
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
              {...register('content', { required: 'El feedback es obligatorio.', minLength: { value: 20, message: 'El feedback debe tener al menos 20 caracteres.' } })}
            />

            {/* Tags */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-(--sea-ink)">Tags</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
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

            {/* Options */}
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

            {serverError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {serverError}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
              Enviar feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function FeedbackPage() {
  const { user } = useAuthStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: receivedData, isLoading: loadingReceived } = useQuery({
    queryKey: ['feedback-received'],
    queryFn: () => feedbackService.getReceived(),
  })

  const { data: sentData, isLoading: loadingSent } = useQuery({
    queryKey: ['feedback-sent'],
    queryFn: () => feedbackService.getSent(),
  })

  const received = receivedData?.data ?? []
  const sent = sentData?.data ?? []

  const filterFeedback = (list: Feedback[]) =>
    typeFilter === 'all' ? list : list.filter((f) => f.type === typeFilter)

  return (
    <div>
      <TopBar
        title="Feedback 360°"
        subtitle="Da y recibe feedback significativo de tu equipo"
      />

      <div className="p-6 space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-(--sea-ink-soft)" />
            <span className="text-sm text-(--sea-ink-soft)">Filtrar por tipo:</span>
            <div className="flex gap-1">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'positive', label: 'Positivo' },
                { value: 'constructive', label: 'Constructivo' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    typeFilter === f.value
                      ? 'bg-(--lagoon-deep) text-white'
                      : 'border border-(--line) bg-(--surface) text-(--sea-ink-soft) hover:border-(--lagoon-deep)'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Dar feedback
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Recibidos', value: received.length, color: '#1f9790' },
            { label: 'Enviados', value: sent.length, color: '#3b82f6' },
            { label: 'Positivos', value: received.filter((f) => f.type === 'positive').length, color: '#10b981' },
            { label: 'Constructivos', value: received.filter((f) => f.type === 'constructive').length, color: '#f59e0b' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ background: stat.color }}
                >
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-(--sea-ink)">{stat.value}</p>
                  <p className="text-xs text-(--sea-ink-soft)">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="received">
          <TabsList>
            <TabsTrigger value="received">
              Recibido <span className="ml-1.5 rounded-full bg-[var(--lagoon-tint-15)] px-1.5 py-0.5 text-[10px]">{received.length}</span>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Enviado <span className="ml-1.5 rounded-full bg-[var(--lagoon-tint-15)] px-1.5 py-0.5 text-[10px]">{sent.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {loadingReceived ? (
              <PageSpinner />
            ) : filterFeedback(received).length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Sin feedback recibido"
                description="Aún no has recibido feedback. Pide a tus compañeros que compartan su perspectiva."
              />
            ) : (
              <div className="space-y-3">
                {filterFeedback(received).map((fb) => (
                  <FeedbackCard key={fb._id} feedback={fb} showFrom={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {loadingSent ? (
              <PageSpinner />
            ) : filterFeedback(sent).length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Sin feedback enviado"
                description="Aún no has dado feedback a tus compañeros."
                action={{ label: 'Dar mi primer feedback', onClick: () => setDialogOpen(true) }}
              />
            ) : (
              <div className="space-y-3">
                {filterFeedback(sent).map((fb) => (
                  <FeedbackCard key={fb._id} feedback={fb} showFrom={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        {user?.role === 'admin' || user?.role === 'manager' ? (
          <p className="text-xs text-(--sea-ink-soft)">
            Como {user.role}, puedes ver la identidad de los autores de feedback anónimo.
          </p>
        ) : null}
      </div>

      <SendFeedbackDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
