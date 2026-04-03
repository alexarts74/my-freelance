import { NextRequest, NextResponse } from 'next/server'
import { getSemaines, getClients } from '@/lib/data'
import { generateFicheSuiviPDF } from '@/lib/pdf/fiche-suivi'

export async function GET(request: NextRequest) {
  const semaineId = request.nextUrl.searchParams.get('id')
  if (!semaineId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const semaines = await getSemaines()
  const semaine = semaines.find(s => s.id === semaineId)
  if (!semaine) {
    return NextResponse.json({ error: 'Semaine non trouvée' }, { status: 404 })
  }

  const clients = await getClients()
  const client = clients.find(c => c.id === semaine.clientId)
  if (!client) {
    return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
  }

  const doc = generateFicheSuiviPDF(semaine, client)

  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve())
    doc.on('error', reject)
    doc.end()
  })

  const pdfBuffer = Buffer.concat(chunks)
  const filename = `fiche-suivi-S${semaine.numero}-${semaine.clientId}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
