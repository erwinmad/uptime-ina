<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
    <!-- Top Floating Navigation Bar -->
        <!-- App Navbar -->
    <AppNavbar 
      :current-user="props.currentUser" 
      active-tab="incidents" 
      :subtitle="`| ${t('incident.title')}`"
      :active-incidents-count="activeIncidents.length"
    >
    </AppNavbar>

    <!-- Filter Toolbar -->
    <div class="flex items-center justify-between gap-2 p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs text-xs">
      <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
        <button 
          v-for="f in [
            { label: t('incident.all'), val: 'all', count: incidents.length },
            { label: t('incident.active'), val: 'active', count: activeIncidents.length },
            { label: t('incident.resolved'), val: 'resolved', count: resolvedIncidents.length }
          ]"
          :key="f.val"
          @click="statusFilter = f.val; currentPage = 1"
          class="px-3 py-1 rounded-lg text-[11px] transition-all font-medium cursor-pointer"
          :class="statusFilter === f.val ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'"
        >
          {{ f.label }} ({{ f.count }})
        </button>
      </div>

      <div class="flex items-center gap-2">
        <div class="hidden sm:block text-[11px] text-zinc-400 font-mono pr-1">
          {{ t('incident.recorded', {count: filteredIncidents.length}) }}
        </div>
        <button @click="isCreateModalOpen = true" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-sm">
          <Plus class="w-3.5 h-3.5" /> {{ t('incident.createIncident') }}
        </button>
      </div>
    </div>

    <!-- Main Content — Table Layout -->
    <div class="space-y-3">
      <!-- Empty state for no data at all -->
      <div v-if="filteredIncidents.length === 0" class="p-10 text-center bg-white ring-1 ring-zinc-200/80 rounded-2xl space-y-2">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
          <CircleCheck class="w-5 h-5" />
        </div>
        <p class="text-xs font-bold text-zinc-900 flex items-center justify-center gap-1.5"><Sparkles class="w-3.5 h-3.5 text-emerald-500" /> {{ t('incident.noFilterMatch') }}</p>
        <p class="text-[11px] text-zinc-400 max-w-sm mx-auto">{{ t('incident.noFilterDesc', {filter: statusFilter}) }}</p>
      </div>

      <div v-else class="double-bezel">
        <div class="double-bezel-inner p-0 overflow-hidden">
          <!-- Table header meta -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50/50">
            <div class="flex items-center gap-2">
              <span v-if="statusFilter === 'active'" class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span v-else-if="statusFilter === 'resolved'" class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span v-else class="w-2 h-2 rounded-full bg-zinc-400"></span>
              <h2 class="text-xs font-bold text-zinc-900 tracking-tight">
                <span v-if="statusFilter === 'active'">{{ t('incident.activeIncidents') }}</span>
                <span v-else-if="statusFilter === 'resolved'">{{ t('incident.resolved') }}</span>
                <span v-else>{{ t('incident.listTitle') }}</span>
                <span class="font-mono font-normal text-zinc-500"> — {{ t('incident.recorded', {count: filteredIncidents.length}) }}</span>
              </h2>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span class="hidden sm:inline">{{ t('common.page', {current: currentPage, total: totalPages}) }}</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs border-collapse">
              <thead class="bg-zinc-50 border-b border-zinc-200 sticky top-0">
                <tr class="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th class="text-left px-3 py-2.5 font-medium whitespace-nowrap w-10">#</th>
                  <th class="text-left px-3 py-2.5 font-medium min-w-[220px]">{{ t('incident.incident') }}</th>
                  <th class="text-left px-3 py-2.5 font-medium whitespace-nowrap">{{ t('incident.monitor') }}</th>
                  <th class="text-left px-3 py-2.5 font-medium whitespace-nowrap">Status</th>
                  <th class="text-left px-3 py-2.5 font-medium whitespace-nowrap">{{ t('incident.started') }}</th>
                  <th class="text-left px-3 py-2.5 font-medium whitespace-nowrap">{{ t('incident.duration') }}</th>
                  <th class="text-center px-3 py-2.5 font-medium whitespace-nowrap">{{ t('incident.updates') }}</th>
                  <th class="text-left px-3 py-2.5 font-medium whitespace-nowrap">RCA</th>
                  <th class="text-right px-3 py-2.5 font-medium whitespace-nowrap">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr 
                  v-for="(inc, idx) in paginatedIncidents" 
                  :key="inc.id" 
                  class="hover:bg-zinc-50/70 transition-colors group"
                >
                  <td class="px-3 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                  <td class="px-3 py-3 max-w-[260px]">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-zinc-950" :title="inc.title">{{ inc.title }}</span>
                      <span class="text-[10px] text-zinc-400 font-mono line-clamp-1">#{{ String(inc.id).slice(0,8) }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <span class="inline-flex items-center gap-1.5 text-[11px] text-zinc-700" :title="inc.monitor_name || t('incident.fallbackSystem')">
                      <span class="w-5 h-5 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0"><ClipboardList class="w-3 h-3 text-zinc-500" /></span>
                      <span class="line-clamp-1 max-w-[120px]">{{ inc.monitor_name || t('incident.fallbackSystem') }}</span>
                    </span>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border"
                      :class="inc.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : inc.status === 'investigating' ? 'bg-rose-50 text-rose-700 border-rose-200' : inc.status === 'identified' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'"
                    >{{ inc.status }}</span>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600"><Clock class="w-3 h-3 text-zinc-400" /> {{ new Date(inc.started_at).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500"><Timer class="w-3 h-3 text-zinc-400" /> {{ formatDuration(inc.started_at, inc.resolved_at) }}</span>
                  </td>
                  <td class="px-3 py-3 text-center whitespace-nowrap">
                    <span class="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-mono font-medium text-zinc-600">{{ inc.updates?.length || 0 }}</span>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <span v-if="inc.root_cause" class="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ t('incident.rcaAvailable') }}</span>
                    <span v-else class="inline-flex items-center gap-1 text-[10px] text-zinc-400"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> {{ t('incident.rcaPending') }}</span>
                  </td>
                  <td class="px-3 py-3 whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <button 
                        v-if="inc.status !== 'resolved'"
                        @click="openUpdateModal(inc)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                        :title="t('incident.modal.updateTitle')"
                      ><Plus class="w-3 h-3" /> Update</button>
                      <button 
                        @click="openPostMortemModal(inc)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-semibold transition-colors cursor-pointer"
                        :title="t('incident.detailRca')"
                      ><FileText class="w-3 h-3" /> RCA</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-white">
            <span class="text-[11px] font-mono text-zinc-500">{{ t('incident.showing', {from: (currentPage-1)*itemsPerPage + 1, to: Math.min(currentPage*itemsPerPage, filteredIncidents.length), total: filteredIncidents.length}) }}</span>
            <div class="flex items-center gap-1">
              <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1" class="px-2.5 py-1 rounded-lg text-xs border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">‹ Prev</button>
              <span class="px-2 text-[11px] font-mono text-zinc-600">{{ currentPage }} / {{ totalPages }}</span>
              <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages" class="px-2.5 py-1 rounded-lg text-xs border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Next ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Timeline Modal -->
    <div v-if="isUpdateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isUpdateModalOpen = false">
      <div class="w-full max-w-md double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 class="text-sm font-bold text-zinc-900">{{ t('incident.modal.updateTitle') }}</h3>
            <button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer" @click="isUpdateModalOpen = false">&times;</button>
          </div>
          <form @submit.prevent="submitTimelineUpdate" class="space-y-3.5">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">{{ t('incident.modal.statusLabel') }}</label>
              <select v-model="updateForm.status" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white">
                <option value="investigating">{{ t('incident.modal.investigating') }}</option>
                <option value="identified">{{ t('incident.modal.identified') }}</option>
                <option value="monitoring">{{ t('incident.modal.monitoring') }}</option>
                <option value="resolved">{{ t('incident.modal.resolved') }}</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">{{ t('incident.modal.messageLabel') }}</label>
              <textarea 
                v-model="updateForm.message" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="4" 
                :placeholder="t('incident.modal.messagePlaceholder')" 
                required
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors" @click="isUpdateModalOpen = false">{{ t('incident.modal.cancel') }}</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">{{ t('incident.modal.submitUpdate') }}</button>
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
            <h3 class="text-sm font-bold text-zinc-900">{{ t('incident.modal.createTitle') }}</h3>
            <button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer" @click="isCreateModalOpen = false">&times;</button>
          </div>
          <form @submit.prevent="submitNewIncident" class="space-y-3.5">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">{{ t('incident.modal.titleLabel') }}</label>
              <input 
                v-model="createForm.title" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                :placeholder="t('incident.modal.titlePlaceholder')" 
                required 
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">{{ t('incident.modal.monitorLabel') }}</label>
              <select v-model="createForm.monitor_id" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white">
                <option value="">{{ t('incident.modal.allSystemOption') }}</option>
                <option v-for="m in monitors" :key="m.id" :value="m.id">{{ m.name }} ({{ m.type.toUpperCase() }})</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">{{ t('incident.modal.statusInitialLabel') }}</label>
              <select v-model="createForm.status" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white">
                <option value="investigating">Investigating</option>
                <option value="identified">Identified</option>
                <option value="monitoring">Monitoring</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">{{ t('incident.modal.initialMessageLabel') }}</label>
              <textarea 
                v-model="createForm.initial_message" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="3" 
                :placeholder="t('incident.modal.initialMessagePlaceholder')" 
                required
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors" @click="isCreateModalOpen = false">{{ t('incident.modal.cancel') }}</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm cursor-pointer">{{ t('incident.modal.submitDeclare') }}</button>
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
              <h3 class="text-sm font-bold text-zinc-900">{{ t('incident.modal.rcaTitle') }}</h3>
              <p class="text-[11px] text-zinc-400 mt-0.5">{{ t('incident.modal.rcaIncident', {title: selectedIncident?.title || '-'}) }}</p>
            </div>
            <button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer" @click="isPostMortemModalOpen = false">&times;</button>
          </div>

          <form @submit.prevent="submitPostMortem" class="space-y-3.5">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5"><ClipboardList class="w-3.5 h-3.5 text-zinc-400" /> {{ t('incident.modal.rootCauseLabel') }}</label>
              <textarea 
                v-model="postMortemForm.root_cause" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="3" 
                :placeholder="t('incident.modal.rootCausePlaceholder')" 
                required
              ></textarea>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5"><FileText class="w-3.5 h-3.5 text-zinc-400" /> {{ t('incident.modal.preventionLabel') }}</label>
              <textarea 
                v-model="postMortemForm.prevention_plan" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" 
                rows="3" 
                :placeholder="t('incident.modal.preventionPlaceholder')"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors" @click="isPostMortemModalOpen = false">{{ t('incident.modal.cancel') }}</button>
              <button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">{{ t('incident.modal.saveRca') }}</button>
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
import { Activity, AlertTriangle, BarChart3, Globe, Settings, Clock, FileText, ClipboardList, CircleCheck, Timer, SearchX, Sparkles, Info, Plus } from 'lucide-vue-next';
import AppNavbar from './AppNavbar.vue';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../lib/i18n';
const { t, locale } = useI18n();

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

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(10);

const resolvedIncidents = computed(() => incidents.value.filter(i => i.status === 'resolved'));

const groupedResolvedIncidents = computed(() => {
  const map = {};
  for (const inc of resolvedIncidents.value) {
    const key = inc.monitor_id || 'system';
    const name = inc.monitor_name || t('incident.fallbackSystemLong');
    if (!map[key]) {
      map[key] = {
        monitor_id: key,
        monitor_name: name,
        incidents: []
      };
    }
    map[key].incidents.push(inc);
  }
  return Object.values(map);
});

const isUpdateModalOpen = ref(false);
const isCreateModalOpen = ref(false);
const selectedIncident = ref(null);

const isPostMortemModalOpen = ref(false);
const selectedPostMortemIncident = ref(null);
const isSavingPostMortem = ref(false);
const postMortemForm = ref({ root_cause: '', action_items: '', prevention_plan: '' });

const updateForm = ref({ status: 'investigating', message: '' });
const createForm = ref({ title: '', monitor_id: '', status: 'investigating', initial_message: '' });

const activeIncidents = computed(() => incidents.value.filter(i => i.status !== 'resolved'));

const filteredIncidents = computed(() => {
  if (statusFilter.value === 'active') return activeIncidents.value;
  if (statusFilter.value === 'resolved') return resolvedIncidents.value;
  return incidents.value;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredIncidents.value.length / itemsPerPage.value)));
const paginatedIncidents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredIncidents.value.slice(start, start + itemsPerPage.value);
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
async function submitPostMortem() { return savePostMortem(); }

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
      createForm.value = { title: '', monitor_id: '', status: 'investigating', initial_message: '' };
      fetchIncidents();
    }
  } catch (err) {
    console.error('Create incident error:', err);
  }
}

function formatDuration(startedAt, resolvedAt) {
  if (!resolvedAt) return t('common.ongoing');
  const start = new Date(startedAt).getTime();
  const end = new Date(resolvedAt).getTime();
  const diffMins = Math.round((end - start) / 60000);
  if (diffMins < 60) return t('incident.durationMinutes', {count: diffMins});
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return t('incident.durationHoursMinutes', {h: hours, m: mins});
}

onMounted(() => {
  
  fetchIncidents();
  fetchMonitors();
});
</script>
