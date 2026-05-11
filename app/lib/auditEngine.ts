// ============================================================
// TYPES — the shape of data going in and coming out
// ============================================================

export type ToolEntry = {
  tool: string
  plan: string
  seats: number
  monthlySpend: number
}

export type FormState = {
  tools: ToolEntry[]
  teamSize: number
  useCase: string
}

// One finding = one recommendation for one tool
export type AuditFinding = {
  tool: string           // display name e.g. "Claude"
  plan: string           // current plan e.g. "Team"
  currentSpend: number   // what they pay now per month
  recommendedAction: string  // what to do
  recommendedTool?: string   // if switching tools entirely
  monthlySavings: number     // how much saved per month
  annualSavings: number      // monthlySavings × 12
  reason: string             // one sentence explanation
  status: 'overspending' | 'optimal' | 'switch'
}

// The full output of the engine
export type AuditResult = {
  findings: AuditFinding[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  useCase: string
  teamSize: number
}

// ============================================================
// PRICING DATA — official prices as of May 2025
// Every number here must go in your PRICING_DATA.md
// ============================================================

const PRICING = {
  cursor: {
    hobby: 0,
    pro: 20,      // per user/month — cursor.com/pricing
    business: 40, // per user/month
    enterprise: 100
  },
  github_copilot: {
    individual: 10,  // per user/month — github.com/features/copilot
    business: 19,
    enterprise: 39
  },
  claude: {
    free: 0,
    pro: 20,     // per user/month — anthropic.com/claude/pricing
    max: 100,
    team: 30,    // per user/month, min 5 seats
    enterprise: 60
  },
  chatgpt: {
    free: 0,
    plus: 20,    // per user/month — openai.com/chatgpt/pricing
    team: 30,    // per user/month, min 2 seats
    enterprise: 60
  },
  gemini: {
    free: 0,
    pro: 20,     // per user/month — one.google.com/about/plans
    ultra: 30
  },
  windsurf: {
    free: 0,
    pro: 15,     // per user/month — codeium.com/windsurf/pricing
    team: 35
  }
}

// ============================================================
// HELPER — turns tool key into display name
// ============================================================

function displayName(tool: string): string {
  const names: Record<string, string> = {
    cursor: 'Cursor',
    github_copilot: 'GitHub Copilot',
    claude: 'Claude',
    chatgpt: 'ChatGPT',
    anthropic_api: 'Anthropic API',
    openai_api: 'OpenAI API',
    gemini: 'Gemini',
    windsurf: 'Windsurf'
  }
  return names[tool] || tool
}

// ============================================================
// THE CORE ENGINE — one function per tool
// ============================================================

function auditCursor(entry: ToolEntry, teamSize: number): AuditFinding {
  const base: AuditFinding = {
    tool: 'Cursor',
    plan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: '',
    monthlySavings: 0,
    annualSavings: 0,
    reason: '',
    status: 'optimal'
  }

  const pricePerSeat = entry.seats > 0 ? entry.monthlySpend / entry.seats : 0

  // If they're on Business but team is small (under 5), Pro is enough
  if (entry.plan === 'business' && entry.seats < 5) {
    const savings = (PRICING.cursor.business - PRICING.cursor.pro) * entry.seats
    return {
      ...base,
      recommendedAction: `Downgrade to Cursor Pro ($${PRICING.cursor.pro}/user)`,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Business plan costs $${PRICING.cursor.business}/user but Pro ($${PRICING.cursor.pro}/user) covers all core features for teams under 5.`,
      status: 'overspending'
    }
  }

  // If they're overpaying vs official price (e.g. reseller markup)
  if (entry.plan === 'pro' && pricePerSeat > PRICING.cursor.pro * 1.1) {
    const savings = (pricePerSeat - PRICING.cursor.pro) * entry.seats
    return {
      ...base,
      recommendedAction: 'Buy Cursor Pro directly at official pricing',
      monthlySavings: Math.round(savings),
      annualSavings: Math.round(savings) * 12,
      reason: `You're paying $${pricePerSeat.toFixed(0)}/user but official Pro price is $${PRICING.cursor.pro}/user.`,
      status: 'overspending'
    }
  }

  return {
    ...base,
    recommendedAction: 'No change needed',
    reason: 'Your Cursor plan is well-matched to your team size.',
    status: 'optimal'
  }
}

function auditClaude(entry: ToolEntry, teamSize: number, useCase: string): AuditFinding {
  const base: AuditFinding = {
    tool: 'Claude',
    plan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: '',
    monthlySavings: 0,
    annualSavings: 0,
    reason: '',
    status: 'optimal'
  }

  // Team plan costs $30/user but requires min 5 seats
  // If they have 2-3 users, Pro at $20/user is cheaper
  if (entry.plan === 'team' && entry.seats <= 3) {
    const currentCost = PRICING.claude.team * entry.seats
    const recommendedCost = PRICING.claude.pro * entry.seats
    const savings = currentCost - recommendedCost
    return {
      ...base,
      recommendedAction: `Switch to ${entry.seats}× Claude Pro ($${PRICING.claude.pro}/user)`,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Team plan ($${PRICING.claude.team}/user) is designed for 5+ users. With ${entry.seats} users, individual Pro plans save $${savings}/month.`,
      status: 'overspending'
    }
  }

  // If they're on Max but use case isn't heavy research/data
  if (entry.plan === 'max' && useCase !== 'research' && useCase !== 'data') {
    const savings = (PRICING.claude.max - PRICING.claude.pro) * entry.seats
    return {
      ...base,
      recommendedAction: `Downgrade to Claude Pro ($${PRICING.claude.pro}/user)`,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Claude Max ($${PRICING.claude.max}/user) is for extremely heavy usage. For ${useCase} use cases, Pro is sufficient.`,
      status: 'overspending'
    }
  }

  return {
    ...base,
    recommendedAction: 'No change needed',
    reason: 'Your Claude plan is appropriate for your usage.',
    status: 'optimal'
  }
}

function auditChatGPT(entry: ToolEntry, teamSize: number): AuditFinding {
  const base: AuditFinding = {
    tool: 'ChatGPT',
    plan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: '',
    monthlySavings: 0,
    annualSavings: 0,
    reason: '',
    status: 'optimal'
  }

  // Team plan at $30/user vs Plus at $20/user — if small team
  if (entry.plan === 'team' && entry.seats <= 3) {
    const savings = (PRICING.chatgpt.team - PRICING.chatgpt.plus) * entry.seats
    return {
      ...base,
      recommendedAction: `Switch to ${entry.seats}× ChatGPT Plus ($${PRICING.chatgpt.plus}/user)`,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `ChatGPT Team ($${PRICING.chatgpt.team}/user) adds collaboration features you likely don't need with ${entry.seats} users. Plus saves $${savings}/month.`,
      status: 'overspending'
    }
  }

  // If use case is coding — suggest Cursor or Copilot instead
  if ((entry.plan === 'plus' || entry.plan === 'team') && teamSize <= 5) {
    return {
      ...base,
      recommendedAction: 'Consider switching to GitHub Copilot for coding',
      recommendedTool: 'GitHub Copilot',
      monthlySavings: (PRICING.chatgpt.plus - PRICING.github_copilot.individual) * entry.seats,
      annualSavings: (PRICING.chatgpt.plus - PRICING.github_copilot.individual) * entry.seats * 12,
      reason: `GitHub Copilot ($${PRICING.github_copilot.individual}/user) is purpose-built for coding and costs less than ChatGPT Plus for the same use case.`,
      status: 'switch'
    }
  }

  return {
    ...base,
    recommendedAction: 'No change needed',
    reason: 'Your ChatGPT plan fits your current usage.',
    status: 'optimal'
  }
}

function auditGitHubCopilot(entry: ToolEntry): AuditFinding {
  const base: AuditFinding = {
    tool: 'GitHub Copilot',
    plan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: '',
    monthlySavings: 0,
    annualSavings: 0,
    reason: '',
    status: 'optimal'
  }

  if (entry.plan === 'enterprise' && entry.seats < 10) {
    const savings = (PRICING.github_copilot.enterprise - PRICING.github_copilot.business) * entry.seats
    return {
      ...base,
      recommendedAction: `Downgrade to GitHub Copilot Business ($${PRICING.github_copilot.business}/user)`,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason: `Enterprise tier ($${PRICING.github_copilot.enterprise}/user) is for large orgs needing policy controls. Business covers all core features for teams under 10.`,
      status: 'overspending'
    }
  }

  return {
    ...base,
    recommendedAction: 'No change needed',
    reason: 'GitHub Copilot is well-priced for your team size.',
    status: 'optimal'
  }
}

function auditGeneric(entry: ToolEntry): AuditFinding {
  // For tools we don't have specific rules for yet
  return {
    tool: displayName(entry.tool),
    plan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedAction: 'Manual review recommended',
    monthlySavings: 0,
    annualSavings: 0,
    reason: 'No automated rules exist for this tool yet. Review pricing manually.',
    status: 'optimal'
  }
}

// ============================================================
// MAIN EXPORT — this is what page.tsx will call
// ============================================================

export function runAudit(formData: FormState): AuditResult {
  const findings: AuditFinding[] = []

  // Loop through every tool the user entered
  for (const entry of formData.tools) {
    if (!entry.tool) continue // skip empty rows

    let finding: AuditFinding

    // Route each tool to its specific audit function
    switch (entry.tool) {
      case 'cursor':
        finding = auditCursor(entry, formData.teamSize)
        break
      case 'claude':
        finding = auditClaude(entry, formData.teamSize, formData.useCase)
        break
      case 'chatgpt':
        finding = auditChatGPT(entry, formData.teamSize)
        break
      case 'github_copilot':
        finding = auditGitHubCopilot(entry)
        break
      default:
        finding = auditGeneric(entry)
    }

    findings.push(finding)
  }

  // Add up total savings across all tools
  const totalMonthlySavings = findings.reduce((sum, f) => sum + f.monthlySavings, 0)

  return {
    findings,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    useCase: formData.useCase,
    teamSize: formData.teamSize
  }
}