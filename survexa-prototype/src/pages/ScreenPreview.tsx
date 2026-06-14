import type { ReactElement } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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

const ROUTE_COMPONENTS: Record<string, () => ReactElement> = {
  "/splash": SplashScreen,
  "/welcome": WelcomeScreen,
  "/login": LoginScreen,
  "/signup": SignupScreen,
  "/otp": OTPScreen,
  "/forgot-password": ForgotPasswordScreen,
  "/dashboard": DashboardScreen,
  "/create-survey": CreateSurveyScreen,
  "/ai-generator": AIGeneratorScreen,
  "/survey-builder": SurveyBuilderScreen,
  "/survey-preview": SurveyPreviewScreen,
  "/survey-sharing": SurveySharingScreen,
  "/qr-code": QRCodeScreen,
  "/responses": ResponseCollectionScreen,
  "/analytics": AnalyticsDashboardScreen,
  "/analytics/bar": BarChartScreen,
  "/analytics/pie": PieChartScreen,
  "/analytics/line": LineChartScreen,
  "/ai-insights": AIInsightsScreen,
  "/recommendations": RecommendationsScreen,
  "/pdf-preview": PDFPreviewScreen,
  "/report-download": ReportDownloadScreen,
  "/report-email": ReportEmailScreen,
  "/notifications": NotificationsScreen,
  "/profile": ProfileScreen,
  "/settings": SettingsScreen,
  "/dark-mode-settings": DarkModeSettingsScreen,
  "/admin": AdminDashboardScreen,
};

export function ScreenPreview() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const meta = SCREENS.find((s) => s.path === pathname);
  const ScreenComponent = ROUTE_COMPONENTS[pathname];

  return (
    <div className="app-shell preview-layout">
      <div className="preview-toolbar" style={{ maxWidth: 420 }}>
        <Link to="/" className="preview-back">
          <ArrowLeft size={18} /> All screens
        </Link>
        <span className="heading-md">{meta?.title ?? "Screen"}</span>
        <button type="button" className="btn btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <PhoneFrame>{ScreenComponent ? <ScreenComponent /> : <p>Screen not found</p>}</PhoneFrame>
    </div>
  );
}
