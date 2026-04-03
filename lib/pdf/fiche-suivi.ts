import PDFDocument from 'pdfkit'
import type { Semaine, Client, Mission } from '../types'
import { normalizeMissions, normalizePrevisions } from '../types'

const PRESTATAIRE = {
  nom: 'Alexandre Artus',
  siret: '98186128900016',
  adresse: '175 chemin de Fessy, 74700 Sallanches',
  email: 'artualexandre74@gmail.com',
}

const DARK_BLUE = '#2C3E6B'
const LIGHT_BLUE_BG = '#E8EDF5'
const BORDER = '#B0B8C8'
const WHITE = '#FFFFFF'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function drawCell(
  doc: PDFKit.PDFDocument,
  x: number, y: number, w: number, h: number,
  text: string,
  opts: {
    bg?: string
    fontColor?: string
    font?: string
    fontSize?: number
    align?: 'left' | 'center' | 'right'
    vPad?: number
    hPad?: number
  } = {}
) {
  const {
    bg, fontColor = '#000000', font = 'Helvetica', fontSize = 9,
    align = 'left', vPad = 4, hPad = 5,
  } = opts

  if (bg) {
    doc.save().rect(x, y, w, h).fill(bg).restore()
  }
  doc.save().rect(x, y, w, h).lineWidth(0.5).strokeColor(BORDER).stroke().restore()
  doc.font(font).fontSize(fontSize).fillColor(fontColor)
    .text(text, x + hPad, y + vPad, { width: w - hPad * 2, align })
}

function checkPageBreak(doc: PDFKit.PDFDocument, neededHeight: number, margin: number) {
  const pageHeight = doc.page.height
  if (doc.y + neededHeight > pageHeight - margin) {
    doc.addPage()
  }
}

export function generateFicheSuiviPDF(semaine: Semaine, client: Client): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  const LEFT = 40
  const pageWidth = doc.page.width - LEFT * 2
  const MARGIN_BOTTOM = 60

  // ── Title ──
  doc.fontSize(18).font('Helvetica-Bold').fillColor(DARK_BLUE)
    .text('FICHE DE SUIVI HEBDOMADAIRE', LEFT, 40, { align: 'center', width: pageWidth })
  doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666666')
    .text('Prestation de services indépendante', LEFT, doc.y + 2, { align: 'center', width: pageWidth })
  doc.moveDown(1.2)

  // ── Identification ──
  const identY = doc.y
  const colW = pageWidth / 4
  const rowH = 22

  const identRows: [string, string, string, string][] = [
    ['Prestataire', PRESTATAIRE.nom, 'SIRET', PRESTATAIRE.siret],
    ['Client', client.nom, 'Référent client', client.contact],
    ['Semaine n°', String(semaine.numero), 'Période', `Du ${formatDate(semaine.periode.du)} au ${formatDate(semaine.periode.au)}`],
  ]

  identRows.forEach((row, ri) => {
    const y = identY + ri * rowH
    drawCell(doc, LEFT, y, colW, rowH, row[0], { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold' })
    drawCell(doc, LEFT + colW, y, colW, rowH, row[1])
    drawCell(doc, LEFT + colW * 2, y, colW, rowH, row[2], { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold' })
    drawCell(doc, LEFT + colW * 3, y, colW, rowH, row[3])
  })

  doc.y = identY + identRows.length * rowH
  doc.moveDown(1.2)

  // ── Jours facturés ──
  checkPageBreak(doc, 60, MARGIN_BOTTOM)
  const joursY = doc.y
  const jColW = pageWidth / 3
  const totalJours = Object.values(semaine.jours).filter(Boolean).length
  const tjm = client.tjm ?? 300
  const montant = totalJours * tjm

  // Header
  drawCell(doc, LEFT, joursY, jColW, rowH, 'Jours travaillés cette semaine', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })
  drawCell(doc, LEFT + jColW, joursY, jColW, rowH, 'TJM HT', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })
  drawCell(doc, LEFT + jColW * 2, joursY, jColW, rowH, 'Montant à facturer (semaine)', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })

  // Values
  const jValY = joursY + rowH
  drawCell(doc, LEFT, jValY, jColW, rowH, String(totalJours), { align: 'center' })
  drawCell(doc, LEFT + jColW, jValY, jColW, rowH, `${tjm} € HT`, { align: 'center' })
  drawCell(doc, LEFT + jColW * 2, jValY, jColW, rowH, `${montant} € HT`, { align: 'center', font: 'Helvetica-Bold' })

  doc.y = jValY + rowH
  doc.moveDown(1.2)

  // ── Missions et livrables ──
  const missions = normalizeMissions(semaine.missions as Mission[] | string)

  // Calculate row heights
  const mColWidths = [pageWidth * 0.30, pageWidth * 0.50, pageWidth * 0.20]
  const mHeaderH = rowH

  // Measure each mission row height
  const missionRowHeights = missions.map(m => {
    const h1 = doc.heightOfString(m.mission, { width: mColWidths[0] - 10 })
    const h2 = doc.heightOfString(m.livrables, { width: mColWidths[1] - 10 })
    return Math.max(h1, h2, 16) + 8
  })

  const emptyRows = 3
  const emptyRowH = 22
  const totalMissionsH = mHeaderH + missionRowHeights.reduce((a, b) => a + b, 0) + emptyRows * emptyRowH + 20

  checkPageBreak(doc, totalMissionsH, MARGIN_BOTTOM)

  const mY = doc.y
  // Section header
  drawCell(doc, LEFT, mY, mColWidths[0], mHeaderH, 'Mission / Thématique', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })
  drawCell(doc, LEFT + mColWidths[0], mY, mColWidths[1], mHeaderH, 'Livrables / Travaux réalisés', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })
  drawCell(doc, LEFT + mColWidths[0] + mColWidths[1], mY, mColWidths[2], mHeaderH, 'Statut', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })

  let currentY = mY + mHeaderH
  const statutLabels: Record<string, string> = { livre: 'Livré', en_cours: 'En cours', a_faire: 'À faire' }

  missions.forEach((m, mi) => {
    const rh = missionRowHeights[mi]
    const bg = mi % 2 === 1 ? LIGHT_BLUE_BG : undefined
    drawCell(doc, LEFT, currentY, mColWidths[0], rh, m.mission, { bg })
    drawCell(doc, LEFT + mColWidths[0], currentY, mColWidths[1], rh, m.livrables, { bg })
    drawCell(doc, LEFT + mColWidths[0] + mColWidths[1], currentY, mColWidths[2], rh, statutLabels[m.statut] || m.statut, { bg, align: 'center' })
    currentY += rh
  })

  // Empty rows for manual additions
  for (let e = 0; e < emptyRows; e++) {
    const bg = (missions.length + e) % 2 === 1 ? LIGHT_BLUE_BG : undefined
    drawCell(doc, LEFT, currentY, mColWidths[0], emptyRowH, '', { bg })
    drawCell(doc, LEFT + mColWidths[0], currentY, mColWidths[1], emptyRowH, '', { bg })
    drawCell(doc, LEFT + mColWidths[0] + mColWidths[1], currentY, mColWidths[2], emptyRowH, '', { bg })
    currentY += emptyRowH
  }

  doc.y = currentY
  doc.moveDown(1.2)

  // ── Prévisions semaine suivante ──
  const previsions = normalizePrevisions(semaine.previsions)

  const prevHeaderH = rowH
  const bulletH = 18
  const emptyBullets = 3
  const totalPrevH = prevHeaderH + (previsions.length + emptyBullets) * bulletH + 16

  checkPageBreak(doc, totalPrevH, MARGIN_BOTTOM)

  const pY = doc.y
  drawCell(doc, LEFT, pY, pageWidth, prevHeaderH, 'PRÉVISIONS SEMAINE SUIVANTE', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })

  let bulletY = pY + prevHeaderH + 6
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  previsions.filter(p => p).forEach(p => {
    doc.text(`•  ${p}`, LEFT + 10, bulletY, { width: pageWidth - 20 })
    bulletY += bulletH
  })
  // Empty bullet placeholders
  for (let e = 0; e < emptyBullets; e++) {
    doc.text('•  ', LEFT + 10, bulletY, { width: pageWidth - 20 })
    bulletY += bulletH
  }

  doc.y = bulletY
  doc.moveDown(1.2)

  // ── Validation ──
  const sigBlockH = 80
  checkPageBreak(doc, sigBlockH + rowH + 10, MARGIN_BOTTOM)

  const vY = doc.y
  drawCell(doc, LEFT, vY, pageWidth, rowH, 'VALIDATION', { bg: DARK_BLUE, fontColor: WHITE, font: 'Helvetica-Bold', align: 'center' })

  const sigY = vY + rowH
  const sigW = pageWidth / 2

  // Prestataire signature block
  drawCell(doc, LEFT, sigY, sigW, sigBlockH, '', {})
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
    .text('Prestataire', LEFT + 8, sigY + 6)
  doc.font('Helvetica').fontSize(9)
    .text(PRESTATAIRE.nom, LEFT + 8, sigY + 20)
  doc.text('Date : __/__/______', LEFT + 8, sigY + 34)
  doc.text('Signature :', LEFT + 8, sigY + 48)

  // Client signature block
  drawCell(doc, LEFT + sigW, sigY, sigW, sigBlockH, '', {})
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
    .text('Référent client', LEFT + sigW + 8, sigY + 6)
  doc.font('Helvetica').fontSize(9)
    .text(client.contact, LEFT + sigW + 8, sigY + 20)
  doc.text('Date : __/__/______', LEFT + sigW + 8, sigY + 34)
  doc.text('Signature :', LEFT + sigW + 8, sigY + 48)

  return doc
}
