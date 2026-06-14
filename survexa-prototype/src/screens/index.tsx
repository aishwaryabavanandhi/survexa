import {
  BarChart3,
  Bell,
  Bot,
  Check,
  ChevronRight,
  Download,
  FileText,
  Link2,
  Mail,
  Moon,
  Plus,
  QrCode,
  Share2,
  Sparkles,
  Sun,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BarChartView, LineChartView, PieChartView, QRPattern } from "../components/Charts";
import { Blobs, Screen, ScreenHeader } from "../components/Layout";
import { useTheme } from "../context/ThemeContext";

/* ── Auth ── */

export function SplashScreen() {
  return (
    <Screen noStatus>
      <Blobs />
      <div className="hero-center" style={{ minHeight: "100%" }}>
        <div className="splash-logo">S</div>
        <h1 className="display-md gradient-text">Survexa</h1>
        <p className="body-sm text-secondary" style={{ maxWidth: 260 }}>
          AI-powered surveys with real-time analytics
        </p>
        <div className="progress-bar mt-6" style={{ width: 120 }}>
          <div className="progress-fill" style={{ width: "68%" }} />
        </div>
      </div>
    </Screen>
  );
}

export function WelcomeScreen() {
  return (
    <Screen>
      <Blobs />
      <div className="hero-center" style={{ paddingTop: 48 }}>
        <span className="badge badge-ai">
          <Sparkles size={12} /> AI-Powered
        </span>
        <h1 className="display-lg mt-4">Survey smarter with Survexa</h1>
        <p className="body-md text-secondary mt-4">
          Create intelligent surveys, collect responses in real time, and deliver
          automated PDF reports.
        </p>
        <div className="stack w-full mt-6">
          <Link to="/signup" className="btn btn-primary w-full">
            Get started free
          </Link>
          <Link to="/login" className="btn btn-secondary w-full">
            I have an account
          </Link>
        </div>
      </div>
    </Screen>
  );
}

export function LoginScreen() {
  return (
    <Screen header={<ScreenHeader title="Sign in" backTo="/" />}>
      <p className="body-sm text-muted mb-4">Welcome back to Survexa</p>
      <div className="field">
        <label className="field-label">Email</label>
        <input className="input" type="email" placeholder="you@company.com" />
      </div>
      <div className="field">
        <label className="field-label">Password</label>
        <input className="input" type="password" placeholder="Enter password" />
      </div>
      <Link to="/forgot-password" className="btn btn-ghost" style={{ paddingLeft: 0 }}>
        Forgot password?
      </Link>
      <button type="button" className="btn btn-primary w-full mt-4">
        Sign in
      </button>
      <p className="caption text-center mt-4">
        New here? <Link to="/signup">Create account</Link>
      </p>
    </Screen>
  );
}

export function SignupScreen() {
  return (
    <Screen header={<ScreenHeader title="Create account" backTo="/welcome" />}>
      <div className="field">
        <label className="field-label">Full name</label>
        <input className="input" placeholder="Alex Morgan" />
      </div>
      <div className="field">
        <label className="field-label">Work email</label>
        <input className="input" type="email" placeholder="alex@startup.io" />
      </div>
      <div className="field">
        <label className="field-label">Password</label>
        <input className="input" type="password" placeholder="Min. 8 characters" />
      </div>
      <button type="button" className="btn btn-primary w-full">
        Continue
      </button>
      <p className="caption text-center mt-4">
        By signing up you agree to our Terms & Privacy
      </p>
    </Screen>
  );
}

export function OTPScreen() {
  return (
    <Screen header={<ScreenHeader title="Verify email" backTo="/signup" />}>
      <p className="body-sm text-secondary text-center">
        Enter the 6-digit code sent to <strong>alex@startup.io</strong>
      </p>
      <div className="otp-row mt-6">
        {["4", "8", "2", "", "", ""].map((v, i) => (
          <input key={i} className="otp-cell" maxLength={1} defaultValue={v} aria-label={`Digit ${i + 1}`} />
        ))}
      </div>
      <button type="button" className="btn btn-primary w-full mt-6">
        Verify & continue
      </button>
      <button type="button" className="btn btn-ghost w-full mt-2">
        Resend code in 0:42
      </button>
    </Screen>
  );
}

export function ForgotPasswordScreen() {
  return (
    <Screen header={<ScreenHeader title="Reset password" backTo="/login" />}>
      <p className="body-sm text-secondary mb-4">
        We will send a secure link to reset your password.
      </p>
      <div className="field">
        <label className="field-label">Email address</label>
        <input className="input" type="email" placeholder="you@company.com" />
      </div>
      <button type="button" className="btn btn-primary w-full">
        Send reset link
      </button>
    </Screen>
  );
}

/* ── Core ── */

export function DashboardScreen() {
  return (
    <Screen tabActive="home">
      <div style={{ padding: "0 var(--space-5)" }}>
        <div className="row-between" style={{ paddingTop: 8 }}>
          <div>
            <p className="caption">Good morning</p>
            <h1 className="heading-lg">Alex Morgan</h1>
          </div>
          <button type="button" className="btn btn-icon" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </div>
        <div className="card card-gradient-border card-glass mt-4">
          <span className="badge badge-ai">
            <Bot size={12} /> AI Assistant
          </span>
          <h3 className="heading-md mt-2">3 insights ready</h3>
          <p className="body-sm text-secondary">
            Response rate up 24% this week. Review recommendations.
          </p>
          <Link to="/ai-insights" className="btn btn-soft btn-sm mt-4">
            View insights
          </Link>
        </div>
        <div className="grid-2 mt-4">
          <div className="stat-card" style={{ background: "var(--pastel-lavender)" }}>
            <p className="caption">Active surveys</p>
            <p className="stat-value">12</p>
          </div>
          <div className="stat-card" style={{ background: "var(--pastel-mint)" }}>
            <p className="caption">Responses today</p>
            <p className="stat-value">847</p>
          </div>
        </div>
        <h3 className="heading-md mt-6 mb-2">Recent surveys</h3>
        {["Customer NPS Q2", "Product feedback", "Employee pulse"].map((title) => (
          <div key={title} className="survey-item">
            <div className="row-between">
              <h4>{title}</h4>
              <ChevronRight size={18} className="icon-muted" />
            </div>
            <p className="caption">Last updated 2h ago · 156 responses</p>
          </div>
        ))}
        <Link to="/create-survey" className="btn btn-primary w-full mt-4">
          <Plus size={18} /> New survey
        </Link>
      </div>
    </Screen>
  );
}

/* ── Survey flow ── */

export function CreateSurveyScreen() {
  const templates = [
    { name: "Customer satisfaction", color: "var(--pastel-cyan)" },
    { name: "Employee engagement", color: "var(--pastel-lavender)" },
    { name: "Market research", color: "var(--pastel-peach)" },
    { name: "Event feedback", color: "var(--pastel-mint)" },
  ];
  return (
    <Screen header={<ScreenHeader title="Create survey" backTo="/dashboard" />}>
      <button type="button" className="card card-glass w-full" style={{ textAlign: "left" }}>
        <div className="row-between">
          <div>
            <span className="badge badge-ai">
              <Wand2 size={12} /> Recommended
            </span>
            <h3 className="heading-md mt-2">Start with AI</h3>
            <p className="body-sm text-secondary">Generate questions from a brief</p>
          </div>
          <div className="ai-orb" style={{ width: 48, height: 48 }} />
        </div>
      </button>
      <p className="heading-md mt-6 mb-2">Templates</p>
      <div className="grid-2">
        {templates.map((t) => (
          <div
            key={t.name}
            className="card card-float"
            style={{ background: t.color, padding: "var(--space-4)", minHeight: 100 }}
          >
            <p className="body-sm" style={{ fontWeight: 600 }}>
              {t.name}
            </p>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-secondary w-full mt-4">
        Blank survey
      </button>
    </Screen>
  );
}

export function AIGeneratorScreen() {
  return (
    <Screen header={<ScreenHeader title="AI Generator" backTo="/create-survey" />}>
      <div className="card card-gradient-border card-glass">
        <label className="field-label">Describe your survey goal</label>
        <textarea
          className="input"
          rows={4}
          placeholder="e.g. Measure customer satisfaction after product launch..."
          defaultValue="Post-purchase satisfaction for our SaaS onboarding flow"
        />
        <div className="row-between mt-4" style={{ flexWrap: "wrap", gap: 8 }}>
          {["NPS", "CSAT", "5 questions", "B2B"].map((chip) => (
            <span key={chip} className="chip chip-active">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <button type="button" className="btn btn-primary w-full mt-4">
        <Sparkles size={18} /> Generate questions
      </button>
      <p className="heading-md mt-6">Preview</p>
      {["How satisfied are you with onboarding?", "Would you recommend us to a colleague?", "What could we improve?"].map(
        (q, i) => (
          <div key={i} className="question-block">
            <span className="caption">Q{i + 1}</span>
            <p className="body-md" style={{ margin: "4px 0 0" }}>
              {q}
            </p>
          </div>
        ),
      )}
    </Screen>
  );
}

export function SurveyBuilderScreen() {
  return (
    <Screen header={<ScreenHeader title="Builder" backTo="/create-survey" />}>
      <div className="row-between mb-4">
        <input className="input" defaultValue="Customer NPS Q2" style={{ flex: 1 }} />
        <button type="button" className="btn btn-soft btn-sm">
          Save
        </button>
      </div>
      <div className="progress-bar mb-4">
        <div className="progress-fill" style={{ width: "75%" }} />
      </div>
      <p className="caption mb-4">6 of 8 questions</p>
      {["Rating scale", "Multiple choice", "Open text"].map((type, i) => (
        <div key={i} className="question-block">
          <div className="row-between">
            <span className="badge">{type}</span>
            <span className="caption">Required</span>
          </div>
          <p className="body-md mt-2">Sample question {i + 1}</p>
        </div>
      ))}
      <button type="button" className="btn btn-secondary w-full">
        <Plus size={18} /> Add question
      </button>
      <Link to="/survey-preview" className="btn btn-primary w-full mt-4">
        Preview survey
      </Link>
    </Screen>
  );
}

export function SurveyPreviewScreen() {
  return (
    <Screen header={<ScreenHeader title="Preview" backTo="/survey-builder" />}>
      <div className="card" style={{ background: "var(--gradient-hero)" }}>
        <h2 className="heading-lg">Customer NPS Q2</h2>
        <p className="body-sm text-secondary">Estimated time: 3 min</p>
      </div>
      <div className="question-block mt-4">
        <p className="body-md">How likely are you to recommend Survexa?</p>
        <div className="row-between mt-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              className="chip"
              style={{ minWidth: 28, padding: "6px 4px", fontSize: 11 }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="btn btn-primary w-full mt-4">
        Publish survey
      </button>
    </Screen>
  );
}

export function SurveySharingScreen() {
  const options = [
    { icon: Link2, label: "Copy link", sub: "survexa.app/s/nps-q2" },
    { icon: Mail, label: "Email invite", sub: "Send to contacts" },
    { icon: Share2, label: "Social share", sub: "LinkedIn, X, Slack" },
    { icon: QrCode, label: "QR code", sub: "Print or display" },
  ];
  return (
    <Screen header={<ScreenHeader title="Share survey" backTo="/survey-preview" />}>
      <p className="body-sm text-secondary mb-4">
        Your survey is live. Share it to start collecting responses.
      </p>
      {options.map((o) => (
        <div key={o.label} className="share-option">
          <div
            className="list-icon"
            style={{ background: "var(--pastel-lavender)" }}
          >
            <o.icon size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p className="body-md" style={{ margin: 0, fontWeight: 600 }}>
              {o.label}
            </p>
            <p className="caption">{o.sub}</p>
          </div>
          <ChevronRight size={18} className="icon-muted" />
        </div>
      ))}
      <Link to="/qr-code" className="btn btn-primary w-full mt-4">
        Open QR code
      </Link>
    </Screen>
  );
}

export function QRCodeScreen() {
  return (
    <Screen header={<ScreenHeader title="QR Code" backTo="/survey-sharing" />}>
      <div className="qr-frame">
        <QRPattern />
      </div>
      <p className="body-md text-center mt-4">Customer NPS Q2</p>
      <p className="caption text-center">Scan to open survey</p>
      <div className="grid-2 mt-6">
        <button type="button" className="btn btn-secondary">
          <Download size={18} /> Save
        </button>
        <button type="button" className="btn btn-primary">
          <Share2 size={18} /> Share
        </button>
      </div>
    </Screen>
  );
}

export function ResponseCollectionScreen() {
  return (
    <Screen header={<ScreenHeader title="Responses" backTo="/dashboard" />}>
      <div className="row-between mb-4">
        <div>
          <p className="stat-value">847</p>
          <p className="caption">Total responses</p>
        </div>
        <span className="badge badge-live">
          <Zap size={12} /> Real-time
        </span>
      </div>
      <div className="progress-bar mb-4">
        <div className="progress-fill" style={{ width: "84%" }} />
      </div>
      <p className="caption mb-4">84% of weekly goal</p>
      {[
        { name: "Sarah K.", score: 9, time: "2m ago" },
        { name: "James L.", score: 8, time: "5m ago" },
        { name: "Mia T.", score: 10, time: "12m ago" },
      ].map((r) => (
        <div key={r.name} className="list-item card" style={{ marginBottom: 8, padding: 12 }}>
          <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
            {r.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <p className="body-md" style={{ margin: 0, fontWeight: 600 }}>
              {r.name}
            </p>
            <p className="caption">NPS score: {r.score}</p>
          </div>
          <span className="caption">{r.time}</span>
        </div>
      ))}
    </Screen>
  );
}

/* ── Analytics ── */

export function AnalyticsDashboardScreen() {
  return (
    <Screen tabActive="analytics" header={<ScreenHeader title="Analytics" backTo="/" />}>
      <div className="grid-2 mb-4">
        <div className="admin-metric">
          <p className="caption">Completion rate</p>
          <p className="stat-value">78%</p>
        </div>
        <div className="admin-metric">
          <p className="caption">Avg. NPS</p>
          <p className="stat-value">+42</p>
        </div>
      </div>
      <BarChartView />
      <Link to="/analytics/bar" className="btn btn-ghost btn-sm w-full mt-2">
        View bar chart
      </Link>
    </Screen>
  );
}

export function BarChartScreen() {
  return (
    <Screen header={<ScreenHeader title="Bar analytics" backTo="/analytics" />}>
      <BarChartView />
      <p className="caption mt-4">Source: Customer NPS Q2 · Last 7 days</p>
    </Screen>
  );
}

export function PieChartScreen() {
  return (
    <Screen header={<ScreenHeader title="Pie analytics" backTo="/analytics" />}>
      <PieChartView />
    </Screen>
  );
}

export function LineChartScreen() {
  return (
    <Screen header={<ScreenHeader title="Trend analytics" backTo="/analytics" />}>
      <LineChartView />
    </Screen>
  );
}

export function AIInsightsScreen() {
  return (
    <Screen header={<ScreenHeader title="AI Insights" backTo="/dashboard" />}>
      <div className="insight-card">
        <span className="badge badge-ai">
          <Sparkles size={12} /> High confidence
        </span>
        <h3 className="heading-md mt-2">Response spike detected</h3>
        <p className="body-sm text-secondary">
          Thursday submissions are 34% above average. Consider extending the survey window.
        </p>
      </div>
      <div className="insight-card">
        <h3 className="heading-md">Sentiment trend</h3>
        <p className="body-sm text-secondary">
          Positive sentiment increased from 62% to 71% after onboarding updates.
        </p>
      </div>
      <div className="insight-card">
        <h3 className="heading-md">Drop-off point</h3>
        <p className="body-sm text-secondary">
          18% abandon at question 4. Shorten or split into two steps.
        </p>
      </div>
      <Link to="/recommendations" className="btn btn-primary w-full">
        View recommendations
      </Link>
    </Screen>
  );
}

export function RecommendationsScreen() {
  const items = [
    "Add a progress indicator to reduce abandonment",
    "Send reminder emails to non-respondents on day 3",
    "Enable anonymous mode for sensitive feedback",
  ];
  return (
    <Screen header={<ScreenHeader title="Recommendations" backTo="/ai-insights" />}>
      <p className="body-sm text-secondary mb-4">
        Personalized actions based on your survey performance.
      </p>
      {items.map((item, i) => (
        <div key={i} className="share-option">
          <div
            className="list-icon"
            style={{ background: "var(--pastel-mint)" }}
          >
            <Check size={18} />
          </div>
          <p className="body-md" style={{ margin: 0, flex: 1 }}>
            {item}
          </p>
        </div>
      ))}
      <button type="button" className="btn btn-primary w-full mt-4">
        Apply all suggestions
      </button>
    </Screen>
  );
}

/* ── Reports ── */

export function PDFPreviewScreen() {
  return (
    <Screen header={<ScreenHeader title="PDF Preview" backTo="/analytics" />}>
      <div className="pdf-preview">
        <FileText size={48} style={{ color: "var(--accent-primary)" }} />
        <h3 className="heading-md mt-4">NPS Report — Q2 2026</h3>
        <p className="caption">12 pages · Generated by AI</p>
      </div>
      <div className="row-between mt-4">
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
          Edit sections
        </button>
        <Link to="/report-download" className="btn btn-primary" style={{ flex: 1, marginLeft: 12 }}>
          Export
        </Link>
      </div>
    </Screen>
  );
}

export function ReportDownloadScreen() {
  return (
    <Screen header={<ScreenHeader title="Download" backTo="/pdf-preview" />}>
      <p className="body-sm text-secondary mb-4">Choose export format</p>
      {["PDF — Full report", "PDF — Executive summary", "CSV — Raw data"].map((fmt) => (
        <div key={fmt} className="share-option">
          <div className="list-icon" style={{ background: "var(--pastel-peach)" }}>
            <Download size={20} />
          </div>
          <p className="body-md" style={{ margin: 0, flex: 1, fontWeight: 600 }}>
            {fmt}
          </p>
          <ChevronRight size={18} className="icon-muted" />
        </div>
      ))}
      <button type="button" className="btn btn-primary w-full mt-6">
        <Download size={18} /> Download now
      </button>
    </Screen>
  );
}

export function ReportEmailScreen() {
  return (
    <Screen header={<ScreenHeader title="Email report" backTo="/pdf-preview" />}>
      <div className="field">
        <label className="field-label">Recipients</label>
        <input className="input" placeholder="team@company.com" />
      </div>
      <div className="field">
        <label className="field-label">Subject</label>
        <input className="input" defaultValue="Survexa NPS Report — Q2 2026" />
      </div>
      <div className="field">
        <label className="field-label">Message</label>
        <textarea
          className="input"
          rows={3}
          defaultValue="Please find attached the latest survey analytics report."
        />
      </div>
      <div className="card card-glass mt-2">
        <div className="row-between">
          <span className="body-sm">Attach PDF report</span>
          <div className="toggle on" role="switch" aria-checked="true" />
        </div>
      </div>
      <button type="button" className="btn btn-primary w-full mt-6">
        <Mail size={18} /> Send report
      </button>
    </Screen>
  );
}

/* ── Account ── */

export function NotificationsScreen() {
  const items = [
    { title: "New response batch", body: "47 responses on Customer NPS", unread: true },
    { title: "AI insight ready", body: "Weekly recommendations available", unread: true },
    { title: "Report generated", body: "PDF export completed", unread: false },
  ];
  return (
    <Screen header={<ScreenHeader title="Notifications" backTo="/dashboard" />}>
      {items.map((n) => (
        <div key={n.title} className={`notification-item ${n.unread ? "unread" : ""}`}>
          <div className="list-icon" style={{ background: "var(--pastel-lavender)" }}>
            <Bell size={18} />
          </div>
          <div>
            <p className="body-md" style={{ margin: 0, fontWeight: 600 }}>
              {n.title}
            </p>
            <p className="caption">{n.body}</p>
          </div>
        </div>
      ))}
    </Screen>
  );
}

export function ProfileScreen() {
  return (
    <Screen tabActive="profile">
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <div className="avatar avatar-lg" style={{ margin: "0 auto" }}>
          AM
        </div>
        <h2 className="heading-lg mt-4">Alex Morgan</h2>
        <p className="body-sm text-secondary">Product Lead · Startup Inc.</p>
        <span className="badge badge-ai mt-2">Pro Plan</span>
      </div>
      <div className="divider" />
      {[
        { label: "Surveys created", value: "24" },
        { label: "Total responses", value: "12.4k" },
        { label: "Reports sent", value: "89" },
      ].map((s) => (
        <div key={s.label} className="setting-row">
          <span className="body-md">{s.label}</span>
          <span className="heading-md">{s.value}</span>
        </div>
      ))}
      <Link to="/settings" className="btn btn-secondary w-full mt-4">
        Account settings
      </Link>
    </Screen>
  );
}

export function SettingsScreen() {
  const rows = ["Notifications", "Language", "Security", "Billing", "Help center"];
  return (
    <Screen header={<ScreenHeader title="Settings" backTo="/profile" />}>
      {rows.map((label) => (
        <div key={label} className="setting-row">
          <span className="body-md">{label}</span>
          <ChevronRight size={18} className="icon-muted" />
        </div>
      ))}
      <Link to="/dark-mode-settings" className="setting-row" style={{ textDecoration: "none", color: "inherit" }}>
        <span className="body-md">Appearance</span>
        <ChevronRight size={18} className="icon-muted" />
      </Link>
    </Screen>
  );
}

export function DarkModeSettingsScreen() {
  const { theme, setTheme } = useTheme();
  return (
    <Screen header={<ScreenHeader title="Appearance" backTo="/settings" />}>
      <p className="body-sm text-secondary mb-4">Choose how Survexa looks on your device.</p>
      {(
        [
          { id: "light" as const, label: "Light", icon: Sun },
          { id: "dark" as const, label: "Dark", icon: Moon },
        ] as const
      ).map((mode) => (
        <button
          key={mode.id}
          type="button"
          className="share-option"
          style={{
            borderColor: theme === mode.id ? "var(--accent-primary)" : undefined,
            width: "100%",
            textAlign: "left",
          }}
          onClick={() => setTheme(mode.id)}
        >
          <div className="list-icon" style={{ background: "var(--pastel-periwinkle)" }}>
            <mode.icon size={20} />
          </div>
          <span className="body-md" style={{ flex: 1, fontWeight: 600 }}>
            {mode.label} mode
          </span>
          {theme === mode.id && <Check size={20} style={{ color: "var(--accent-primary)" }} />}
        </button>
      ))}
      <div className="card card-glass mt-6">
        <div className="setting-row" style={{ border: "none", padding: 0 }}>
          <span className="body-md">Match system</span>
          <div className="toggle" role="switch" />
        </div>
      </div>
    </Screen>
  );
}

/* ── Admin ── */

export function AdminDashboardScreen() {
  return (
    <Screen header={<ScreenHeader title="Admin" backTo="/" />}>
      <span className="badge" style={{ background: "var(--pastel-peach)" }}>
        Enterprise
      </span>
      <div className="grid-2 mt-4">
        <div className="admin-metric">
          <Users size={18} style={{ color: "var(--accent-primary)" }} />
          <p className="caption mt-2">Team members</p>
          <p className="stat-value">48</p>
        </div>
        <div className="admin-metric">
          <BarChart3 size={18} style={{ color: "var(--accent-primary)" }} />
          <p className="caption mt-2">Org surveys</p>
          <p className="stat-value">312</p>
        </div>
      </div>
      <h3 className="heading-md mt-6">Workspace activity</h3>
      <LineChartView />
      <h3 className="heading-md mt-4">Top teams</h3>
      {["Product", "Marketing", "Support"].map((team, i) => {
        const colors = [
          "var(--chart-bar-1)",
          "var(--chart-bar-2)",
          "var(--chart-bar-3)",
        ];
        return (
        <div key={team} className="list-item">
          <div className="list-icon" style={{ background: colors[i] }}>
            {team[0]}
          </div>
          <div style={{ flex: 1 }}>
            <p className="body-md" style={{ margin: 0, fontWeight: 600 }}>
              {team}
            </p>
            <p className="caption">{120 - i * 30} active surveys</p>
          </div>
        </div>
        );
      })}
    </Screen>
  );
}
