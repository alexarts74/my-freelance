export interface Client {
  id: string
  nom: string
  adresse: string
  contact: string
  email?: string
  tjm: number
}

export interface JoursTravailles {
  lundi: boolean
  mardi: boolean
  mercredi: boolean
  jeudi: boolean
  vendredi: boolean
}

export interface Mission {
  mission: string
  livrables: string
  statut: 'livre' | 'en_cours' | 'a_faire'
}

export interface Semaine {
  id: string
  clientId: string
  numero: number
  periode: { du: string; au: string }
  jours: JoursTravailles
  missions: Mission[]
  previsions: string[]
}

export function normalizeMissions(m: Mission[] | string): Mission[] {
  if (Array.isArray(m)) return m
  if (!m || typeof m !== 'string') return []
  return [{ mission: m, livrables: '', statut: 'livre' as const }]
}

export function normalizePrevisions(s: string[] | string | undefined): string[] {
  if (Array.isArray(s)) return s
  if (!s || typeof s !== 'string') return []
  return [s]
}

export interface Facture {
  id: string
  numero: string
  clientId: string
  mois: string
  semaineIds: string[]
  totalJours: number
  tjm: number
  totalHT: number
  dateEmission: string
  status: 'brouillon' | 'envoyee' | 'payee'
}
