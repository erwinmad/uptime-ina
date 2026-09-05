<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col justify-between selection:bg-zinc-200">
    <!-- Ambient Subtlety Glow -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-zinc-200/50 via-zinc-100/20 to-transparent pointer-events-none -z-10"></div>
    
    <!-- System Toaster Notifications -->
    <ToastContainer ref="toastRef" />

    <div class="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-8">
      
      <!-- Top Clean Floating Navbar -->
      <header class="flex items-center justify-between gap-4 p-2 pl-3.5 pr-2 rounded-full bg-white ring-1 ring-zinc-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200/60 flex items-center justify-center shrink-0">
            <img v-if="isImageLogo(statusData?.branding?.logo_icon)" :src="statusData?.branding?.logo_icon" alt="Logo" class="w-4 h-4 object-contain rounded-full" />
            <span v-else class="text-xs">{{ statusData?.branding?.logo_icon || '🌐' }}</span>
          </div>
          <div>
            <h1 class="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900">{{ statusData?.page?.title || statusData?.branding?.app_name || 'Status Layanan' }}</h1>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/70 text-[10px] text-zinc-600 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Observability</span>
          </div>
          
          <button 
            @click="isSubscribeModalOpen = true"
            class="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white font-medium text-xs transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <span>Langganan</span>
            <div class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <span class="text-[9px] leading-none">↗</span>
            </div>
          </button>
        </div>
      </header>

      <!-- Password Protected Gatekeeper -->
      <div v-if="isLocked" class="max-w-md mx-auto my-12 double-bezel animate-in fade-in duration-500">
        <div class="double-bezel-inner p-6 sm:p-8 text-center space-y-5">
          <div class="w-10 h-10 mx-auto rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-base">
            🔒
          </div>
          <div>
            <span class="inline-block rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.15em] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 mb-2">Akses Terproteksi</span>
            <h2 class="text-base font-bold text-zinc-900 tracking-tight">Halaman Status Terkunci</h2>
            <p class="text-xs text-zinc-500 mt-1">Masukkan kata sandi untuk melihat metriks ketersediaan sistem.</p>
          </div>
          <div v-if="unlockError" class="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-mono">
            {{ unlockError }}
          </div>
          <form @submit.prevent="submitUnlock" class="space-y-3">
            <input 
              v-model="unlockPassword" 
              type="password" 
              placeholder="Masukkan kata sandi..."
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200"
              required
            />
            <button 
              type="submit" 
              :disabled="isUnlocking"
              class="group w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span>{{ isUnlocking ? 'Memverifikasi...' : 'Buka Halaman' }}</span>
              <div class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <span class="text-[9px]">→</span>
              </div>
            </button>
          </form>
        </div>
      </div>

      <!-- Main Content when Unlocked -->
      <template v-else>
        <!-- Hero Section: Modern 4-Grid KPI & Health Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          
          <!-- Card 1: System Health Status -->
          <div class="ring-1 p-1.5 rounded-[1.5rem] transition-all duration-500"
            :style="{ background: Number(averageUptime) >= 99 ? '#f0fdf4' : (Number(averageUptime) >= 90 ? '#fffbeb' : '#fff1f2'), borderColor: Number(averageUptime) >= 99 ? '#bbf7d0' : (Number(averageUptime) >= 90 ? '#fde68a' : '#fecdd3') }"
          >
            <div class="h-full p-4 flex flex-col justify-between space-y-3 relative overflow-hidden rounded-[calc(1.5rem-0.375rem)]"
              :style="{ background: Number(averageUptime) >= 99 ? '#f0fdf4' : (Number(averageUptime) >= 90 ? '#fffbeb' : '#fff1f2') }"
            >
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold tracking-wider"
                    :style="{ color: Number(averageUptime) >= 99 ? '#16a34a' : (Number(averageUptime) >= 90 ? '#d97706' : '#e11d48') }"
                  >Status Sistem</span>
                  <span class="w-2 h-2 rounded-full animate-pulse"
                    :style="{ background: Number(averageUptime) >= 99 ? '#22c55e' : (Number(averageUptime) >= 90 ? '#f59e0b' : '#f43f5e') }"
                  ></span>
                </div>
                <h3 class="text-base sm:text-lg font-extrabold tracking-tight"
                  :style="{ color: Number(averageUptime) >= 99 ? '#166534' : (Number(averageUptime) >= 90 ? '#92400e' : '#881337') }"
                >
                  {{ Number(averageUptime) >= 99 ? 'Semua Operasional' : (Number(averageUptime) >= 90 ? 'Degradasi Parsial' : 'Gangguan Kritis') }}
                </h3>
                <p class="text-[11px] leading-tight"
                  :style="{ color: Number(averageUptime) >= 99 ? '#15803d' : (Number(averageUptime) >= 90 ? '#b45309' : '#be123c') }"
                >
                  {{ downCount > 0 ? `${downCount} layanan mengalami kendala aktif` : 'Seluruh endpoint berjalan normal' }}
                </p>
              </div>
              <div class="pt-2 flex items-center justify-between text-[10px] font-mono"
                :style="{ borderTop: '1px solid', borderColor: Number(averageUptime) >= 99 ? '#bbf7d080' : (Number(averageUptime) >= 90 ? '#fde68a80' : '#fecdd380'), color: '#9ca3af' }"
              >
                <span>Sinkronisasi</span>
                <span class="font-medium" style="color: #374151">{{ lastUpdatedFormatted }}</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Overall SLA Availability -->
          <div class="double-bezel">
            <div class="double-bezel-inner h-full p-4 flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Ketersediaan (SLA 60h)</span>
                  <span class="text-[11px]">📈</span>
                </div>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-xl sm:text-2xl font-black font-mono tracking-tight" 
                    :class="Number(averageUptime) >= 99 ? 'text-emerald-600' : (Number(averageUptime) >= 90 ? 'text-amber-600' : 'text-rose-600')">
                    {{ averageUptime }}%
                  </span>
                  <span class="text-[10px] font-mono text-zinc-400">Target 99.9%</span>
                </div>
                <!-- Mini SLA Progress Bar -->
                <div class="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500" 
                    :class="Number(averageUptime) >= 99 ? 'bg-emerald-500' : (Number(averageUptime) >= 90 ? 'bg-amber-500' : 'bg-rose-500')" 
                    :style="{ width: `${Math.min(100, Math.max(0, averageUptime))}%` }"
                  ></div>
                </div>
              </div>
              <div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Evaluasi SLA</span>
                <span class="font-semibold font-mono"
                  :class="Number(averageUptime) >= 99 ? 'text-emerald-600' : (Number(averageUptime) >= 90 ? 'text-amber-600' : 'text-rose-600')">
                  {{ Number(averageUptime) >= 99 ? 'Memenuhi Standar' : (Number(averageUptime) >= 90 ? 'Degradasi Parsial' : 'Di Bawah Standar') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card 3: Average Latency -->
          <div class="double-bezel">
            <div class="double-bezel-inner h-full p-4 flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Respon Rata-rata</span>
                  <span class="text-[11px]">⚡</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-zinc-900">
                    {{ avgResponseMs }}
                  </span>
                  <span class="text-xs font-mono text-zinc-400">ms</span>
                </div>
                <p class="text-[11px] text-zinc-500 leading-tight">
                  {{ avgResponseMs < 100 ? 'Kecepatan jaringan optimal' : 'Latensi dalam batas wajar' }}
                </p>
              </div>
              <div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Toleransi Probe</span>
                <span class="text-zinc-700 font-medium">Non-blocking</span>
              </div>
            </div>
          </div>

          <!-- Card 4: Endpoints Breakdown -->
          <div class="double-bezel">
            <div class="double-bezel-inner h-full p-4 flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Total Endpoint</span>
                  <span class="text-[11px]">🖥</span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-zinc-900">
                    {{ statusData?.monitors?.length || 0 }}
                  </span>
                  <span class="text-[10px] text-zinc-400 font-mono">Aktif dipantau</span>
                </div>
                <div class="flex items-center gap-2 text-[10px] font-mono pt-0.5">
                  <span class="text-emerald-600 font-semibold">✓ {{ upCount }} Up</span>
                  <span v-if="downCount > 0" class="text-rose-600 font-semibold">✕ {{ downCount }} Down</span>
                  <span v-if="pausedCount > 0" class="text-zinc-400 font-medium">⏸ {{ pausedCount }} Jeda</span>
                </div>
              </div>
              <div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Interval</span>
                <span class="text-zinc-700 font-medium">30-60 detik</span>
              </div>
            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- HEARTBEAT — Status Layanan (dipindahkan ke atas insiden) -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section class="space-y-3">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-2">
              <span class="text-sm">💓</span>
              <h3 class="text-sm font-bold tracking-tight text-zinc-900">Status & Heartbeat Layanan</h3>
            </div>
            <span class="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">Histori 60 Hari</span>
          </div>

          <div class="double-bezel">
            <div class="double-bezel-inner divide-y divide-zinc-100 overflow-hidden">
              <div v-if="!statusData?.monitors || statusData.monitors.length === 0" class="p-8 text-center text-xs text-zinc-400 font-mono">
                Belum ada monitor layanan yang terdaftar.
              </div>

              <div
                v-for="m in statusData?.monitors"
                :key="m.id"
                class="p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-3 transition-colors duration-150 hover:bg-zinc-50/60"
              >
                <!-- Icon + Identity -->
                <div class="flex items-center gap-3 min-w-0 md:w-56 shrink-0">
                  <!-- Monitor Type Icon -->
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ring-1"
                    :class="m.current_status === 'up'
                      ? 'bg-emerald-50 ring-emerald-200/80'
                      : m.current_status === 'paused'
                        ? 'bg-zinc-100 ring-zinc-200'
                        : 'bg-rose-50 ring-rose-200/80'"
                  >
                    <span>{{ monitorIcon(m.type) }}</span>
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs font-bold text-zinc-900 truncate">{{ m.custom_label || m.name }}</span>
                      <span class="px-1.5 py-px rounded text-[8px] font-mono uppercase bg-zinc-100 text-zinc-500 border border-zinc-200 shrink-0">{{ m.type }}</span>
                    </div>
                    <!-- Response time micro info -->
                    <div class="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-400">
                      <span class="flex items-center gap-0.5">
                        <span>⚡</span>
                        <span :class="latencyColor(m.avg_latency)">
                          {{ m.avg_latency != null ? m.avg_latency + ' ms' : '—' }}
                        </span>
                      </span>
                      <span class="text-zinc-200">|</span>
                      <span>{{ m.uptime_percentage }}% uptime</span>
                    </div>
                  </div>
                </div>

                <!-- Heartbeat Bars (recent checks = interval nyata per monitor) -->
                <div class="flex-1 min-w-0 space-y-1.5">
                  <div class="flex items-center gap-[3px] h-6 px-1">
                    <template v-if="m.recent_checks && m.recent_checks.length > 0">
                      <div
                        v-for="(c, idx) in m.recent_checks"
                        :key="idx"
                        class="relative flex-1 h-full flex items-center justify-center cursor-pointer"
                        @mouseenter="(e) => showTooltip(e, { status: c.status, ms: c.response_time_ms, date: c.checked_at })"
                        @mouseleave="hideTooltip"
                      >
                        <div
                          class="w-full rounded-full transition-all duration-200 hover:scale-y-110"
                          :class="{
                            'bg-emerald-400 h-full': c.status === 'up',
                            'bg-rose-500 h-3/5':     c.status !== 'up'
                          }"
                        ></div>
                      </div>
                      <div v-for="n in Math.max(0, 30 - m.recent_checks.length)" :key="'f-' + n"
                        class="flex-1 h-2/3 rounded-full bg-zinc-200/60"></div>
                    </template>

                    <template v-else>
                      <div
                        v-for="(day, idx) in m.history"
                        :key="idx"
                        class="relative flex-1 h-full flex items-center justify-center cursor-pointer"
                        @mouseenter="(e) => showTooltip(e, { upCount: day.up_count, total: day.total, date: day.date })"
                        @mouseleave="hideTooltip"
                      >
                        <div
                          class="w-full rounded-full transition-all duration-200 hover:scale-y-110"
                          :class="{
                            'bg-emerald-400 h-full': day.up_count === day.total,
                            'bg-amber-400 h-4/5':    day.up_count < day.total && day.up_count > 0,
                            'bg-rose-500 h-3/5':     day.up_count === 0
                          }"
                        ></div>
                      </div>
                      <div v-for="n in Math.max(0, 30 - (m.history ? m.history.length : 0))" :key="'fill-' + n"
                        class="flex-1 h-2/3 rounded-full bg-zinc-200/60"></div>
                    </template>
                  </div>
                  <div class="flex justify-between text-[9px] text-zinc-400 font-mono px-1">
                    <span v-if="m.recent_checks && m.recent_checks.length > 0">{{ intervalLabel(m.interval_seconds) }} interval</span>
                    <span v-else>60h lalu</span>
                    <span class="text-zinc-500 font-medium">{{ m.uptime_percentage }}% SLA</span>
                    <span>Kini</span>
                  </div>
                </div>

                <!-- Status pill + last checked -->
                <div class="shrink-0 flex flex-col items-end gap-1 self-end md:self-auto">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                    :class="{
                      'bg-emerald-50 text-emerald-700 border border-emerald-200': m.current_status === 'up',
                      'bg-rose-50 text-rose-700 border border-rose-200':         m.current_status === 'down',
                      'bg-zinc-100 text-zinc-600 border border-zinc-200':         m.current_status === 'paused'
                    }"
                  >
                    <span class="w-1.5 h-1.5 rounded-full"
                      :class="{
                        'bg-emerald-500': m.current_status === 'up',
                        'bg-rose-500 animate-pulse': m.current_status === 'down',
                        'bg-zinc-400': m.current_status === 'paused'
                      }"
                    ></span>
                    <span>{{ statusLabel(m.current_status) }}</span>
                  </span>
                  <span class="text-[9px] font-mono text-zinc-400">
                    {{ m.last_checked_at ? relativeTime(m.last_checked_at) : '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
      </template>
    </div>

    <!-- Global Floating Tooltip (Tidak pernah tertutup container) -->
    <Teleport to="body">
      <div
        v-if="hoverTooltip.visible"
        class="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full bg-zinc-900 text-white rounded-xl px-3 py-2.5 shadow-2xl ring-1 ring-zinc-800 text-[10px] space-y-1.5 min-w-[160px]"
        :style="{ left: `${hoverTooltip.x}px`, top: `${hoverTooltip.y - 10}px` }"
      >
        <!-- Status Row -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full" :class="hoverTooltip.isUp ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'"></span>
            <span class="font-bold uppercase tracking-wider text-[9px]" :class="hoverTooltip.isUp ? 'text-emerald-400' : 'text-rose-400'">
              {{ hoverTooltip.isUp ? 'Operasional' : 'Gangguan' }}
            </span>
          </div>
          <span v-if="hoverTooltip.ms !== undefined" class="font-mono text-zinc-300 font-semibold">
            {{ hoverTooltip.ms ?? '—' }} <span class="text-zinc-500 font-normal">ms</span>
          </span>
          <span v-else-if="hoverTooltip.ratio" class="font-mono text-zinc-400 text-[9px]">{{ hoverTooltip.ratio }}</span>
        </div>
        <!-- Timestamp Row -->
        <div class="text-[9px] font-mono text-zinc-400 border-t border-zinc-800 pt-1.5 leading-relaxed">
          {{ hoverTooltip.date }}
        </div>
        <!-- Arrow -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900"></div>
      </div>
    </Teleport>

    <!-- Modal: Subscribe & Notifications -->
    <div 
      v-if="isSubscribeModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="isSubscribeModalOpen = false"
    >
      <div class="w-full max-w-sm double-bezel animate-in zoom-in-95 duration-200">
        <div class="double-bezel-inner p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <span class="text-[9px] uppercase tracking-wider font-semibold text-zinc-400">Pemberitahuan</span>
              <h3 class="text-sm font-bold text-zinc-900">Langganan Notifikasi</h3>
            </div>
            <button 
              class="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer text-xs" 
              @click="isSubscribeModalOpen = false"
            >
              ✕
            </button>
          </div>
          
          <div v-if="subscribeMsg" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-mono">
            ✓ {{ subscribeMsg }}
          </div>
          <div v-if="subscribeError" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-mono">
            ✕ {{ subscribeError }}
          </div>

          <form v-if="!subscribeMsg" @submit.prevent="submitSubscribe" class="space-y-3">
            <p class="text-xs text-zinc-600 leading-relaxed">
              Dapatkan pembaruan instan melalui email resmi saat terjadi kendala operasional atau jadwal pemeliharaan.
            </p>
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-700">Alamat Email</label>
              <input 
                v-model="subscriberEmail" 
                type="email" 
                placeholder="operator@instansi.go.id" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200" 
                required 
              />
            </div>
            <div class="flex items-center justify-end gap-2 pt-2">
              <button 
                type="button" 
                class="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer" 
                @click="isSubscribeModalOpen = false"
              >
                Tutup
              </button>
              <button 
                type="submit" 
                :disabled="isSubscribing" 
                class="group px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <span>{{ isSubscribing ? 'Menyimpan...' : 'Daftar' }}</span>
                <div class="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                  <span class="text-[8px]">→</span>
                </div>
              </button>
            </div>
          </form>

          <!-- RSS XML Feed Utility -->
          <div class="pt-3 border-t border-zinc-100 space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-zinc-500">
              <span class="font-medium text-zinc-600">RSS Feed:</span>
              <span class="font-mono text-zinc-400">XML 2.0</span>
            </div>
            <div class="flex items-center gap-1.5 bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 text-xs">
              <code class="flex-1 font-mono text-[10px] text-zinc-600 truncate pl-1">/status/{{ props.slug }}/rss.xml</code>
              <a 
                :href="`/status/${props.slug}/rss.xml`" 
                target="_blank" 
                class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors"
              >
                Buka
              </a>
              <button 
                type="button" 
                class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                @click="copyRssFeedUrl"
              >
                Salin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clean Flat Modern Footer -->
    <footer class="w-full border-t border-zinc-200/80 py-6 mt-8 bg-white/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>{{ statusData?.branding?.footer_text || 'Powered by SentinelUp — Observability Platform' }}</p>
        <div>
          <a href="/login" class="text-zinc-600 hover:text-zinc-900 font-sans text-xs transition-colors">Akses Operator →</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ToastContainer from './ToastContainer.vue';
import { setToastRef, useToast } from './useToast.js';

const props = defineProps({
  slug: String,
  initialData: Object
});

const toastRef = ref(null);
const { toast } = useToast();

const hoverTooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  isUp: false,
  ms: undefined,
  ratio: undefined,
  date: ''
});

function showTooltip(event, data) {
  const rect = event.target.getBoundingClientRect();
  hoverTooltip.value = {
    visible: true,
    x: rect.left + rect.width / 2,
    y: rect.top,
    isUp: data.status ? data.status === 'up' : data.upCount === data.total,
    ms: data.ms,
    ratio: data.total ? `${data.upCount}/${data.total} sukses` : undefined,
    date: data.status ? `Dicek pada: ${formatTooltipDate(data.date)}` : `Riwayat tanggal: ${data.date}`
  };
}

function hideTooltip() {
  hoverTooltip.value.visible = false;
}

const statusData = ref(props.initialData || null);
const isLocked = ref(Boolean(props.initialData?.page?.is_protected && !props.initialData?.page?.is_unlocked));
const unlockPassword = ref('');
const isUnlocking = ref(false);
const unlockError = ref('');

const isSubscribeModalOpen = ref(false);
const subscriberEmail = ref('');
const isSubscribing = ref(false);
const subscribeMsg = ref('');
const subscribeError = ref('');

const lastUpdated = ref(new Date());
let refreshTimer = null;

function isImageLogo(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

const systemState = computed(() => {
  return statusData.value?.system_status || 'operational';
});

const heroBadgeClass = computed(() => {
  if (systemState.value === 'operational') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (systemState.value === 'degraded') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-rose-50 text-rose-700 border border-rose-200';
});

const heroPulseClass = computed(() => {
  if (systemState.value === 'operational') return 'bg-emerald-500';
  if (systemState.value === 'degraded') return 'bg-amber-500';
  return 'bg-rose-500';
});

const heroBadgeText = computed(() => {
  if (systemState.value === 'operational') return 'Normal Operasional';
  if (systemState.value === 'degraded') return 'Kinerja Terdegradasi';
  return 'Gangguan Aktif';
});

const heroTitle = computed(() => {
  if (systemState.value === 'operational') return 'Semua Sistem & Endpoint Berjalan Normal';
  if (systemState.value === 'degraded') return 'Sebagian Layanan Mengalami Degradasi';
  return 'Gangguan Konektivitas Terdeteksi';
});

const heroSubtitle = computed(() => {
  if (systemState.value === 'operational') return 'Infrastruktur beroperasi dalam toleransi latensi dan ketersediaan optimal. Tidak ditemukan kendala aktif pada komponen inti.';
  if (systemState.value === 'degraded') return 'Beberapa target mengalami peningkatan waktu respons atau kegagalan probe berkala. Tim teknis sedang melakukan investigasi.';
  return 'Kegagalan koneksi terdeteksi pada simpul layanan utama. Penanganan darurat sedang diupayakan.';
});

const upCount = computed(() => {
  return (statusData.value?.monitors || []).filter(m => m.current_status === 'up').length;
});

const downCount = computed(() => {
  return (statusData.value?.monitors || []).filter(m => m.current_status === 'down').length;
});

const pausedCount = computed(() => {
  return (statusData.value?.monitors || []).filter(m => m.current_status === 'paused').length;
});

const avgResponseMs = computed(() => {
  const monitors = statusData.value?.monitors || [];
  const valid = monitors.filter(m => m.avg_latency > 0);
  if (valid.length === 0) return 24;
  const sum = valid.reduce((acc, m) => acc + m.avg_latency, 0);
  return Math.round(sum / valid.length);
});

function monitorIcon(type) {
  switch (type?.toLowerCase()) {
    case 'http':
    case 'https':
      return '🌐';
    case 'tcp':
    case 'port':
      return '🔌';
    case 'ping':
    case 'icmp':
      return '📡';
    case 'dns':
      return '🏷️';
    case 'ssl':
      return '🔒';
    case 'push':
      return '💓';
    default:
      return '🖥️';
  }
}

function latencyColor(latency) {
  if (latency == null) return 'text-zinc-400';
  if (latency < 100) return 'text-emerald-600 font-semibold';
  if (latency < 300) return 'text-amber-600 font-semibold';
  return 'text-rose-600 font-semibold';
}

function intervalLabel(seconds) {
  if (!seconds) return '60s';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)}m`;
}

function statusLabel(status) {
  if (status === 'up') return 'Operasional';
  if (status === 'down') return 'Gangguan';
  if (status === 'paused') return 'Dijeda';
  return 'Degradasi';
}

function relativeTime(dateStr) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `Dicek ${diff} dtk lalu`;
    if (diff < 3600) return `Dicek ${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `Dicek ${Math.floor(diff / 3600)} jam lalu`;
    return `Dicek ${Math.floor(diff / 86400)} hari lalu`;
  } catch {
    return 'Baru saja dicek';
  }
}

function formatTooltipDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('id-ID', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });
}

const averageUptime = computed(() => {
  const monitors = statusData.value?.monitors || [];
  if (monitors.length === 0) return '100.0';
  const total = monitors.reduce((acc, m) => acc + (m.uptime_percentage || 100), 0);
  return (total / monitors.length).toFixed(2);
});

const lastUpdatedFormatted = computed(() => {
  return lastUpdated.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const activeIncidents = computed(() => {
  return (statusData.value?.incidents || []).filter(i => i.status !== 'resolved');
});

const pastIncidents = computed(() => {
  return (statusData.value?.incidents || []).filter(i => i.status === 'resolved');
});

async function submitUnlock() {
  unlockError.value = '';
  isUnlocking.value = true;
  try {
    const targetSlug = props.slug || 'main';
    const res = await fetch(`/api/v1/status-pages/${targetSlug}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: unlockPassword.value })
    });
    const data = await res.json();
    if (res.ok) {
      isLocked.value = false;
      toast.success('Halaman status berhasil dibuka.', 'Akses Terverifikasi');
      fetchStatus();
    } else {
      unlockError.value = data.error || 'Kata sandi tidak valid.';
      toast.error(unlockError.value, 'Akses Ditolak');
    }
  } catch (err) {
    unlockError.value = 'Gagal menghubungi server.';
    toast.error('Terjadi gangguan jaringan saat memverifikasi sandi.', 'Kesalahan Jaringan');
  } finally {
    isUnlocking.value = false;
  }
}

async function submitSubscribe() {
  subscribeMsg.value = '';
  subscribeError.value = '';
  isSubscribing.value = true;
  try {
    const targetSlug = props.slug || 'main';
    const res = await fetch(`/api/v1/status-pages/${targetSlug}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: subscriberEmail.value })
    });
    const data = await res.json();
    if (res.ok) {
      subscribeMsg.value = data.message || 'Berhasil berlangganan notifikasi!';
      toast.success(`Notifikasi akan dikirimkan ke ${subscriberEmail.value}`, 'Berlangganan Aktif');
      subscriberEmail.value = '';
      setTimeout(() => {
        isSubscribeModalOpen.value = false;
        subscribeMsg.value = '';
      }, 1500);
    } else {
      subscribeError.value = data.error || 'Gagal berlangganan.';
      toast.error(subscribeError.value, 'Gagal');
    }
  } catch (err) {
    subscribeError.value = 'Terjadi kesalahan sistem.';
    toast.error('Tidak dapat mendaftarkan email ke sistem saat ini.', 'Kesalahan Sistem');
  } finally {
    isSubscribing.value = false;
  }
}

function copyRssFeedUrl() {
  const targetSlug = props.slug || 'main';
  const url = `${window.location.origin}/status/${targetSlug}/rss.xml`;
  navigator.clipboard.writeText(url);
  toast.info('Tautan RSS Feed berhasil disalin ke papan klip!', 'RSS Tersalin');
}

async function fetchStatus() {
  if (isLocked.value) return;
  const targetSlug = props.slug || 'main';
  try {
    const res = await fetch(`/api/v1/status-pages/${targetSlug}`);
    if (res.ok) {
      statusData.value = await res.json();
      lastUpdated.value = new Date();
    }
  } catch (err) {
    console.error('Fetch status error:', err);
  }
}

onMounted(() => {
  setToastRef(toastRef);
  refreshTimer = setInterval(fetchStatus, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

