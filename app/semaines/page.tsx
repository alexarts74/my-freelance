import { getSemaines, getClients, addSemaine, updateSemaine, deleteSemaine } from '@/lib/data'
import { redirect } from 'next/navigation'

function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr)
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000)
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
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

export default async function SemainesPage() {
  const [semaines, clients] = await Promise.all([getSemaines(), getClients()])
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.nom]))

  async function handleAdd(formData: FormData) {
    'use server'
    const clientId = formData.get('clientId') as string
    const dateRef = formData.get('dateRef') as string
    const missions = formData.get('missions') as string
    const previsionnel = formData.get('previsionnel') as string

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

    await addSemaine({
      id: `${clientId}-s${numero}-${Date.now()}`,
      clientId,
      numero,
      periode: { du: monday, au: friday },
      jours,
      missions,
      previsionnelSemaineSuivante: previsionnel || undefined,
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
    const missions = formData.get('missions') as string
    const previsionnel = formData.get('previsionnel') as string

    const jours = {
      lundi: formData.get('lundi') === 'on',
      mardi: formData.get('mardi') === 'on',
      mercredi: formData.get('mercredi') === 'on',
      jeudi: formData.get('jeudi') === 'on',
      vendredi: formData.get('vendredi') === 'on',
    }

    await updateSemaine({
      id,
      clientId,
      numero,
      periode: { du, au },
      jours,
      missions,
      previsionnelSemaineSuivante: previsionnel || undefined,
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
            <label className="label">Date dans la semaine</label>
            <input type="date" name="dateRef" required className="input" />
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
          <textarea name="missions" rows={3} className="input"
            placeholder="Description des missions..." />
        </div>

        <div>
          <label className="label">Prévisionnel semaine suivante</label>
          <textarea name="previsionnel" rows={2} className="input"
            placeholder="Optionnel..." />
        </div>

        <button type="submit" className="btn btn-accent">
          Enregistrer la semaine
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {semaines.slice().reverse().map((s, i) => {
          const nbJours = Object.values(s.jours).filter(Boolean).length
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
                  {s.missions && (
                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {s.missions}
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
                    <textarea name="missions" rows={3} defaultValue={s.missions} className="input" />
                  </div>
                  <div>
                    <label className="label">Prévisionnel</label>
                    <textarea name="previsionnel" rows={2}
                      defaultValue={s.previsionnelSemaineSuivante || ''}
                      className="input"
                      placeholder="Prévisionnel..." />
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
