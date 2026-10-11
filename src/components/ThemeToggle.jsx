import { useEffect, useState } from "react";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem("theme") || "dark";
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isLight = theme === "light";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      <span className="theme-toggle-thumb">
        {isLight ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 13.4A8 8 0 0 1 10.6 3a7 7 0 1 0 10.4 10.4Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.4-6.4 1.4-1.4M4.2 19.8l1.4-1.4m0-12.8L4.2 4.2m15.6 15.6-1.4-1.4" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
      </span>
    </button>
  );
}
