// Orca AI Team plugin worker (plain Node, no Electron).
// Activated on first command/event. Types `orca-team start ...` into a
// focused worktree terminal via the capability-gated host API.

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

async function pickTerminalId(orca, preferredId) {
  const ctx = await orca.host.call('workspace.readContext', {})
  if (!ctx) {
    return { error: 'No focused worktree. Open a worktree first.' }
  }
  const terminals = Array.isArray(ctx.terminals) ? ctx.terminals : []
  if (terminals.length === 0) {
    return {
      error: `Worktree "${ctx.displayName}" has no terminals. Open a shell tab, then retry.`,
      context: ctx
    }
  }
  if (preferredId && terminals.some((t) => t.id === preferredId)) {
    return { terminalId: preferredId, context: ctx }
  }
  return { terminalId: terminals[0].id, context: ctx }
}

async function startAiTeam(orca, args = {}) {
  const sameTab = Boolean(args?.sameTab)
  const objective = typeof args?.objective === 'string' ? args.objective : ''
  const preferredTerminalId =
    typeof args?.terminalId === 'string' ? args.terminalId : undefined

  const picked = await pickTerminalId(orca, preferredTerminalId)
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

  await orca.host.call('storage.set', {
    key: 'lastStart',
    value: {
      at: Date.now(),
      terminalId: picked.terminalId,
      command,
      worktree: picked.context?.displayName ?? null
    }
  })

  return {
    ok: Boolean(send?.accepted),
    terminalId: picked.terminalId,
    command,
    worktree: picked.context?.displayName ?? null
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
