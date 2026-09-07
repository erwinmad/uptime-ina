<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
      <!-- Toast Notification System -->
      <ToastContainer ref="toastRef" />

      <!-- Top Floating Navigation Bar (Identik dengan Dashboard) -->
          <!-- App Navbar -->
      <AppNavbar 
        :current-user="props.currentUser" 
        active-tab="status-pages" 
        :subtitle="`| ${t('statusPages.manageSubtitle')}`"
      />

      <!-- Status Pages Overview Banner -->
      <div class="p-4 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-zinc-900 tracking-tight">{{ t('statusPages.catalogTitle') }}</h2>
          <p class="text-xs text-zinc-500 mt-0.5">{{ t('statusPages.catalogDesc') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
            {{ t('statusPages.totalPages', {count: statusPages.length}) }}
          </span>
          <a 
            href="/status-pages/new" 
            class="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]" 
          >
            <span>+</span> <span class="hidden sm:inline">{{ t('statusPages.create') }}</span>
          </a>
        </div>
      </div>

      <!-- Status Pages Grid (Kanban / Cards view) -->
      <div v-if="loading" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl">
        <div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs text-zinc-400 font-mono">{{ t('statusPages.loading') }}</p>
      </div>

      <div v-else-if="statusPages.length === 0" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
        <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl mx-auto">🌐</div>
        <h3 class="text-sm font-bold text-zinc-900">{{ t('statusPages.emptyTitle') }}</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">{{ t('statusPages.emptyDesc') }}</p>
        <a href="/status-pages/new" class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm inline-block">
          {{ t('statusPages.createFirst') }}
        </a>
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
                    {{ p.is_public ? t('statusPages.isPublic') : t('statusPages.isPrivate') }}
                  </span>
                  <span v-if="p.is_protected" class="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-50 text-amber-700 border border-amber-200">
                    🔒
                  </span>
                </div>
              </div>

              <!-- Description -->
              <p class="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                {{ p.description || t('statusPages.noDescription') }}
              </p>

              <!-- Coverage Info -->
              <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <span class="text-zinc-500 text-[11px]">{{ t('statusPages.coverage') }}</span>
                <span class="text-zinc-900 font-bold font-mono text-[11px]">
                  {{ p.monitors_count > 0 ? t('statusPages.servicesConnected', {count: p.monitors_count}) : t('statusPages.allServices') }}
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
                {{ t('statusPages.visit') }} ↗
              </a>

              <div class="flex items-center gap-1.5">
                <a 
                  :href="`/status-pages/${p.id}`"
                  class="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm inline-flex items-center gap-1"
                >
                  {{ t('statusPages.configure') }}
                </a>
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
        <p><span>{{ branding.footer_text || 'Powered by deTAK — Observability Platform' }}</span></p><div class="flex items-center gap-2 flex-wrap"><a href="https://github.com/erwinmad/uptime-ina" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-2">GitHub ↗</a><span class="opacity-30">·</span><span>© 2026 deTAK</span></div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Activity, AlertTriangle, BarChart3, Globe, Settings } from 'lucide-vue-next';
import AppNavbar from './AppNavbar.vue';
import ToastContainer from './ToastContainer.vue';
import ConfirmModal from './ConfirmModal.vue';
import { setToastRef, useToast } from './useToast.js';
import { useI18n } from '../../lib/i18n';
const { t, locale } = useI18n();

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
  }
});

const toastRef = ref(null);
const { toast } = useToast();

const branding = ref({
  app_name: 'deTAK',
  app_tagline: 'Platform Observabilitas & Pemantauan Ketersediaan Layanan',
  logo_icon: '🌐',
  footer_text: 'Powered by deTAK — Uptime & Observability Platform'
});

const statusPages = ref([]);
const loading = ref(true);

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

function copyUrl(slug) {
  const url = `${window.location.origin}/status/${slug}`;
  navigator.clipboard.writeText(url);
  toast.success(t('toast.urlCopied'), t('toast.urlCopiedTitle'));
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
    toast.error(t('toast.loadFailed'));
  } finally {
    loading.value = false;
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
          toast.success(t('toast.deleted'));
          await fetchStatusPages();
        } else {
          toast.error(t('toast.deleteFailed'));
        }
      } catch (err) {
        toast.error(t('toast.networkError'));
      }
    }
  });
}

onMounted(() => {
  setToastRef(toastRef);
  
  fetchStatusPages();
});
</script>
