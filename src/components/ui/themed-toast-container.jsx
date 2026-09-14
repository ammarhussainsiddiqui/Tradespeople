"use client";

import { ToastContainer } from "react-toastify";
import { useTheme } from "../../app/providers/ThemeProvider";

/**
 * react-toastify paints its own surfaces, so it needs to be told the theme
 * explicitly rather than inheriting our CSS variables.
 */
export default function ThemedToastContainer(props) {
  const { theme, mounted } = useTheme();
  const resolved =
    !mounted || theme === "system"
      ? (typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light"
      : theme;

  return <ToastContainer theme={resolved} {...props} />;
}
