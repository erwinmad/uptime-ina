import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_C_2vkNBj.mjs";
import { t as createComponent } from "./compiler_cCjE28FH.mjs";
import { c as validateSession } from "./db_BJLNYA76.mjs";
import { n as $$BaseLayout, t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { t as ConfirmModal_default } from "./ConfirmModal_lPRmK1Uz.mjs";
import { n as useToast, r as ToastContainer_default, t as setToastRef } from "./useToast_aRnmhcX8.mjs";
import { computed, mergeProps, onMounted, onUnmounted, reactive, ref, useSSRContext, watch } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region src/components/vue/MonitorModal.vue
var _sfc_main$1 = {
	__name: "MonitorModal",
	props: {
		isOpen: Boolean,
		monitorData: Object
	},
	emits: ["close", "saved"],
	setup(__props, { expose: __expose, emit: __emit }) {
		__expose();
		const props = __props;
		const emit = __emit;
		const isEditing = ref(false);
		const isSubmitting = ref(false);
		const errorMessage = ref("");
		const expectedStatusInput = ref("200");
		const tagsInput = ref("");
		const defaultForm = () => ({
			name: "",
			type: "http",
			target: "",
			port: null,
			interval_seconds: 30,
			timeout_seconds: 15,
			retries_before_down: 3,
			http_method: "GET",
			expected_status_codes: "[200]",
			keyword_match: "",
			ssl_check_enabled: true,
			push_expected_interval_seconds: 300,
			push_grace_period_seconds: 60,
			dns_record_type: "A",
			dns_expected_value: "",
			category_name: "Core Services"
		});
		const form = reactive(defaultForm());
		watch(() => props.isOpen, (newVal) => {
			if (newVal) {
				errorMessage.value = "";
				if (props.monitorData) {
					isEditing.value = true;
					Object.assign(form, props.monitorData);
					form.ssl_check_enabled = Boolean(props.monitorData.ssl_check_enabled);
					if (Array.isArray(props.monitorData.tags)) tagsInput.value = props.monitorData.tags.join(", ");
					else if (typeof props.monitorData.tags === "string") try {
						const parsed = JSON.parse(props.monitorData.tags);
						tagsInput.value = Array.isArray(parsed) ? parsed.join(", ") : props.monitorData.tags;
					} catch {
						tagsInput.value = props.monitorData.tags;
					}
					else tagsInput.value = "";
					try {
						const codes = JSON.parse(props.monitorData.expected_status_codes || "[200]");
						expectedStatusInput.value = Array.isArray(codes) ? codes.join(", ") : "200";
					} catch {
						expectedStatusInput.value = "200";
					}
				} else {
					isEditing.value = false;
					Object.assign(form, defaultForm());
					tagsInput.value = "";
					expectedStatusInput.value = "200";
				}
			}
		});
		function close() {
			emit("close");
		}
		async function submitForm() {
			isSubmitting.value = true;
			errorMessage.value = "";
			try {
				const codes = expectedStatusInput.value.split(",").map((c) => parseInt(c.trim(), 10)).filter((c) => !isNaN(c));
				const parsedTags = tagsInput.value.split(",").map((t) => t.trim()).filter(Boolean);
				const payload = {
					...form,
					tags: parsedTags,
					expected_status_codes: JSON.stringify(codes.length > 0 ? codes : [200]),
					ssl_check_enabled: form.ssl_check_enabled ? 1 : 0
				};
				let res;
				if (isEditing.value && props.monitorData?.id) res = await fetch(`/api/v1/monitors/${props.monitorData.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload)
				});
				else res = await fetch("/api/v1/monitors", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload)
				});
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error || "Failed to save monitor");
				}
				emit("saved");
				close();
			} catch (err) {
				errorMessage.value = err.message;
			} finally {
				isSubmitting.value = false;
			}
		}
		const __returned__ = {
			props,
			emit,
			isEditing,
			isSubmitting,
			errorMessage,
			expectedStatusInput,
			tagsInput,
			defaultForm,
			form,
			close,
			submitForm,
			ref,
			reactive,
			watch
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	if ($props.isOpen) {
		_push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" }, _attrs))}><div class="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl text-zinc-900 double-bezel animate-in zoom-in-95 duration-200"><div class="double-bezel-inner p-1"><div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100"><h3 class="text-base font-bold text-zinc-900 tracking-tight">${ssrInterpolate($setup.isEditing ? "Edit Konfigurasi Monitor" : "Tambah Monitor Baru")}</h3><button class="text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer">×</button></div><form class="p-6 space-y-4"><div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipe Monitor</label><div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl"><button type="button" class="${ssrRenderClass([$setup.form.type === "http" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50", "py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"])}"> 🌐 HTTP </button><button type="button" class="${ssrRenderClass([$setup.form.type === "tcp" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50", "py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"])}"> 🔌 TCP </button><button type="button" class="${ssrRenderClass([$setup.form.type === "dns" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50", "py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"])}"> 🧭 DNS </button><button type="button" class="${ssrRenderClass([$setup.form.type === "ping" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50", "py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"])}"> 📡 Ping </button><button type="button" class="${ssrRenderClass([$setup.form.type === "push" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50", "py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer"])}"> 💓 Push </button></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Monitor</label><input${ssrRenderAttr("value", $setup.form.name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all" placeholder="e.g. Production API Gateway" required></div><div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Grup Kategori</label><input${ssrRenderAttr("value", $setup.form.category_name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all" placeholder="e.g. Core Services, Database, Eksternal"></div></div>`);
		if ($setup.form.type !== "push") _push(`<div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">${ssrInterpolate($setup.form.type === "http" ? "Target URL" : $setup.form.type === "dns" ? "Domain / Hostname" : "Target Host / IP")}</label><input${ssrRenderAttr("value", $setup.form.target)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-mono"${ssrRenderAttr("placeholder", $setup.form.type === "http" ? "https://api.example.com/health" : $setup.form.type === "dns" ? "example.com" : "1.1.1.1 or api.example.com")} required></div>`);
		else _push(`<div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Deskripsi Pekerjaan / Target Heartbeat</label><input${ssrRenderAttr("value", $setup.form.target)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white transition-all" placeholder="e.g. Daily DB Backup Cron" required></div>`);
		if ($setup.form.type === "tcp") _push(`<div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Port</label><input${ssrRenderAttr("value", $setup.form.port)} type="number" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white transition-all" placeholder="e.g. 5432 or 80" required></div>`);
		else _push(`<!---->`);
		if ($setup.form.type === "dns") _push(`<div class="p-3.5 bg-zinc-50/60 border border-zinc-200 rounded-lg space-y-3"><div class="grid grid-cols-2 gap-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipe Record DNS</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"><option value="A"${ssrIncludeBooleanAttr(Array.isArray($setup.form.dns_record_type) ? ssrLooseContain($setup.form.dns_record_type, "A") : ssrLooseEqual($setup.form.dns_record_type, "A")) ? " selected" : ""}>A (IPv4)</option><option value="AAAA"${ssrIncludeBooleanAttr(Array.isArray($setup.form.dns_record_type) ? ssrLooseContain($setup.form.dns_record_type, "AAAA") : ssrLooseEqual($setup.form.dns_record_type, "AAAA")) ? " selected" : ""}>AAAA (IPv6)</option><option value="CNAME"${ssrIncludeBooleanAttr(Array.isArray($setup.form.dns_record_type) ? ssrLooseContain($setup.form.dns_record_type, "CNAME") : ssrLooseEqual($setup.form.dns_record_type, "CNAME")) ? " selected" : ""}>CNAME</option><option value="MX"${ssrIncludeBooleanAttr(Array.isArray($setup.form.dns_record_type) ? ssrLooseContain($setup.form.dns_record_type, "MX") : ssrLooseEqual($setup.form.dns_record_type, "MX")) ? " selected" : ""}>MX (Mail Server)</option><option value="TXT"${ssrIncludeBooleanAttr(Array.isArray($setup.form.dns_record_type) ? ssrLooseContain($setup.form.dns_record_type, "TXT") : ssrLooseEqual($setup.form.dns_record_type, "TXT")) ? " selected" : ""}>TXT</option></select></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nilai yang Diharapkan (Opsional)</label><input${ssrRenderAttr("value", $setup.form.dns_expected_value)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. 1.1.1.1 or mx.example.com"></div></div><p class="text-[11px] text-zinc-400">Pengecekan record DNS resolver dan assertion kecocokan nilai.</p></div>`);
		else _push(`<!---->`);
		if ($setup.form.type === "http") _push(`<div class="p-3.5 bg-zinc-50/60 border border-zinc-200 rounded-lg space-y-3"><div class="grid grid-cols-2 gap-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Metode HTTP</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"><option value="GET"${ssrIncludeBooleanAttr(Array.isArray($setup.form.http_method) ? ssrLooseContain($setup.form.http_method, "GET") : ssrLooseEqual($setup.form.http_method, "GET")) ? " selected" : ""}>GET</option><option value="POST"${ssrIncludeBooleanAttr(Array.isArray($setup.form.http_method) ? ssrLooseContain($setup.form.http_method, "POST") : ssrLooseEqual($setup.form.http_method, "POST")) ? " selected" : ""}>POST</option><option value="HEAD"${ssrIncludeBooleanAttr(Array.isArray($setup.form.http_method) ? ssrLooseContain($setup.form.http_method, "HEAD") : ssrLooseEqual($setup.form.http_method, "HEAD")) ? " selected" : ""}>HEAD</option><option value="PUT"${ssrIncludeBooleanAttr(Array.isArray($setup.form.http_method) ? ssrLooseContain($setup.form.http_method, "PUT") : ssrLooseEqual($setup.form.http_method, "PUT")) ? " selected" : ""}>PUT</option></select></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Status Diharapkan</label><input${ssrRenderAttr("value", $setup.expectedStatusInput)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="200, 201"></div></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Keyword Assertion (Opsional)</label><input${ssrRenderAttr("value", $setup.form.keyword_match)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. &quot;status&quot;: &quot;ok&quot;"></div><label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 pt-1"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($setup.form.ssl_check_enabled) ? ssrLooseContain($setup.form.ssl_check_enabled, null) : $setup.form.ssl_check_enabled) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-zinc-400"><span>Periksa Masa Berlaku SSL/TLS (Alarm jika &lt; 14 hari tersisa)</span></label></div>`);
		else _push(`<!---->`);
		if ($setup.form.type === "push") _push(`<div class="p-3.5 bg-zinc-50/60 border border-zinc-200 rounded-lg space-y-3"><div class="grid grid-cols-2 gap-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Interval Ping (Detik)</label><input${ssrRenderAttr("value", $setup.form.push_expected_interval_seconds)} type="number" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="3600 (1 jam)" min="10"></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Toleransi / Grace Period (Detik)</label><input${ssrRenderAttr("value", $setup.form.push_grace_period_seconds)} type="number" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="60" min="10"></div></div><p class="text-[11px] text-zinc-400">URL push heartbeat bertoken rahasia akan digenerate otomatis setelah dibuat.</p></div>`);
		else _push(`<!---->`);
		_push(`<div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tags / Kategori (pisahkan dengan koma)</label><input${ssrRenderAttr("value", $setup.tagsInput)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white transition-all" placeholder="e.g. Production, Database, API, Internal"></div>`);
		if ($setup.form.type !== "push") _push(`<div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Interval Pengecekan (Detik)</label><input${ssrRenderAttr("value", $setup.form.interval_seconds)} type="number" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" min="10" required></div><div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Toleransi Gagal Sebelum Down</label><input${ssrRenderAttr("value", $setup.form.retries_before_down)} type="number" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" min="1" max="10" required></div></div>`);
		else _push(`<!---->`);
		if ($setup.errorMessage) _push(`<div class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs">${ssrInterpolate($setup.errorMessage)}</div>`);
		else _push(`<!---->`);
		_push(`<div class="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200"><button type="button" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors"> Batal </button><button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"${ssrIncludeBooleanAttr($setup.isSubmitting) ? " disabled" : ""}>${ssrInterpolate($setup.isSubmitting ? "Menyimpan..." : $setup.isEditing ? "Perbarui Monitor" : "Buat Monitor")}</button></div></form></div></div></div>`);
	} else _push(`<!---->`);
}
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/MonitorModal.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var MonitorModal_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);
//#endregion
//#region src/components/vue/Dashboard.vue
var _sfc_main = {
	__name: "Dashboard",
	props: { currentUser: {
		type: Object,
		default: () => null
	} },
	setup(__props, { expose: __expose }) {
		__expose();
		const props = __props;
		const toastRef = ref(null);
		const { toast } = useToast();
		async function handleLogout() {
			try {
				await fetch("/api/v1/auth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "logout" })
				});
			} catch {}
			window.location.href = "/login";
		}
		const branding = ref({
			app_name: "Uptime CJR",
			app_tagline: "Sistem Pemantauan Ketersediaan Layanan & Infrastruktur",
			footer_text: "© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur",
			logo_icon: "🌐"
		});
		const monitors = ref([]);
		const loading = ref(true);
		const isConnected = ref(false);
		const searchQuery = ref("");
		const filterTab = ref("all");
		const filterTag = ref("");
		const isModalOpen = ref(false);
		const selectedMonitor = ref(null);
		const expandedId = ref(null);
		const activeIncidentsCount = ref(0);
		const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
		const allTags = computed(() => {
			const set = /* @__PURE__ */ new Set();
			for (const m of monitors.value) if (Array.isArray(m.tags)) for (const t of m.tags) set.add(t);
			return Array.from(set);
		});
		const upCount = computed(() => monitors.value.filter((m) => m.current_status === "up").length);
		const downCount = computed(() => monitors.value.filter((m) => m.current_status === "down").length);
		const pausedCount = computed(() => monitors.value.filter((m) => m.current_status === "paused").length);
		const overallHealthText = computed(() => {
			if (monitors.value.length === 0) return "Siap";
			if (downCount.value > 0) return `${downCount.value} Down`;
			return "Normal";
		});
		const overallUptime = computed(() => {
			if (monitors.value.length === 0) return 100;
			return (monitors.value.reduce((acc, m) => acc + (m.uptime_24h || 100), 0) / monitors.value.length).toFixed(2);
		});
		const avgLatency = computed(() => {
			const valid = monitors.value.filter((m) => m.avg_latency_24h > 0);
			if (valid.length === 0) return 0;
			const sum = valid.reduce((acc, m) => acc + m.avg_latency_24h, 0);
			return Math.round(sum / valid.length);
		});
		const filteredMonitors = computed(() => {
			return monitors.value.filter((m) => {
				if (filterTab.value === "up" && m.current_status !== "up") return false;
				if (filterTab.value === "down" && m.current_status !== "down") return false;
				if (filterTab.value === "paused" && m.current_status !== "paused") return false;
				if (filterTag.value !== "") {
					if (!Array.isArray(m.tags) || !m.tags.includes(filterTag.value)) return false;
				}
				if (searchQuery.value.trim() !== "") {
					const q = searchQuery.value.toLowerCase();
					return m.name.toLowerCase().includes(q) || m.target.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) || Array.isArray(m.tags) && m.tags.some((t) => t.toLowerCase().includes(q));
				}
				return true;
			});
		});
		async function fetchMonitors() {
			try {
				const res = await fetch("/api/v1/monitors");
				if (res.ok) {
					monitors.value = await res.json();
					activeIncidentsCount.value = monitors.value.reduce((acc, m) => acc + (m.active_incidents_count || 0), 0);
				}
			} catch (err) {
				console.error("Fetch monitors error:", err);
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
		async function runCheckNow(monitor) {
			try {
				await fetch(`/api/v1/monitors/${monitor.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ run_check_now: true })
				});
			} catch (err) {
				console.error("Run check error:", err);
			}
		}
		async function togglePause(monitor) {
			const newStatus = monitor.current_status === "paused" ? "pending" : "paused";
			try {
				await fetch(`/api/v1/monitors/${monitor.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ current_status: newStatus })
				});
				fetchMonitors();
			} catch (err) {
				console.error("Toggle pause error:", err);
			}
		}
		const confirmModal = ref({
			isOpen: false,
			title: "",
			message: "",
			confirmText: "Ya, Hapus",
			isDanger: true,
			isLoading: false,
			action: null
		});
		function openConfirmDialog({ title, message, confirmText = "Ya, Hapus", isDanger = true, action }) {
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
					console.error("Modal confirm action error:", err);
				} finally {
					confirmModal.value.isLoading = false;
				}
			}
		}
		function deleteMonitor(monitor) {
			openConfirmDialog({
				title: "Hapus Monitor",
				message: `Apakah Anda yakin ingin menghapus monitor "${monitor.name}" (${monitor.target})? Seluruh riwayat pengecekan dan data SLA akan dihapus secara permanen.`,
				confirmText: "Ya, Hapus Monitor",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/monitors/${monitor.id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) {
							await fetchMonitors();
							toast.success(`Monitor "${monitor.name}" telah dihapus secara permanen.`, "Monitor Dihapus");
						} else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus monitor" }));
							toast.error(err.error || "Gagal menghapus monitor", "Kesalahan Sistem");
						}
					} catch (err) {
						console.error("Delete monitor error:", err);
						toast.error("Gagal menghubungi server saat menghapus monitor.", "Kesalahan Jaringan");
					}
				}
			});
		}
		function copyPushUrl(monitor) {
			const url = `${window.location.origin}/api/push/${monitor.push_token_raw}`;
			navigator.clipboard.writeText(url);
			toast.success("Push URL berhasil disalin ke papan klip.", "URL Tersalin");
		}
		function regeneratePushToken(monitor) {
			openConfirmDialog({
				title: "Rotasi URL Push Token",
				message: "Regenerasi push token akan menonaktifkan URL push lama secara instan. Script cron job yang menggunakan URL lama akan berhenti berfungsi sampai URL diperbarui. Lanjutkan?",
				confirmText: "Ya, Rotasi Token",
				isDanger: false,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/monitors/${monitor.id}/regenerate-push`, {
							method: "POST",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) {
							const data = await res.json();
							monitor.push_token_raw = data.push_token_raw || data.rawToken;
							toast.success("Token push baru berhasil di-generate dan siap digunakan.", "Rotasi Token Berhasil");
						} else {
							const err = await res.json().catch(() => ({ error: "Gagal merotasi token" }));
							toast.error(err.error || "Gagal merotasi token", "Gagal");
						}
					} catch (err) {
						console.error("Regenerate token error:", err);
						toast.error("Gagal menghubungi server.", "Kesalahan Jaringan");
					}
				}
			});
		}
		let ws = null;
		let reconnectTimer = null;
		function connectWebSocket() {
			if (typeof window === "undefined") return;
			const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`;
			ws = new WebSocket(wsUrl);
			ws.onopen = () => {
				isConnected.value = true;
			};
			ws.onmessage = (event) => {
				try {
					const msg = JSON.parse(event.data);
					if (msg.type === "check_completed") {
						const idx = monitors.value.findIndex((m) => m.id === msg.data.monitorId);
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
					} else if (msg.type === "status_changed") {
						const idx = monitors.value.findIndex((m) => m.id === msg.data.monitorId);
						if (idx !== -1) {
							const monitorName = monitors.value[idx].name;
							const prev = monitors.value[idx].current_status;
							monitors.value[idx].current_status = msg.data.newStatus;
							if (msg.data.newStatus === "down" && prev !== "down") toast.error(`"${monitorName}" tidak dapat dijangkau. Pengecekan sedang diulang.`, "Layanan Down");
							else if (msg.data.newStatus === "up" && prev === "down") toast.success(`"${monitorName}" kembali beroperasi normal.`, "Layanan Pulih");
						}
					} else if (msg.type === "branding_updated") {
						branding.value = msg.data;
						if (typeof window !== "undefined") {
							window.dispatchEvent(new CustomEvent("branding_updated", { detail: msg.data }));
							document.title = `${msg.data.app_name} — Dashboard & Live Monitors`;
						}
					}
				} catch (err) {
					console.error("WS parse error:", err);
				}
			};
			ws.onclose = () => {
				isConnected.value = false;
				reconnectTimer = setTimeout(connectWebSocket, 3e3);
			};
			ws.onerror = () => {
				isConnected.value = false;
			};
		}
		function isImageLogo(url) {
			return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:image"));
		}
		async function fetchBranding() {
			try {
				const res = await fetch("/api/v1/settings/branding");
				if (res.ok) branding.value = await res.json();
			} catch (err) {
				console.error("Fetch branding error:", err);
			}
		}
		onMounted(() => {
			setToastRef(toastRef);
			fetchBranding();
			fetchMonitors();
			connectWebSocket();
		});
		onUnmounted(() => {
			if (ws) ws.close();
			if (reconnectTimer) clearTimeout(reconnectTimer);
		});
		const __returned__ = {
			props,
			toastRef,
			toast,
			handleLogout,
			branding,
			monitors,
			loading,
			isConnected,
			searchQuery,
			filterTab,
			filterTag,
			isModalOpen,
			selectedMonitor,
			expandedId,
			activeIncidentsCount,
			currentOrigin,
			allTags,
			upCount,
			downCount,
			pausedCount,
			overallHealthText,
			overallUptime,
			avgLatency,
			filteredMonitors,
			fetchMonitors,
			openNewModal,
			editMonitor,
			toggleDetails,
			runCheckNow,
			togglePause,
			confirmModal,
			openConfirmDialog,
			handleModalConfirm,
			deleteMonitor,
			copyPushUrl,
			regeneratePushToken,
			get ws() {
				return ws;
			},
			set ws(v) {
				ws = v;
			},
			get reconnectTimer() {
				return reconnectTimer;
			},
			set reconnectTimer(v) {
				reconnectTimer = v;
			},
			connectWebSocket,
			isImageLogo,
			fetchBranding,
			ref,
			computed,
			onMounted,
			onUnmounted,
			MonitorModal: MonitorModal_default,
			ConfirmModal: ConfirmModal_default,
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
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200" }, _attrs))}><div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1">`);
	_push(ssrRenderComponent($setup["ToastContainer"], { ref: "toastRef" }, null, _parent));
	_push(`<header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)]"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">`);
	if ($setup.isImageLogo($setup.branding.logo_icon)) _push(`<img${ssrRenderAttr("src", $setup.branding.logo_icon)} alt="Logo" class="w-4 h-4 object-contain rounded-full">`);
	else _push(`<span>${ssrInterpolate($setup.branding.logo_icon || "🌐")}</span>`);
	_push(`</div><div class="flex items-baseline gap-2"><h1 class="text-sm font-bold text-zinc-900 tracking-tight">${ssrInterpolate($setup.branding.app_name || "Uptime CJR")}</h1><span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| ${ssrInterpolate($setup.branding.app_tagline)}</span></div></div><nav class="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-medium"><a href="/dashboard" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors"> Monitors </a><a href="/incidents" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1.5"> Insiden `);
	if ($setup.activeIncidentsCount > 0) _push(`<span class="px-1.5 py-px rounded-full text-[9px] font-bold bg-rose-500 text-white">${ssrInterpolate($setup.activeIncidentsCount)}</span>`);
	else _push(`<!---->`);
	_push(`</a><a href="/reports" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> 📈 Laporan SLA </a><a href="/status/main" target="_blank" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> Status Page ↗ </a><a href="/settings" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> ⚙️ Pengaturan </a></nav><div class="flex items-center gap-2"><div class="${ssrRenderClass([$setup.isConnected ? "text-emerald-700" : "text-zinc-400", "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-mono tracking-wider"])}"><span class="${ssrRenderClass([$setup.isConnected ? "bg-emerald-500 animate-pulse" : "bg-zinc-300", "w-1.5 h-1.5 rounded-full"])}"></span><span>${ssrInterpolate($setup.isConnected ? "LIVE" : "OFF")}</span></div><button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98]"><span>+</span> <span class="hidden sm:inline">Tambah Monitor</span></button>`);
	if ($setup.props.currentUser) _push(`<div class="flex items-center gap-2 pl-2 border-l border-zinc-200 shrink-0"><div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs"${ssrRenderAttr("title", $setup.props.currentUser.email)}>${ssrInterpolate(($setup.props.currentUser.full_name || $setup.props.currentUser.email || "A")[0].toUpperCase())}</div><button title="Keluar dari sesi" class="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-[11px] transition-colors border border-zinc-200 cursor-pointer"> Keluar </button></div>`);
	else _push(`<!---->`);
	_push(`</div></header><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><div class="double-bezel"><div class="double-bezel-inner p-3.5 space-y-1"><div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status Sistem</div><div class="flex items-center gap-2"><span class="${ssrRenderClass([$setup.downCount > 0 ? "bg-rose-500" : "bg-emerald-500", "w-2 h-2 rounded-full"])}"></span><span class="${ssrRenderClass([$setup.downCount > 0 ? "text-rose-600" : "text-emerald-700", "text-base font-bold tracking-tight"])}">${ssrInterpolate($setup.overallHealthText)}</span></div><div class="text-[10px] text-zinc-500 font-mono">${ssrInterpolate($setup.downCount)} monitor mengalami kendala</div></div></div><div class="double-bezel"><div class="double-bezel-inner p-3.5 space-y-1"><div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Uptime 24h</div><div class="text-base font-bold text-zinc-900 tracking-tight font-mono">${ssrInterpolate($setup.overallUptime)}%</div><div class="text-[10px] text-zinc-500 font-mono">${ssrInterpolate($setup.monitors.length)} total target dipantau</div></div></div><div class="double-bezel"><div class="double-bezel-inner p-3.5 space-y-1"><div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Respon Rata-rata</div><div class="text-base font-bold text-zinc-900 tracking-tight font-mono">${ssrInterpolate($setup.avgLatency)} <span class="text-xs font-normal text-zinc-400">ms</span></div><div class="text-[10px] text-zinc-500 font-mono">Latensi probe non-blocking</div></div></div><div class="double-bezel"><div class="double-bezel-inner p-3.5 space-y-1"><div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Insiden Terbuka</div><div class="${ssrRenderClass([$setup.activeIncidentsCount > 0 ? "text-rose-600" : "text-zinc-900", "text-base font-bold tracking-tight font-mono"])}">${ssrInterpolate($setup.activeIncidentsCount)}</div><div class="text-[10px] text-zinc-500 font-mono">Peringatan aktif</div></div></div></div><div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs"><div class="relative w-full sm:w-64"><span class="absolute left-3 top-2 text-xs text-zinc-400">🔍</span><input${ssrRenderAttr("value", $setup.searchQuery)} placeholder="Cari monitor, host..." class="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"></div><div class="flex items-center gap-2 overflow-x-auto text-xs font-medium"><div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl"><button class="${ssrRenderClass([$setup.filterTab === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900", "px-2.5 py-1 rounded-lg transition-all text-[11px]"])}"> Semua (${ssrInterpolate($setup.monitors.length)}) </button><button class="${ssrRenderClass([$setup.filterTab === "up" ? "bg-white text-emerald-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900", "px-2.5 py-1 rounded-lg transition-all text-[11px]"])}"> Up (${ssrInterpolate($setup.upCount)}) </button><button class="${ssrRenderClass([$setup.filterTab === "down" ? "bg-white text-rose-700 shadow-xs" : "text-zinc-500 hover:text-zinc-900", "px-2.5 py-1 rounded-lg transition-all text-[11px]"])}"> Down (${ssrInterpolate($setup.downCount)}) </button><button class="${ssrRenderClass([$setup.filterTab === "paused" ? "bg-white text-zinc-800 shadow-xs" : "text-zinc-500 hover:text-zinc-900", "px-2.5 py-1 rounded-lg transition-all text-[11px]"])}"> Jeda (${ssrInterpolate($setup.pausedCount)}) </button></div>`);
	if ($setup.allTags.length > 0) {
		_push(`<div class="flex items-center gap-1 pl-2 border-l border-zinc-200"><button class="${ssrRenderClass([$setup.filterTag === "" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900", "px-2 py-1 rounded-lg text-[10px] transition-colors"])}"> Semua </button><!--[-->`);
		ssrRenderList($setup.allTags, (t) => {
			_push(`<button class="${ssrRenderClass([$setup.filterTag === t ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100", "px-2 py-1 rounded-lg text-[10px] transition-colors border"])}"> #${ssrInterpolate(t)}</button>`);
		});
		_push(`<!--]--></div>`);
	} else _push(`<!---->`);
	_push(`</div></div><div class="space-y-2">`);
	if ($setup.loading && $setup.monitors.length === 0) _push(`<div class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3"><div class="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div><p class="text-xs text-zinc-400 font-mono">Memuat telemetri...</p></div>`);
	else if ($setup.filteredMonitors.length === 0) _push(`<div class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-2"><p class="text-xs font-bold text-zinc-900">Tidak ada monitor ditemukan</p><p class="text-[11px] text-zinc-500">Sesuaikan filter atau tambah monitor baru.</p><button class="mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"> + Tambah Monitor </button></div>`);
	else {
		_push(`<div class="double-bezel"><div class="double-bezel-inner divide-y divide-zinc-100 overflow-hidden"><!--[-->`);
		ssrRenderList($setup.filteredMonitors, (m) => {
			_push(`<div class="${ssrRenderClass([m.current_status === "down" ? "bg-rose-50/30" : "", "p-3.5 sm:p-4 transition-colors duration-150 hover:bg-zinc-50/60"])}"><div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3"><div class="flex items-center gap-3 min-w-[240px] flex-1"><span class="${ssrRenderClass([m.current_status === "up" ? "bg-emerald-500" : m.current_status === "down" ? "bg-rose-500 animate-pulse" : "bg-zinc-300", "w-2.5 h-2.5 rounded-full shrink-0"])}"></span><div class="min-w-0 flex-1"><div class="flex items-center gap-1.5 flex-wrap"><h3 class="text-xs sm:text-sm font-bold text-zinc-900 truncate">${ssrInterpolate(m.name)}</h3><span class="px-1.5 py-px rounded text-[8px] font-mono font-semibold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">${ssrInterpolate(m.type === "dns" ? `DNS:${m.dns_record_type || "A"}` : m.type.toUpperCase())}</span>`);
			if (m.ssl_check_enabled) _push(`<span class="px-1.5 py-px rounded text-[8px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"> SSL </span>`);
			else _push(`<!---->`);
			if (m.is_under_maintenance) _push(`<span class="px-1.5 py-px rounded text-[8px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"> 🔧 Maintenance </span>`);
			else _push(`<!---->`);
			_push(`</div><div class="text-[11px] text-zinc-500 font-mono truncate max-w-sm mt-0.5">${ssrInterpolate(m.target)}${ssrInterpolate(m.port ? ":" + m.port : "")}</div></div></div><div class="w-full lg:w-56 shrink-0"><div class="flex justify-between text-[10px] mb-1 font-mono"><span class="text-zinc-400">Histori Cek</span><span class="${ssrRenderClass([m.uptime_24h > 99 ? "text-emerald-700" : "text-amber-700", "font-semibold"])}">${ssrInterpolate(m.uptime_24h)}% </span></div><div class="flex items-center gap-[2px] h-4"><!--[-->`);
			ssrRenderList(m.recent_checks, (check, idx) => {
				_push(`<div class="${ssrRenderClass([check.status === "up" ? "bg-emerald-500" : "bg-rose-500", "flex-1 rounded-full h-full transition-opacity hover:opacity-70 cursor-pointer"])}"${ssrRenderAttr("title", `${check.checked_at}: ${check.status.toUpperCase()} (${check.response_time_ms}ms)`)}></div>`);
			});
			_push(`<!--]--><!--[-->`);
			ssrRenderList(Math.max(0, 30 - (m.recent_checks ? m.recent_checks.length : 0)), (n) => {
				_push(`<div class="flex-1 rounded-full h-2/3 bg-zinc-200/60"></div>`);
			});
			_push(`<!--]--></div></div><div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t border-zinc-100 lg:border-t-0"><div class="text-right"><div class="text-xs font-mono font-bold text-zinc-900">${ssrInterpolate(m.avg_latency_24h || "--")} <span class="text-[9px] font-normal text-zinc-400">ms</span></div><div class="text-[9px] text-zinc-400 font-mono uppercase">latensi</div></div><div class="flex items-center gap-1"><button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer" title="Cek Sekarang"> ⚡ </button><button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"${ssrRenderAttr("title", m.current_status === "paused" ? "Lanjutkan" : "Jeda")}>${ssrInterpolate(m.current_status === "paused" ? "▶" : "⏸")}</button><button class="px-2 py-1 rounded-lg text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer">${ssrInterpolate($setup.expandedId === m.id ? "▲" : "▼")}</button><button class="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"> Edit </button><button class="px-2 py-1 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"> 🗑️ </button></div></div></div>`);
			if (m.type === "push") _push(`<div class="flex items-center gap-2 p-2 mt-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"><span class="font-semibold text-zinc-600 text-[11px]">PUSH URL:</span><code class="flex-1 font-mono text-zinc-700 text-[11px] truncate">${ssrInterpolate($setup.currentOrigin)}/api/push/${ssrInterpolate(m.push_token_raw || "••••••••")}</code><button class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200 cursor-pointer shadow-xs">Salin</button><button class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200 cursor-pointer shadow-xs">Rotasi</button></div>`);
			else _push(`<!---->`);
			if ($setup.expandedId === m.id) {
				_push(`<div class="mt-3 pt-3 border-t border-zinc-100 space-y-2"><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"><div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1"><h4 class="font-bold text-zinc-900 text-[11px]">⚙️ Konfigurasi Pengecekan</h4><p class="text-zinc-600 text-[11px]">Interval: <strong class="text-zinc-900">${ssrInterpolate(m.interval_seconds)}s</strong> | Toleransi Down: <strong class="text-zinc-900">${ssrInterpolate(m.retries_before_down)}x</strong></p><p class="text-zinc-600 text-[11px]">Terakhir Dicek: <strong class="text-zinc-900">${ssrInterpolate(m.last_checked_at ? new Date(m.last_checked_at).toLocaleString("id-ID") : "-")}</strong></p>`);
				if (m.type === "dns") _push(`<p class="text-zinc-600 text-[11px]">Expected Value: <strong class="text-zinc-900">${ssrInterpolate(m.dns_expected_value || "-")}</strong></p>`);
				else _push(`<!---->`);
				_push(`</div><div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1"><h4 class="font-bold text-zinc-900 text-[11px]">🔒 Keamanan &amp; Maintenance</h4><p class="text-zinc-600 text-[11px]">Inspeksi SSL: <strong class="text-zinc-900">${ssrInterpolate(m.ssl_check_enabled ? "Aktif" : "Non-aktif")}</strong> (${ssrInterpolate(m.ssl_days_remaining !== null && m.ssl_days_remaining !== void 0 ? `${m.ssl_days_remaining} hari lagi` : "-")})</p><p class="text-zinc-600 text-[11px]">Jadwal Pemeliharaan: <strong class="${ssrRenderClass(m.is_under_maintenance ? "text-amber-700 font-bold" : "text-zinc-900")}">${ssrInterpolate(m.is_under_maintenance ? "Aktif (Alarm Dinonaktifkan)" : "Normal")}</strong></p></div></div><div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"><div><h4 class="text-[11px] font-bold text-zinc-900">📥 Ekspor Data Histori &amp; SLA</h4><p class="text-[10px] text-zinc-500">Unduh log pemeriksaan untuk laporan ketersediaan.</p></div><div class="flex flex-wrap gap-1.5"><a${ssrRenderAttr("href", `/api/v1/monitors/${m.id}/export?format=csv&range=24h`)} class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>CSV 24h</a><a${ssrRenderAttr("href", `/api/v1/monitors/${m.id}/export?format=csv&range=7d`)} class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>CSV 7d</a><a${ssrRenderAttr("href", `/api/v1/monitors/${m.id}/export?format=csv&range=30d`)} class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>CSV 30d</a><a${ssrRenderAttr("href", `/api/v1/monitors/${m.id}/export?format=json&range=30d`)} class="px-2.5 py-1 text-[10px] rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors shadow-xs" download>JSON</a></div></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		});
		_push(`<!--]--></div></div>`);
	}
	_push(`</div>`);
	_push(ssrRenderComponent($setup["MonitorModal"], {
		isOpen: $setup.isModalOpen,
		monitorData: $setup.selectedMonitor,
		onClose: ($event) => $setup.isModalOpen = false,
		onSaved: $setup.fetchMonitors
	}, null, _parent));
	_push(ssrRenderComponent($setup["ConfirmModal"], {
		isOpen: $setup.confirmModal.isOpen,
		title: $setup.confirmModal.title,
		message: $setup.confirmModal.message,
		confirmText: $setup.confirmModal.confirmText,
		isDanger: $setup.confirmModal.isDanger,
		isLoading: $setup.confirmModal.isLoading,
		onConfirm: $setup.handleModalConfirm,
		onClose: ($event) => $setup.confirmModal.isOpen = false
	}, null, _parent));
	_push(`</div><footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto"><div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono"><p>${ssrInterpolate($setup.branding.footer_text || "Powered by SentinelUp — Observability Platform")}</p></div></footer></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/Dashboard.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Dashboard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region src/pages/dashboard.astro
var dashboard_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Dashboard,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Dashboard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Dashboard;
	const token = Astro.cookies.get("sentinel_session")?.value;
	const session = token ? validateSession(token) : null;
	if (!session) return Astro.redirect("/login");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Dashboard & Live Monitors" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main>${renderComponent($$result, "Dashboard", Dashboard_default, {
		"client:load": true,
		"currentUser": session.user,
		"client:component-hydration": "load",
		"client:component-path": "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/components/vue/Dashboard.vue",
		"client:component-export": "default"
	})}</main>` })}`;
}, "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/dashboard.astro", void 0);
var $$file = "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/dashboard.astro";
var $$url = "/dashboard";
//#endregion
//#region \0virtual:astro:page:src/pages/dashboard@_@astro
var page = () => dashboard_exports;
//#endregion
export { page };
