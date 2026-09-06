<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
      <AppNavbar :current-user="props.currentUser" active-tab="audit" :subtitle="`| ${t('audit.title')}`" />

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs">
        <div class="px-1">
          <h2 class="text-sm font-bold tracking-tight">{{ t('audit.trailTitle') }}</h2>
          <p class="text-[11px] text-zinc-500 mt-0.5">{{ t('audit.trailDesc') }}</p>
        </div>
        <div class="flex items-center gap-2 text-[11px] font-mono">
          <span class="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200">{{ filteredLogs.length }} {{ t('audit.logs') }}</span>
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">{{ todayCount }} {{ t('audit.today') }}</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs">
        <div class="relative w-full sm:w-72">
          <ScrollText class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input v-model="search" :placeholder="t('audit.searchPlaceholder')" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" />
        </div>
        <div class="flex items-center gap-2">
          <select v-model="filterAction" class="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <option value="">{{ t('audit.allActions') }}</option>
            <option v-for="a in uniqueActions" :key="a" :value="a">{{ a }}</option>
          </select>
          <select v-model.number="pageSize" class="bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1.5 text-xs">
            <option :value="10">10</option><option :value="25">25</option><option :value="50">50</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="double-bezel">
        <div class="double-bezel-inner p-1 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-zinc-100 bg-zinc-50/50">
                  <th class="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 w-[52px]">No</th>
                  <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{{ t('audit.table.time') }}</th>
                  <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{{ t('audit.table.action') }}</th>
                  <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{{ t('audit.table.resource') }}</th>
                  <th class="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{{ t('audit.table.detail') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 bg-white">
                <tr v-if="loading">
                  <td colspan="5" class="px-4 py-10 text-center"><div class="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div></td>
                </tr>
                <tr v-else-if="paginated.length===0">
                  <td colspan="5" class="px-4 py-10 text-center text-xs text-zinc-400">{{ t('audit.noFilter') }}</td>
                </tr>
                <tr v-else v-for="(log, idx) in paginated" :key="log.id" class="hover:bg-zinc-50/50">
                  <td class="px-3 py-2.5 text-xs font-mono text-zinc-500">{{ (currentPage-1)*pageSize + idx +1 }}</td>
                  <td class="px-4 py-2.5 text-xs font-mono text-zinc-600 whitespace-nowrap">{{ new Date(log.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID') }}</td>
                  <td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border" :class="badgeClass(log.action)">{{ log.action }}</span></td>
                  <td class="px-4 py-2.5 text-xs font-mono">{{ log.resource_type || '-' }} <span class="text-zinc-400">·</span> {{ log.resource_id ? log.resource_id.slice(0,8) : '-' }}</td>
                  <td class="px-4 py-2.5 text-xs font-mono text-zinc-500 max-w-[320px] truncate" :title="JSON.stringify(log.metadata)">{{ formatMeta(log.metadata) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPages>1" class="flex items-center justify-between px-3 py-2.5 border-t border-zinc-100 bg-zinc-50/30 text-xs">
            <span class="font-mono text-zinc-500">{{ t('audit.pagination', {current: currentPage, total: totalPages, count: filteredLogs.length}) }}</span>
            <div class="flex items-center gap-1">
              <button @click="currentPage=Math.max(1,currentPage-1)" :disabled="currentPage===1" class="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">‹ Prev</button>
              <button @click="currentPage=Math.min(totalPages,currentPage+1)" :disabled="currentPage===totalPages" class="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">Next ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 text-[11px] text-zinc-400 font-mono">{{ t('audit.footer') }}</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ScrollText } from 'lucide-vue-next';
import AppNavbar from './AppNavbar.vue';
import { useI18n } from '../../lib/i18n';
const { t, locale } = useI18n();

const props = defineProps({ currentUser: Object });

const logs = ref([]);
const loading = ref(true);
const search = ref('');
const filterAction = ref('');
const currentPage = ref(1);
const pageSize = ref(25);

const uniqueActions = computed(() => [...new Set(logs.value.map(l=>l.action))].sort());

const filteredLogs = computed(() => {
  return logs.value.filter(l=>{
    if(filterAction.value && l.action!==filterAction.value) return false;
    if(search.value){
      const q=search.value.toLowerCase();
      return l.action.toLowerCase().includes(q) || (l.resource_type||'').toLowerCase().includes(q) || JSON.stringify(l.metadata).toLowerCase().includes(q);
    }
    return true;
  });
});
const totalPages = computed(()=> Math.max(1, Math.ceil(filteredLogs.value.length/pageSize.value)));
const paginated = computed(()=> {
  const s=(currentPage.value-1)*pageSize.value;
  return filteredLogs.value.slice(s, s+pageSize.value);
});
const todayCount = computed(()=>{
  const today=new Date().toDateString();
  return logs.value.filter(l=> new Date(l.created_at).toDateString()===today).length;
});

watch([search, filterAction], ()=> currentPage.value=1);
watch(filteredLogs, ()=> { if(currentPage.value>totalPages.value) currentPage.value=totalPages.value; });

function badgeClass(action){
  if(action.includes('login') || action.includes('auth')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if(action.includes('delete') || action.includes('remove')) return 'bg-rose-50 text-rose-700 border-rose-200';
  if(action.includes('api_sync') || action.includes('import')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-zinc-100 text-zinc-700 border-zinc-200';
}
function formatMeta(m){
  try{ const s=JSON.stringify(m); return s.length>120 ? s.slice(0,120)+'…' : s; }catch{ return '-' }
}

async function fetchLogs(){
  loading.value=true;
  try{ const r=await fetch('/api/v1/audit-logs'); if(r.ok) logs.value=await r.json(); }catch(e){ console.error(e);} finally{ loading.value=false; }
}
onMounted(fetchLogs);
</script>
