'use client'

import { useState } from 'react'
import type { Mission } from '@/lib/types'

const STATUT_LABELS: Record<Mission['statut'], string> = {
  livre: 'Livré',
  en_cours: 'En cours',
  a_faire: 'À faire',
}

export default function MissionsInput({ defaultValue = [] }: { defaultValue?: Mission[] }) {
  const [missions, setMissions] = useState<Mission[]>(
    defaultValue.length > 0 ? defaultValue : [{ mission: '', livrables: '', statut: 'a_faire' }]
  )

  function add() {
    setMissions([...missions, { mission: '', livrables: '', statut: 'a_faire' }])
  }

  function remove(index: number) {
    setMissions(missions.filter((_, i) => i !== index))
  }

  function update(index: number, field: keyof Mission, value: string) {
    const updated = [...missions]
    updated[index] = { ...updated[index], [field]: value }
    setMissions(updated)
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="missions" value={JSON.stringify(missions)} />
      {missions.map((m, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-2 items-start">
          <input
            className="input"
            placeholder="Mission / Thématique"
            value={m.mission}
            onChange={e => update(i, 'mission', e.target.value)}
          />
          <input
            className="input"
            placeholder="Livrables / Travaux réalisés"
            value={m.livrables}
            onChange={e => update(i, 'livrables', e.target.value)}
          />
          <select
            className="input"
            value={m.statut}
            onChange={e => update(i, 'statut', e.target.value as Mission['statut'])}
          >
            {Object.entries(STATUT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => remove(i)}
            className="btn btn-danger btn-sm"
            style={{ marginTop: 2 }}
          >
            &times;
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-ghost btn-sm">
        + Ajouter une mission
      </button>
    </div>
  )
}
