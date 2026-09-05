<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col justify-between selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
      <!-- Top Floating Navigation Bar -->
      <header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] print:hidden">
        <!-- Brand Lockup -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">
            <img v-if="isImageLogo(branding.logo_icon)" :src="branding.logo_icon" alt="Logo" class="w-4 h-4 object-contain rounded-full" />
            <span v-else>{{ branding.logo_icon || '🌐' }}</span>
          </div>
          <div class="flex items-baseline gap-2">
            <h1 class="text-sm font-bold text-zinc-900 tracking-tight">{{ branding.app_name || 'Uptime CJR' }}</h1>
            <span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| Laporan SLA &amp; Observability</span>
          </div>
        </div>

        <!-- Navigation Tabs (Pill Structure) -->
        <nav class="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-medium">
          <a href="/dashboard" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
            Monitors
          </a>
          <a href="/incidents" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
            Insiden 
          </a>
          <a href="/reports" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors font-semibold">
            📈 Laporan SLA
          </a>
          <a href="/status/main" target="_blank" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
            Status Page ↗
          </a>
          <a href="/settings" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
            ⚙️ Pengaturan
          </a>
        </nav>

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
      </header>

      <!-- Title & Executive Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs">
        <div class="px-1">
          <h2 class="text-sm font-bold text-zinc-900 tracking-tight">Laporan Kepatuhan SLA &amp; Error Budget</h2>
          <p class="text-[11px] text-zinc-500 mt-0.5">Analisis ketersediaan layanan, waktu henti (downtime), dan batas toleransi SLA.</p>
        </div>

        <!-- Controls: Timeframe, Target SLA, Export -->
        <div class="flex flex-wrap items-center gap-2 print:hidden">
          <!-- Range Switcher -->
          <div class="flex items-center p-1 bg-zinc-100 rounded-xl text-xs font-medium">
            <button 
              v-for="r in [
                { label: '24 Jam', val: '24h' },
                { label: '7 Hari', val: '7d' },
                { label: '30 Hari', val: '30d' },
                { label: '90 Hari', val: '90d' },
                { label: 'Bulan Ini', val: 'this_month' }
              ]" 
              :key="r.val"
              @click="selectedRange = r.val; fetchReport();"
              class="px-2.5 py-1 rounded-lg text-[11px] transition-all"
              :class="selectedRange === r.val ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50 font-semibold' : 'text-zinc-500 hover:text-zinc-900'"
            >
              {{ r.label }}
            </button>
          </div>

          <!-- Target SLA Dropdown -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
            <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Target:</span>
            <select 
              v-model="targetSla" 
              @change="fetchReport"
              class="bg-transparent text-xs text-zinc-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="99.0" class="bg-white">99.0%</option>
              <option value="99.5" class="bg-white">99.5%</option>
              <option value="99.9" class="bg-white">99.9% (Standard)</option>
              <option value="99.99" class="bg-white">99.99% (High)</option>
            </select>
          </div>

          <!-- Print & Export Buttons -->
          <div class="flex items-center gap-1.5">
            <button 
              @click="printReport"
              class="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              🖨️ Cetak PDF
            </button>
            <button 
              @click="exportCsv"
              class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              📥 Ekspor CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Executive Stat Strip (4 Cards) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Card 1: Tingkat Kepatuhan SLA -->
        <div class="double-bezel">
          <div class="double-bezel-inner p-4 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Kepatuhan SLA</span>
              <span class="text-zinc-900 font-semibold">Target {{ targetSla }}%</span>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono tracking-tight" :class="overallSlaPercentage >= Number(targetSla) ? 'text-emerald-600' : 'text-amber-600'">
              {{ overallSlaPercentage }}%
            </div>
            <div class="text-[10px] text-zinc-400">Rata-rata global seluruh layanan</div>
          </div>
        </div>

        <!-- Card 2: Total Downtime -->
        <div class="double-bezel">
          <div class="double-bezel-inner p-4 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Total Waktu Henti</span>
              <span>📉</span>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono tracking-tight" :class="totalDowntimeMinutes > 0 ? 'text-rose-600' : 'text-emerald-600'">
              {{ totalDowntimeMinutes }} <span class="text-sm font-normal text-zinc-400">mnt</span>
            </div>
            <div class="text-[10px] text-zinc-400">Total akumulasi periode henti</div>
          </div>
        </div>

        <!-- Card 3: Error Budget Remaining -->
        <div class="double-bezel">
          <div class="double-bezel-inner p-4 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Error Budget Sisa</span>
              <span>⏱️</span>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono tracking-tight" :class="errorBudgetRemainingMin >= 0 ? 'text-zinc-900' : 'text-rose-600'">
              {{ Math.max(0, errorBudgetRemainingMin) }} <span class="text-sm font-normal text-zinc-400">mnt</span>
            </div>
            <div class="text-[10px]" :class="errorBudgetRemainingMin >= 0 ? 'text-zinc-400' : 'text-rose-500 font-medium'">
              {{ errorBudgetRemainingMin >= 0 ? `Dari batas ${totalAllowedDowntimeMin} mnt` : `Melebihi batas ${Math.abs(errorBudgetRemainingMin)} mnt` }}
            </div>
          </div>
        </div>

        <!-- Card 4: Total Insiden -->
        <div class="double-bezel">
          <div class="double-bezel-inner p-4 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Total Insiden / Outage</span>
              <span>🚨</span>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono tracking-tight" :class="totalIncidents > 0 ? 'text-zinc-900' : 'text-emerald-600'">
              {{ totalIncidents }}
            </div>
            <div class="text-[10px] text-zinc-400">Kejadian henti tercatat</div>
          </div>
        </div>
      </div>

          <!-- Detailed Breakdown Table -->
          <div class="double-bezel">
            <div class="double-bezel-inner p-1 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-zinc-100 bg-zinc-50/50">
                      <th class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 w-1/3">Nama Monitor</th>
                      <th class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">SLA Ketersediaan</th>
                      <th class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Total Downtime</th>
                      <th class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Jml. Insiden</th>
                      <th class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">Error Budget Terpakai</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100 bg-white">
                    <tr v-if="isLoading">
                      <td colspan="5" class="px-4 py-10 text-center">
                        <div class="flex flex-col items-center gap-2 text-zinc-400">
                          <div class="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                          <span class="text-xs font-mono">Mengkalkulasi Laporan SLA...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="monitorsList.length === 0">
                      <td colspan="5" class="px-4 py-10 text-center text-xs text-zinc-400 font-mono">
                        Tidak ada data monitor untuk periode ini.
                      </td>
                    </tr>
                    <tr v-else v-for="m in monitorsList" :key="m.id" class="hover:bg-zinc-50/50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="text-xs font-bold text-zinc-900 truncate">{{ m.name }}</div>
                        <div class="text-[10px] text-zinc-500 mt-0.5 font-mono">{{ m.type.toUpperCase() }} · {{ m.target }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold" :class="m.uptime_percentage >= Number(targetSla) ? 'text-emerald-600' : 'text-rose-600'">
                            {{ m.uptime_percentage }}%
                          </span>
                          <span v-if="m.uptime_percentage < Number(targetSla)" class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200">Melanggar</span>
                          <span v-else class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">Memenuhi</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <span class="text-xs font-mono" :class="m.downtime_minutes > 0 ? 'text-rose-600 font-semibold' : 'text-zinc-500'">
                          {{ m.downtime_minutes }} mnt
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <span class="text-xs font-mono text-zinc-900">
                          {{ m.incident_count }}x
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="w-full max-w-[120px] bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                          <div class="h-full rounded-full transition-all" 
                            :class="budgetPercentage(m.downtime_minutes) >= 100 ? 'bg-rose-500' : (budgetPercentage(m.downtime_minutes) > 75 ? 'bg-amber-500' : 'bg-emerald-500')"
                            :style="{ width: `${Math.min(100, budgetPercentage(m.downtime_minutes))}%` }"
                          ></div>
                        </div>
                        <div class="text-[9px] font-mono mt-1" :class="budgetPercentage(m.downtime_minutes) >= 100 ? 'text-rose-600 font-medium' : 'text-zinc-400'">
                          {{ budgetPercentage(m.downtime_minutes) }}% dari {{ totalAllowedDowntimeMin }}m
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    </div>

    <!-- Footnote for printing and structural bottom -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 print:block mt-auto">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>Dicetak secara sistem: {{ generatedDateStr }}</p>
        <p>{{ branding.footer_text || 'Powered by SentinelUp — Observability Platform' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
  }
});

const branding = ref({
  app_name: 'Uptime CJR',
  app_tagline: 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur',
  footer_text: '© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur',
  logo_icon: '🌐'
});

const selectedRange = ref('30d');
const targetSla = ref('99.9');
const reportData = ref(null);
const isLoading = ref(false);

const overallSlaPercentage = computed(() => reportData.value?.summary?.overall_sla_percentage || 100);
const totalDowntimeMinutes = computed(() => reportData.value?.summary?.total_downtime_minutes || 0);
const errorBudgetRemainingMin = computed(() => reportData.value?.summary?.error_budget_remaining_minutes || 0);
const totalAllowedDowntimeMin = computed(() => reportData.value?.summary?.total_allowed_downtime_minutes || 0);
const totalIncidents = computed(() => reportData.value?.summary?.total_incidents || 0);
const monitorsList = computed(() => reportData.value?.monitors || []);

function budgetPercentage(usedMin) {
  if (totalAllowedDowntimeMin.value === 0) return 0;
  return Number(((usedMin / totalAllowedDowntimeMin.value) * 100).toFixed(1));
}

const timeframeLabel = computed(() => {
  if (selectedRange.value === '24h') return '24 Jam Terakhir';
  if (selectedRange.value === '7d') return '7 Hari Terakhir';
  if (selectedRange.value === '30d') return '30 Hari Terakhir';
  if (selectedRange.value === '90d') return '90 Hari Terakhir';
  if (selectedRange.value === 'this_month') return 'Bulan Berjalan Ini';
  return selectedRange.value;
});

const generatedDateStr = computed(() => {
  return new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
});

function isImageLogo(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

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

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) {
      const data = await res.json();
      branding.value = { ...branding.value, ...data };
    }
  } catch (err) {
    console.error('Fetch branding error:', err);
  }
}

async function fetchReport() {
  isLoading.value = true;
  try {
    const res = await fetch(`/api/v1/reports/sla?range=${selectedRange.value}&sla=${targetSla.value}`);
    if (res.ok) {
      reportData.value = await res.json();
    }
  } catch (err) {
    console.error('Fetch SLA report error:', err);
  } finally {
    isLoading.value = false;
  }
}

function printReport() {
  window.print();
}

function exportCsv() {
  if (!reportData.value?.monitors) return;
  const rows = [
    ['Nama Layanan', 'Tipe', 'Target', 'Status', 'Uptime %', 'Target SLA %', 'Downtime (Menit)', 'Sisa Error Budget (Menit)', 'Latensi Rata-rata (ms)', 'Jumlah Insiden', 'MTTR (Menit)', 'Status Kepatuhan']
  ];

  for (const m of reportData.value.monitors) {
    rows.push([
      `"${m.name}"`,
      m.type,
      `"${m.target}"`,
      m.current_status,
      m.uptime_percentage,
      m.target_sla,
      m.downtime_minutes,
      m.error_budget_remaining_minutes,
      m.avg_latency_ms,
      m.incident_count,
      m.mttr_minutes,
      m.compliance_status
    ]);
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SLA_Report_${selectedRange.value}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  fetchBranding();
  fetchReport();
});
</script>
