import { describe, expect, it } from 'vitest'

import { deadlineState, isFollowUpPending, isStale, nextOpenTask } from './rules'
import type { Lead, Task } from './types'

function lead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l1',
    name: 'Lead',
    tags: [],
    status: 'talking',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

function task(overrides: Partial<Task>): Task {
  return {
    id: crypto.randomUUID(),
    leadId: 'l1',
    type: 'follow_up',
    dueDate: '2026-09-25',
    status: 'open',
    createdAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('deadlineState', () => {
  it('returns none when there is no due date', () => {
    expect(deadlineState(undefined, '2026-09-21', 3)).toBe('none')
  })

  it('returns overdue for a past due date', () => {
    expect(deadlineState('2026-09-20', '2026-09-21', 3)).toBe('overdue')
  })

  it('returns soon when within the warning window', () => {
    expect(deadlineState('2026-09-23', '2026-09-21', 3)).toBe('soon')
  })

  it('returns ok when far in the future', () => {
    expect(deadlineState('2026-10-15', '2026-09-21', 3)).toBe('ok')
  })
})

describe('nextOpenTask', () => {
  it('returns the open task with the earliest due date', () => {
    const tasks = [task({ dueDate: '2026-09-30' }), task({ dueDate: '2026-09-22' }), task({ status: 'done', dueDate: '2026-09-05' })]
    expect(nextOpenTask(tasks)?.dueDate).toBe('2026-09-22')
  })

  it('returns undefined when there are no open tasks', () => {
    expect(nextOpenTask([task({ status: 'done' })])).toBeUndefined()
  })
})

describe('isStale', () => {
  it('is false for final statuses regardless of interaction', () => {
    const l = lead({ status: 'closed', lastInteractionAt: '2026-08-01T00:00:00.000Z' })
    expect(isStale(l, [], '2026-09-21', 5)).toBe(false)
  })

  it('is true when inactive for longer than staleDays and no upcoming task', () => {
    const l = lead({ lastInteractionAt: '2026-09-10T00:00:00.000Z' })
    expect(isStale(l, [], '2026-09-21', 5)).toBe(true)
  })

  it('is false when there is an open task scheduled for today or later', () => {
    const l = lead({ lastInteractionAt: '2026-09-10T00:00:00.000Z' })
    const tasks = [task({ dueDate: '2026-09-25' })]
    expect(isStale(l, tasks, '2026-09-21', 5)).toBe(false)
  })

  it('is false when interaction is recent', () => {
    const l = lead({ lastInteractionAt: '2026-09-20T00:00:00.000Z' })
    expect(isStale(l, [], '2026-09-21', 5)).toBe(false)
  })

  it('falls back to createdAt when there is no interaction yet', () => {
    const l = lead({ createdAt: '2026-09-01T00:00:00.000Z' })
    expect(isStale(l, [], '2026-09-21', 5)).toBe(true)
  })
})

describe('isFollowUpPending', () => {
  it('is true when there is an open follow-up task due today or earlier', () => {
    const l = lead({})
    const tasks = [task({ type: 'follow_up', dueDate: '2026-09-20' })]
    expect(isFollowUpPending(l, tasks, '2026-09-21')).toBe(true)
  })

  it('is false when the follow-up task is scheduled for the future', () => {
    const l = lead({})
    const tasks = [task({ type: 'follow_up', dueDate: '2026-09-25' })]
    expect(isFollowUpPending(l, tasks, '2026-09-21')).toBe(false)
  })

  it('is false for final lead statuses', () => {
    const l = lead({ status: 'lost' })
    const tasks = [task({ type: 'follow_up', dueDate: '2026-09-10' })]
    expect(isFollowUpPending(l, tasks, '2026-09-21')).toBe(false)
  })
})
