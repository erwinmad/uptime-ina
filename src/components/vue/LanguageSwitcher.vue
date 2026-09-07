<template>
  <div class="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 shadow-2xs">
    <button
      type="button"
      @click.prevent.stop="setLocale('id')"
      class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer"
      :class="locale === 'id' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
      :aria-pressed="locale === 'id'"
      title="Bahasa Indonesia"
    >
      ID
    </button>
    <button
      type="button"
      @click.prevent.stop="setLocale('en')"
      class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer"
      :class="locale === 'en' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'"
      :aria-pressed="locale === 'en'"
      title="English"
    >
      EN
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '../../lib/i18n';
const { locale, setLocale } = useI18n();
</script>
