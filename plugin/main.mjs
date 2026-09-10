// Orca AI Team plugin worker (plain Node, no Electron).
// Activated on first command/event. Types `orca-team start ...` into a
// worktree terminal via the capability-gated host API.
//
// Note: third-party plugins cannot declare `workspace:read`, so this worker
// does not call workspace.readContext. Pass terminalId (panel) or reuse the
// last successful terminal from plugin storage.

function buildStartCommand({ sameTab = false, objective = '' } = {}) {
  // Default CLI layout is dual (orch tab + workers tab). Only pass --same-tab when asked.
  const parts = ['orca-team', 'start']
  if (sameTab) parts.push('--same-tab')
  const goal = typeof objective === 'string' ? objective.trim() : ''
  if (goal) {
    // Keep shell-safe single quotes for the typed command.
    const escaped = goal.replace(/'/g, `'\"'\"'`)
    parts.push('--objective', `'${escaped}'`)
  }
  return parts.join(' ')
}

async function loadLastTerminalId(orca) {
  try {
    const got = await orca.host.call('storage.get', { key: 'lastStart' })
    const value = got?.value
    if (value && typeof value === 'object' && typeof value.terminalId === 'string') {
      const id = value.terminalId.trim()
      if (id) return id
    }
  } catch {
    // storage miss / denied — fall through
  }
  return null
}

async function resolveTerminalId(orca, preferredId) {
  if (preferredId && String(preferredId).trim()) {
    return { terminalId: String(preferredId).trim(), source: 'arg' }
  }
  const last = await loadLastTerminalId(orca)
  if (last) {
    return { terminalId: last, source: 'storage' }
  }
  return {
    error:
      'No terminal id. Open the AI Team panel, paste a terminal id from `orca terminal list --json`, then Start. Or pass terminalId to the command.'
  }
}

async function startAiTeam(orca, args = {}) {
  const sameTab = Boolean(args?.sameTab)
  const objective = typeof args?.objective === 'string' ? args.objective : ''
  const preferredTerminalId =
    typeof args?.terminalId === 'string' ? args.terminalId : undefined

  const picked = await resolveTerminalId(orca, preferredTerminalId)
  if (picked.error) {
    await orca.host.call('notifications.show', {
      title: 'AI Team',
      body: picked.error
    })
    return { ok: false, error: picked.error }
  }

  const command = buildStartCommand({ sameTab, objective })
  const send = await orca.host.call('terminal.sendText', {
    terminalId: picked.terminalId,
    text: command,
    enter: true
  })

  const body = send?.accepted
    ? `Typed into ${picked.terminalId}: ${command}`
    : `Failed to type into ${picked.terminalId}`

  await orca.host.call('notifications.show', {
    title: 'AI Team',
    body
  })

  if (send?.accepted) {
    await orca.host.call('storage.set', {
      key: 'lastStart',
      value: {
        at: Date.now(),
        terminalId: picked.terminalId,
        command,
        source: picked.source
      }
    })
  }

  return {
    ok: Boolean(send?.accepted),
    terminalId: picked.terminalId,
    command,
    source: picked.source
  }
}

export default function activate(orca) {
  orca.commands.register('start-ai-team', async (args) => {
    return startAiTeam(orca, { ...(args ?? {}), sameTab: true })
  })

  orca.commands.register('start-ai-team-tabs', async (args) => {
    return startAiTeam(orca, { ...(args ?? {}), sameTab: false })
  })

  orca.events.on('worktree.created', async (payload) => {
    orca.log(`worktree created: ${payload?.worktreeId ?? '?'} at ${payload?.path ?? '?'}`)
  })
}
