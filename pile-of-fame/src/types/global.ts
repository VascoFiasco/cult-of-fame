import { User, Confession, RitualSession, Event, Reaction } from '@prisma/client'

export type { User, Confession, RitualSession, Event, Reaction }

export type ActivityType = 'PRIME' | 'BASE' | 'HIGHLIGHT' | 'WASH' | 'DETAIL' | 'FINISH' | 'BASE_EARTH' | 'BASE_METAL' | 'BASE_SKIN' | 'BASE_CLOTH' | 'BASE_HAIR'

export type EventType =
  | 'MINI_CREATED'
  | 'SESSION_STARTED'
  | 'SESSION_ENDED'
  | 'MINI_UPDATED'
  | 'MILESTONE_UNLOCKED'
  | 'SHARE_EXPORTED'
  | 'CONFESSION'
  | 'RITUAL'
  | 'STREAK'
  | 'CRUSADE'
  | 'SYSTEM'
  | 'CULT_JOIN'

export type ReactionType = 'PRAY' | 'PURIFY' | 'EXALT'

export type CrusadeGoalType = 'MINIS' | 'HOURS' | 'SESSIONS'

// Extended types with relations
export interface EventWithRelations extends Event {
  user: User
  ritualSession: RitualSession | null
  confession: Confession | null
  reactions: ReactionWithUser[]
}

export interface ReactionWithUser extends Reaction {
  user: User
}

export interface UserWithStats extends User {
  _count: {
    ritualSessions: number
    confessions: number
  }
  currentStreak?: number
  longestStreak?: number
}

// Session creation types
export interface CreateRitualSessionInput {
  miniCount: number
  activityType: ActivityType
  durationSeconds: number
  beforeImageUrl?: string
  afterImageUrl?: string
}

export interface CreateConfessionInput {
  miniCount: number
}

export interface CreateReactionInput {
  eventId: string
  type: ReactionType
}

// API Response types
export interface FeedResponse {
  events: EventWithRelations[]
  nextCursor?: string
  hasMore: boolean
}

export interface StreakResponse {
  currentStreak: number
  longestStreak: number
  lastSessionDate: Date | null
}
