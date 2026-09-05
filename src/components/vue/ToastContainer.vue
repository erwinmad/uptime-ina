<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
    <TransitionGroup 
      enter-active-class="transition duration-400 ease-awwwards"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-300 ease-awwwards absolute w-full"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95 blur-sm"
      move-class="transition duration-400 ease-awwwards"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="pointer-events-auto bg-white ring-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3.5 min-w-[260px] max-w-xs rounded-2xl flex items-start gap-3"
        :class="{
          'ring-emerald-200': toast.type === 'success',
          'ring-rose-200': toast.type === 'error',
          'ring-amber-200': toast.type === 'warning',
          'ring-zinc-200': toast.type === 'info'
        }"
      >
        <div class="shrink-0 mt-0.5">
          <span v-if="toast.type === 'success'" class="text-emerald-600 font-bold">✓</span>
          <span v-else-if="toast.type === 'error'" class="text-rose-600 font-bold">✕</span>
          <span v-else-if="toast.type === 'warning'" class="text-amber-600 font-bold">⚠</span>
          <span v-else class="text-zinc-500 font-bold">i</span>
        </div>
        <div class="flex-1">
          <h4 v-if="toast.title" class="text-[10px] uppercase tracking-wider font-bold text-zinc-900 mb-0.5">{{ toast.title }}</h4>
          <p class="text-xs text-zinc-600 leading-relaxed font-sans">{{ toast.message }}</p>
        </div>
        <button 
          @click="removeToast(toast.id)" 
          class="shrink-0 text-zinc-400 hover:text-zinc-900 transition-colors p-1 -mr-1 -mt-1 rounded-full cursor-pointer text-xs"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

const addToast = (message, type = 'info', title = null, duration = 4000) => {
  const id = ++toastId;
  const newToast = { id, message, type, title };
  
  toasts.value.push(newToast);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

defineExpose({
  addToast,
  removeToast
});
</script>