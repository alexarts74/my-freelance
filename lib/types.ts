export interface Client {
  id: string
  nom: string
  adresse: string
  contact: string
  email?: string
}

export interface JoursTravailles {
  lundi: boolean
  mardi: boolean
  mercredi: boolean
  jeudi: boolean
  vendredi: boolean
}

export interface Semaine {
  id: string
  clientId: string
  numero: number
  periode: { du: string; au: string }
  jours: JoursTravailles
  missions: string
  previsionnelSemaineSuivante?: string
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
