// Shared between the server layout (which injects the boot script) and the
// client ThemeProvider. Deliberately NOT a "use client" module: importing from
// one into a server component would turn these values into client references.
export const THEME_STORAGE_KEY = "tp-theme";

// Runs before first paint so the correct palette is on screen immediately,
// with no flash of the light theme for dark-mode users.
export const THEME_BOOT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var isDark = stored === 'dark' ||
      ((!stored || stored === 'system') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
})();
`;
