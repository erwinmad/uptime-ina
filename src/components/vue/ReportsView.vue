<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col justify-between selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
      <!-- Top Floating Navigation Bar -->
          <!-- App Navbar -->
    <AppNavbar 
      :current-user="props.currentUser" 
      active-tab="reports" 
      :subtitle="`| ${t('reports.title')}`"
    >
    </AppNavbar>

      <!-- Title & Executive Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs">
        <div class="px-1">
          <h2 class="text-sm font-bold text-zinc-900 tracking-tight">{{ t('reports.slaReport') }}</h2>
          <p class="text-[11px] text-zinc-500 mt-0.5">{{ t('reports.slaReport') }} — availability, downtime & error budget.</p>
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
              <Printer class="w-3.5 h-3.5 text-zinc-500" />
              <span>{{ t('reports.printBrowser') }}</span>
            </button>
            <a 
              :href="`/api/v1/reports/pdf?range=${selectedRange}&sla=${targetSla}`"
              download
              class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Download class="w-3.5 h-3.5" />
              <span>{{ t('reports.downloadPdf') }}</span>
            </a>
            <button 
              @click="exportCsv"
              class="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600" />
              <span>{{ t('reports.exportCsv') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Executive Stat Strip (6 Cards) — stretch equal height -->
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 auto-rows-fr items-stretch">
        <div class="double-bezel h-full">
          <div class="double-bezel-inner p-4 space-y-1.5 h-full flex flex-col">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>{{ t('reports.complianceTitle') }}</span>
              <span class="px-1.5 py-0.5 rounded text-[8px] bg-zinc-100 border border-zinc-200">Target {{ targetSla }}%</span>
            </div>
            <div class="text-xl font-black font-mono tracking-tight" :class="overallSlaPercentage >= Number(targetSla) ? 'text-emerald-600' : 'text-amber-600'">
              {{ overallSlaPercentage }}%
            </div>
            <div class="text-[10px] text-zinc-400 mt-auto">{{ complianceRate }}% layanan memenuhi · {{ metCount }} / {{ monitorsList.length }}</div>
          </div>
        </div>
        <div class="double-bezel h-full">
          <div class="double-bezel-inner p-4 space-y-1.5 h-full flex flex-col">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Compliance Rate</span>
              <TrendingDown class="w-3 h-3 text-zinc-400" />
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-black font-mono tracking-tight text-zinc-900">{{ metCount }}</span>
              <span class="text-xs text-zinc-400">/ {{ monitorsList.length }} lulus</span>
            </div>
            <div class="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden flex mt-auto">
              <div class="bg-emerald-500 h-full" :style="{ width: (monitorsList.length? metCount/monitorsList.length*100:0)+'%' }"></div>
              <div class="bg-amber-400 h-full" :style="{ width: (monitorsList.length? riskCount/monitorsList.length*100:0)+'%' }"></div>
              <div class="bg-rose-500 h-full" :style="{ width: (monitorsList.length? breachedCount/monitorsList.length*100:0)+'%' }"></div>
            </div>
          </div>
        </div>
        <div class="double-bezel h-full">
          <div class="double-bezel-inner p-4 space-y-1.5 h-full flex flex-col">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Total Downtime</span>
              <Clock class="w-3 h-3 text-zinc-400" />
            </div>
            <div class="text-xl font-black font-mono tracking-tight" :class="totalDowntimeMinutes > 0 ? 'text-rose-600' : 'text-emerald-600'">
              {{ totalDowntimeMinutes }} <span class="text-sm font-normal text-zinc-400">mnt</span>
            </div>
            <div class="text-[10px] text-zinc-400 mt-auto">Estimasi {{ selectedRange }} · avg {{ monitorsList.length? (totalDowntimeMinutes/monitorsList.length).toFixed(1):0 }} mnt/layanan</div>
          </div>
        </div>
        <div class="double-bezel h-full">
          <div class="double-bezel-inner p-4 space-y-1.5 h-full flex flex-col">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Error Budget</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded-full border" :class="errorBudgetRemainingMin >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'">{{ errorBudgetRemainingMin >=0 ? t('reports.safe') : t('reports.breached') }}</span>
            </div>
            <div class="text-xl font-black font-mono tracking-tight" :class="errorBudgetRemainingMin >= 0 ? 'text-zinc-900' : 'text-rose-600'">
              {{ Math.max(0, errorBudgetRemainingMin) }} <span class="text-sm font-normal text-zinc-400">mnt sisa</span>
            </div>
            <div class="text-[10px] mt-auto" :class="errorBudgetRemainingMin >= 0 ? 'text-zinc-400' : 'text-rose-500 font-medium'">
              {{ errorBudgetRemainingMin >= 0 ? `dari ${totalAllowedDowntimeMin} mnt` : `kelebihan ${Math.abs(errorBudgetRemainingMin)} mnt` }}
            </div>
          </div>
        </div>
        <div class="double-bezel h-full">
          <div class="double-bezel-inner p-4 space-y-1.5 h-full flex flex-col">
            <div class="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
              <span>Insiden</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">{{ riskCount }} risk · {{ breachedCount }} breach</span>
            </div>
            <div class="text-xl font-black font-mono tracking-tight" :class="totalIncidents > 0 ? 'text-zinc-900' : 'text-emerald-600'">
              {{ totalIncidents }}
            </div>
            <div class="text-[10px] text-zinc-400 mt-auto">MTTR avg: {{ monitorsList.length ? Math.round(monitorsList.reduce((a,m)=>a+(m.mttr_minutes||0),0)/Math.max(1,monitorsList.length)) : 0 }} mnt</div>
          </div>
        </div>
        <div class="double-bezel h-full">
          <div class="double-bezel-inner p-4 space-y-1.5 h-full flex flex-col">
            <div class="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Unggulan</div>
            <div class="flex items-center gap-1.5 text-xl font-black font-mono tracking-tight text-amber-600">
              <Star class="w-4 h-4 fill-amber-400 text-amber-500" /> {{ monitorsList.filter(m=>m.is_featured).length }}
            </div>
            <div class="text-[10px] text-zinc-400 mt-auto">{{ monitorsList.filter(m=>m.is_featured && m.uptime_percentage < Number(targetSla)).length }} unggulan melanggar</div>
          </div>
        </div>
      </div>

      <!-- Main Grid: Table 9 + Insights 3 — stretch -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <!-- Left: Toolbar + Table (9) -->
        <div class="lg:col-span-9 space-y-3 flex flex-col">
          <!-- Toolbar Filter Pencarian -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs print:hidden">
            <div class="relative w-full sm:w-72">
              <span class="absolute left-3 top-2 text-xs text-zinc-400">🔍</span>
              <input 
                v-model="searchQuery" 
                :placeholder="t('dashboard.searchPlaceholder')" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-400 transition-all" 
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-900 font-bold">&times;</button>
            </div>

            <div class="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl text-xs font-medium overflow-x-auto">
              <button 
                @click="statusFilter = 'all'"
                class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                :class="statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-sm font-bold border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-900'"
              >
                <span>{{ t('common.all') }} ({{ monitorsList.length }})</span>
              </button>
              <button 
                @click="statusFilter = 'featured'"
                class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                :class="statusFilter === 'featured' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200 font-bold' : 'text-zinc-500 hover:text-amber-700'"
              >
                <Star class="w-3.5 h-3.5" :class="statusFilter === 'featured' ? 'fill-amber-400 text-amber-500' : 'text-zinc-400'" />
                <span>{{ t('reports.featured') }}</span>
              </button>
              <button 
                @click="statusFilter = 'passing'"
                class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                :class="statusFilter === 'passing' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200 font-bold' : 'text-zinc-500 hover:text-emerald-700'"
              >
                <CheckCircle class="w-3.5 h-3.5" :class="statusFilter === 'passing' ? 'text-emerald-600' : 'text-emerald-500/50'" />
                <span>{{ t('common.yes') }}</span>
              </button>
              <button 
                @click="statusFilter = 'failing'"
                class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                :class="statusFilter === 'failing' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200 font-bold' : 'text-zinc-500 hover:text-rose-700'"
              >
                <XCircle class="w-3.5 h-3.5" :class="statusFilter === 'failing' ? 'text-rose-600' : 'text-rose-500/50'" />
                <span>{{ t('reports.failing') }}</span>
              </button>
            </div>
          </div>

          <!-- Detailed Breakdown Table -->
          <div class="double-bezel">
      <div class="double-bezel-inner p-1 overflow-hidden">
        <div class="flex items-center justify-between px-3 py-2 border-b border-zinc-100 bg-zinc-50/30 text-[11px]">
          <span class="font-mono text-zinc-500">{{ t('reports.showing', {count: paginatedMonitors.length, total: sortedMonitors.length, current: currentPage, totalPages: totalPages, field: sortField, dir: sortDir==='asc'?'↑':'↓'}) }} · {{ t('reports.featuredBadge') }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-zinc-500">{{ t('common.filter') }}:</span>
            <select v-model.number="pageSize" class="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold">
              <option :value="5">5</option><option :value="10">10</option><option :value="25">25</option><option :value="50">50</option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-zinc-100 bg-zinc-50/50">
                <th class="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 w-[52px]">No</th>
                <th @click="toggleSort('name')" class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 cursor-pointer select-none hover:text-zinc-900 w-1/3">{{ t('reports.table.service') }} <ArrowUpDown class="inline w-3 h-3 ml-1 opacity-40" /></th>
                <th @click="toggleSort('uptime_percentage')" class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 cursor-pointer select-none hover:text-zinc-900">{{ t('reports.table.uptime') }} <ArrowUpDown class="inline w-3 h-3 ml-1 opacity-40" /></th>
                <th @click="toggleSort('downtime_minutes')" class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 cursor-pointer select-none hover:text-zinc-900">{{ t('reports.table.downtime') }} <ArrowUpDown class="inline w-3 h-3 ml-1 opacity-40" /></th>
                <th @click="toggleSort('incident_count')" class="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 cursor-pointer select-none hover:text-zinc-900">{{ t('reports.table.incidents') }} <ArrowUpDown class="inline w-3 h-3 ml-1 opacity-40" /></th>
                <th class="px-3 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500">{{ t('reports.table.latency') }}</th>
                <th class="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 relative group/tooltip">
                  {{ t('reports.table.errorBudget') }}
                  <span class="ml-1 cursor-help opacity-60">ℹ️</span>
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 text-white text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity font-normal normal-case leading-relaxed shadow-xl z-50">
                    {{ t('reports.tooltipBudget') }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900"></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 bg-white">
              <tr v-if="isLoading">
                <td colspan="7" class="px-4 py-10 text-center">
                  <div class="flex flex-col items-center gap-2 text-zinc-400">
                    <div class="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                    <span class="text-xs font-mono">{{ t('common.loading') }}</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="paginatedMonitors.length === 0">
                <td colspan="7" class="px-4 py-10 text-center text-xs text-zinc-400 font-mono">
                  {{ t('reports.noData') }}
                </td>
              </tr>
              <tr v-else v-for="(m, idx) in paginatedMonitors" :key="m.id" class="hover:bg-zinc-50/50 transition-colors" :class="m.is_featured ? 'bg-amber-50/20' : ''">
                <td class="px-3 py-3 text-xs font-mono text-zinc-500">{{ (currentPage-1)*pageSize + idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1.5">
                    <Star v-if="m.is_featured" class="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                    <span class="text-xs font-bold text-zinc-900 truncate max-w-[180px]">{{ m.name }}</span>
                  </div>
                  <div class="text-[10px] text-zinc-500 mt-0.5 font-mono truncate max-w-[220px]">{{ m.type.toUpperCase() }} · {{ m.target }} · {{ m.category_name }}</div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold" :class="m.uptime_percentage >= Number(targetSla) ? 'text-emerald-600' : 'text-rose-600'">
                      {{ m.uptime_percentage }}%
                    </span>
                    <span v-if="m.uptime_percentage < Number(targetSla)" class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200">{{ t('reports.failing') }}</span>
                    <span v-else class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">{{ t('reports.passing') }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs font-mono" :class="m.downtime_minutes > 0 ? 'text-rose-600 font-semibold' : 'text-zinc-500'">
                    {{ m.downtime_minutes }} mnt
                  </span>
                  <div class="text-[9px] font-mono text-zinc-400">{{ m.total_checks }} checks</div>
                </td>
                <td class="px-3 py-3 text-center">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full border" :class="m.incident_count>0 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-500 border-zinc-200'">{{ m.incident_count }}x</span>
                  <div class="text-[9px] font-mono text-zinc-400 mt-0.5">MTTR {{ m.mttr_minutes }}m</div>
                </td>
                <td class="px-3 py-3 text-xs font-mono">
                  <span :class="m.avg_latency_ms>500 ? 'text-amber-600 font-bold' : 'text-zinc-700'">{{ m.avg_latency_ms }}ms</span>
                  <div class="text-[9px] text-zinc-400">{{ m.min_latency_ms }}–{{ m.max_latency_ms }}ms</div>
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
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-3 py-2.5 border-t border-zinc-100 bg-zinc-50/30 text-xs">
          <span class="font-mono text-zinc-500">{{ t('common.page', {current: currentPage, total: totalPages}) }} · {{ sortedMonitors.length }} {{ t('common.total', {count: sortedMonitors.length}).split(':')[1] || 'services' }}</span>
          <div class="flex items-center gap-1">
            <button @click="currentPage=Math.max(1,currentPage-1)" :disabled="currentPage===1" class="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40 hover:bg-zinc-50">‹ Prev</button>
            <template v-for="p in totalPages" :key="p">
              <button v-if="p<=3 || p>totalPages-2 || Math.abs(p-currentPage)<=1" @click="currentPage=p" class="w-7 h-7 rounded-lg font-mono text-xs border" :class="p===currentPage ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white hover:bg-zinc-100 border-zinc-200'">{{ p }}</button>
              <span v-else-if="p===4 && currentPage>5 || p===totalPages-2 && currentPage<totalPages-4" class="px-1 text-zinc-400">…</span>
            </template>
            <button @click="currentPage=Math.min(totalPages,currentPage+1)" :disabled="currentPage===totalPages" class="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40 hover:bg-zinc-50">Next ›</button>
          </div>
        </div>
      </div>
    </div>
        </div>
        <!-- Right: Ringkasan + Perhatian Stack (3) — stretch -->
        <div class="lg:col-span-3 flex flex-col gap-3 h-full">
          <!-- Ringkasan Kepatuhan — Donut -->
          <div class="double-bezel flex-1 flex flex-col">
            <div class="double-bezel-inner p-4 space-y-4 h-full flex flex-col">
              <h3 class="text-xs font-bold tracking-tight">{{ t('reports.complianceSummary') }}</h3>
              <div class="flex items-center gap-4">
                <!-- Donut -->
                <div class="relative w-[110px] h-[110px] shrink-0">
                  <div class="absolute inset-0 rounded-full" :style="{ background: donutStats.gradient }"></div>
                  <div class="absolute inset-[12px] rounded-full bg-white flex flex-col items-center justify-center">
                    <span class="text-[10px] font-bold tracking-widest text-zinc-400">TOTAL</span>
                    <span class="text-xl font-black font-mono leading-none">{{ monitorsList.length }}</span>
                    <span class="text-[9px] font-mono text-zinc-400">{{ complianceRate }}% patuh</span>
                  </div>
                </div>
                <!-- Legend -->
                <div class="flex-1 space-y-2">
                  <div class="flex items-center justify-between text-xs p-2 rounded-lg border" :class="metCount>0?'bg-emerald-50 border-emerald-200':'bg-zinc-50 border-zinc-200 opacity-60'">
                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {{ t('reports.passing') }}</span>
                    <span class="font-mono font-black">{{ metCount }} <span class="font-normal text-zinc-500">({{ donutStats.metPct.toFixed(0) }}%)</span></span>
                  </div>
                  <div class="flex items-center justify-between text-xs p-2 rounded-lg border" :class="riskCount>0?'bg-amber-50 border-amber-200':'bg-zinc-50 border-zinc-200 opacity-60'">
                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> {{ t('reports.risk') }}</span>
                    <span class="font-mono font-black">{{ riskCount }} <span class="font-normal text-zinc-500">({{ donutStats.riskPct.toFixed(0) }}%)</span></span>
                  </div>
                  <div class="flex items-center justify-between text-xs p-2 rounded-lg border" :class="breachedCount>0?'bg-rose-50 border-rose-200':'bg-zinc-50 border-zinc-200 opacity-60'">
                    <span class="flex items-center gap-1.5 font-medium"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> {{ t('reports.failing') }}</span>
                    <span class="font-mono font-black">{{ breachedCount }} <span class="font-normal text-zinc-500">({{ donutStats.breachPct.toFixed(0) }}%)</span></span>
                  </div>
                </div>
              </div>
              <div class="text-[11px] leading-relaxed p-2.5 rounded-xl border" :class="breachedCount>0 ? 'bg-rose-50 border-rose-200 text-rose-800' : riskCount>0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'">
                <template v-if="breachedCount>0">⚠️ {{ t('reports.budgetBreach', {count: breachedCount, sla: targetSla}) }}</template>
                <template v-else-if="riskCount>0">ℹ️ {{ t('reports.budgetRisk', {count: riskCount}) }}</template>
                <template v-else>✅ {{ t('reports.budgetAllOk') }}</template>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-auto pt-1">
                <span class="text-[10px] font-bold text-zinc-500">Top performer:</span>
                <span v-for="m in bestPerformers" :key="m.id" class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-mono">{{ m.name }} {{ m.uptime_percentage }}%</span>
              </div>
            </div>
          </div>
          <!-- Perhatian Segera — stretch -->
          <div class="double-bezel flex-1 flex flex-col">
            <div class="double-bezel-inner p-4 space-y-3 h-full flex flex-col">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold tracking-tight">{{ t('reports.attentionTitle') }}</h3>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">{{ worstPerformers.length }}</span>
              </div>
              <div v-if="worstPerformers.length===0" class="text-xs text-zinc-400 py-6 text-center flex-1 flex items-center justify-center">Semua layanan di atas target.</div>
              <div v-else class="space-y-2 flex-1">
                <div v-for="m in worstPerformers" :key="m.id" class="flex items-center justify-between p-2.5 rounded-xl border bg-white hover:bg-zinc-50 transition-colors" :class="m.is_featured ? 'border-amber-200 bg-amber-50/20' : 'border-zinc-200'">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <Star v-if="m.is_featured" class="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                      <span class="text-xs font-bold truncate">{{ m.name }}</span>
                    </div>
                    <div class="text-[11px] font-mono" :class="m.uptime_percentage < Number(targetSla) ? 'text-rose-600 font-bold' : 'text-zinc-500'">{{ m.uptime_percentage }}% · {{ m.downtime_minutes }}m · {{ m.incident_count }} insiden</div>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-1 rounded-full border ml-2 whitespace-nowrap" :class="m.compliance_status==='breached' ? 'bg-rose-500 text-white border-rose-600' : m.compliance_status==='risk' ? 'bg-amber-400 text-white border-amber-500' : 'bg-emerald-500 text-white border-emerald-600'">{{ m.compliance_status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footnote for printing and structural bottom -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 print:block mt-auto">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>{{ t('common.loading') }}: {{ generatedDateStr }}</p>
        <p><span>{{ branding.footer_text || 'Powered by deTAK — Observability Platform' }}</span></p><div class="flex items-center gap-2 flex-wrap"><a href="https://github.com/erwinmad/uptime-ina" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-2">GitHub ↗</a><span class="opacity-30">·</span><span>© 2026 deTAK</span></div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Activity, AlertTriangle, BarChart3, Globe, Settings, Printer, Download, FileSpreadsheet, Clock, TrendingDown, CheckCircle, XCircle, Star, ArrowUpDown } from 'lucide-vue-next';
import AppNavbar from './AppNavbar.vue';
import { useI18n } from '../../lib/i18n';
const { t, locale } = useI18n();

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => null
  }
});

const branding = ref({
  app_name: 'deTAK',
  app_tagline: 'Platform Observabilitas & Pemantauan Ketersediaan Layanan',
  footer_text: 'Powered by deTAK — Uptime & Observability Platform',
  logo_icon: '🌐'
});

const selectedRange = ref('30d');
const targetSla = ref('99.9');
const reportData = ref(null);
const isLoading = ref(false);

const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const sortField = ref('featured'); // featured | uptime_percentage | downtime_minutes | incident_count | name
const sortDir = ref('desc');

const overallSlaPercentage = computed(() => reportData.value?.summary?.overall_sla_percentage ?? reportData.value?.summary?.global_uptime_percentage ?? 100);
const totalDowntimeMinutes = computed(() => reportData.value?.summary?.total_downtime_minutes || 0);
const errorBudgetRemainingMin = computed(() => reportData.value?.summary?.error_budget_remaining_minutes || 0);
const totalAllowedDowntimeMin = computed(() => reportData.value?.summary?.total_allowed_downtime_minutes ?? reportData.value?.allowed_downtime_minutes ?? 0);
const totalIncidents = computed(() => reportData.value?.summary?.total_incidents || 0);
const complianceRate = computed(() => reportData.value?.summary?.compliance_rate || 0);
const metCount = computed(() => reportData.value?.summary?.met_count ?? monitorsList.value.filter(m => m.compliance_status === 'met').length);
const riskCount = computed(() => reportData.value?.summary?.risk_count ?? monitorsList.value.filter(m => m.compliance_status === 'risk').length);
const breachedCount = computed(() => reportData.value?.summary?.breached_count ?? monitorsList.value.filter(m => m.compliance_status === 'breached').length);
const monitorsList = computed(() => reportData.value?.monitors || []);

const filteredMonitors = computed(() => {
  return monitorsList.value.filter(m => {
    if (statusFilter.value === 'featured' && !m.is_featured) return false;
    if (statusFilter.value === 'passing' && m.uptime_percentage < Number(targetSla.value)) return false;
    if (statusFilter.value === 'failing' && m.uptime_percentage >= Number(targetSla.value)) return false;
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase().trim();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.target?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q) ||
        m.category_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });
});

const sortedMonitors = computed(() => {
  const arr = [...filteredMonitors.value];
  arr.sort((a,b) => {
    // Inactive selalu paling bawah: featured (active) → non-featured (active) → nonaktif
    const prio = (m) => !m.active ? 2 : (m.is_featured ? 0 : 1);
    const pa = prio(a), pb = prio(b);
    if (pa !== pb) return pa - pb;
    if (sortField.value === 'featured') {
      return sortDir.value === 'desc' ? (b.is_featured?1:0) - (a.is_featured?1:0) : (a.is_featured?1:0) - (b.is_featured?1:0);
    }
    let av = a[sortField.value];
    let bv = b[sortField.value];
    if (sortField.value === 'name' || sortField.value === 'category_name') {
      av = String(av||'').toLowerCase(); bv = String(bv||'').toLowerCase();
      return sortDir.value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    av = Number(av||0); bv = Number(bv||0);
    return sortDir.value === 'asc' ? av - bv : bv - av;
  });
  return arr;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedMonitors.value.length / pageSize.value)));
const paginatedMonitors = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedMonitors.value.slice(start, start + pageSize.value);
});
const worstPerformers = computed(() => [...monitorsList.value].sort((a,b) => a.uptime_percentage - b.uptime_percentage).slice(0,5));
const bestPerformers = computed(() => [...monitorsList.value].sort((a,b) => b.uptime_percentage - a.uptime_percentage).slice(0,3));
const donutStats = computed(() => {
  const total = monitorsList.value.length || 1;
  const metPct = (metCount.value/total)*100;
  const riskPct = (riskCount.value/total)*100;
  const breachPct = (breachedCount.value/total)*100;
  const metEnd = metPct;
  const riskEnd = metPct + riskPct;
  // handle 0 cases to avoid empty gradient artifacts
  if (total===0 || (metCount.value===0 && riskCount.value===0 && breachedCount.value===0)) return { metPct:0, riskPct:0, breachPct:0, gradient: 'conic-gradient(#e4e4e7 0 100%)', total:0 };
  return {
    metPct, riskPct, breachPct, total,
    gradient: `conic-gradient(#10b981 0 ${metEnd}%, #f59e0b ${metEnd}% ${riskEnd}%, #ef4444 ${riskEnd}% 100%)`
  };
});

watch([searchQuery, statusFilter, sortField, sortDir, pageSize], () => { currentPage.value = 1; });
watch(filteredMonitors, () => { if (currentPage.value > totalPages.value) currentPage.value = totalPages.value; });

function toggleSort(field) {
  if (sortField.value === field) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortField.value = field; sortDir.value = field === 'name' ? 'asc' : 'desc'; }
}

function budgetPercentage(usedMin) {
  if (totalAllowedDowntimeMin.value === 0) return 0;
  return Math.min(100, Number(((usedMin / totalAllowedDowntimeMin.value) * 100).toFixed(1)));
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
  return new Date().toLocaleString(locale === 'en' ? 'en-US' : 'id-ID', { dateStyle: 'full', timeStyle: 'short' });
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
    [t('reports.csvHeaders.serviceName'), t('reports.csvHeaders.type'), t('reports.csvHeaders.target'), t('reports.csvHeaders.status'), t('reports.csvHeaders.uptime'), t('reports.csvHeaders.targetSla'), t('reports.csvHeaders.downtime'), t('reports.csvHeaders.errorBudget'), t('reports.csvHeaders.avgLatency'), t('reports.csvHeaders.incidentCount'), t('reports.csvHeaders.mttr'), t('reports.csvHeaders.compliance')]
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
