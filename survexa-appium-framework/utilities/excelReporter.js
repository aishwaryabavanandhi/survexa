/**
 * utilities/excelReporter.js
 * Enterprise Excel Report Generator using ExcelJS
 *
 * Generates Mobile_E2E_Report.xlsx with 4 sheets:
 *   1. Summary — Execution metadata and pass/fail totals
 *   2. Test Cases — All test case details
 *   3. Failed Tests — Failures with screenshot paths and reasons
 *   4. Execution Logs — Step-by-step logs
 */
const ExcelJS = require('exceljs')
const path = require('path')
const fs = require('fs')
const os = require('os')

// ── In-memory stores ─────────────────────────────────────────────
const _testCases = []
const _failedTests = []
const _executionLogs = []
let _suiteStartTime = Date.now()
let _deviceName = 'Unknown'
let _androidVersion = 'Unknown'

// ── Styling Helpers ──────────────────────────────────────────────

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4A3FA0' }, // Survexa purple
}

const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
const PASS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }
const FAIL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    }
  })
  row.height = 30
}

function styleDataRow(row, isPassed = null) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    }
    if (isPassed === true) cell.fill = PASS_FILL
    if (isPassed === false) cell.fill = FAIL_FILL
  })
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Set device info (called from BaseTest before suite)
 */
function setDeviceInfo(name, version) {
  _deviceName = name || 'Android Device'
  _androidVersion = version || 'Unknown'
  _suiteStartTime = Date.now()
}

/**
 * Record a test case result
 */
function recordTestCase({ testId, module, scenario, status, startTime, endTime, screenshotPath }) {
  const duration = endTime && startTime ? `${((endTime - startTime) / 1000).toFixed(1)}s` : '-'
  _testCases.push({
    testId: testId || `TC-${_testCases.length + 1}`,
    module: module || 'General',
    scenario,
    device: _deviceName,
    status: status || 'Unknown',
    startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
    endTime: endTime ? new Date(endTime).toISOString() : new Date().toISOString(),
    duration,
    screenshotPath: screenshotPath || '',
  })
}

/**
 * Record a failed test with details
 */
function recordFailure({ testName, reason, screenshotPath, activityName }) {
  _failedTests.push({
    testName,
    reason: reason || 'Unknown failure',
    screenshotPath: screenshotPath || '',
    device: _deviceName,
    androidVersion: _androidVersion,
    activityName: activityName || 'Unknown',
    timestamp: new Date().toISOString(),
  })
}

/**
 * Record a step log entry
 */
function recordStepLog(testName, step, result, remarks = '') {
  _executionLogs.push({
    timestamp: new Date().toISOString(),
    testName,
    step,
    result,
    remarks,
  })
}

/**
 * Generate the Excel report — call at end of test suite
 */
async function generateReport() {
  const excelDir = path.resolve(__dirname, '../excel')
  if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true })

  const reportPath = path.join(excelDir, `Mobile_E2E_Report_${Date.now()}.xlsx`)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Survexa Appium Framework'
  workbook.created = new Date()

  const totalTests = _testCases.length
  const passed = _testCases.filter((t) => t.status === 'Pass').length
  const failed = _testCases.filter((t) => t.status === 'Fail').length
  const skipped = _testCases.filter((t) => t.status === 'Skip').length
  const passPercentage = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) + '%' : '0%'
  const totalDuration = `${((Date.now() - _suiteStartTime) / 1000).toFixed(0)}s`

  // ── Sheet 1: Summary ─────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('Summary', {
    pageSetup: { orientation: 'landscape' },
  })

  summarySheet.mergeCells('A1:H1')
  const titleCell = summarySheet.getCell('A1')
  titleCell.value = '📱 Survexa Mobile E2E Test Execution Report'
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF4A3FA0' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  summarySheet.getRow(1).height = 40

  summarySheet.addRow([]) // spacer

  const summaryHeaders = [
    'Execution Date', 'Device Name', 'Android Version',
    'Total Tests', 'Passed', 'Failed', 'Skipped', 'Pass %', 'Duration',
  ]
  const summaryHeaderRow = summarySheet.addRow(summaryHeaders)
  styleHeader(summaryHeaderRow)

  const summaryDataRow = summarySheet.addRow([
    new Date().toLocaleDateString(),
    _deviceName,
    _androidVersion,
    totalTests,
    passed,
    failed,
    skipped,
    passPercentage,
    totalDuration,
  ])
  styleDataRow(summaryDataRow)

  summarySheet.columns = summaryHeaders.map(() => ({ width: 18 }))

  // ── Sheet 2: Test Cases ───────────────────────────────────────
  const tcSheet = workbook.addWorksheet('Test Cases')

  const tcHeaders = ['Test ID', 'Module', 'Scenario', 'Device', 'Status', 'Start Time', 'End Time', 'Duration', 'Screenshot']
  const tcHeaderRow = tcSheet.addRow(tcHeaders)
  styleHeader(tcHeaderRow)

  for (const tc of _testCases) {
    const row = tcSheet.addRow([
      tc.testId, tc.module, tc.scenario, tc.device,
      tc.status, tc.startTime, tc.endTime, tc.duration, tc.screenshotPath,
    ])
    styleDataRow(row, tc.status === 'Pass')
  }

  tcSheet.columns = [12, 18, 50, 20, 10, 22, 22, 12, 50].map((w) => ({ width: w }))

  // ── Sheet 3: Failed Tests ─────────────────────────────────────
  const failSheet = workbook.addWorksheet('Failed Tests')

  const failHeaders = ['Test Name', 'Failure Reason', 'Screenshot Path', 'Device', 'Android Version', 'Activity Name', 'Timestamp']
  const failHeaderRow = failSheet.addRow(failHeaders)
  styleHeader(failHeaderRow)

  for (const f of _failedTests) {
    const row = failSheet.addRow([
      f.testName, f.reason, f.screenshotPath, f.device, f.androidVersion, f.activityName, f.timestamp,
    ])
    styleDataRow(row, false)
  }

  failSheet.columns = [40, 60, 50, 20, 16, 30, 22].map((w) => ({ width: w }))

  // ── Sheet 4: Execution Logs ───────────────────────────────────
  const logSheet = workbook.addWorksheet('Execution Logs')

  const logHeaders = ['Timestamp', 'Test Name', 'Step', 'Result', 'Remarks']
  const logHeaderRow = logSheet.addRow(logHeaders)
  styleHeader(logHeaderRow)

  for (const log of _executionLogs) {
    const row = logSheet.addRow([log.timestamp, log.testName, log.step, log.result, log.remarks])
    styleDataRow(row, log.result === 'Pass')
  }

  logSheet.columns = [22, 40, 40, 12, 60].map((w) => ({ width: w }))

  await workbook.xlsx.writeFile(reportPath)
  console.log(`\n📊 Excel Report Generated: ${reportPath}\n`)
  return reportPath
}

module.exports = {
  setDeviceInfo,
  recordTestCase,
  recordFailure,
  recordStepLog,
  generateReport,
  getTestCases: () => _testCases,
  getFailedTests: () => _failedTests,
}
