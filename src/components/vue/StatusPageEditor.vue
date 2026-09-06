<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
      <!-- Toast Notification System -->
      <ToastContainer ref="toastRef" />

      <!-- Top Floating Navigation Bar (Konsisten dengan Dashboard) -->
          <!-- App Navbar -->
    <AppNavbar 
      :current-user="props.currentUser" 
      active-tab="status-pages" 
      subtitle="| Konfigurasi Halaman Status"
    >
    </AppNavbar>

      <!-- Main Configurator Layout (2-Column Grid) -->
      <div v-if="loading" class="p-16 text-center bg-white border border-zinc-200 rounded-2xl">
        <div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs text-zinc-400 font-mono">Memuat detail status page...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column: Settings Panel (Span 5) -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Metadata Card -->
          <div class="double-bezel">
            <div class="double-bezel-inner p-6 space-y-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">1. Pengaturan Identitas</span>
                <h3 class="text-sm font-bold text-zinc-900 mt-0.5">Informasi Halaman Status</h3>
              </div>

              <div class="space-y-3.5">
                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Judul Halaman Status</label>
                  <input 
                    v-model="form.title" 
                    type="text" 
                    class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                    placeholder="e.g. Status Layanan Internal Diskominfo" 
                    required 
                  />
                </div>

                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Slug URL Publik</label>
                  <div class="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus-within:ring-1 focus-within:ring-zinc-400 focus-within:bg-white">
                    <span class="text-zinc-400 font-mono pr-1 text-[11px]">/status/</span>
                    <input 
                      v-model="form.slug" 
                      type="text" 
                      class="flex-1 bg-transparent text-xs text-zinc-900 focus:outline-none font-mono font-semibold"
                      placeholder="layanan-utama" 
                      required 
                    />
                  </div>
                  <p class="text-[10px] text-zinc-400 font-mono">Tautan langsung: {{ currentOrigin }}/status/{{ form.slug || '...' }}</p>
                </div>

                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Deskripsi / Pengumuman</label>
                  <textarea 
                    v-model="form.description" 
                    rows="3" 
                    class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                    placeholder="Laporan real-time ketersediaan sistem dan infrastruktur jaringan..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Security & Access Card -->
          <div class="double-bezel">
            <div class="double-bezel-inner p-6 space-y-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">2. Keamanan &amp; Aksesibilitas</span>
                <h3 class="text-sm font-bold text-zinc-900 mt-0.5">Visibilitas &amp; Password Gate</h3>
              </div>

              <div class="space-y-3">
                <label class="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer">
                  <div>
                    <span class="text-xs font-bold text-zinc-900 block">Publikasikan Halaman</span>
                    <span class="text-[10px] text-zinc-400">Dapat diakses oleh masyarakat atau stakeholder.</span>
                  </div>
                  <input type="checkbox" v-model="form.is_public" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4" />
                </label>

                <div class="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-xs font-bold text-zinc-900 block">Proteksi Kata Sandi</span>
                      <span class="text-[10px] text-zinc-400">Wajibkan sandi untuk melihat status.</span>
                    </div>
                    <input type="checkbox" v-model="form.is_protected" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4" />
                  </label>

                  <div v-if="form.is_protected" class="pt-2 border-t border-zinc-200 space-y-1">
                    <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Kata Sandi Akses</label>
                    <input 
                      v-model="form.password" 
                      type="password" 
                      placeholder="Masukkan kata sandi baru..." 
                      class="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                    <p class="text-[9px] text-zinc-400">Kosongkan jika tidak ingin mengubah kata sandi yang sudah ada.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- Right Column: Services & Category Group Builder (Span 7) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="double-bezel">
            <div class="double-bezel-inner p-6 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">3. Struktur Grup &amp; Layanan</span>
                  <h3 class="text-sm font-bold text-zinc-900 mt-0.5">Kelola Kategori Layanan</h3>
                  <p class="text-xs text-zinc-500 mt-0.5">Kelompokkan monitor-monitor ke dalam grup agar pengunjung mudah memahaminya.</p>
                </div>
                <button 
                  type="button" 
                  @click="addGroup"
                  class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                >
                  <span>+</span> Tambah Grup Baru
                </button>
              </div>

              <!-- Scope Mode Switcher -->
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  @click="form.scope = 'all'"
                  class="p-3.5 rounded-xl border text-left transition-all cursor-pointer"
                  :class="form.scope === 'all' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                >
                  <div class="font-bold text-xs">🌍 Seluruh Layanan (Otomatis)</div>
                  <div class="text-[10px] opacity-75 mt-0.5">Satu grup "Layanan Utama" dengan semua monitor.</div>
                </button>
                <button 
                  type="button"
                  @click="form.scope = 'select'"
                  class="p-3.5 rounded-xl border text-left transition-all cursor-pointer"
                  :class="form.scope === 'select' ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                >
                  <div class="font-bold text-xs">🎯 Kustomisasi Grup &amp; Layanan</div>
                  <div class="text-[10px] opacity-75 mt-0.5">Buat kategori dan pilih monitor per-kategori.</div>
                </button>
              </div>

              <!-- Builder UI -->
              <div v-if="form.scope === 'select'" class="space-y-4 pt-2">
                <div v-if="form.monitor_groups.length === 0" class="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-500 font-mono">
                  Belum ada grup layanan. Klik "+ Tambah Grup Baru" di pojok kanan atas.
                </div>

                <div 
                  v-for="(grp, gIdx) in form.monitor_groups" 
                  :key="gIdx" 
                  class="bg-white ring-1 ring-zinc-200 shadow-xs rounded-2xl overflow-hidden transition-all group/card"
                >
                  <!-- Group Header -->
                  <div class="bg-zinc-50 px-4 py-3 flex items-center justify-between border-b border-zinc-200">
                    <div class="flex items-center gap-2 flex-1 mr-4">
                      <span class="text-xs text-zinc-400">📁</span>
                      <input 
                        v-model="grp.group_name" 
                        class="bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-900 placeholder-zinc-400 w-full max-w-xs transition-colors"
                        placeholder="Nama Grup (e.g. Layanan Publik)"
                      />
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-mono text-zinc-400">{{ grp.monitors.length }} layanan</span>
                      <button 
                        type="button" 
                        @click="removeGroup(gIdx)" 
                        class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer" 
                        title="Hapus Grup Ini"
                      >
                        Hapus Grup
                      </button>
                    </div>
                  </div>

                  <!-- Group Monitors List -->
                  <div class="p-4 space-y-3">
                    <div v-if="grp.monitors.length === 0" class="text-[10px] text-zinc-400 italic text-center py-2">
                      Grup masih kosong. Tambahkan layanan di bawah ini.
                    </div>
                    <div v-else class="space-y-1.5">
                      <div 
                        v-for="(monId, mIdx) in grp.monitors" 
                        :key="monId"
                        class="flex items-center justify-between p-2 rounded-lg border border-zinc-100 bg-white hover:bg-zinc-50 group/item transition-colors"
                      >
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] opacity-20 cursor-grab px-1">⋮⋮</span>
                          <span class="text-xs font-bold text-zinc-800">{{ getMonitorName(monId) }}</span>
                          <span class="text-[9px] font-mono text-zinc-400 uppercase">{{ getMonitorType(monId) }}</span>
                        </div>
                        <button @click="removeMonitorFromGroup(gIdx, mIdx)" class="text-[10px] text-zinc-400 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-opacity">Hapus</button>
                      </div>
                    </div>

                    <!-- Add Monitor Dropdown -->
                    <div class="pt-2 relative">
                      <select 
                        class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer appearance-none"
                        @change="(e) => addMonitorToGroup(gIdx, e.target.value, e)"
                      >
                        <option value="" disabled selected>+ Tambah Layanan ke Grup Ini...</option>
                        <option v-for="m in availableMonitors(grp.monitors)" :key="m.id" :value="m.id">
                          {{ m.name }} ({{ m.type.toUpperCase() }})
                        </option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-2 text-zinc-400 text-xs">▼</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary Counter -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-100 text-xs font-mono text-zinc-600">
                <span>Total Layanan Ditampilkan:</span>
                <span class="font-bold text-zinc-900">
                  {{ form.scope === 'all' ? allMonitors.length : totalSelectedMonitors }} Layanan
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Flat Modern Footer -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>{{ branding.footer_text || 'Powered by SentinelUp — Observability Platform' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Activity, AlertTriangle, BarChart3, Globe, Settings } from 'lucide-vue-next';
import AppNavbar from './AppNavbar.vue';
import { ref, computed, onMounted } from 'vue';
import ToastContainer from './ToastContainer.vue';
import { setToastRef, useToast } from './useToast.js';

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
  },
  pageId: {
    type: String,
    required: true
  }
});

const toastRef = ref(null);
const { toast } = useToast();

const branding = ref({
  app_name: 'Uptime CJR',
  app_tagline: 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur',
  logo_icon: '🌐',
  footer_text: '© 2026 Uptime CJR — Sistem Pemantauan Ketersediaan Layanan'
});

const isNew = computed(() => props.pageId === 'new');
const loading = ref(true);
const isSaving = ref(false);
const allMonitors = ref([]);
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const form = ref({
  title: '',
  slug: '',
  description: '',
  is_public: true,
  is_protected: false,
  password: '',
  scope: 'all',
  monitor_groups: []
});

function selectAll() {
  form.value.scope = 'select';
  if (form.value.monitor_groups.length === 0) {
    form.value.monitor_groups.push({
      group_name: 'Layanan Utama',
      monitors: allMonitors.value.map(m => m.id)
    });
  } else {
    // Add all monitors to first group
    const firstGroup = form.value.monitor_groups[0];
    firstGroup.monitors = allMonitors.value.map(m => m.id);
  }
}

function deselectAll() {
  form.value.monitor_groups.forEach(g => {
    g.monitors = [];
  });
}

function addGroup() {
  form.value.scope = 'select';
  form.value.monitor_groups.push({
    group_name: `Grup ${form.value.monitor_groups.length + 1}`,
    monitors: []
  });
}

function removeGroup(idx) {
  form.value.monitor_groups.splice(idx, 1);
}

function addMonitorToGroup(gIdx, monId, event) {
  if (!monId) return;
  if (!form.value.monitor_groups[gIdx].monitors.includes(monId)) {
    form.value.monitor_groups[gIdx].monitors.push(monId);
  }
  if (event && event.target) {
    event.target.value = '';
  }
}

function removeMonitorFromGroup(gIdx, mIdx) {
  form.value.monitor_groups[gIdx].monitors.splice(mIdx, 1);
}

function getMonitorName(id) {
  const m = allMonitors.value.find(x => x.id === id);
  return m ? m.name : id;
}

function getMonitorType(id) {
  const m = allMonitors.value.find(x => x.id === id);
  return m ? m.type : '';
}

function availableMonitors(alreadySelected = []) {
  // Ambil semua monitor ID yang sudah terpilih di grup MANAPUN di halaman status ini
  const allUsedIds = new Set();
  for (const g of form.value.monitor_groups) {
    if (Array.isArray(g.monitors)) {
      g.monitors.forEach(id => allUsedIds.add(id));
    }
  }
  return (allMonitors.value || []).filter(m => m && !allUsedIds.has(m.id));
}

const totalSelectedMonitors = computed(() => {
  const set = new Set();
  for (const g of form.value.monitor_groups) {
    if (Array.isArray(g.monitors)) {
      g.monitors.forEach(id => set.add(id));
    }
  }
  return set.size;
});

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) branding.value = await res.json();
  } catch (err) {
    console.error('Fetch branding error:', err);
  }
}

async function fetchMonitors() {
  try {
    const res = await fetch('/api/v1/monitors');
    if (res.ok) {
      allMonitors.value = await res.json();
    }
  } catch (err) {
    console.error('Fetch monitors error:', err);
  }
}

async function fetchPageDetails() {
  if (isNew.value) {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`/api/v1/status-pages`);
    if (res.ok) {
      const list = await res.json();
      const page = list.find(p => p.id === props.pageId || p.slug === props.pageId);
      if (page) {
        let groups = [];
        if (Array.isArray(page.monitor_groups) && page.monitor_groups.length > 0) {
          groups = page.monitor_groups.map(g => ({
            group_name: g.group_name || 'Layanan Utama',
            monitors: Array.isArray(g.monitors) ? g.monitors : []
          }));
        } else if (Array.isArray(page.monitor_ids) && page.monitor_ids.length > 0) {
          groups = [{
            group_name: 'Layanan Utama',
            monitors: page.monitor_ids
          }];
        } else {
          groups = [{
            group_name: 'Layanan Utama',
            monitors: []
          }];
        }

        form.value = {
          title: page.title || '',
          slug: page.slug || '',
          description: page.description || '',
          is_public: page.is_public !== 0,
          is_protected: Boolean(page.is_protected),
          password: '',
          scope: groups.some(g => g.monitors.length > 0) ? 'select' : 'all',
          monitor_groups: groups
        };
      } else {
        toast.error(t('toast.notFound'));
      }
    }
  } catch (err) {
    console.error('Fetch page details error:', err);
    toast.error(t('toast.fetchFailed'));
  } finally {
    loading.value = false;
  }
}

async function savePage() {
  if (!form.value.title || !form.value.slug) {
    toast.warning(t('toast.validationFailed'));
    return;
  }

  isSaving.value = true;
  try {
    // If scope === 'all', generate one group containing all monitors
    let payloadGroups = [];
    if (form.value.scope === 'all') {
      payloadGroups = [{
        group_name: 'Layanan Utama',
        monitors: allMonitors.value.map(m => m.id)
      }];
    } else {
      payloadGroups = form.value.monitor_groups;
    }

    const url = isNew.value ? '/api/v1/status-pages' : `/api/v1/status-pages/${props.pageId}`;
    const method = isNew.value ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.value.title,
        slug: form.value.slug,
        description: form.value.description,
        is_public: form.value.is_public,
        password: form.value.is_protected ? form.value.password : '',
        monitor_groups: payloadGroups
      })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      toast.success(isNew.value ? t('toast.created') : t('toast.updated'));
      setTimeout(() => {
        window.location.href = '/status-pages';
      }, 700);
    } else {
      toast.error(data.error || t('toast.saveFailed'));
    }
  } catch (err) {
    console.error('Save status page error:', err);
    toast.error(t('toast.networkError'));
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  setToastRef(toastRef);
  await 
  await fetchMonitors();
  await fetchPageDetails();
});
</script>
