<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
      <!-- Toast Notification System -->
      <ToastContainer ref="toastRef" />

      <!-- Top Floating Navigation Bar (Identik dengan Dashboard) -->
      <header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <!-- Brand Lockup -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">
            <img v-if="isImageLogo(branding.logo_icon)" :src="branding.logo_icon" alt="Logo" class="w-4 h-4 object-contain rounded-full" />
            <span v-else>{{ branding.logo_icon || '🌐' }}</span>
          </div>
          <div class="flex items-baseline gap-2">
            <h1 class="text-sm font-bold text-zinc-900 tracking-tight">{{ branding.app_name || 'Uptime CJR' }}</h1>
            <span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| Manajemen Status Page</span>
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
          <a href="/reports" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
            📈 Laporan SLA
          </a>
          <a href="/status-pages" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors font-semibold">
            🌐 Status Pages
          </a>
          <a href="/settings" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
            ⚙️ Pengaturan
          </a>
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-2">
          <button 
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]" 
            @click="openCreateModal"
          >
            <span>+</span> <span class="hidden sm:inline">Buat Status Page</span>
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

      <!-- Status Pages Overview Banner -->
      <div class="p-4 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-zinc-900 tracking-tight">Katalog Status Page Publik &amp; Internal</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Kelola halaman status untuk divisi tertentu, atur struktur pengelompokan layanan (Group &amp; Services) secara visual.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
            Total: <strong class="text-zinc-900">{{ statusPages.length }}</strong> Halaman
          </span>
        </div>
      </div>

      <!-- Status Pages Grid (Kanban / Cards view) -->
      <div v-if="loading" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl">
        <div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs text-zinc-400 font-mono">Memuat konfigurasi status page...</p>
      </div>

      <div v-else-if="statusPages.length === 0" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
        <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl mx-auto">🌐</div>
        <h3 class="text-sm font-bold text-zinc-900">Belum Ada Status Page Kustom</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">Buat halaman status baru untuk mengelompokkan layanan publik dan membagikan SLA ke pengunjung.</p>
        <button class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm" @click="openCreateModal">
          + Buat Halaman Pertama
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="p in statusPages" 
          :key="p.id" 
          class="double-bezel"
        >
          <div class="double-bezel-inner p-5 flex flex-col justify-between space-y-4 h-full">
            <div class="space-y-2.5">
              <!-- Card Top Header -->
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-sm font-bold text-zinc-900 tracking-tight">{{ p.title }}</h3>
                    <span v-if="p.slug === 'main'" class="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase">
                      Default
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-zinc-500">
                    <span>/status/{{ p.slug }}</span>
                    <button 
                      @click="copyUrl(p.slug)"
                      class="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors"
                      title="Salin Tautan"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <!-- Badges -->
                <div class="flex items-center gap-1 shrink-0">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase"
                    :class="p.is_public ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'"
                  >
                    {{ p.is_public ? 'Publik' : 'Privat' }}
                  </span>
                  <span v-if="p.is_protected" class="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-50 text-amber-700 border border-amber-200">
                    🔒
                  </span>
                </div>
              </div>

              <!-- Description -->
              <p class="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                {{ p.description || 'Tidak ada deskripsi status page.' }}
              </p>

              <!-- Coverage Info -->
              <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <span class="text-zinc-500 text-[11px]">Cakupan Layanan:</span>
                <span class="text-zinc-900 font-bold font-mono text-[11px]">
                  {{ p.monitors_count > 0 ? `${p.monitors_count} Layanan Terhubung` : 'Semua Layanan (*)' }}
                </span>
              </div>
            </div>

            <!-- Card Bottom Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-zinc-100">
              <a 
                :href="`/status/${p.slug}`" 
                target="_blank" 
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              >
                Kunjungi ↗
              </a>

              <div class="flex items-center gap-1.5">
                <button 
                  @click="openEditModal(p)"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  ⚙️ Kelola Grup &amp; Layanan
                </button>
                <button 
                  v-if="p.slug !== 'main'"
                  @click="deleteStatusPage(p.id)"
                  class="p-1.5 text-xs rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                  title="Hapus Status Page"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form: Status Page & Group/Services Configurator -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
      @click.self="isModalOpen = false"
    >
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-6">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-zinc-900">
                {{ isEditing ? 'Kelola Status Page & Pengelompokan Layanan' : 'Buat Status Page Baru' }}
              </h3>
              <p class="text-xs text-zinc-500 mt-0.5">Atur detail halaman status serta pembagian kategori layanannya.</p>
            </div>
            <button class="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors" @click="isModalOpen = false">&times;</button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-5">
            <!-- Basic Information -->
            <div class="space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">1. Informasi Dasar</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Judul Halaman</label>
                  <input 
                    v-model="form.title" 
                    type="text" 
                    class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                    placeholder="e.g. Portal Layanan Publik Cianjur" 
                    required 
                  />
                </div>
                <div class="space-y-1">
                  <label class="block text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Slug URL (Akses Web)</label>
                  <div class="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus-within:ring-1 focus-within:ring-zinc-400 focus-within:bg-white">
                    <span class="text-zinc-400 font-mono pr-1">/status/</span>
                    <input 
                      v-model="form.slug" 
                      type="text" 
                      class="flex-1 bg-transparent text-xs text-zinc-900 focus:outline-none font-mono font-semibold"
                      placeholder="layanan-utama" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Deskripsi Singkat</label>
                <textarea 
                  v-model="form.description" 
                  rows="2" 
                  class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                  placeholder="Deskripsi status ketersediaan sistem yang akan dilihat oleh publik..."
                ></textarea>
              </div>
            </div>

            <!-- Group & Services Builder (Style Uptime Kuma) -->
            <div class="space-y-3 pt-3 border-t border-zinc-100">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">2. Pembagian Grup Kategori &amp; Layanan</span>
                  <p class="text-[11px] text-zinc-500 mt-0.5">Pilih layanan yang akan dimasukkan ke dalam status page ini.</p>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    @click="selectAllMonitors"
                    class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  >
                    Pilih Semua
                  </button>
                  <button 
                    type="button" 
                    @click="deselectAllMonitors"
                    class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <!-- Scope Selection -->
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  class="p-3 rounded-xl border text-left text-xs transition-all"
                  :class="form.scope === 'all' ? 'bg-zinc-900 text-white border-zinc-900 font-semibold' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                  @click="form.scope = 'all'"
                >
                  <div class="font-bold">🌍 Seluruh Layanan</div>
                  <div class="text-[10px] opacity-80 mt-0.5">Menampilkan semua monitor yang aktif secara otomatis.</div>
                </button>
                <button 
                  type="button" 
                  class="p-3 rounded-xl border text-left text-xs transition-all"
                  :class="form.scope === 'select' ? 'bg-zinc-900 text-white border-zinc-900 font-semibold' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'"
                  @click="form.scope = 'select'"
                >
                  <div class="font-bold">🎯 Pilih Spesifik &amp; Atur Kategori</div>
                  <div class="text-[10px] opacity-80 mt-0.5">Pilih monitor tertentu saja untuk halaman status ini.</div>
                </button>
              </div>

              <!-- Monitor Selection Checklist with Group Badges -->
              <div v-if="form.scope === 'select'" class="space-y-2">
                <div class="max-h-56 overflow-y-auto bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2">
                  <div v-if="allMonitors.length === 0" class="text-xs text-zinc-400 text-center py-4">
                    Belum ada monitor yang tersedia. Tambahkan monitor di dashboard terlebih dahulu.
                  </div>
                  <label 
                    v-for="m in allMonitors" 
                    :key="m.id" 
                    class="flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-colors cursor-pointer text-xs"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <input 
                        type="checkbox" 
                        :value="m.id" 
                        v-model="form.selectedMonitorIds"
                        class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4"
                      />
                      <span class="font-bold text-zinc-900 truncate">{{ m.name }}</span>
                      <span class="px-1.5 py-px rounded text-[8px] font-mono uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {{ m.type }}
                      </span>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">{{ m.category_name || 'Uncategorized' }}</span>
                  </label>
                </div>
                <p class="text-[11px] text-zinc-400 font-mono">
                  {{ form.selectedMonitorIds.length }} dari {{ allMonitors.length }} monitor dipilih.
                </p>
              </div>
            </div>

            <!-- Security & Password Protection -->
            <div class="space-y-3 pt-3 border-t border-zinc-100">
              <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">3. Privasi &amp; Keamanan</span>
              
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                  <input type="checkbox" v-model="form.is_protected" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                  <span>Proteksi Halaman dengan Kata Sandi (Restricted Status Page)</span>
                </label>

                <div v-if="form.is_protected" class="space-y-1 pl-6">
                  <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Kata Sandi Masuk</label>
                  <input 
                    v-model="form.password" 
                    type="password" 
                    placeholder="Ketik kata sandi untuk pengunjung..." 
                    class="w-full max-w-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white"
                    :required="form.is_protected && !isEditing"
                  />
                  <p class="text-[10px] text-zinc-400 mt-0.5">Pengunjung harus memasukkan kata sandi ini sebelum dapat melihat ketersediaan layanan.</p>
                </div>
              </div>
            </div>

            <!-- Modal Footer Buttons -->
            <div class="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
              <button 
                type="button" 
                class="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                @click="isModalOpen = false"
              >
                Batal
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer active:scale-[0.98]"
              >
                {{ isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Buat Status Page') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
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

    <!-- Flat Modern Footer -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>{{ branding.footer_text || 'Powered by SentinelUp — Observability Platform' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ToastContainer from './ToastContainer.vue';
import ConfirmModal from './ConfirmModal.vue';
import { setToastRef, useToast } from './useToast.js';

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
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

const statusPages = ref([]);
const allMonitors = ref([]);
const loading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const editingId = ref(null);

const form = ref({
  title: '',
  slug: '',
  description: '',
  is_public: true,
  is_protected: false,
  password: '',
  scope: 'all',
  selectedMonitorIds: []
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

function selectAllMonitors() {
  form.value.selectedMonitorIds = allMonitors.value.map(m => m.id);
}

function deselectAllMonitors() {
  form.value.selectedMonitorIds = [];
}

function copyUrl(slug) {
  const url = `${window.location.origin}/status/${slug}`;
  navigator.clipboard.writeText(url);
  toast.success(`URL status page (/status/${slug}) berhasil disalin.`, 'Tautan Tersalin');
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    title: '',
    slug: '',
    description: '',
    is_public: true,
    is_protected: false,
    password: '',
    scope: 'all',
    selectedMonitorIds: []
  };
  isModalOpen.value = true;
}

function openEditModal(p) {
  isEditing.value = true;
  editingId.value = p.id;
  form.value = {
    title: p.title || '',
    slug: p.slug || '',
    description: p.description || '',
    is_public: Boolean(p.is_public),
    is_protected: Boolean(p.is_protected),
    password: '',
    scope: p.monitors_count > 0 ? 'select' : 'all',
    selectedMonitorIds: p.monitors_count > 0 ? (p.monitor_ids || []) : []
  };
  isModalOpen.value = true;
}

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) branding.value = await res.json();
  } catch (err) {
    console.error('Fetch branding error:', err);
  }
}

async function fetchStatusPages() {
  loading.value = true;
  try {
    const res = await fetch('/api/v1/status-pages');
    if (res.ok) {
      statusPages.value = await res.json();
    }
  } catch (err) {
    console.error('Fetch status pages error:', err);
    toast.error('Gagal memuat status pages.');
  } finally {
    loading.value = false;
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

async function submitForm() {
  isSubmitting.value = true;
  try {
    const monitorIds = form.value.scope === 'all' ? [] : form.value.selectedMonitorIds;
    const url = isEditing.value ? `/api/v1/status-pages/${editingId.value}` : '/api/v1/status-pages';
    const method = isEditing.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.value.title,
        slug: form.value.slug,
        description: form.value.description,
        is_public: form.value.is_public,
        password: form.value.is_protected ? form.value.password : '',
        monitor_ids: monitorIds
      })
    });

    if (res.ok) {
      isModalOpen.value = false;
      toast.success(isEditing.value ? 'Perubahan Status Page berhasil disimpan.' : 'Status Page baru berhasil dibuat.');
      await fetchStatusPages();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Gagal menyimpan status page.');
    }
  } catch (err) {
    console.error('Save status page error:', err);
    toast.error('Terjadi kesalahan jaringan.');
  } finally {
    isSubmitting.value = false;
  }
}

// Confirm Dialog State
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
      console.error('Confirm error:', err);
    } finally {
      confirmModal.value.isLoading = false;
    }
  }
}

function deleteStatusPage(id) {
  openConfirmDialog({
    title: 'Hapus Status Page',
    message: 'Apakah Anda yakin ingin menghapus status page ini? Pengunjung tidak akan dapat lagi mengakses URL ini.',
    confirmText: 'Ya, Hapus Status Page',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/status-pages/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          toast.success('Status Page berhasil dihapus.');
          await fetchStatusPages();
        } else {
          toast.error('Gagal menghapus status page.');
        }
      } catch (err) {
        toast.error('Kesalahan jaringan.');
      }
    }
  });
}

onMounted(() => {
  setToastRef(toastRef);
  fetchBranding();
  fetchStatusPages();
  fetchMonitors();
});
</script>
