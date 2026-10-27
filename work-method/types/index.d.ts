/** One fact in the register: the value, who it came from, when, and whether it is locked. */
export type Fact = {
  id: string
  /** The value itself, as given. */
  value: string
  /** Where it came from. This is the field the whole mod turns on. */
  source: FactSource
  /** Date recorded, YYYY-MM-DD. */
  at: string
  /** Locked = final; not reopened without the user asking. */
  isLocked: boolean
}

export type FactSource = 'measured' | 'agreed' | 'secondhand' | 'computed' | 'estimate'

/** The result of the output check that runs before a write to a permanent destination. */
export type CheckResult = {
  tool: string
  /** Hedging expressions found in the content. */
  suspicions: number
  /** Numbers in the content with no row in the register. */
  untagged: number
  at: string
}

declare module 'claude-code' {
  interface PluginState {
    'work-method': {
      facts: Shaped<Fact[]>
      lastCheck: Shaped<CheckResult | null>
    }
  }
}
