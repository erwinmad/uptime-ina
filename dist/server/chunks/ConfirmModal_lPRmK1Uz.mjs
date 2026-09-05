import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { mergeProps, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttrs, ssrRenderClass } from "vue/server-renderer";
//#region src/components/vue/ConfirmModal.vue
var _sfc_main = {
	__name: "ConfirmModal",
	props: {
		isOpen: {
			type: Boolean,
			default: false
		},
		title: {
			type: String,
			default: "Konfirmasi Penghapusan"
		},
		message: {
			type: String,
			default: "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
		},
		confirmText: {
			type: String,
			default: "Ya, Hapus"
		},
		cancelText: {
			type: String,
			default: "Batal"
		},
		isDanger: {
			type: Boolean,
			default: true
		},
		isLoading: {
			type: Boolean,
			default: false
		}
	},
	emits: ["confirm", "close"],
	setup(__props, { expose: __expose }) {
		__expose();
		const __returned__ = {};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	if ($props.isOpen) {
		_push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs" }, _attrs))}><div class="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-2xl p-4 space-y-3"><div class="flex items-start gap-3"><div class="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"> 🗑️ </div><div class="min-w-0 flex-1"><h3 class="text-xs font-bold text-zinc-900">${ssrInterpolate($props.title || "Konfirmasi Tindakan")}</h3><p class="text-[11px] text-zinc-600 mt-1 leading-relaxed">${ssrInterpolate($props.message)}</p></div></div><div class="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-200"><button type="button"${ssrIncludeBooleanAttr($props.isLoading) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer">${ssrInterpolate($props.cancelText || "Batal")}</button><button type="button"${ssrIncludeBooleanAttr($props.isLoading) ? " disabled" : ""} class="${ssrRenderClass([$props.isDanger ? "bg-rose-600 hover:bg-rose-500" : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm", "px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-900 transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"])}">`);
		if ($props.isLoading) _push(`<span class="animate-spin text-xs">⏳</span>`);
		else _push(`<!---->`);
		_push(`<span>${ssrInterpolate($props.isLoading ? "Memproses..." : $props.confirmText || "Ya, Hapus")}</span></button></div></div></div>`);
	} else _push(`<!---->`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/ConfirmModal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ConfirmModal_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { ConfirmModal_default as t };
