import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_C_2vkNBj.mjs";
import { t as createComponent } from "./compiler_cCjE28FH.mjs";
import { n as $$BaseLayout, t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { defineComponent, mergeProps, onMounted, ref, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs } from "vue/server-renderer";
//#region src/components/vue/LoginView.vue
var _sfc_main = /*@__PURE__*/ defineComponent({
	__name: "LoginView",
	setup(__props, { expose: __expose }) {
		__expose();
		const loading = ref(true);
		const submitting = ref(false);
		const errorMessage = ref("");
		const successMessage = ref("");
		const branding = ref({
			app_name: "Uptime CJR",
			app_tagline: "Sistem Pemantauan Ketersediaan Layanan & Infrastruktur",
			logo_icon: "🌐",
			footer_text: "© 2026 Uptime CJR — Dinas Komunikasi dan Informatika"
		});
		const form = ref({
			email: "",
			password: ""
		});
		const isImg = (s) => s && (s.startsWith("http") || s.startsWith("/") || s.startsWith("data:image"));
		async function checkAuthStatus() {
			loading.value = true;
			try {
				const bRes = await fetch("/api/v1/settings/branding");
				if (bRes.ok) branding.value = await bRes.json();
				const res = await fetch("/api/v1/auth");
				if (res.ok) {
					if ((await res.json()).authenticated) {
						window.location.href = "/dashboard";
						return;
					}
				}
			} catch (err) {
				console.error("Failed checking auth state:", err);
			} finally {
				loading.value = false;
			}
		}
		async function handleLogin() {
			errorMessage.value = "";
			successMessage.value = "";
			if (!form.value.email || !form.value.password) {
				errorMessage.value = "Akses ditolak: Kredensial tidak lengkap.";
				return;
			}
			submitting.value = true;
			try {
				const res = await fetch("/api/v1/auth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "login",
						email: form.value.email,
						password: form.value.password
					})
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Akses ditolak: Kredensial tidak valid.");
				successMessage.value = "Autentikasi terverifikasi. Membuka sesi...";
				setTimeout(() => {
					window.location.href = "/dashboard";
				}, 600);
			} catch (err) {
				errorMessage.value = err.message || "Koneksi ke node autentikasi gagal.";
			} finally {
				submitting.value = false;
			}
		}
		onMounted(() => {
			checkAuthStatus();
		});
		const __returned__ = {
			loading,
			submitting,
			errorMessage,
			successMessage,
			branding,
			form,
			isImg,
			checkAuthStatus,
			handleLogin
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[100dvh] bg-[#FAFAFA] text-zinc-900 flex flex-col justify-center items-center p-4 sm:p-8 selection:bg-zinc-200" }, _attrs))}><div class="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-zinc-200/50 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"></div><div class="w-full max-w-sm w-full animate-in fade-in duration-500"><div class="mb-10 text-center flex flex-col items-center"><div class="w-14 h-14 rounded-full bg-white ring-1 ring-zinc-200 flex items-center justify-center text-2xl shadow-sm mb-5 relative">`);
	if ($setup.isImg($setup.branding.logo_icon)) _push(`<img${ssrRenderAttr("src", $setup.branding.logo_icon)} alt="Logo" class="w-7 h-7 object-contain rounded-full">`);
	else _push(`<span>${ssrInterpolate($setup.branding.logo_icon || "🌐")}</span>`);
	_push(`</div><h1 class="text-xl font-bold tracking-tight text-zinc-900 mb-1.5">${ssrInterpolate($setup.branding.app_name)}</h1><p class="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">${ssrInterpolate($setup.branding.app_tagline)}</p></div><div class="double-bezel"><div class="double-bezel-inner p-6 sm:p-8">`);
	if ($setup.loading) _push(`<div class="py-10 flex flex-col items-center justify-center gap-3 text-zinc-400"><div class="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div><span class="text-[10px] font-mono tracking-wider uppercase">Inisialisasi Sesi...</span></div>`);
	else {
		_push(`<div class="space-y-6"><div class="flex items-center justify-between border-b border-zinc-100 pb-3"><h2 class="text-sm font-bold text-zinc-900 tracking-tight">Otentikasi Operator</h2><span class="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold tracking-wider uppercase bg-zinc-100 text-zinc-500 border border-zinc-200"> Restricted </span></div>`);
		if ($setup.errorMessage) _push(`<div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-mono flex items-start gap-2"><span class="mt-0.5 font-bold">✕</span><span class="leading-relaxed">${ssrInterpolate($setup.errorMessage)}</span></div>`);
		else _push(`<!---->`);
		if ($setup.successMessage) _push(`<div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono flex items-start gap-2"><span class="mt-0.5 font-bold">✓</span><span class="leading-relaxed">${ssrInterpolate($setup.successMessage)}</span></div>`);
		else _push(`<!---->`);
		_push(`<form class="space-y-4"><div class="space-y-1.5"><label class="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">Identitas Akses (Email)</label><input${ssrRenderAttr("value", $setup.form.email)} type="email" required autocomplete="email" placeholder="operator@instansi.go.id" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200"></div><div class="space-y-1.5"><label class="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">Kata Sandi</label><input${ssrRenderAttr("value", $setup.form.password)} type="password" required autocomplete="current-password" placeholder="••••••••••••" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200"></div><button type="submit"${ssrIncludeBooleanAttr($setup.submitting) ? " disabled" : ""} class="group w-full mt-2 py-3 px-5 rounded-xl font-semibold text-xs text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">`);
		if ($setup.submitting) _push(`<span class="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>`);
		else _push(`<!---->`);
		_push(`<span>${ssrInterpolate($setup.submitting ? "Memverifikasi..." : "Masuk Sistem")}</span>`);
		if (!$setup.submitting) _push(`<div class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"><span class="text-[9px]">→</span></div>`);
		else _push(`<!---->`);
		_push(`</button></form></div>`);
	}
	_push(`</div></div><div class="mt-8 text-center space-y-3"><a href="/status/main" class="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors duration-200 group"><span class="transition-transform duration-200 group-hover:-translate-x-1">←</span> Kembali ke Status Publik </a><p class="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">${ssrInterpolate($setup.branding.footer_text)}</p></div></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/LoginView.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LoginView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region src/pages/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	url: () => $$url
});
var $$Login = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Masuk & Autentikasi Operator" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main>${renderComponent($$result, "LoginView", LoginView_default, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/components/vue/LoginView.vue",
		"client:component-export": "default"
	})}</main>` })}`;
}, "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/login.astro", void 0);
var $$file = "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/login.astro";
var $$url = "/login";
//#endregion
//#region \0virtual:astro:page:src/pages/login@_@astro
var page = () => login_exports;
//#endregion
export { page };
