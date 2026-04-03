import PDFDocument from 'pdfkit'
import type { Facture, Semaine, Client } from '../types'

const PRESTATAIRE = {
  nom: 'Alexandre Artus',
  siret: '98186128900016',
  adresse: '175 chemin de Fessy, 74700 Sallanches',
  email: 'artualexandre74@gmail.com',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatPeriode(du: string, au: string): string {
  return `${formatDate(du)} — ${formatDate(au)}`
}

export function generateFacturePDF(
  facture: Facture,
  client: Client,
  semaines: Semaine[]
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const pageWidth = doc.page.width - 100

  // Header - Prestataire info
  doc.font('Helvetica-Bold').fontSize(16)
    .text(PRESTATAIRE.nom, 50, 50)
  doc.font('Helvetica').fontSize(10)
    .text(`SIRET : ${PRESTATAIRE.siret}`)
    .text(PRESTATAIRE.adresse)
    .text(PRESTATAIRE.email)
  doc.moveDown(2)

  // Client info - right aligned block
  const clientBlockY = doc.y
  doc.font('Helvetica-Bold').fontSize(10)
    .text('Destinataire :', 300, clientBlockY)
  doc.font('Helvetica').fontSize(10)
    .text(client.nom, 300)
    .text(client.adresse, 300)
  if (client.contact) {
    doc.text(`Référent : ${client.contact}`, 300)
  }
  doc.moveDown(2)

  // Facture title + meta
  doc.font('Helvetica-Bold').fontSize(14)
    .text(`FACTURE ${facture.numero}`, 50, doc.y, { align: 'center' })
  doc.moveDown(0.5)
  doc.font('Helvetica').fontSize(10)
    .text(`Date d'émission : ${formatDate(facture.dateEmission)}`, { align: 'center' })
  doc.moveDown(1.5)

  // Table header
  const tableLeft = 50
  const colWidths = [40, 190, 60, 70, pageWidth - 360]
  const headers = ['#', 'Période', 'Jours', 'TJM (€)', 'Montant (€)']
  const rowHeight = 25

  let y = doc.y

  // Header row
  doc.font('Helvetica-Bold').fontSize(9)
  let x = tableLeft
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).fillAndStroke('#f0f0f0', '#000000')
    doc.fillColor('#000000')
      .text(header, x + 5, y + 7, { width: colWidths[i] - 10, align: 'center' })
    x += colWidths[i]
  })

  y += rowHeight

  // Data rows
  doc.font('Helvetica').fontSize(9)
  const facturedSemaines = semaines.filter(s => facture.semaineIds.includes(s.id))

  facturedSemaines.forEach((sem, idx) => {
    const nbJours = Object.values(sem.jours).filter(Boolean).length
    const montant = nbJours * facture.tjm
    const rowData = [
      String(idx + 1),
      `S${sem.numero} — ${formatPeriode(sem.periode.du, sem.periode.au)}`,
      String(nbJours),
      String(facture.tjm),
      String(montant.toFixed(2)),
    ]

    x = tableLeft
    rowData.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke()
      doc.text(cell, x + 5, y + 7, { width: colWidths[i] - 10, align: 'center' })
      x += colWidths[i]
    })
    y += rowHeight
  })

  // Total row
  x = tableLeft
  const totalColSpan = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
  doc.rect(x, y, totalColSpan, rowHeight).fillAndStroke('#f0f0f0', '#000000')
  doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10)
    .text(`TOTAL (${facture.totalJours} jours)`, x + 5, y + 7, { width: totalColSpan - 10, align: 'right' })
  x += totalColSpan
  doc.rect(x, y, colWidths[4], rowHeight).fillAndStroke('#f0f0f0', '#000000')
  doc.fillColor('#000000')
    .text(`${facture.totalHT.toFixed(2)} €`, x + 5, y + 7, { width: colWidths[4] - 10, align: 'center' })

  y += rowHeight
  doc.y = y
  doc.moveDown(1.5)

  // TVA mention
  doc.font('Helvetica-Bold').fontSize(10)
    .text('TVA non applicable, art. 293 B du CGI', 50, doc.y)
  doc.moveDown(1.5)

  // Payment conditions
  doc.font('Helvetica-Bold').fontSize(10)
    .text('Conditions de paiement', 50)
  doc.font('Helvetica').fontSize(9)
    .text('Paiement par virement bancaire')
    .text('Délai de paiement : 30 jours à compter de la date d\'émission')
  doc.moveDown(1)

  // Footer
  doc.moveDown(2)
  doc.font('Helvetica').fontSize(8).fillColor('#666666')
    .text(`${PRESTATAIRE.nom} — SIRET ${PRESTATAIRE.siret} — ${PRESTATAIRE.adresse}`, 50, doc.y, { align: 'center' })
    .text('Micro-entreprise — TVA non applicable, art. 293 B du CGI', { align: 'center' })

  doc.end()
  return doc
}
