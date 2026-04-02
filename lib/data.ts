'use server'

import fs from 'fs/promises'
import path from 'path'
import type { Client, Semaine, Facture } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')

async function readJSON<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename)
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// Clients
export async function getClients(): Promise<Client[]> {
  return readJSON<Client>('clients.json')
}

export async function addClient(client: Client): Promise<void> {
  const clients = await getClients()
  clients.push(client)
  await writeJSON('clients.json', clients)
}

export async function updateClient(client: Client): Promise<void> {
  const clients = await getClients()
  const index = clients.findIndex(c => c.id === client.id)
  if (index === -1) throw new Error('Client non trouvé')
  clients[index] = client
  await writeJSON('clients.json', clients)
}

export async function deleteClient(id: string): Promise<void> {
  const clients = await getClients()
  await writeJSON('clients.json', clients.filter(c => c.id !== id))
}

// Semaines
export async function getSemaines(): Promise<Semaine[]> {
  return readJSON<Semaine>('semaines.json')
}

export async function addSemaine(semaine: Semaine): Promise<void> {
  const semaines = await getSemaines()
  semaines.push(semaine)
  await writeJSON('semaines.json', semaines)
}

export async function updateSemaine(semaine: Semaine): Promise<void> {
  const semaines = await getSemaines()
  const index = semaines.findIndex(s => s.id === semaine.id)
  if (index === -1) throw new Error('Semaine non trouvée')
  semaines[index] = semaine
  await writeJSON('semaines.json', semaines)
}

export async function deleteSemaine(id: string): Promise<void> {
  const semaines = await getSemaines()
  await writeJSON('semaines.json', semaines.filter(s => s.id !== id))
}

// Factures
export async function getFactures(): Promise<Facture[]> {
  return readJSON<Facture>('factures.json')
}

export async function addFacture(facture: Facture): Promise<void> {
  const factures = await getFactures()
  factures.push(facture)
  await writeJSON('factures.json', factures)
}

export async function updateFacture(facture: Facture): Promise<void> {
  const factures = await getFactures()
  const index = factures.findIndex(f => f.id === facture.id)
  if (index === -1) throw new Error('Facture non trouvée')
  factures[index] = facture
  await writeJSON('factures.json', factures)
}

// Helper: next invoice number
export async function getNextNumeroFacture(year: number): Promise<string> {
  const factures = await getFactures()
  const prefix = `F-${year}-`
  const existing = factures
    .filter(f => f.numero.startsWith(prefix))
    .map(f => parseInt(f.numero.replace(prefix, ''), 10))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}
