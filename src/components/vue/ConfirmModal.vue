<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs" 
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-4">
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
          <Trash2 v-if="isDanger" class="w-5 h-5" />
          <AlertCircle v-else class="w-5 h-5 text-amber-600" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-bold text-zinc-900">{{ title || 'Konfirmasi Tindakan' }}</h3>
          <p class="text-xs text-zinc-500 mt-1 leading-relaxed">{{ message }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
        <button 
          type="button" 
          :disabled="isLoading"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
          @click="$emit('close')"
        >
          {{ cancelText || 'Batal' }}
        </button>
        <button 
          type="button" 
          :disabled="isLoading"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          :class="isDanger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-800'"
          @click="$emit('confirm')"
        >
          <span v-if="isLoading" class="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <span>{{ isLoading ? 'Memproses...' : (confirmText || 'Ya, Hapus') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trash2, AlertCircle } from 'lucide-vue-next';

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
