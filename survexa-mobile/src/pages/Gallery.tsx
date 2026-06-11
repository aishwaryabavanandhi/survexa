import type { ReactElement } from "react";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { PhoneFrame } from "../components/PhoneFrame";
import { useTheme } from "../context/ThemeContext";
import { SCREENS } from "../screens/registry";
import {
  SplashScreen,
  WelcomeScreen,
  LoginScreen,
  SignupScreen,
  OTPScreen,
  ForgotPasswordScreen,
  DashboardScreen,
  CreateSurveyScreen,
  AIGeneratorScreen,
  SurveyBuilderScreen,
  SurveyPreviewScreen,
  SurveySharingScreen,
  QRCodeScreen,
  ResponseCollectionScreen,
  AnalyticsDashboardScreen,
  BarChartScreen,
  PieChartScreen,
  LineChartScreen,
  AIInsightsScreen,
  RecommendationsScreen,
  PDFPreviewScreen,
  ReportDownloadScreen,
  ReportEmailScreen,
  NotificationsScreen,
  ProfileScreen,
  SettingsScreen,
  DarkModeSettingsScreen,
  AdminDashboardScreen,
} from "../screens";

const PREVIEW_MAP: Record<string, () => ReactElement> = {
  splash: SplashScreen,
  welcome: WelcomeScreen,
  login: LoginScreen,
  signup: SignupScreen,
  otp: OTPScreen,
  forgot: ForgotPasswordScreen,
  dashboard: DashboardScreen,
  "create-survey": CreateSurveyScreen,
  "ai-generator": AIGeneratorScreen,
  builder: SurveyBuilderScreen,
  preview: SurveyPreviewScreen,
  sharing: SurveySharingScreen,
  qr: QRCodeScreen,
  responses: ResponseCollectionScreen,
  analytics: AnalyticsDashboardScreen,
  "bar-chart": BarChartScreen,
  "pie-chart": PieChartScreen,
  "line-chart": LineChartScreen,
  "ai-insights": AIInsightsScreen,
  recommendations: RecommendationsScreen,
  "pdf-preview": PDFPreviewScreen,
  download: ReportDownloadScreen,
  email: ReportEmailScreen,
  notifications: NotificationsScreen,
  profile: ProfileScreen,
  settings: SettingsScreen,
  "dark-mode": DarkModeSettingsScreen,
  admin: AdminDashboardScreen,
};

export function Gallery() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell gallery">
      <header className="gallery-header">
        <div className="gallery-brand">
          <div className="gallery-logo">S</div>
          <div>
            <h1 className="gallery-title">Survexa Mobile UI</h1>
            <p className="gallery-subtitle">
              Premium AI survey platform — 28 screens, pastel design system, light &
              dark mode. App Store & investor ready.
            </p>
          </div>
        </div>
        <div className="gallery-actions">
          <Link to="/design-system" className="btn btn-secondary btn-sm">
            Design system
          </Link>
          <button type="button" className="theme-toggle-gallery" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </header>

      <div className="screen-grid">
        {SCREENS.map((screen) => {
          const Preview = PREVIEW_MAP[screen.id];
          return (
            <Link key={screen.id} to={screen.path} className="screen-card-link">
              <PhoneFrame>
                {Preview ? <Preview /> : null}
              </PhoneFrame>
              <p className="screen-card-label">{screen.title}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
