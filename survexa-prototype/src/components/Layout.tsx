import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function StatusBar() {
  return (
    <div className="status-bar" aria-hidden>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
          <rect x="9" y="2" width="3" height="10" rx="0.5" />
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" />
        </svg>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <path d="M9 2.5C6.5 2.5 4.2 3.5 2.5 5.2L0.8 3.5C3 1.3 5.9 0 9 0s6 1.3 8.2 3.5l-1.7 1.7C13.8 3.5 11.5 2.5 9 2.5z" />
          <path d="M9 6c-1.7 0-3.2.7-4.3 1.8L3 6.1C4.6 4.5 6.7 3.5 9 3.5s4.4 1 6 2.6l-1.7 1.7C12.2 6.7 10.7 6 9 6z" />
          <circle cx="9" cy="10" r="2" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="currentColor">
          <rect x="0" y="1" width="22" height="10" rx="2" stroke="currentColor" fill="none" strokeWidth="1" />
          <rect x="2" y="3" width="16" height="6" rx="1" />
          <rect x="23" y="4" width="2" height="4" rx="0.5" />
        </svg>
      </span>
    </div>
  );
}

interface ScreenHeaderProps {
  title?: string;
  backTo?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, backTo = "/", right }: ScreenHeaderProps) {
  return (
    <header className="screen-header">
      {backTo ? (
        <Link to={backTo} className="back-btn" aria-label="Go back">
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <span style={{ width: 40 }} />
      )}
      {title && <span className="heading-md">{title}</span>}
      {right ?? <span style={{ width: 40 }} />}
    </header>
  );
}

interface TabBarProps {
  active?: "home" | "surveys" | "analytics" | "profile";
}

export function TabBar({ active = "home" }: TabBarProps) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    {
      id: "surveys" as const,
      label: "Surveys",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      id: "analytics" as const,
      label: "Insights",
      icon: "M18 20V10M12 20V4M6 20v-6",
    },
    {
      id: "profile" as const,
      label: "Profile",
      icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    },
  ];

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-item ${active === tab.id ? "active" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={tab.icon} />
          </svg>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

interface ScreenProps {
  children: ReactNode;
  tabActive?: "home" | "surveys" | "analytics" | "profile";
  header?: ReactNode;
  noStatus?: boolean;
}

export function Screen({ children, tabActive, header, noStatus }: ScreenProps) {
  return (
    <>
      {!noStatus && <StatusBar />}
      {header}
      <main className={`screen-content ${tabActive ? "has-tab" : ""}`}>
        {children}
      </main>
      {tabActive && <TabBar active={tabActive} />}
    </>
  );
}

export function Blobs() {
  return (
    <>
      <div className="pastel-blob blob-lavender" style={{ top: -40, right: -60 }} />
      <div className="pastel-blob blob-cyan" style={{ bottom: 120, left: -80 }} />
      <div className="pastel-blob blob-peach" style={{ bottom: -20, right: 20 }} />
    </>
  );
}
