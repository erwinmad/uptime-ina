import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { mergeProps, ref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region src/components/vue/ToastContainer.vue
var _sfc_main = {
	__name: "ToastContainer",
	setup(__props, { expose: __expose }) {
		const toasts = ref([]);
		let toastId = 0;
		const addToast = (message, type = "info", title = null, duration = 4e3) => {
			const id = ++toastId;
			const newToast = {
				id,
				message,
				type,
				title
			};
			toasts.value.push(newToast);
			if (duration > 0) setTimeout(() => {
				removeToast(id);
			}, duration);
			return id;
		};
		const removeToast = (id) => {
			const index = toasts.value.findIndex((t) => t.id === id);
			if (index !== -1) toasts.value.splice(index, 1);
		};
		__expose({
			addToast,
			removeToast
		});
		const __returned__ = {
			toasts,
			get toastId() {
				return toastId;
			},
			set toastId(v) {
				toastId = v;
			},
			addToast,
			removeToast,
			ref
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none" }, _attrs))}><!--[-->`);
	ssrRenderList($setup.toasts, (toast) => {
		_push(`<div class="${ssrRenderClass([{
			"ring-emerald-200": toast.type === "success",
			"ring-rose-200": toast.type === "error",
			"ring-amber-200": toast.type === "warning",
			"ring-zinc-200": toast.type === "info"
		}, "pointer-events-auto bg-white ring-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3.5 min-w-[260px] max-w-xs rounded-2xl flex items-start gap-3"])}"><div class="shrink-0 mt-0.5">`);
		if (toast.type === "success") _push(`<span class="text-emerald-600 font-bold">✓</span>`);
		else if (toast.type === "error") _push(`<span class="text-rose-600 font-bold">✕</span>`);
		else if (toast.type === "warning") _push(`<span class="text-amber-600 font-bold">⚠</span>`);
		else _push(`<span class="text-zinc-500 font-bold">i</span>`);
		_push(`</div><div class="flex-1">`);
		if (toast.title) _push(`<h4 class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 mb-0.5">${ssrInterpolate(toast.title)}</h4>`);
		else _push(`<!---->`);
		_push(`<p class="text-xs text-zinc-600 leading-relaxed font-sans">${ssrInterpolate(toast.message)}</p></div><button class="shrink-0 text-zinc-400 hover:text-zinc-900 transition-colors p-1 -mr-1 -mt-1 rounded-full cursor-pointer text-xs"> ✕ </button></div>`);
	});
	_push(`<!--]--></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/ToastContainer.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ToastContainer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region src/components/vue/useToast.js
var _toastRef = null;
function setToastRef(ref) {
	_toastRef = ref;
}
function useToast() {
	return { toast: {
		success(message, title) {
			_toastRef?.value?.addToast(message, "success", title || "Berhasil");
		},
		error(message, title) {
			_toastRef?.value?.addToast(message, "error", title || "Gagal", 6e3);
		},
		warning(message, title) {
			_toastRef?.value?.addToast(message, "warning", title || "Peringatan", 5e3);
		},
		info(message, title) {
			_toastRef?.value?.addToast(message, "info", title, 3500);
		}
	} };
}
//#endregion
export { useToast as n, ToastContainer_default as r, setToastRef as t };
