import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  showNotch?: boolean;
}

export function PhoneFrame({ children, showNotch = true }: PhoneFrameProps) {
  return (
    <div className="phone-shell">
      {showNotch && <div className="phone-notch" aria-hidden />}
      <div className="phone-screen">
        <div className="phone-inner">{children}</div>
      </div>
    </div>
  );
}
