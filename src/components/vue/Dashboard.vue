<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
    <!-- Toast Notification System -->
    <ToastContainer ref="toastRef" />

    <!-- Top Floating Navigation Bar -->
    <header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <!-- Brand Lockup -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">
          <img v-if="isImageLogo(branding.logo_icon)" :src="branding.logo_icon" alt="Logo" class="w-4 h-4 object-contain rounded-full" />
          <span v-else>{{ branding.logo_icon || '🌐' }}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-sm font-bold text-zinc-900 tracking-tight">{{ branding.app_name || 'Uptime CJR' }}</h1>
          <span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| {{ branding.app_tagline }}</span>
        </div>
      </div>

      <!-- Navigation Tabs (Pill Structure) -->
      <nav class="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-medium">
        <a href="/dashboard" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors">
          Monitors
        </a>
        <a href="/incidents" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1.5">
          Insiden 
          <span v-if="activeIncidentsCount > 0" class="px-1.5 py-px rounded-full text-[9px] font-bold bg-rose-500 text-white">{{ activeIncidentsCount }}</span>
        </a>
        <a href="/reports" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
          📈 Laporan SLA
        </a>
        <a href="/status/main" target="_blank" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
          Status Page ↗
        </a>
        <a href="/settings" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
          ⚙️ Pengaturan
        </a>
      </nav>

      <!-- Right Controls -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-mono tracking-wider" :class="isConnected ? 'text-emerald-700' : 'text-zinc-400'">
          <span class="w-1.5 h-1.5 rounded-full" :class="isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'"></span>
          <span>{{ isConnected ? 'LIVE' : 'OFF' }}</span>
        </div>

        <button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]" @click="openNewModal">
          <span>+</span> <span class="hidden sm:inline">Tambah Monitor</span>
        </button>

        <!-- User Profile & Logout -->
        <div v-if="props.currentUser" class="flex items-center gap-2 pl-2 border-l border-zinc-200 shrink-0">
          <div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs" :title="props.currentUser.email">
            {{ (props.currentUser.full_name || props.currentUser.email || 'A')[0].toUpperCase() }}
          </div>
          <button 
            @click="handleLogout"
            title="Keluar dari sesi"
            class="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-[11px] transition-colors border border-zinc-200 cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>

    <!-- Compact Stat Highlights (Double-Bezel Light) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="double-bezel">
        <div class="double-bezel-inner p-3.5 space-y-1">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status Sistem</div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="downCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'"></span>
            <span class="text-base font-bold tracking-tight" :class="downCount > 0 ? 'text-rose-600' : 'text-emerald-700'">
              {{ overallHealthText }}
            </span>
          </div>
          <div class="text-[10px] text-zinc-500 font-mono">{{ downCount }} monitor mengalami kendala</div>
        </div>
      </div>

      <div class="double-bezel">
        <div class="double-bezel-inner p-3.5 space-y-1">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Uptime 24h</div>
          <div class="text-base font-bold text-zinc-900 tracking-tight font-mono">{{ overallUptime }}%</div>
          <div class="text-[10px] text-zinc-500 font-mono">{{ monitors.length }} total target dipantau</div>
        </div>
      </div>

      <div class="double-bezel">
        <div class="double-bezel-inner p-3.5 space-y-1">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Respon Rata-rata</div>
          <div class="text-base font-bold text-zinc-900 tracking-tight font-mono">{{ avgLatency }} <span class="text-xs font-normal text-zinc-400">ms</span></div>
          <div class="text-[10px] text-zinc-500 font-mono">Latensi probe non-blocking</div>
        </div>
      </div>

      <div class="double-bezel">
        <div class="double-bezel-inner p-3.5 space-y-1">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Insiden Terbuka</div>
          <div class="text-base font-bold tracking-tight font-mono" :class="activeIncidentsCount > 0 ? 'text-rose-600' : 'text-zinc-900'">
            {{ activeIncidentsCount }}
          </div>
          <div class="text-[10px] text-zinc-500 font-mono">Peringatan aktif</div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs">
      <div class="relative w-full sm:w-64">
        <span class="absolute left-3 top-2 text-xs text-zinc-400">🔍</span>
        <input 
          v-model="searchQuery" 
          placeholder="Cari monitor, host..." 
          class="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all" 
        />
      </div>

      <div class="flex items-center gap-2 overflow-x-auto text-xs font-medium">
        <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button 
            class="px-2.5 py-1 rounded-lg transition-all text-[11px]" 
            :class="filterTab === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'" 
            @click="filterTab = 'all'"
          >
            Semua ({{ monitors.length }})
          </button>
          <button 
            class="px-2.5 py-1 rounded-lg transition-all text-[11px]" 
            :class="filterTab === 'up' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'" 
            @click="filterTab = 'up'"
          >
            Up ({{ upCount }})
          </button>
          <button 
            class="px-2.5 py-1 rounded-lg transition-all text-[11px]" 
            :class="filterTab === 'down' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'" 
            @click="filterTab = 'down'"
          >
            Down ({{ downCount }})
          </button>
          <button 
            class="px-2.5 py-1 rounded-lg transition-all text-[11px]" 
            :class="filterTab === 'paused' ? 'bg-white text-zinc-800 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'" 
            @click="filterTab = 'paused'"
          >
            Jeda ({{ pausedCount }})
          </button>
        </div>

        <!-- Tag Filters -->
        <div v-if="allTags.length > 0" class="flex items-center gap-1 pl-2 border-l border-zinc-200">
          <button 
            class="px-2 py-1 rounded-lg text-[10px] transition-colors" 
            :class="filterTag === '' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'" 
            @click="filterTag = ''"
          >
            Semua
          </button>
          <button 
            v-for="t in allTags" 
            :key="t" 
            class="px-2 py-1 rounded-lg text-[10px] transition-colors border" 
            :class="filterTag === t ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'"
            @click="filterTag = t"
          >
            #{{ t }}
          </button>
        </div>
      </div>
    </div>

    <!-- Monitors List Container -->
    <div class="space-y-2">
      <div v-if="loading && monitors.length === 0" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
        <div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-zinc-400 font-mono">Memuat telemetri...</p>
      </div>

      <div v-else-if="filteredMonitors.length === 0" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-2">
        <p class="text-xs font-bold text-zinc-900">Tidak ada monitor ditemukan</p>
        <p class="text-[11px] text-zinc-500">Sesuaikan filter atau tambah monitor baru.</p>
        <button class="mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer" @click="openNewModal">
          + Tambah Monitor
        </button>
      </div>

      <div v-else class="double-bezel">
        <div class="double-bezel-inner divide-y divide-zinc-100 overflow-hidden">
          <div 
            v-for="m in filteredMonitors" 
            :key="m.id" 
            class="p-3.5 sm:p-4 transition-colors duration-150 hover:bg-zinc-50/60" 
            :class="m.current_status === 'down' ? 'bg-rose-50/30' : ''"
          >
            <!-- Main Row -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <!-- Left: Identity & Target -->
              <div class="flex items-center gap-3 min-w-[240px] flex-1">
                <span 
                  class="w-2.5 h-2.5 rounded-full shrink-0" 
                  :class="m.current_status === 'up' ? 'bg-emerald-500' : (m.current_status === 'down' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-300')"
                ></span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h3 class="text-xs sm:text-sm font-bold text-zinc-900 truncate">{{ m.name }}</h3>
                    <span class="px-1.5 py-px rounded text-[8px] font-mono font-semibold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {{ m.type === 'dns' ? `DNS:${m.dns_record_type || 'A'}` : m.type.toUpperCase() }}
                    </span>
                    <span v-if="m.ssl_check_enabled" class="px-1.5 py-px rounded text-[8px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SSL
                    </span>
                    <span v-if="m.is_under_maintenance" class="px-1.5 py-px rounded text-[8px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      🔧 Maintenance
                    </span>
                  </div>
                  <div class="text-[11px] text-zinc-500 font-mono truncate max-w-sm mt-0.5">
                    {{ m.target }}{{ m.port ? ':' + m.port : '' }}
                  </div>
                </div>
              </div>

              <!-- Center: Heartbeat Pill Bars -->
              <div class="w-full lg:w-56 shrink-0">
                <div class="flex justify-between text-[10px] mb-1 font-mono">
                  <span class="text-zinc-400">Histori Cek</span>
                  <span class="font-semibold" :class="m.uptime_24h > 99 ? 'text-emerald-700' : 'text-amber-700'">
                    {{ m.uptime_24h }}%
                  </span>
                </div>
                <div class="flex items-center gap-[2px] h-4">
                  <div 
                    v-for="(check, idx) in m.recent_checks" 
                    :key="idx" 
                    class="flex-1 rounded-full h-full transition-opacity hover:opacity-70 cursor-pointer"
                    :class="check.status === 'up' ? 'bg-emerald-500' : 'bg-rose-500'"
                    :title="`${check.checked_at}: ${check.status.toUpperCase()} (${check.response_time_ms}ms)`"
                  ></div>
                  <!-- Empty placeholder bars -->
                  <div 
                    v-for="n in Math.max(0, 30 - (m.recent_checks ? m.recent_checks.length : 0))" 
                    :key="'empty-' + n" 
                    class="flex-1 rounded-full h-2/3 bg-zinc-200/60"
                  ></div>
                </div>
              </div>

              <!-- Right: Latency & Actions -->
              <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t border-zinc-100 lg:border-t-0">
                <div class="text-right">
                  <div class="text-xs font-mono font-bold text-zinc-900">{{ m.avg_latency_24h || '--' }} <span class="text-[9px] font-normal text-zinc-400">ms</span></div>
                  <div class="text-[9px] text-zinc-400 font-mono uppercase">latensi</div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1">
                  <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" title="Cek Sekarang" @click="runCheckNow(m)">
                    ⚡
                  </button>
                  <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" :title="m.current_status === 'paused' ? 'Lanjutkan' : 'Jeda'" @click="togglePause(m)">
                    {{ m.current_status === 'paused' ? '▶' : '⏸' }}
                  </button>
                  <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" @click="toggleDetails(m.id)">
                    {{ expandedId === m.id ? '▲' : '▼' }}
                  </button>
                  <button class="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" @click="editMonitor(m)">
                    Edit
                  </button>
                  <button class="px-2 py-1 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer" @click="deleteMonitor(m)">
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <!-- Push Token Banner if Push Heartbeat -->
            <div v-if="m.type === 'push'" class="flex items-center gap-2 p-2 mt-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
              <span class="font-semibold text-zinc-600 text-[11px]">PUSH URL:</span>
              <code class="flex-1 font-mono text-zinc-700 text-[11px] truncate">{{ currentOrigin }}/api/push/{{ m.push_token_raw || '••••••••' }}</code>
              <button class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200 cursor-pointer shadow-xs" @click="copyPushUrl(m)">Salin</button>
              <button class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200 cursor-pointer shadow-xs" @click="regeneratePushToken(m)">Rotasi</button>
            </div>

            <!-- Expanded Details Panel -->
            <div v-if="expandedId === m.id" class="mt-3 pt-3 border-t border-zinc-100 space-y-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <h4 class="font-bold text-zinc-900 text-[11px]">⚙️ Konfigurasi Pengecekan</h4>
                  <p class="text-zinc-600 text-[11px]">Interval: <strong class="text-zinc-900">{{ m.interval_seconds }}s</strong> | Toleransi Down: <strong class="text-zinc-900">{{ m.retries_before_down }}x</strong></p>
                  <p class="text-zinc-600 text-[11px]">Terakhir Dicek: <strong class="text-zinc-900">{{ m.last_checked_at ? new Date(m.last_checked_at).toLocaleString('id-ID') : '-' }}</strong></p>
                  <p v-if="m.type === 'dns'" class="text-zinc-600 text-[11px]">Expected Value: <strong class="text-zinc-900">{{ m.dns_expected_value || '-' }}</strong></p>
                </div>

                <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <h4 class="font-bold text-zinc-900 text-[11px]">🔒 Keamanan &amp; Maintenance</h4>
                  <p class="text-zinc-600 text-[11px]">Inspeksi SSL: <strong class="text-zinc-900">{{ m.ssl_check_enabled ? 'Aktif' : 'Non-aktif' }}</strong> ({{ m.ssl_days_remaining !== null && m.ssl_days_remaining !== undefined ? `${m.ssl_days_remaining} hari lagi` : '-' }})</p>
                  <p class="text-zinc-600 text-[11px]">Jadwal Pemeliharaan: <strong :class="m.is_under_maintenance ? 'text-amber-700 font-bold' : 'text-zinc-900'">{{ m.is_under_maintenance ? 'Aktif (Alarm Dinonaktifkan)' : 'Normal' }}</strong></p>
                </div>
              </div>

              <!-- Export Bar -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div>
                  <h4 class="text-[11px] font-bold text-zinc-900">📥 Ekspor Data Histori &amp; SLA</h4>
                  <p class="text-[10px] text-zinc-500">Unduh log pemeriksaan untuk laporan ketersediaan.</p>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <a :href="`/api/v1/monitors/${m.id}/export?format=csv&range=24h`" class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>CSV 24h</a>
                  <a :href="`/api/v1/monitors/${m.id}/export?format=csv&range=7d`" class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>CSV 7d</a>
                  <a :href="`/api/v1/monitors/${m.id}/export?format=csv&range=30d`" class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>CSV 30d</a>
                  <a :href="`/api/v1/monitors/${m.id}/export?format=json&range=30d`" class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>JSON</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <MonitorModal 
      :isOpen="isModalOpen" 
      :monitorData="selectedMonitor" 
      @close="isModalOpen = false" 
      @saved="fetchMonitors" 
    />

    <!-- Custom In-App Confirm Modal -->
    <ConfirmModal 
      :isOpen="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirmText="confirmModal.confirmText"
      :isDanger="confirmModal.isDanger"
      :isLoading="confirmModal.isLoading"
      @confirm="handleModalConfirm"
      @close="confirmModal.isOpen = false"
    />

    </div>
    <!-- Footer Flat Bottom -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>{{ branding.footer_text || 'Powered by SentinelUp — Observability Platform' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import MonitorModal from './MonitorModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import ToastContainer from './ToastContainer.vue';
import { setToastRef, useToast } from './useToast.js';

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
  }
});

const toastRef = ref(null);
const { toast } = useToast();

async function handleLogout() {
  try {
    await fetch('/api/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
  } catch {}
  window.location.href = '/login';
}

const branding = ref({
  app_name: 'Uptime CJR',
  app_tagline: 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur',
  footer_text: '© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur',
  logo_icon: '🌐'
});

const monitors = ref([]);
const loading = ref(true);
const isConnected = ref(false);
const searchQuery = ref('');
const filterTab = ref('all');
const filterTag = ref('');
const isModalOpen = ref(false);
const selectedMonitor = ref(null);
const expandedId = ref(null);
const activeIncidentsCount = ref(0);

const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const allTags = computed(() => {
  const set = new Set();
  for (const m of monitors.value) {
    if (Array.isArray(m.tags)) {
      for (const t of m.tags) set.add(t);
    }
  }
  return Array.from(set);
});

const upCount = computed(() => monitors.value.filter(m => m.current_status === 'up').length);
const downCount = computed(() => monitors.value.filter(m => m.current_status === 'down').length);
const pausedCount = computed(() => monitors.value.filter(m => m.current_status === 'paused').length);

const overallHealthText = computed(() => {
  if (monitors.value.length === 0) return 'Siap';
  if (downCount.value > 0) return `${downCount.value} Down`;
  return 'Normal';
});

const overallUptime = computed(() => {
  if (monitors.value.length === 0) return 100;
  const sum = monitors.value.reduce((acc, m) => acc + (m.uptime_24h || 100), 0);
  return (sum / monitors.value.length).toFixed(2);
});

const avgLatency = computed(() => {
  const valid = monitors.value.filter(m => m.avg_latency_24h > 0);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, m) => acc + m.avg_latency_24h, 0);
  return Math.round(sum / valid.length);
});

const filteredMonitors = computed(() => {
  return monitors.value.filter(m => {
    // Tab filter
    if (filterTab.value === 'up' && m.current_status !== 'up') return false;
    if (filterTab.value === 'down' && m.current_status !== 'down') return false;
    if (filterTab.value === 'paused' && m.current_status !== 'paused') return false;

    // Tag filter
    if (filterTag.value !== '') {
      if (!Array.isArray(m.tags) || !m.tags.includes(filterTag.value)) return false;
    }

    // Search query
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.target.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        (Array.isArray(m.tags) && m.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });
});

async function fetchMonitors() {
  try {
    const res = await fetch('/api/v1/monitors');
    if (res.ok) {
      monitors.value = await res.json();
      activeIncidentsCount.value = monitors.value.reduce((acc, m) => acc + (m.active_incidents_count || 0), 0);
    }
  } catch (err) {
    console.error('Fetch monitors error:', err);
  } finally {
    loading.value = false;
  }
}

function openNewModal() {
  selectedMonitor.value = null;
  isModalOpen.value = true;
}

function editMonitor(monitor) {
  selectedMonitor.value = monitor;
  isModalOpen.value = true;
}

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

async function runCheckNow(monitor) {
  try {
    await fetch(`/api/v1/monitors/${monitor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run_check_now: true })
    });
  } catch (err) {
    console.error('Run check error:', err);
  }
}

async function togglePause(monitor) {
  const newStatus = monitor.current_status === 'paused' ? 'pending' : 'paused';
  try {
    await fetch(`/api/v1/monitors/${monitor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_status: newStatus })
    });
    fetchMonitors();
  } catch (err) {
    console.error('Toggle pause error:', err);
  }
}

// Custom Confirm Dialog state
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Ya, Hapus',
  isDanger: true,
  isLoading: false,
  action: null
});

function openConfirmDialog({ title, message, confirmText = 'Ya, Hapus', isDanger = true, action }) {
  confirmModal.value = {
    isOpen: true,
    title,
    message,
    confirmText,
    isDanger,
    isLoading: false,
    action
  };
}

async function handleModalConfirm() {
  if (confirmModal.value.action) {
    confirmModal.value.isLoading = true;
    try {
      await confirmModal.value.action();
      confirmModal.value.isOpen = false;
    } catch (err) {
      console.error('Modal confirm action error:', err);
    } finally {
      confirmModal.value.isLoading = false;
    }
  }
}

function deleteMonitor(monitor) {
  openConfirmDialog({
    title: 'Hapus Monitor',
    message: `Apakah Anda yakin ingin menghapus monitor "${monitor.name}" (${monitor.target})? Seluruh riwayat pengecekan dan data SLA akan dihapus secara permanen.`,
    confirmText: 'Ya, Hapus Monitor',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/monitors/${monitor.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchMonitors();
          toast.success(`Monitor "${monitor.name}" telah dihapus secara permanen.`, 'Monitor Dihapus');
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus monitor' }));
          toast.error(err.error || 'Gagal menghapus monitor', 'Kesalahan Sistem');
        }
      } catch (err) {
        console.error('Delete monitor error:', err);
        toast.error('Gagal menghubungi server saat menghapus monitor.', 'Kesalahan Jaringan');
      }
    }
  });
}

function copyPushUrl(monitor) {
  const url = `${window.location.origin}/api/push/${monitor.push_token_raw}`;
  navigator.clipboard.writeText(url);
  toast.success('Push URL berhasil disalin ke papan klip.', 'URL Tersalin');
}

function regeneratePushToken(monitor) {
  openConfirmDialog({
    title: 'Rotasi URL Push Token',
    message: 'Regenerasi push token akan menonaktifkan URL push lama secara instan. Script cron job yang menggunakan URL lama akan berhenti berfungsi sampai URL diperbarui. Lanjutkan?',
    confirmText: 'Ya, Rotasi Token',
    isDanger: false,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/monitors/${monitor.id}/regenerate-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          monitor.push_token_raw = data.push_token_raw || data.rawToken;
          toast.success('Token push baru berhasil di-generate dan siap digunakan.', 'Rotasi Token Berhasil');
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal merotasi token' }));
          toast.error(err.error || 'Gagal merotasi token', 'Gagal');
        }
      } catch (err) {
        console.error('Regenerate token error:', err);
        toast.error('Gagal menghubungi server.', 'Kesalahan Jaringan');
      }
    }
  });
}

// Real-time WebSocket connection
let ws = null;
let reconnectTimer = null;

function connectWebSocket() {
  if (typeof window === 'undefined') return;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    isConnected.value = true;
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'check_completed') {
        const idx = monitors.value.findIndex(m => m.id === msg.data.monitorId);
        if (idx !== -1) {
          const m = monitors.value[idx];
          m.avg_latency_24h = msg.data.responseTimeMs;
          if (!m.recent_checks) m.recent_checks = [];
          m.recent_checks.push({
            status: msg.data.status,
            response_time_ms: msg.data.responseTimeMs,
            checked_at: msg.data.checkedAt
          });
          if (m.recent_checks.length > 30) m.recent_checks.shift();
        }
      } else if (msg.type === 'status_changed') {
        const idx = monitors.value.findIndex(m => m.id === msg.data.monitorId);
        if (idx !== -1) {
          const monitorName = monitors.value[idx].name;
          const prev = monitors.value[idx].current_status;
          monitors.value[idx].current_status = msg.data.newStatus;
          if (msg.data.newStatus === 'down' && prev !== 'down') {
            toast.error(`"${monitorName}" tidak dapat dijangkau. Pengecekan sedang diulang.`, 'Layanan Down');
          } else if (msg.data.newStatus === 'up' && prev === 'down') {
            toast.success(`"${monitorName}" kembali beroperasi normal.`, 'Layanan Pulih');
          }
        }
      } else if (msg.type === 'branding_updated') {
        branding.value = msg.data;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('branding_updated', { detail: msg.data }));
          document.title = `${msg.data.app_name} — Dashboard & Live Monitors`;
        }
      }
    } catch (err) {
      console.error('WS parse error:', err);
    }
  };

  ws.onclose = () => {
    isConnected.value = false;
    reconnectTimer = setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = () => {
    isConnected.value = false;
  };
}

function isImageLogo(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) branding.value = await res.json();
  } catch (err) {
    console.error('Fetch branding error:', err);
  }
}

onMounted(() => {
  setToastRef(toastRef);
  fetchBranding();
  fetchMonitors();
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) ws.close();
  if (reconnectTimer) clearTimeout(reconnectTimer);
});
</script>
