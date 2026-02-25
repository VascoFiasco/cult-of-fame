export const VOCABULARY = {
  appName: 'Pile of Fame',
  primaryAction: 'Start Painting',
  continueAction: 'Continue Session',
  inventoryEntity: 'Mini',
  sessionEntity: 'Session',
} as const

export const ACTIVITY_TYPES = [
  { value: 'PRIME', label: 'Priming' },
  { value: 'BASE', label: 'Basecoating' },
  { value: 'HIGHLIGHT', label: 'Highlighting' },
  { value: 'WASH', label: 'Washing' },
  { value: 'DETAIL', label: 'Detailing' },
  { value: 'FINISH', label: 'Finishing' },
  { value: 'BASE_EARTH', label: 'Base - Earth' },
  { value: 'BASE_METAL', label: 'Base - Metal' },
  { value: 'BASE_SKIN', label: 'Base - Skin' },
  { value: 'BASE_CLOTH', label: 'Base - Cloth' },
  { value: 'BASE_HAIR', label: 'Base - Hair' },
] as const

export const ACTIVITY_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((activity) => [activity.value, activity.label])
)

export const REACTION_DEFINITIONS = [
  { type: 'PRAY', emoji: '🙏', label: 'Pray', aria: 'Support this progress' },
  { type: 'PURIFY', emoji: '🔥', label: 'Zeal', aria: 'Celebrate the effort' },
  { type: 'EXALT', emoji: '👑', label: 'Ascended', aria: 'Honor the milestone' },
] as const

export const EVENT_COPY: Record<string, string> = {
  SESSION_ENDED: 'completed a painting session',
  SESSION_STARTED: 'started a painting session',
  MINI_UPDATED: 'updated mini progress',
  MINI_CREATED: 'added a mini to inventory',
  MILESTONE_UNLOCKED: 'unlocked a milestone',
  SHARE_EXPORTED: 'exported a share card',
  RITUAL: 'completed a painting session',
  CONFESSION: 'updated pile baseline',
}

export function getCanonicalEventType(event: { type: string; metadata?: { canonicalType?: string } | null }) {
  return event?.metadata?.canonicalType || event.type
}
