import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute     from './AdminRoute'
import DashboardLayout from '../layouts/DashboardLayout'

/* Auth */
import Splash         from '../pages/auth/Splash'
import Welcome        from '../pages/auth/Welcome'
import Login          from '../pages/auth/Login'
import Signup         from '../pages/auth/Signup'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword  from '../pages/auth/ResetPassword'
import OTP            from '../pages/auth/OTP'
import VerifyPhone    from '../pages/auth/VerifyPhone'
import EnterMobile    from '../pages/auth/EnterMobile'
import PhoneOtpVerify from '../pages/auth/PhoneOtpVerify'
import ResendPhoneOtp from '../pages/auth/ResendPhoneOtp'

/* Onboarding */
import Onboarding from '../pages/onboarding/Onboarding'

/* Public survey (no auth) */
import PublicSurvey from '../pages/public/PublicSurvey'
import CampaignRedirect from '../pages/public/CampaignRedirect'

/* Dashboard */
import Dashboard from '../pages/dashboard/Dashboard'

/* Surveys */
import SurveyList    from '../pages/surveys/SurveyList'
import SurveyBuilder from '../pages/surveys/SurveyBuilder'
import SurveyShare    from '../pages/surveys/SurveyShare'
import DistributionHub from '../pages/distribution/DistributionHub'

/* Workspace / spec routes */
import CreateSurveyHub   from '../pages/create/CreateSurveyHub'
import Templates         from '../pages/templates/Templates'
import NotificationsPage from '../pages/notifications/NotificationsPage'
import HelpCenter        from '../pages/help/HelpCenter'
import Discover          from '../pages/discover/Discover'
import ActivityLog       from '../pages/activity/ActivityLog'
import Trash             from '../pages/trash/Trash'
import CompareSurveys    from '../pages/compare/CompareSurveys'
import LiveResults       from '../pages/live/LiveResults'

/* AI */
import AIQuestionGenerator from '../pages/ai/AIQuestionGenerator'

/* Responses */
import Responses     from '../pages/responses/Responses'
import ResponseDetail from '../pages/responses/ResponseDetail'

/* Analytics */
import Analytics from '../pages/analytics/Analytics'

/* AI Insights */
import AIInsights from '../pages/insights/AIInsights'

/* Reports */
import Reports from '../pages/reports/Reports'

/* Settings */
import Settings from '../pages/settings/Settings'

/* Admin */
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminBilling   from '../pages/admin/AdminBilling'
import AdminPayments  from '../pages/admin/AdminPayments'
import AdminPaymentSettings from '../pages/admin/AdminPaymentSettings'
import AdminActivityLog from '../pages/admin/AdminActivityLog'
import Pricing from '../pages/billing/Pricing'
import Billing from '../pages/billing/Billing'
import Upgrade from '../pages/billing/Upgrade'
import CatchAllNavigate from './CatchAllNavigate'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Fully public ──────────────────────────────── */}
      <Route path="/splash"          element={<Splash />} />
      <Route path="/welcome"         element={<Welcome />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/signup"          element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="/otp"             element={<OTP />} />
      <Route path="/verify-phone"    element={<VerifyPhone />} />
      <Route path="/phone/enter"     element={<EnterMobile />} />
      <Route path="/phone/otp"       element={<PhoneOtpVerify />} />
      <Route path="/phone/resend"    element={<ResendPhoneOtp />} />
      <Route path="/onboarding"      element={<Onboarding />} />

      {/* ── Public survey taking (share link) ─────────── */}
      <Route path="/survey/:token"   element={<PublicSurvey />} />
      <Route path="/c/:trackingToken" element={<CampaignRedirect />} />
      <Route path="/pricing"         element={<Pricing />} />

      {/* ── Protected — all inside DashboardLayout ──────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"           element={<Dashboard />} />
          <Route path="/create"              element={<CreateSurveyHub />} />
          <Route path="/templates"           element={<Templates />} />
          <Route path="/surveys"             element={<SurveyList />} />
          <Route path="/surveys/builder"     element={<SurveyBuilder />} />
          <Route path="/surveys/builder/:id" element={<SurveyBuilder />} />
          <Route path="/surveys/:surveyId/share" element={<SurveyShare />} />
          <Route path="/distribution" element={<DistributionHub />} />
          <Route path="/notifications"       element={<NotificationsPage />} />
          <Route path="/help"                element={<HelpCenter />} />
          <Route path="/discover"            element={<Discover />} />
          <Route path="/activity"           element={<ActivityLog />} />
          <Route path="/trash"               element={<Trash />} />
          <Route path="/compare"             element={<CompareSurveys />} />
          <Route path="/live"                element={<LiveResults />} />
          <Route path="/ai-generator"        element={<AIQuestionGenerator />} />
          <Route path="/responses"           element={<Responses />} />
          <Route path="/responses/:id"       element={<ResponseDetail />} />
          <Route path="/analytics"           element={<Analytics />} />
          <Route path="/insights"            element={<AIInsights />} />
          <Route path="/reports"             element={<Reports />} />
          <Route path="/settings"            element={<Navigate to="/settings/profile" replace />} />
          <Route path="/settings/:tab"       element={<Settings />} />
          <Route path="/billing"            element={<Billing />} />
          <Route path="/upgrade"            element={<Upgrade />} />

          {/* ── Admin-only ── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/billing" element={<AdminBilling />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/settings/payments" element={<AdminPaymentSettings />} />
            <Route path="/admin/activity" element={<AdminActivityLog />} />
          </Route>
        </Route>
      </Route>

      {/* ── Fallback ───────────────────────────────────── */}
      <Route path="*" element={<CatchAllNavigate />} />
    </Routes>
  )
}
