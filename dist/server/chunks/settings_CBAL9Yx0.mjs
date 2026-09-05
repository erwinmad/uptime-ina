import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_C_2vkNBj.mjs";
import { t as createComponent } from "./compiler_cCjE28FH.mjs";
import { c as validateSession } from "./db_BJLNYA76.mjs";
import { n as $$BaseLayout, t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper_DAhNpSzi.mjs";
import { t as ConfirmModal_default } from "./ConfirmModal_lPRmK1Uz.mjs";
import { mergeProps, onMounted, ref, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region src/components/vue/SettingsView.vue
var _sfc_main = {
	__name: "SettingsView",
	props: { currentUser: {
		type: Object,
		default: () => null
	} },
	setup(__props, { expose: __expose }) {
		__expose();
		const props = __props;
		async function handleLogout() {
			try {
				await fetch("/api/v1/auth", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "logout" })
				});
			} catch {}
			window.location.href = "/login";
		}
		const currentTab = ref("branding");
		const channels = ref([]);
		const apiKeys = ref([]);
		const auditLogs = ref([]);
		const maintenanceWindows = ref([]);
		const monitors = ref([]);
		const newGeneratedKey = ref(null);
		const isChannelModalOpen = ref(false);
		const isKeyModalOpen = ref(false);
		const isMaintModalOpen = ref(false);
		const channelForm = ref({
			type: "discord",
			name: "",
			url: "",
			botToken: "",
			chatId: ""
		});
		const keyForm = ref({
			name: "",
			scopes: ["*"]
		});
		const isSaving = ref(false);
		const saveSuccess = ref(false);
		const brandingForm = ref({
			app_name: "Uptime CJR",
			app_tagline: "Sistem Pemantauan Ketersediaan Layanan & Infrastruktur",
			footer_text: "© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur",
			logo_icon: "🌐",
			favicon_url: ""
		});
		function isImageLogo(url) {
			return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:image"));
		}
		function applyPreset(preset) {
			if (preset === "cjr") {
				brandingForm.value.app_name = "Uptime CJR";
				brandingForm.value.app_tagline = "Sistem Pemantauan Ketersediaan Layanan & Infrastruktur";
				brandingForm.value.footer_text = "© 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur";
				brandingForm.value.logo_icon = "🌐";
				brandingForm.value.favicon_url = "";
			} else if (preset === "sentinel") {
				brandingForm.value.app_name = "SentinelUp";
				brandingForm.value.app_tagline = "Advanced Uptime & Observability";
				brandingForm.value.footer_text = "Powered by SentinelUp — High Availability Uptime & Observability";
				brandingForm.value.logo_icon = "🛡️";
				brandingForm.value.favicon_url = "";
			} else if (preset === "cloud") {
				brandingForm.value.app_name = "CloudOps Monitor";
				brandingForm.value.app_tagline = "Real-time Cloud & Microservice Reliability";
				brandingForm.value.footer_text = "CloudOps Platform — Continuous Service Health";
				brandingForm.value.logo_icon = "⚡";
				brandingForm.value.favicon_url = "";
			}
		}
		async function fetchBranding() {
			try {
				const res = await fetch("/api/v1/settings/branding");
				if (res.ok) {
					const data = await res.json();
					brandingForm.value = {
						...brandingForm.value,
						...data
					};
				}
			} catch (err) {
				console.error("Fetch branding error:", err);
			}
		}
		async function saveBranding() {
			isSaving.value = true;
			saveSuccess.value = false;
			try {
				const res = await fetch("/api/v1/settings/branding", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(brandingForm.value)
				});
				if (res.ok) {
					const updated = await res.json();
					brandingForm.value = updated;
					saveSuccess.value = true;
					if (typeof window !== "undefined") {
						window.dispatchEvent(new CustomEvent("branding_updated", { detail: updated }));
						document.title = `${updated.app_name} — Pengaturan & Identitas`;
					}
					setTimeout(() => {
						saveSuccess.value = false;
					}, 4e3);
				}
			} catch (err) {
				console.error("Save branding error:", err);
			} finally {
				isSaving.value = false;
			}
		}
		const confirmModal = ref({
			isOpen: false,
			title: "",
			message: "",
			confirmText: "Ya, Hapus",
			isDanger: true,
			isLoading: false,
			action: null
		});
		function openConfirmDialog({ title, message, confirmText = "Ya, Hapus", isDanger = true, action }) {
			confirmModal.value = {
				isOpen: true,
				title,
				message,
				confirmText,
				isDanger,
				isLoading: false,
				action
			};
		}
		async function handleModalConfirm() {
			if (confirmModal.value.action) {
				confirmModal.value.isLoading = true;
				try {
					await confirmModal.value.action();
					confirmModal.value.isOpen = false;
				} catch (err) {
					console.error("Modal confirm action error:", err);
				} finally {
					confirmModal.value.isLoading = false;
				}
			}
		}
		function resetBrandingDefaults() {
			openConfirmDialog({
				title: "Reset Konfigurasi Branding",
				message: "Kembalikan seluruh konfigurasi identitas & branding ke standar default SentinelUp?",
				confirmText: "Ya, Reset Default",
				isDanger: false,
				action: async () => {
					applyPreset("sentinel");
					await saveBranding();
				}
			});
		}
		const now = /* @__PURE__ */ new Date();
		const later = new Date(now.getTime() + 72e5);
		const toLocalIso = (d) => (/* @__PURE__ */ new Date(d.getTime() - d.getTimezoneOffset() * 6e4)).toISOString().slice(0, 16);
		const maintForm = ref({
			title: "",
			description: "",
			start_time: toLocalIso(now),
			end_time: toLocalIso(later),
			scope: "all",
			selectedIds: []
		});
		async function fetchChannels() {
			try {
				const res = await fetch("/api/v1/channels");
				if (res.ok) channels.value = await res.json();
			} catch (err) {
				console.error("Fetch channels error:", err);
			}
		}
		async function fetchKeys() {
			try {
				const res = await fetch("/api/v1/api-keys");
				if (res.ok) apiKeys.value = await res.json();
			} catch (err) {
				console.error("Fetch keys error:", err);
			}
		}
		async function fetchAudit() {
			try {
				const res = await fetch("/api/v1/audit-logs");
				if (res.ok) auditLogs.value = await res.json();
			} catch (err) {
				console.error("Fetch audit error:", err);
			}
		}
		async function submitNewChannel() {
			try {
				const config = {};
				if (channelForm.value.type === "telegram") {
					config.botToken = channelForm.value.botToken;
					config.chatId = channelForm.value.chatId;
				} else {
					config.url = channelForm.value.url;
					config.webhookUrl = channelForm.value.url;
				}
				if ((await fetch("/api/v1/channels", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						type: channelForm.value.type,
						name: channelForm.value.name,
						config
					})
				})).ok) {
					isChannelModalOpen.value = false;
					channelForm.value = {
						type: "discord",
						name: "",
						url: "",
						botToken: "",
						chatId: ""
					};
					fetchChannels();
				}
			} catch (err) {
				console.error("Submit channel error:", err);
			}
		}
		function deleteChannel(id) {
			openConfirmDialog({
				title: "Hapus Saluran Notifikasi",
				message: "Apakah Anda yakin ingin menghapus saluran notifikasi ini? Notifikasi downtime tidak akan dikirimkan ke saluran ini lagi.",
				confirmText: "Ya, Hapus Saluran",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/channels/${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchChannels();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus saluran" }));
							alert(err.error || "Gagal menghapus saluran");
						}
					} catch (err) {
						console.error("Delete channel error:", err);
					}
				}
			});
		}
		async function submitNewApiKey() {
			try {
				const res = await fetch("/api/v1/api-keys", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(keyForm.value)
				});
				if (res.ok) {
					newGeneratedKey.value = await res.json();
					isKeyModalOpen.value = false;
					keyForm.value = {
						name: "",
						scopes: ["*"]
					};
					fetchKeys();
				}
			} catch (err) {
				console.error("Generate key error:", err);
			}
		}
		function revokeKey(id) {
			openConfirmDialog({
				title: "Cabut API Key",
				message: "Cabut API Key ini? Script, automasi, atau pipeline CI/CD yang menggunakan key ini akan langsung ditolak aksesnya.",
				confirmText: "Ya, Cabut Key",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/api-keys?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchKeys();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal mencabut key" }));
							alert(err.error || "Gagal mencabut key");
						}
					} catch (err) {
						console.error("Revoke key error:", err);
					}
				}
			});
		}
		function copyKey(key) {
			navigator.clipboard.writeText(key);
			alert("API Key copied to clipboard!");
		}
		async function fetchMaintenance() {
			try {
				const res = await fetch("/api/v1/maintenance");
				if (res.ok) maintenanceWindows.value = await res.json();
			} catch (err) {
				console.error("Fetch maintenance error:", err);
			}
		}
		async function fetchMonitors() {
			try {
				const res = await fetch("/api/v1/monitors");
				if (res.ok) monitors.value = await res.json();
			} catch (err) {
				console.error("Fetch monitors error:", err);
			}
		}
		async function submitMaintenance() {
			try {
				const affected = maintForm.value.scope === "all" ? ["*"] : maintForm.value.selectedIds;
				if ((await fetch("/api/v1/maintenance", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: maintForm.value.title,
						description: maintForm.value.description,
						start_time: new Date(maintForm.value.start_time).toISOString(),
						end_time: new Date(maintForm.value.end_time).toISOString(),
						affected_monitor_ids: affected
					})
				})).ok) {
					isMaintModalOpen.value = false;
					maintForm.value.title = "";
					maintForm.value.description = "";
					fetchMaintenance();
				}
			} catch (err) {
				console.error("Submit maintenance error:", err);
			}
		}
		function deleteMaintenance(id) {
			openConfirmDialog({
				title: "Hapus Jadwal Pemeliharaan",
				message: "Hapus jadwal maintenance ini? Pemantauan dan alarm untuk monitor terkait akan kembali normal.",
				confirmText: "Ya, Hapus",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/maintenance?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchMaintenance();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus maintenance" }));
							alert(err.error || "Gagal menghapus maintenance");
						}
					} catch (err) {
						console.error("Delete maintenance error:", err);
					}
				}
			});
		}
		const escalations = ref([]);
		const isEscModalOpen = ref(false);
		const escForm = ref({
			name: "",
			wait_minutes: 15,
			channel_ids: []
		});
		function getChannelName(chId) {
			const ch = channels.value.find((c) => c.id === chId);
			return ch ? ch.name : chId;
		}
		async function fetchEscalations() {
			try {
				const res = await fetch("/api/v1/escalation");
				if (res.ok) escalations.value = await res.json();
			} catch (err) {
				console.error("Fetch escalations error:", err);
			}
		}
		async function submitNewEscalation() {
			try {
				if ((await fetch("/api/v1/escalation", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(escForm.value)
				})).ok) {
					isEscModalOpen.value = false;
					escForm.value = {
						name: "",
						wait_minutes: 15,
						channel_ids: []
					};
					fetchEscalations();
				}
			} catch (err) {
				console.error("Submit escalation error:", err);
			}
		}
		function deleteEscalation(id) {
			openConfirmDialog({
				title: "Hapus Aturan Eskalasi",
				message: "Apakah Anda yakin ingin menghapus aturan eskalasi insiden ini?",
				confirmText: "Ya, Hapus",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/escalation?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchEscalations();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus eskalasi" }));
							alert(err.error || "Gagal menghapus eskalasi");
						}
					} catch (err) {
						console.error("Delete escalation error:", err);
					}
				}
			});
		}
		const importJsonText = ref("");
		const isImporting = ref(false);
		const importSuccessMsg = ref("");
		const importErrorMsg = ref("");
		function handleFileUpload(event) {
			const file = event.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (e) => {
				importJsonText.value = e.target.result;
			};
			reader.readAsText(file);
		}
		async function executeKumaImport() {
			importSuccessMsg.value = "";
			importErrorMsg.value = "";
			isImporting.value = true;
			try {
				const parsed = JSON.parse(importJsonText.value);
				const res = await fetch("/api/v1/import/kuma", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ data: parsed })
				});
				const result = await res.json();
				if (res.ok) {
					importSuccessMsg.value = `Berhasil mengimpor ${result.imported_count} monitor dari Uptime Kuma!`;
					importJsonText.value = "";
					fetchMonitors();
				} else importErrorMsg.value = result.error || "Gagal mengimpor monitor";
			} catch (err) {
				importErrorMsg.value = "Format JSON tidak valid atau gagal diproses: " + err.message;
			} finally {
				isImporting.value = false;
			}
		}
		const pwdForm = ref({
			oldPassword: "",
			newPassword: "",
			confirmPassword: ""
		});
		const isUpdatingPwd = ref(false);
		const pwdSuccessMsg = ref("");
		const pwdErrorMsg = ref("");
		async function submitPasswordChange() {
			pwdSuccessMsg.value = "";
			pwdErrorMsg.value = "";
			if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
				pwdErrorMsg.value = "Konfirmasi kata sandi baru tidak cocok!";
				return;
			}
			if (pwdForm.value.newPassword.length < 8) {
				pwdErrorMsg.value = "Kata sandi baru minimal 8 karakter!";
				return;
			}
			isUpdatingPwd.value = true;
			try {
				const res = await fetch("/api/v1/auth/password", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						old_password: pwdForm.value.oldPassword,
						new_password: pwdForm.value.newPassword
					})
				});
				const data = await res.json();
				if (res.ok) {
					pwdSuccessMsg.value = "Kata sandi berhasil diperbarui!";
					pwdForm.value = {
						oldPassword: "",
						newPassword: "",
						confirmPassword: ""
					};
				} else pwdErrorMsg.value = data.error || "Gagal memperbarui kata sandi.";
			} catch (err) {
				pwdErrorMsg.value = err.message || "Terjadi kesalahan sistem.";
			} finally {
				isUpdatingPwd.value = false;
			}
		}
		const onCallSchedules = ref([]);
		const isOnCallModalOpen = ref(false);
		const onCallForm = ref({
			name: "",
			primary_name: "",
			primary_contact: "",
			secondary_name: "",
			secondary_contact: "",
			shift_days: [
				"Senin",
				"Selasa",
				"Rabu",
				"Kamis",
				"Jumat",
				"Sabtu",
				"Minggu"
			],
			shift_start_time: "08:00",
			shift_end_time: "20:00"
		});
		async function fetchOnCall() {
			try {
				const res = await fetch("/api/v1/on-call");
				if (res.ok) onCallSchedules.value = await res.json();
			} catch (err) {
				console.error("Fetch on-call error:", err);
			}
		}
		async function submitNewOnCall() {
			try {
				if ((await fetch("/api/v1/on-call", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(onCallForm.value)
				})).ok) {
					isOnCallModalOpen.value = false;
					onCallForm.value = {
						name: "",
						primary_name: "",
						primary_contact: "",
						secondary_name: "",
						secondary_contact: "",
						shift_days: [
							"Senin",
							"Selasa",
							"Rabu",
							"Kamis",
							"Jumat",
							"Sabtu",
							"Minggu"
						],
						shift_start_time: "08:00",
						shift_end_time: "20:00"
					};
					fetchOnCall();
				}
			} catch (err) {
				console.error("Submit on-call error:", err);
			}
		}
		function deleteOnCall(id) {
			openConfirmDialog({
				title: "Hapus Jadwal On-Call",
				message: "Apakah Anda yakin ingin menghapus jadwal piket on-call ini?",
				confirmText: "Ya, Hapus Jadwal",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/on-call?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchOnCall();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus jadwal on-call" }));
							alert(err.error || "Gagal menghapus jadwal on-call");
						}
					} catch (err) {
						console.error("Delete on-call error:", err);
					}
				}
			});
		}
		const statusPages = ref([]);
		const isStatusPageModalOpen = ref(false);
		const isSavingStatusPage = ref(false);
		const editingStatusPageId = ref(null);
		const statusPageForm = ref({
			title: "",
			slug: "",
			description: "",
			is_public: true,
			is_protected: false,
			password: "",
			scope: "all",
			selectedMonitorIds: []
		});
		function openStatusPageModal(p = null) {
			if (p && p.id) {
				editingStatusPageId.value = p.id;
				statusPageForm.value = {
					title: p.title || "",
					slug: p.slug || "",
					description: p.description || "",
					is_public: Boolean(p.is_public),
					is_protected: Boolean(p.is_protected),
					password: "",
					scope: p.monitors_count > 0 ? "select" : "all",
					selectedMonitorIds: p.monitors_count > 0 ? p.monitor_ids || [] : []
				};
			} else {
				editingStatusPageId.value = null;
				statusPageForm.value = {
					title: "",
					slug: "",
					description: "",
					is_public: true,
					is_protected: false,
					password: "",
					scope: "all",
					selectedMonitorIds: []
				};
			}
			isStatusPageModalOpen.value = true;
		}
		async function fetchStatusPages() {
			try {
				const res = await fetch("/api/v1/status-pages");
				if (res.ok) statusPages.value = await res.json();
			} catch (err) {
				console.error("Fetch status pages error:", err);
			}
		}
		async function submitNewStatusPage() {
			isSavingStatusPage.value = true;
			try {
				const monitorIds = statusPageForm.value.scope === "all" ? [] : statusPageForm.value.selectedMonitorIds;
				const isEditing = Boolean(editingStatusPageId.value);
				const url = isEditing ? `/api/v1/status-pages/${editingStatusPageId.value}` : "/api/v1/status-pages";
				const res = await fetch(url, {
					method: isEditing ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: statusPageForm.value.title,
						slug: statusPageForm.value.slug,
						description: statusPageForm.value.description,
						is_public: statusPageForm.value.is_public,
						password: statusPageForm.value.is_protected ? statusPageForm.value.password : "",
						monitor_ids: monitorIds
					})
				});
				if (res.ok) {
					isStatusPageModalOpen.value = false;
					editingStatusPageId.value = null;
					statusPageForm.value = {
						title: "",
						slug: "",
						description: "",
						is_public: true,
						is_protected: false,
						password: "",
						scope: "all",
						selectedMonitorIds: []
					};
					await fetchStatusPages();
				} else {
					const err = await res.json();
					alert(err.error || "Gagal membuat status page");
				}
			} catch (err) {
				console.error("Submit status page error:", err);
				alert("Terjadi kesalahan sistem saat membuat status page.");
			} finally {
				isSavingStatusPage.value = false;
			}
		}
		function deleteStatusPage(id) {
			openConfirmDialog({
				title: "Hapus Halaman Status",
				message: "Apakah Anda yakin ingin menghapus halaman status ini? URL publik untuk halaman ini tidak akan dapat diakses lagi.",
				confirmText: "Ya, Hapus Halaman Status",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/status-pages?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchStatusPages();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus status page" }));
							alert(err.error || "Gagal menghapus status page");
						}
					} catch (err) {
						console.error("Delete status page error:", err);
					}
				}
			});
		}
		function copyStatusPageUrl(slug) {
			const url = `${window.location.origin}/status/${slug}`;
			navigator.clipboard.writeText(url);
			alert("URL Halaman Status disalin:\n" + url);
		}
		const users = ref([]);
		const isUserModalOpen = ref(false);
		const isSavingUser = ref(false);
		const userForm = ref({
			full_name: "",
			email: "",
			role: "editor",
			password: ""
		});
		async function fetchUsers() {
			try {
				const res = await fetch("/api/v1/users");
				if (res.ok) users.value = await res.json();
			} catch (err) {
				console.error("Fetch users error:", err);
			}
		}
		async function submitNewUser() {
			isSavingUser.value = true;
			try {
				const res = await fetch("/api/v1/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(userForm.value)
				});
				if (res.ok) {
					isUserModalOpen.value = false;
					userForm.value = {
						full_name: "",
						email: "",
						role: "editor",
						password: ""
					};
					await fetchUsers();
					alert("Operator baru berhasil ditambahkan!");
				} else {
					const err = await res.json();
					alert(err.error || "Gagal menambahkan operator");
				}
			} catch (err) {
				console.error("Submit user error:", err);
				alert("Terjadi kesalahan sistem.");
			} finally {
				isSavingUser.value = false;
			}
		}
		function deleteUser(id) {
			openConfirmDialog({
				title: "Cabut Akses Operator",
				message: "Apakah Anda yakin ingin mencabut akses dan menghapus akun operator ini? Sesi login aktif operator ini akan langsung dihentikan.",
				confirmText: "Ya, Hapus Akses",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/users?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchUsers();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus operator" }));
							alert(err.error || "Gagal menghapus operator");
						}
					} catch (err) {
						console.error("Delete user error:", err);
					}
				}
			});
		}
		const probeNodes = ref([]);
		const isProbeModalOpen = ref(false);
		const isSavingProbe = ref(false);
		const newProbeSecret = ref("");
		const probeForm = ref({
			name: "",
			region: "sgp-cloud"
		});
		async function fetchProbeNodes() {
			try {
				const res = await fetch("/api/v1/probe-nodes");
				if (res.ok) probeNodes.value = await res.json();
			} catch (err) {
				console.error("Fetch probe nodes error:", err);
			}
		}
		async function submitNewProbe() {
			isSavingProbe.value = true;
			try {
				const res = await fetch("/api/v1/probe-nodes", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(probeForm.value)
				});
				if (res.ok) {
					const data = await res.json();
					newProbeSecret.value = data.secret_token;
					isProbeModalOpen.value = false;
					probeForm.value = {
						name: "",
						region: "sgp-cloud"
					};
					await fetchProbeNodes();
				} else {
					const err = await res.json();
					alert(err.error || "Gagal mendaftarkan probe node");
				}
			} catch (err) {
				console.error("Submit probe error:", err);
			} finally {
				isSavingProbe.value = false;
			}
		}
		function deleteProbeNode(id) {
			openConfirmDialog({
				title: "Hapus Probe Node",
				message: "Apakah Anda yakin ingin menghapus node pemantau region ini?",
				confirmText: "Ya, Hapus Node",
				isDanger: true,
				action: async () => {
					try {
						const res = await fetch(`/api/v1/probe-nodes?id=${id}`, {
							method: "DELETE",
							headers: { "Content-Type": "application/json" }
						});
						if (res.ok) await fetchProbeNodes();
						else {
							const err = await res.json().catch(() => ({ error: "Gagal menghapus probe node" }));
							alert(err.error || "Gagal menghapus probe node");
						}
					} catch (err) {
						console.error("Delete probe error:", err);
					}
				}
			});
		}
		function copyText(str) {
			navigator.clipboard.writeText(str);
			alert("Disalin ke clipboard:\n" + str);
		}
		onMounted(() => {
			fetchBranding();
			fetchChannels();
			fetchKeys();
			fetchAudit();
			fetchMaintenance();
			fetchMonitors();
			fetchEscalations();
			fetchOnCall();
			fetchStatusPages();
			fetchUsers();
			fetchProbeNodes();
		});
		const __returned__ = {
			props,
			handleLogout,
			currentTab,
			channels,
			apiKeys,
			auditLogs,
			maintenanceWindows,
			monitors,
			newGeneratedKey,
			isChannelModalOpen,
			isKeyModalOpen,
			isMaintModalOpen,
			channelForm,
			keyForm,
			isSaving,
			saveSuccess,
			brandingForm,
			isImageLogo,
			applyPreset,
			fetchBranding,
			saveBranding,
			confirmModal,
			openConfirmDialog,
			handleModalConfirm,
			resetBrandingDefaults,
			now,
			later,
			toLocalIso,
			maintForm,
			fetchChannels,
			fetchKeys,
			fetchAudit,
			submitNewChannel,
			deleteChannel,
			submitNewApiKey,
			revokeKey,
			copyKey,
			fetchMaintenance,
			fetchMonitors,
			submitMaintenance,
			deleteMaintenance,
			escalations,
			isEscModalOpen,
			escForm,
			getChannelName,
			fetchEscalations,
			submitNewEscalation,
			deleteEscalation,
			importJsonText,
			isImporting,
			importSuccessMsg,
			importErrorMsg,
			handleFileUpload,
			executeKumaImport,
			pwdForm,
			isUpdatingPwd,
			pwdSuccessMsg,
			pwdErrorMsg,
			submitPasswordChange,
			onCallSchedules,
			isOnCallModalOpen,
			onCallForm,
			fetchOnCall,
			submitNewOnCall,
			deleteOnCall,
			statusPages,
			isStatusPageModalOpen,
			isSavingStatusPage,
			editingStatusPageId,
			statusPageForm,
			openStatusPageModal,
			fetchStatusPages,
			submitNewStatusPage,
			deleteStatusPage,
			copyStatusPageUrl,
			users,
			isUserModalOpen,
			isSavingUser,
			userForm,
			fetchUsers,
			submitNewUser,
			deleteUser,
			probeNodes,
			isProbeModalOpen,
			isSavingProbe,
			newProbeSecret,
			probeForm,
			fetchProbeNodes,
			submitNewProbe,
			deleteProbeNode,
			copyText,
			ref,
			onMounted,
			ConfirmModal: ConfirmModal_default
		};
		Object.defineProperty(__returned__, "__isScriptSetup", {
			enumerable: false,
			value: true
		});
		return __returned__;
	}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[100dvh] text-zinc-900 bg-[#FAFAFA] flex flex-col selection:bg-zinc-200" }, _attrs))}><div class="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4 flex-1"><header class="flex items-center justify-between gap-3 p-2.5 pl-4 pr-3 bg-white ring-1 ring-zinc-200/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)]"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-zinc-100 ring-1 ring-zinc-200 flex items-center justify-center text-sm shrink-0">`);
	if ($setup.isImageLogo($setup.brandingForm.logo_icon)) _push(`<img${ssrRenderAttr("src", $setup.brandingForm.logo_icon)} alt="Logo" class="w-4 h-4 object-contain rounded-full">`);
	else _push(`<span>${ssrInterpolate($setup.brandingForm.logo_icon || "🌐")}</span>`);
	_push(`</div><div class="flex items-baseline gap-2"><h1 class="text-sm font-bold text-zinc-900 tracking-tight">${ssrInterpolate($setup.brandingForm.app_name || "Uptime CJR")}</h1><span class="hidden xl:inline text-[11px] text-zinc-400 font-mono truncate max-w-xs">| Pengaturan Sistem</span></div></div><nav class="hidden md:flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-medium"><a href="/dashboard" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> Monitors </a><a href="/incidents" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> Insiden </a><a href="/reports" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> 📈 Laporan SLA </a><a href="/status/main" target="_blank" class="px-3 py-1 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"> Status Page ↗ </a><a href="/settings" class="px-3 py-1 rounded-lg bg-white text-zinc-900 shadow-sm border border-zinc-200/50 transition-colors font-semibold"> ⚙️ Pengaturan </a></nav>`);
	if ($setup.props.currentUser) _push(`<div class="flex items-center gap-2 pl-2 border-l border-zinc-200 shrink-0"><div class="w-7 h-7 rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs"${ssrRenderAttr("title", $setup.props.currentUser.email)}>${ssrInterpolate(($setup.props.currentUser.full_name || $setup.props.currentUser.email || "A")[0].toUpperCase())}</div><button title="Keluar dari sistem" class="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-[11px] transition-colors border border-zinc-200 cursor-pointer"> Keluar </button></div>`);
	else _push(`<!---->`);
	_push(`</header><div class="flex items-center gap-1 p-1.5 bg-white ring-1 ring-zinc-200/80 rounded-2xl overflow-x-auto text-xs font-medium shadow-xs"><button class="${ssrRenderClass([$setup.currentTab === "branding" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🎨 Branding </button><button class="${ssrRenderClass([$setup.currentTab === "status-pages" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🌐 Status Pages </button><button class="${ssrRenderClass([$setup.currentTab === "channels" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🔔 Saluran Notifikasi </button><button class="${ssrRenderClass([$setup.currentTab === "escalation" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> ⚡ Eskalasi </button><button class="${ssrRenderClass([$setup.currentTab === "on-call" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🧑‍💻 On-Call </button><button class="${ssrRenderClass([$setup.currentTab === "maintenance" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🔧 Maintenance </button><button class="${ssrRenderClass([$setup.currentTab === "nodes" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🛰️ Probe Nodes </button><button class="${ssrRenderClass([$setup.currentTab === "security" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🔒 Keamanan &amp; Akun </button><button class="${ssrRenderClass([$setup.currentTab === "api-keys" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 🔑 API Keys </button><button class="${ssrRenderClass([$setup.currentTab === "backup" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100", "px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-medium"])}"> 💾 Backup &amp; Migrasi </button></div>`);
	if ($setup.currentTab === "branding") {
		_push(`<section class="space-y-4"><div><h2 class="text-base font-semibold text-zinc-900">Kustomisasi Branding &amp; Identitas (Whitelabel)</h2><p class="text-xs text-zinc-500 mt-0.5">Ubah nama aplikasi, logo/ikon, favicon, dan teks footer agar sesuai dengan instansi Anda secara real-time.</p></div>`);
		if ($setup.saveSuccess) _push(`<div class="flex items-center justify-between p-3.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium"><span>✅ Perubahan branding berhasil disimpan &amp; disinkronkan secara real-time ke seluruh halaman!</span><button class="text-emerald-400 hover:text-emerald-200 text-base leading-none p-1">×</button></div>`);
		else _push(`<!---->`);
		_push(`<div class="grid grid-cols-1 lg:grid-cols-12 gap-6"><div class="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4"><div class="border-b border-zinc-200 pb-3"><h3 class="text-sm font-semibold text-zinc-900">⚙️ Konfigurasi Identitas</h3></div><div class="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2"><span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Pilihan Template Siap Pakai:</span><div class="flex flex-wrap gap-2"><button type="button" class="px-2.5 py-1 text-xs rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 border border-zinc-300 transition-colors"> 🌐 Uptime CJR (Diskominfo) </button><button type="button" class="px-2.5 py-1 text-xs rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 border border-zinc-300 transition-colors"> 🛡️ SentinelUp (Default) </button><button type="button" class="px-2.5 py-1 text-xs rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 border border-zinc-300 transition-colors"> ⚡ CloudOps Monitor </button></div></div><form class="space-y-4"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Nama Aplikasi (App Name)</label><input${ssrRenderAttr("value", $setup.brandingForm.app_name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" placeholder="Contoh: Uptime CJR" required><span class="block text-[11px] text-zinc-400">Nama ini akan tampil di navbar, judul tab browser, status page, dan notifikasi.</span></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Slogan / Tagline Aplikasi</label><input${ssrRenderAttr("value", $setup.brandingForm.app_tagline)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" placeholder="Contoh: Sistem Pemantauan Ketersediaan Layanan &amp; Infrastruktur"><span class="block text-[11px] text-zinc-400">Deskripsi singkat di bawah nama aplikasi pada header.</span></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Logo / Ikon Aplikasi</label><input${ssrRenderAttr("value", $setup.brandingForm.logo_icon)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" placeholder="Ketik Emoji (e.g. 🌐, 🛡️, ⚡) atau URL Gambar (https://.../logo.png)" required><div class="flex items-center gap-1.5 pt-1"><span class="text-[11px] text-zinc-400">Pilih Ikon Cepat:</span><!--[-->`);
		ssrRenderList([
			"🌐",
			"🛡️",
			"⚡",
			"📡",
			"🏢",
			"🚀",
			"💻",
			"🔒",
			"📊"
		], (em) => {
			_push(`<button type="button" class="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-sm border border-zinc-300 transition-colors">${ssrInterpolate(em)}</button>`);
		});
		_push(`<!--]--></div><span class="block text-[11px] text-zinc-400">Dapat berupa emoji tunggal ATAU tautan URL gambar (PNG, SVG, JPG, WebP).</span></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">URL Favicon Kustom (Opsional)</label><input${ssrRenderAttr("value", $setup.brandingForm.favicon_url)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white font-mono text-xs" placeholder="https://contoh.id/favicon.ico atau biarkan kosong"><span class="block text-[11px] text-zinc-400">Jika dikosongkan, favicon otomatis digenerate dari logo/emoji di atas.</span></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Teks Footer &amp; Hak Cipta</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 focus:bg-white" rows="2" placeholder="Contoh: © 2026 Uptime CJR — Dinas Komunikasi dan Informatika Kab. Cianjur">${ssrInterpolate($setup.brandingForm.footer_text)}</textarea><span class="block text-[11px] text-zinc-400">Teks hak cipta / atribusi di bagian bawah seluruh halaman.</span></div><div class="flex items-center gap-3 pt-3 border-t border-zinc-200"><button type="submit" class="px-4 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"${ssrIncludeBooleanAttr($setup.isSaving) ? " disabled" : ""}>${ssrInterpolate($setup.isSaving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan Branding")}</button><button type="button" class="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 border border-zinc-300 transition-colors"> ↺ Reset ke Default </button></div></form></div><div class="lg:col-span-5 space-y-4"><div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider"><span>👁️ Pratinjau Tampilan Langsung (Live Preview)</span></div><div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-2"><span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Navbar Header:</span><div class="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg"><div class="flex items-center gap-2.5"><div class="flex items-center justify-center text-xl">`);
		if ($setup.isImageLogo($setup.brandingForm.logo_icon)) _push(`<img${ssrRenderAttr("src", $setup.brandingForm.logo_icon)} alt="Logo" class="w-6 h-6 object-contain rounded">`);
		else _push(`<span>${ssrInterpolate($setup.brandingForm.logo_icon || "🌐")}</span>`);
		_push(`</div><div><div class="text-xs font-bold text-zinc-900">${ssrInterpolate($setup.brandingForm.app_name || "Uptime CJR")}</div><div class="text-[10px] text-zinc-500 truncate max-w-[160px]">${ssrInterpolate($setup.brandingForm.app_tagline || "Pemantauan Layanan")}</div></div></div><div class="flex gap-1 text-[11px]"><span class="px-2 py-0.5 rounded bg-zinc-900 text-white font-medium">Monitors</span><span class="px-2 py-0.5 rounded text-zinc-500">Status ↗</span></div></div></div><div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-2"><span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Tab Browser:</span><div class="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-t-lg max-w-xs"><div class="text-xs flex items-center justify-center">`);
		if ($setup.brandingForm.favicon_url && $setup.isImageLogo($setup.brandingForm.favicon_url)) _push(`<img${ssrRenderAttr("src", $setup.brandingForm.favicon_url)} class="w-4 h-4 rounded">`);
		else _push(`<span>${ssrInterpolate($setup.brandingForm.logo_icon || "🌐")}</span>`);
		_push(`</div><span class="text-xs text-zinc-700 truncate flex-1">${ssrInterpolate($setup.brandingForm.app_name || "Uptime CJR")} — Dashboard</span><span class="text-zinc-400 text-xs">×</span></div></div><div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-2"><span class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Footer Halaman:</span><div class="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-center text-xs text-zinc-500"><p>${ssrInterpolate($setup.brandingForm.footer_text || "© 2026 Uptime CJR — Pemantauan Layanan")}</p></div></div></div></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "channels") {
		_push(`<section class="space-y-4"><div class="flex items-center justify-between"><div><h2 class="text-base font-semibold text-zinc-900">Saluran Notifikasi (Alerts)</h2><p class="text-xs text-zinc-500 mt-0.5">Kirimkan notifikasi instan saat terjadi downtime atau pemulihan ke tim Anda.</p></div><button class="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"> + Tambah Saluran </button></div>`);
		if ($setup.channels.length === 0) _push(`<div class="p-8 text-center bg-white border border-zinc-200 rounded-xl"><p class="text-xs text-zinc-500">Belum ada saluran notifikasi yang dikonfigurasi.</p><button class="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"> + Tambah Telegram / Discord / Webhook </button></div>`);
		else {
			_push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);
			ssrRenderList($setup.channels, (c) => {
				_push(`<div class="flex items-center gap-3 p-4 bg-white border border-zinc-200 rounded-xl"><div class="text-2xl">`);
				if (c.type === "telegram") _push(`<span>✈️</span>`);
				else if (c.type === "discord") _push(`<span>🎮</span>`);
				else if (c.type === "slack") _push(`<span>💬</span>`);
				else _push(`<span>🌐</span>`);
				_push(`</div><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h3 class="text-sm font-semibold text-zinc-900 truncate">${ssrInterpolate(c.name)}</h3><span class="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">${ssrInterpolate(c.type)}</span></div><p class="text-xs text-zinc-500 font-mono truncate mt-0.5">${ssrInterpolate(c.type === "telegram" ? "Chat ID: " + (c.config.chatId || "***") : c.config.url || c.config.webhookUrl || "Configured")}</p></div><button class="px-2.5 py-1 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"> Hapus </button></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "api-keys") {
		_push(`<section class="space-y-4"><div class="flex items-center justify-between"><div><h2 class="text-base font-semibold text-zinc-900">Scoped API Keys</h2><p class="text-xs text-zinc-500 mt-0.5">Otomatisasi pemantauan via CI/CD pipelines, script Bash, atau Terraform.</p></div><button class="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"> + Generate Key Baru </button></div>`);
		if ($setup.newGeneratedKey) _push(`<div class="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2"><div class="text-xs font-semibold text-emerald-400">🎉 Key Berhasil Dibuat! Simpan key ini sekarang:</div><div class="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-200"><code class="flex-1 text-xs text-zinc-900 font-mono break-all">${ssrInterpolate($setup.newGeneratedKey.raw_key)}</code><button class="px-3 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm text-zinc-900 transition-colors"> 📋 Salin </button></div><p class="text-[11px] text-rose-300">⚠️ Demi keamanan, token ini di-hash dalam database dan tidak akan pernah ditampilkan lagi.</p></div>`);
		else _push(`<!---->`);
		if ($setup.apiKeys.length === 0) _push(`<div class="p-8 text-center bg-white border border-zinc-200 rounded-xl"><p class="text-xs text-zinc-500">Belum ada API key yang terdaftar.</p></div>`);
		else {
			_push(`<div class="space-y-2"><!--[-->`);
			ssrRenderList($setup.apiKeys, (k) => {
				_push(`<div class="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl"><div><h3 class="text-sm font-semibold text-zinc-900">${ssrInterpolate(k.name)}</h3><div class="text-xs text-zinc-500 font-mono mt-0.5">${ssrInterpolate(k.key_preview)}</div><div class="flex gap-1 mt-1.5"><!--[-->`);
				ssrRenderList(k.scopes, (s) => {
					_push(`<span class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 border border-zinc-300 text-zinc-600">${ssrInterpolate(s)}</span>`);
				});
				_push(`<!--]--></div></div><button class="px-2.5 py-1 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"> Cabut Key </button></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "maintenance") {
		_push(`<section class="space-y-4"><div class="flex items-center justify-between"><div><h2 class="text-base font-semibold text-zinc-900">Maintenance Windows</h2><p class="text-xs text-zinc-500 mt-0.5">Jadwalkan pemeliharaan terencana untuk menekan alarm notifikasi tanpa mematikan pencatatan metrik.</p></div><button class="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"> + Jadwalkan Maintenance </button></div>`);
		if ($setup.maintenanceWindows.length === 0) _push(`<div class="p-8 text-center bg-white border border-zinc-200 rounded-xl"><p class="text-xs text-zinc-500">Belum ada jadwal maintenance yang terdaftar.</p><button class="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"> + Buat Jadwal Baru </button></div>`);
		else {
			_push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);
			ssrRenderList($setup.maintenanceWindows, (w) => {
				_push(`<div class="${ssrRenderClass([w.is_currently_active ? "border-amber-500/40 bg-amber-950/20" : "border-zinc-200", "p-4 bg-white border rounded-xl space-y-2"])}"><div class="flex items-center justify-between"><span class="${ssrRenderClass([w.is_currently_active ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-zinc-100 text-zinc-500 border border-zinc-300", "px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"])}">${ssrInterpolate(w.is_currently_active ? "🟢 SEDANG AKTIF (ALERTS SUPPRESSED)" : "UPCOMING / RECORDED")}</span><button class="px-2 py-0.5 text-xs rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"> Hapus </button></div><h3 class="text-sm font-semibold text-zinc-900">${ssrInterpolate(w.title)}</h3>`);
				if (w.description) _push(`<p class="text-xs text-zinc-500">${ssrInterpolate(w.description)}</p>`);
				else _push(`<!---->`);
				_push(`<div class="p-2 bg-zinc-50 border border-zinc-200 rounded text-xs font-mono text-zinc-500 space-y-0.5"><div>Mulai: ${ssrInterpolate(new Date(w.start_time).toLocaleString())}</div><div>Selesai: ${ssrInterpolate(new Date(w.end_time).toLocaleString())}</div></div><div class="text-xs text-zinc-500"> Cakupan: <strong class="text-zinc-700">${ssrInterpolate(w.affected_monitor_ids.includes("*") ? "Semua Monitor" : `${w.affected_monitor_ids.length} Monitor Terpilih`)}</strong></div></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "audit") {
		_push(`<section class="space-y-4"><div><h2 class="text-base font-semibold text-zinc-900">System Audit Trail</h2><p class="text-xs text-zinc-500 mt-0.5">Catatan kejadian keamanan, perubahan konfigurasi, dan rotasi token.</p></div><div class="overflow-x-auto bg-white border border-zinc-200 rounded-xl"><table class="w-full text-left text-xs"><thead class="bg-zinc-50 text-zinc-500 border-b border-zinc-200 uppercase tracking-wider text-[11px]"><tr><th class="px-4 py-2.5 font-medium">Timestamp</th><th class="px-4 py-2.5 font-medium">Action</th><th class="px-4 py-2.5 font-medium">Resource</th><th class="px-4 py-2.5 font-medium">Metadata</th></tr></thead><tbody class="divide-y divide-slate-800/60"><!--[-->`);
		ssrRenderList($setup.auditLogs, (log) => {
			_push(`<tr class="hover:bg-zinc-100/30 transition-colors"><td class="px-4 py-2 text-zinc-500 whitespace-nowrap">${ssrInterpolate(new Date(log.created_at).toLocaleString())}</td><td class="px-4 py-2 font-mono text-emerald-400 whitespace-nowrap">${ssrInterpolate(log.action)}</td><td class="px-4 py-2 text-zinc-600 whitespace-nowrap">${ssrInterpolate(log.resource_type || "-")} (${ssrInterpolate(log.resource_id ? log.resource_id.slice(0, 10) : "-")})</td><td class="px-4 py-2 font-mono text-zinc-400 max-w-xs truncate">${ssrInterpolate(JSON.stringify(log.metadata))}</td></tr>`);
		});
		_push(`<!--]--></tbody></table></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "escalation") {
		_push(`<section class="space-y-3"><div class="flex items-center justify-between"><div><h2 class="text-sm font-semibold text-zinc-900">⚡ Kebijakan Eskalasi Pager &amp; Notifikasi</h2><p class="text-xs text-zinc-500 mt-0.5">Atur rantai eskalasi berjenjang jika insiden belum terselesaikan dalam durasi tertentu.</p></div><button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs"> + Buat Eskalasi </button></div>`);
		if ($setup.escalations.length === 0) _push(`<div class="p-6 text-center bg-white border border-zinc-200 rounded-xl"><p class="text-xs text-zinc-500">Belum ada aturan eskalasi yang dibuat.</p><button class="mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"> + Buat Aturan Eskalasi Baru </button></div>`);
		else {
			_push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-2.5"><!--[-->`);
			ssrRenderList($setup.escalations, (esc) => {
				_push(`<div class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-amber-400 text-sm">⚡</span><h3 class="text-xs font-semibold text-zinc-900">${ssrInterpolate(esc.name)}</h3></div><button class="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"> Hapus </button></div><div class="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono"><span>⏱️ Jeda Eskalasi:</span><span class="text-amber-300 font-medium">${ssrInterpolate(esc.wait_minutes)} Menit</span></div><div class="flex flex-wrap gap-1 pt-1"><!--[-->`);
				ssrRenderList(esc.channel_ids, (chId) => {
					_push(`<span class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-600"> 🔔 ${ssrInterpolate($setup.getChannelName(chId))}</span>`);
				});
				_push(`<!--]-->`);
				if (!esc.channel_ids || esc.channel_ids.length === 0) _push(`<span class="text-[10px] text-zinc-400 italic"> Semua saluran notifikasi </span>`);
				else _push(`<!---->`);
				_push(`</div></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "oncall") {
		_push(`<section class="space-y-3"><div class="flex items-center justify-between"><div><h2 class="text-sm font-semibold text-zinc-900">📞 Roster &amp; Jadwal Piket On-Call</h2><p class="text-xs text-zinc-500 mt-0.5">Kelola penanggung jawab operasional siaga darurat saat terjadi insiden kritis.</p></div><button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"> + Tambah Jadwal On-Call </button></div>`);
		if ($setup.onCallSchedules.length === 0) _push(`<div class="p-6 text-center bg-white border border-zinc-200 rounded-xl"><p class="text-xs text-zinc-500">Belum ada jadwal on-call yang dikonfigurasi.</p><button class="mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"> + Buat Jadwal Piket Baru </button></div>`);
		else {
			_push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);
			ssrRenderList($setup.onCallSchedules, (s) => {
				_push(`<div class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="text-base">📞</span><h3 class="text-xs font-bold text-zinc-900">${ssrInterpolate(s.name)}</h3></div><button class="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"> Hapus </button></div><div class="space-y-1 text-xs"><div class="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between"><div><span class="text-[10px] text-zinc-900 font-semibold uppercase block">Operator Utama (Primary):</span><span class="text-zinc-900 font-medium text-xs">${ssrInterpolate(s.primary_name)}</span></div><span class="font-mono text-xs text-emerald-400">${ssrInterpolate(s.primary_contact)}</span></div>`);
				if (s.secondary_name) _push(`<div class="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between"><div><span class="text-[10px] text-zinc-500 font-semibold uppercase block">Operator Cadangan (Backup):</span><span class="text-zinc-600 font-medium text-xs">${ssrInterpolate(s.secondary_name)}</span></div><span class="font-mono text-xs text-zinc-500">${ssrInterpolate(s.secondary_contact)}</span></div>`);
				else _push(`<!---->`);
				_push(`<div class="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono"><span>Jam Shift: ${ssrInterpolate(s.shift_start_time)} - ${ssrInterpolate(s.shift_end_time)} WIB</span><span>${ssrInterpolate(s.shift_days.length)} Hari Aktif</span></div></div></div>`);
			});
			_push(`<!--]--></div>`);
		}
		_push(`</section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "status-pages") {
		_push(`<section class="space-y-3"><div class="flex items-center justify-between"><div><h2 class="text-sm font-semibold text-zinc-900">🌐 Manajemen Halaman Status Publik &amp; Privat</h2><p class="text-xs text-zinc-500 mt-0.5">Buat halaman status kustom untuk divisi, aplikasi publik, klien, atau stakeholder tertentu.</p></div><button class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer active:scale-[0.98]"> + Buat Status Page </button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);
		ssrRenderList($setup.statusPages, (p) => {
			_push(`<div class="p-4 bg-white border border-zinc-200 rounded-xl space-y-3"><div class="flex items-start justify-between gap-2"><div><div class="flex items-center gap-2"><h3 class="text-sm font-bold text-zinc-900">${ssrInterpolate(p.title)}</h3>`);
			if (p.slug === "main") _push(`<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase"> DEFAULT / UTAMA </span>`);
			else _push(`<!---->`);
			_push(`</div><div class="flex items-center gap-1.5 mt-0.5"><code class="text-xs text-zinc-900 font-mono">/status/${ssrInterpolate(p.slug)}</code><button class="text-[10px] text-zinc-500 hover:text-zinc-900 px-1.5 py-0.2 rounded bg-zinc-50 border border-zinc-200 transition-colors cursor-pointer" title="Salin URL Lengkap"> 📋 Salin </button></div></div><div class="flex items-center gap-1 shrink-0"><span class="${ssrRenderClass([p.is_public ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-100 text-zinc-500 border border-zinc-300", "px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider"])}">${ssrInterpolate(p.is_public ? "Publik" : "Privat")}</span>`);
			if (p.is_protected) _push(`<span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Dilindungi dengan kata sandi"> 🔒 Terkunci </span>`);
			else _push(`<!---->`);
			_push(`</div></div><p class="text-xs text-zinc-500 line-clamp-2">${ssrInterpolate(p.description || "Tidak ada deskripsi tambahan.")}</p><div class="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs"><span class="text-zinc-500">Cakupan Layanan:</span><span class="text-zinc-700 font-semibold font-mono">${ssrInterpolate(p.monitors_count > 0 ? `${p.monitors_count} Monitor Terpilih` : "Seluruh Monitor (*)")}</span></div><div class="flex items-center justify-between pt-2 border-t border-zinc-100"><div class="flex items-center gap-2"><a${ssrRenderAttr("href", `/status/${p.slug}`)} target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors shadow-sm cursor-pointer"> Buka Halaman ↗ </a><button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 transition-colors shadow-sm cursor-pointer"> ⚙️ Konfigurasi </button></div>`);
			if (p.slug !== "main") _push(`<button class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"> Hapus </button>`);
			else _push(`<span class="text-[10px] text-zinc-400 italic">Halaman status primer</span>`);
			_push(`</div></div>`);
		});
		_push(`<!--]--></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "import") {
		_push(`<section class="space-y-3"><div><h2 class="text-sm font-semibold text-zinc-900">📥 Migrasi &amp; Impor dari Uptime Kuma</h2><p class="text-xs text-zinc-500 mt-0.5">Unggah atau tempel file backup JSON dari Uptime Kuma untuk mengimpor seluruh monitor secara instan.</p></div>`);
		if ($setup.importSuccessMsg) _push(`<div class="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-between"><span>✅ ${ssrInterpolate($setup.importSuccessMsg)}</span><button class="text-emerald-400 hover:text-emerald-200 text-sm">×</button></div>`);
		else _push(`<!---->`);
		if ($setup.importErrorMsg) _push(`<div class="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center justify-between"><span>⚠️ ${ssrInterpolate($setup.importErrorMsg)}</span><button class="text-rose-400 hover:text-rose-200 text-sm">×</button></div>`);
		else _push(`<!---->`);
		_push(`<div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"><div><label class="block text-xs font-medium text-zinc-600 mb-1">Pilih File Backup JSON (kuma-backup.json)</label><input type="file" accept=".json,application/json" class="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 file:cursor-pointer cursor-pointer bg-zinc-50 border border-zinc-200 rounded-lg p-1.5"></div><div class="relative flex py-1 items-center"><div class="flex-grow border-t border-zinc-200"></div><span class="flex-shrink mx-2 text-[10px] text-zinc-400 uppercase tracking-wider">Atau Tempel JSON Mentah</span><div class="flex-grow border-t border-zinc-200"></div></div><div><textarea rows="6" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="[ { &quot;name&quot;: &quot;Google&quot;, &quot;type&quot;: &quot;http&quot;, &quot;url&quot;: &quot;https://google.com&quot;, &quot;interval&quot;: 60 } ]">${ssrInterpolate($setup.importJsonText)}</textarea></div><div class="flex justify-end"><button type="button"${ssrIncludeBooleanAttr($setup.isImporting || !$setup.importJsonText.trim()) ? " disabled" : ""} class="px-4 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs">${ssrInterpolate($setup.isImporting ? "⏳ Mengimpor Monitor..." : "🚀 Mulai Impor Monitor")}</button></div></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "security") {
		_push(`<section class="space-y-3"><div><h2 class="text-sm font-semibold text-zinc-900">🔒 Keamanan Akun &amp; Akses</h2><p class="text-xs text-zinc-500 mt-0.5">Kelola kata sandi akun operator administrator SentinelUp.</p></div>`);
		if ($setup.pwdSuccessMsg) _push(`<div class="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center justify-between"><span>✅ ${ssrInterpolate($setup.pwdSuccessMsg)}</span><button class="text-emerald-400 hover:text-emerald-200 text-sm">×</button></div>`);
		else _push(`<!---->`);
		if ($setup.pwdErrorMsg) _push(`<div class="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center justify-between"><span>⚠️ ${ssrInterpolate($setup.pwdErrorMsg)}</span><button class="text-rose-400 hover:text-rose-200 text-sm">×</button></div>`);
		else _push(`<!---->`);
		_push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"><h3 class="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Ganti Kata Sandi</h3><form class="space-y-2.5"><div><label class="block text-xs font-medium text-zinc-500 mb-1">Kata Sandi Saat Ini</label><input${ssrRenderAttr("value", $setup.pwdForm.oldPassword)} type="password" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div><div><label class="block text-xs font-medium text-zinc-500 mb-1">Kata Sandi Baru</label><input${ssrRenderAttr("value", $setup.pwdForm.newPassword)} type="password" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Minimal 8 karakter" required></div><div><label class="block text-xs font-medium text-zinc-500 mb-1">Konfirmasi Kata Sandi Baru</label><input${ssrRenderAttr("value", $setup.pwdForm.confirmPassword)} type="password" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div><div class="pt-1"><button type="submit"${ssrIncludeBooleanAttr($setup.isUpdatingPwd) ? " disabled" : ""} class="w-full py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs">${ssrInterpolate($setup.isUpdatingPwd ? "⏳ Menyimpan..." : "🔐 Perbarui Kata Sandi")}</button></div></form></div><div class="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"><h3 class="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Status Keamanan Sistem</h3><div class="space-y-2 text-xs"><div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200"><span class="text-zinc-500">Akun Aktif:</span><span class="font-mono text-zinc-700">${ssrInterpolate($setup.props.currentUser?.email || "admin@cjr.go.id")}</span></div><div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200"><span class="text-zinc-500">Peran / Role:</span><span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Superadmin</span></div><div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200"><span class="text-zinc-500">Registrasi Publik:</span><span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Nonaktif (Anti-Abuse)</span></div><div class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200"><span class="text-zinc-500">Enkripsi Kredensial:</span><span class="text-zinc-600 font-mono text-[11px]">Node.js Native Scrypt</span></div></div></div></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "operators") {
		_push(`<section class="space-y-3"><div class="flex items-center justify-between"><div><h2 class="text-sm font-semibold text-zinc-900">👥 Manajemen Tim Operator &amp; Hak Akses (RBAC)</h2><p class="text-xs text-zinc-500 mt-0.5">Kelola akun operator dan tingkat hak akses ke SentinelUp. Registrasi publik dinonaktifkan demi keamanan.</p></div><button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"> + Tambah Operator </button></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"><!--[-->`);
		ssrRenderList($setup.users, (u) => {
			_push(`<div class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2.5"><div class="flex items-start justify-between gap-2"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-zinc-700 flex items-center justify-center font-bold text-xs">${ssrInterpolate((u.full_name || u.email || "O")[0].toUpperCase())}</div><div class="min-w-0"><div class="text-xs font-bold text-zinc-900 truncate">${ssrInterpolate(u.full_name || "Operator")}</div><div class="text-[11px] text-zinc-500 font-mono truncate">${ssrInterpolate(u.email)}</div></div></div><span class="${ssrRenderClass([{
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20": u.role === "admin",
				"bg-zinc-100 text-zinc-800 border border-zinc-200": u.role === "editor",
				"bg-zinc-100 text-zinc-500 border border-zinc-300": u.role === "viewer"
			}, "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"])}">${ssrInterpolate(u.role)}</span></div><div class="p-2 rounded bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-0.5"><div class="flex justify-between"><span>Login Terakhir:</span><span class="text-zinc-700 font-mono">${ssrInterpolate(u.last_login_at ? new Date(u.last_login_at).toLocaleString("id-ID") : "Belum pernah")}</span></div><div class="flex justify-between"><span>Terdaftar:</span><span class="text-zinc-500 font-mono">${ssrInterpolate(new Date(u.created_at).toLocaleDateString("id-ID"))}</span></div></div><div class="flex justify-end pt-1">`);
			if (u.id !== $setup.props.currentUser?.id) _push(`<button class="px-2 py-1 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"> Hapus Akses </button>`);
			else _push(`<span class="text-[10px] text-zinc-400 italic">Sesi aktif saat ini</span>`);
			_push(`</div></div>`);
		});
		_push(`<!--]--></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "probes") {
		_push(`<section class="space-y-3"><div class="flex items-center justify-between"><div><h2 class="text-sm font-semibold text-zinc-900">🛰️ Multi-Region Probe Nodes</h2><p class="text-xs text-zinc-500 mt-0.5">Node pemantau terdistribusi lintas lokasi/datacenter untuk mencegah false positive dan mengonfirmasi status uptime.</p></div><button class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"> + Daftarkan Probe Node </button></div>`);
		if ($setup.newProbeSecret) _push(`<div class="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2"><div class="text-xs font-semibold text-emerald-400">🎉 Probe Node Baru Berhasil Didaftarkan! Simpan token ini untuk agen:</div><div class="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-200"><code class="flex-1 text-xs text-zinc-900 font-mono break-all">${ssrInterpolate($setup.newProbeSecret)}</code><button class="px-3 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm text-zinc-900 transition-colors cursor-pointer"> 📋 Salin </button></div></div>`);
		else _push(`<!---->`);
		_push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!--[-->`);
		ssrRenderList($setup.probeNodes, (p) => {
			_push(`<div class="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-2.5"><div class="flex items-start justify-between gap-2"><div><div class="flex items-center gap-2"><h3 class="text-xs font-bold text-zinc-900">${ssrInterpolate(p.name)}</h3><span class="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-zinc-100 text-zinc-700 border border-zinc-300">${ssrInterpolate(p.region)}</span></div><p class="text-[11px] text-zinc-500 mt-0.5">ID: <code class="text-zinc-600 font-mono">${ssrInterpolate(p.id)}</code></p></div><span class="${ssrRenderClass([p.status === "online" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20", "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"])}"> ● ${ssrInterpolate(p.status)}</span></div><div class="grid grid-cols-2 gap-2 text-[11px] p-2 rounded bg-zinc-50 border border-zinc-200"><div><span class="text-zinc-400 block">Latensi Probe:</span><span class="text-zinc-700 font-mono font-semibold">${ssrInterpolate(p.latency_ms || 4)} ms</span></div><div><span class="text-zinc-400 block">Heartbeat Terakhir:</span><span class="text-zinc-700 font-mono">${ssrInterpolate(p.last_heartbeat_at ? new Date(p.last_heartbeat_at).toLocaleTimeString("id-ID") : "Aktif")}</span></div></div><div class="flex justify-between items-center pt-1"><span class="text-[10px] text-zinc-400 font-mono">Target: ${ssrInterpolate(p.region)}</span>`);
			if (p.id !== "prb_primary") _push(`<button class="px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"> Hapus </button>`);
			else _push(`<span class="text-[10px] text-zinc-900 font-medium">Node Primer</span>`);
			_push(`</div></div>`);
		});
		_push(`<!--]--></div></section>`);
	} else _push(`<!---->`);
	if ($setup.currentTab === "backup") _push(`<section class="space-y-3"><div><h2 class="text-sm font-semibold text-zinc-900">💾 Backup Database &amp; Ekspor Konfigurasi</h2><p class="text-xs text-zinc-500 mt-0.5">Unduh snapshot database lengkap atau ekspor konfigurasi SentinelUp dalam format JSON untuk arsip dan pemulihan cepat.</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="p-4 bg-white border border-zinc-200 rounded-xl space-y-3"><div class="flex items-center gap-2"><span class="text-xl">🗄️</span><div><h3 class="text-xs font-bold text-zinc-900">Backup Database SQLite (.db)</h3><p class="text-[11px] text-zinc-500">Salinan snapshot file binary SQLite dengan seluruh data historis, check results, dan konfigurasi.</p></div></div><div class="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1"><div class="flex justify-between"><span class="text-zinc-500">Format:</span><span class="font-mono text-zinc-700">SQLite 3 / WAL Checkpointed</span></div><div class="flex justify-between"><span class="text-zinc-500">Penggunaan:</span><span class="text-zinc-600">Disaster Recovery 1-Klik</span></div></div><a href="/api/v1/backup/export?format=sqlite" download class="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"> 📥 Unduh File Database (.db) </a></div><div class="p-4 bg-white border border-zinc-200 rounded-xl space-y-3"><div class="flex items-center gap-2"><span class="text-xl">📋</span><div><h3 class="text-xs font-bold text-zinc-900">Ekspor Konfigurasi JSON</h3><p class="text-[11px] text-zinc-500">Ekspor teks JSON seluruh monitor, aturan notifikasi, eskalasi, jadwal on-call, dan halaman status.</p></div></div><div class="p-2.5 rounded bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1"><div class="flex justify-between"><span class="text-zinc-500">Format:</span><span class="font-mono text-emerald-300">Standard JSON</span></div><div class="flex justify-between"><span class="text-zinc-500">Penggunaan:</span><span class="text-zinc-600">Migrasi &amp; Audit Konfigurasi</span></div></div><a href="/api/v1/backup/export?format=json" download class="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 border border-zinc-300 transition-colors shadow-xs cursor-pointer"> 📥 Unduh Konfigurasi (JSON) </a></div></div></section>`);
	else _push(`<!---->`);
	if ($setup.isChannelModalOpen) {
		_push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-200 pb-3"><h3 class="text-sm font-semibold text-zinc-900">Tambah Saluran Notifikasi</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipe Saluran</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"><option value="discord"${ssrIncludeBooleanAttr(Array.isArray($setup.channelForm.type) ? ssrLooseContain($setup.channelForm.type, "discord") : ssrLooseEqual($setup.channelForm.type, "discord")) ? " selected" : ""}>Discord Webhook</option><option value="telegram"${ssrIncludeBooleanAttr(Array.isArray($setup.channelForm.type) ? ssrLooseContain($setup.channelForm.type, "telegram") : ssrLooseEqual($setup.channelForm.type, "telegram")) ? " selected" : ""}>Telegram Bot</option><option value="slack"${ssrIncludeBooleanAttr(Array.isArray($setup.channelForm.type) ? ssrLooseContain($setup.channelForm.type, "slack") : ssrLooseEqual($setup.channelForm.type, "slack")) ? " selected" : ""}>Slack Webhook</option><option value="webhook"${ssrIncludeBooleanAttr(Array.isArray($setup.channelForm.type) ? ssrLooseContain($setup.channelForm.type, "webhook") : ssrLooseEqual($setup.channelForm.type, "webhook")) ? " selected" : ""}>Generic HTTP Webhook</option></select></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Saluran</label><input${ssrRenderAttr("value", $setup.channelForm.name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. #ops-alerts" required></div>`);
		if ($setup.channelForm.type === "telegram") _push(`<div class="space-y-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Bot Token Telegram</label><input${ssrRenderAttr("value", $setup.channelForm.botToken)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="123456:ABC-DEF..." required></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Telegram Chat ID</label><input${ssrRenderAttr("value", $setup.channelForm.chatId)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="-100123456789" required></div></div>`);
		else _push(`<div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Webhook URL</label><input${ssrRenderAttr("value", $setup.channelForm.url)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="https://discord.com/api/webhooks/..." required></div>`);
		_push(`<div class="flex justify-end gap-2 pt-3 border-t border-zinc-200"><button type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors">Batal</button><button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm">Simpan</button></div></form></div></div>`);
	} else _push(`<!---->`);
	if ($setup.isKeyModalOpen) _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-200 pb-3"><h3 class="text-sm font-semibold text-zinc-900">Generate Scoped API Key</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Key / Keperluan</label><input${ssrRenderAttr("value", $setup.keyForm.name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. GitHub Actions CI Pipeline" required></div><div class="space-y-1.5"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Scopes (Izin Akses)</label><div class="space-y-1 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-xs"><label class="flex items-center gap-2 cursor-pointer text-zinc-600"><input type="checkbox" value="*"${ssrIncludeBooleanAttr(Array.isArray($setup.keyForm.scopes) ? ssrLooseContain($setup.keyForm.scopes, "*") : $setup.keyForm.scopes) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"> Full Admin Access (*) </label><label class="flex items-center gap-2 cursor-pointer text-zinc-600"><input type="checkbox" value="monitors:read"${ssrIncludeBooleanAttr(Array.isArray($setup.keyForm.scopes) ? ssrLooseContain($setup.keyForm.scopes, "monitors:read") : $setup.keyForm.scopes) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"> monitors:read </label><label class="flex items-center gap-2 cursor-pointer text-zinc-600"><input type="checkbox" value="monitors:write"${ssrIncludeBooleanAttr(Array.isArray($setup.keyForm.scopes) ? ssrLooseContain($setup.keyForm.scopes, "monitors:write") : $setup.keyForm.scopes) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"> monitors:write </label><label class="flex items-center gap-2 cursor-pointer text-zinc-600"><input type="checkbox" value="status_pages:manage"${ssrIncludeBooleanAttr(Array.isArray($setup.keyForm.scopes) ? ssrLooseContain($setup.keyForm.scopes, "status_pages:manage") : $setup.keyForm.scopes) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"> status_pages:manage </label></div></div><div class="flex justify-end gap-2 pt-3 border-t border-zinc-200"><button type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors">Batal</button><button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm">Generate</button></div></form></div></div>`);
	else _push(`<!---->`);
	if ($setup.isMaintModalOpen) {
		_push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-4"><div class="flex items-center justify-between border-b border-zinc-200 pb-3"><h3 class="text-sm font-semibold text-zinc-900">Jadwalkan Maintenance Window</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Judul Maintenance</label><input${ssrRenderAttr("value", $setup.maintForm.title)} class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Core Switch &amp; Database Upgrade" required></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Deskripsi (Opsional)</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" rows="2" placeholder="Routine OS patching and migration...">${ssrInterpolate($setup.maintForm.description)}</textarea></div><div class="grid grid-cols-2 gap-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Waktu Mulai</label><input${ssrRenderAttr("value", $setup.maintForm.start_time)} type="datetime-local" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Waktu Selesai</label><input${ssrRenderAttr("value", $setup.maintForm.end_time)} type="datetime-local" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Monitor yang Terdampak</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"><option value="all"${ssrIncludeBooleanAttr(Array.isArray($setup.maintForm.scope) ? ssrLooseContain($setup.maintForm.scope, "all") : ssrLooseEqual($setup.maintForm.scope, "all")) ? " selected" : ""}>Semua Monitor (*)</option><option value="select"${ssrIncludeBooleanAttr(Array.isArray($setup.maintForm.scope) ? ssrLooseContain($setup.maintForm.scope, "select") : ssrLooseEqual($setup.maintForm.scope, "select")) ? " selected" : ""}>Pilih Monitor Tertentu</option></select></div>`);
		if ($setup.maintForm.scope === "select") {
			_push(`<div class="max-h-36 overflow-y-auto bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 space-y-1"><!--[-->`);
			ssrRenderList($setup.monitors, (m) => {
				_push(`<label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600"><input type="checkbox"${ssrRenderAttr("value", m.id)}${ssrIncludeBooleanAttr(Array.isArray($setup.maintForm.selectedIds) ? ssrLooseContain($setup.maintForm.selectedIds, m.id) : $setup.maintForm.selectedIds) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"><span>${ssrInterpolate(m.name)} (${ssrInterpolate(m.target)})</span></label>`);
			});
			_push(`<!--]--></div>`);
		} else _push(`<!---->`);
		_push(`<div class="flex justify-end gap-2 pt-3 border-t border-zinc-200"><button type="button" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors">Batal</button><button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm">Jadwalkan</button></div></form></div></div>`);
	} else _push(`<!---->`);
	if ($setup.isEscModalOpen) {
		_push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3"><div class="flex items-center justify-between border-b border-zinc-200 pb-2.5"><h3 class="text-sm font-semibold text-zinc-900">Buat Kebijakan Eskalasi</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-3"><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nama Kebijakan</label><input${ssrRenderAttr("value", $setup.escForm.name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Eskalasi Insiden Kritis &gt; 15 Menit" required></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Jeda Waktu Tunggu (Menit)</label><input${ssrRenderAttr("value", $setup.escForm.wait_minutes)} type="number" min="1" max="1440" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div><div class="space-y-1"><label class="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Saluran Notifikasi yang Dituju</label><div class="max-h-36 overflow-y-auto bg-zinc-50 p-2 rounded-lg border border-zinc-200 space-y-1"><!--[-->`);
		ssrRenderList($setup.channels, (c) => {
			_push(`<label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600"><input type="checkbox"${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray($setup.escForm.channel_ids) ? ssrLooseContain($setup.escForm.channel_ids, c.id) : $setup.escForm.channel_ids) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"><span>${ssrInterpolate(c.name)} (${ssrInterpolate(c.type)})</span></label>`);
		});
		_push(`<!--]-->`);
		if ($setup.channels.length === 0) _push(`<div class="text-xs text-zinc-400 italic p-1">Belum ada saluran. Buat saluran notifikasi terlebih dahulu.</div>`);
		else _push(`<!---->`);
		_push(`</div></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-200"><button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors">Batal</button><button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs">Simpan</button></div></form></div></div>`);
	} else _push(`<!---->`);
	if ($setup.isOnCallModalOpen) _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3"><div class="flex items-center justify-between border-b border-zinc-200 pb-2.5"><h3 class="text-sm font-semibold text-zinc-900">Tambah Jadwal On-Call</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-2.5"><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Nama Tim / Shift</label><input${ssrRenderAttr("value", $setup.onCallForm.name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Piket NOC &amp; Server Tier-1" required></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Operator Utama</label><input${ssrRenderAttr("value", $setup.onCallForm.primary_name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Nama lengkap" required></div><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Kontak / HP Utama</label><input${ssrRenderAttr("value", $setup.onCallForm.primary_contact)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="+62812... / Telegram" required></div></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Operator Cadangan (Opsional)</label><input${ssrRenderAttr("value", $setup.onCallForm.secondary_name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Nama cadangan"></div><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Kontak Cadangan</label><input${ssrRenderAttr("value", $setup.onCallForm.secondary_contact)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Kontak cadangan"></div></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Jam Mulai Shift</label><input${ssrRenderAttr("value", $setup.onCallForm.shift_start_time)} type="time" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div><div><label class="block text-xs font-medium text-zinc-500 mb-0.5">Jam Selesai Shift</label><input${ssrRenderAttr("value", $setup.onCallForm.shift_end_time)} type="time" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400" required></div></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-200"><button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer">Batal</button><button type="submit" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer">Simpan Jadwal</button></div></form></div></div>`);
	else _push(`<!---->`);
	if ($setup.isStatusPageModalOpen) {
		_push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3"><div class="flex items-center justify-between border-b border-zinc-200 pb-2.5"><h3 class="text-sm font-semibold text-zinc-900">Buat Halaman Status Kustom</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-2.5"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Judul Halaman Status</label><input${ssrRenderAttr("value", $setup.statusPageForm.title)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Status Layanan Publik &amp; Warga" required></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">URL Slug Kustom</label><div class="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500"><span class="px-2.5 py-1.5 text-xs text-zinc-400 font-mono bg-white border-r border-zinc-200">/status/</span><input${ssrRenderAttr("value", $setup.statusPageForm.slug)} class="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none" placeholder="layanan-publik" required></div></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Deskripsi Singkat</label><textarea class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" rows="2" placeholder="Informasi status operasional sistem pelayanan publik Diskominfo...">${ssrInterpolate($setup.statusPageForm.description)}</textarea></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Pilihan Monitor</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"><option value="all"${ssrIncludeBooleanAttr(Array.isArray($setup.statusPageForm.scope) ? ssrLooseContain($setup.statusPageForm.scope, "all") : ssrLooseEqual($setup.statusPageForm.scope, "all")) ? " selected" : ""}>Semua Monitor Aktif (*)</option><option value="select"${ssrIncludeBooleanAttr(Array.isArray($setup.statusPageForm.scope) ? ssrLooseContain($setup.statusPageForm.scope, "select") : ssrLooseEqual($setup.statusPageForm.scope, "select")) ? " selected" : ""}>Pilih Monitor Tertentu</option></select></div>`);
		if ($setup.statusPageForm.scope === "select") {
			_push(`<div class="max-h-32 overflow-y-auto bg-zinc-50 p-2 rounded-lg border border-zinc-200 space-y-1"><!--[-->`);
			ssrRenderList($setup.monitors, (m) => {
				_push(`<label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600"><input type="checkbox"${ssrRenderAttr("value", m.id)}${ssrIncludeBooleanAttr(Array.isArray($setup.statusPageForm.selectedMonitorIds) ? ssrLooseContain($setup.statusPageForm.selectedMonitorIds, m.id) : $setup.statusPageForm.selectedMonitorIds) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"><span>${ssrInterpolate(m.name)} (${ssrInterpolate(m.target)})</span></label>`);
			});
			_push(`<!--]--></div>`);
		} else _push(`<!---->`);
		_push(`<div class="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2"><label class="flex items-center gap-2 cursor-pointer text-xs text-zinc-600"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($setup.statusPageForm.is_protected) ? ssrLooseContain($setup.statusPageForm.is_protected, null) : $setup.statusPageForm.is_protected) ? " checked" : ""} class="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"><span>🔒 Kunci halaman dengan Kata Sandi (Akses Terbatas)</span></label>`);
		if ($setup.statusPageForm.is_protected) _push(`<input${ssrRenderAttr("value", $setup.statusPageForm.password)} type="password" placeholder="Masukkan kata sandi pembuka..." class="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" required>`);
		else _push(`<!---->`);
		_push(`</div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-200"><button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer">Batal</button><button type="submit"${ssrIncludeBooleanAttr($setup.isSavingStatusPage) ? " disabled" : ""} class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer">${ssrInterpolate($setup.isSavingStatusPage ? "Menyimpan..." : "Simpan Halaman Status")}</button></div></form></div></div>`);
	} else _push(`<!---->`);
	if ($setup.isUserModalOpen) _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3"><div class="flex items-center justify-between border-b border-zinc-200 pb-2.5"><h3 class="text-sm font-semibold text-zinc-900">Tambah Akun Operator Baru</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-2.5"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Nama Lengkap Operator</label><input${ssrRenderAttr("value", $setup.userForm.full_name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Budi Santoso" required></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Alamat Email Resmi</label><input${ssrRenderAttr("value", $setup.userForm.email)} type="email" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="budi@cjr.go.id" required></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Peran &amp; Hak Akses (Role)</label><select class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"><option value="admin"${ssrIncludeBooleanAttr(Array.isArray($setup.userForm.role) ? ssrLooseContain($setup.userForm.role, "admin") : ssrLooseEqual($setup.userForm.role, "admin")) ? " selected" : ""}>Administrator (Akses Penuh Seluruh Sistem)</option><option value="editor"${ssrIncludeBooleanAttr(Array.isArray($setup.userForm.role) ? ssrLooseContain($setup.userForm.role, "editor") : ssrLooseEqual($setup.userForm.role, "editor")) ? " selected" : ""}>Editor (Kelola Monitor &amp; Insiden)</option><option value="viewer"${ssrIncludeBooleanAttr(Array.isArray($setup.userForm.role) ? ssrLooseContain($setup.userForm.role, "viewer") : ssrLooseEqual($setup.userForm.role, "viewer")) ? " selected" : ""}>Viewer (Hanya Lihat Dashboard)</option></select></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Kata Sandi Awal</label><input${ssrRenderAttr("value", $setup.userForm.password)} type="password" class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="Minimal 8 karakter" required></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-200"><button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer">Batal</button><button type="submit"${ssrIncludeBooleanAttr($setup.isSavingUser) ? " disabled" : ""} class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer">${ssrInterpolate($setup.isSavingUser ? "Menyimpan..." : "Simpan Operator")}</button></div></form></div></div>`);
	else _push(`<!---->`);
	if ($setup.isProbeModalOpen) _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-5 space-y-3"><div class="flex items-center justify-between border-b border-zinc-200 pb-2.5"><h3 class="text-sm font-semibold text-zinc-900">Daftarkan Probe Node Baru</h3><button class="text-zinc-500 hover:text-zinc-900 text-xl leading-none">×</button></div><form class="space-y-2.5"><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Nama Probe Node</label><input${ssrRenderAttr("value", $setup.probeForm.name)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="e.g. Edge Probe SGP Cloud" required></div><div class="space-y-1"><label class="block text-xs font-medium text-zinc-600">Region Identifier</label><input${ssrRenderAttr("value", $setup.probeForm.region)} class="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-400" placeholder="sgp-cloud, jkt-idc, cjr-edge" required></div><div class="flex justify-end gap-2 pt-2 border-t border-zinc-200"><button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer">Batal</button><button type="submit"${ssrIncludeBooleanAttr($setup.isSavingProbe) ? " disabled" : ""} class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer">${ssrInterpolate($setup.isSavingProbe ? "Mendaftarkan..." : "Daftarkan Node")}</button></div></form></div></div>`);
	else _push(`<!---->`);
	_push(ssrRenderComponent($setup["ConfirmModal"], {
		isOpen: $setup.confirmModal.isOpen,
		title: $setup.confirmModal.title,
		message: $setup.confirmModal.message,
		confirmText: $setup.confirmModal.confirmText,
		isDanger: $setup.confirmModal.isDanger,
		isLoading: $setup.confirmModal.isLoading,
		onConfirm: $setup.handleModalConfirm,
		onClose: ($event) => $setup.confirmModal.isOpen = false
	}, null, _parent));
	_push(`</div><footer class="w-full border-t border-zinc-200/80 py-6 bg-white/50 mt-auto"><div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono"><p>${ssrInterpolate($setup.brandingForm.footer_text || "Powered by SentinelUp — Observability Platform")}</p></div></footer></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/vue/SettingsView.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var SettingsView_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region src/pages/settings.astro
var settings_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Settings,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Settings = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Settings;
	const token = Astro.cookies.get("sentinel_session")?.value;
	const session = token ? validateSession(token) : null;
	if (!session) return Astro.redirect("/login");
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Pengaturan & Integrasi" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main>${renderComponent($$result, "SettingsView", SettingsView_default, {
		"client:load": true,
		"currentUser": session.user,
		"client:component-hydration": "load",
		"client:component-path": "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/components/vue/SettingsView.vue",
		"client:component-export": "default"
	})}</main>` })}`;
}, "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/settings.astro", void 0);
var $$file = "/Users/aptika/Diskominfo/1-projek/uptime-cjr/src/pages/settings.astro";
var $$url = "/settings";
//#endregion
//#region \0virtual:astro:page:src/pages/settings@_@astro
var page = () => settings_exports;
//#endregion
export { page };
