/**
 * utils/pdfReport.js
 * Generates a branded Survexa PDF report for a given survey.
 * Uses only pdfkit (no canvas — works on Windows without native build tools).
 */

const PDFDocument = require('pdfkit')

// ── Brand colours ─────────────────────────────────────────────
const PURPLE      = '#B8A4E8'
const DARK        = '#1F2937'
const GRAY        = '#6B7280'
const LIGHT_GRAY  = '#F3F4F6'
const WHITE       = '#FFFFFF'
const GREEN       = '#22C55E'
const AMBER       = '#F59E0B'

/**
 * Generate a PDF report Buffer from survey analytics data.
 *
 * @param {object} survey       - { id, title, description, created_at }
 * @param {number} totalResponses
 * @param {Array}  analytics    - from GET /responses/analytics/:id
 * @returns {Promise<Buffer>}
 */
function generatePDFReport(survey, totalResponses, analytics, aiInsights) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const doc    = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true })

    doc.on('data',  (chunk) => chunks.push(chunk))
    doc.on('end',   ()      => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW  = doc.page.width
    const left   = 50
    const right  = pageW - 50
    const contentW = right - left

    // ── HEADER BANNER ─────────────────────────────────────
    doc.rect(0, 0, pageW, 90).fill(PURPLE)

    // Brand name
    doc.fontSize(26).fillColor(WHITE).font('Helvetica-Bold')
       .text('Survexa', left, 22, { continued: false })

    // Tagline
    doc.fontSize(10).fillColor('rgba(255,255,255,0.8)').font('Helvetica')
       .text('AI-Powered Survey Analytics', left, 52)

    // Generated date (top-right)
    const now = new Date().toLocaleString('en-US', {
      dateStyle: 'long', timeStyle: 'short',
    })
    doc.fontSize(9).fillColor(WHITE)
       .text(`Generated: ${now}`, left, 22, { align: 'right', width: contentW })

    doc.moveDown(3)

    // ── SURVEY TITLE SECTION ──────────────────────────────
    doc.y = 110
    doc.fontSize(20).fillColor(DARK).font('Helvetica-Bold')
       .text(survey.title, left, doc.y)
    doc.moveDown(0.3)

    if (survey.description) {
      doc.fontSize(11).fillColor(GRAY).font('Helvetica')
         .text(survey.description, left, doc.y, { width: contentW })
      doc.moveDown(0.5)
    }

    // ── KPI BOXES ─────────────────────────────────────────
    const boxY   = doc.y + 8
    const boxW   = (contentW - 20) / 3
    const kpis   = [
      { label: 'Total Responses', value: String(totalResponses) },
      { label: 'Questions',       value: String(analytics.length) },
      { label: 'Survey ID',       value: `#${survey.id}` },
    ]

    kpis.forEach((kpi, i) => {
      const bx = left + i * (boxW + 10)
      doc.rect(bx, boxY, boxW, 55).fillAndStroke(LIGHT_GRAY, LIGHT_GRAY)
      doc.fontSize(22).fillColor(PURPLE).font('Helvetica-Bold')
         .text(kpi.value, bx + 10, boxY + 8, { width: boxW - 20, align: 'center' })
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
         .text(kpi.label, bx + 10, boxY + 34, { width: boxW - 20, align: 'center' })
    })

    doc.y = boxY + 70

    // ── DIVIDER ───────────────────────────────────────────
    const divider = () => {
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor('#E5E7EB').lineWidth(1).stroke()
      doc.moveDown(0.8)
    }

    divider()

    // ── AI EXECUTIVE INSIGHTS PAGE ────────────────────────
    if (aiInsights) {
      doc.addPage()
      
      // Page header
      doc.fontSize(18).fillColor(PURPLE).font('Helvetica-Bold')
         .text('AI Executive Insights', left, 50)
      
      const providerLabel = aiInsights.provider && aiInsights.provider !== 'none'
        ? aiInsights.provider.toUpperCase()
        : 'AI'
      
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
         .text(`Powered by ${providerLabel}  ·  Strategic Response Analysis`, left, 72)
      doc.moveDown(1.5)

      // Executive Summary
      doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold')
         .text('Executive Summary', left)
      doc.moveDown(0.4)
      doc.fontSize(10).fillColor(DARK).font('Helvetica').lineWidth(1)
         .text(aiInsights.summary || 'Summary not available.', left, doc.y, { width: contentW, align: 'justify' })
      doc.moveDown(1.5)

      // Key Findings
      doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold')
         .text('Key Findings & Patterns', left)
      doc.moveDown(0.4)
      if (Array.isArray(aiInsights.findings)) {
        aiInsights.findings.forEach((finding) => {
          doc.fontSize(10).fillColor(PURPLE).font('Helvetica-Bold')
             .text('  •  ', { continued: true })
             .fillColor(DARK).font('Helvetica')
             .text(finding, { width: contentW - 20 })
          doc.moveDown(0.4)
        })
      }
      doc.moveDown(1.1)

      // Trend Analysis
      doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold')
         .text('Trend & Sentiment Analysis', left)
      doc.moveDown(0.4)
      doc.fontSize(10).fillColor(DARK).font('Helvetica')
         .text(aiInsights.trends || 'No significant trends detected.', left, doc.y, { width: contentW, align: 'justify' })
      doc.moveDown(1.5)

      // Actionable Recommendations
      doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold')
         .text('Actionable Recommendations', left)
      doc.moveDown(0.4)
      if (Array.isArray(aiInsights.recommendations)) {
        aiInsights.recommendations.forEach((rec) => {
          doc.fontSize(10).fillColor(PURPLE).font('Helvetica-Bold')
             .text('  •  ', { continued: true })
             .fillColor(DARK).font('Helvetica')
             .text(rec, { width: contentW - 20 })
          doc.moveDown(0.4)
        })
      }

      // Add a page break so the per-question analysis starts fresh on the next page
      doc.addPage()
    }

    // ── PER-QUESTION SECTIONS ─────────────────────────────
    analytics.forEach((item, idx) => {
      // Page break check
      if (doc.y > doc.page.height - 160) doc.addPage()

      const { question: q } = item

      // Question header
      doc.fontSize(12).fillColor(PURPLE).font('Helvetica-Bold')
         .text(`Q${idx + 1}`, left, doc.y, { continued: true })
      doc.fillColor(DARK).font('Helvetica')
         .text(`  ${q.text}`, { continued: false, width: contentW - 30 })

      // Type badge
      const badge = q.type.toUpperCase()
      doc.rect(right - 55, doc.y - 14, 55, 14).fill(PURPLE)
      doc.fontSize(7).fillColor(WHITE).font('Helvetica-Bold')
         .text(badge, right - 53, doc.y - 12, { width: 51, align: 'center' })

      doc.moveDown(0.5)

      // ── Rating question ─────────────────────────────────
      if (item.type === 'rating') {
        const avg = item.average
        doc.fontSize(11).fillColor(GRAY).font('Helvetica')
           .text(`Total answers: ${item.count}   ·   Average score: `, left, doc.y, { continued: true })
        doc.fillColor(avg >= 4 ? GREEN : avg >= 3 ? AMBER : '#EF4444').font('Helvetica-Bold')
           .text(`${avg} / 5`, { continued: false })
        doc.moveDown(0.4)

        // Score bar
        const dist = item.distribution || {}
        ;[1, 2, 3, 4, 5].forEach((score) => {
          const cnt  = dist[score] ?? 0
          const pct  = item.count > 0 ? cnt / item.count : 0
          const barW = Math.round(pct * (contentW - 80))

          doc.fontSize(9).fillColor(DARK).font('Helvetica')
             .text(`${score} ★`, left, doc.y, { width: 30, continued: true })
          if (barW > 0) {
            doc.rect(left + 35, doc.y - 1, barW, 10).fill(PURPLE)
          }
          doc.undash()
          doc.rect(left + 35, doc.y - 1, contentW - 80, 10).strokeColor('#E5E7EB').lineWidth(0.5).stroke()
          doc.fillColor(GRAY).text(`  ${cnt}`, left + 35 + barW + 4, doc.y - 1, { continued: false })
          doc.moveDown(0.55)
        })
      }

      // ── MCQ / Choice question ───────────────────────────
      else if (item.type === 'mcq') {
        doc.fontSize(11).fillColor(GRAY).font('Helvetica')
           .text(`Total answers: ${item.count}`, left)
        if (item.topOption) {
          doc.fillColor(GREEN).font('Helvetica-Bold')
             .text(`Most selected: "${item.topOption}"`, left)
        }
        doc.moveDown(0.3)

        const entries = Object.entries(item.counts || {})
        const maxCnt  = Math.max(...entries.map(([, v]) => v), 1)

        entries.forEach(([option, cnt]) => {
          const isTop  = option === item.topOption
          const pct    = (cnt / maxCnt)
          const barW   = Math.round(pct * (contentW - 110))

          doc.fontSize(9).fillColor(isTop ? PURPLE : DARK).font(isTop ? 'Helvetica-Bold' : 'Helvetica')
             .text(option.length > 28 ? option.slice(0, 25) + '…' : option, left, doc.y, { width: 100 })
          if (barW > 0) {
            doc.rect(left + 108, doc.y - 10, barW, 10).fill(isTop ? PURPLE : '#C4B5FD')
          }
          doc.fontSize(9).fillColor(GRAY)
             .text(`${cnt}`, left + 110 + barW + 4, doc.y - 10, { continued: false })
          doc.moveDown(0.55)
        })
      }

      // ── Text question ───────────────────────────────────
      else if (item.type === 'text') {
        doc.fontSize(11).fillColor(GRAY).font('Helvetica')
           .text(`Total answers: ${item.count}`)
        doc.moveDown(0.3)

        if (!item.samples || item.samples.length === 0) {
          doc.fontSize(10).fillColor(GRAY).text('No text responses collected yet.')
        } else {
          item.samples.forEach((s, si) => {
            if (doc.y > doc.page.height - 80) doc.addPage()
            doc.rect(left, doc.y, contentW, 22).fill(si % 2 === 0 ? LIGHT_GRAY : WHITE)
            doc.fontSize(10).fillColor(DARK).font('Helvetica')
               .text(`"${s}"`, left + 8, doc.y + 5, { width: contentW - 16 })
            doc.moveDown(0.9)
          })
        }
      }

      doc.moveDown(0.5)
      divider()
    })

    // ── FOOTER ────────────────────────────────────────────
    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      doc.fontSize(8).fillColor(GRAY).font('Helvetica')
         .text(
           `Generated by Survexa  ·  Page ${i + 1} of ${range.count}`,
           left,
           doc.page.height - 30,
           { align: 'center', width: contentW }
         )
    }

    doc.end()
  })
}

module.exports = { generatePDFReport }
