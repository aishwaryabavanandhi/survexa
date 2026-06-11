import { Link } from "react-router-dom";

export function DesignSystem() {
  const pastels = [
    { name: "Soft Cyan", var: "--pastel-cyan", hex: "#B8F2F5" },
    { name: "Lavender", var: "--pastel-lavender", hex: "#D6C6FF" },
    { name: "Periwinkle", var: "--pastel-periwinkle", hex: "#C8D4FF" },
    { name: "Mint", var: "--pastel-mint", hex: "#CFF8E3" },
    { name: "Peach", var: "--pastel-peach", hex: "#FFD7B8" },
    { name: "Soft Pink", var: "--pastel-pink", hex: "#F5C3E8" },
    { name: "Light Lemon", var: "--pastel-lemon", hex: "#FFF6B3" },
  ];

  return (
    <div className="app-shell gallery">
      <Link to="/" className="preview-back mb-4" style={{ display: "inline-flex" }}>
        ← Back to gallery
      </Link>
      <h1 className="gallery-title">Survexa Design System</h1>
      <p className="gallery-subtitle">
        Color tokens, typography, components, charts, and navigation — light & dark variants.
      </p>

      <section className="ds-section card mt-6">
        <h2 className="heading-lg">Brand pastels</h2>
        <div className="ds-row">
          {pastels.map((p) => (
            <div key={p.name} style={{ textAlign: "center" }}>
              <div className="swatch" style={{ background: `var(${p.var})` }} />
              <p className="caption">{p.name}</p>
              <p className="caption">{p.hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section card">
        <h2 className="heading-lg">Typography scale</h2>
        <p className="display-lg">Display Large — 28px bold</p>
        <p className="display-md">Display Medium — 24px bold</p>
        <p className="heading-lg">Heading Large — 20px semibold</p>
        <p className="heading-md">Heading Medium — 17px semibold</p>
        <p className="body-md">Body Medium — 15px regular</p>
        <p className="body-sm">Body Small — 13px regular</p>
        <p className="caption">Caption — 11px muted</p>
        <p className="caption mt-4">Font: Plus Jakarta Sans · Mono: JetBrains Mono</p>
      </section>

      <section className="ds-section card">
        <h2 className="heading-lg">Buttons</h2>
        <div className="ds-row">
          <button type="button" className="btn btn-primary">
            Primary
          </button>
          <button type="button" className="btn btn-secondary">
            Secondary
          </button>
          <button type="button" className="btn btn-soft">
            Soft
          </button>
          <button type="button" className="btn btn-ghost">
            Ghost
          </button>
        </div>
      </section>

      <section className="ds-section card">
        <h2 className="heading-lg">Inputs</h2>
        <div className="field" style={{ maxWidth: 360 }}>
          <label className="field-label">Email</label>
          <input className="input" placeholder="you@company.com" />
        </div>
        <div className="otp-row mt-4">
          {["1", "2", "3", "4", "5", "6"].map((d) => (
            <input key={d} className="otp-cell" defaultValue={d} readOnly />
          ))}
        </div>
      </section>

      <section className="ds-section card">
        <h2 className="heading-lg">Cards & badges</h2>
        <div className="card card-glass card-gradient-border" style={{ maxWidth: 400 }}>
          <span className="badge badge-ai">AI-Powered</span>
          <span className="badge badge-live" style={{ marginLeft: 8 }}>
            Live
          </span>
          <p className="body-md mt-4">Glassmorphism card with gradient border</p>
        </div>
      </section>

      <section className="ds-section card">
        <h2 className="heading-lg">Chart colors</h2>
        <p className="body-sm text-secondary">Bar: Lavender, Cyan, Mint, Peach</p>
        <div className="ds-row">
          <div className="swatch" style={{ background: "var(--chart-bar-1)" }} />
          <div className="swatch" style={{ background: "var(--chart-bar-2)" }} />
          <div className="swatch" style={{ background: "var(--chart-bar-3)" }} />
          <div className="swatch" style={{ background: "var(--chart-bar-4)" }} />
        </div>
        <p className="body-sm text-secondary mt-4">Pie: Pink, Mint, Lavender, Lemon</p>
        <div className="ds-row">
          <div className="swatch" style={{ background: "var(--chart-pie-1)" }} />
          <div className="swatch" style={{ background: "var(--chart-pie-2)" }} />
          <div className="swatch" style={{ background: "var(--chart-pie-3)" }} />
          <div className="swatch" style={{ background: "var(--chart-pie-4)" }} />
        </div>
        <p className="body-sm text-secondary mt-4">Line: gradient blue → purple</p>
        <div
          className="swatch"
          style={{ width: 120, background: "var(--gradient-line)" }}
        />
      </section>

      <section className="ds-section card">
        <h2 className="heading-lg">Dark / light surfaces</h2>
        <div className="grid-2">
          <div style={{ padding: 16, background: "var(--bg-primary)", borderRadius: 16, border: "1px solid var(--border-subtle)" }}>
            <p className="caption">bg-primary</p>
            <p style={{ color: "var(--text-primary)" }}>Primary text</p>
            <p style={{ color: "var(--text-secondary)" }}>Secondary text</p>
            <p style={{ color: "var(--text-muted)" }}>Muted text</p>
          </div>
          <div style={{ padding: 16, background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border-subtle)" }}>
            <p className="caption">card-bg</p>
            <p style={{ color: "var(--text-primary)" }}>Card content</p>
          </div>
        </div>
      </section>
    </div>
  );
}
