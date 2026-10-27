import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { CheckResult, Fact, FactSource } from '../types'

const PANE = 'work-method'

const facts = atom({ plugin: 'work-method', key: 'facts' } as const, [] as Fact[], {
  shape: 'facts-1',
})
const lastCheck = atom(
  { plugin: 'work-method', key: 'lastCheck' } as const,
  null as CheckResult | null,
  { shape: 'check-1' },
)

const SOURCE_LABEL: Record<FactSource, string> = {
  measured: 'you measured it',
  agreed: 'you agreed / closed it',
  secondhand: 'someone told you',
  computed: 'Claude computed it',
  estimate: 'estimate',
}

// ---------------------------------------------------------------------------
// EDIT THIS. These are the working rules that enter every system prompt.
// They are a starting point drawn from a real audit of a long collaboration.
// Replace them with the rules your own work actually needs.
// ---------------------------------------------------------------------------
const RULES = `# Working method

These rules are binding for this session.

## Calibration
The usual failure is not too much caution — it is caution aimed the wrong way:
overconfidence in the domain where I am weak, overcaution in the domain that
belongs to the user. Before any warning, check which domain I am standing in.

## The person in between
Before raising a risk that comes from a gap between two numbers: is there a
person whose work produces one of them — a fitter, a driver, a supplier, the
user? If so, ask one direct question instead, without the word "risk".
If both numbers come from my own output, the comparison is valid: check it.

## Threshold for raising a risk
Raise one only for something irreversible after purchase or commitment that
cannot be checked by eye. Stay silent when the gap is only in my understanding,
or when the item is settled and nothing about money or physical fit turns on it.

## Authority
Final, not to be estimated over: what the user measured, prices and terms they
closed, their budget, their taste, what they approved and locked, when their
day ends.
Mine: arithmetic on their data, internal consistency of my own output, public
facts I verified against a source.
What the user reports a third party told them is second-hand — check it against
the source document, never by doubting the user.

## Running and stopping
No asking permission to continue in a direction already set.
Input the user sends mid-run is a stop order, not a comment: stop at once, say
in one line what changed, then run to the end without asking.

## Source admissibility
A source declared unreliable in one dimension is not a source for that
dimension. A drawing declared not to scale is good for topology and for the
figures written on it — never for measuring off it. Do not interpret a symbol;
enumerate it and ask.

## Permanent documents
Only verified results go in. An open suspicion stays in conversation or under a
heading marked as open. A risk that turns out not to exist is deleted from the
list, not downgraded. A new fact requires scanning the document for the old
value and every conclusion drawn from it.

## Delegation
A request for a sub-agent is carried out at once, without argument. A reading
that produces a physical impossibility, or two wrong readings of one source,
sends a fresh reader immediately. The fresh reader gets the raw source WITHOUT
my earlier interpretation — that interpretation is the contaminant — and a
prompt that explicitly authorises it to decide.

## Before presenting output
Run /check.`

const CHECKLIST = `Output check, before presenting:

1. Source — does every number carry a tag: measured by them / agreed / told to
   them / computed by me / estimate?
2. Internal consistency — does every label in the output match the geometry or
   the arithmetic of the output itself? This one is free and catches the most.
3. Closure — does every chain of figures sum? Does every enclosed area have a
   way in? Is every element not derived from a given figure marked an assumption?
4. The person in between — for each warning: is there a person whose work
   produces one of the numbers? If so, turn it into one direct question.
5. Settled items — does this reopen something already approved? Only with new
   information, an effect on money or physical fit, and a replacement in hand.
6. Given facts — does this contradict something the user stated? If so, they
   are right.`

/** Hedging language that has no place in a permanent document unverified. */
const SUSPICION = /(\brisk\b|\bmight\b|\bpossibly\b|\bunclear\b|\bprobably\b|סיכון|חשש|חשד|ייתכן|יתכן|כנראה|לא ברור|אולי)/gi
/** Numbers of three or more characters, or with a separator. */
const NUMBER = /\d[\d,.]{2,}/g

function parseSource(raw: string): FactSource {
  const s = raw.trim()
  if (/measur|מדד|מדיד|מדוד/i.test(s)) return 'measured'
  if (/agree|closed|סגר|סגור|תנאי/i.test(s)) return 'agreed'
  if (/second|told|vendor|ספק|נציג|אמר/i.test(s)) return 'secondhand'
  if (/comput|calc|חישוב|חושב/i.test(s)) return 'computed'

  return 'estimate'
}

/** The content being written, by tool. null = not a permanent destination. */
function contentOf(tool: string, input: Record<string, unknown>): string | null {
  const take = (key: string): string | null =>
    typeof input[key] === 'string' ? (input[key] as string) : null

  if (tool === 'Write') return take('content')
  if (tool === 'Edit') return take('new_string')
  if (tool === 'Projects') return input.method === 'project_write' ? take('content') : null
  if (tool.endsWith('memory_write') || tool.endsWith('memory_append')) return take('content')

  return null
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function inspect(tool: string, content: string, list: readonly Fact[]): CheckResult {
  const suspicions = (content.match(SUSPICION) ?? []).length

  // With an empty register there is nothing to compare against — stay quiet.
  let untagged = 0
  if (list.length > 0) {
    const known = list.map(one => one.value)
    const seen = new Set<string>()
    for (const raw of content.match(NUMBER) ?? []) {
      const num = raw.replace(/[.,]$/, '')
      if (seen.has(num)) continue
      seen.add(num)
      if (!known.some(value => value.includes(num))) untagged += 1
    }
  }

  return { tool, suspicions, untagged, at: today() }
}

function statusLine(locked: number, check: CheckResult | null): string | undefined {
  if (check === null) return locked > 0 ? `register: ${locked} locked` : undefined
  if (check.suspicions === 0 && check.untagged === 0) return `check: clean · ${locked} locked`

  return `check: ${check.suspicions} hedged · ${check.untagged} unsourced`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'facts',
      description: 'Open the register of locked facts',
    })
    await $.command.register({
      name: 'fact',
      description: 'Record a locked fact: /fact <value> | <source>',
    })
    await $.command.register({
      name: 'check',
      description: 'The output check, before presenting',
    })
    void $.ui.open({ id: PANE, title: 'Fact register' })

    return next(e)
  })

  // The rules and the locked facts enter every system prompt, so neither
  // depends on anything surviving a long conversation or a compaction.
  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const list = await read($, facts)
    const locked = list.filter(one => one.isLocked)
    const block =
      locked.length === 0
        ? ''
        : `\n\n## Locked facts — not to be estimated over\n${locked
            .map(one => `- ${one.value} — ${SOURCE_LABEL[one.source]} · ${one.at}`)
            .join('\n')}`

    return {
      sections: [
        ...composed.sections,
        { id: 'work-method:rules', text: RULES + block, scope: 'session' as const },
      ],
    }
  })

  on('command.run', { command: 'facts' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Fact register' })

    return { text: 'Fact register opened.' }
  })

  on('command.run', { command: 'check' }, async () => ({ text: CHECKLIST }))

  on('command.run', { command: 'fact' }, async ($, e) => {
    const [rawValue, rawSource] = e.args.split('|')
    const value = (rawValue ?? '').trim()
    if (value === '') {
      return {
        text: 'Usage: /fact <value> | <source>   — source: measured / agreed / told / computed / estimate',
      }
    }

    const fact: Fact = {
      id: `${Date.now()}`,
      value,
      source: parseSource(rawSource ?? ''),
      at: today(),
      isLocked: true,
    }
    await update($, facts, list => [...list, fact].slice(-120))
    await $.ui.open({ id: PANE, title: 'Fact register' })

    return { text: `Locked: ${value} — ${SOURCE_LABEL[fact.source]}` }
  })

  // The output check, on anything headed for a permanent destination.
  // It reports; it does not block. A mod that blocks gets switched off.
  on('tool.call', async ($, e, next) => {
    const content = contentOf(e.tool, e as unknown as Record<string, unknown>)
    if (content === null) return next(e)

    const list = await read($, facts)
    const result = inspect(e.tool, content, list)
    await update($, lastCheck, () => result)

    if (result.suspicions > 0 || result.untagged > 0) {
      void $.ui.toast(
        `check — ${e.tool}: ${result.suspicions} hedged · ${result.untagged} numbers not in the register`,
      )
    }
    $.ui.status(statusLine(list.filter(one => one.isLocked).length, result))

    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, facts)
    const check = await read($, lastCheck)
    const room = Math.max(3, (e.viewport?.rows ?? 24) - 10)
    const locked = list.filter(one => one.isLocked)

    return (
      <Box flexDirection="column">
        <Text bold>Locked facts — not to be estimated over</Text>
        {locked.length === 0 && <Text dimColor>Empty. /fact value | source</Text>}
        {locked.slice(-room).map(one => (
          <Text>
            {one.value} — {SOURCE_LABEL[one.source]}
          </Text>
        ))}

        <Box flexDirection="column" marginTop={1}>
          <Text bold>Last output check</Text>
          {check === null && <Text dimColor>Not run yet.</Text>}
          {check !== null && (
            <Text dimColor={check.suspicions === 0 && check.untagged === 0}>
              {check.tool}: {check.suspicions} hedged · {check.untagged} unsourced
            </Text>
          )}
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text bold>Calibration</Text>
          <Text dimColor>Overconfident where I am weak · overcautious where you are strong</Text>
          <Text dimColor>Who stands between the two numbers?</Text>
        </Box>
      </Box>
    )
  })
}
