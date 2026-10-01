import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { useIsMobile } from "@/lib/useMediaQuery";

const WALLPAPERS = {
  light: "/wallpapers/krishnaos-light.svg",
  dark: "/wallpapers/krishnaos-dark.svg",
} as const;

const DARK_QUERY = "(prefers-color-scheme: dark)";

interface WallpaperProps {
  className?: string;
  variant?: "shell" | "boot" | "recruiter";
}

/**
 * Tracks the OS-level color scheme and updates when it changes while the
 * page is open (the old inline `matchMedia(...).matches` read only ran at
 * render time, so "System" theme went stale until something re-rendered).
 */
function useSystemPrefersDark(): boolean {
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersDark;
}

/**
 * Theme-aware wallpaper used across boot, the desktop shell, and Recruiter
 * Mode. The image itself is an authored SVG wallpaper; this component adds
 * the ambient overlays and adjusts blur/contrast based on the surface it is
 * backing.
 */
export function Wallpaper({ className, variant = "shell" }: WallpaperProps) {
  const themeMode = useThemeStore((s) => s.themeMode);
  const isMobile = useIsMobile();
  const systemPrefersDark = useSystemPrefersDark();
  const resolvedTheme =
    themeMode === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : themeMode;

  const blurStrength = variant === "boot" ? 24 : isMobile ? 10 : 18;
  const overlayOpacity =
    variant === "boot" ? 0.42 : variant === "recruiter" ? 0.22 : 0.18;

  return (
    <div
      aria-hidden
      className={`pointer-events-none ${className ?? ""}`.trim()}
      style={{
        backgroundImage:
          resolvedTheme === "dark"
            ? `linear-gradient(180deg, rgb(10 10 12 / ${overlayOpacity}), rgb(10 10 12 / ${overlayOpacity + 0.08})), url(${WALLPAPERS[resolvedTheme]})`
            : `linear-gradient(180deg, rgb(255 255 255 / ${overlayOpacity * 0.45}), rgb(255 255 255 / ${(overlayOpacity + 0.08) * 0.45})), url(${WALLPAPERS[resolvedTheme]})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        filter: `blur(${blurStrength}px) saturate(1.08)`,
        transform: "scale(1.08)",
        // The wallpaper is static, so promote it to its own compositor layer:
        // the blur is rasterized once instead of being re-filtered whenever
        // windows above it move, resize, or animate.
        willChange: "transform",
      }}
    />
  );
}
