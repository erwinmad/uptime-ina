import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_C_2vkNBj.mjs";
import { t as createComponent } from "./compiler_cCjE28FH.mjs";
import { c as validateSession } from "./db_BJLNYA76.mjs";
import { n as $$BaseLayout, t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { computed, mergeProps, onMounted, ref, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region src/components/vue/IncidentView.vue
var _sfc_main = {
	__name: "IncidentView",
	props: { currentUser: {
		type: Object,
		default: () => null
	} },
	setup(__props, { expose: __expose }) {
		__expose();
		const props = __props;
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
		const incidents = ref([]);
		const monitors = ref([]);
		const branding = ref({
			app_name: "Uptime CJR",
			app_tagline: "Sistem Pemantauan Ketersediaan Layanan & Infrastruktur",
			logo_icon: "🌐",
			footer_text: "© 2026 Uptime CJR — Sistem Pemantauan Ketersediaan Layanan"
		});
		const statusFilter = ref("all");
		function isImageLogo(url) {
			return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:image"));
		}
		const isUpdateModalOpen = ref(false);
		const isCreateModalOpen = ref(false);
		const selectedIncident = ref(null);
		const isPostMortemModalOpen = ref(false);
		const selectedPostMortemIncident = ref(null);
		const isSavingPostMortem = ref(false);
		const postMortemForm = ref({
			root_cause: "",
			action_items: "",
			prevention_plan: ""
		});
		const updateForm = ref({
			status: "investigating",
			message: ""
		});
		const createForm = ref({
			title: "",
			monitor_id: "",
			message: ""
		});
		const activeIncidents = computed(() => incidents.value.filter((i) => i.status !== "resolved"));
		const resolvedIncidents = computed(() => incidents.value.filter((i) => i.status === "resolved"));
		const filteredIncidents = computed(() => {
			if (statusFilter.value === "active") return activeIncidents.value;
			if (statusFilter.value === "resolved") return resolvedIncidents.value;
			return incidents.value;
		});
		async function fetchBranding() {
			try {
				const res = await fetch("/api/v1/settings/branding");
				if (res.ok) {
					const data = await res.json();
					if (data.footer_text) footerText.value = data.footer_text;
				}
			} catch (err) {
				console.error("Fetch branding error:", err);
			}
		}
		async function fetchIncidents() {
			try {
				const res = await fetch("/api/v1/incidents");
				if (res.ok) incidents.value = await res.json();
			} catch (err) {
				console.error("Fetch incidents error:", err);
			}
		}
		async function fetchMonitors() {
			try {
				const res = await fetch("/api/v1/monitors");
				if (res.ok) monitors.value = await res.json();
			} catch (err) {
				console.error("Fetch monitors error:", err);
			}
		}
		function openUpdateModal(inc) {
			selectedIncident.value = inc;
			updateForm.value = {
				status: inc.status,
				message: ""
			};
			isUpdateModalOpen.value = true;
		}
		function openPostMortemModal(inc) {
			selectedPostMortemIncident.value = inc;
			postMortemForm.value = {
				root_cause: inc.root_cause || "",
				action_items: inc.action_items || "",
				prevention_plan: inc.prevention_plan || ""
			};
			isPostMortemModalOpen.value = true;
		}
		async function savePostMortem() {
			if (!selectedPostMortemIncident.value) return;
			isSavingPostMortem.value = true;
			try {
				if ((await fetch(`/api/v1/incidents/${selectedPostMortemIncident.value.id}/post-mortem`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(postMortemForm.value)
				})).ok) {
					isPostMortemModalOpen.value = false;
					fetchIncidents();
				}
			} catch (err) {
				console.error("Save post-mortem error:", err);
			} finally {
				isSavingPostMortem.value = false;
			}
		}
		async function submitTimelineUpdate() {
			if (!selectedIncident.value) return;
			try {
				if ((await fetch(`/api/v1/incidents/${selectedIncident.value.id}/updates`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(updateForm.value)
				})).ok) {
					isUpdateModalOpen.value = false;
					fetchIncidents();
				}
			} catch (err) {
				console.error("Update incident error:", err);
			}
		}
		async function submitNewIncident() {
			try {
				if ((await fetch("/api/v1/incidents", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(createForm.value)
				})).ok) {
					isCreateModalOpen.value = false;
					createForm.value = {
						title: "",
						monitor_id: "",
						message: ""
					};
					fetchIncidents();
				}
			} catch (err) {
				console.error("Create incident error:", err);
			}
		}
		function formatDuration(startedAt, resolvedAt) {
			if (!resolvedAt) return "Ongoing";
			const start = new Date(startedAt).getTime();
			const end = new Date(resolvedAt).getTime();
			const diffMins = Math.round((end - start) / 6e4);
			if (diffMins < 60) return `${diffMins} menit`;
			return `${Math.floor(diffMins / 60)}j ${diffMins % 60}m`;
		}
		onMounted(() => {
			fetchBranding();
			fetchIncidents();
			fetchMonitors();
		});
		const __returned__ = {
			props,
			handleLogout,
			incidents,
			monitors,
			branding,
			statusFilter,
			isImageLogo,
			isUpdateModalOpen,
			isCreateModalOpen,
			selectedIncident,
			isPostMortemModalOpen,
			selectedPostMortemIncident,
			isSavingPostMortem,
			postMortemForm,
			updateForm,
			createForm,
			activeIncidents,
			resolvedIncidents,
			filteredIncidents,
			fetchBranding,
			fetchIncidents,
			fetchMonitors,
			openUpdateModal,
			openPostMortemModal,
			savePostMortem,
			submitTimelineUpdate,
			submitNewIncident,
			formatDuration,
			ref,
			computed,
			onMounted
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200" }, _attrs))}><div class="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1"><header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)]"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">`);
	if ($setup.isImageLogo($setup.branding.logo_icon)) _push(`<img${ssrRenderAttr("src", $setup.branding.logo_icon)} alt="Logo" class="w-4 h-4 object-contain rounded-full">`);
	else _push(`<span>${ssrInterpolate($setup.branding.logo_icon || "🌐")}</span>`);
	_push(`</div><div class="flex items-baseline gap-2"><h1 class="text-sm font-bold text-zinc-900 tracking-tight">${ssrInterpolate($setup.branding.app_name || "Uptime CJR")}</h1><span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| Manajemen Insiden</span></div></div><nav class="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-medium"><a href="/dashboard" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> Monitors </a><a href="/incidents" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors flex items-center gap-1.5 font-semibold"> Insiden `);
	if ($setup.activeIncidents.length > 0) _push(`<span class="px-1.5 py-px rounded-full text-[9px] font-bold bg-rose-500 text-white">${ssrInterpolate($setup.activeIncidents.length)}</span>`);
	else _push(`<!---->`);
	_push(`</a><a href="/reports" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> 📈 Laporan SLA </a><a href="/status/main" target="_blank" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> Status Page ↗ </a><a href="/settings" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> ⚙️ Pengaturan </a></nav><div class="flex items-center gap-2"><button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"><span>+</span> <span class="hidden sm:inline">Deklarasikan Insiden</span></button>`);
	if ($setup.props.currentUser) _push(`<div class="flex items-center gap-2 pl-2 border-l border-zinc-200 shrink-0"><div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs">${ssrInterpolate(($setup.props.currentUser.full_name || $setup.props.currentUser.email || "A")[0].toUpperCase())}</div><button title="Keluar dari sistem" class="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-[11px] transition-colors border border-zinc-200 cursor-pointer"> Keluar </button></div>`);
	else _push(`<!---->`);
	_push(`</div></header><div class="flex items-center justify-between p-2 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-xs text-xs"><div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl"><!--[-->`);
	ssrRenderList([
		{
			label: "Semua",
			val: "all",
			count: $setup.incidents.length
		},
		{
			label: "Aktif",
			val: "active",
			count: $setup.activeIncidents.length
		},
		{
			label: "Selesai",
			val: "resolved",
			count: $setup.resolvedIncidents.length
		}
	], (f) => {
		_push(`<button class="${ssrRenderClass([$setup.statusFilter === f.val ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900", "px-3 py-1 rounded-lg text-[11px] transition-all font-medium"])}">${ssrInterpolate(f.label)} (${ssrInterpolate(f.count)}) </button>`);
	});
	_push(`<!--]--></div><div class="text-[11px] text-zinc-400 font-mono pr-2">${ssrInterpolate($setup.filteredIncidents.length)} insiden tercatat </div></div><div class="space-y-4">`);
	if ($setup.statusFilter === "all" || $setup.statusFilter === "active") {
		_push(`<section class="space-y-2"><div class="flex items-center gap-2 px-1">`);
		if ($setup.activeIncidents.length > 0) _push(`<span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>`);
		else _push(`<!---->`);
		_push(`<h2 class="text-xs font-bold text-zinc-900 uppercase tracking-wider"> Insiden Aktif (${ssrInterpolate($setup.activeIncidents.length)}) </h2></div>`);
		if ($setup.activeIncidents.length === 0) _push(`<div class="p-8 text-center bg-white ring-1 ring-zinc-200/80 rounded-2xl space-y-1.5"><p class="text-xs font-bold text-emerald-700">✨ Seluruh Layanan Beroperasi Normal</p><p class="text-[11px] text-zinc-400">Tidak ada gangguan konektivitas atau degradasi aktif yang terdeteksi saat ini.</p></div>`);
		else {
			_push(`<div class="space-y-2"><!--[-->`);
			ssrRenderList($setup.activeIncidents, (inc) => {
				_push(`<div class="double-bezel"><div class="double-bezel-inner p-4 sm:p-5 space-y-3"><div class="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3"><div><div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">${ssrInterpolate(inc.status)}</span><span class="text-[10px] font-mono text-zinc-400">Dimulai: ${ssrInterpolate(new Date(inc.started_at).toLocaleString("id-ID"))}</span></div><h3 class="text-sm font-bold text-zinc-900 mt-1">${ssrInterpolate(inc.title)}</h3><p class="text-xs text-zinc-500 mt-0.5"> Dampak: <strong class="text-zinc-800">${ssrInterpolate(inc.monitor_name || "Seluruh Sistem")}</strong></p></div><button class="px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer shrink-0"> + Update Kronologi </button></div><div class="relative pl-5 space-y-3 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-zinc-200"><!--[-->`);
				ssrRenderList(inc.updates, (upd) => {
					_push(`<div class="relative"><span class="w-2.5 h-2.5 rounded-full bg-white border-2 border-rose-500 absolute -left-[18px] top-1"></span><div class="flex items-center gap-2"><span class="px-1.5 py-px rounded text-[9px] font-mono uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">${ssrInterpolate(upd.status)}</span><span class="text-[10px] text-zinc-400 font-mono">${ssrInterpolate(new Date(upd.created_at).toLocaleTimeString("id-ID"))}</span></div><p class="text-xs text-zinc-700 mt-1 leading-relaxed">${ssrInterpolate(upd.message)}</p></div>`);
				});
				_push(`<!--]--></div></div></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	if ($setup.statusFilter === "all" || $setup.statusFilter === "resolved") {
		_push(`<section class="space-y-2"><div class="px-1"><h2 class="text-xs font-bold text-zinc-900 uppercase tracking-wider"> Riwayat Insiden Selesai (${ssrInterpolate($setup.resolvedIncidents.length)}) </h2></div>`);
		if ($setup.resolvedIncidents.length === 0) _push(`<div class="p-8 text-center bg-white ring-1 ring-zinc-200/80 rounded-2xl text-xs text-zinc-400"> Belum ada riwayat insiden lampau. </div>`);
		else {
			_push(`<div class="space-y-2.5"><!--[-->`);
			ssrRenderList($setup.resolvedIncidents, (inc) => {
				_push(`<div class="double-bezel"><div class="double-bezel-inner p-4 sm:p-5 space-y-3"><div class="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3"><div><div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"> RESOLVED </span><span class="text-[10px] font-mono text-zinc-400">Durasi: ${ssrInterpolate($setup.formatDuration(inc.started_at, inc.resolved_at))}</span></div><h3 class="text-sm font-bold text-zinc-900 mt-1">${ssrInterpolate(inc.title)}</h3><p class="text-xs text-zinc-500 mt-0.5"> Dampak: <strong class="text-zinc-700">${ssrInterpolate(inc.monitor_name || "Seluruh Sistem")}</strong></p></div><button class="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"> 📝 Post-Mortem &amp; RCA </button></div>`);
				if (inc.root_cause) {
					_push(`<div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1"><div class="text-[10px] font-bold text-amber-700 uppercase tracking-wider">🔬 Akar Masalah (Root Cause):</div><p class="text-zinc-700 text-xs">${ssrInterpolate(inc.root_cause)}</p>`);
					if (inc.prevention_plan) _push(`<div class="pt-1"><div class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">🛡️ Rencana Pencegahan:</div><p class="text-zinc-700 text-xs">${ssrInterpolate(inc.prevention_plan)}</p></div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`<div class="relative pl-5 space-y-3 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-zinc-200"><!--[-->`);
				ssrRenderList(inc.updates, (upd) => {
					_push(`<div class="relative"><span class="w-2.5 h-2.5 rounded-full bg-white border-2 border-emerald-500 absolute -left-[18px] top-1"></span><div class="flex items-center gap-2"><span class="px-1.5 py-px rounded text-[9px] font-mono uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">${ssrInterpolate(upd.status)}</span><span class="text-[10px] text-zinc-400 font-mono">${ssrInterpolate(new Date(upd.created_at).toLocaleString("id-ID"))}</span></div><p class="text-xs text-zinc-600 mt-1 leading-relaxed">${ssrInterpolate(upd.message)}</p></div>`);
				});
				_push(`<!--]--></div></div></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	_push(`</div>`);
	if ($setup.isUpdateModalOpen) _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md double-bezel animate-in zoom-in-95 duration-200"><div class="double-bezel-inner p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-100 pb-3"><h3 class="text-sm font-bold text-zinc-900">Perbarui Kronologi Insiden</h3><button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer">×</button></div><form class="space-y-3.5"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Status Terbaru</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white"><option value="investigating"${ssrIncludeBooleanAttr(Array.isArray($setup.updateForm.status) ? ssrLooseContain($setup.updateForm.status, "investigating") : ssrLooseEqual($setup.updateForm.status, "investigating")) ? " selected" : ""}>Investigating (Investigasi)</option><option value="identified"${ssrIncludeBooleanAttr(Array.isArray($setup.updateForm.status) ? ssrLooseContain($setup.updateForm.status, "identified") : ssrLooseEqual($setup.updateForm.status, "identified")) ? " selected" : ""}>Identified (Penyebab Teridentifikasi)</option><option value="monitoring"${ssrIncludeBooleanAttr(Array.isArray($setup.updateForm.status) ? ssrLooseContain($setup.updateForm.status, "monitoring") : ssrLooseEqual($setup.updateForm.status, "monitoring")) ? " selected" : ""}>Monitoring (Pemulihan &amp; Monitoring)</option><option value="resolved"${ssrIncludeBooleanAttr(Array.isArray($setup.updateForm.status) ? ssrLooseContain($setup.updateForm.status, "resolved") : ssrLooseEqual($setup.updateForm.status, "resolved")) ? " selected" : ""}>Resolved (Terselesaikan Penuh)</option></select></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Pesan Kronologi / Update Teknis</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" rows="4" placeholder="Contoh: Tim teknis sedang merutekan ulang trafik gateway..." required>${ssrInterpolate($setup.updateForm.message)}</textarea></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-100"><button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">Batal</button><button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">Kirim Pembaruan</button></div></form></div></div></div>`);
	else _push(`<!---->`);
	if ($setup.isCreateModalOpen) {
		_push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md double-bezel animate-in zoom-in-95 duration-200"><div class="double-bezel-inner p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-100 pb-3"><h3 class="text-sm font-bold text-zinc-900">Deklarasikan Insiden Baru</h3><button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer">×</button></div><form class="space-y-3.5"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Judul Insiden</label><input${ssrRenderAttr("value", $setup.createForm.title)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" placeholder="e.g. Degradasi Konektivitas Database Utama" required></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Komponen / Monitor Terdampak</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white"><option value=""${ssrIncludeBooleanAttr(Array.isArray($setup.createForm.monitor_id) ? ssrLooseContain($setup.createForm.monitor_id, "") : ssrLooseEqual($setup.createForm.monitor_id, "")) ? " selected" : ""}>-- Seluruh Sistem / Infrastruktur Umum --</option><!--[-->`);
		ssrRenderList($setup.monitors, (m) => {
			_push(`<option${ssrRenderAttr("value", m.id)}${ssrIncludeBooleanAttr(Array.isArray($setup.createForm.monitor_id) ? ssrLooseContain($setup.createForm.monitor_id, m.id) : ssrLooseEqual($setup.createForm.monitor_id, m.id)) ? " selected" : ""}>${ssrInterpolate(m.name)} (${ssrInterpolate(m.type.toUpperCase())})</option>`);
		});
		_push(`<!--]--></select></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Status Awal</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:bg-white"><option value="investigating"${ssrIncludeBooleanAttr(Array.isArray($setup.createForm.status) ? ssrLooseContain($setup.createForm.status, "investigating") : ssrLooseEqual($setup.createForm.status, "investigating")) ? " selected" : ""}>Investigating</option><option value="identified"${ssrIncludeBooleanAttr(Array.isArray($setup.createForm.status) ? ssrLooseContain($setup.createForm.status, "identified") : ssrLooseEqual($setup.createForm.status, "identified")) ? " selected" : ""}>Identified</option><option value="monitoring"${ssrIncludeBooleanAttr(Array.isArray($setup.createForm.status) ? ssrLooseContain($setup.createForm.status, "monitoring") : ssrLooseEqual($setup.createForm.status, "monitoring")) ? " selected" : ""}>Monitoring</option></select></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">Pesan Kronologi Awal</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" rows="3" placeholder="Jelaskan temuan awal insiden..." required>${ssrInterpolate($setup.createForm.initial_message)}</textarea></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-100"><button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">Batal</button><button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm cursor-pointer">Deklarasikan</button></div></form></div></div></div>`);
	} else _push(`<!---->`);
	if ($setup.isPostMortemModalOpen) _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-lg double-bezel animate-in zoom-in-95 duration-200"><div class="double-bezel-inner p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-100 pb-3"><div><h3 class="text-sm font-bold text-zinc-900">Analisis Akar Masalah (RCA) &amp; Post-Mortem</h3><p class="text-[11px] text-zinc-400 mt-0.5">Insiden: ${ssrInterpolate($setup.selectedIncident?.title)}</p></div><button class="text-zinc-400 hover:text-zinc-900 text-lg leading-none cursor-pointer">×</button></div><form class="space-y-3.5"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">🔬 Akar Penyebab Masalah (Root Cause)</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" rows="3" placeholder="Contoh: Lonjakan beban trafik yang tidak terduga pada port pool database..." required>${ssrInterpolate($setup.postMortemForm.root_cause)}</textarea></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-700">🛡️ Rencana Mitigasi &amp; Pencegahan Masa Depan</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white" rows="3" placeholder="Contoh: Meningkatkan kapasitas connection pool dan menambahkan alert limit 80%...">${ssrInterpolate($setup.postMortemForm.prevention_plan)}</textarea></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-100"><button type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">Batal</button><button type="submit" class="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">Simpan Dokumen RCA</button></div></form></div></div></div>`);
	else _push(`<!---->`);
	_push(`</div><footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto"><div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono"><p>${ssrInterpolate($setup.branding.footer_text || "Powered by SentinelUp — Observability Platform")}</p></div></footer></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/IncidentView.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var IncidentView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region src/pages/incidents.astro
var incidents_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Incidents,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Incidents = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Incidents;
	const token = Astro.cookies.get("sentinel_session")?.value;
	const session = token ? validateSession(token) : null;
	if (!session) return Astro.redirect("/login");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Incident Response & Timeline" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main>${renderComponent($$result, "IncidentView", IncidentView_default, {
		"client:load": true,
		"currentUser": session.user,
		"client:component-hydration": "load",
		"client:component-path": "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/components/vue/IncidentView.vue",
		"client:component-export": "default"
	})}</main>` })}`;
}, "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/incidents.astro", void 0);
var $$file = "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/incidents.astro";
var $$url = "/incidents";
//#endregion
//#region \0virtual:astro:page:src/pages/incidents@_@astro
var page = () => incidents_exports;
//#endregion
export { page };
