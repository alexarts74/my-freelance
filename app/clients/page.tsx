import { getClients, addClient, updateClient, deleteClient } from '@/lib/data'
import { redirect } from 'next/navigation'

export default async function ClientsPage() {
  const clients = await getClients()

  async function handleAdd(formData: FormData) {
    'use server'
    const nom = formData.get('nom') as string
    const adresse = formData.get('adresse') as string
    const contact = formData.get('contact') as string
    const email = formData.get('email') as string
    if (!nom) return

    await addClient({
      id: nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      nom,
      adresse,
      contact,
      email: email || undefined,
    })
    redirect('/clients')
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const nom = formData.get('nom') as string
    const adresse = formData.get('adresse') as string
    const contact = formData.get('contact') as string
    const email = formData.get('email') as string

    await updateClient({ id, nom, adresse, contact, email: email || undefined })
    redirect('/clients')
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteClient(id)
    redirect('/clients')
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-up">
        <h1
          className="font-serif text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Clients
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Gérez votre portefeuille clients
        </p>
      </div>

      {/* Add form */}
      <form action={handleAdd} className="card p-6 space-y-5 animate-fade-up stagger-1">
        <h2 className="section-title">Ajouter un client</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nom / Raison sociale</label>
            <input name="nom" placeholder="Ex: Acme Corp" required className="input" />
          </div>
          <div>
            <label className="label">Référent (contact)</label>
            <input name="contact" placeholder="Ex: Jean Dupont" className="input" />
          </div>
          <div>
            <label className="label">Adresse</label>
            <input name="adresse" placeholder="Ex: 12 rue de Paris, 75001" className="input" />
          </div>
          <div>
            <label className="label">Email (optionnel)</label>
            <input name="email" type="email" placeholder="Ex: contact@acme.com" className="input" />
          </div>
        </div>
        <button type="submit" className="btn btn-accent">
          Ajouter le client
        </button>
      </form>

      {/* Client list */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucun client enregistré
          </p>
        ) : (
          clients.map((client, i) => (
            <div
              key={client.id}
              className={`card card-interactive p-5 animate-fade-up stagger-${Math.min(i + 2, 6)}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div
                    className="font-serif text-lg"
                    style={{ color: 'var(--text-primary)', fontWeight: 400 }}
                  >
                    {client.nom}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {client.adresse}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Référent : {client.contact}
                  </div>
                  {client.email && (
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {client.email}
                    </div>
                  )}
                </div>
                <form action={handleDelete}>
                  <input type="hidden" name="id" value={client.id} />
                  <button type="submit" className="btn btn-danger btn-sm">
                    Supprimer
                  </button>
                </form>
              </div>

              {/* Edit form */}
              <details className="mt-4">
                <summary
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                >
                  Modifier
                </summary>
                <form action={handleUpdate} className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="hidden" name="id" value={client.id} />
                  <div>
                    <label className="label">Nom</label>
                    <input name="nom" defaultValue={client.nom} required className="input" />
                  </div>
                  <div>
                    <label className="label">Contact</label>
                    <input name="contact" defaultValue={client.contact} className="input" />
                  </div>
                  <div>
                    <label className="label">Adresse</label>
                    <input name="adresse" defaultValue={client.adresse} className="input" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input name="email" defaultValue={client.email || ''} className="input" />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn btn-primary">
                      Enregistrer
                    </button>
                  </div>
                </form>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
