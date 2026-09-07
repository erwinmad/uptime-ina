<template>
  <button
    @click="toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
    aria-label="Toggle dark mode"
  >
    <Moon v-if="!isDark" class="w-3.5 h-3.5" />
    <Sun v-else class="w-3.5 h-3.5" />
  </button>
</template>

<script setup>
import { Moon, Sun } from 'lucide-vue-next';
import { useDarkMode } from '../../lib/useDarkMode';
const { isDark, toggle } = useDarkMode();
</script>
