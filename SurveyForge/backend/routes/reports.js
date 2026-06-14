/**
 * routes/reports.js — PDF generation, Supabase Storage saving, and Resend delivery
 */

const express = require('express')
const { supabase } = require('../config/supabase')
const { generatePDFReport } = require('../utils/pdfReport')
const { assertSurveyWritable } = require('../utils/surveyOwnership')
const { Resend } = require('resend')
const nodemailer = require('nodemailer')
const { query, queryOne } = require('../database')
const { generateCompletion } = require('../services/aiService')
const { logActivity } = require('../lib/activityLogger')

function isAiConfigured() {
  return (process.env.GROQ_API_KEY || '').trim().length > 0 ||
         (process.env.GEMINI_API_KEY || '').trim().length > 0 ||
         (process.env.OPENROUTER_API_KEY || '').trim().length > 0 ||
         (process.env.OPENAI_API_KEY || '').trim().length > 0 ||
         process.env.NODE_ENV === 'development';
}

function formatAiError(err, defaultMsg = 'AI request failed') {
  const msg = err.message || ''
  if (msg.includes('quota') || msg.includes('billing') || msg.includes('429') || err.status === 429) {
    return 'AI provider switched automatically.'
  }
  return msg || defaultMsg
}

// AI PDF Report Insights Generator
async function generateAIReportInsights(survey, totalResponses, analytics) {
  if (totalResponses === 0) {
    return {
      summary: "No response data has been collected for this survey yet. Once responses are submitted, the AI will automatically analyze findings, trends, and compile recommendations.",
      findings: ["No response data available to analyze."],
      trends: "N/A - Zero responses submitted.",
      recommendations: ["Share the survey link or campaigns via WhatsApp/email to start collecting responses."],
      provider: 'none'
    }
  }

  if (!isAiConfigured()) {
    throw new Error('No AI providers are configured. Real AI is required for PDF reports.')
  }

  try {
    const systemPrompt = `You are a data analyst and survey researcher. You analyze survey response data and generate a professional summary report in JSON format. Do not return markdown.`
    
    const userPrompt = `Analyze the response statistics for the survey "${survey.title}" (Description: "${survey.description || ''}").

Total Responses Collected: ${totalResponses}

Per-Question Response Distribution & Analytics:
${JSON.stringify(analytics.map((item, idx) => ({
  number: idx + 1,
  text: item.question.text,
  type: item.type,
  count: item.count,
  average: item.average ?? null,
  topOption: item.topOption ?? null,
  counts: item.counts ?? null,
  distribution: item.distribution ?? null
})))}

Provide a JSON object conforming exactly to this structure:
{
  "summary": "<A professional, cohesive 2-3 sentence executive summary paragraph summarizing the key takeaway of these responses>",
  "findings": [
    "<Key finding/insight 1 based on the question metrics>",
    "<Key finding/insight 2 based on the question metrics>",
    "<Key finding/insight 3 based on the question metrics>"
  ],
  "trends": "<A professional 1-2 sentence paragraph detecting overall response trends, sentiment, or participant behavior patterns>",
  "recommendations": [
    "<Actionable business recommendation 1 based on the findings>",
    "<Actionable business recommendation 2 based on the findings>",
    "<Actionable business recommendation 3 based on the findings>"
  ]
}`

    const { content, provider } = await generateCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      responseFormat: 'json_object',
      maxTokens: 1500,
      temperature: 0.65
    })

    const raw = content?.trim()
    if (!raw) throw new Error('Empty response from AI service')

    const parsed = JSON.parse(raw)
    return {
      summary: parsed.summary || 'Summary analysis complete.',
      findings: Array.isArray(parsed.findings) ? parsed.findings : ['Findings analyzed.'],
      trends: parsed.trends || 'Trends analyzed.',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Recommendations compiled.'],
      provider
    }
  } catch (err) {
    console.error('[AI Report Insights] AI service failed:', err.message)
    throw new Error(`AI report insights generation failed: ${formatAiError(err, 'The AI service could not be reached.')}`)
  }
}

const router = express.Router()

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Helper to check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL || ''
  return url.length > 0 && !url.includes('your-supabase')
}

// ── Build analytics object from SQLite DB ───────────────────────
async function buildAnalytics(survey_id) {
  const survey = queryOne('SELECT * FROM surveys WHERE id = ?', [survey_id])
  if (!survey) throw new Error('Survey not found')

  // Parse fields
  survey.theme = typeof survey.theme === 'string' ? JSON.parse(survey.theme || '{}') : (survey.theme || {})
  survey.settings = typeof survey.settings === 'string' ? JSON.parse(survey.settings || '{}') : (survey.settings || {})

  const questions = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [survey_id])
  questions.forEach((q) => {
    q.options = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || [])
    q.logic = typeof q.logic === 'string' ? JSON.parse(q.logic || '[]') : (q.logic || [])
  })

  const responses = query('SELECT * FROM responses WHERE survey_id = ?', [survey_id])
  const totalResponses = responses.length

  const analytics = questions.map((q) => {
    const answers = responses
      .map((r) => {
        try {
          const parsed = typeof r.answers === 'string' ? JSON.parse(r.answers || '{}') : (r.answers || {})
          return parsed[q.id]
        } catch (e) {
          return null
        }
      })
      .filter((a) => a !== undefined && a !== null && a !== '')

    if (q.type === 'rating') {
      const nums = answers.map(Number).filter((n) => !isNaN(n))
      const avg  = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : 0
      const dist = {}
      nums.forEach((n) => { dist[n] = (dist[n] ?? 0) + 1 })
      return { question: q, type: 'rating', average: parseFloat(avg), distribution: dist, count: nums.length }
    }

    if (['mcq', 'checkbox', 'dropdown'].includes(q.type)) {
      const counts = {}
      q.options.forEach((o) => { counts[o] = 0 })
      answers.flat().forEach((a) => { counts[a] = (counts[a] ?? 0) + 1 })
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
      return { question: q, type: 'mcq', counts, topOption: top, count: answers.length }
    }

    const top5 = [...new Set(answers)].slice(0, 5)
    return { question: q, type: 'text', samples: top5, count: answers.length }
  })

  return { survey, totalResponses, analytics }
}

// ── Supabase Storage & DB saving helper ──────────────────────────────
async function saveReportToSupabase(surveyId, title, pdfBuffer) {
  if (!isSupabaseConfigured()) {
    // Gracefully skip when Supabase is not configured
    return null
  }
  try {
    const fileName = `reports/${surveyId}-${Date.now()}.pdf`
    
    // Upload report to Supabase Storage bucket 'reports'
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadErr) {
      console.warn('[Report Storage] Upload warning:', uploadErr.message)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)

    const publicUrl = urlData?.publicUrl

    if (publicUrl) {
      // Save report record in the public.reports database table
      await supabase.from('reports').insert({
        survey_id: surveyId,
        report_url: publicUrl,
      })
      console.log(`[Report DB] Saved report metadata for survey #${surveyId}`)
    }

    return publicUrl
  } catch (err) {
    console.error('[Report Save] Failed to save to Supabase:', err.message)
    return null
  }
}

/* POST /reports/download */
router.post('/download', async (req, res) => {
  const { survey_id } = req.body
  if (!survey_id) return res.status(400).json({ success: false, error: 'survey_id is required' })

  try {
    const survey = assertSurveyWritable(req, res, survey_id)
    if (!survey) return

    const { totalResponses, analytics } = await buildAnalytics(survey_id)
    const aiInsights = await generateAIReportInsights(survey, totalResponses, analytics)
    const pdf = await generatePDFReport(survey, totalResponses, analytics, aiInsights)

    // Optional cloud storage (no-op if Supabase not configured)
    saveReportToSupabase(survey_id, survey.title, pdf).catch(err => 
      console.error('[Report Background Save] failed:', err.message)
    )

    logActivity(req.user?.id, req.user?.email || 'user', 'pdf_generation', survey.title, survey_id, 'reports', { method: 'download' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="Survexa-Report-${survey_id}.pdf"`)
    res.setHeader('Content-Length', pdf.length)
    res.end(pdf)
  } catch (err) {
    console.error('[Report] PDF error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /reports/send */
router.post('/send', async (req, res) => {
  const { email, survey_id } = req.body

  if (!email || !survey_id) {
    return res.status(400).json({ success: false, error: 'email and survey_id are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' })
  }

  try {
    const survey = assertSurveyWritable(req, res, survey_id)
    if (!survey) return

    const { totalResponses, analytics } = await buildAnalytics(survey_id)
    const aiInsights = await generateAIReportInsights(survey, totalResponses, analytics)
    const pdf = await generatePDFReport(survey, totalResponses, analytics, aiInsights)
    logActivity(req.user?.id, req.user?.email || 'user', 'pdf_generation', survey.title, survey_id, 'reports', { method: 'email', recipient: email })

    // Optional cloud storage (no-op if Supabase not configured)
    saveReportToSupabase(survey_id, survey.title, pdf).catch(err => 
      console.error('[Report Background Save] failed:', err.message)
    )

    const emailFilename = `Survexa-${survey.title.replace(/[^a-z0-9]/gi, '_')}.pdf`

    // Option B: Fallback to Gmail SMTP if configured
    const gmailUser = process.env.EMAIL_USER || ''
    const gmailPass = process.env.EMAIL_PASS || ''
    const isGmailConfigured = gmailUser && gmailPass && !gmailUser.includes('your-email@') && !(gmailUser.includes('gmail.com') && gmailPass.includes('xxxx'))

    // Option A: Use Resend if API key is present
    if (resend) {
      await resend.emails.send({
        from: 'Survexa <onboarding@resend.dev>', // or custom verified domain
        to: email,
        subject: `📊 Survey Report: ${survey.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:auto">
            <div style="background:linear-gradient(135deg,#B8A4E8,#9474C8);padding:28px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:22px">Survexa</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">Analytics Report</p>
            </div>
            <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px">
              <h2 style="color:#1f2937;font-size:18px;margin-top:0">${survey.title}</h2>
              <p style="color:#6b7280">Please find your survey report attached.</p>
              <p style="color:#6b7280"><strong>Total Responses:</strong> ${totalResponses}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
              <p style="color:#9ca3af;font-size:12px;margin:0">
                Generated by Survexa · ${new Date().toLocaleDateString()}
              </p>
            </div>
          </div>`,
        attachments: [{
          filename: emailFilename,
          content: pdf,
        }],
      })
      return res.json({ success: true, message: `Report sent via Resend to ${email}` })
    }

    if (isGmailConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: gmailUser, pass: gmailPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 30000,
          greetingTimeout:   30000,
          socketTimeout:     45000,
        })
        await transporter.sendMail({
          from: `"Survexa" <${gmailUser}>`,
          to: email,
          subject: `📊 Survey Report: ${survey.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:580px;margin:auto">
              <div style="background:linear-gradient(135deg,#B8A4E8,#9474C8);padding:28px 32px;border-radius:12px 12px 0 0">
                <h1 style="color:#fff;margin:0;font-size:22px">Survexa</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">Analytics Report</p>
              </div>
              <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px">
                <h2 style="color:#1f2937;font-size:18px;margin-top:0">${survey.title}</h2>
                <p style="color:#6b7280">Please find your survey report attached.</p>
                <p style="color:#6b7280"><strong>Total Responses:</strong> ${totalResponses}</p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
                <p style="color:#9ca3af;font-size:12px;margin:0">
                  Generated by Survexa · ${new Date().toLocaleDateString()}
                </p>
              </div>
            </div>`,
          attachments: [{
            filename: emailFilename,
            content: pdf,
          }],
        })
        return res.json({ success: true, message: `Report sent via Gmail SMTP to ${email}` })
      } catch (smtpErr) {
        console.warn(`[Email] SMTP delivery failed: ${smtpErr.message}. Falling back to simulation.`)
        return res.json({
          success: true,
          simulated: true,
          warning: smtpErr.message,
          message: `[Dev mode / Fallback] Report for "${survey.title}" could not be sent via SMTP (${smtpErr.message}).`,
        })
      }
    }

    // Option C: Simulated Dev mode log
    console.log(`[Email] Dev mode (No Email Configured) — would send to: ${email}`)
    return res.json({
      success: true,
      simulated: true,
      message: `[Dev mode] Report for "${survey.title}" would be emailed to ${email}. Set EMAIL_USER/EMAIL_PASS or RESEND_API_KEY in .env for real sending.`,
    })
  } catch (err) {
    console.error('[Report] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
