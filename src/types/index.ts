// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee'

export interface User {
  _id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  department?: string
  role: UserRole
  emailVerified: boolean
  notificationPreferences: {
    email: boolean
    inApp: boolean
  }
  createdAt: string
  updatedAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  department?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackType = 'positive' | 'constructive'
export type FeedbackCategory =
  | 'communication'
  | 'leadership'
  | 'technical'
  | 'collaboration'

export interface Feedback {
  _id: string
  from: User
  to: User
  type: FeedbackType
  category: FeedbackCategory
  content: string
  isAnonymous: boolean
  isPublic: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateFeedbackDto {
  to: string
  type: FeedbackType
  category: FeedbackCategory
  content: string
  isAnonymous: boolean
  isPublic: boolean
  tags: string[]
}

// ─── Objectives ───────────────────────────────────────────────────────────────

export type ObjectiveStatus = 'todo' | 'in-progress' | 'in-review' | 'completed'

export interface SubTask {
  _id: string
  title: string
  completed: boolean
}

export interface ObjectiveComment {
  _id: string
  author: User
  content: string
  createdAt: string
}

export interface Objective {
  _id: string
  title: string
  description?: string
  status: ObjectiveStatus
  assignee: User
  dueDate?: string
  subTasks: SubTask[]
  comments: ObjectiveComment[]
  createdAt: string
  updatedAt: string
}

export interface CreateObjectiveDto {
  title: string
  description?: string
  status: ObjectiveStatus
  assignee: string
  dueDate?: string
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  user: User
  role: UserRole
  joinedAt: string
}

export interface Team {
  _id: string
  name: string
  description?: string
  manager: User
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  _id: string
  author: User
  content: string
  createdAt: string
  teamId?: string
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'feedback_received'
  | 'mention'
  | 'objective_assigned'
  | 'objective_status_changed'

export interface Notification {
  _id: string
  recipient: string
  type: NotificationType
  message: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: string
}

// ─── API Pagination ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
    nextCursor?: string
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  pendingFeedback: number
  completedObjectives: number
  teamSatisfaction: number
  activeTeamMembers: number
  feedbackTrend: Array<{ month: string; positive: number; constructive: number }>
  objectivesByStatus: Array<{ status: ObjectiveStatus; count: number }>
  recentActivity: Array<{
    id: string
    type: string
    message: string
    createdAt: string
    user?: Pick<User, '_id' | 'name' | 'avatar'>
  }>
}
