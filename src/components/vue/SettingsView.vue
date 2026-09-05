<template>
  <div class="relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200">
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">
    <!-- Top Floating Navigation Bar -->
    <header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <!-- Brand Lockup -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">
          <img v-if="isImageLogo(brandingForm.logo_icon)" :src="brandingForm.logo_icon" alt="Logo" class="w-4 h-4 object-contain rounded-full" />
          <span v-else>{{ brandingForm.logo_icon || '🌐' }}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <h1 class="text-sm font-bold text-zinc-900 tracking-tight">{{ brandingForm.app_name || 'Uptime CJR' }}</h1>
          <span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| Pengaturan Sistem</span>
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
        <a href="/status-pages" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors">
          🌐 Status Pages
        </a>
        <a href="/settings" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors font-semibold">
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
          title="Keluar dari sistem"
          class="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-[11px] transition-colors border border-zinc-200 cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </header>

    <!-- Compact Segmented Tabs Navigation -->
    <div class="flex items-center gap-1 p-1.5 bg-white ring-1 ring-zinc-200/80 rounded-2xl overflow-x-auto text-xs font-medium shadow-xs">
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'branding' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'branding'"
      >
        🎨 Branding
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'status-pages' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'status-pages'"
      >
        🌐 Status Pages
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'channels' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'channels'"
      >
        🔔 Saluran Notifikasi
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'escalation' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'escalation'"
      >
        ⚡ Eskalasi
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'on-call' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'on-call'"
      >
        🧑‍💻 On-Call
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'maintenance' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'maintenance'"
      >
        🔧 Maintenance
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'nodes' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'nodes'"
      >
        🛰️ Probe Nodes
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'security' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'security'"
      >
        🔒 Keamanan &amp; Akun
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'api-keys' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'api-keys'"
      >
        🔑 API Keys
      </button>
      <button 
        class="px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"
        :class="currentTab === 'backup' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'"
        @click="currentTab = 'backup'"
      >
        💾 Backup &amp; Migrasi
      </button>
    </div>

    <!-- TAB 0: Branding & Whitelabel -->
    <section v-if="currentTab === 'branding'" class="space-y-4">
      <div>
        <h2 class="text-base font-semibold text-zinc-900">Kustomisasi Branding &amp; Identitas (Whitelabel)</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Ubah nama aplikasi, logo/ikon, favicon, dan teks footer agar sesuai dengan instansi Anda secara real-time.</p>
      </div>

      <!-- Success Alert Banner -->
      <div v-if="saveSuccess" class="flex items-center justify-between p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium">
        <span>✅ Perubahan branding berhasil disimpan &amp; disinkronkan secara real-time ke seluruh halaman!</span>
        <button class="text-emerald-400 hover:text-emerald-200 text-base leading-none p-1" @click="saveSuccess = false">&times;</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Kolom Kiri: Form -->
        <div class="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
          <div class="border-b border-zinc-200 pb-3">
            <h3 class="text-sm font-semibold text-zinc-900">⚙️ Konfigurasi Identitas</h3>
          </div>

          <!-- Template Preset Cepat -->
          <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Pilihan Template Siap Pakai:</span>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="px-2.5 py-1 text-xs rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 border border-zinc-300 transition-colors" @click="applyPreset('cjr')">
                🌐 Uptime CJR (Diskominfo)
              </button>
              <button type="button" class="px-2.5 py-1 text-xs rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 border border-zinc-300 transition-colors" @click="applyPreset('sentinel')">
                🛡️ SentinelUp (Default)
              </button>
              <button type="button" class="px-2.5 py-1 text-xs rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 border border-zinc-300 transition-colors" @click="applyPreset('cloud')">
                ⚡ CloudOps Monitor
              </button>
            </div>
          </div>

          <form @submit.prevent="saveBranding" class="space-y-4">
            <!-- Nama Aplikasi -->
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-600">Nama Aplikasi (App Name)</label>
              <input 
                v-model="brandingForm.app_name" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" 
                placeholder="Contoh: Uptime CJR" 
                required 
              />
              <span class="block text-[11px] text-zinc-400">Nama ini akan tampil di navbar, judul tab browser, status page, dan notifikasi.</span>
            </div>

            <!-- Slogan / Tagline -->
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-600">Slogan / Tagline Aplikasi</label>
              <input 
                v-model="brandingForm.app_tagline" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" 
                placeholder="Contoh: Sistem Pemantauan Ketersediaan Layanan &amp; Infrastruktur" 
              />
              <span class="block text-[11px] text-zinc-400">Deskripsi singkat di bawah nama aplikasi pada header.</span>
            </div>

            <!-- Logo / Ikon -->
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-600">Logo / Ikon Aplikasi</label>
              <input 
                v-model="brandingForm.logo_icon" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" 
                placeholder="Ketik Emoji (e.g. 🌐, 🛡️, ⚡) atau URL Gambar (https://.../logo.png)" 
                required 
              />
              <div class="flex items-center gap-1.5 pt-1">
                <span class="text-[11px] text-zinc-400">Pilih Ikon Cepat:</span>
                <button 
                  v-for="em in ['🌐', '🛡️', '⚡', '📡', '🏢', '🚀', '💻', '🔒', '📊']" 
                  :key="em" 
                  type="button" 
                  class="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-sm border border-zinc-300 transition-colors"
                  @click="brandingForm.logo_icon = em"
                >
                  {{ em }}
                </button>
              </div>
              <span class="block text-[11px] text-zinc-400">Dapat berupa emoji tunggal ATAU tautan URL gambar (PNG, SVG, JPG, WebP).</span>
            </div>

            <!-- Favicon URL -->
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-600">URL Favicon Kustom (Opsional)</label>
              <input 
                v-model="brandingForm.favicon_url" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white font-mono text-xs" 
                placeholder="https://contoh.id/favicon.ico atau biarkan kosong" 
              />
              <span class="block text-[11px] text-zinc-400">Jika dikosongkan, favicon otomatis digenerate dari logo/emoji di atas.</span>
            </div>

            <!-- Teks Footer -->
            <div class="space-y-1">
              <label class="block text-xs font-medium text-zinc-600">Teks Footer &amp; Hak Cipta</label>
              <textarea 
                v-model="brandingForm.footer_text" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" 
                rows="2" 
                placeholder="Contoh: © 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur"
              ></textarea>
              <span class="block text-[11px] text-zinc-400">Teks hak cipta / atribusi di bagian bawah seluruh halaman.</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 pt-3 border-t border-zinc-200">
              <button type="submit" class="px-4 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm" :disabled="isSaving">
                {{ isSaving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan Branding' }}
              </button>
              <button type="button" class="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 border border-zinc-300 transition-colors" @click="resetBrandingDefaults">
                ↺ Reset ke Default
              </button>
            </div>
          </form>
        </div>

        <!-- Kolom Kanan: Live Preview -->
        <div class="lg:col-span-5 space-y-4">
          <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            <span>👁️ Pratinjau Tampilan Langsung (Live Preview)</span>
          </div>

          <!-- Preview Header -->
          <div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-2">
            <span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Navbar Header:</span>
            <div class="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div class="flex items-center gap-2.5">
                <div class="flex items-center justify-center text-xl">
                  <img v-if="isImageLogo(brandingForm.logo_icon)" :src="brandingForm.logo_icon" alt="Logo" class="w-6 h-6 object-contain rounded" />
                  <span v-else>{{ brandingForm.logo_icon || '🌐' }}</span>
                </div>
                <div>
                  <div class="text-xs font-bold text-zinc-900">{{ brandingForm.app_name || 'Uptime CJR' }}</div>
                  <div class="text-[10px] text-zinc-500 truncate max-w-[160px]">{{ brandingForm.app_tagline || 'Pemantauan Layanan' }}</div>
                </div>
              </div>
              <div class="flex gap-1 text-[11px]">
                <span class="px-2 py-0.5 rounded bg-zinc-900 text-white font-medium">Monitors</span>
                <span class="px-2 py-0.5 rounded text-zinc-500">Status ↗</span>
              </div>
            </div>
          </div>

          <!-- Preview Browser Tab -->
          <div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-2">
            <span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Tab Browser:</span>
            <div class="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-t-lg max-w-xs">
              <div class="text-xs flex items-center justify-center">
                <img v-if="brandingForm.favicon_url && isImageLogo(brandingForm.favicon_url)" :src="brandingForm.favicon_url" class="w-4 h-4 rounded" />
                <span v-else>{{ brandingForm.logo_icon || '🌐' }}</span>
              </div>
              <span class="text-xs text-zinc-700 truncate flex-1">{{ brandingForm.app_name || 'Uptime CJR' }} — Dashboard</span>
              <span class="text-zinc-400 text-xs">&times;</span>
            </div>
          </div>

          <!-- Preview Footer -->
          <div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-2">
            <span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Footer Halaman:</span>
            <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-center text-xs text-zinc-500">
              <p>{{ brandingForm.footer_text || '© 2026 Uptime CJR — Pemantauan Layanan' }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 1: Notification Channels -->
    <section v-if="currentTab === 'channels'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-900">Saluran Notifikasi (Alerts)</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Kirimkan notifikasi instan saat terjadi downtime atau pemulihan ke tim Anda.</p>
        </div>
        <button class="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm" @click="isChannelModalOpen = true">
          + Tambah Saluran
        </button>
      </div>

      <div v-if="channels.length === 0" class="p-8 text-center bg-white border border-zinc-200 rounded-xl">
        <p class="text-xs text-zinc-500">Belum ada saluran notifikasi yang dikonfigurasi.</p>
        <button class="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors" @click="isChannelModalOpen = true">
          + Tambah Telegram / Discord / Webhook
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="c in channels" :key="c.id" class="flex items-center gap-3 p-4 bg-white border border-zinc-200 rounded-xl">
          <div class="text-2xl">
            <span v-if="c.type === 'telegram'">✈️</span>
            <span v-else-if="c.type === 'discord'">🎮</span>
            <span v-else-if="c.type === 'slack'">💬</span>
            <span v-else>🌐</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-zinc-900 truncate">{{ c.name }}</h3>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                {{ c.type }}
              </span>
            </div>
            <p class="text-xs text-zinc-500 font-mono truncate mt-0.5">
              {{ c.type === 'telegram' ? 'Chat ID: ' + (c.config.chatId || '***') : (c.config.url || c.config.webhookUrl || 'Configured') }}
            </p>
          </div>
          <button class="px-2.5 py-1 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors" @click="deleteChannel(c.id)">
            Hapus
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 2: Scoped API Keys -->
    <section v-if="currentTab === 'api-keys'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-900">Scoped API Keys</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Otomatisasi pemantauan via CI/CD pipelines, script Bash, atau Terraform.</p>
        </div>
        <button class="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm" @click="isKeyModalOpen = true">
          + Generate Key Baru
        </button>
      </div>

      <div v-if="newGeneratedKey" class="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2">
        <div class="text-xs font-semibold text-emerald-400">🎉 Key Berhasil Dibuat! Simpan key ini sekarang:</div>
        <div class="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-200">
          <code class="flex-1 text-xs text-zinc-900 font-mono break-all">{{ newGeneratedKey.raw_key }}</code>
          <button class="px-3 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm text-zinc-900 transition-colors" @click="copyKey(newGeneratedKey.raw_key)">
            📋 Salin
          </button>
        </div>
        <p class="text-[11px] text-rose-300">⚠️ Demi keamanan, token ini di-hash dalam database dan tidak akan pernah ditampilkan lagi.</p>
      </div>

      <div v-if="apiKeys.length === 0" class="p-8 text-center bg-white border border-zinc-200 rounded-xl">
        <p class="text-xs text-zinc-500">Belum ada API key yang terdaftar.</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="k in apiKeys" :key="k.id" class="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl">
          <div>
            <h3 class="text-sm font-semibold text-zinc-900">{{ k.name }}</h3>
            <div class="text-xs text-zinc-500 font-mono mt-0.5">{{ k.key_preview }}</div>
            <div class="flex gap-1 mt-1.5">
              <span v-for="s in k.scopes" :key="s" class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 border border-zinc-300 text-zinc-600">
                {{ s }}
              </span>
            </div>
          </div>
          <button class="px-2.5 py-1 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors" @click="revokeKey(k.id)">
            Cabut Key
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 3: Maintenance Windows -->
    <section v-if="currentTab === 'maintenance'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-zinc-900">Maintenance Windows</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Jadwalkan pemeliharaan terencana untuk menekan alarm notifikasi tanpa mematikan pencatatan metrik.</p>
        </div>
        <button class="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm" @click="isMaintModalOpen = true">
          + Jadwalkan Maintenance
        </button>
      </div>

      <div v-if="maintenanceWindows.length === 0" class="p-8 text-center bg-white border border-zinc-200 rounded-xl">
        <p class="text-xs text-zinc-500">Belum ada jadwal maintenance yang terdaftar.</p>
        <button class="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors" @click="isMaintModalOpen = true">
          + Buat Jadwal Baru
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="w in maintenanceWindows" :key="w.id" class="p-4 bg-white border rounded-xl space-y-2" :class="w.is_currently_active ? 'border-amber-500/40 bg-amber-950/20' : 'border-zinc-200'">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase" :class="w.is_currently_active ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-zinc-100 text-zinc-500 border border-zinc-300'">
              {{ w.is_currently_active ? '🟢 SEDANG AKTIF (ALERTS SUPPRESSED)' : 'UPCOMING / RECORDED' }}
            </span>
            <button class="px-2 py-0.5 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors" @click="deleteMaintenance(w.id)">
              Hapus
            </button>
          </div>
          <h3 class="text-sm font-semibold text-zinc-900">{{ w.title }}</h3>
          <p class="text-xs text-zinc-500" v-if="w.description">{{ w.description }}</p>
          <div class="p-2 bg-zinc-50 border border-zinc-200 rounded text-xs font-mono text-zinc-500 space-y-0.5">
            <div>Mulai: {{ new Date(w.start_time).toLocaleString() }}</div>
            <div>Selesai: {{ new Date(w.end_time).toLocaleString() }}</div>
          </div>
          <div class="text-xs text-zinc-500">
            Cakupan: <strong class="text-zinc-700">{{ w.affected_monitor_ids.includes('*') ? 'Semua Monitor' : `${w.affected_monitor_ids.length} Monitor Terpilih` }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 4: Audit Logs -->
    <section v-if="currentTab === 'audit'" class="space-y-4">
      <div>
        <h2 class="text-base font-semibold text-zinc-900">System Audit Trail</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Catatan kejadian keamanan, perubahan konfigurasi, dan rotasi token.</p>
      </div>

      <div class="overflow-x-auto bg-white border border-zinc-200 rounded-xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-zinc-50 text-zinc-500 border-b border-zinc-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th class="px-4 py-2.5 font-medium">Timestamp</th>
              <th class="px-4 py-2.5 font-medium">Action</th>
              <th class="px-4 py-2.5 font-medium">Resource</th>
              <th class="px-4 py-2.5 font-medium">Metadata</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-zinc-100/30 transition-colors">
              <td class="px-4 py-2 text-zinc-500 whitespace-nowrap">{{ new Date(log.created_at).toLocaleString() }}</td>
              <td class="px-4 py-2 font-mono text-emerald-400 whitespace-nowrap">{{ log.action }}</td>
              <td class="px-4 py-2 text-zinc-600 whitespace-nowrap">{{ log.resource_type || '-' }} ({{ log.resource_id ? log.resource_id.slice(0, 10) : '-' }})</td>
              <td class="px-4 py-2 font-mono text-zinc-400 max-w-xs truncate">{{ JSON.stringify(log.metadata) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB: Escalation Policies -->
    <section v-if="currentTab === 'escalation'" class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900">⚡ Kebijakan Eskalasi Pager & Notifikasi</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Atur rantai eskalasi berjenjang jika insiden belum terselesaikan dalam durasi tertentu.</p>
        </div>
        <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs" @click="isEscModalOpen = true">
          + Buat Eskalasi
        </button>
      </div>

      <div v-if="escalations.length === 0" class="p-6 text-center bg-white border border-zinc-200 rounded-xl">
        <p class="text-xs text-zinc-500">Belum ada aturan eskalasi yang dibuat.</p>
        <button class="mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors" @click="isEscModalOpen = true">
          + Buat Aturan Eskalasi Baru
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div v-for="esc in escalations" :key="esc.id" class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-amber-400 text-sm">⚡</span>
              <h3 class="text-xs font-semibold text-zinc-900">{{ esc.name }}</h3>
            </div>
            <button class="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors" @click="deleteEscalation(esc.id)">
              Hapus
            </button>
          </div>
          <div class="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono">
            <span>⏱️ Jeda Eskalasi:</span>
            <span class="text-amber-300 font-medium">{{ esc.wait_minutes }} Menit</span>
          </div>
          <div class="flex flex-wrap gap-1 pt-1">
            <span v-for="chId in esc.channel_ids" :key="chId" class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-600">
              🔔 {{ getChannelName(chId) }}
            </span>
            <span v-if="!esc.channel_ids || esc.channel_ids.length === 0" class="text-[10px] text-zinc-400 italic">
              Semua saluran notifikasi
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: On-Call Schedules -->
    <section v-if="currentTab === 'oncall'" class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900">📞 Roster &amp; Jadwal Piket On-Call</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Kelola penanggung jawab operasional siaga darurat saat terjadi insiden kritis.</p>
        </div>
        <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer" @click="isOnCallModalOpen = true">
          + Tambah Jadwal On-Call
        </button>
      </div>

      <div v-if="onCallSchedules.length === 0" class="p-6 text-center bg-white border border-zinc-200 rounded-xl">
        <p class="text-xs text-zinc-500">Belum ada jadwal on-call yang dikonfigurasi.</p>
        <button class="mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors" @click="isOnCallModalOpen = true">
          + Buat Jadwal Piket Baru
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="s in onCallSchedules" :key="s.id" class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📞</span>
              <h3 class="text-xs font-bold text-zinc-900">{{ s.name }}</h3>
            </div>
            <button class="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors" @click="deleteOnCall(s.id)">
              Hapus
            </button>
          </div>

          <div class="space-y-1 text-xs">
            <div class="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-zinc-900 font-semibold uppercase block">Operator Utama (Primary):</span>
                <span class="text-zinc-900 font-medium text-xs">{{ s.primary_name }}</span>
              </div>
              <span class="font-mono text-xs text-emerald-400">{{ s.primary_contact }}</span>
            </div>

            <div v-if="s.secondary_name" class="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-zinc-500 font-semibold uppercase block">Operator Cadangan (Backup):</span>
                <span class="text-zinc-600 font-medium text-xs">{{ s.secondary_name }}</span>
              </div>
              <span class="font-mono text-xs text-zinc-500">{{ s.secondary_contact }}</span>
            </div>

            <div class="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono">
              <span>Jam Shift: {{ s.shift_start_time }} - {{ s.shift_end_time }} WIB</span>
              <span>{{ s.shift_days.length }} Hari Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Custom Status Pages -->
    <section v-if="currentTab === 'status-pages'" class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900">🌐 Manajemen Halaman Status Publik &amp; Privat</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Buat halaman status kustom untuk divisi, aplikasi publik, klien, atau stakeholder tertentu.</p>
        </div>
        <button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer active:scale-[0.98]" @click="openStatusPageModal()">
          + Buat Status Page
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="p in statusPages" :key="p.id" class="p-4 bg-white border border-zinc-200 rounded-xl space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-zinc-900">{{ p.title }}</h3>
                <span v-if="p.slug === 'main'" class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase">
                  DEFAULT / UTAMA
                </span>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <code class="text-xs text-zinc-900 font-mono">/status/{{ p.slug }}</code>
                <button 
                  @click="copyStatusPageUrl(p.slug)" 
                  class="text-[10px] text-zinc-500 hover:text-zinc-900 px-1.5 py-0.2 rounded bg-zinc-50 border border-zinc-200 transition-colors cursor-pointer"
                  title="Salin URL Lengkap"
                >
                  📋 Salin
                </button>
              </div>
            </div>

            <!-- Badges -->
            <div class="flex items-center gap-1 shrink-0">
              <span 
                class="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider"
                :class="p.is_public ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-100 text-zinc-500 border border-zinc-300'"
              >
                {{ p.is_public ? 'Publik' : 'Privat' }}
              </span>
              <span 
                v-if="p.is_protected" 
                class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                title="Dilindungi dengan kata sandi"
              >
                🔒 Terkunci
              </span>
            </div>
          </div>

          <p class="text-xs text-zinc-500 line-clamp-2">{{ p.description || 'Tidak ada deskripsi tambahan.' }}</p>

          <div class="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
            <span class="text-zinc-500">Cakupan Layanan:</span>
            <span class="text-zinc-700 font-semibold font-mono">
              {{ p.monitors_count > 0 ? `${p.monitors_count} Monitor Terpilih` : 'Seluruh Monitor (*)' }}
            </span>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-zinc-100">
            <div class="flex items-center gap-2">
              <a 
                :href="`/status/${p.slug}`" 
                target="_blank" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors shadow-sm cursor-pointer"
              >
                Buka Halaman ↗
              </a>
              <button 
                @click="openStatusPageModal(p)" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 transition-colors shadow-sm cursor-pointer"
              >
                ⚙️ Konfigurasi
              </button>
            </div>

            <button 
              v-if="p.slug !== 'main'"
              @click="deleteStatusPage(p.id)" 
              class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
            >
              Hapus
            </button>
            <span v-else class="text-[10px] text-zinc-400 italic">Halaman status primer</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Uptime Kuma Import -->
    <section v-if="currentTab === 'import'" class="space-y-3">
      <div>
        <h2 class="text-sm font-semibold text-zinc-900">📥 Migrasi & Impor dari Uptime Kuma</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Unggah atau tempel file backup JSON dari Uptime Kuma untuk mengimpor seluruh monitor secara instan.</p>
      </div>

      <div v-if="importSuccessMsg" class="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-between">
        <span>✅ {{ importSuccessMsg }}</span>
        <button @click="importSuccessMsg = ''" class="text-emerald-400 hover:text-emerald-200 text-sm">&times;</button>
      </div>

      <div v-if="importErrorMsg" class="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center justify-between">
        <span>⚠️ {{ importErrorMsg }}</span>
        <button @click="importErrorMsg = ''" class="text-rose-400 hover:text-rose-200 text-sm">&times;</button>
      </div>

      <div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
        <div>
          <label class="block text-xs font-medium text-zinc-600 mb-1">Pilih File Backup JSON (kuma-backup.json)</label>
          <input 
            type="file" 
            accept=".json,application/json" 
            @change="handleFileUpload" 
            class="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 file:cursor-pointer cursor-pointer bg-zinc-50 border border-zinc-200 rounded-lg p-1.5"
          />
        </div>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-zinc-200"></div>
          <span class="flex-shrink mx-2 text-[10px] text-zinc-400 uppercase tracking-wider">Atau Tempel JSON Mentah</span>
          <div class="flex-grow border-t border-zinc-200"></div>
        </div>

        <div>
          <textarea 
            v-model="importJsonText" 
            rows="6" 
            class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            placeholder='[ { "name": "Google", "type": "http", "url": "https://google.com", "interval": 60 } ]'
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button 
            type="button" 
            :disabled="isImporting || !importJsonText.trim()"
            @click="executeKumaImport" 
            class="px-4 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            {{ isImporting ? '⏳ Mengimpor Monitor...' : '🚀 Mulai Impor Monitor' }}
          </button>
        </div>
      </div>
    </section>

    <!-- TAB: Keamanan & Akun -->
    <section v-if="currentTab === 'security'" class="space-y-3">
      <div>
        <h2 class="text-sm font-semibold text-zinc-900">🔒 Keamanan Akun & Akses</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Kelola kata sandi akun operator administrator SentinelUp.</p>
      </div>

      <div v-if="pwdSuccessMsg" class="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-between">
        <span>✅ {{ pwdSuccessMsg }}</span>
        <button @click="pwdSuccessMsg = ''" class="text-emerald-400 hover:text-emerald-200 text-sm">&times;</button>
      </div>
      <div v-if="pwdErrorMsg" class="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center justify-between">
        <span>⚠️ {{ pwdErrorMsg }}</span>
        <button @click="pwdErrorMsg = ''" class="text-rose-400 hover:text-rose-200 text-sm">&times;</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Password Form -->
        <div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
          <h3 class="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Ganti Kata Sandi</h3>
          <form @submit.prevent="submitPasswordChange" class="space-y-2.5">
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1">Kata Sandi Saat Ini</label>
              <input 
                v-model="pwdForm.oldPassword" 
                type="password" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                required 
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1">Kata Sandi Baru</label>
              <input 
                v-model="pwdForm.newPassword" 
                type="password" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                placeholder="Minimal 8 karakter"
                required 
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input 
                v-model="pwdForm.confirmPassword" 
                type="password" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                required 
              />
            </div>
            <div class="pt-1">
              <button 
                type="submit" 
                :disabled="isUpdatingPwd"
                class="w-full py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {{ isUpdatingPwd ? '⏳ Menyimpan...' : '🔐 Perbarui Kata Sandi' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Security Info Card -->
        <div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
          <h3 class="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Status Keamanan Sistem</h3>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span class="text-zinc-500">Akun Aktif:</span>
              <span class="font-mono text-zinc-700">{{ props.currentUser?.email || 'admin@cjr.go.id' }}</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span class="text-zinc-500">Peran / Role:</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Superadmin</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span class="text-zinc-500">Registrasi Publik:</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Nonaktif (Anti-Abuse)</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span class="text-zinc-500">Enkripsi Kredensial:</span>
              <span class="text-zinc-600 font-mono text-[11px]">Node.js Native Scrypt</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Tim Operator & Hak Akses (RBAC) -->
    <section v-if="currentTab === 'operators'" class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900">👥 Manajemen Tim Operator &amp; Hak Akses (RBAC)</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Kelola akun operator dan tingkat hak akses ke SentinelUp. Registrasi publik dinonaktifkan demi keamanan.</p>
        </div>
        <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer" @click="isUserModalOpen = true">
          + Tambah Operator
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="u in users" :key="u.id" class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-zinc-700 flex items-center justify-center font-bold text-xs">
                {{ (u.full_name || u.email || 'O')[0].toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-zinc-900 truncate">{{ u.full_name || 'Operator' }}</div>
                <div class="text-[11px] text-zinc-500 font-mono truncate">{{ u.email }}</div>
              </div>
            </div>
            <span 
              class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
              :class="{
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': u.role === 'admin',
                'bg-zinc-100 text-zinc-800 border border-zinc-200': u.role === 'editor',
                'bg-zinc-100 text-zinc-500 border border-zinc-300': u.role === 'viewer'
              }"
            >
              {{ u.role }}
            </span>
          </div>

          <div class="p-2 rounded bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-0.5">
            <div class="flex justify-between">
              <span>Login Terakhir:</span>
              <span class="text-zinc-700 font-mono">{{ u.last_login_at ? new Date(u.last_login_at).toLocaleString('id-ID') : 'Belum pernah' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Terdaftar:</span>
              <span class="text-zinc-500 font-mono">{{ new Date(u.created_at).toLocaleDateString('id-ID') }}</span>
            </div>
          </div>

          <div class="flex justify-end pt-1">
            <button 
              v-if="u.id !== props.currentUser?.id"
              @click="deleteUser(u.id)"
              class="px-2 py-1 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
            >
              Hapus Akses
            </button>
            <span v-else class="text-[10px] text-zinc-400 italic">Sesi aktif saat ini</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: Multi-Region Probe Nodes -->
    <section v-if="currentTab === 'probes'" class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900">🛰️ Multi-Region Probe Nodes</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Node pemantau terdistribusi lintas lokasi/datacenter untuk mencegah false positive dan mengonfirmasi status uptime.</p>
        </div>
        <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer" @click="isProbeModalOpen = true">
          + Daftarkan Probe Node
        </button>
      </div>

      <div v-if="newProbeSecret" class="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2">
        <div class="text-xs font-semibold text-emerald-400">🎉 Probe Node Baru Berhasil Didaftarkan! Simpan token ini untuk agen:</div>
        <div class="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-200">
          <code class="flex-1 text-xs text-zinc-900 font-mono break-all">{{ newProbeSecret }}</code>
          <button class="px-3 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm text-zinc-900 transition-colors cursor-pointer" @click="copyText(newProbeSecret)">
            📋 Salin
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="p in probeNodes" :key="p.id" class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xs font-bold text-zinc-900">{{ p.name }}</h3>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-zinc-100 text-zinc-700 border border-zinc-300">
                  {{ p.region }}
                </span>
              </div>
              <p class="text-[11px] text-zinc-500 mt-0.5">ID: <code class="text-zinc-600 font-mono">{{ p.id }}</code></p>
            </div>
            <span 
              class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
              :class="p.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
            >
              ● {{ p.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] p-2 rounded bg-zinc-50 border border-zinc-200">
            <div>
              <span class="text-zinc-400 block">Latensi Probe:</span>
              <span class="text-zinc-700 font-mono font-semibold">{{ p.latency_ms || 4 }} ms</span>
            </div>
            <div>
              <span class="text-zinc-400 block">Heartbeat Terakhir:</span>
              <span class="text-zinc-700 font-mono">{{ p.last_heartbeat_at ? new Date(p.last_heartbeat_at).toLocaleTimeString('id-ID') : 'Aktif' }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-1">
            <span class="text-[10px] text-zinc-400 font-mono">Target: {{ p.region }}</span>
            <button 
              v-if="p.id !== 'prb_primary'"
              @click="deleteProbeNode(p.id)"
              class="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
            >
              Hapus
            </button>
            <span v-else class="text-[10px] text-zinc-900 font-medium">Node Primer</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB: 1-Click Database Backup & Export -->
    <section v-if="currentTab === 'backup'" class="space-y-3">
      <div>
        <h2 class="text-sm font-semibold text-zinc-900">💾 Backup Database &amp; Ekspor Konfigurasi</h2>
        <p class="text-xs text-zinc-500 mt-0.5">Unduh snapshot database lengkap atau ekspor konfigurasi SentinelUp dalam format JSON untuk arsip dan pemulihan cepat.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- SQLite Full Database Backup -->
        <div class="p-4 bg-white border border-zinc-200 rounded-xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🗄️</span>
            <div>
              <h3 class="text-xs font-bold text-zinc-900">Backup Database SQLite (.db)</h3>
              <p class="text-[11px] text-zinc-500">Salinan snapshot file binary SQLite dengan seluruh data historis, check results, dan konfigurasi.</p>
            </div>
          </div>
          <div class="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <div class="flex justify-between">
              <span class="text-zinc-500">Format:</span>
              <span class="font-mono text-zinc-700">SQLite 3 / WAL Checkpointed</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-500">Penggunaan:</span>
              <span class="text-zinc-600">Disaster Recovery 1-Klik</span>
            </div>
          </div>
          <a 
            href="/api/v1/backup/export?format=sqlite" 
            download 
            class="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            📥 Unduh File Database (.db)
          </a>
        </div>

        <!-- JSON Configuration Export -->
        <div class="p-4 bg-white border border-zinc-200 rounded-xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📋</span>
            <div>
              <h3 class="text-xs font-bold text-zinc-900">Ekspor Konfigurasi JSON</h3>
              <p class="text-[11px] text-zinc-500">Ekspor teks JSON seluruh monitor, aturan notifikasi, eskalasi, jadwal on-call, dan halaman status.</p>
            </div>
          </div>
          <div class="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
            <div class="flex justify-between">
              <span class="text-zinc-500">Format:</span>
              <span class="font-mono text-emerald-300">Standard JSON</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-500">Penggunaan:</span>
              <span class="text-zinc-600">Migrasi &amp; Audit Konfigurasi</span>
            </div>
          </div>
          <a 
            href="/api/v1/backup/export?format=json" 
            download 
            class="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 border border-zinc-300 transition-colors shadow-xs cursor-pointer"
          >
            📥 Unduh Konfigurasi (JSON)
          </a>
        </div>
      </div>
    </section>

    <!-- Channel Modal -->
    <div v-if="isChannelModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isChannelModalOpen = false">
      <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 class="text-sm font-semibold text-zinc-900">Tambah Saluran Notifikasi</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isChannelModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="submitNewChannel" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipe Saluran</label>
            <select v-model="channelForm.type" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
              <option value="discord">Discord Webhook</option>
              <option value="telegram">Telegram Bot</option>
              <option value="slack">Slack Webhook</option>
              <option value="webhook">Generic HTTP Webhook</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Saluran</label>
            <input v-model="channelForm.name" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. #ops-alerts" required />
          </div>

          <div v-if="channelForm.type === 'telegram'" class="space-y-3">
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Bot Token Telegram</label>
              <input v-model="channelForm.botToken" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="123456:ABC-DEF..." required />
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Telegram Chat ID</label>
              <input v-model="channelForm.chatId" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="-100123456789" required />
            </div>
          </div>

          <div v-else class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Webhook URL</label>
            <input v-model="channelForm.url" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="https://discord.com/api/webhooks/..." required />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors" @click="isChannelModalOpen = false">Batal</button>
            <button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- API Key Modal -->
    <div v-if="isKeyModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isKeyModalOpen = false">
      <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 class="text-sm font-semibold text-zinc-900">Generate Scoped API Key</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isKeyModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="submitNewApiKey" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Key / Keperluan</label>
            <input v-model="keyForm.name" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. GitHub Actions CI Pipeline" required />
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Scopes (Izin Akses)</label>
            <div class="space-y-1 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-xs">
              <label class="flex items-center gap-2 cursor-pointer text-zinc-600">
                <input type="checkbox" value="*" v-model="keyForm.scopes" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" /> Full Admin Access (*)
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-zinc-600">
                <input type="checkbox" value="monitors:read" v-model="keyForm.scopes" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" /> monitors:read
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-zinc-600">
                <input type="checkbox" value="monitors:write" v-model="keyForm.scopes" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" /> monitors:write
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-zinc-600">
                <input type="checkbox" value="status_pages:manage" v-model="keyForm.scopes" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" /> status_pages:manage
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors" @click="isKeyModalOpen = false">Batal</button>
            <button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm">Generate</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Maintenance Window Modal -->
    <div v-if="isMaintModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isMaintModalOpen = false">
      <div class="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h3 class="text-sm font-semibold text-zinc-900">Jadwalkan Maintenance Window</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isMaintModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="submitMaintenance" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Judul Maintenance</label>
            <input v-model="maintForm.title" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Core Switch &amp; Database Upgrade" required />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Deskripsi (Opsional)</label>
            <textarea v-model="maintForm.description" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" rows="2" placeholder="Routine OS patching and migration..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Waktu Mulai</label>
              <input v-model="maintForm.start_time" type="datetime-local" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required />
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Waktu Selesai</label>
              <input v-model="maintForm.end_time" type="datetime-local" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Monitor yang Terdampak</label>
            <select v-model="maintForm.scope" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
              <option value="all">Semua Monitor (*)</option>
              <option value="select">Pilih Monitor Tertentu</option>
            </select>
          </div>

          <div v-if="maintForm.scope === 'select'" class="max-h-36 overflow-y-auto bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 space-y-1">
            <label v-for="m in monitors" :key="m.id" class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
              <input type="checkbox" :value="m.id" v-model="maintForm.selectedIds" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
              <span>{{ m.name }} ({{ m.target }})</span>
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors" @click="isMaintModalOpen = false">Batal</button>
            <button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm">Jadwalkan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Escalation Modal -->
    <div v-if="isEscModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isEscModalOpen = false">
      <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <h3 class="text-sm font-semibold text-zinc-900">Buat Kebijakan Eskalasi</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isEscModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="submitNewEscalation" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Kebijakan</label>
            <input v-model="escForm.name" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Eskalasi Insiden Kritis > 15 Menit" required />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Jeda Waktu Tunggu (Menit)</label>
            <input v-model.number="escForm.wait_minutes" type="number" min="1" max="1440" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Saluran Notifikasi yang Dituju</label>
            <div class="max-h-36 overflow-y-auto bg-zinc-50 p-2 rounded-lg border border-zinc-200 space-y-1">
              <label v-for="c in channels" :key="c.id" class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
                <input type="checkbox" :value="c.id" v-model="escForm.channel_ids" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                <span>{{ c.name }} ({{ c.type }})</span>
              </label>
              <div v-if="channels.length === 0" class="text-xs text-zinc-400 italic p-1">Belum ada saluran. Buat saluran notifikasi terlebih dahulu.</div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors" @click="isEscModalOpen = false">Batal</button>
            <button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- On-Call Modal -->
    <div v-if="isOnCallModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isOnCallModalOpen = false">
      <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <h3 class="text-sm font-semibold text-zinc-900">Tambah Jadwal On-Call</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isOnCallModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="submitNewOnCall" class="space-y-2.5">
          <div>
            <label class="block text-xs font-medium text-zinc-500 mb-0.5">Nama Tim / Shift</label>
            <input v-model="onCallForm.name" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Piket NOC &amp; Server Tier-1" required />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-0.5">Operator Utama</label>
              <input v-model="onCallForm.primary_name" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Nama lengkap" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-0.5">Kontak / HP Utama</label>
              <input v-model="onCallForm.primary_contact" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="+62812... / Telegram" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-0.5">Operator Cadangan (Opsional)</label>
              <input v-model="onCallForm.secondary_name" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Nama cadangan" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-0.5">Kontak Cadangan</label>
              <input v-model="onCallForm.secondary_contact" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Kontak cadangan" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-0.5">Jam Mulai Shift</label>
              <input v-model="onCallForm.shift_start_time" type="time" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-0.5">Jam Selesai Shift</label>
              <input v-model="onCallForm.shift_end_time" type="time" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer" @click="isOnCallModalOpen = false">Batal</button>
            <button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer">Simpan Jadwal</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Status Page Creation Modal -->
    <div v-if="isStatusPageModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isStatusPageModalOpen = false">
      <div class="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <h3 class="text-sm font-semibold text-zinc-900">Buat Halaman Status Kustom</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isStatusPageModalOpen = false">&times;</button>
        </div>

        <form @submit.prevent="submitNewStatusPage" class="space-y-2.5">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Judul Halaman Status</label>
            <input 
              v-model="statusPageForm.title" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder="e.g. Status Layanan Publik &amp; Warga" 
              required 
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">URL Slug Kustom</label>
            <div class="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
              <span class="px-2.5 py-1.5 text-xs text-zinc-400 font-mono bg-white border-r border-zinc-200">/status/</span>
              <input 
                v-model="statusPageForm.slug" 
                class="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none" 
                placeholder="layanan-publik" 
                required 
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Deskripsi Singkat</label>
            <textarea 
              v-model="statusPageForm.description" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              rows="2" 
              placeholder="Informasi status operasional sistem pelayanan publik Diskominfo..."
            ></textarea>
          </div>

          <!-- Scope: All vs Specific Monitors -->
          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Pilihan Monitor</label>
            <select v-model="statusPageForm.scope" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
              <option value="all">Semua Monitor Aktif (*)</option>
              <option value="select">Pilih Monitor Tertentu</option>
            </select>
          </div>

          <div v-if="statusPageForm.scope === 'select'" class="max-h-32 overflow-y-auto bg-zinc-50 p-2 rounded-lg border border-zinc-200 space-y-1">
            <label v-for="m in monitors" :key="m.id" class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
              <input type="checkbox" :value="m.id" v-model="statusPageForm.selectedMonitorIds" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
              <span>{{ m.name }} ({{ m.target }})</span>
            </label>
          </div>

          <!-- Password Protection Toggle -->
          <div class="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
              <input type="checkbox" v-model="statusPageForm.is_protected" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
              <span>🔒 Kunci halaman dengan Kata Sandi (Akses Terbatas)</span>
            </label>
            <input 
              v-if="statusPageForm.is_protected"
              v-model="statusPageForm.password" 
              type="password" 
              placeholder="Masukkan kata sandi pembuka..." 
              class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              required 
            />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer" @click="isStatusPageModalOpen = false">Batal</button>
            <button type="submit" :disabled="isSavingStatusPage" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer">
              {{ isSavingStatusPage ? 'Menyimpan...' : 'Simpan Halaman Status' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- User / Operator Creation Modal -->
    <div v-if="isUserModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isUserModalOpen = false">
      <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <h3 class="text-sm font-semibold text-zinc-900">Tambah Akun Operator Baru</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isUserModalOpen = false">&times;</button>
        </div>

        <form @submit.prevent="submitNewUser" class="space-y-2.5">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Nama Lengkap Operator</label>
            <input 
              v-model="userForm.full_name" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder="e.g. Budi Santoso" 
              required 
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Alamat Email Resmi</label>
            <input 
              v-model="userForm.email" 
              type="email"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder="budi@cjr.go.id" 
              required 
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Peran &amp; Hak Akses (Role)</label>
            <select v-model="userForm.role" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
              <option value="admin">Administrator (Akses Penuh Seluruh Sistem)</option>
              <option value="editor">Editor (Kelola Monitor &amp; Insiden)</option>
              <option value="viewer">Viewer (Hanya Lihat Dashboard)</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Kata Sandi Awal</label>
            <input 
              v-model="userForm.password" 
              type="password"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder="Minimal 8 karakter" 
              required 
            />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer" @click="isUserModalOpen = false">Batal</button>
            <button type="submit" :disabled="isSavingUser" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer">
              {{ isSavingUser ? 'Menyimpan...' : 'Simpan Operator' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Probe Node Registration Modal -->
    <div v-if="isProbeModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="isProbeModalOpen = false">
      <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-200 pb-2.5">
          <h3 class="text-sm font-semibold text-zinc-900">Daftarkan Probe Node Baru</h3>
          <button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none" @click="isProbeModalOpen = false">&times;</button>
        </div>

        <form @submit.prevent="submitNewProbe" class="space-y-2.5">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Nama Probe Node</label>
            <input 
              v-model="probeForm.name" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder="e.g. Edge Probe SGP Cloud" 
              required 
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-zinc-600">Region Identifier</label>
            <input 
              v-model="probeForm.region" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder="sgp-cloud, jkt-idc, cjr-edge" 
              required 
            />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer" @click="isProbeModalOpen = false">Batal</button>
            <button type="submit" :disabled="isSavingProbe" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer">
              {{ isSavingProbe ? 'Mendaftarkan...' : 'Daftarkan Node' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom In-App Confirm Modal (Never auto-dismisses) -->
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
    <!-- Flat Modern Footer -->
    <footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
        <p>{{ brandingForm.footer_text || 'Powered by SentinelUp — Observability Platform' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ConfirmModal from './ConfirmModal.vue';

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

const currentTab = ref('branding');
const channels = ref([]);
const apiKeys = ref([]);
const auditLogs = ref([]);
const maintenanceWindows = ref([]);
const monitors = ref([]);
const newGeneratedKey = ref(null);

const isChannelModalOpen = ref(false);
const isKeyModalOpen = ref(false);
const isMaintModalOpen = ref(false);

const channelForm = ref({ type: 'discord', name: '', url: '', botToken: '', chatId: '' });
const keyForm = ref({ name: '', scopes: ['*'] });

// Branding Whitelabel state
const isSaving = ref(false);
const saveSuccess = ref(false);
const brandingForm = ref({
  app_name: 'Uptime CJR',
  app_tagline: 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur',
  footer_text: '© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur',
  logo_icon: '🌐',
  favicon_url: ''
});

function isImageLogo(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image'));
}

function applyPreset(preset) {
  if (preset === 'cjr') {
    brandingForm.value.app_name = 'Uptime CJR';
    brandingForm.value.app_tagline = 'Sistem Pemantauan Ketersediaan Layanan & Infrastruktur';
    brandingForm.value.footer_text = '© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur';
    brandingForm.value.logo_icon = '🌐';
    brandingForm.value.favicon_url = '';
  } else if (preset === 'sentinel') {
    brandingForm.value.app_name = 'SentinelUp';
    brandingForm.value.app_tagline = 'Advanced Uptime & Observability';
    brandingForm.value.footer_text = 'Powered by SentinelUp — High Availability Uptime & Observability';
    brandingForm.value.logo_icon = '🛡️';
    brandingForm.value.favicon_url = '';
  } else if (preset === 'cloud') {
    brandingForm.value.app_name = 'CloudOps Monitor';
    brandingForm.value.app_tagline = 'Real-time Cloud & Microservice Reliability';
    brandingForm.value.footer_text = 'CloudOps Platform — Continuous Service Health';
    brandingForm.value.logo_icon = '⚡';
    brandingForm.value.favicon_url = '';
  }
}

async function fetchBranding() {
  try {
    const res = await fetch('/api/v1/settings/branding');
    if (res.ok) {
      const data = await res.json();
      brandingForm.value = { ...brandingForm.value, ...data };
    }
  } catch (err) {
    console.error('Fetch branding error:', err);
  }
}

async function saveBranding() {
  isSaving.value = true;
  saveSuccess.value = false;
  try {
    const res = await fetch('/api/v1/settings/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brandingForm.value)
    });
    if (res.ok) {
      const updated = await res.json();
      brandingForm.value = updated;
      saveSuccess.value = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('branding_updated', { detail: updated }));
        document.title = `${updated.app_name} — Pengaturan & Identitas`;
      }
      setTimeout(() => { saveSuccess.value = false; }, 4000);
    }
  } catch (err) {
    console.error('Save branding error:', err);
  } finally {
    isSaving.value = false;
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

function resetBrandingDefaults() {
  openConfirmDialog({
    title: 'Reset Konfigurasi Branding',
    message: 'Kembalikan seluruh konfigurasi identitas & branding ke standar default SentinelUp?',
    confirmText: 'Ya, Reset Default',
    isDanger: false,
    action: async () => {
      applyPreset('sentinel');
      await saveBranding();
    }
  });
}

const now = new Date();
const later = new Date(now.getTime() + 2 * 3600 * 1000);
const toLocalIso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const maintForm = ref({
  title: '',
  description: '',
  start_time: toLocalIso(now),
  end_time: toLocalIso(later),
  scope: 'all',
  selectedIds: []
});

async function fetchChannels() {
  try {
    const res = await fetch('/api/v1/channels');
    if (res.ok) channels.value = await res.json();
  } catch (err) {
    console.error('Fetch channels error:', err);
  }
}

async function fetchKeys() {
  try {
    const res = await fetch('/api/v1/api-keys');
    if (res.ok) apiKeys.value = await res.json();
  } catch (err) {
    console.error('Fetch keys error:', err);
  }
}

async function fetchAudit() {
  try {
    const res = await fetch('/api/v1/audit-logs');
    if (res.ok) auditLogs.value = await res.json();
  } catch (err) {
    console.error('Fetch audit error:', err);
  }
}

async function submitNewChannel() {
  try {
    const config = {};
    if (channelForm.value.type === 'telegram') {
      config.botToken = channelForm.value.botToken;
      config.chatId = channelForm.value.chatId;
    } else {
      config.url = channelForm.value.url;
      config.webhookUrl = channelForm.value.url;
    }

    const res = await fetch('/api/v1/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: channelForm.value.type,
        name: channelForm.value.name,
        config
      })
    });

    if (res.ok) {
      isChannelModalOpen.value = false;
      channelForm.value = { type: 'discord', name: '', url: '', botToken: '', chatId: '' };
      fetchChannels();
    }
  } catch (err) {
    console.error('Submit channel error:', err);
  }
}

function deleteChannel(id) {
  openConfirmDialog({
    title: 'Hapus Saluran Notifikasi',
    message: 'Apakah Anda yakin ingin menghapus saluran notifikasi ini? Notifikasi downtime tidak akan dikirimkan ke saluran ini lagi.',
    confirmText: 'Ya, Hapus Saluran',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/channels/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchChannels();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus saluran' }));
          alert(err.error || 'Gagal menghapus saluran');
        }
      } catch (err) {
        console.error('Delete channel error:', err);
      }
    }
  });
}

async function submitNewApiKey() {
  try {
    const res = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keyForm.value)
    });

    if (res.ok) {
      newGeneratedKey.value = await res.json();
      isKeyModalOpen.value = false;
      keyForm.value = { name: '', scopes: ['*'] };
      fetchKeys();
    }
  } catch (err) {
    console.error('Generate key error:', err);
  }
}

function revokeKey(id) {
  openConfirmDialog({
    title: 'Cabut API Key',
    message: 'Cabut API Key ini? Script, automasi, atau pipeline CI/CD yang menggunakan key ini akan langsung ditolak aksesnya.',
    confirmText: 'Ya, Cabut Key',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/api-keys?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchKeys();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal mencabut key' }));
          alert(err.error || 'Gagal mencabut key');
        }
      } catch (err) {
        console.error('Revoke key error:', err);
      }
    }
  });
}

function copyKey(key) {
  navigator.clipboard.writeText(key);
  alert('API Key copied to clipboard!');
}

async function fetchMaintenance() {
  try {
    const res = await fetch('/api/v1/maintenance');
    if (res.ok) maintenanceWindows.value = await res.json();
  } catch (err) {
    console.error('Fetch maintenance error:', err);
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

async function submitMaintenance() {
  try {
    const affected = maintForm.value.scope === 'all' ? ['*'] : maintForm.value.selectedIds;
    const res = await fetch('/api/v1/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: maintForm.value.title,
        description: maintForm.value.description,
        start_time: new Date(maintForm.value.start_time).toISOString(),
        end_time: new Date(maintForm.value.end_time).toISOString(),
        affected_monitor_ids: affected
      })
    });

    if (res.ok) {
      isMaintModalOpen.value = false;
      maintForm.value.title = '';
      maintForm.value.description = '';
      fetchMaintenance();
    }
  } catch (err) {
    console.error('Submit maintenance error:', err);
  }
}

function deleteMaintenance(id) {
  openConfirmDialog({
    title: 'Hapus Jadwal Pemeliharaan',
    message: 'Hapus jadwal maintenance ini? Pemantauan dan alarm untuk monitor terkait akan kembali normal.',
    confirmText: 'Ya, Hapus',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/maintenance?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchMaintenance();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus maintenance' }));
          alert(err.error || 'Gagal menghapus maintenance');
        }
      } catch (err) {
        console.error('Delete maintenance error:', err);
      }
    }
  });
}

// Escalations state
const escalations = ref([]);
const isEscModalOpen = ref(false);
const escForm = ref({ name: '', wait_minutes: 15, channel_ids: [] });

function getChannelName(chId) {
  const ch = channels.value.find(c => c.id === chId);
  return ch ? ch.name : chId;
}

async function fetchEscalations() {
  try {
    const res = await fetch('/api/v1/escalation');
    if (res.ok) escalations.value = await res.json();
  } catch (err) {
    console.error('Fetch escalations error:', err);
  }
}

async function submitNewEscalation() {
  try {
    const res = await fetch('/api/v1/escalation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(escForm.value)
    });
    if (res.ok) {
      isEscModalOpen.value = false;
      escForm.value = { name: '', wait_minutes: 15, channel_ids: [] };
      fetchEscalations();
    }
  } catch (err) {
    console.error('Submit escalation error:', err);
  }
}

function deleteEscalation(id) {
  openConfirmDialog({
    title: 'Hapus Aturan Eskalasi',
    message: 'Apakah Anda yakin ingin menghapus aturan eskalasi insiden ini?',
    confirmText: 'Ya, Hapus',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/escalation?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchEscalations();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus eskalasi' }));
          alert(err.error || 'Gagal menghapus eskalasi');
        }
      } catch (err) {
        console.error('Delete escalation error:', err);
      }
    }
  });
}

// Uptime Kuma Import state
const importJsonText = ref('');
const isImporting = ref(false);
const importSuccessMsg = ref('');
const importErrorMsg = ref('');

function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    importJsonText.value = e.target.result;
  };
  reader.readAsText(file);
}

async function executeKumaImport() {
  importSuccessMsg.value = '';
  importErrorMsg.value = '';
  isImporting.value = true;
  try {
    const parsed = JSON.parse(importJsonText.value);
    const res = await fetch('/api/v1/import/kuma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: parsed })
    });
    const result = await res.json();
    if (res.ok) {
      importSuccessMsg.value = `Berhasil mengimpor ${result.imported_count} monitor dari Uptime Kuma!`;
      importJsonText.value = '';
      fetchMonitors();
    } else {
      importErrorMsg.value = result.error || 'Gagal mengimpor monitor';
    }
  } catch (err) {
    importErrorMsg.value = 'Format JSON tidak valid atau gagal diproses: ' + err.message;
  } finally {
    isImporting.value = false;
  }
}

// Password change state
const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const isUpdatingPwd = ref(false);
const pwdSuccessMsg = ref('');
const pwdErrorMsg = ref('');

async function submitPasswordChange() {
  pwdSuccessMsg.value = '';
  pwdErrorMsg.value = '';
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    pwdErrorMsg.value = 'Konfirmasi kata sandi baru tidak cocok!';
    return;
  }
  if (pwdForm.value.newPassword.length < 8) {
    pwdErrorMsg.value = 'Kata sandi baru minimal 8 karakter!';
    return;
  }

  isUpdatingPwd.value = true;
  try {
    const res = await fetch('/api/v1/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        old_password: pwdForm.value.oldPassword,
        new_password: pwdForm.value.newPassword
      })
    });
    const data = await res.json();
    if (res.ok) {
      pwdSuccessMsg.value = 'Kata sandi berhasil diperbarui!';
      pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    } else {
      pwdErrorMsg.value = data.error || 'Gagal memperbarui kata sandi.';
    }
  } catch (err) {
    pwdErrorMsg.value = err.message || 'Terjadi kesalahan sistem.';
  } finally {
    isUpdatingPwd.value = false;
  }
}

// On-Call Schedules state
const onCallSchedules = ref([]);
const isOnCallModalOpen = ref(false);
const onCallForm = ref({
  name: '',
  primary_name: '',
  primary_contact: '',
  secondary_name: '',
  secondary_contact: '',
  shift_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
  shift_start_time: '08:00',
  shift_end_time: '20:00'
});

async function fetchOnCall() {
  try {
    const res = await fetch('/api/v1/on-call');
    if (res.ok) onCallSchedules.value = await res.json();
  } catch (err) {
    console.error('Fetch on-call error:', err);
  }
}

async function submitNewOnCall() {
  try {
    const res = await fetch('/api/v1/on-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(onCallForm.value)
    });
    if (res.ok) {
      isOnCallModalOpen.value = false;
      onCallForm.value = {
        name: '',
        primary_name: '',
        primary_contact: '',
        secondary_name: '',
        secondary_contact: '',
        shift_days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        shift_start_time: '08:00',
        shift_end_time: '20:00'
      };
      fetchOnCall();
    }
  } catch (err) {
    console.error('Submit on-call error:', err);
  }
}

function deleteOnCall(id) {
  openConfirmDialog({
    title: 'Hapus Jadwal On-Call',
    message: 'Apakah Anda yakin ingin menghapus jadwal piket on-call ini?',
    confirmText: 'Ya, Hapus Jadwal',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/on-call?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchOnCall();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus jadwal on-call' }));
          alert(err.error || 'Gagal menghapus jadwal on-call');
        }
      } catch (err) {
        console.error('Delete on-call error:', err);
      }
    }
  });
}

// Custom Status Pages state
const statusPages = ref([]);
const isStatusPageModalOpen = ref(false);
const isSavingStatusPage = ref(false);
const editingStatusPageId = ref(null);
const statusPageForm = ref({
  title: '',
  slug: '',
  description: '',
  is_public: true,
  is_protected: false,
  password: '',
  scope: 'all',
  selectedMonitorIds: []
});

function openStatusPageModal(p = null) {
  if (p && p.id) {
    editingStatusPageId.value = p.id;
    statusPageForm.value = {
      title: p.title || '',
      slug: p.slug || '',
      description: p.description || '',
      is_public: Boolean(p.is_public),
      is_protected: Boolean(p.is_protected),
      password: '', // Kosongkan password lama, hanya isi jika ingin diubah
      scope: p.monitors_count > 0 ? 'select' : 'all',
      selectedMonitorIds: p.monitors_count > 0 ? p.monitor_ids || [] : []
    };
  } else {
    editingStatusPageId.value = null;
    statusPageForm.value = {
      title: '',
      slug: '',
      description: '',
      is_public: true,
      is_protected: false,
      password: '',
      scope: 'all',
      selectedMonitorIds: []
    };
  }
  isStatusPageModalOpen.value = true;
}

async function fetchStatusPages() {
  try {
    const res = await fetch('/api/v1/status-pages');
    if (res.ok) {
      statusPages.value = await res.json();
    }
  } catch (err) {
    console.error('Fetch status pages error:', err);
  }
}

async function submitNewStatusPage() {
  isSavingStatusPage.value = true;
  try {
    const monitorIds = statusPageForm.value.scope === 'all' ? [] : statusPageForm.value.selectedMonitorIds;
    const isEditing = Boolean(editingStatusPageId.value);
    const url = isEditing ? `/api/v1/status-pages/${editingStatusPageId.value}` : '/api/v1/status-pages';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: statusPageForm.value.title,
        slug: statusPageForm.value.slug,
        description: statusPageForm.value.description,
        is_public: statusPageForm.value.is_public,
        password: statusPageForm.value.is_protected ? statusPageForm.value.password : '',
        monitor_ids: monitorIds
      })
    });

    if (res.ok) {
      isStatusPageModalOpen.value = false;
      editingStatusPageId.value = null;
      statusPageForm.value = {
        title: '', slug: '', description: '',
        is_public: true, is_protected: false,
        password: '', scope: 'all', selectedMonitorIds: []
      };
      await fetchStatusPages();
    } else {
      const err = await res.json();
      alert(err.error || 'Gagal membuat status page');
    }
  } catch (err) {
    console.error('Submit status page error:', err);
    alert('Terjadi kesalahan sistem saat membuat status page.');
  } finally {
    isSavingStatusPage.value = false;
  }
}

function deleteStatusPage(id) {
  openConfirmDialog({
    title: 'Hapus Halaman Status',
    message: 'Apakah Anda yakin ingin menghapus halaman status ini? URL publik untuk halaman ini tidak akan dapat diakses lagi.',
    confirmText: 'Ya, Hapus Halaman Status',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/status-pages?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchStatusPages();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus status page' }));
          alert(err.error || 'Gagal menghapus status page');
        }
      } catch (err) {
        console.error('Delete status page error:', err);
      }
    }
  });
}

function copyStatusPageUrl(slug) {
  const url = `${window.location.origin}/status/${slug}`;
  navigator.clipboard.writeText(url);
  alert('URL Halaman Status disalin:\n' + url);
}

// Tim Operator state
const users = ref([]);
const isUserModalOpen = ref(false);
const isSavingUser = ref(false);
const userForm = ref({
  full_name: '',
  email: '',
  role: 'editor',
  password: ''
});

async function fetchUsers() {
  try {
    const res = await fetch('/api/v1/users');
    if (res.ok) users.value = await res.json();
  } catch (err) {
    console.error('Fetch users error:', err);
  }
}

async function submitNewUser() {
  isSavingUser.value = true;
  try {
    const res = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm.value)
    });
    if (res.ok) {
      isUserModalOpen.value = false;
      userForm.value = { full_name: '', email: '', role: 'editor', password: '' };
      await fetchUsers();
      alert('Operator baru berhasil ditambahkan!');
    } else {
      const err = await res.json();
      alert(err.error || 'Gagal menambahkan operator');
    }
  } catch (err) {
    console.error('Submit user error:', err);
    alert('Terjadi kesalahan sistem.');
  } finally {
    isSavingUser.value = false;
  }
}

function deleteUser(id) {
  openConfirmDialog({
    title: 'Cabut Akses Operator',
    message: 'Apakah Anda yakin ingin mencabut akses dan menghapus akun operator ini? Sesi login aktif operator ini akan langsung dihentikan.',
    confirmText: 'Ya, Hapus Akses',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/users?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchUsers();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus operator' }));
          alert(err.error || 'Gagal menghapus operator');
        }
      } catch (err) {
        console.error('Delete user error:', err);
      }
    }
  });
}

// Multi-Region Probe Nodes state
const probeNodes = ref([]);
const isProbeModalOpen = ref(false);
const isSavingProbe = ref(false);
const newProbeSecret = ref('');
const probeForm = ref({
  name: '',
  region: 'sgp-cloud'
});

async function fetchProbeNodes() {
  try {
    const res = await fetch('/api/v1/probe-nodes');
    if (res.ok) probeNodes.value = await res.json();
  } catch (err) {
    console.error('Fetch probe nodes error:', err);
  }
}

async function submitNewProbe() {
  isSavingProbe.value = true;
  try {
    const res = await fetch('/api/v1/probe-nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(probeForm.value)
    });
    if (res.ok) {
      const data = await res.json();
      newProbeSecret.value = data.secret_token;
      isProbeModalOpen.value = false;
      probeForm.value = { name: '', region: 'sgp-cloud' };
      await fetchProbeNodes();
    } else {
      const err = await res.json();
      alert(err.error || 'Gagal mendaftarkan probe node');
    }
  } catch (err) {
    console.error('Submit probe error:', err);
  } finally {
    isSavingProbe.value = false;
  }
}

function deleteProbeNode(id) {
  openConfirmDialog({
    title: 'Hapus Probe Node',
    message: 'Apakah Anda yakin ingin menghapus node pemantau region ini?',
    confirmText: 'Ya, Hapus Node',
    isDanger: true,
    action: async () => {
      try {
        const res = await fetch(`/api/v1/probe-nodes?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          await fetchProbeNodes();
        } else {
          const err = await res.json().catch(() => ({ error: 'Gagal menghapus probe node' }));
          alert(err.error || 'Gagal menghapus probe node');
        }
      } catch (err) {
        console.error('Delete probe error:', err);
      }
    }
  });
}

function copyText(str) {
  navigator.clipboard.writeText(str);
  alert('Disalin ke clipboard:\n' + str);
}

onMounted(() => {
  fetchBranding();
  fetchChannels();
  fetchKeys();
  fetchAudit();
  fetchMaintenance();
  fetchMonitors();
  fetchEscalations();
  fetchOnCall();
  fetchStatusPages();
  fetchUsers();
  fetchProbeNodes();
});
</script>
