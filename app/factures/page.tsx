import { getSemaines, getClients, getFactures } from '@/lib/data'
import GenerateForm from './generate-form'
import FactureEditor from './facture-editor'

export default async function FacturesPage() {
  const [semaines, clients, factures] = await Promise.all([
    getSemaines(), getClients(), getFactures()
  ])
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.nom]))

  const availableMonths = [...new Set(semaines.flatMap(s => {
    const du = s.periode.du.substring(0, 7)
    const au = s.periode.au.substring(0, 7)
    return du === au ? [du] : [du, au]
  }))].sort().reverse()

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
      <GenerateForm clients={clients} availableMonths={availableMonths} />

      {/* Invoice list */}
      <div className="space-y-3">
        {factures.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucune facture générée
          </p>
        ) : (
          factures.slice().reverse().map((f, i) => {
            const clientSemaines = semaines.filter(s => s.clientId === f.clientId)
            return (
              <div key={f.id} className={`animate-fade-up stagger-${Math.min(i + 2, 6)}`}>
                <FactureEditor
                  facture={f}
                  clientSemaines={clientSemaines}
                  clientName={clientMap[f.clientId] || f.clientId}
                  statusLabel={statusLabel}
                  statusBadge={statusBadge}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
