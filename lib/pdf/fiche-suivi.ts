import PDFDocument from 'pdfkit'
import type { Semaine, Client } from '../types'

const PRESTATAIRE = {
  nom: 'Alexandre Artus',
  siret: '98186128900016',
  adresse: '175 chemin de Fessy, 74700 Sallanches',
  email: 'artualexandre74@gmail.com',
}

const JOURS_LABELS: Record<string, string> = {
  lundi: 'Lundi',
  mardi: 'Mardi',
  mercredi: 'Mercredi',
  jeudi: 'Jeudi',
  vendredi: 'Vendredi',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function generateFicheSuiviPDF(semaine: Semaine, client: Client): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  const pageWidth = doc.page.width - 100 // margins

  // Title
  doc.fontSize(14).font('Helvetica-Bold')
    .text('FICHE DE SUIVI HEBDOMADAIRE', { align: 'center' })
  doc.fontSize(10).font('Helvetica')
    .text('Prestation de services indépendante', { align: 'center' })
  doc.moveDown(1.5)

  // Identification table
  const tableTop = doc.y
  const col1Width = pageWidth / 2
  const rowHeight = 20

  // Draw identification section
  doc.font('Helvetica-Bold').fontSize(10)
  doc.text('IDENTIFICATION', 50, tableTop)
  doc.moveDown(0.5)

  const identY = doc.y
  const identData = [
    ['Prestataire', PRESTATAIRE.nom],
    ['SIRET', PRESTATAIRE.siret],
    ['Client', client.nom],
    ['Référent client', client.contact],
    ['Semaine n°', String(semaine.numero)],
    ['Période', `Du ${formatDate(semaine.periode.du)} au ${formatDate(semaine.periode.au)}`],
  ]

  identData.forEach((row, i) => {
    const y = identY + i * rowHeight
    // Draw row borders
    doc.rect(50, y, col1Width, rowHeight).stroke()
    doc.rect(50 + col1Width, y, col1Width, rowHeight).stroke()
    // Label
    doc.font('Helvetica-Bold').fontSize(9)
      .text(row[0], 55, y + 5, { width: col1Width - 10 })
    // Value
    doc.font('Helvetica').fontSize(9)
      .text(row[1], 55 + col1Width, y + 5, { width: col1Width - 10 })
  })

  doc.y = identY + identData.length * rowHeight
  doc.moveDown(1.5)

  // Jours facturés
  doc.font('Helvetica-Bold').fontSize(10)
    .text('JOURS FACTURÉS', 50)
  doc.moveDown(0.5)

  const joursY = doc.y
  const jourColWidth = pageWidth / 6
  const jourKeys = Object.keys(JOURS_LABELS) as (keyof typeof JOURS_LABELS)[]

  // Header row
  jourKeys.forEach((key, i) => {
    doc.rect(50 + i * jourColWidth, joursY, jourColWidth, rowHeight).stroke()
    doc.font('Helvetica-Bold').fontSize(9)
      .text(JOURS_LABELS[key], 50 + i * jourColWidth, joursY + 5, { width: jourColWidth, align: 'center' })
  })
  // Total header
  doc.rect(50 + 5 * jourColWidth, joursY, jourColWidth, rowHeight).stroke()
  doc.font('Helvetica-Bold').fontSize(9)
    .text('Total', 50 + 5 * jourColWidth, joursY + 5, { width: jourColWidth, align: 'center' })

  // Values row
  const valY = joursY + rowHeight
  let totalJours = 0
  jourKeys.forEach((key, i) => {
    const worked = semaine.jours[key as keyof typeof semaine.jours]
    if (worked) totalJours++
    doc.rect(50 + i * jourColWidth, valY, jourColWidth, rowHeight).stroke()
    doc.font('Helvetica').fontSize(9)
      .text(worked ? '✓' : '', 50 + i * jourColWidth, valY + 5, { width: jourColWidth, align: 'center' })
  })
  doc.rect(50 + 5 * jourColWidth, valY, jourColWidth, rowHeight).stroke()
  doc.font('Helvetica-Bold').fontSize(9)
    .text(String(totalJours), 50 + 5 * jourColWidth, valY + 5, { width: jourColWidth, align: 'center' })

  doc.y = valY + rowHeight
  doc.moveDown(1.5)

  // Missions et livrables
  doc.font('Helvetica-Bold').fontSize(10)
    .text('MISSIONS ET LIVRABLES RÉALISÉS', 50)
  doc.moveDown(0.5)

  const missionsY = doc.y
  const missionsHeight = 100
  doc.rect(50, missionsY, pageWidth, missionsHeight).stroke()
  doc.font('Helvetica').fontSize(9)
    .text(semaine.missions || '', 55, missionsY + 5, { width: pageWidth - 10, height: missionsHeight - 10 })

  doc.y = missionsY + missionsHeight
  doc.moveDown(1.5)

  // Prévisionnel semaine suivante
  doc.font('Helvetica-Bold').fontSize(10)
    .text('PRÉVISIONNEL SEMAINE SUIVANTE', 50)
  doc.moveDown(0.5)

  const prevY = doc.y
  const prevHeight = 80
  doc.rect(50, prevY, pageWidth, prevHeight).stroke()
  doc.font('Helvetica').fontSize(9)
    .text(semaine.previsionnelSemaineSuivante || '', 55, prevY + 5, { width: pageWidth - 10, height: prevHeight - 10 })

  doc.y = prevY + prevHeight
  doc.moveDown(2)

  // Validation / Signatures
  doc.font('Helvetica-Bold').fontSize(10)
    .text('VALIDATION', 50)
  doc.moveDown(0.5)

  const sigY = doc.y
  const sigWidth = pageWidth / 2
  const sigHeight = 60

  doc.rect(50, sigY, sigWidth, sigHeight).stroke()
  doc.rect(50 + sigWidth, sigY, sigWidth, sigHeight).stroke()

  doc.font('Helvetica-Bold').fontSize(9)
    .text('Signature Prestataire', 55, sigY + 5)
  doc.font('Helvetica-Bold').fontSize(9)
    .text('Signature Client', 55 + sigWidth, sigY + 5)

  doc.end()
  return doc
}
