<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" @click.self="close">
    <div class="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl text-zinc-900 double-bezel animate-in zoom-in-95 duration-200">
      <div class="double-bezel-inner p-1">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h3 class="text-base font-bold text-zinc-900 tracking-tight">{{ isEditing ? t('monitorModal.editConfig') : t('monitorModal.addNew') }}</h3>
          <button class="text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer" @click="close">&times;</button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="submitForm" class="p-6 space-y-4">
          <!-- Monitor Type Selector -->
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.monitorType') }}</label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <button 
                type="button" 
                class="py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer" 
                :class="form.type === 'http' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'" 
                @click="form.type = 'http'"
              >
                🌐 HTTP
              </button>
              <button 
                type="button" 
                class="py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer" 
                :class="form.type === 'browser' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'" 
                @click="form.type = 'browser'"
              >
                🖥️ Browser
              </button>
              <button 
                type="button" 
                class="py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer" 
                :class="form.type === 'tcp' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'" 
                @click="form.type = 'tcp'"
              >
                🔌 TCP
              </button>
              <button 
                type="button" 
                class="py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer" 
                :class="form.type === 'dns' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'" 
                @click="form.type = 'dns'"
              >
                🧭 DNS
              </button>
              <button 
                type="button" 
                class="py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer" 
                :class="form.type === 'ping' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'" 
                @click="form.type = 'ping'"
              >
                📡 Ping
              </button>
              <button 
                type="button" 
                class="py-2 text-xs font-semibold rounded-lg transition-colors text-center cursor-pointer" 
                :class="form.type === 'push' ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'" 
                @click="form.type = 'push'"
              >
                💓 Push
              </button>
            </div>
          </div>

        <!-- Friendly Name & Category (Grid) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.monitorName') }}</label>
            <input 
              v-model="form.name" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all" 
              placeholder="e.g. Production API Gateway" 
              required 
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.groupCategory') }}</label>
            <input 
              v-model="form.category_name" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all" 
              placeholder="e.g. Core Services, Database, Eksternal" 
            />
          </div>
        </div>

          <!-- Target / URL for HTTP, Browser, TCP, Ping, DNS -->
          <div v-if="form.type !== 'push'" class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ form.type === 'http' || form.type === 'browser' ? t('monitorModal.targetUrl') : (form.type === 'dns' ? t('monitorModal.domainHostname') : t('monitorModal.targetHost')) }}</label>
            <input 
              v-model="form.target" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:bg-white transition-all font-mono" 
              :placeholder="form.type === 'http' || form.type === 'browser' ? 'https://api.example.com/health' : (form.type === 'dns' ? 'example.com' : '1.1.1.1 or api.example.com')" 
              required 
            />
          </div>

        <!-- Target placeholder for Push -->
        <div v-else class="space-y-1.5">
          <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.jobDescription') }}</label>
          <input 
            v-model="form.target" 
            class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white transition-all" 
            placeholder="e.g. Daily DB Backup Cron" 
            required 
          />
        </div>

        <!-- Port for TCP -->
        <div v-if="form.type === 'tcp'" class="space-y-1.5">
          <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.port') }}</label>
          <input 
            v-model.number="form.port" 
            type="number" 
            class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white transition-all" 
            placeholder="e.g. 5432 or 80" 
            required 
          />
        </div>

        <!-- DNS Advanced Settings -->
        <div v-if="form.type === 'dns'" class="p-3.5 bg-zinc-50/60 border border-zinc-200 rounded-lg space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.dnsRecordType') }}</label>
              <select v-model="form.dns_record_type" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX (Mail Server)</option>
                <option value="TXT">TXT</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.expectedValue') }}</label>
              <input 
                v-model="form.dns_expected_value" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                placeholder="e.g. 1.1.1.1 or mx.example.com" 
              />
            </div>
          </div>
          <p class="text-[11px] text-zinc-400">Pengecekan record DNS resolver dan assertion kecocokan nilai.</p>
        </div>

        <!-- HTTP Advanced Settings -->
        <div v-if="form.type === 'http'" class="p-3.5 bg-zinc-50/60 border border-zinc-200 rounded-lg space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.httpMethod') }}</label>
              <select v-model="form.http_method" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.expectedStatus') }}</label>
              <input 
                v-model="expectedStatusInput" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                placeholder="200, 201" 
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.keywordAssertion') }}</label>
            <input 
              v-model="form.keyword_match" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              placeholder='e.g. "status": "ok"' 
            />
          </div>

          <label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 pt-1">
            <input type="checkbox" v-model="form.ssl_check_enabled" class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-zinc-400" />
            <span>{{ t('monitorModal.sslCheck') }}</span>
          </label>
        </div>

        <!-- Push Heartbeat Settings -->
        <div v-if="form.type === 'push'" class="p-3.5 bg-zinc-50/60 border border-zinc-200 rounded-lg space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.pushInterval') }}</label>
              <input 
                v-model.number="form.push_expected_interval_seconds" 
                type="number" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                placeholder="3600 (1 jam)" 
                min="10" 
              />
            </div>
            <div class="space-y-1">
              <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.gracePeriod') }}</label>
              <input 
                v-model.number="form.push_grace_period_seconds" 
                type="number" 
                class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
                placeholder="60" 
                min="10" 
              />
            </div>
          </div>
          <p class="text-[11px] text-zinc-400">{{ t('monitorModal.pushDesc') }}</p>
        </div>

        <!-- Tags Field -->
        <div class="space-y-1.5">
          <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.tagsLabel') }}</label>
          <input 
            v-model="tagsInput" 
            class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white transition-all" 
            placeholder="e.g. Production, Database, API, Internal" 
          />
        </div>

        <!-- Interval & Retry Settings -->
        <div v-if="form.type !== 'push'" class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.intervalCheck') }}</label>
            <input 
              v-model.number="form.interval_seconds" 
              type="number" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              min="10" 
              required 
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{{ t('monitorModal.toleranceDown') }}</label>
            <input 
              v-model.number="form.retries_before_down" 
              type="number" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" 
              min="1" 
              max="10" 
              required 
            />
          </div>
        </div>

        <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs">
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200">
          <button type="button" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors" @click="close">
            {{ t('monitorModal.cancel') }}
          </button>
          <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm" :disabled="isSubmitting">
            {{ isSubmitting ? t('monitorModal.saving') : (isEditing ? t('monitorModal.updateMonitor') : t('monitorModal.createMonitor')) }}
          </button>
        </div>
      </form>
      </div> <!-- /double-bezel-inner -->
    </div> <!-- /double-bezel -->
  </div> <!-- /modal overlay -->
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from '../../lib/i18n';
const { t } = useI18n();

const props = defineProps({
  isOpen: Boolean,
  monitorData: Object
});

const emit = defineEmits(['close', 'saved']);

const isEditing = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const expectedStatusInput = ref('200');
const tagsInput = ref('');

const defaultForm = () => ({
  name: '',
  type: 'http',
  target: '',
  port: null,
  interval_seconds: 30,
  timeout_seconds: 15,
  retries_before_down: 6,
  http_method: 'GET',
  expected_status_codes: '[200]',
  keyword_match: '',
  ssl_check_enabled: true,
  push_expected_interval_seconds: 300,
  push_grace_period_seconds: 60,
  dns_record_type: 'A',
  dns_expected_value: '',
  category_name: 'Core Services'
});

const form = reactive(defaultForm());

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    errorMessage.value = '';
    if (props.monitorData) {
      isEditing.value = true;
      Object.assign(form, props.monitorData);
      form.ssl_check_enabled = Boolean(props.monitorData.ssl_check_enabled);
      
      // Parse tags
      if (Array.isArray(props.monitorData.tags)) {
        tagsInput.value = props.monitorData.tags.join(', ');
      } else if (typeof props.monitorData.tags === 'string') {
        try {
          const parsed = JSON.parse(props.monitorData.tags);
          tagsInput.value = Array.isArray(parsed) ? parsed.join(', ') : props.monitorData.tags;
        } catch {
          tagsInput.value = props.monitorData.tags;
        }
      } else {
        tagsInput.value = '';
      }

      try {
        const codes = JSON.parse(props.monitorData.expected_status_codes || '[200]');
        expectedStatusInput.value = Array.isArray(codes) ? codes.join(', ') : '200';
      } catch {
        expectedStatusInput.value = '200';
      }
    } else {
      isEditing.value = false;
      Object.assign(form, defaultForm());
      tagsInput.value = '';
      expectedStatusInput.value = '200';
    }
  }
});

function close() {
  emit('close');
}

async function submitForm() {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const codes = expectedStatusInput.value
      .split(',')
      .map(c => parseInt(c.trim(), 10))
      .filter(c => !isNaN(c));

    const parsedTags = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      tags: parsedTags,
      expected_status_codes: JSON.stringify(codes.length > 0 ? codes : [200]),
      ssl_check_enabled: form.ssl_check_enabled ? 1 : 0
    };

    let res;
    if (isEditing.value && props.monitorData?.id) {
      res = await fetch(`/api/v1/monitors/${props.monitorData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/api/v1/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save monitor');
    }

    emit('saved');
    close();
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
}
</script>
