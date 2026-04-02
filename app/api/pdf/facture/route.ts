import { NextRequest, NextResponse } from 'next/server'
import { getFactures, getClients, getSemaines } from '@/lib/data'
import { generateFacturePDF } from '@/lib/pdf/facture'

export async function GET(request: NextRequest) {
  const factureId = request.nextUrl.searchParams.get('id')
  if (!factureId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const factures = await getFactures()
  const facture = factures.find(f => f.id === factureId)
  if (!facture) {
    return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
  }

  const clients = await getClients()
  const client = clients.find(c => c.id === facture.clientId)
  if (!client) {
    return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
  }

  const semaines = await getSemaines()
  const doc = generateFacturePDF(facture, client, semaines)

  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve())
    doc.on('error', reject)
  })

  const pdfBuffer = Buffer.concat(chunks)
  const filename = `facture-${facture.numero}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
