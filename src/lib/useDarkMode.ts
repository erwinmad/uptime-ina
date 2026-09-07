import { ref, watch } from 'vue';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'detak_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const isDark = ref<boolean>(false);
let initialized = false;

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export function useDarkMode() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true;
    const initial = getInitialTheme();
    isDark.value = initial === 'dark';
    applyTheme(initial);

    // sync across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        isDark.value = e.newValue === 'dark';
      }
    });
    // listen system changes if no manual override yet? we keep manual
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        isDark.value = e.matches;
      }
    });

    watch(isDark, (v) => {
      const theme: Theme = v ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme);
      window.dispatchEvent(new CustomEvent('detak:theme-changed', { detail: theme }));
    });

    // allow external sync via custom event
    window.addEventListener('detak:theme-changed', (e: Event) => {
      const t = (e as CustomEvent).detail as Theme;
      if ((t === 'dark' || t === 'light') && (t === 'dark') !== isDark.value) {
        isDark.value = t === 'dark';
      }
    });
  }

  const toggle = () => { isDark.value = !isDark.value; };
  const setTheme = (theme: Theme) => { isDark.value = theme === 'dark'; };

  return { isDark, toggle, setTheme };
}

// For BaseLayout inline script — safe to call before Vue
export function initDarkModeSync() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme: Theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}
