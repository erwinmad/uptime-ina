<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
    <!-- Toast Notification System -->
    <ToastContainer ref="toastRef" />

    <!-- Top Floating Navigation Bar -->
        <!-- App Navbar -->
    <AppNavbar 
      :current-user="props.currentUser" 
      active-tab="dashboard" 
      subtitle=""
      :is-connected="isConnected"
      :active-incidents-count="activeIncidentsCount"
    />

    <!-- Comprehensive KPI Strip (6 Cards) -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 auto-rows-fr items-stretch">
      <div class="double-bezel h-full">
        <div class="double-bezel-inner p-3.5 space-y-1 h-full flex flex-col">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">{{ t('dashboard.systemStatus') }} <Activity class="w-3 h-3 text-zinc-300" /></div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="downCount > 0 ? 'bg-rose-500 animate-pulse' : (pendingCount > 0 ? 'bg-amber-400' : 'bg-emerald-500')"></span>
            <span class="text-base font-bold tracking-tight" :class="downCount > 0 ? 'text-rose-600' : (pendingCount > 0 ? 'text-amber-600' : 'text-emerald-700')">{{ overallHealthText }}</span>
          </div>
          <div class="text-[10px] text-zinc-500 font-mono mt-auto">
            <template v-if="downCount > 0">{{ t('dashboard.downIssues', {down: downCount, up: upCount}) }}</template>
            <template v-else-if="pendingCount > 0">{{ t('dashboard.waitingChecks', {count: pendingCount}) }}</template>
            <template v-else>{{ t('dashboard.allNormal', {count: activeMonitorsList.length}) }}</template>
          </div>
        </div>
      </div>
      <div class="double-bezel h-full">
        <div class="double-bezel-inner p-3.5 space-y-1 h-full flex flex-col">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">{{ t('dashboard.uptime24h') }} <TrendingDown class="w-3 h-3 text-zinc-300" /></div>
          <div class="text-base font-bold text-zinc-900 tracking-tight font-mono">{{ overallUptime }}%</div>
          <div class="text-[10px] text-zinc-500 font-mono mt-auto">{{ t('dashboard.activeInactive', {active: activeMonitorsList.length, inactive: inactiveCount}) }}</div>
        </div>
      </div>
      <div class="double-bezel h-full">
        <div class="double-bezel-inner p-3.5 space-y-1 h-full flex flex-col">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">{{ t('dashboard.avgResponse') }} <Timer class="w-3 h-3 text-zinc-300" /></div>
          <div class="text-base font-bold text-zinc-900 tracking-tight font-mono">{{ avgLatency }} <span class="text-xs font-normal text-zinc-400">ms</span></div>
          <div class="text-[10px] text-zinc-500 font-mono mt-auto">{{ t('dashboard.p95min', {p95: p95Latency, min: minLatency}) }}</div>
        </div>
      </div>
      <div class="double-bezel h-full">
        <div class="double-bezel-inner p-3.5 space-y-1 h-full flex flex-col">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">{{ t('dashboard.openIncidents') }} <Siren class="w-3 h-3 text-zinc-300" /></div>
          <div class="text-base font-bold tracking-tight font-mono" :class="activeIncidentsCount > 0 ? 'text-rose-600' : 'text-zinc-900'">{{ activeIncidentsCount }}</div>
          <div class="text-[10px] text-zinc-500 font-mono mt-auto">{{ t('dashboard.downPaused', {down: downCount, paused: pausedCount}) }}</div>
        </div>
      </div>
      <div class="double-bezel h-full">
        <div class="double-bezel-inner p-3.5 space-y-1 h-full flex flex-col">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">{{ t('dashboard.featured') }} <span class="px-1.5 py-px rounded text-[7px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{{ t('dashboard.featured').toUpperCase() }}</span></div>
          <div class="flex items-center gap-1.5 text-base font-bold tracking-tight"><span class="px-1.5 py-px rounded text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{{ t('dashboard.featured').toUpperCase() }}</span> {{ featuredCount }} <span class="text-xs font-normal text-zinc-400">/ {{ activeMonitorsList.length }}</span></div>
          <div class="text-[10px] font-mono mt-auto" :class="featuredDownCount>0 ? 'text-rose-600 font-bold' : 'text-zinc-500'">{{ featuredDownCount>0 ? t('dashboard.featuredDown', {count: featuredDownCount}) : t('dashboard.allFeaturedUp') }}</div>
        </div>
      </div>
      <div class="double-bezel h-full">
        <div class="double-bezel-inner p-3.5 space-y-1 h-full flex flex-col">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">{{ t('dashboard.sslCategory') }} <ShieldCheck class="w-3 h-3 text-zinc-300" /></div>
          <div class="text-base font-bold tracking-tight font-mono" :class="sslExpiringCount>0 ? 'text-amber-600' : 'text-emerald-700'">{{ sslExpiringCount }} <span class="text-xs font-normal text-zinc-400">{{ t('dashboard.expiring') }}</span></div>
          <div class="text-[10px] text-zinc-500 font-mono mt-auto">{{ t('dashboard.categoriesTags', {categories: categoryStats.length, tags: allTags.length}) }}</div>
        </div>
      </div>
    </div>

    <!-- Global Heartbeat Strip -->
    <div class="double-bezel">
      <div class="double-bezel-inner p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3 shrink-0">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Activity class="w-4 h-4 text-emerald-600" :class="{ 'animate-pulse': isConnected }" />
          </div>
          <div>
            <div class="text-xs font-bold tracking-tight flex items-center gap-1.5">{{ t('dashboard.globalHeartbeat') }} <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" v-if="isConnected"></span></div>
            <div class="text-[11px] font-mono text-zinc-500">{{ t('dashboard.last30Checks', {status: downCount>0 ? t('dashboard.issuesCount', {count: downCount}) : t('dashboard.allUp')}) }}</div>
          </div>
        </div>
        <div class="flex-1 flex flex-col gap-1.5 min-w-0 sm:max-w-[520px] w-full">
          <div class="flex items-center gap-[2px] h-6">
            <div v-for="(bar, i) in globalHeartbeatBars" :key="i" class="flex-1 rounded-full h-full transition-all hover:opacity-80 hover:scale-y-110 cursor-pointer" :class="bar.status==='up' ? 'bg-emerald-500' : bar.status==='down' ? 'bg-rose-500' : 'bg-zinc-200'" :title="bar.label"></div>
            <div v-if="globalHeartbeatBars.length===0" class="text-[11px] text-zinc-400 w-full text-center">{{ t('dashboard.noHeartbeat') }}</div>
          </div>
          <div class="flex justify-between text-[10px] font-mono text-zinc-400"><span>{{ t('dashboard.thirtyAgo') }}</span><span>{{ isConnected ? 'LIVE' : 'OFF' }} · {{ overallUptime }}% uptime</span><span>{{ t('dashboard.now') }}</span></div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-3 sm:p-4 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      
      <!-- Left: Status Filters -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
        <button 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all" 
          :class="filterTab === 'all' ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-50 text-zinc-500 hover:text-zinc-900 border border-zinc-200'" 
          @click="filterTab = 'all'"
        >
          <span>{{ t('dashboard.allTab') }}</span>
          <span class="px-1.5 rounded-md text-[9px] font-mono" :class="filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'">{{ monitors.length }}</span>
        </button>
        <button 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all" 
          :class="filterTab === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-zinc-50 text-zinc-500 hover:text-emerald-700 border border-zinc-200'" 
          @click="filterTab = 'up'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="filterTab === 'up' ? 'bg-emerald-500' : 'bg-zinc-300'"></span>
          <span>{{ t('dashboard.operationalTab') }}</span>
          <span class="px-1.5 rounded-md text-[9px] font-mono" :class="filterTab === 'up' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'">{{ upCount }}</span>
        </button>
        <button 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all" 
          :class="filterTab === 'down' ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm' : 'bg-zinc-50 text-zinc-500 hover:text-rose-700 border border-zinc-200'" 
          @click="filterTab = 'down'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="filterTab === 'down' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-300'"></span>
          <span>{{ t('dashboard.disruptedTab') }}</span>
          <span class="px-1.5 rounded-md text-[9px] font-mono" :class="filterTab === 'down' ? 'bg-rose-200 text-rose-800' : 'bg-zinc-200 text-zinc-600'">{{ downCount }}</span>
        </button>
        <button 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all" 
          :class="filterTab === 'paused' ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm' : 'bg-zinc-50 text-zinc-500 hover:text-amber-700 border border-zinc-200'" 
          @click="filterTab = 'paused'"
        >
          <span>{{ t('dashboard.pausedTab') }}</span>
          <span class="px-1.5 rounded-md text-[9px] font-mono" :class="filterTab === 'paused' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-200 text-zinc-600'">{{ pausedCount }}</span>
        </button>
        <button 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all" 
          :class="filterTab === 'inactive' ? 'bg-zinc-200 text-zinc-900 border border-zinc-300 shadow-sm' : 'bg-zinc-50 text-zinc-500 hover:text-zinc-900 border border-zinc-200'" 
          @click="filterTab = 'inactive'"
        >
          <span>{{ t('dashboard.inactiveTab') }}</span>
          <span class="px-1.5 rounded-md text-[9px] font-mono" :class="filterTab === 'inactive' ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-200 text-zinc-600'">{{ inactiveCount }}</span>
        </button>
      </div>

      <!-- Right: Search & Tags & Add Button -->
      <div class="flex items-center gap-3">
        <!-- Search Box -->
        <div class="relative w-full sm:w-56">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            🔍
          </div>
          <input 
            v-model="searchQuery" 
            :placeholder="t('dashboard.searchPlaceholder')" 
            class="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white focus:ring-1 focus:ring-zinc-400 transition-all" 
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-900 font-bold">&times;</button>
        </div>

        <!-- Category Filter -->
        <div class="hidden lg:flex items-center gap-1.5 pl-3 border-l border-zinc-200">
          <select 
            v-model="filterCategory"
            class="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer max-w-[160px]"
          >
            <option value="">{{ t('dashboard.categoryAll') }}</option>
            <option v-for="c in availableCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <!-- is_active Filter -->
        <div class="hidden lg:flex items-center gap-1.5 pl-3 border-l border-zinc-200">
          <select 
            v-model="filterIsActive"
            class="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
          >
            <option value="all">{{ t('dashboard.statusAll') }}</option>
            <option value="active">{{ t('dashboard.active') }}</option>
            <option value="inactive">{{ t('dashboard.inactiveStatus') }}</option>
          </select>
        </div>
        <!-- Tag Filters -->
        <div v-if="allTags.length > 0" class="hidden lg:flex items-center gap-1.5 pl-3 border-l border-zinc-200">
          <select 
            v-model="filterTag"
            class="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
          >
            <option value="">{{ t('dashboard.tagAll') }}</option>
            <option v-for="t in allTags" :key="t" :value="t">#{{ t }}</option>
          </select>
        </div>

        <!-- Add Monitor Button -->
        <button 
          @click="openNewModal"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <span>+</span> <span class="hidden sm:inline">{{ t('dashboard.addMonitor') }}</span>
        </button>
      </div>
    </div>

    <!-- Monitors List Container -->
    <div class="space-y-2">
      <div v-if="loading && monitors.length === 0" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
        <div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-zinc-400 font-mono">{{ t('dashboard.loadingTelemetry') }}</p>
      </div>

      <div v-else-if="filteredMonitors.length === 0" class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-2">
        <p class="text-xs font-bold text-zinc-900">{{ t('dashboard.noMonitorsFound') }}</p>
        <p class="text-[11px] text-zinc-500">{{ t('dashboard.adjustFilter') }}</p>
        <button class="mt-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer" @click="openNewModal">
          {{ t('dashboard.addMonitorShort') }}
        </button>
      </div>

      <div v-else class="space-y-3">
        <div class="double-bezel">
          <div class="double-bezel-inner divide-y divide-zinc-100 overflow-hidden">
            <div 
              v-for="(m, index) in paginatedMonitors" 
              :key="m.id" 
              class="p-3.5 sm:p-4 transition-colors duration-150 hover:bg-zinc-50/60" 
              :class="m.current_status === 'down' ? 'bg-rose-50/30' : ''"
            >
              <!-- Main Row -->
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <!-- Left: Identity & Target -->
                <div class="flex items-center gap-3 min-w-[240px] flex-1">
                  <!-- Numbering & Status Indicator -->
                  <div class="flex items-center gap-2 w-8 shrink-0">
                    <span class="text-[10px] font-mono text-zinc-400 w-4 text-right">{{ (currentPage - 1) * itemsPerPage + index + 1 }}.</span>
                    <span 
                      class="w-2.5 h-2.5 rounded-full shrink-0" 
                      :class="m.current_status === 'up' ? 'bg-emerald-500' : (m.current_status === 'down' ? 'bg-rose-500 animate-pulse' : 'bg-zinc-300')"
                    ></span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h3 class="text-xs sm:text-sm font-bold text-zinc-900 truncate">{{ m.name }}</h3>
                      <span v-if="m.is_featured" class="px-1.5 py-px rounded text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{{ t('dashboard.featured').toUpperCase() }}</span>
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
                <div class="w-full lg:w-56 pl-11 lg:pl-0 shrink-0">
                  <div class="flex justify-between text-[10px] mb-1 font-mono">
                    <span class="text-zinc-400">{{ t('dashboard.historyCheck') }}</span>
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
                <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t border-zinc-100 lg:border-t-0 pl-11 lg:pl-0">
                  <div class="text-right">
                    <div class="text-xs font-mono font-bold text-zinc-900">{{ m.avg_latency_24h || '--' }} <span class="text-[9px] font-normal text-zinc-400">ms</span></div>
                    <div class="text-[9px] text-zinc-400 font-mono uppercase">{{ t('dashboard.latency') }}</div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-1">
                    <button 
                      class="px-2 py-1 rounded-lg text-[8px] font-bold border transition-colors cursor-pointer" 
                      :class="m.is_featured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 border-zinc-200'"
                      :title="m.is_featured ? t('dashboard.removeFeatured') : t('dashboard.makeFeatured')" 
                      @click="toggleFeatured(m)"
                    >
                      {{ t('dashboard.featured').toUpperCase() }}
                    </button>
                    <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" :title="m.active ? t('common.active') : t('dashboard.inactiveStatus')" @click="toggleActive(m)">
                      <LucidePower :class="m.active ? 'text-emerald-600' : 'text-zinc-400'" class="w-3.5 h-3.5" />
                    </button>
                    <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" :title="t('dashboard.runCheckNow')" @click="runCheckNow(m)">
                      ⚡
                    </button>
                    <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" :title="m.current_status === 'paused' ? t('dashboard.resume') : t('dashboard.pause')" @click="togglePause(m)">
                      {{ m.current_status === 'paused' ? '▶' : '⏸' }}
                    </button>
                    <button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" @click="toggleDetails(m.id)">
                      {{ expandedId === m.id ? '▲' : '▼' }}
                    </button>
                    <button class="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" @click="editMonitor(m)">
                      {{ t('dashboard.edit') }}
                    </button>
                    <button class="px-2 py-1 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer" @click="deleteMonitor(m)">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <!-- Push Token Banner if Push Heartbeat -->
              <div v-if="m.type === 'push'" class="flex items-center gap-2 p-2 mt-2.5 ml-11 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
                <span class="font-semibold text-zinc-600 text-[11px]">{{ t('dashboard.pushUrl') }}</span>
                <code class="flex-1 font-mono text-zinc-700 text-[11px] truncate">{{ currentOrigin }}/api/push/{{ m.push_token_raw || '••••••••' }}</code>
                <button class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200 cursor-pointer shadow-xs" @click="copyPushUrl(m)">{{ t('dashboard.copy') }}</button>
                <button class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200 cursor-pointer shadow-xs" @click="regeneratePushToken(m)">{{ t('dashboard.rotate') }}</button>
              </div>

              <!-- Expanded Details Panel -->
              <div v-if="expandedId === m.id" class="mt-3 pt-3 ml-11 border-t border-zinc-100 space-y-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <h4 class="font-bold text-zinc-900 text-[11px]">{{ t('dashboard.checkConfig') }}</h4>
                    <p class="text-zinc-600 text-[11px]">{{ t('dashboard.intervalLabel', {interval: m.interval_seconds}) }} | {{ t('dashboard.toleranceLabel', {count: m.retries_before_down}) }}</p>
                    <p class="text-zinc-600 text-[11px]">{{ t('dashboard.lastChecked', {time: m.last_checked_at ? new Date(m.last_checked_at).toLocaleString(locale === 'en' ? 'en-US' : 'id-ID') : '-'}) }}</p>
                    <p v-if="m.type === 'dns'" class="text-zinc-600 text-[11px]">Expected Value: <strong class="text-zinc-900">{{ m.dns_expected_value || '-' }}</strong></p>
                  </div>

                  <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                    <h4 class="font-bold text-zinc-900 text-[11px]">{{ t('dashboard.securityMaintenance') }}</h4>
                    <p class="text-zinc-600 text-[11px]">Inspeksi SSL: <strong class="text-zinc-900">{{ m.ssl_check_enabled ? 'Aktif' : 'Non-aktif' }}</strong> ({{ m.ssl_days_remaining !== null && m.ssl_days_remaining !== undefined ? `${m.ssl_days_remaining} hari lagi` : '-' }})</p>
                    <p class="text-zinc-600 text-[11px]">Jadwal Pemeliharaan: <strong :class="m.is_under_maintenance ? 'text-amber-700 font-bold' : 'text-zinc-900'">{{ m.is_under_maintenance ? t('dashboard.maintenanceActive') : t('dashboard.maintenanceNormal') }}</strong></p>
                  </div>
                </div>

                <!-- Export Bar -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div>
                    <h4 class="text-[11px] font-bold text-zinc-900">{{ t('dashboard.exportTitle') }}</h4>
                    <p class="text-[10px] text-zinc-500">{{ t('dashboard.exportDesc') }}</p>
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

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-2xl shadow-xs text-xs font-medium">
          <div class="text-zinc-500">
            {{ t('dashboard.showingMonitors', {from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, filteredMonitors.length), total: filteredMonitors.length}) }}
          </div>
          <div class="flex items-center gap-1.5">
            <button 
              @click="currentPage > 1 && currentPage--" 
              :disabled="currentPage === 1"
              class="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {{ t('dashboard.prev') }}
            </button>
            <div class="flex items-center px-1 font-mono text-zinc-600 gap-1.5">
              <button 
                v-for="p in totalPages" :key="p"
                @click="currentPage = p"
                class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                :class="currentPage === p ? 'bg-zinc-900 text-white font-bold shadow-sm' : 'hover:bg-zinc-100'"
              >
                {{ p }}
              </button>
            </div>
            <button 
              @click="currentPage < totalPages && currentPage++" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {{ t('dashboard.next') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->

    <!-- Add / Edit Modal -->
    <MonitorModal 
      :isOpen="isModalOpen" 
      :monitorData="selectedMonitor" 
      @close="isModalOpen = false" 
      @saved="fetchMonitors" 
    />

    <!-- Modal Instant Check (Tombol Petir) -->
    <div 
      v-if="checkNowModal.isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
      @click.self="checkNowModal.isOpen = false"
    >
      <div class="w-full max-w-sm double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-4 text-center">
          <!-- Icon Status -->
          <div class="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl shadow-xs"
            :class="{
              'bg-zinc-100 text-zinc-600': checkNowModal.status === 'loading',
              'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200': checkNowModal.status === 'success',
              'bg-rose-50 text-rose-600 ring-1 ring-rose-200': checkNowModal.status === 'error'
            }"
          >
            <span v-if="checkNowModal.status === 'loading'" class="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin"></span>
            <span v-else-if="checkNowModal.status === 'success'">✓</span>
            <span v-else>✕</span>
          </div>

          <!-- Titles -->
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-zinc-900">{{ checkNowModal.monitorName }}</h3>
            <p class="text-[11px] font-mono text-zinc-400 truncate">{{ checkNowModal.target }}</p>
          </div>

          <!-- Message box -->
          <div class="p-3 rounded-xl border text-xs font-mono"
            :class="{
              'bg-zinc-50 border-zinc-200 text-zinc-600': checkNowModal.status === 'loading',
              'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold': checkNowModal.status === 'success',
              'bg-rose-50 border-rose-200 text-rose-800 font-semibold': checkNowModal.status === 'error'
            }"
          >
            <p>{{ checkNowModal.message }}</p>
            <div v-if="checkNowModal.status === 'success'" class="mt-1 text-[10px] text-emerald-600 font-normal">
              {{ t('dashboard.latency') }}: <strong>{{ checkNowModal.latency }} ms</strong>
            </div>
          </div>

          <!-- Actions -->
          <button 
            type="button" 
            class="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            @click="checkNowModal.isOpen = false"
          >
            {{ checkNowModal.status === 'loading' ? t('dashboard.closeDialog') : t('dashboard.done') }}
          </button>
        </div>
      </div>
    </div>

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
        <p><span>{{ branding.footer_text || 'Powered by deTAK — Observability Platform' }}</span></p><div class="flex items-center gap-2 flex-wrap"><a href="https://github.com/erwinmad/uptime-ina" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-2">GitHub ↗</a><span class="opacity-30">·</span><span>© 2026 deTAK</span></div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Activity, AlertTriangle, BarChart3, Globe, Settings, Power as LucidePower, Crown, ShieldCheck, Layers, Timer, TrendingDown, Siren, Star } from 'lucide-vue-next';
import AppNavbar from './AppNavbar.vue';
import MonitorModal from './MonitorModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import ToastContainer from './ToastContainer.vue';
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
  app_name: 'deTAK',
  app_tagline: 'Platform Observabilitas & Pemantauan Ketersediaan Layanan',
  footer_text: 'Powered by deTAK — Uptime & Observability Platform',
  logo_icon: '🌐'
});

const monitors = ref([]);
const loading = ref(true);
const isConnected = ref(false);
const searchQuery = ref('');
const filterTab = ref('all');
const filterTag = ref('');
const filterCategory = ref('');
const filterIsActive = ref('all'); // all | active | inactive
const isModalOpen = ref(false);
const selectedMonitor = ref(null);
const expandedId = ref(null);
const activeIncidentsCount = ref(0);

const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(10);

const allTags = computed(() => {
  const set = new Set();
  for (const m of monitors.value) {
    if (Array.isArray(m.tags)) {
      for (const t of m.tags) set.add(t);
    }
  }
  return Array.from(set);
});
const availableCategories = computed(() => {
  const set = new Set();
  for (const m of monitors.value) set.add(m.category_name || 'Uncategorized');
  return Array.from(set).sort();
});

const activeMonitorsList = computed(() => monitors.value.filter(m => m.active !== 0));
const upCount = computed(() => activeMonitorsList.value.filter(m => m.current_status === 'up').length);
const downCount = computed(() => activeMonitorsList.value.filter(m => m.current_status === 'down').length);
const pausedCount = computed(() => activeMonitorsList.value.filter(m => m.current_status === 'paused').length);
const inactiveCount = computed(() => monitors.value.filter(m => m.active === 0).length);

const overallUptime = computed(() => {
  if (activeMonitorsList.value.length === 0) return 100;
  let sum = 0;
  let count = 0;
  activeMonitorsList.value.forEach(m => {
    if (m.uptime_24h !== undefined) {
      sum += m.uptime_24h;
      count++;
    }
  });
  if (count === 0) return 100;
  return (sum / count).toFixed(2);
});

const overallHealthText = computed(() => {
  if (activeMonitorsList.value.length === 0) return 'Siap';
  if (downCount.value > 0) return `${downCount.value} Down`;
  const pendingCount = activeMonitorsList.value.filter(m => m.current_status === 'pending').length;
  if (pendingCount > 0) return `Menunggu (${pendingCount})`;
  return 'Normal';
});

const avgLatency = computed(() => {
  const valid = activeMonitorsList.value.filter(m => m.avg_latency_24h > 0);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, m) => acc + m.avg_latency_24h, 0);
  return Math.round(sum / valid.length);
});
const pendingCount = computed(() => activeMonitorsList.value.filter(m => m.current_status === 'pending').length);
const featuredCount = computed(() => activeMonitorsList.value.filter(m => m.is_featured).length);
const featuredDownCount = computed(() => activeMonitorsList.value.filter(m => m.is_featured && m.current_status === 'down').length);
const sslExpiringList = computed(() => activeMonitorsList.value.filter(m => m.ssl_check_enabled && m.ssl_days_remaining !== null && m.ssl_days_remaining !== undefined && m.ssl_days_remaining < 14).sort((a,b)=>a.ssl_days_remaining - b.ssl_days_remaining));
const sslExpiringCount = computed(() => sslExpiringList.value.length);
const maintenanceCount = computed(() => activeMonitorsList.value.filter(m => m.is_under_maintenance).length);
const globalHeartbeatBars = computed(() => {
  const active = activeMonitorsList.value;
  if (!active.length) return [];
  const len = 30;
  const bars = [];
  for (let i=0;i<len;i++) {
    let hasDown=false, hasUp=false, hasPending=false;
    for (const m of active) {
      const c = m.recent_checks && m.recent_checks[i];
      if (!c) { hasPending=true; continue; }
      if (c.status==='down') hasDown=true;
      else if (c.status==='up') hasUp=true;
    }
    let status = 'pending';
    if (hasDown) status='down';
    else if (hasUp) status='up';
    bars.push({ status, label: status==='down' ? t('dashboard.issuesCount', {count: i+1}) : status==='up' ? `OK #${i+1}` : t('dashboard.waitingChecks', {count: i+1}) });
  }
  return bars;
});
const showAllCategories = ref(false);
const categoryStats = computed(() => {
  const map = new Map();
  for (const m of activeMonitorsList.value) {
    const cat = m.category_name || 'Uncategorized';
    if (!map.has(cat)) map.set(cat, { name: cat, total:0, up:0, down:0, latencies:[] });
    const s = map.get(cat); s.total++; if (m.current_status === 'up') s.up++; if (m.current_status === 'down') s.down++; if (m.avg_latency_24h) s.latencies.push(m.avg_latency_24h);
  }
  return Array.from(map.values()).map(c => ({ ...c, avgUptime: c.total? Math.round(c.up/c.total*100):0, avgLatency: c.latencies.length? Math.round(c.latencies.reduce((a,b)=>a+b,0)/c.latencies.length):0 })).sort((a,b)=> a.down - b.down || b.total - a.total);
});
const visibleCategories = computed(() => showAllCategories.value ? categoryStats.value : categoryStats.value.slice(0,4));
const sortedByUptime = computed(() => [...activeMonitorsList.value].sort((a,b)=> (b.uptime_24h||100) - (a.uptime_24h||100)));
const worstMonitors = computed(() => [...activeMonitorsList.value].filter(m=> m.current_status !== 'paused').sort((a,b)=> (a.uptime_24h||100) - (b.uptime_24h||100)).slice(0,5));
const minLatency = computed(() => { const v = activeMonitorsList.value.map(m=>m.avg_latency_24h).filter(Boolean); return v.length? Math.min(...v):0; });
const p95Latency = computed(() => {
  const v = activeMonitorsList.value.map(m=>m.avg_latency_24h).filter(n=> n>0).sort((a,b)=>a-b);
  if (!v.length) return 0; const idx = Math.ceil(v.length*0.95)-1; return v[idx]||v[v.length-1];
});

const filteredMonitors = computed(() => {
  return monitors.value.filter(m => {
    // Tab filter
    if (filterTab.value === 'up' && (m.active === 0 || m.current_status !== 'up')) return false;
    if (filterTab.value === 'down' && (m.active === 0 || m.current_status !== 'down')) return false;
    if (filterTab.value === 'paused' && (m.active === 0 || m.current_status !== 'paused')) return false;
    if (filterTab.value === 'inactive' && m.active !== 0) return false;

    // Category filter
    if (filterCategory.value !== '') {
      if ((m.category_name || 'Uncategorized') !== filterCategory.value) return false;
    }
    // is_active filter
    if (filterIsActive.value === 'active' && m.active === 0) return false;
    if (filterIsActive.value === 'inactive' && m.active !== 0) return false;
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
  }).sort((a, b) => {
    // Sort: featured (active) → non-featured (active) → nonaktif (inactive) at bottom
    const prio = (m) => !m.active ? 2 : (m.is_featured ? 0 : 1);
    const pa = prio(a), pb = prio(b);
    if (pa !== pb) return pa - pb;
    return 0; // retain default ordering within group
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredMonitors.value.length / itemsPerPage.value));
});

const paginatedMonitors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredMonitors.value.slice(start, start + itemsPerPage.value);
});

watch([searchQuery, filterTab, filterTag, filterCategory, filterIsActive], () => {
  currentPage.value = 1;
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

const checkNowModal = ref({
  isOpen: false,
  monitorName: '',
  target: '',
  status: 'loading', // loading, success, error
  message: '',
  latency: 0
});

async function runCheckNow(monitor) {
  checkNowModal.value = {
    isOpen: true,
    monitorId: monitor.id, // Tambahkan monitorId yang persis
    monitorName: monitor.name,
    target: monitor.target,
    status: 'loading',
    message: t('dashboard.sendingProbe'),
    latency: 0
  };

  // Fallback timeout in case WebSocket misses the response (25s to cover max timeout config)
  const timeoutGuard = setTimeout(() => {
    if (checkNowModal.value.isOpen && checkNowModal.value.status === 'loading') {
      checkNowModal.value.status = 'error';
      checkNowModal.value.message = t('dashboard.probeTimeout');
    }
  }, 25000);

  try {
    const res = await fetch(`/api/v1/monitors/${monitor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ run_check_now: true })
    });
    
    clearTimeout(timeoutGuard);
    
    if (!res.ok) throw new Error(t('dashboard.triggerFailed'));
    
    const data = await res.json();
    
    // Gunakan response HTTP langsung jika ada data hasil check_result
    if (data.check_result) {
      if (checkNowModal.value.isOpen && checkNowModal.value.monitorId === monitor.id) {
        checkNowModal.value.status = data.check_result.status === 'up' ? 'success' : 'error';
        checkNowModal.value.latency = data.check_result.response_time_ms || 0;
        checkNowModal.value.message = data.check_result.status === 'up' 
          ? t('dashboard.serviceUp', {latency: data.check_result.response_time_ms, code: data.check_result.status_code || 200})
          : (data.check_result.error_message || t('dashboard.serviceDown'));
      }
      // Trigger fetch monitors list untuk update badge dashboard juga
      fetchMonitors();
    }
    
  } catch (err) {
    clearTimeout(timeoutGuard);
    checkNowModal.value.status = 'error';
    checkNowModal.value.message = err.message || t('dashboard.networkError');
  }
}

async function toggleActive(monitor) {
  const newActive = monitor.active ? 0 : 1;
  try {
    monitor.active = newActive;
    await fetch(`/api/v1/monitors/${monitor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newActive })
    });
    toast.success(t(newActive ? 'dashboard.toast.monitorActivated' : 'dashboard.toast.monitorDeactivated', {name: monitor.name}));
    fetchMonitors();
  } catch (err) {
    monitor.active = !newActive;
    toast.error(t('dashboard.toast.failedStatus'));
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

async function toggleFeatured(monitor) {
  const isFeatured = monitor.is_featured ? 0 : 1;
  try {
    // Update local state instantly for UI feedback
    monitor.is_featured = isFeatured;
    const res = await fetch(`/api/v1/monitors/${monitor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: isFeatured })
    });
    if (res.ok) {
      toast.success(t(isFeatured ? 'dashboard.toast.featuredAdded' : 'dashboard.toast.featuredRemoved', {name: monitor.name}));
      fetchMonitors(); // refresh list to trigger auto-sort
    } else {
      monitor.is_featured = !isFeatured; // revert on fail
      toast.error(t('dashboard.toast.featuredFailed'));
    }
  } catch (err) {
    monitor.is_featured = !isFeatured;
    toast.error(t('dashboard.toast.networkSaveFailed'));
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
          toast.success(t('dashboard.toast.monitorDeleted', {name: monitor.name}), t('dashboard.toast.monitorDeletedTitle'));
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus monitor' }));
          toast.error(err.error || t('dashboard.toast.deleteFailed'), t('dashboard.toast.systemError'));
        }
      } catch (err) {
        console.error('Delete monitor error:', err);
        toast.error(t('dashboard.toast.networkDeleteFailed'), t('dashboard.toast.networkError'));
      }
    }
  });
}

function copyPushUrl(monitor) {
  const url = `${window.location.origin}/api/push/${monitor.push_token_raw}`;
  navigator.clipboard.writeText(url);
  toast.success(t('dashboard.toast.pushCopied'), t('dashboard.toast.pushCopiedTitle'));
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
          toast.success(t('dashboard.toast.pushRotated'), t('dashboard.toast.pushRotatedTitle'));
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal merotasi token' }));
          toast.error(err.error || t('dashboard.toast.pushRotateFailed'), t('dashboard.toast.pushFailed'));
        }
      } catch (err) {
        console.error('Regenerate token error:', err);
        toast.error('Gagal menghubungi server.', t('dashboard.networkError'));
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
  
  // Jika sedang dijalankan di dev server (port 3001, 4321, dsb), hubungkan ke backend server port 3000
  let host = window.location.host;
  if (window.location.port && window.location.port !== '3000') {
    host = `${window.location.hostname}:3000`;
  }
  
  const wsUrl = `${protocol}//${host}/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    isConnected.value = true;
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'check_completed') {
        // Update instant check modal if this is the active monitor being checked
        if (checkNowModal.value.isOpen && checkNowModal.value.status === 'loading') {
          if (checkNowModal.value.monitorId === msg.data.monitorId) {
            checkNowModal.value.status = msg.data.status === 'up' ? 'success' : 'error';
            checkNowModal.value.latency = msg.data.responseTimeMs || 0;
            checkNowModal.value.message = msg.data.status === 'up' 
              ? t('dashboard.serviceUp', {latency: msg.data.responseTimeMs, code: msg.data.statusCode || 200})
              : (msg.data.errorMessage || t('dashboard.serviceDown'));
          }
        }

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
            toast.error(t('dashboard.serviceDown'), 'Layanan Down');
          } else if (msg.data.newStatus === 'up' && prev === 'down') {
            toast.success(t('dashboard.serviceUp', {latency: 0, code: 200}), 'Layanan Pulih');
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
  
  fetchMonitors();
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) ws.close();
  if (reconnectTimer) clearTimeout(reconnectTimer);
});
</script>
