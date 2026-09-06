<template>
  <div class="flex items-center bg-zinc-100 border border-zinc-200 rounded-lg p-0.5 shadow-2xs">
    <button
      @click="setLocale('id')"
      class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer"
      :class="locale === 'id' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-700'"
      :aria-pressed="locale === 'id'"
      title="Bahasa Indonesia"
    >
      ID
    </button>
    <button
      @click="setLocale('en')"
      class="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer"
      :class="locale === 'en' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-700'"
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
