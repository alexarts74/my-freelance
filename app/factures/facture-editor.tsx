'use client'

import { useState } from 'react'
import type { Facture, Semaine } from '@/lib/types'
import { updateFactureSemaines, handleStatusUpdate } from './actions'

interface FactureEditorProps {
  facture: Facture
  clientSemaines: Semaine[]
  clientName: string
  statusLabel: Record<string, string>
  statusBadge: Record<string, string>
}

export default function FactureEditor({ facture, clientSemaines, clientName, statusLabel, statusBadge }: FactureEditorProps) {
  const [editing, setEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(facture.semaineIds)

  const f = facture

  function toggleSemaine(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const calculatedJours = clientSemaines
    .filter(s => selectedIds.includes(s.id))
    .reduce((acc, s) => acc + Object.values(s.jours).filter(Boolean).length, 0)
  const calculatedHT = calculatedJours * f.tjm

  async function handleSave() {
    await updateFactureSemaines(f.id, selectedIds)
  }

  function handleCancel() {
    setSelectedIds(facture.semaineIds)
    setEditing(false)
  }

  return (
    <div className="card card-interactive p-5">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span
              className="font-serif text-lg"
              style={{ color: 'var(--text-primary)', fontWeight: 400 }}
            >
              {f.numero}
            </span>
            <span className={`badge ${statusBadge[f.status] || 'badge-draft'}`}>
              {statusLabel[f.status] || f.status}
            </span>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {clientName} — {f.mois}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {editing ? calculatedJours : f.totalJours} jour{(editing ? calculatedJours : f.totalJours) > 1 ? 's' : ''} &times; {f.tjm}&euro; ={' '}
            <strong style={{ color: 'var(--accent)' }}>{editing ? calculatedHT : f.totalHT}&euro;</strong>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Émise le {f.dateEmission}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!editing && (
            <>
              <form action={handleStatusUpdate} className="flex items-center gap-2">
                <input type="hidden" name="id" value={f.id} />
                <select name="status" defaultValue={f.status} className="input btn-sm" style={{ width: 'auto', padding: '4px 30px 4px 10px', fontSize: '0.75rem' }}>
                  <option value="brouillon">Brouillon</option>
                  <option value="envoyee">Envoyée</option>
                  <option value="payee">Payée</option>
                </select>
                <button type="submit" className="btn btn-ghost btn-sm">
                  MAJ
                </button>
              </form>
              <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
                Modifier
              </button>
              <a href={`/api/pdf/facture?id=${f.id}`} className="btn btn-ghost btn-sm">
                PDF
              </a>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Semaines incluses
          </h3>
          {clientSemaines.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucune semaine trouvée pour ce client
            </p>
          ) : (
            <div className="space-y-2">
              {clientSemaines.map(s => {
                const nbJours = Object.values(s.jours).filter(Boolean).length
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                    style={{
                      background: selectedIds.includes(s.id) ? 'var(--bg-elevated)' : 'transparent',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleSemaine(s.id)}
                      className="accent-[var(--accent)]"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      S{s.numero} — {s.periode.du} au {s.periode.au} — {nbJours}j
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave} className="btn btn-teal btn-sm" disabled={selectedIds.length === 0}>
              Enregistrer
            </button>
            <button onClick={handleCancel} className="btn btn-ghost btn-sm">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
