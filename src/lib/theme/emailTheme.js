// Email clients (Outlook, Gmail) do not support CSS custom properties, so these
// must stay as literal hex. They mirror VS Code's Light+ theme as used by the
// portal (see globals.css) — keep them in sync by hand when the palette changes.
//
// Emails use a light shell. Every role below was checked against the pairing
// the templates actually render it in (WCAG AA):
//   accent      #006AB1  VS Code link blue: header band behind white text (5.7:1),
//                        headings/links on the white panel (5.6:1) and grey shell (5.1:1)
//   success     #16825D  payment button behind white text (4.8:1)
//   text        #333333  body copy on the white panel (12.6:1)
//   mutedText   #6E6E6E  footer copy on the #F3F3F3 shell (4.6:1)
export const EMAIL_THEME = Object.freeze({
  shellBg: "#F3F3F3",
  panelBg: "#FFFFFF",
  accent: "#006AB1",
  accentText: "#FFFFFF",
  success: "#16825D",
  text: "#333333",
  mutedText: "#6E6E6E",
  surface: "#F3F3F3",
  surfaceText: "#333333",
  border: "#D4D4D4",
  glow: "rgba(0, 106, 177, 0.2)",
});
