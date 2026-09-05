<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs" 
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-2xl p-4 space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
          🗑️
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-xs font-bold text-zinc-900">{{ title || 'Konfirmasi Tindakan' }}</h3>
          <p class="text-[11px] text-zinc-600 mt-1 leading-relaxed">{{ message }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-200">
        <button 
          type="button" 
          :disabled="isLoading"
          class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
          @click="$emit('close')"
        >
          {{ cancelText || 'Batal' }}
        </button>
        <button 
          type="button" 
          :disabled="isLoading"
          class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-900 transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          :class="isDanger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm'"
          @click="$emit('confirm')"
        >
          <span v-if="isLoading" class="animate-spin text-xs">⏳</span>
          <span>{{ isLoading ? 'Memproses...' : (confirmText || 'Ya, Hapus') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi Penghapusan' },
  message: { type: String, default: 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.' },
  confirmText: { type: String, default: 'Ya, Hapus' },
  cancelText: { type: String, default: 'Batal' },
  isDanger: { type: Boolean, default: true },
  isLoading: { type: Boolean, default: false }
});

defineEmits(['confirm', 'close']);
</script>
