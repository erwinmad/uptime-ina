<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
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
          <span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| Manajemen Insiden</span>
        </div>
      </div>

      <!-- Navigation Tabs (Pill Structure) -->
      <nav class="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-medium">
        <a href="/dashboard" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
          Monitors
        </a>
        <a href="/incidents" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors flex items-center gap-1.5 font-semibold">
          Insiden
          <span v-if="activeIncidents.length > 0" class="px-1.5 py-px rounded-full text-[9px] font-bold bg-rose-500 text-white">{{ activeIncidents.length }}</span>
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

      <div class="flex items-center gap-2">
        <button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]" @click="isCreateModalOpen = true">
          <span>+</span> <span class="hidden sm:inline">Deklarasikan Insiden</span>
        </button>

        <!-- User Profile & Logout -->
        <div v-if="props.currentUser" class="flex items-center gap-2 pl-2 border-l border-zinc-200 shrink-0">
          <div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs">
            {{ (props.currentUser.full_name || props.currentUser.email || 'A')[0].toUpperCase() }}
          </div>
          <button 
            @click="handleLogout"
            title="Keluar dari sistem"
            class="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-[11px] transition-colors border border-zinc-200 cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>

    <!-- Filter Toolbar -->
    <div class="flex items-center justify-between p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs text-xs">
      <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
        <button 
          v-for="f in [
            { label: 'Semua', val: 'all', count: incidents.length },
            { label: 'Aktif', val: 'active', count: activeIncidents.length },
            { label: 'Selesai', val: 'resolved', count: resolvedIncidents.length }
          ]"
          :key="f.val"
          @click="statusFilter = f.val"
          class="px-3 py-1 rounded-lg text-[11px] transition-all font-medium"
          :class="statusFilter === f.val ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'"
        >
          {{ f.label }} ({{ f.count }})
        </button>
      </div>

      <div class="text-[11px] text-zinc-400 font-mono pr-2">
        {{ filteredIncidents.length }} insiden tercatat
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-4">
      <!-- Active Incidents Section -->
      <section v-if="statusFilter === 'all' || statusFilter === 'active'" class="space-y-2">
        <div class="flex items-center gap-2 px-1">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" v-if="activeIncidents.length > 0"></span>
          <h2 class="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Insiden Aktif ({{ activeIncidents.length }})
          </h2>
        </div>

        <div v-if="activeIncidents.length === 0" class="p-8 text-center bg-white ring-1 ring-zinc-200/80 rounded-2xl space-y-1.5">
          <p class="text-xs font-bold text-emerald-700">✨ Seluruh Layanan Beroperasi Normal</p>
          <p class="text-[11px] text-zinc-400">Tidak ada gangguan konektivitas atau degradasi aktif yang terdeteksi saat ini.</p>
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="inc in activeIncidents" 
            :key="inc.id" 
            class="double-bezel"
          >
            <div class="double-bezel-inner p-4 sm:p-5 space-y-3">
              <div class="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      {{ inc.status }}
                    </span>
                    <span class="text-[10px] font-mono text-zinc-400">Dimulai: {{ new Date(inc.started_at).toLocaleString('id-ID') }}</span>
                  </div>
                  <h3 class="text-sm font-bold text-zinc-900 mt-1">{{ inc.title }}</h3>
                  <p class="text-xs text-zinc-500 mt-0.5">
                    Dampak: <strong class="text-zinc-800">{{ inc.monitor_name || 'Seluruh Sistem' }}</strong>
                  </p>
                </div>
                <button 
                  class="px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer shrink-0" 
                  @click="openUpdateModal(inc)"
                >
                  + Update Kronologi
                </button>
              </div>

              <!-- Timeline Updates -->
              <div class="relative pl-5 space-y-3 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-zinc-200">
                <div v-for="upd in inc.updates" :key="upd.id" class="relative">
                  <span class="w-2.5 h-2.5 rounded-full bg-white border-2 border-rose-500 absolute -left-[18px] top-1"></span>
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-px rounded text-[9px] font-mono uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {{ upd.status }}
                    </span>
                    <span class="text-[10px] text-zinc-400 font-mono">{{ new Date(upd.created_at).toLocaleTimeString('id-ID') }}</span>
                  </div>
                  <p class="text-xs text-zinc-700 mt-1 leading-relaxed">{{ upd.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Resolved Incidents History -->
      <section v-if="statusFilter === 'all' || statusFilter === 'resolved'" class="space-y-2">
        <div class="px-1">
          <h2 class="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Riwayat Insiden Selesai ({{ resolvedIncidents.length }})
          </h2>
        </div>

        <div v-if="resolvedIncidents.length === 0" class="p-8 text-center bg-white ring-1 ring-zinc-200/80 rounded-2xl text-xs text-zinc-400">
          Belum ada riwayat insiden lampau.
        </div>

        <div v-else class="space-y-2.5">
          <div 
            v-for="inc in resolvedIncidents" 
            :key="inc.id" 
            class="double-bezel"
          >
            <div class="double-bezel-inner p-4 sm:p-5 space-y-3">
              <div class="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      RESOLVED
                    </span>
                    <span class="text-[10px] font-mono text-zinc-400">Durasi: {{ formatDuration(inc.started_at, inc.resolved_at) }}</span>
                  </div>
                  <h3 class="text-sm font-bold text-zinc-900 mt-1">{{ inc.title }}</h3>
                  <p class="text-xs text-zinc-500 mt-0.5">
                    Dampak: <strong class="text-zinc-700">{{ inc.monitor_name || 'Seluruh Sistem' }}</strong>
                  </p>
                </div>

                <button 
                  @click="openPostMortemModal(inc)"
                  class="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  📝 Post-Mortem &amp; RCA
                </button>
              </div>

              <!-- Post-Mortem Preview if filled -->
              <div v-if="inc.root_cause" class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
                <div class="text-[10px] font-bold text-amber-700 uppercase tracking-wider">🔬 Akar Masalah (Root Cause):</div>
                <p class="text-zinc-700 text-xs">{{ inc.root_cause }}</p>
                <div v-if="inc.prevention_plan" class="pt-1">
                  <div class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">🛡️ Rencana Pencegahan:</div>
                  <p class="text-zinc-700 text-xs">{{ inc.prevention_plan }}</p>
                </div>
              </div>

              <!-- Timeline trail -->
              <div class="relative pl-5 space-y-3 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-zinc-200">
                <div v-for="upd in inc.updates" :key="upd.id" class="relative">
                  <span class="w-2.5 h-2.5 rounded-full bg-white border-2 border-emerald-500 absolute -left-[18px] top-1"></span>
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-px rounded text-[9px] font-mono uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {{ upd.status }}
                    </span>
                    <span class="text-[10px] text-zinc-400 font-mono">{{ new Date(upd.created_at).toLocaleString('id-ID') }}</span>
                  </div>
                  <p class="text-xs text-zinc-600 mt-1 leading-relaxed">{{ upd.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Update Timeline Modal -->
    <div v-if="isUpdateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isUpdateModalOpen = false">
      <div class="w-full max-w-md double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 class="text-sm font-bold text-zinc-900">Perbarui Kronologi Insiden</h3>
            <button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer" @click="isUpdateModalOpen = false">&times;</button>
          </div>
          <form @submit.prevent="submitTimelineUpdate" class="space-y-3.5">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Status Terbaru</label>
              <select v-model="updateForm.status" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white">
                <option value="investigating">Investigating (Investigasi)</option>
                <option value="identified">Identified (Penyebab Teridentifikasi)</option>
                <option value="monitoring">Monitoring (Pemulihan &amp; Monitoring)</option>
                <option value="resolved">Resolved (Terselesaikan Penuh)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Pesan Kronologi / Update Teknis</label>
              <textarea 
                v-model="updateForm.message" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="4" 
                placeholder="Contoh: Tim teknis sedang merutekan ulang trafik gateway..." 
                required
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors" @click="isUpdateModalOpen = false">Batal</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">Kirim Pembaruan</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Declare Incident Modal -->
    <div v-if="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isCreateModalOpen = false">
      <div class="w-full max-w-md double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 class="text-sm font-bold text-zinc-900">Deklarasikan Insiden Baru</h3>
            <button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer" @click="isCreateModalOpen = false">&times;</button>
          </div>
          <form @submit.prevent="submitNewIncident" class="space-y-3.5">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Judul Insiden</label>
              <input 
                v-model="createForm.title" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                placeholder="e.g. Degradasi Konektivitas Database Utama" 
                required 
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Komponen / Monitor Terdampak</label>
              <select v-model="createForm.monitor_id" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white">
                <option value="">-- Seluruh Sistem / Infrastruktur Umum --</option>
                <option v-for="m in monitors" :key="m.id" :value="m.id">{{ m.name }} ({{ m.type.toUpperCase() }})</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Status Awal</label>
              <select v-model="createForm.status" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white">
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Pesan Kronologi Awal</label>
              <textarea 
                v-model="createForm.initial_message" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="3" 
                placeholder="Jelaskan temuan awal insiden..." 
                required
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors" @click="isCreateModalOpen = false">Batal</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm cursor-pointer">Deklarasikan</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Post-Mortem & RCA Modal -->
    <div v-if="isPostMortemModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isPostMortemModalOpen = false">
      <div class="w-full max-w-lg double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-sm font-bold text-zinc-900">Analisis Akar Masalah (RCA) &amp; Post-Mortem</h3>
              <p class="text-[11px] text-zinc-400 mt-0.5">Insiden: {{ selectedIncident?.title }}</p>
            </div>
            <button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer" @click="isPostMortemModalOpen = false">&times;</button>
          </div>

          <form @submit.prevent="submitPostMortem" class="space-y-3.5">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">🔬 Akar Penyebab Masalah (Root Cause)</label>
              <textarea 
                v-model="postMortemForm.root_cause" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="3" 
                placeholder="Contoh: Lonjakan beban trafik yang tidak terduga pada port pool database..." 
                required
              ></textarea>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">🛡️ Rencana Mitigasi &amp; Pencegahan Masa Depan</label>
              <textarea 
                v-model="postMortemForm.prevention_plan" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="3" 
                placeholder="Contoh: Meningkatkan kapasitas connection pool dan menambahkan alert limit 80%..."
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors" @click="isPostMortemModalOpen = false">Batal</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">Simpan Dokumen RCA</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
    <!-- Footer Flat Bottom -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
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

const incidents = ref([]);
const monitors = ref([]);
const branding = ref({
  app_name: 'Uptime CJR',
  app_tagline: 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur',
  logo_icon: '🌐',
  footer_text: '© 2026 Uptime CJR — Sistem Pemantauan Ketersediaan Layanan'
});
const statusFilter = ref('all');

function isImageLogo(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}


const isUpdateModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const selectedIncident = ref(null);

const isPostMortemModalOpen = ref(false);
const selectedPostMortemIncident = ref(null);
const isSavingPostMortem = ref(false);
const postMortemForm = ref({ root_cause: '', action_items: '', prevention_plan: '' });

const updateForm = ref({ status: 'investigating', message: '' });
const createForm = ref({ title: '', monitor_id: '', message: '' });

const activeIncidents = computed(() => incidents.value.filter(i => i.status !== 'resolved'));
const resolvedIncidents = computed(() => incidents.value.filter(i => i.status === 'resolved'));

const filteredIncidents = computed(() => {
  if (statusFilter.value === 'active') return activeIncidents.value;
  if (statusFilter.value === 'resolved') return resolvedIncidents.value;
  return incidents.value;
});

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) {
      const data = await res.json();
      if (data.footer_text) footerText.value = data.footer_text;
    }
  } catch (err) {
    console.error('Fetch branding error:', err);
  }
}

async function fetchIncidents() {
  try {
    const res = await fetch('/api/v1/incidents');
    if (res.ok) incidents.value = await res.json();
  } catch (err) {
    console.error('Fetch incidents error:', err);
  }
}

async function fetchMonitors() {
  try {
    const res = await fetch('/api/v1/monitors');
    if (res.ok) monitors.value = await res.json();
  } catch (err) {
    console.error('Fetch monitors error:', err);
  }
}

function openUpdateModal(inc) {
  selectedIncident.value = inc;
  updateForm.value = { status: inc.status, message: '' };
  isUpdateModalOpen.value = true;
}

function openPostMortemModal(inc) {
  selectedPostMortemIncident.value = inc;
  postMortemForm.value = {
    root_cause: inc.root_cause || '',
    action_items: inc.action_items || '',
    prevention_plan: inc.prevention_plan || ''
  };
  isPostMortemModalOpen.value = true;
}

async function savePostMortem() {
  if (!selectedPostMortemIncident.value) return;
  isSavingPostMortem.value = true;
  try {
    const res = await fetch(`/api/v1/incidents/${selectedPostMortemIncident.value.id}/post-mortem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postMortemForm.value)
    });
    if (res.ok) {
      isPostMortemModalOpen.value = false;
      fetchIncidents();
    }
  } catch (err) {
    console.error('Save post-mortem error:', err);
  } finally {
    isSavingPostMortem.value = false;
  }
}

async function submitTimelineUpdate() {
  if (!selectedIncident.value) return;
  try {
    const res = await fetch(`/api/v1/incidents/${selectedIncident.value.id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateForm.value)
    });
    if (res.ok) {
      isUpdateModalOpen.value = false;
      fetchIncidents();
    }
  } catch (err) {
    console.error('Update incident error:', err);
  }
}

async function submitNewIncident() {
  try {
    const res = await fetch('/api/v1/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm.value)
    });
    if (res.ok) {
      isCreateModalOpen.value = false;
      createForm.value = { title: '', monitor_id: '', message: '' };
      fetchIncidents();
    }
  } catch (err) {
    console.error('Create incident error:', err);
  }
}

function formatDuration(startedAt, resolvedAt) {
  if (!resolvedAt) return 'Ongoing';
  const start = new Date(startedAt).getTime();
  const end = new Date(resolvedAt).getTime();
  const diffMins = Math.round((end - start) / 60000);
  if (diffMins < 60) return `${diffMins} menit`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}j ${mins}m`;
}

onMounted(() => {
  fetchBranding();
  fetchIncidents();
  fetchMonitors();
});
</script>
