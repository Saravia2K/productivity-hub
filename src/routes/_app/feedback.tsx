import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Filter, MessageSquare } from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Button } from '#/components/ui/button'
import { StatCard } from '#/components/ui/stat-card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import { EmptyState } from '#/components/ui/empty-state'
import { PageSpinner } from '#/components/ui/spinner'
import { FeedbackCard } from '#/components/features/feedback/FeedbackCard'
import { SendFeedbackDialog } from '#/components/features/feedback/SendFeedbackDialog'
import { feedbackService } from '#/services/feedback.service'
import { useAuthStore } from '#/stores/auth.store'
import type { Feedback } from '#/types'

export const Route = createFileRoute('/_app/feedback')({
  component: FeedbackPage,
})

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'positive', label: 'Positivo' },
  { value: 'constructive', label: 'Constructivo' },
]

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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-(--sea-ink-soft)" />
            <span className="text-sm text-(--sea-ink-soft)">Filtrar por tipo:</span>
            <div className="flex gap-1">
              {TYPE_FILTERS.map((f) => (
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

          <Button onClick={() => setDialogOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Dar feedback
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Recibidos', value: received.length, color: '#1f9790' },
            { label: 'Enviados', value: sent.length, color: '#3b82f6' },
            { label: 'Positivos', value: received.filter((f) => f.type === 'positive').length, color: '#10b981' },
            { label: 'Constructivos', value: received.filter((f) => f.type === 'constructive').length, color: '#f59e0b' },
          ].map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={<MessageSquare className="h-4 w-4" />}
              color={stat.color}
              iconVariant="solid"
            />
          ))}
        </div>

        <Tabs defaultValue="received">
          <TabsList>
            <TabsTrigger value="received">
              Recibido{' '}
              <span className="ml-1.5 rounded-full bg-(--lagoon-tint-15) px-1.5 py-0.5 text-[10px]">
                {received.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Enviado{' '}
              <span className="ml-1.5 rounded-full bg-(--lagoon-tint-15) px-1.5 py-0.5 text-[10px]">
                {sent.length}
              </span>
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
                  <FeedbackCard key={fb._id} feedback={fb} showFrom />
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

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <p className="text-xs text-(--sea-ink-soft)">
            Como {user.role}, puedes ver la identidad de los autores de feedback anónimo.
          </p>
        )}
      </div>

      <SendFeedbackDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
