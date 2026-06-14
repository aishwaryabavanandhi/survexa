export interface ScreenMeta {
  id: string;
  path: string;
  title: string;
  category: "auth" | "core" | "survey" | "analytics" | "reports" | "account" | "admin";
}

export const SCREENS: ScreenMeta[] = [
  { id: "splash", path: "/splash", title: "Splash Screen", category: "auth" },
  { id: "welcome", path: "/welcome", title: "Welcome", category: "auth" },
  { id: "login", path: "/login", title: "Login", category: "auth" },
  { id: "signup", path: "/signup", title: "Sign Up", category: "auth" },
  { id: "otp", path: "/otp", title: "OTP Verification", category: "auth" },
  { id: "forgot", path: "/forgot-password", title: "Forgot Password", category: "auth" },
  { id: "dashboard", path: "/dashboard", title: "Dashboard", category: "core" },
  { id: "create-survey", path: "/create-survey", title: "Create Survey", category: "survey" },
  { id: "ai-generator", path: "/ai-generator", title: "AI Question Generator", category: "survey" },
  { id: "builder", path: "/survey-builder", title: "Survey Builder", category: "survey" },
  { id: "preview", path: "/survey-preview", title: "Survey Preview", category: "survey" },
  { id: "sharing", path: "/survey-sharing", title: "Survey Sharing", category: "survey" },
  { id: "distribution-hub", path: "/distribution-hub", title: "Distribution Hub", category: "survey" },
  { id: "qr", path: "/qr-code", title: "QR Code", category: "survey" },
  { id: "responses", path: "/responses", title: "Response Collection", category: "survey" },
  { id: "analytics", path: "/analytics", title: "Analytics Dashboard", category: "analytics" },
  { id: "bar-chart", path: "/analytics/bar", title: "Bar Chart Analytics", category: "analytics" },
  { id: "pie-chart", path: "/analytics/pie", title: "Pie Chart Analytics", category: "analytics" },
  { id: "line-chart", path: "/analytics/line", title: "Line Chart Analytics", category: "analytics" },
  { id: "ai-insights", path: "/ai-insights", title: "AI Insights", category: "analytics" },
  { id: "recommendations", path: "/recommendations", title: "Recommendations", category: "analytics" },
  { id: "pdf-preview", path: "/pdf-preview", title: "PDF Report Preview", category: "reports" },
  { id: "download", path: "/report-download", title: "Report Download", category: "reports" },
  { id: "email", path: "/report-email", title: "Report Email Delivery", category: "reports" },
  { id: "notifications", path: "/notifications", title: "Notifications", category: "account" },
  { id: "profile", path: "/profile", title: "User Profile", category: "account" },
  { id: "settings", path: "/settings", title: "Settings", category: "account" },
  { id: "dark-mode", path: "/dark-mode-settings", title: "Dark Mode Settings", category: "account" },
  { id: "admin", path: "/admin", title: "Admin Dashboard", category: "admin" },
];
