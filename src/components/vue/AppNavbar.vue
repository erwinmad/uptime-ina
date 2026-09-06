<template>
  <header class="flex items-center justify-between gap-4 p-3 sm:px-5 sm:py-3.5 bg-white ring-1 ring-zinc-200/80 rounded-[1.25rem] shadow-sm print:hidden">
    <!-- Brand Lockup -->
    <a href="/dashboard" class="flex items-center gap-3.5 group transition-opacity hover:opacity-90 shrink-0 min-w-0 max-w-[280px]">
      <div class="w-10 h-10 rounded-full bg-zinc-100 ring-1 ring-zinc-200/80 flex items-center justify-center text-lg shrink-0 shadow-2xs">
        <img v-if="isImageLogo(branding.logo_icon)" :src="branding.logo_icon" alt="Logo" class="w-5 h-5 object-contain rounded-full" />
        <span v-else class="text-base">{{ branding.logo_icon || '🌐' }}</span>
      </div>
      <div class="flex flex-col min-w-0">
        <h1 class="text-sm font-bold text-zinc-900 tracking-tight leading-tight line-clamp-2 break-words">{{ branding.app_name || 'Uptime CJR' }}</h1>
        <span class="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5 line-clamp-1 break-words">{{ subtitle || branding.app_tagline }}</span>
      </div>
    </a>

    <!-- Navigation Tabs (Pill Structure) -->
    <nav class="hidden lg:flex items-center gap-1 p-1.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-[13px] font-medium shadow-2xs">
      <a 
        href="/dashboard" 
        class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        :class="currentActiveTab === 'dashboard' 
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'"
      >
        <Activity class="w-3.5 h-3.5" :class="currentActiveTab === 'dashboard' ? 'text-zinc-900' : 'text-zinc-500'" />
        <span>Monitors</span>
      </a>

      <a 
        href="/incidents" 
        class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        :class="currentActiveTab === 'incidents' 
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'"
      >
        <AlertTriangle class="w-3.5 h-3.5" :class="currentActiveTab === 'incidents' ? 'text-zinc-900' : 'text-zinc-500'" />
        <span>{{ t('nav.incidents') }}</span>
        <span v-if="incidentsCount > 0" class="px-1.5 py-px rounded-full text-[9px] font-bold bg-rose-500 text-white animate-pulse">
          {{ incidentsCount }}
        </span>
      </a>

      <a 
        href="/reports" 
        class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        :class="currentActiveTab === 'reports' 
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'"
      >
        <BarChart3 class="w-3.5 h-3.5" :class="currentActiveTab === 'reports' ? 'text-zinc-900' : 'text-zinc-500'" />
        <span>{{ t('nav.sla') }}</span>
      </a>

      <a 
        href="/status-pages" 
        class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        :class="currentActiveTab === 'status-pages' 
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'"
      >
        <Globe class="w-3.5 h-3.5" :class="currentActiveTab === 'status-pages' ? 'text-zinc-900' : 'text-zinc-500'" />
        <span>{{ t('nav.statusPages') }}</span>
      </a>

      <a 
        href="/audit" 
        class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        :class="currentActiveTab === 'audit' 
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'"
      >
        <ScrollText class="w-3.5 h-3.5" :class="currentActiveTab === 'audit' ? 'text-zinc-900' : 'text-zinc-500'" />
        <span>{{ t('nav.audit') }}</span>
      </a>

      <a 
        href="/settings" 
        class="px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        :class="currentActiveTab === 'settings' 
          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' 
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'"
      >
        <Settings class="w-3.5 h-3.5" :class="currentActiveTab === 'settings' ? 'text-zinc-900' : 'text-zinc-500'" />
        <span>{{ t('nav.settings') }}</span>
      </a>
    </nav>

     <!-- Right Controls -->
    <div class="flex items-center gap-3 shrink-0">
      <!-- Live Indicator if enabled/provided -->
      <div v-if="showLiveBadge" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold font-mono tracking-widest uppercase">
        <span class="w-1.5 h-1.5 rounded-full" :class="isLive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'"></span>
        <span>{{ isLive ? t('common.live') : t('common.off') }}</span>
      </div>

      <!-- Language Switcher -->
      <LanguageSwitcher />

      <!-- Custom Actions Slot -->
      <slot name="actions" />

      <!-- User Profile & Logout -->
      <div v-if="user" class="flex items-center gap-3 pl-3 ml-1 border-l border-zinc-200 shrink-0">
        <div 
          class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs shadow-2xs" 
          :title="user.email"
        >
          {{ (user.full_name || user.email || 'A')[0].toUpperCase() }}
        </div>
        <button 
          @click="logout"
          :title="t('nav.logoutTitle')"
          class="px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-zinc-500 text-xs font-semibold transition-all border border-zinc-200 cursor-pointer"
        >
          {{ t('nav.logout') }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Activity, AlertTriangle, BarChart3, Globe, Settings, ScrollText } from 'lucide-vue-next';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { useI18n } from '../../lib/i18n';
const { t } = useI18n();

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
  },
  activeTab: {
    type: String,
    default: ''
  },
  activeIncidentsCount: {
    type: Number,
    default: 0
  },
  isConnected: {
    type: Boolean,
    default: undefined
  },
  subtitle: {
    type: String,
    default: ''
  }
});

const user = computed(() => props.currentUser);
const incidentsCount = computed(() => props.activeIncidentsCount);
const showLiveBadge = computed(() => props.isConnected !== undefined);
const isLive = computed(() => Boolean(props.isConnected));

const currentActiveTab = computed(() => {
  if (props.activeTab) return props.activeTab;
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname;
  if (path.startsWith('/incidents')) return 'incidents';
  if (path.startsWith('/reports')) return 'reports';
  if (path.startsWith('/status-pages')) return 'status-pages';
  if (path.startsWith('/audit')) return 'audit';
  if (path.startsWith('/settings')) return 'settings';
  return 'dashboard';
});

const branding = ref({
  app_name: 'Uptime CJR',
  app_tagline: 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur',
  logo_icon: '🌐'
});

function isImageLogo(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) {
      branding.value = await res.json();
    }
  } catch {}
}

async function logout() {
  try {
    await fetch('/api/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
  } catch {}
  window.location.href = '/login';
}

onMounted(() => {
  fetchBranding();
  if (typeof window !== 'undefined') {
    window.addEventListener('branding_updated', (e) => {
      if (e.detail) branding.value = { ...branding.value, ...e.detail };
    });
  }
});
</script>
