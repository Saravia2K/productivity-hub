import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
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
import { useAuthStore } from '#/stores/auth.store'
import { formatRelativeTime } from '#/lib/utils'
import type { CreateFeedbackDto, Feedback, FeedbackCategory, FeedbackType } from '#/types'

export const Route = createFileRoute('/_app/feedback')({
  component: FeedbackPage,
})

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_RECEIVED: Feedback[] = [
  {
    _id: '1',
    from: { _id: 'u2', name: 'Carlos López', role: 'manager', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    to: { _id: 'u1', name: 'Yo', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    type: 'positive',
    category: 'leadership',
    content: 'Hiciste un trabajo excepcional liderando la reunión de sprint. Tu capacidad para mantener al equipo enfocado y resolver conflictos fue notable.',
    isAnonymous: false,
    isPublic: true,
    tags: ['liderazgo', 'comunicación'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: '',
  },
  {
    _id: '2',
    from: { _id: 'u3', name: 'Anónimo', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    to: { _id: 'u1', name: 'Yo', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    type: 'constructive',
    category: 'communication',
    content: 'Considera mejorar la documentación de tus pull requests. Añadir más contexto sobre el "por qué" de los cambios ayudaría mucho al equipo en revisiones.',
    isAnonymous: true,
    isPublic: false,
    tags: ['documentación', 'PR'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: '',
  },
]

const MOCK_USERS = [
  { value: 'u2', label: 'Carlos López' },
  { value: 'u3', label: 'Ana García' },
  { value: 'u4', label: 'María Torres' },
  { value: 'u5', label: 'Juan Martínez' },
]

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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--line)]">
              <UserCheck className="h-4 w-4 text-[var(--sea-ink-soft)]" />
            </div>
          ) : (
            <Avatar name={displayName} src={(author as { avatar?: string }).avatar} size="sm" />
          )}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-sm font-semibold text-[var(--sea-ink)]">{displayName}</span>
                <span className="ml-2 text-xs text-[var(--sea-ink-soft)]">
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

            <p className="text-sm leading-relaxed text-[var(--sea-ink)]">{feedback.content}</p>

            {feedback.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {feedback.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-[rgba(79,184,178,0.08)] px-2 py-0.5 text-xs text-[var(--lagoon-deep)]"
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
function SendFeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<CreateFeedbackDto>({
    to: '',
    type: 'positive',
    category: 'communication',
    content: '',
    isAnonymous: false,
    isPublic: true,
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: feedbackService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['feedback-sent'] })
      onClose()
      setForm({ to: '', type: 'positive', category: 'communication', content: '', isAnonymous: false, isPublic: true, tags: [] })
    },
    onError: () => setError('No se pudo enviar el feedback. Inténtalo de nuevo.'),
  })

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.to) { setError('Selecciona a quién va dirigido el feedback.'); return }
    if (form.content.length < 20) { setError('El feedback debe tener al menos 20 caracteres.'); return }
    setError('')
    mutate(form)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <Select
              label="Para"
              options={MOCK_USERS}
              value={form.to}
              onValueChange={(v) => setForm((f) => ({ ...f, to: v }))}
              placeholder="Selecciona un compañero…"
            />

            {/* Type toggle */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-[var(--sea-ink)]">Tipo</span>
              <div className="grid grid-cols-2 gap-2">
                {(['positive', 'constructive'] as FeedbackType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type }))}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      form.type === type
                        ? type === 'positive'
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700'
                          : 'border-amber-400 bg-amber-500/10 text-amber-700'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon-deep)]'
                    }`}
                  >
                    {type === 'positive' ? <ThumbsUp className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                    {type === 'positive' ? 'Positivo' : 'Constructivo'}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Categoría"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v as FeedbackCategory }))}
            />

            <Textarea
              label="Feedback"
              placeholder="Sé específico y constructivo. Describe situaciones concretas y su impacto…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
            />

            {/* Tags */}
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-[var(--sea-ink)]">Tags</span>
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
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[rgba(79,184,178,0.08)] px-2.5 py-1 text-xs text-[var(--lagoon-deep)]"
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
                  className="flex cursor-pointer items-center gap-2 text-sm text-[var(--sea-ink-soft)] select-none"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                    className="h-4 w-4 rounded border-[var(--line)] accent-[var(--lagoon-deep)]"
                  />
                  {icon}
                  {label}
                </label>
              ))}
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isPending} leftIcon={<Send className="h-4 w-4" />}>
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
    placeholderData: { data: MOCK_RECEIVED, pagination: { total: 2, page: 1, limit: 20, hasMore: false } },
  })

  const { data: sentData, isLoading: loadingSent } = useQuery({
    queryKey: ['feedback-sent'],
    queryFn: () => feedbackService.getSent(),
    placeholderData: { data: [], pagination: { total: 0, page: 1, limit: 20, hasMore: false } },
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
            <Filter className="h-4 w-4 text-[var(--sea-ink-soft)]" />
            <span className="text-sm text-[var(--sea-ink-soft)]">Filtrar por tipo:</span>
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
                      ? 'bg-[var(--lagoon-deep)] text-white'
                      : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon-deep)]'
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
            { label: 'Recibidos', value: received.length, color: '#4fb8b2' },
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
                  <p className="text-xl font-bold text-[var(--sea-ink)]">{stat.value}</p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="received">
          <TabsList>
            <TabsTrigger value="received">
              Recibido <span className="ml-1.5 rounded-full bg-[rgba(79,184,178,0.15)] px-1.5 py-0.5 text-[10px]">{received.length}</span>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Enviado <span className="ml-1.5 rounded-full bg-[rgba(79,184,178,0.15)] px-1.5 py-0.5 text-[10px]">{sent.length}</span>
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
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Como {user.role}, puedes ver la identidad de los autores de feedback anónimo.
          </p>
        ) : null}
      </div>

      <SendFeedbackDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
