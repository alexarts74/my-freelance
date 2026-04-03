'use client'

import { useActionState } from 'react'
import { handleGenerate } from './actions'
import type { Client } from '@/lib/types'

export default function GenerateForm({
  clients,
  availableMonths,
}: {
  clients: Client[]
  availableMonths: string[]
}) {
  const [state, formAction, pending] = useActionState(handleGenerate, null)

  return (
    <form action={formAction} className="card p-6 space-y-5 animate-fade-up stagger-1">
      <h2 className="section-title">Générer une facture</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Client</label>
          <select name="clientId" required className="input">
            <option value="">Sélectionner...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Mois</label>
          <input type="month" name="mois" required className="input" />
        </div>
      </div>

      {availableMonths.length > 0 && (
        <div
          className="text-sm px-4 py-3 rounded-lg"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
          }}
        >
          Mois avec des semaines saisies : {availableMonths.join(', ')}
        </div>
      )}

      {state?.error && (
        <div
          className="text-sm px-4 py-3 rounded-lg"
          style={{
            color: 'var(--accent-red)',
            background: 'color-mix(in srgb, var(--accent-red) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-red) 20%, transparent)',
          }}
        >
          {state.error}
        </div>
      )}

      <button type="submit" className="btn btn-teal" disabled={pending}>
        {pending ? 'Génération...' : 'Générer la facture'}
      </button>
    </form>
  )
}
