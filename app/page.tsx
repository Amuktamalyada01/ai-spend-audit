'use client'
import { useState } from 'react'
import StepOne from './components/StepOne'
import AuditResults from './components/auditResults'
import { runAudit, FormState, AuditResult } from './lib/auditEngine'

export default function Home() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  function handleSubmit(data: FormState) {
    console.log('Form data:', JSON.stringify(data))
    const result = runAudit(data)
    console.log('Audit result:', JSON.stringify(result))
    setAuditResult(result)
}
return (
  <main className="min-h-screen bg-gray-100 bg-gray-100 py-10">
    {auditResult === null ? (
      <StepOne onSubmit={handleSubmit} />
    ) : (
      <AuditResults
        result={auditResult}
        onBack={() => setAuditResult(null)}
      />
    )}
    </main>
  )
}