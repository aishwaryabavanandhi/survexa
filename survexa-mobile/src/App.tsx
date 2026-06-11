import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { DesignSystem } from "./pages/DesignSystem";
import { Gallery } from "./pages/Gallery";
import { ScreenPreview } from "./pages/ScreenPreview";
import { SCREENS } from "./screens/registry";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/design-system" element={<DesignSystem />} />
          {SCREENS.map((s) => (
            <Route key={s.path} path={s.path} element={<ScreenPreview />} />
          ))}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
