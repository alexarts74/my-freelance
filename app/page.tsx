import { getSemaines, getClients, getFactures } from '@/lib/data'
import Link from 'next/link'

export default async function Dashboard() {
  const [semaines, clients, factures] = await Promise.all([
    getSemaines(),
    getClients(),
    getFactures(),
  ])

  const recentSemaines = semaines.slice(-5).reverse()
  const recentFactures = factures.slice(-5).reverse()

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.nom]))

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <h1
          className="font-serif text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Vue d&apos;ensemble de votre activité freelance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card stat-card stat-card-accent p-5 animate-fade-up stagger-1">
          <div
            className="font-serif text-3xl tracking-tight"
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {clients.length}
          </div>
          <div
            className="text-xs font-semibold uppercase tracking-wider mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Clients
          </div>
        </div>
        <div className="card stat-card stat-card-teal p-5 animate-fade-up stagger-2">
          <div
            className="font-serif text-3xl tracking-tight"
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {semaines.length}
          </div>
          <div
            className="text-xs font-semibold uppercase tracking-wider mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Semaines saisies
          </div>
        </div>
        <div className="card stat-card stat-card-dark p-5 animate-fade-up stagger-3">
          <div
            className="font-serif text-3xl tracking-tight"
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {factures.length}
          </div>
          <div
            className="text-xs font-semibold uppercase tracking-wider mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Factures
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 animate-fade-up stagger-4">
        <Link href="/semaines" className="btn btn-accent">
          + Nouvelle semaine
        </Link>
        <Link href="/factures" className="btn btn-teal">
          + Nouvelle facture
        </Link>
      </div>

      {/* Recent weeks */}
      <section className="animate-fade-up stagger-5">
        <h2 className="section-title mb-4">Semaines récentes</h2>
        {recentSemaines.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucune semaine saisie
          </p>
        ) : (
          <div className="space-y-2">
            {recentSemaines.map((s, i) => {
              const nbJours = Object.values(s.jours).filter(Boolean).length
              return (
                <div
                  key={s.id}
                  className={`card card-interactive p-4 flex items-center justify-between animate-slide-in stagger-${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="font-serif text-lg"
                      style={{ color: 'var(--text-primary)', fontWeight: 400 }}
                    >
                      S{s.numero}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {clientMap[s.clientId] || s.clientId}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {s.periode.du} &rarr; {s.periode.au}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--teal)' }}
                    >
                      {nbJours}j
                    </span>
                    <a
                      href={`/api/pdf/fiche-suivi?id=${s.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      PDF
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent invoices */}
      <section className="animate-fade-up stagger-6">
        <h2 className="section-title mb-4">Factures récentes</h2>
        {recentFactures.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucune facture générée
          </p>
        ) : (
          <div className="space-y-2">
            {recentFactures.map((f, i) => (
              <div
                key={f.id}
                className={`card card-interactive p-4 flex items-center justify-between animate-slide-in stagger-${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-serif text-lg"
                    style={{ color: 'var(--text-primary)', fontWeight: 400 }}
                  >
                    {f.numero}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {clientMap[f.clientId] || f.clientId}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {f.mois}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {f.totalHT}&euro;
                  </span>
                  <span
                    className={`badge ${
                      f.status === 'payee'
                        ? 'badge-paid'
                        : f.status === 'envoyee'
                          ? 'badge-sent'
                          : 'badge-draft'
                    }`}
                  >
                    {f.status}
                  </span>
                  <a
                    href={`/api/pdf/facture?id=${f.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
