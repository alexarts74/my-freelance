import { getSemaines, getClients, getFactures } from '@/lib/data'
import { redirect } from 'next/navigation'

export default async function FacturesPage() {
  const [semaines, clients, factures] = await Promise.all([
    getSemaines(), getClients(), getFactures()
  ])
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.nom]))

  async function handleGenerate(formData: FormData) {
    'use server'
    const clientId = formData.get('clientId') as string
    const mois = formData.get('mois') as string
    if (!clientId || !mois) return

    const { getSemaines: getSem, getNextNumeroFacture: getNext, addFacture: addF } = await import('@/lib/data')
    const allSemaines = await getSem()

    const semainesDuMois = allSemaines.filter(s => {
      if (s.clientId !== clientId) return false
      const weekMonth = s.periode.du.substring(0, 7)
      return weekMonth === mois
    })

    if (semainesDuMois.length === 0) return

    const totalJours = semainesDuMois.reduce(
      (acc, s) => acc + Object.values(s.jours).filter(Boolean).length, 0
    )
    const tjm = 300
    const year = parseInt(mois.split('-')[0], 10)
    const numero = await getNext(year)

    await addF({
      id: `facture-${Date.now()}`,
      numero,
      clientId,
      mois,
      semaineIds: semainesDuMois.map(s => s.id),
      totalJours,
      tjm,
      totalHT: totalJours * tjm,
      dateEmission: new Date().toISOString().split('T')[0],
      status: 'brouillon',
    })
    redirect('/factures')
  }

  async function handleStatusUpdate(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const status = formData.get('status') as 'brouillon' | 'envoyee' | 'payee'

    const { getFactures: getF, updateFacture: updateF } = await import('@/lib/data')
    const allFactures = await getF()
    const facture = allFactures.find(f => f.id === id)
    if (!facture) return

    await updateF({ ...facture, status })
    redirect('/factures')
  }

  const availableMonths = [...new Set(semaines.map(s => s.periode.du.substring(0, 7)))].sort().reverse()

  const statusLabel: Record<string, string> = {
    brouillon: 'Brouillon',
    envoyee: 'Envoyée',
    payee: 'Payée',
  }

  const statusBadge: Record<string, string> = {
    brouillon: 'badge-draft',
    envoyee: 'badge-sent',
    payee: 'badge-paid',
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <h1
          className="font-serif text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Factures
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Générez et suivez vos factures
        </p>
      </div>

      {/* Generate form */}
      <form action={handleGenerate} className="card p-6 space-y-5 animate-fade-up stagger-1">
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

        <button type="submit" className="btn btn-teal">
          Générer la facture
        </button>
      </form>

      {/* Invoice list */}
      <div className="space-y-3">
        {factures.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucune facture générée
          </p>
        ) : (
          factures.slice().reverse().map((f, i) => (
            <div
              key={f.id}
              className={`card card-interactive p-5 animate-fade-up stagger-${Math.min(i + 2, 6)}`}
            >
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
                    {clientMap[f.clientId] || f.clientId} — {f.mois}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {f.totalJours} jour{f.totalJours > 1 ? 's' : ''} &times; {f.tjm}&euro; ={' '}
                    <strong style={{ color: 'var(--accent)' }}>{f.totalHT}&euro;</strong>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Émise le {f.dateEmission}
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                  <a href={`/api/pdf/facture?id=${f.id}`} className="btn btn-ghost btn-sm">
                    PDF
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
