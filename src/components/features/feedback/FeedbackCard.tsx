import { ThumbsUp, Wrench, UserCheck, Eye, EyeOff, Tag } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import { FEEDBACK_CATEGORY_LABELS } from '#/constants/feedback'
import { formatRelativeTime } from '#/lib/utils'
import type { Feedback } from '#/types'

interface FeedbackCardProps {
  feedback: Feedback
  showFrom: boolean
}

export function FeedbackCard({ feedback, showFrom }: FeedbackCardProps) {
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
                <Badge variant="info">{FEEDBACK_CATEGORY_LABELS[feedback.category]}</Badge>
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
