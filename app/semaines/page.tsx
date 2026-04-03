import { getSemaines, getClients, addSemaine, updateSemaine, deleteSemaine } from '@/lib/data'
import { redirect } from 'next/navigation'
import type { Mission } from '@/lib/types'
import { normalizeMissions, normalizePrevisions } from '@/lib/types'
import MissionsInput from './missions-input'
import PrevisionsInput from './previsions-input'

function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr)
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000)
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function formatShortDate(date: Date): string {
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${date.getDate()} ${months[date.getMonth()]}`
}

function getWeeksOfCurrentMonth(): { label: string; value: string }[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  // Find the Monday of the week containing the 1st of the month
  const startMonday = new Date(firstOfMonth)
  const dayOfWeek = startMonday.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startMonday.setDate(startMonday.getDate() + diff)

  const weeks: { label: string; value: string }[] = []
  const current = new Date(startMonday)

  while (true) {
    const monday = new Date(current)
    const friday = new Date(current)
    friday.setDate(friday.getDate() + 4)

    // Include if monday or friday falls within the current month
    const mondayInMonth = monday.getFullYear() === year && monday.getMonth() === month
    const fridayInMonth = friday.getFullYear() === year && friday.getMonth() === month

    if (!mondayInMonth && !fridayInMonth && monday > lastOfMonth) break

    if (mondayInMonth || fridayInMonth) {
      const weekNum = getISOWeekNumber(monday)
      const label = `Semaine ${weekNum} — lun. ${formatShortDate(monday)} → ven. ${formatShortDate(friday)}`
      const value = monday.toISOString().split('T')[0]
      weeks.push({ label, value })
    }

    current.setDate(current.getDate() + 7)
  }

  return weeks
}

function getMondayOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function getFridayOfWeek(mondayStr: string): string {
  const monday = new Date(mondayStr)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return friday.toISOString().split('T')[0]
}

const STATUT_LABELS: Record<Mission['statut'], string> = {
  livre: 'Livré',
  en_cours: 'En cours',
  a_faire: 'À faire',
}

export default async function SemainesPage() {
  const [semaines, clients] = await Promise.all([getSemaines(), getClients()])
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.nom]))

  async function handleAdd(formData: FormData) {
    'use server'
    const clientId = formData.get('clientId') as string
    const dateRef = formData.get('dateRef') as string

    if (!clientId || !dateRef) return

    const monday = getMondayOfWeek(dateRef)
    const friday = getFridayOfWeek(monday)
    const numero = getWeekNumber(dateRef)

    const jours = {
      lundi: formData.get('lundi') === 'on',
      mardi: formData.get('mardi') === 'on',
      mercredi: formData.get('mercredi') === 'on',
      jeudi: formData.get('jeudi') === 'on',
      vendredi: formData.get('vendredi') === 'on',
    }

    const missions: Mission[] = JSON.parse(formData.get('missions') as string || '[]')
    const previsions: string[] = JSON.parse(formData.get('previsions') as string || '[]')

    await addSemaine({
      id: `${clientId}-s${numero}-${Date.now()}`,
      clientId,
      numero,
      periode: { du: monday, au: friday },
      jours,
      missions,
      previsions,
    })
    redirect('/semaines')
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const clientId = formData.get('clientId') as string
    const numero = parseInt(formData.get('numero') as string, 10)
    const du = formData.get('du') as string
    const au = formData.get('au') as string

    const jours = {
      lundi: formData.get('lundi') === 'on',
      mardi: formData.get('mardi') === 'on',
      mercredi: formData.get('mercredi') === 'on',
      jeudi: formData.get('jeudi') === 'on',
      vendredi: formData.get('vendredi') === 'on',
    }

    const missions: Mission[] = JSON.parse(formData.get('missions') as string || '[]')
    const previsions: string[] = JSON.parse(formData.get('previsions') as string || '[]')

    await updateSemaine({
      id,
      clientId,
      numero,
      periode: { du, au },
      jours,
      missions,
      previsions,
    })
    redirect('/semaines')
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteSemaine(id)
    redirect('/semaines')
  }

  const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'] as const
  const weeks = getWeeksOfCurrentMonth()

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <h1
          className="font-serif text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Fiches de suivi hebdomadaire
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Saisissez vos semaines travaillées
        </p>
      </div>

      {/* Add form */}
      <form action={handleAdd} className="card p-6 space-y-5 animate-fade-up stagger-1">
        <h2 className="section-title">Nouvelle semaine</h2>

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
            <label className="label">Choisir une semaine</label>
            <select name="dateRef" required className="input">
              <option value="">Sélectionner...</option>
              {weeks.map(w => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Jours travaillés</label>
          <div className="flex gap-5 mt-1">
            {JOURS.map(jour => (
              <label key={jour} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name={jour} defaultChecked />
                <span style={{ color: 'var(--text-primary)' }}>
                  {jour.charAt(0).toUpperCase() + jour.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Missions et livrables réalisés</label>
          <MissionsInput />
        </div>

        <div>
          <label className="label">Prévisions semaine suivante</label>
          <PrevisionsInput />
        </div>

        <button type="submit" className="btn btn-accent">
          Enregistrer la semaine
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {semaines.slice().reverse().map((s, i) => {
          const nbJours = Object.values(s.jours).filter(Boolean).length
          const missions = normalizeMissions(s.missions as Mission[] | string)
          const previsions = normalizePrevisions(s.previsions)
          return (
            <div
              key={s.id}
              className={`card card-interactive p-5 animate-fade-up stagger-${Math.min(i + 2, 6)}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-serif text-lg"
                      style={{ color: 'var(--text-primary)', fontWeight: 400 }}
                    >
                      Semaine {s.numero}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {clientMap[s.clientId] || s.clientId}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {s.periode.du} &rarr; {s.periode.au}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--teal)' }}>
                    {nbJours} jour{nbJours > 1 ? 's' : ''} travaillé{nbJours > 1 ? 's' : ''}
                  </div>
                  {missions.length > 0 && (
                    <div className="mt-2">
                      <table className="text-sm w-full" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                            <th className="text-left pr-3 pb-1">Mission</th>
                            <th className="text-left pr-3 pb-1">Livrables</th>
                            <th className="text-left pb-1">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {missions.map((m, mi) => (
                            <tr key={mi} style={{ color: 'var(--text-secondary)' }}>
                              <td className="pr-3 py-0.5">{m.mission}</td>
                              <td className="pr-3 py-0.5">{m.livrables}</td>
                              <td className="py-0.5">{STATUT_LABELS[m.statut] || m.statut}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {previsions.length > 0 && previsions.some(p => p) && (
                    <div className="mt-2">
                      <div className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Prévisions</div>
                      <ul className="text-sm list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
                        {previsions.filter(p => p).map((p, pi) => (
                          <li key={pi}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/api/pdf/fiche-suivi?id=${s.id}`} className="btn btn-ghost btn-sm">
                    PDF
                  </a>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="btn btn-danger btn-sm">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>

              {/* Edit */}
              <details className="mt-4">
                <summary
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                >
                  Modifier
                </summary>
                <form action={handleUpdate} className="mt-3 space-y-4">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="clientId" value={s.clientId} />
                  <input type="hidden" name="numero" value={s.numero} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Du</label>
                      <input type="date" name="du" defaultValue={s.periode.du} className="input" />
                    </div>
                    <div>
                      <label className="label">Au</label>
                      <input type="date" name="au" defaultValue={s.periode.au} className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Jours travaillés</label>
                    <div className="flex gap-5 mt-1">
                      {JOURS.map(jour => (
                        <label key={jour} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" name={jour} defaultChecked={s.jours[jour]} />
                          <span style={{ color: 'var(--text-primary)' }}>
                            {jour.charAt(0).toUpperCase() + jour.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Missions</label>
                    <MissionsInput defaultValue={missions} />
                  </div>
                  <div>
                    <label className="label">Prévisions</label>
                    <PrevisionsInput defaultValue={previsions} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Enregistrer
                  </button>
                </form>
              </details>
            </div>
          )
        })}
      </div>
    </div>
  )
}
