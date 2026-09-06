import { ref, computed, watch } from 'vue';
import { id } from './translations/id';
import { en } from './translations/en';

type Lang = 'id' | 'en';
type Dict = typeof id;

const dictionaries: Record<Lang, Dict> = {
  id: id as Dict,
  en: en as unknown as Dict,
};

// initialize from localStorage / browser lang fallback
function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'id';
  const saved = localStorage.getItem('app_lang') as Lang | null;
  if (saved === 'id' || saved === 'en') return saved;
  // fallback to navigator.language
  const nav = navigator.language?.toLowerCase() || 'id';
  return nav.startsWith('en') ? 'en' : 'id';
}

const locale = ref<Lang>(getInitialLang());

// sync html lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value;
  watch(locale, (v) => {
    document.documentElement.lang = v;
    localStorage.setItem('app_lang', v);
    // notify other components via storage + custom event
    window.dispatchEvent(new CustomEvent('app:locale-changed', { detail: v }));
  });
  // listen cross-tab storage
  window.addEventListener('storage', (e) => {
    if (e.key === 'app_lang' && (e.newValue === 'id' || e.newValue === 'en')) {
      locale.value = e.newValue as Lang;
    }
  });
  window.addEventListener('app:locale-changed', (e: Event) => {
    const d = (e as CustomEvent).detail as Lang;
    if (d && d !== locale.value && (d === 'id' || d === 'en')) locale.value = d;
  });
}

function getNested(obj: any, path: string): any {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function interpolate(str: string, params?: Record<string, any>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function useI18n() {
  const t = (key: string, params?: Record<string, any>): string => {
    const dict = dictionaries[locale.value] || dictionaries.id;
    const raw = getNested(dict, key);
    if (typeof raw !== 'string') {
      // fallback to id dict
      const fb = getNested(dictionaries.id, key);
      if (typeof fb === 'string') return interpolate(fb, params);
      return key;
    }
    return interpolate(raw, params);
  };

  const setLocale = (lang: Lang) => {
    if (lang !== 'id' && lang !== 'en') return;
    locale.value = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', lang);
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('app:locale-changed', { detail: lang }));
    }
  };

  const currentLocale = computed(() => locale.value);

  return { t, locale: currentLocale, setLocale, localeRef: locale };
}

// singleton helpers for non-setup contexts
export function getLocale(): Lang {
  return locale.value;
}
export function setLocaleGlobal(lang: Lang) {
  if (lang !== 'id' && lang !== 'en') return;
  locale.value = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_lang', lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('app:locale-changed', { detail: lang }));
  }
}
export const availableLocales: { code: Lang; label: string }[] = [
  { code: 'id', label: 'ID' },
  { code: 'en', label: 'EN' },
];
