import { Prisma, EventType } from '@prisma/client'

type EntityRef = {
  entityType: string
  entityId: string
}

type WriteEventInput = {
  type: EventType
  actorUserId: string
  entityRef: EntityRef
  eventVersion?: number
  metadata?: Prisma.InputJsonValue
  confessionId?: string
  ritualSessionId?: string
}

export async function writeEvent(
  tx: Prisma.TransactionClient,
  input: WriteEventInput
) {
  const {
    type,
    actorUserId,
    entityRef,
    eventVersion = 1,
    metadata,
    confessionId,
    ritualSessionId,
  } = input

  return tx.event.create({
    data: {
      type,
      userId: actorUserId,
      eventVersion,
      entityType: entityRef.entityType,
      entityId: entityRef.entityId,
      confessionId,
      ritualSessionId,
      metadata,
    },
  })
}
