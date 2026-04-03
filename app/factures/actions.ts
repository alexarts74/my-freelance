'use server'

import { redirect } from 'next/navigation'
import { getSemaines, getClients, getNextNumeroFacture, addFacture, getFactures, updateFacture } from '@/lib/data'

export async function handleGenerate(prevState: { error?: string } | null, formData: FormData) {
  const clientId = formData.get('clientId') as string
  const mois = formData.get('mois') as string
  if (!clientId || !mois) return { error: 'Veuillez sélectionner un client et un mois' }

  const allSemaines = await getSemaines()

  const semainesDuMois = allSemaines.filter(s => {
    if (s.clientId !== clientId) return false
    const duMonth = s.periode.du.substring(0, 7)
    const auMonth = s.periode.au.substring(0, 7)
    return duMonth === mois || auMonth === mois
  })

  if (semainesDuMois.length === 0) return { error: 'Aucune semaine saisie pour ce client sur ce mois' }

  const totalJours = semainesDuMois.reduce(
    (acc, s) => acc + Object.values(s.jours).filter(Boolean).length, 0
  )
  const allClients = await getClients()
  const client = allClients.find(c => c.id === clientId)
  const tjm = client?.tjm ?? 300
  const year = parseInt(mois.split('-')[0], 10)
  const numero = await getNextNumeroFacture(year)

  await addFacture({
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

export async function handleStatusUpdate(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as 'brouillon' | 'envoyee' | 'payee'

  const allFactures = await getFactures()
  const facture = allFactures.find(f => f.id === id)
  if (!facture) return

  await updateFacture({ ...facture, status })
  redirect('/factures')
}

export async function updateFactureSemaines(factureId: string, semaineIds: string[]) {
  const [allFactures, allSemaines] = await Promise.all([getFactures(), getSemaines()])
  const facture = allFactures.find(f => f.id === factureId)
  if (!facture) return

  const selectedSemaines = allSemaines.filter(s => semaineIds.includes(s.id))
  const totalJours = selectedSemaines.reduce(
    (acc, s) => acc + Object.values(s.jours).filter(Boolean).length, 0
  )
  const totalHT = totalJours * facture.tjm

  await updateFacture({
    ...facture,
    semaineIds,
    totalJours,
    totalHT,
  })
  redirect('/factures')
}
