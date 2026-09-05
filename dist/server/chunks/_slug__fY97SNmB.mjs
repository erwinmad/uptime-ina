import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_C_2vkNBj.mjs";
import { t as createComponent } from "./compiler_cCjE28FH.mjs";
import { i as getBrandingSettings, n as db } from "./db_BJLNYA76.mjs";
import { n as $$BaseLayout, t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { n as useToast, r as ToastContainer_default, t as setToastRef } from "./useToast_aRnmhcX8.mjs";
import { computed, mergeProps, onMounted, onUnmounted, ref, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrRenderTeleport } from "vue/server-renderer";
//#region src/components/vue/PublicStatusPage.vue
var _sfc_main = {
	__name: "PublicStatusPage",
	props: {
		slug: String,
		initialData: Object
	},
	setup(__props, { expose: __expose }) {
		__expose();
		const props = __props;
		const toastRef = ref(null);
		const { toast } = useToast();
		const hoverTooltip = ref({
			visible: false,
			x: 0,
			y: 0,
			isUp: false,
			ms: void 0,
			ratio: void 0,
			date: ""
		});
		function showTooltip(event, data) {
			const rect = event.target.getBoundingClientRect();
			hoverTooltip.value = {
				visible: true,
				x: rect.left + rect.width / 2,
				y: rect.top,
				isUp: data.status ? data.status === "up" : data.upCount === data.total,
				ms: data.ms,
				ratio: data.total ? `${data.upCount}/${data.total} sukses` : void 0,
				date: data.status ? `Dicek pada: ${formatTooltipDate(data.date)}` : `Riwayat tanggal: ${data.date}`
			};
		}
		function hideTooltip() {
			hoverTooltip.value.visible = false;
		}
		const statusData = ref(props.initialData || null);
		const isLocked = ref(Boolean(props.initialData?.page?.is_protected && !props.initialData?.page?.is_unlocked));
		const unlockPassword = ref("");
		const isUnlocking = ref(false);
		const unlockError = ref("");
		const isSubscribeModalOpen = ref(false);
		const subscriberEmail = ref("");
		const isSubscribing = ref(false);
		const subscribeMsg = ref("");
		const subscribeError = ref("");
		const lastUpdated = ref(/* @__PURE__ */ new Date());
		let refreshTimer = null;
		function isImageLogo(url) {
			return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:image"));
		}
		const systemState = computed(() => {
			return statusData.value?.system_status || "operational";
		});
		const heroBadgeClass = computed(() => {
			if (systemState.value === "operational") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
			if (systemState.value === "degraded") return "bg-amber-50 text-amber-700 border border-amber-200";
			return "bg-rose-50 text-rose-700 border border-rose-200";
		});
		const heroPulseClass = computed(() => {
			if (systemState.value === "operational") return "bg-emerald-500";
			if (systemState.value === "degraded") return "bg-amber-500";
			return "bg-rose-500";
		});
		const heroBadgeText = computed(() => {
			if (systemState.value === "operational") return "Normal Operasional";
			if (systemState.value === "degraded") return "Kinerja Terdegradasi";
			return "Gangguan Aktif";
		});
		const heroTitle = computed(() => {
			if (systemState.value === "operational") return "Semua Sistem & Endpoint Berjalan Normal";
			if (systemState.value === "degraded") return "Sebagian Layanan Mengalami Degradasi";
			return "Gangguan Konektivitas Terdeteksi";
		});
		const heroSubtitle = computed(() => {
			if (systemState.value === "operational") return "Infrastruktur beroperasi dalam toleransi latensi dan ketersediaan optimal. Tidak ditemukan kendala aktif pada komponen inti.";
			if (systemState.value === "degraded") return "Beberapa target mengalami peningkatan waktu respons atau kegagalan probe berkala. Tim teknis sedang melakukan investigasi.";
			return "Kegagalan koneksi terdeteksi pada simpul layanan utama. Penanganan darurat sedang diupayakan.";
		});
		const upCount = computed(() => {
			return (statusData.value?.monitors || []).filter((m) => m.current_status === "up").length;
		});
		const downCount = computed(() => {
			return (statusData.value?.monitors || []).filter((m) => m.current_status === "down").length;
		});
		const pausedCount = computed(() => {
			return (statusData.value?.monitors || []).filter((m) => m.current_status === "paused").length;
		});
		const avgResponseMs = computed(() => {
			const valid = (statusData.value?.monitors || []).filter((m) => m.avg_latency > 0);
			if (valid.length === 0) return 24;
			const sum = valid.reduce((acc, m) => acc + m.avg_latency, 0);
			return Math.round(sum / valid.length);
		});
		function monitorIcon(type) {
			switch (type?.toLowerCase()) {
				case "http":
				case "https": return "🌐";
				case "tcp":
				case "port": return "🔌";
				case "ping":
				case "icmp": return "📡";
				case "dns": return "🏷️";
				case "ssl": return "🔒";
				case "push": return "💓";
				default: return "🖥️";
			}
		}
		function latencyColor(latency) {
			if (latency == null) return "text-zinc-400";
			if (latency < 100) return "text-emerald-600 font-semibold";
			if (latency < 300) return "text-amber-600 font-semibold";
			return "text-rose-600 font-semibold";
		}
		function intervalLabel(seconds) {
			if (!seconds) return "60s";
			if (seconds < 60) return `${seconds}s`;
			return `${Math.round(seconds / 60)}m`;
		}
		function statusLabel(status) {
			if (status === "up") return "Operasional";
			if (status === "down") return "Gangguan";
			if (status === "paused") return "Dijeda";
			return "Degradasi";
		}
		function relativeTime(dateStr) {
			try {
				const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1e3);
				if (diff < 60) return `Dicek ${diff} dtk lalu`;
				if (diff < 3600) return `Dicek ${Math.floor(diff / 60)} mnt lalu`;
				if (diff < 86400) return `Dicek ${Math.floor(diff / 3600)} jam lalu`;
				return `Dicek ${Math.floor(diff / 86400)} hari lalu`;
			} catch {
				return "Baru saja dicek";
			}
		}
		function formatTooltipDate(dateStr) {
			if (!dateStr) return "";
			return new Date(dateStr).toLocaleString("id-ID", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		}
		const averageUptime = computed(() => {
			const monitors = statusData.value?.monitors || [];
			if (monitors.length === 0) return "100.0";
			return (monitors.reduce((acc, m) => acc + (m.uptime_percentage || 100), 0) / monitors.length).toFixed(2);
		});
		const lastUpdatedFormatted = computed(() => {
			return lastUpdated.value.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		});
		const activeIncidents = computed(() => {
			return (statusData.value?.incidents || []).filter((i) => i.status !== "resolved");
		});
		const pastIncidents = computed(() => {
			return (statusData.value?.incidents || []).filter((i) => i.status === "resolved");
		});
		async function submitUnlock() {
			unlockError.value = "";
			isUnlocking.value = true;
			try {
				const targetSlug = props.slug || "main";
				const res = await fetch(`/api/v1/status-pages/${targetSlug}/verify`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ password: unlockPassword.value })
				});
				const data = await res.json();
				if (res.ok) {
					isLocked.value = false;
					toast.success("Halaman status berhasil dibuka.", "Akses Terverifikasi");
					fetchStatus();
				} else {
					unlockError.value = data.error || "Kata sandi tidak valid.";
					toast.error(unlockError.value, "Akses Ditolak");
				}
			} catch (err) {
				unlockError.value = "Gagal menghubungi server.";
				toast.error("Terjadi gangguan jaringan saat memverifikasi sandi.", "Kesalahan Jaringan");
			} finally {
				isUnlocking.value = false;
			}
		}
		async function submitSubscribe() {
			subscribeMsg.value = "";
			subscribeError.value = "";
			isSubscribing.value = true;
			try {
				const targetSlug = props.slug || "main";
				const res = await fetch(`/api/v1/status-pages/${targetSlug}/subscribe`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: subscriberEmail.value })
				});
				const data = await res.json();
				if (res.ok) {
					subscribeMsg.value = data.message || "Berhasil berlangganan notifikasi!";
					toast.success(`Notifikasi akan dikirimkan ke ${subscriberEmail.value}`, "Berlangganan Aktif");
					subscriberEmail.value = "";
					setTimeout(() => {
						isSubscribeModalOpen.value = false;
						subscribeMsg.value = "";
					}, 1500);
				} else {
					subscribeError.value = data.error || "Gagal berlangganan.";
					toast.error(subscribeError.value, "Gagal");
				}
			} catch (err) {
				subscribeError.value = "Terjadi kesalahan sistem.";
				toast.error("Tidak dapat mendaftarkan email ke sistem saat ini.", "Kesalahan Sistem");
			} finally {
				isSubscribing.value = false;
			}
		}
		function copyRssFeedUrl() {
			const targetSlug = props.slug || "main";
			const url = `${window.location.origin}/status/${targetSlug}/rss.xml`;
			navigator.clipboard.writeText(url);
			toast.info("Tautan RSS Feed berhasil disalin ke papan klip!", "RSS Tersalin");
		}
		async function fetchStatus() {
			if (isLocked.value) return;
			const targetSlug = props.slug || "main";
			try {
				const res = await fetch(`/api/v1/status-pages/${targetSlug}`);
				if (res.ok) {
					statusData.value = await res.json();
					lastUpdated.value = /* @__PURE__ */ new Date();
				}
			} catch (err) {
				console.error("Fetch status error:", err);
			}
		}
		onMounted(() => {
			setToastRef(toastRef);
			refreshTimer = setInterval(fetchStatus, 3e4);
		});
		onUnmounted(() => {
			if (refreshTimer) clearInterval(refreshTimer);
		});
		const __returned__ = {
			props,
			toastRef,
			toast,
			hoverTooltip,
			showTooltip,
			hideTooltip,
			statusData,
			isLocked,
			unlockPassword,
			isUnlocking,
			unlockError,
			isSubscribeModalOpen,
			subscriberEmail,
			isSubscribing,
			subscribeMsg,
			subscribeError,
			lastUpdated,
			get refreshTimer() {
				return refreshTimer;
			},
			set refreshTimer(v) {
				refreshTimer = v;
			},
			isImageLogo,
			systemState,
			heroBadgeClass,
			heroPulseClass,
			heroBadgeText,
			heroTitle,
			heroSubtitle,
			upCount,
			downCount,
			pausedCount,
			avgResponseMs,
			monitorIcon,
			latencyColor,
			intervalLabel,
			statusLabel,
			relativeTime,
			formatTooltipDate,
			averageUptime,
			lastUpdatedFormatted,
			activeIncidents,
			pastIncidents,
			submitUnlock,
			submitSubscribe,
			copyRssFeedUrl,
			fetchStatus,
			ref,
			computed,
			onMounted,
			onUnmounted,
			ToastContainer: ToastContainer_default,
			get setToastRef() {
				return setToastRef;
			},
			get useToast() {
				return useToast;
			}
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col justify-between selection:bg-zinc-200" }, _attrs))}><div class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-zinc-200/50 via-zinc-100/20 to-transparent pointer-events-none -z-10"></div>`);
	_push(ssrRenderComponent($setup["ToastContainer"], { ref: "toastRef" }, null, _parent));
	_push(`<div class="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-8"><header class="flex items-center justify-between gap-4 p-2 pl-3.5 pr-2 rounded-full bg-white ring-1 ring-zinc-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"><div class="flex items-center gap-3"><div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200/60 flex items-center justify-center shrink-0">`);
	if ($setup.isImageLogo($setup.statusData?.branding?.logo_icon)) _push(`<img${ssrRenderAttr("src", $setup.statusData?.branding?.logo_icon)} alt="Logo" class="w-4 h-4 object-contain rounded-full">`);
	else _push(`<span class="text-xs">${ssrInterpolate($setup.statusData?.branding?.logo_icon || "🌐")}</span>`);
	_push(`</div><div><h1 class="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900">${ssrInterpolate($setup.statusData?.page?.title || $setup.statusData?.branding?.app_name || "Status Layanan")}</h1></div></div><div class="flex items-center gap-2"><div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/70 text-[10px] text-zinc-600 font-mono"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Live Observability</span></div><button class="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white font-medium text-xs transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] cursor-pointer shadow-sm"><span>Langganan</span><div class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><span class="text-[9px] leading-none">↗</span></div></button></div></header>`);
	if ($setup.isLocked) {
		_push(`<div class="max-w-md mx-auto my-12 double-bezel animate-in fade-in duration-500"><div class="double-bezel-inner p-6 sm:p-8 text-center space-y-5"><div class="w-10 h-10 mx-auto rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-base"> 🔒 </div><div><span class="inline-block rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.15em] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 mb-2">Akses Terproteksi</span><h2 class="text-base font-bold text-zinc-900 tracking-tight">Halaman Status Terkunci</h2><p class="text-xs text-zinc-500 mt-1">Masukkan kata sandi untuk melihat metriks ketersediaan sistem.</p></div>`);
		if ($setup.unlockError) _push(`<div class="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-mono">${ssrInterpolate($setup.unlockError)}</div>`);
		else _push(`<!---->`);
		_push(`<form class="space-y-3"><input${ssrRenderAttr("value", $setup.unlockPassword)} type="password" placeholder="Masukkan kata sandi..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200" required><button type="submit"${ssrIncludeBooleanAttr($setup.isUnlocking) ? " disabled" : ""} class="group w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"><span>${ssrInterpolate($setup.isUnlocking ? "Memverifikasi..." : "Buka Halaman")}</span><div class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"><span class="text-[9px]">→</span></div></button></form></div></div>`);
	} else {
		_push(`<!--[--><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch"><div class="ring-1 p-1.5 rounded-[1.5rem] transition-all duration-500" style="${ssrRenderStyle({
			background: Number($setup.averageUptime) >= 99 ? "#f0fdf4" : Number($setup.averageUptime) >= 90 ? "#fffbeb" : "#fff1f2",
			borderColor: Number($setup.averageUptime) >= 99 ? "#bbf7d0" : Number($setup.averageUptime) >= 90 ? "#fde68a" : "#fecdd3"
		})}"><div class="h-full p-4 flex flex-col justify-between space-y-3 relative overflow-hidden rounded-[calc(1.5rem-0.375rem)]" style="${ssrRenderStyle({ background: Number($setup.averageUptime) >= 99 ? "#f0fdf4" : Number($setup.averageUptime) >= 90 ? "#fffbeb" : "#fff1f2" })}"><div class="space-y-1.5"><div class="flex items-center justify-between"><span class="text-[10px] uppercase font-bold tracking-wider" style="${ssrRenderStyle({ color: Number($setup.averageUptime) >= 99 ? "#16a34a" : Number($setup.averageUptime) >= 90 ? "#d97706" : "#e11d48" })}">Status Sistem</span><span class="w-2 h-2 rounded-full animate-pulse" style="${ssrRenderStyle({ background: Number($setup.averageUptime) >= 99 ? "#22c55e" : Number($setup.averageUptime) >= 90 ? "#f59e0b" : "#f43f5e" })}"></span></div><h3 class="text-base sm:text-lg font-extrabold tracking-tight" style="${ssrRenderStyle({ color: Number($setup.averageUptime) >= 99 ? "#166534" : Number($setup.averageUptime) >= 90 ? "#92400e" : "#881337" })}">${ssrInterpolate(Number($setup.averageUptime) >= 99 ? "Semua Operasional" : Number($setup.averageUptime) >= 90 ? "Degradasi Parsial" : "Gangguan Kritis")}</h3><p class="text-[11px] leading-tight" style="${ssrRenderStyle({ color: Number($setup.averageUptime) >= 99 ? "#15803d" : Number($setup.averageUptime) >= 90 ? "#b45309" : "#be123c" })}">${ssrInterpolate($setup.downCount > 0 ? `${$setup.downCount} layanan mengalami kendala aktif` : "Seluruh endpoint berjalan normal")}</p></div><div class="pt-2 flex items-center justify-between text-[10px] font-mono" style="${ssrRenderStyle({
			borderTop: "1px solid",
			borderColor: Number($setup.averageUptime) >= 99 ? "#bbf7d080" : Number($setup.averageUptime) >= 90 ? "#fde68a80" : "#fecdd380",
			color: "#9ca3af"
		})}"><span>Sinkronisasi</span><span class="font-medium" style="${ssrRenderStyle({ "color": "#374151" })}">${ssrInterpolate($setup.lastUpdatedFormatted)}</span></div></div></div><div class="double-bezel"><div class="double-bezel-inner h-full p-4 flex flex-col justify-between space-y-3"><div class="space-y-1.5"><div class="flex items-center justify-between"><span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Ketersediaan (SLA 60h)</span><span class="text-[11px]">📈</span></div><div class="flex items-baseline gap-1.5"><span class="${ssrRenderClass([Number($setup.averageUptime) >= 99 ? "text-emerald-600" : Number($setup.averageUptime) >= 90 ? "text-amber-600" : "text-rose-600", "text-xl sm:text-2xl font-black font-mono tracking-tight"])}">${ssrInterpolate($setup.averageUptime)}% </span><span class="text-[10px] font-mono text-zinc-400">Target 99.9%</span></div><div class="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden"><div class="${ssrRenderClass([Number($setup.averageUptime) >= 99 ? "bg-emerald-500" : Number($setup.averageUptime) >= 90 ? "bg-amber-500" : "bg-rose-500", "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${Math.min(100, Math.max(0, $setup.averageUptime))}%` })}"></div></div></div><div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400"><span>Evaluasi SLA</span><span class="${ssrRenderClass([Number($setup.averageUptime) >= 99 ? "text-emerald-600" : Number($setup.averageUptime) >= 90 ? "text-amber-600" : "text-rose-600", "font-semibold font-mono"])}">${ssrInterpolate(Number($setup.averageUptime) >= 99 ? "Memenuhi Standar" : Number($setup.averageUptime) >= 90 ? "Degradasi Parsial" : "Di Bawah Standar")}</span></div></div></div><div class="double-bezel"><div class="double-bezel-inner h-full p-4 flex flex-col justify-between space-y-3"><div class="space-y-1.5"><div class="flex items-center justify-between"><span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Respon Rata-rata</span><span class="text-[11px]">⚡</span></div><div class="flex items-baseline gap-1"><span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-zinc-900">${ssrInterpolate($setup.avgResponseMs)}</span><span class="text-xs font-mono text-zinc-400">ms</span></div><p class="text-[11px] text-zinc-500 leading-tight">${ssrInterpolate($setup.avgResponseMs < 100 ? "Kecepatan jaringan optimal" : "Latensi dalam batas wajar")}</p></div><div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400"><span>Toleransi Probe</span><span class="text-zinc-700 font-medium">Non-blocking</span></div></div></div><div class="double-bezel"><div class="double-bezel-inner h-full p-4 flex flex-col justify-between space-y-3"><div class="space-y-1.5"><div class="flex items-center justify-between"><span class="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Total Endpoint</span><span class="text-[11px]">🖥</span></div><div class="flex items-baseline gap-2"><span class="text-xl sm:text-2xl font-black font-mono tracking-tight text-zinc-900">${ssrInterpolate($setup.statusData?.monitors?.length || 0)}</span><span class="text-[10px] text-zinc-400 font-mono">Aktif dipantau</span></div><div class="flex items-center gap-2 text-[10px] font-mono pt-0.5"><span class="text-emerald-600 font-semibold">✓ ${ssrInterpolate($setup.upCount)} Up</span>`);
		if ($setup.downCount > 0) _push(`<span class="text-rose-600 font-semibold">✕ ${ssrInterpolate($setup.downCount)} Down</span>`);
		else _push(`<!---->`);
		if ($setup.pausedCount > 0) _push(`<span class="text-zinc-400 font-medium">⏸ ${ssrInterpolate($setup.pausedCount)} Jeda</span>`);
		else _push(`<!---->`);
		_push(`</div></div><div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400"><span>Interval</span><span class="text-zinc-700 font-medium">30-60 detik</span></div></div></div></div><section class="space-y-3"><div class="flex items-center justify-between px-1"><div class="flex items-center gap-2"><span class="text-sm">💓</span><h3 class="text-sm font-bold tracking-tight text-zinc-900">Status &amp; Heartbeat Layanan</h3></div><span class="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">Histori 60 Hari</span></div><div class="double-bezel"><div class="double-bezel-inner divide-y divide-zinc-100 overflow-hidden">`);
		if (!$setup.statusData?.monitors || $setup.statusData.monitors.length === 0) _push(`<div class="p-8 text-center text-xs text-zinc-400 font-mono"> Belum ada monitor layanan yang terdaftar. </div>`);
		else _push(`<!---->`);
		_push(`<!--[-->`);
		ssrRenderList($setup.statusData?.monitors, (m) => {
			_push(`<div class="p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-3 transition-colors duration-150 hover:bg-zinc-50/60"><div class="flex items-center gap-3 min-w-0 md:w-56 shrink-0"><div class="${ssrRenderClass([m.current_status === "up" ? "bg-emerald-50 ring-emerald-200/80" : m.current_status === "paused" ? "bg-zinc-100 ring-zinc-200" : "bg-rose-50 ring-rose-200/80", "w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ring-1"])}"><span>${ssrInterpolate($setup.monitorIcon(m.type))}</span></div><div class="min-w-0"><div class="flex items-center gap-1.5 flex-wrap"><span class="text-xs font-bold text-zinc-900 truncate">${ssrInterpolate(m.custom_label || m.name)}</span><span class="px-1.5 py-px rounded text-[8px] font-mono uppercase bg-zinc-100 text-zinc-500 border border-zinc-200 shrink-0">${ssrInterpolate(m.type)}</span></div><div class="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-zinc-400"><span class="flex items-center gap-0.5"><span>⚡</span><span class="${ssrRenderClass($setup.latencyColor(m.avg_latency))}">${ssrInterpolate(m.avg_latency != null ? m.avg_latency + " ms" : "—")}</span></span><span class="text-zinc-200">|</span><span>${ssrInterpolate(m.uptime_percentage)}% uptime</span></div></div></div><div class="flex-1 min-w-0 space-y-1.5"><div class="flex items-center gap-[3px] h-6 px-1">`);
			if (m.recent_checks && m.recent_checks.length > 0) {
				_push(`<!--[--><!--[-->`);
				ssrRenderList(m.recent_checks, (c, idx) => {
					_push(`<div class="relative flex-1 h-full flex items-center justify-center cursor-pointer"><div class="${ssrRenderClass([{
						"bg-emerald-400 h-full": c.status === "up",
						"bg-rose-500 h-3/5": c.status !== "up"
					}, "w-full rounded-full transition-all duration-200 hover:scale-y-110"])}"></div></div>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(Math.max(0, 30 - m.recent_checks.length), (n) => {
					_push(`<div class="flex-1 h-2/3 rounded-full bg-zinc-200/60"></div>`);
				});
				_push(`<!--]--><!--]-->`);
			} else {
				_push(`<!--[--><!--[-->`);
				ssrRenderList(m.history, (day, idx) => {
					_push(`<div class="relative flex-1 h-full flex items-center justify-center cursor-pointer"><div class="${ssrRenderClass([{
						"bg-emerald-400 h-full": day.up_count === day.total,
						"bg-amber-400 h-4/5": day.up_count < day.total && day.up_count > 0,
						"bg-rose-500 h-3/5": day.up_count === 0
					}, "w-full rounded-full transition-all duration-200 hover:scale-y-110"])}"></div></div>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(Math.max(0, 30 - (m.history ? m.history.length : 0)), (n) => {
					_push(`<div class="flex-1 h-2/3 rounded-full bg-zinc-200/60"></div>`);
				});
				_push(`<!--]--><!--]-->`);
			}
			_push(`</div><div class="flex justify-between text-[9px] text-zinc-400 font-mono px-1">`);
			if (m.recent_checks && m.recent_checks.length > 0) _push(`<span>${ssrInterpolate($setup.intervalLabel(m.interval_seconds))} interval</span>`);
			else _push(`<span>60h lalu</span>`);
			_push(`<span class="text-zinc-500 font-medium">${ssrInterpolate(m.uptime_percentage)}% SLA</span><span>Kini</span></div></div><div class="shrink-0 flex flex-col items-end gap-1 self-end md:self-auto"><span class="${ssrRenderClass([{
				"bg-emerald-50 text-emerald-700 border border-emerald-200": m.current_status === "up",
				"bg-rose-50 text-rose-700 border border-rose-200": m.current_status === "down",
				"bg-zinc-100 text-zinc-600 border border-zinc-200": m.current_status === "paused"
			}, "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"])}"><span class="${ssrRenderClass([{
				"bg-emerald-500": m.current_status === "up",
				"bg-rose-500 animate-pulse": m.current_status === "down",
				"bg-zinc-400": m.current_status === "paused"
			}, "w-1.5 h-1.5 rounded-full"])}"></span><span>${ssrInterpolate($setup.statusLabel(m.current_status))}</span></span><span class="text-[9px] font-mono text-zinc-400">${ssrInterpolate(m.last_checked_at ? $setup.relativeTime(m.last_checked_at) : "—")}</span></div></div>`);
		});
		_push(`<!--]--></div></div></section><!--]-->`);
	}
	_push(`</div>`);
	ssrRenderTeleport(_push, (_push) => {
		if ($setup.hoverTooltip.visible) {
			_push(`<div class="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-full bg-zinc-900 text-white rounded-xl px-3 py-2.5 shadow-2xl ring-1 ring-zinc-800 text-[10px] space-y-1.5 min-w-[160px]" style="${ssrRenderStyle({
				left: `${$setup.hoverTooltip.x}px`,
				top: `${$setup.hoverTooltip.y - 10}px`
			})}"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-1.5"><span class="${ssrRenderClass([$setup.hoverTooltip.isUp ? "bg-emerald-400" : "bg-rose-500 animate-pulse", "w-1.5 h-1.5 rounded-full"])}"></span><span class="${ssrRenderClass([$setup.hoverTooltip.isUp ? "text-emerald-400" : "text-rose-400", "font-bold uppercase tracking-wider text-[9px]"])}">${ssrInterpolate($setup.hoverTooltip.isUp ? "Operasional" : "Gangguan")}</span></div>`);
			if ($setup.hoverTooltip.ms !== void 0) _push(`<span class="font-mono text-zinc-300 font-semibold">${ssrInterpolate($setup.hoverTooltip.ms ?? "—")} <span class="text-zinc-500 font-normal">ms</span></span>`);
			else if ($setup.hoverTooltip.ratio) _push(`<span class="font-mono text-zinc-400 text-[9px]">${ssrInterpolate($setup.hoverTooltip.ratio)}</span>`);
			else _push(`<!---->`);
			_push(`</div><div class="text-[9px] font-mono text-zinc-400 border-t border-zinc-800 pt-1.5 leading-relaxed">${ssrInterpolate($setup.hoverTooltip.date)}</div><div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900"></div></div>`);
		} else _push(`<!---->`);
	}, "body", false, _parent);
	if ($setup.isSubscribeModalOpen) {
		_push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200"><div class="w-full max-w-sm double-bezel animate-in zoom-in-95 duration-200"><div class="double-bezel-inner p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-100 pb-3"><div><span class="text-[9px] uppercase tracking-wider font-semibold text-zinc-400">Pemberitahuan</span><h3 class="text-sm font-bold text-zinc-900">Langganan Notifikasi</h3></div><button class="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer text-xs"> ✕ </button></div>`);
		if ($setup.subscribeMsg) _push(`<div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-mono"> ✓ ${ssrInterpolate($setup.subscribeMsg)}</div>`);
		else _push(`<!---->`);
		if ($setup.subscribeError) _push(`<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-mono"> ✕ ${ssrInterpolate($setup.subscribeError)}</div>`);
		else _push(`<!---->`);
		if (!$setup.subscribeMsg) _push(`<form class="space-y-3"><p class="text-xs text-zinc-600 leading-relaxed"> Dapatkan pembaruan instan melalui email resmi saat terjadi kendala operasional atau jadwal pemeliharaan. </p><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Alamat Email</label><input${ssrRenderAttr("value", $setup.subscriberEmail)} type="email" placeholder="operator@instansi.go.id" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200" required></div><div class="flex items-center justify-end gap-2 pt-2"><button type="button" class="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"> Tutup </button><button type="submit"${ssrIncludeBooleanAttr($setup.isSubscribing) ? " disabled" : ""} class="group px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"><span>${ssrInterpolate($setup.isSubscribing ? "Menyimpan..." : "Daftar")}</span><div class="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5"><span class="text-[8px]">→</span></div></button></div></form>`);
		else _push(`<!---->`);
		_push(`<div class="pt-3 border-t border-zinc-100 space-y-1.5"><div class="flex items-center justify-between text-[10px] text-zinc-500"><span class="font-medium text-zinc-600">RSS Feed:</span><span class="font-mono text-zinc-400">XML 2.0</span></div><div class="flex items-center gap-1.5 bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 text-xs"><code class="flex-1 font-mono text-[10px] text-zinc-600 truncate pl-1">/status/${ssrInterpolate($setup.props.slug)}/rss.xml</code><a${ssrRenderAttr("href", `/status/${$setup.props.slug}/rss.xml`)} target="_blank" class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors"> Buka </a><button type="button" class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer"> Salin </button></div></div></div></div></div>`);
	} else _push(`<!---->`);
	_push(`<footer class="w-full border-t border-zinc-200/80 py-6 mt-8 bg-white/50"><div class="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono"><p>${ssrInterpolate($setup.statusData?.branding?.footer_text || "Powered by SentinelUp — Observability Platform")}</p><div><a href="/login" class="text-zinc-600 hover:text-zinc-900 font-sans text-xs transition-colors">Akses Operator →</a></div></div></footer></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/PublicStatusPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicStatusPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region src/pages/status/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { slug = "main" } = Astro.params;
	const branding = getBrandingSettings();
	const page = db.prepare("SELECT * FROM status_pages WHERE slug = ?").get(slug);
	let initialData = null;
	if (page) {
		let monitors = db.prepare(`
      SELECT m.id, m.name, m.type, m.current_status, m.last_checked_at, m.interval_seconds, spm.custom_label
      FROM status_page_monitors spm
      JOIN monitors m ON spm.monitor_id = m.id
      WHERE spm.status_page_id = ? AND m.active = 1
      ORDER BY spm.display_order ASC
    `).all(page.id);
		if (monitors.length === 0) monitors = db.prepare(`
        SELECT id, name, type, current_status, last_checked_at, interval_seconds, name as custom_label
        FROM monitors
        WHERE active = 1
        ORDER BY created_at ASC
      `).all();
		const anyDown = monitors.some((m) => m.current_status === "down");
		const systemStatus = monitors.length === 0 ? "operational" : anyDown ? "degraded" : "operational";
		const enrichedMonitors = monitors.map((m) => {
			const recentChecks = db.prepare(`
      SELECT status, response_time_ms, checked_at
      FROM monitor_checks
      WHERE monitor_id = ?
      ORDER BY checked_at DESC
      LIMIT 30
    `).all(m.id).reverse();
			const history = db.prepare(`
      SELECT 
        date(checked_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_count
      FROM monitor_checks
      WHERE monitor_id = ? AND checked_at >= datetime('now', '-60 days')
      GROUP BY date(checked_at)
      ORDER BY date ASC
    `).all(m.id);
			const totalChecks = history.reduce((sum, h) => sum + h.total, 0);
			const totalUp = history.reduce((sum, h) => sum + h.up_count, 0);
			const uptimePercentage = totalChecks > 0 ? Number((totalUp / totalChecks * 100).toFixed(2)) : 100;
			const lastCheck = recentChecks.length > 0 ? recentChecks[recentChecks.length - 1] : null;
			return {
				...m,
				uptime_percentage: uptimePercentage,
				recent_checks: recentChecks,
				avg_latency: lastCheck ? lastCheck.response_time_ms : null,
				history
			};
		});
		const enrichedIncidents = db.prepare(`
    SELECT i.*, m.name as monitor_name
    FROM incidents i
    LEFT JOIN monitors m ON i.monitor_id = m.id
    ORDER BY i.started_at DESC
    LIMIT 10
  `).all().map((inc) => {
			const updates = db.prepare("SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC").all(inc.id);
			return {
				...inc,
				updates
			};
		});
		const isProtected = Boolean(page.password_hash && page.password_hash.trim() !== "");
		const isUnlocked = Astro.cookies.get(`sp_auth_${slug}`)?.value === "unlocked";
		initialData = {
			page: {
				title: page.title,
				description: page.description,
				slug: page.slug,
				is_public: page.is_public,
				is_protected: isProtected,
				is_unlocked: !isProtected || isUnlocked
			},
			branding,
			system_status: systemStatus,
			monitors: enrichedMonitors,
			incidents: enrichedIncidents
		};
	}
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": `${initialData?.page?.title || branding.app_name} — Status Layanan`,
		"description": initialData?.page?.description || branding.app_tagline
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main>${page ? renderTemplate`${renderComponent($$result, "PublicStatusPage", PublicStatusPage_default, {
		"client:load": true,
		"slug": slug,
		"initialData": initialData,
		"client:component-hydration": "load",
		"client:component-path": "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/components/vue/PublicStatusPage.vue",
		"client:component-export": "default"
	})}` : renderTemplate`<div class="min-h-[80vh] flex items-center justify-center p-4"><div class="max-w-md w-full double-bezel text-center"><div class="double-bezel-inner p-8 space-y-4"><span class="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">404 Not Found</span><h2 class="text-xl font-bold text-white tracking-tight">Halaman Status Tidak Ditemukan</h2><p class="text-xs text-zinc-400">Tidak ada konfigurasi status page yang terhubung dengan slug "${slug}".</p><div class="pt-4"><a href="/login" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition-all duration-300"><span>Akses Dashboard</span><span>→</span></a></div></div></div></div>`}</main>` })}`;
}, "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/status/[slug].astro", void 0);
var $$file = "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/status/[slug].astro";
var $$url = "/status/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/status/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
