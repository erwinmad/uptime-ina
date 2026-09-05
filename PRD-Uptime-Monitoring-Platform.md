# PRD: SentinelUp — Advanced Uptime & Observability Platform

**Versi:** 1.0
**Status:** Draft untuk Review
**Kategori:** Self-hosted & Cloud SaaS Uptime Monitoring Platform
**Inspirasi:** UptimeRobot (fitur & ekosistem) + Uptime Kuma (kemudahan self-host)

---

## 1. Ringkasan Eksekutif

SentinelUp adalah platform monitoring ketersediaan (uptime), performa, dan insiden untuk website, API, server, container, dan infrastruktur lainnya. Berbeda dari UptimeRobot (SaaS tertutup, fitur dasar) dan Uptime Kuma (self-host tapi single-node, tidak scalable, tanpa multi-tenant), SentinelUp dirancang untuk:

1. **Se-mudah Uptime Kuma untuk deploy** — satu perintah `docker compose up -d` sudah jalan penuh.
2. **Se-kaya fitur UptimeRobot** — status page publik, integrasi notifikasi luas, SLA report.
3. **Lebih canggih dari keduanya** — arsitektur terdistribusi (multi-region probing), multi-tenant, RBAC, API-first, observability (metrics & tracing), auto-scaling worker, dan AI-assisted root cause hint.

Target: bisa dipakai individu (self-host single VPS, mode "lite") **maupun** perusahaan (mode "cluster" dengan Kubernetes, multi-region, ribuan monitor).

---

## 2. Latar Belakang & Masalah yang Dipecahkan

| Masalah pada existing tools | Solusi SentinelUp |
|---|---|
| UptimeRobot: closed-source, mahal di skala besar, notifikasi terbatas di plan gratis | Open-core, self-host gratis, notifikasi tak terbatas |
| Uptime Kuma: single instance (SQLite), tidak ada clustering, rawan down bareng server yang dipantau, tidak ada RBAC/multi-tenant | Arsitektur terpisah antara **control plane** dan **probe node**, database production-grade (PostgreSQL), mendukung multi-user & organisasi |
| Kedua tools: minim distributed monitoring dari banyak region, minim root-cause insight | Probe node bisa disebar multi-region (Docker agent ringan), korelasi insiden otomatis |
| Minim integrasi enterprise (SSO, audit log, on-call escalation) | SSO (SAML/OIDC), audit log, escalation policy mirip PagerDuty |

---

## 3. Target Pengguna

- **Individu / hobbyist** — mau pantau blog/VPS pribadi, deploy 1 container di VPS $5.
- **Startup / tim kecil** — butuh status page publik, alert ke Slack/Telegram, tanpa biaya per-monitor.
- **Perusahaan / enterprise** — butuh multi-tim, SSO, SLA report, on-call rotation, compliance audit log, multi-region probing dari data center sendiri.
- **MSP / Agency** — memonitor banyak klien sekaligus (multi-tenant, white-label status page).

---

## 4. Perbandingan Fitur

| Fitur | UptimeRobot | Uptime Kuma | **SentinelUp (target)** |
|---|---|---|---|
| Self-host gratis | ❌ | ✅ | ✅ |
| Instalasi 1 perintah | ❌ (SaaS) | ✅ | ✅ (docker compose / installer script) |
| Multi-region probing | Terbatas (plan mahal) | ❌ | ✅ (native, agent ringan) |
| HTTP/TCP/Ping/DNS/Keyword monitor | ✅ | ✅ | ✅ |
| Push/Heartbeat monitor (cron job) | Terbatas | ✅ | ✅ |
| Docker container monitor | ❌ | ✅ | ✅ |
| Real browser monitor (Puppeteer, cek render JS) | ❌ | ✅ (terbatas) | ✅ (headless cluster terpisah) |
| SSL certificate expiry monitor | ✅ | ✅ | ✅ + auto-renew reminder |
| Status page publik custom domain | ✅ (plan berbayar) | ✅ | ✅ + white-label multi-tenant |
| Notifikasi (Email, Telegram, Slack, Discord, Webhook, WA, SMS) | Terbatas | ✅ (90+ apprise) | ✅ + escalation policy |
| Multi-user & RBAC | ❌ | ❌ | ✅ (Owner/Admin/Editor/Viewer) |
| Multi-tenant (organisasi) | ❌ | ❌ | ✅ |
| SSO (SAML/OIDC/Google/GitHub) | ❌ | ❌ | ✅ |
| Maintenance window | ✅ | ✅ | ✅ |
| Incident management & timeline | Sederhana | ❌ | ✅ (mirip Better Stack) |
| On-call rotation & escalation | ❌ | ❌ | ✅ |
| SLA report otomatis (PDF/email bulanan) | ❌ | ❌ | ✅ |
| API publik & Terraform provider | Terbatas | ❌ | ✅ |
| Audit log | ❌ | ❌ | ✅ |
| Mobile app / PWA | ✅ | ❌ | ✅ (PWA) |
| Scalable ke ribuan monitor (worker terdistribusi) | N/A (SaaS) | ❌ | ✅ (queue-based worker) |

---

## 5. Ruang Lingkup Fitur (Functional Requirements)

### 5.1 Jenis Monitor
- HTTP(S) — status code, response time, keyword match/negatif, JSON path assertion, header/body validasi.
- TCP Port, Ping (ICMP), DNS record check.
- SSL/TLS certificate expiry check.
- Heartbeat/Push monitor (untuk cron job & batch job internal).
- Docker container health (via Docker socket/agent).
- gRPC health check, MQTT, Steam Game Server (opsional plugin).
- Real Browser Monitor (Headless Chrome/Playwright) — untuk cek SPA/JS-rendered content, screenshot on failure.
- Synthetic multi-step transaction monitor (login → checkout, dsb) — fase lanjutan.

### 5.2 Distributed Probing
- Probe node ringan (Go binary/container) yang di-deploy di berbagai region/lokasi.
- Control plane mengirim job cek ke probe via message queue.
- Hasil cek dikumpulkan pusat → deteksi *false positive* (down dianggap valid hanya jika ≥2 region melapor down — mengurangi false alert akibat masalah jaringan lokal probe).

### 5.3 Notifikasi & Escalation
- Kanal: Email (SMTP), Telegram, Slack, Discord, WhatsApp (Business API/3rd party), Webhook generik, PagerDuty, Opsgenie, SMS (Twilio), Microsoft Teams.
- Escalation policy: jika alert level 1 tidak di-ack dalam N menit → naik ke level 2 (tim/orang lain).
- Notification grouping (hindari notif spam saat banyak monitor down bersamaan — deteksi outage massal).
- Retry logic sebelum menandai down (configurable, default 3x cek gagal berturut-turut).

### 5.4 Status Page
- Publik & privat (password-protected).
- Custom domain + auto SSL (Let's Encrypt via reverse proxy).
- Multi-tenant white-label (tiap organisasi punya branding sendiri).
- Historical uptime chart (90 hari), incident timeline, subscribe update via email/RSS.

### 5.5 Incident Management
- Auto-create incident saat monitor down.
- Update manual (investigating → identified → monitoring → resolved).
- Post-mortem template.
- Korelasi otomatis: banyak monitor down bersamaan dalam 1 tag/grup → dianggap 1 incident besar.

### 5.6 Manajemen Tim & Akses
- Organisasi → Tim → Anggota (role: Owner, Admin, Editor, Viewer).
- SSO: OIDC, SAML, Google, GitHub.
- Audit log semua aksi (siapa ubah apa, kapan).
- API Key per user/tim dengan scope terbatas.

### 5.7 Reporting & Analytics
- Dashboard uptime % (24 jam/7 hari/30 hari/90 hari), response time trend, error budget.
- SLA report otomatis (PDF/email bulanan ke stakeholder).
- Export data (CSV/JSON), API metrics (Prometheus exporter).

### 5.8 Maintenance Window
- Jadwal terencana (sekali atau recurring) untuk suppress alert tanpa menghentikan monitoring data historis.

### 5.9 Lain-lain
- Tagging & grouping monitor.
- Dark mode, PWA (installable di HP), mobile push notification.
- Import/export konfigurasi (kompatibel format Uptime Kuma untuk migrasi mudah).
- Plugin system untuk custom monitor type.

---

## 6. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Ketersediaan | 99.9% untuk control plane (mode cluster) |
| Skalabilitas | 1 node: ratusan monitor. Cluster: puluhan ribu monitor via worker horizontal scaling |
| Latensi cek | Interval minimal 10 detik (paid-tier feel), default 60 detik |
| Keamanan | Enkripsi kredensial (AES-256) di DB, TLS wajib, rate limiting API, 2FA (TOTP) |
| Observability | Metrics (Prometheus), tracing (OpenTelemetry), structured logging (JSON) |
| Portabilitas | Docker image resmi untuk amd64 & arm64 (jalan di Raspberry Pi seperti Uptime Kuma) |
| Backup | Auto-backup DB terjadwal, restore 1-klik |
| Multi-tenancy | Isolasi data per organisasi di level row (RLS PostgreSQL) |

---

## 7. Arsitektur Sistem

### 7.1 Komponen Utama

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│   Web Dashboard (SPA)     Status Page (SSR)     Mobile PWA          │
└───────────────┬───────────────────┬──────────────────┬─────────────┘
                 │  HTTPS / WSS      │                  │
┌────────────────▼───────────────────▼──────────────────▼─────────────┐
│                     API GATEWAY (Traefik/Caddy)                     │
│                 - TLS termination - Rate limit - Routing            │
└───────────────┬───────────────────────────────────────────────────┬─┘
                 │                                                   │
┌────────────────▼─────────────┐                     ┌───────────────▼───────────────┐
│      CORE API SERVICE         │                     │     REALTIME SERVICE           │
│  (NestJS / Go Fiber)          │◄───────────────────►│  (WebSocket - Socket.io/NATS)  │
│  - Auth (JWT+OIDC/SAML)       │                      │  - Live status update         │
│  - CRUD monitor/org/team      │                      └────────────────────────────────┘
│  - Business logic incident    │
└───────────────┬───────────────┘
                 │
   ┌─────────────┼─────────────────────────────────┐
   │             │                                 │
┌──▼───────┐  ┌──▼─────────────┐            ┌──────▼──────────┐
│PostgreSQL │  │ Redis (cache,  │            │ Message Queue    │
│ (+Timescale│  │ session, rate │            │ (NATS / Redis    │
│  DB ext.) │  │ limit)         │            │  Streams / RabbitMQ)│
└───────────┘  └────────────────┘            └──────┬───────────┘
                                                      │ job cek
                                        ┌─────────────┼──────────────┐
                                        │             │              │
                                 ┌──────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
                                 │Probe Node   │ │Probe Node   │ │Probe Node   │
                                 │Region: SG   │ │Region: US   │ │Region: EU   │
                                 │(Go binary)  │ │(Go binary)  │ │(Go binary)  │
                                 └─────────────┘ └─────────────┘ └─────────────┘
                                        │ hasil cek dikirim balik via queue
                                        ▼
                              ┌────────────────────┐
                              │ Notification Worker │
                              │ (BullMQ/Go worker)  │
                              │ → Email/Telegram/... │
                              └────────────────────┘
```

### 7.2 Prinsip Desain
- **Separation of concerns**: control plane (API, DB, dashboard) terpisah total dari probe node — jika server yang dipantau down, probe di region lain tetap independen.
- **Mode "Lite" vs "Cluster"**: satu docker-compose untuk single VPS (semua servis dalam 1 file, cocok untuk individu), dan Helm chart untuk mode cluster (Kubernetes, horizontal scaling worker & probe).
- **Event-driven**: hasil cek dan notifikasi diproses lewat message queue agar tidak blocking dan mudah di-scale.

---

## 8. Tech Stack yang Direkomendasikan

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend Dashboard | **Vue 3 + Vite + TailwindCSS + Pinia** | Ringan, reaktif, sesuai gaya Uptime Kuma (memudahkan migrasi komunitas), bundle kecil |
| Status Page (SSR) | **Nuxt 3** (SSR/SSG) | SEO-friendly untuk status page publik, cepat |
| Backend Core API | **Node.js (NestJS) + TypeScript** atau **Go (Fiber/Gin)** | NestJS: developer velocity tinggi, modular, cocok tim kecil-menengah. Go: pilih jika prioritas performa/konkurensi tinggi & footprint kecil (rekomendasi utama untuk versi "cangih" agar 1 proses bisa handle ribuan goroutine probe) |
| Probe Agent | **Go** (binary statis, image < 20MB) | Ringan, cross-compile mudah (amd64/arm64/arm7 utk Raspberry Pi), efisien untuk concurrent network checks |
| Realtime | **Socket.io** atau **NATS + WebSocket gateway** | Live update dashboard tanpa polling |
| Database utama | **PostgreSQL 16** | ACID, RLS untuk multi-tenant, JSONB fleksibel |
| Time-series data (heartbeat/response time) | **TimescaleDB** (extension PostgreSQL) atau **VictoriaMetrics** | Efisien untuk data historis jutaan baris check-result |
| Cache & Session | **Redis 7** | Cache, rate limit, pub/sub |
| Message Queue | **NATS JetStream** (ringan, cocok mode lite) atau **RabbitMQ** (mode enterprise) | Distribusi job cek ke probe & antrian notifikasi |
| Auth | **JWT + Refresh Token**, integrasi **OIDC/SAML** (mis. via library `openid-client`), 2FA **TOTP (otplib)** | Standar & aman |
| Reverse Proxy / SSL | **Caddy** (auto HTTPS, cocok mode lite) / **Traefik** (mode cluster, dynamic routing custom domain status page) | Auto Let's Encrypt |
| Container & Deploy | **Docker + Docker Compose** (mode lite), **Kubernetes + Helm** (mode cluster) | Sesuai requirement "mudah deploy seperti Uptime Kuma" |
| CI/CD | **GitHub Actions** → build multi-arch image → push ke GHCR/Docker Hub | Automasi rilis |
| Observability | **Prometheus** (metrics) + **Grafana** (dashboard ops) + **OpenTelemetry** (tracing) + **Loki** (log) | Self-observability platform |
| Notification Delivery | **Apprise (Python microservice)** atau library Node `nodemailer`, `node-telegram-bot-api`, dsb | Mendukung 90+ kanal notifikasi seperti Uptime Kuma |
| Real Browser Monitor | **Playwright** (headless, worker terpisah agar tidak membebani API utama) | Rendering JS-heavy site |
| Object Storage (screenshot, backup, export report) | **S3-compatible (MinIO self-host / AWS S3)** | Fleksibel |
| Testing | **Vitest/Jest** (unit), **Playwright** (E2E) | Coverage tinggi |

> **Rekomendasi pragmatis untuk MVP**: gunakan **Node.js/NestJS** untuk Core API (development lebih cepat), dan **Go** khusus untuk Probe Agent (performa krusial di sini). Setelah traksi/skala besar, komponen berat bisa ditulis ulang ke Go secara bertahap (strangler pattern).

---

## 9. Struktur Database

### 9.1 Entity Relationship (ringkas)

```
organizations 1───* teams 1───* team_members *───1 users
organizations 1───* monitors 1───* monitor_checks (time-series)
monitors 1───* monitor_tags *───1 tags
monitors 1───* incidents 1───* incident_updates
organizations 1───* notification_channels *───* monitors (via monitor_notifications)
organizations 1───* status_pages 1───* status_page_monitors *───1 monitors
organizations 1───* maintenance_windows *───* monitors
organizations 1───* api_keys
organizations 1───* audit_logs
users 1───* sessions
probe_nodes 1───* monitor_checks
```

### 9.2 Skema SQL (PostgreSQL)

```sql
-- ===================== CORE: ORGANISASI & USER =====================
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    plan            VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),         -- null jika login via SSO
    full_name       VARCHAR(255),
    avatar_url      TEXT,
    is_2fa_enabled  BOOLEAN DEFAULT false,
    totp_secret     VARCHAR(255),
    sso_provider    VARCHAR(50),          -- google, github, saml, oidc, null
    sso_subject_id  VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT now(),
    last_login_at   TIMESTAMPTZ
);

CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL DEFAULT 'viewer', -- owner, admin, editor, viewer
    invited_at      TIMESTAMPTZ DEFAULT now(),
    joined_at       TIMESTAMPTZ,
    UNIQUE (team_id, user_id)
);

CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES users(id),
    name            VARCHAR(255),
    key_hash        VARCHAR(255) NOT NULL,
    scopes          JSONB DEFAULT '[]',     -- ["monitors:read", "monitors:write", ...]
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== MONITOR =====================
CREATE TABLE monitors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id             UUID REFERENCES teams(id),
    name                VARCHAR(255) NOT NULL,
    type                VARCHAR(30) NOT NULL, -- http, tcp, ping, dns, push, docker, grpc, browser, mqtt
    target              TEXT NOT NULL,        -- URL/host/IP
    port                INTEGER,
    interval_seconds    INTEGER DEFAULT 60,
    timeout_seconds     INTEGER DEFAULT 30,
    retries_before_down INTEGER DEFAULT 3,
    http_method         VARCHAR(10) DEFAULT 'GET',
    http_headers        JSONB DEFAULT '{}',
    http_body           TEXT,
    expected_status_codes INT[] DEFAULT ARRAY[200],
    keyword_match       TEXT,
    keyword_type        VARCHAR(10),          -- contains, not_contains
    ssl_check_enabled   BOOLEAN DEFAULT false,
    ssl_expiry_alert_days INTEGER DEFAULT 14,
    assigned_regions    TEXT[] DEFAULT ARRAY['default'], -- probe region ids
    active              BOOLEAN DEFAULT true,
    current_status      VARCHAR(10) DEFAULT 'pending', -- up, down, pending, paused
    last_checked_at     TIMESTAMPTZ,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_monitors_org ON monitors(organization_id);

-- ===================== HASIL CEK (TIME-SERIES, gunakan TimescaleDB hypertable) ===
CREATE TABLE monitor_checks (
    id              BIGSERIAL,
    monitor_id      UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    probe_node_id   UUID REFERENCES probe_nodes(id),
    status          VARCHAR(10) NOT NULL,  -- up, down
    response_time_ms INTEGER,
    status_code     INTEGER,
    error_message   TEXT,
    checked_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, checked_at)
);
-- Ubah jadi hypertable (jika pakai TimescaleDB):
-- SELECT create_hypertable('monitor_checks', 'checked_at');
CREATE INDEX idx_checks_monitor_time ON monitor_checks(monitor_id, checked_at DESC);

-- ===================== PROBE NODE (agen distribusi region) =====================
CREATE TABLE probe_nodes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id), -- null jika probe global/shared
    name            VARCHAR(255),
    region          VARCHAR(100),          -- sg, us-east, eu-west, custom
    api_token_hash  VARCHAR(255) NOT NULL,
    status          VARCHAR(20) DEFAULT 'offline', -- online, offline
    last_heartbeat_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== TAG =====================
CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(20)
);
CREATE TABLE monitor_tags (
    monitor_id      UUID REFERENCES monitors(id) ON DELETE CASCADE,
    tag_id          UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (monitor_id, tag_id)
);

-- ===================== NOTIFIKASI =====================
CREATE TABLE notification_channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL, -- email, telegram, slack, discord, webhook, pagerduty, sms
    name            VARCHAR(255),
    config          JSONB NOT NULL,        -- token, chat_id, webhook_url, dst (dienkripsi di app layer)
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE monitor_notifications (
    monitor_id      UUID REFERENCES monitors(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES notification_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (monitor_id, channel_id)
);

CREATE TABLE escalation_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255),
    steps           JSONB NOT NULL -- [{"after_minutes":5,"channel_ids":[...]}, {"after_minutes":15,"channel_ids":[...]}]
);

-- ===================== INSIDEN =====================
CREATE TABLE incidents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    monitor_id      UUID REFERENCES monitors(id),
    title           VARCHAR(255) NOT NULL,
    status          VARCHAR(20) DEFAULT 'investigating', -- investigating, identified, monitoring, resolved
    started_at      TIMESTAMPTZ DEFAULT now(),
    resolved_at     TIMESTAMPTZ,
    is_auto_created BOOLEAN DEFAULT true
);
CREATE TABLE incident_updates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    status          VARCHAR(20),
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== MAINTENANCE WINDOW =====================
CREATE TABLE maintenance_windows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    recurrence_rule VARCHAR(255), -- RRULE format (iCal) untuk recurring
    affected_monitor_ids UUID[] DEFAULT ARRAY[]::UUID[]
);

-- ===================== STATUS PAGE =====================
CREATE TABLE status_pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    title           VARCHAR(255),
    custom_domain   VARCHAR(255),
    theme_config    JSONB DEFAULT '{}',
    is_public       BOOLEAN DEFAULT true,
    password_hash   VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE status_page_monitors (
    status_page_id  UUID REFERENCES status_pages(id) ON DELETE CASCADE,
    monitor_id      UUID REFERENCES monitors(id) ON DELETE CASCADE,
    display_order   INTEGER DEFAULT 0,
    custom_label    VARCHAR(255),
    PRIMARY KEY (status_page_id, monitor_id)
);

-- ===================== AUDIT LOG =====================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL, -- monitor.created, user.invited, dst
    resource_type   VARCHAR(50),
    resource_id     UUID,
    metadata        JSONB DEFAULT '{}',
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 9.3 Catatan Desain Database
- **Row-Level Security (RLS)** diaktifkan di tabel-tabel berbasis `organization_id` untuk isolasi multi-tenant ketat.
- **Partisi/hypertable** untuk `monitor_checks` (data tumbuh sangat cepat: 1 monitor interval 60s = 1.440 baris/hari) — pakai TimescaleDB continuous aggregate untuk hitung uptime % harian tanpa scan penuh.
- **Retensi data**: raw check data disimpan 90 hari, lalu di-downsample ke agregat per-jam untuk histori jangka panjang (hemat storage, mirip pendekatan Prometheus recording rules).
- Kolom sensitif (`config` notifikasi, `password_hash`) dienkripsi di application layer (AES-256-GCM) sebelum disimpan.

---

## 10. Strategi Deployment (Fokus: Mudah seperti Uptime Kuma)

### 10.1 Mode "Lite" — Single VPS / Individu
Satu file `docker-compose.yml` menjalankan semua servis penting dalam satu perintah:

```yaml
version: "3.9"
services:
  sentinelup:
    image: sentinelup/all-in-one:latest   # image gabungan API+DB migrator+worker+frontend (mode lite)
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - sentinelup-data:/app/data          # SQLite/embedded PostgreSQL untuk mode lite
    environment:
      - MODE=lite
      - JWT_SECRET=changeme

volumes:
  sentinelup-data:
```

Instalasi 1 baris (mirip Uptime Kuma):
```bash
curl -fsSL https://get.sentinelup.io | bash
```
Script installer otomatis: cek Docker terpasang → tarik image → jalankan compose → tampilkan URL akses & password admin awal.

### 10.2 Mode "Standard" — Docker Compose Multi-Servis
Untuk tim kecil yang mau pisah komponen (DB eksternal, Redis, queue):
```yaml
services:
  api:       { image: sentinelup/api }
  frontend:  { image: sentinelup/frontend }
  worker:    { image: sentinelup/worker }
  probe:     { image: sentinelup/probe }
  postgres:  { image: timescale/timescaledb:latest-pg16 }
  redis:     { image: redis:7-alpine }
  caddy:     { image: caddy:2 }   # auto HTTPS
```

### 10.3 Mode "Cluster" — Kubernetes (Enterprise/Skala Besar)
- **Helm chart resmi** `helm install sentinelup sentinelup/sentinelup`.
- HPA (Horizontal Pod Autoscaler) untuk `worker` dan `probe` berdasarkan panjang antrean.
- StatefulSet untuk PostgreSQL/Timescale (atau pakai managed DB: RDS/Cloud SQL).
- Probe node bisa di-deploy sebagai DaemonSet lintas region/cluster berbeda untuk monitoring multi-region asli.

### 10.4 One-Click Deploy Templates
Sediakan tombol/template deploy siap pakai untuk:
- Railway, Render, Fly.io, DigitalOcean Marketplace, Coolify, Portainer template — mengikuti pola kemudahan yang membuat Uptime Kuma populer.

### 10.5 Auto-Update
- Mekanisme cek versi baru dari dashboard admin + tombol "Update Now" (pull image baru & migrate DB otomatis, dengan backup otomatis sebelum migrasi).

---

## 11. Roadmap Pengembangan — Detail Phase by Phase

Total estimasi: **~7-8 bulan** untuk mencapai v2.0 (enterprise-ready), dengan asumsi tim kecil (2-4 developer). Setiap fase punya tujuan, task teknis konkret, struktur kerja, dan **Definition of Done (DoD)** yang jelas supaya bisa jadi acuan sprint planning.

---

### FASE 0 — Fondasi & Persiapan
**Durasi:** 2 minggu | **Tim:** 1 tech lead + 1 designer

**Tujuan:** Semua keputusan arsitektur & tooling selesai sebelum baris kode pertama ditulis, supaya tidak bongkar-pasang di tengah jalan.

**Task detail:**
1. **Finalisasi PRD** (dokumen ini) — validasi dengan calon pengguna/stakeholder, kunci scope MVP.
2. **Wireframe & desain UI** (Figma): dashboard utama, form tambah monitor, status page publik, halaman login/2FA.
3. **Setup monorepo:**
   ```bash
   npx create-turbo@latest sentinelup
   cd sentinelup
   mkdir -p apps/api apps/frontend apps/probe apps/worker apps/status-page
   mkdir -p packages/shared-types packages/ui packages/eslint-config
   ```
4. **Pilih & kunci tech stack final** per komponen (lihat Bagian 8) — tulis Architecture Decision Record (ADR) singkat untuk tiap pilihan besar (kenapa NestJS bukan Express, kenapa TimescaleDB bukan InfluxDB, dst).
5. **Setup repo GitHub**: branch protection (`main` wajib PR + review), template PR/issue, `CONTRIBUTING.md`.
6. **CI dasar** (GitHub Actions): lint (ESLint/Prettier), unit test runner, build check — jalan di tiap PR.
7. **Provisioning environment dev**: `docker-compose.dev.yml` berisi PostgreSQL + Redis + Mailhog (untuk test email lokal) supaya semua developer punya environment sama.

**Definition of Done (DoD) Fase 0:**
- [ ] Wireframe disetujui stakeholder
- [ ] Monorepo jalan, `pnpm install && pnpm dev` sukses tanpa error
- [ ] CI hijau untuk PR kosong (skeleton)
- [ ] ADR tersimpan di `docs/adr/`

---

### FASE 1 — MVP "Lite" (Setara Fitur Inti Uptime Kuma)
**Durasi:** 6–8 minggu | **Tim:** 2-3 backend, 1 frontend

**Tujuan:** Produk bisa dipakai harian oleh 1 pengguna/tim kecil, deploy 1 perintah, fitur dasar monitoring lengkap.

#### Sprint 1.1 — Auth & Skeleton Backend (1.5 minggu)
- Setup NestJS project (`apps/api`) dengan modul: `AuthModule`, `UsersModule`, `MonitorsModule`.
- Implementasi register/login email+password, hash bcrypt/argon2.
- JWT access token (15 menit) + refresh token (30 hari) tersimpan di tabel `refresh_tokens`.
- Middleware guard `@UseGuards(JwtAuthGuard)` di semua endpoint kecuali public.
- Migrasi DB awal (pakai Prisma/TypeORM/Drizzle): tabel `users`, `organizations` (single-org dulu, kolom disiapkan untuk multi-tenant nanti), `refresh_tokens`.
- **DoD:** bisa register, login, dapat JWT, akses endpoint protected via Postman/curl.

#### Sprint 1.2 — CRUD Monitor & Worker Cek Dasar (2 minggu)
- Tabel `monitors`, endpoint `POST/GET/PATCH/DELETE /api/v1/monitors`.
- Tipe monitor MVP: **HTTP(S), TCP, Ping, Keyword match**.
- Worker terpisah (`apps/worker`, proses Node.js sendiri) yang polling tabel `monitors` tiap interval → jalankan cek → simpan ke `monitor_checks`.
  - Library: `axios`/`undici` untuk HTTP, `net` module untuk TCP, `ping` package untuk ICMP.
- Logic retry: gagal N kali berturut (`retries_before_down`) baru status berubah jadi `down`.
- **DoD:** tambah monitor via API/dashboard, status berubah otomatis sesuai kondisi target real.

#### Sprint 1.3 — Dashboard Frontend & Realtime (2 minggu)
- Setup Vue 3 + Vite + Tailwind (`apps/frontend`).
- Halaman: Login, List Monitor (kartu status up/down + response time mini-chart pakai `chart.js`/`recharts` equivalent Vue), Detail Monitor (histori 24h/7d/30d).
- WebSocket (Socket.io) dari worker/API ke frontend untuk update status realtime tanpa refresh.
- State management pakai Pinia.
- **DoD:** dashboard menampilkan data real dari backend, update live saat status monitor berubah.

#### Sprint 1.4 — Notifikasi Dasar (1 minggu)
- Tabel `notification_channels`, `monitor_notifications`.
- Implementasi kirim: **Email (nodemailer/SMTP), Telegram Bot, Webhook generik**.
- Trigger notifikasi dari worker saat status berubah (up→down atau down→up).
- **DoD:** dapat notifikasi Telegram/email nyata saat target sengaja dimatikan untuk testing.

#### Sprint 1.5 — Status Page & Packaging Deploy (1.5 minggu)
- Tabel `status_pages`, `status_page_monitors`, endpoint publik `GET /api/v1/status-pages/:slug` (tanpa auth).
- Halaman status page sederhana (bisa reuse frontend yang sama dengan route publik, atau Nuxt terpisah jika sudah siap).
- **Docker image all-in-one**: gabungkan API + worker + frontend static build + migrasi DB otomatis jadi 1 image.
- Buat `docker-compose.yml` minimal + **installer script 1-baris** (`curl | bash`) yang cek Docker, jalankan compose, print URL & password admin default.
- **DoD:** instalasi dari VPS kosong sampai monitor pertama aktif < 10 menit, benar-benar dites di VPS baru.

**Milestone Fase 1:** 🎉 **Rilis open-source v0.1** — publish ke GitHub, buat README lengkap, umumkan di komunitas (r/selfhosted, HN Show HN).

---

### FASE 2 — Fitur "Canggih" (Melampaui UptimeRobot)
**Durasi:** 8–10 minggu | **Tim:** 3-4 backend, 1-2 frontend, 1 DevOps

#### Sprint 2.1 — Multi-Tenant & RBAC (2 minggu)
- Migrasi skema: aktifkan penuh `organizations`, `teams`, `team_members` dengan role (owner/admin/editor/viewer).
- Aktifkan **Row-Level Security (RLS)** PostgreSQL berbasis `organization_id` di semua tabel relevan.
- Middleware `@RequireRole('admin')` di endpoint sensitif.
- Frontend: halaman manajemen tim, invite anggota via email.
- **DoD:** 2 organisasi berbeda tidak bisa saling lihat data, role viewer tidak bisa edit monitor.

#### Sprint 2.2 — Probe Node Terdistribusi (2.5 minggu)
- Bangun **probe agent** dalam Go (`apps/probe`): binary ringan yang connect ke message queue (NATS JetStream), terima job cek, eksekusi, kirim hasil balik.
- Tabel `probe_nodes` untuk registrasi & heartbeat tiap probe.
- API pusat men-dispatch job cek ke probe sesuai `monitors.assigned_regions`.
- Logic **konfirmasi multi-region**: status "down" final hanya jika ≥2 probe region berbeda melaporkan gagal (mengurangi false positive).
- Paket distribusi: image Docker probe terpisah, bisa di-deploy independen di VPS region lain (`docker run sentinelup/probe --token=xxx --region=sg`).
- **DoD:** deploy 2 probe di 2 VPS berbeda region, matikan akses dari 1 region saja → monitor TIDAK langsung down (butuh konfirmasi region lain).

#### Sprint 2.3 — Monitor Tipe Lanjutan (1.5 minggu)
- SSL certificate expiry check (pakai Node `tls` module / Go `crypto/tls`).
- Docker container health monitor (via Docker Engine API/socket).
- DNS record monitor (query A/AAAA/CNAME/MX, bandingkan expected value).
- Heartbeat/Push monitor (endpoint `/api/push/:pushToken`, sesuai detail Bagian 14.2).
- **DoD:** kelima tipe monitor baru berfungsi end-to-end dengan alert yang sesuai.

#### Sprint 2.4 — Incident Management & Escalation (2 minggu)
- Auto-create `incidents` saat monitor down, auto-resolve saat up kembali.
- Timeline update manual (investigating → identified → monitoring → resolved) via UI.
- Tabel `escalation_policies`: jika alert level 1 tidak di-ack dalam N menit → kirim ke level 2.
- Notification grouping: deteksi banyak monitor down bersamaan (dalam 1 tag/grup) → gabung jadi 1 notifikasi "outage massal" bukan spam individual.
- **DoD:** simulasikan 5 monitor down bersamaan, hanya terima 1 notifikasi gabungan, bukan 5 terpisah.

#### Sprint 2.5 — SSO & Maintenance Window (1.5-2 minggu)
- OAuth Google & GitHub login dulu (lebih mudah dari SAML).
- Tabel `maintenance_windows`, logic suppress alert (tapi tetap catat data historis) selama jadwal aktif.
- **DoD:** login via Google berhasil & auto-link ke organisasi berdasarkan domain email; monitor tidak trigger alert saat maintenance window aktif.

**Milestone Fase 2:** 🎉 **Rilis v1.0** — feature parity + melampaui UptimeRobot dari sisi fitur inti (multi-region, incident management, escalation).

---

### FASE 3 — Enterprise & Observability
**Durasi:** 8 minggu | **Tim:** 3-4 backend, 1 frontend, 1 DevOps/SRE

#### Sprint 3.1 — Real Browser Monitor (2 minggu)
- Worker terpisah berbasis **Playwright** (isolasi resource, karena headless browser berat) → jalan sebagai service/pod sendiri.
- Fitur: cek elemen ter-render, screenshot otomatis saat gagal (simpan ke MinIO/S3), multi-step transaction sederhana (login → cek dashboard muncul).
- **DoD:** monitor SPA berbasis JS berhasil dideteksi down saat elemen kunci tidak muncul, screenshot tersimpan & bisa dilihat di incident.

#### Sprint 3.2 — API Key Scoped, Audit Log, Terraform Provider (2 minggu)
- Implementasi penuh sesuai Bagian 14.3 (scoped API key) & 14.5 (audit log semua event sensitif).
- Terraform provider dasar (`resource "sentinelup_monitor"`) untuk infra-as-code.
- **DoD:** API key dengan scope `monitors:read` saja terbukti tidak bisa hit endpoint write; audit log mencatat semua aksi CRUD + login.

#### Sprint 3.3 — SLA Report Otomatis (1.5 minggu)
- Cron job bulanan: hitung uptime % per monitor/grup, generate PDF (pakai `puppeteer`/`react-pdf`), kirim email ke daftar stakeholder yang dikonfigurasi.
- **DoD:** laporan PDF bulanan terkirim otomatis tanggal 1, berisi grafik uptime & daftar incident bulan tersebut.

#### Sprint 3.4 — Mode Cluster (Kubernetes) & Self-Observability (2.5 minggu)
- Buat **Helm chart resmi**: `values.yaml` untuk konfigurasi replika API/worker/probe, HPA berbasis panjang antrean NATS.
- Prometheus exporter untuk metrics platform sendiri (`/metrics`) — jumlah monitor aktif, latensi worker, panjang antrean.
- Grafana dashboard template siap pakai untuk operator self-host.
- Multi-tenant white-label status page: custom domain otomatis via Traefik + Let's Encrypt DNS challenge.
- **DoD:** `helm install` sukses di cluster K3s/EKS, HPA terbukti scale up saat load test antrean tinggi.

**Milestone Fase 3:** 🎉 **Rilis v2.0** — siap dijual sebagai solusi enterprise/MSP, mendukung deployment skala besar.

---

### FASE 4 — Diferensiasi Lanjutan (Ongoing, Pasca v2.0)
**Durasi:** berkelanjutan, prioritas berdasarkan feedback pengguna

| Inisiatif | Deskripsi Singkat | Kompleksitas |
|---|---|---|
| AI-assisted incident correlation | Deteksi pola "3 monitor down bersamaan → kemungkinan 1 akar masalah (mis. hosting/network provider yang sama)" | Tinggi (butuh model sederhana/heuristik dulu, bukan LLM penuh) |
| On-call rotation calendar | Jadwal siapa yang jaga minggu ini, terintegrasi dengan escalation policy | Sedang |
| Mobile app native | iOS/Android native push notification (PWA sudah cukup untuk mayoritas kasus, jadi prioritas rendah) | Sedang-Tinggi |
| Marketplace plugin monitor | Community bisa kontribusi tipe monitor custom (mis. monitor khusus game server, IoT protocol tertentu) | Tinggi (butuh sandboxing plugin) |
| Synthetic multi-step transaction lanjutan | Skenario e-commerce penuh: browse → add to cart → checkout, dengan assertion di tiap step | Tinggi |

---

### Ringkasan Timeline

| Fase | Durasi | Kumulatif | Milestone |
|---|---|---|---|
| Fase 0 — Fondasi | 2 minggu | Minggu ke-2 | Setup selesai |
| Fase 1 — MVP Lite | 6-8 minggu | Minggu ke-10 | v0.1 open-source |
| Fase 2 — Fitur Canggih | 8-10 minggu | Minggu ke-20 | v1.0 |
| Fase 3 — Enterprise | 8 minggu | Minggu ke-28 | v2.0 |
| Fase 4 — Diferensiasi | Ongoing | — | Iteratif |

---

## 12. Metrik Keberhasilan (KPI)

| Metrik | Target |
|---|---|
| Waktu instalasi dari nol sampai monitor pertama aktif | < 5 menit (mode lite) |
| False positive alert rate | < 1% (berkat multi-region confirmation) |
| Uptime platform itu sendiri | ≥ 99.9% |
| Jumlah monitor per instance lite tanpa degradasi performa | ≥ 500 |
| Waktu deteksi downtime (dari kejadian ke notifikasi terkirim) | < 90 detik (interval 60s + 1x retry) |
| Adopsi komunitas (GitHub stars, self-host installs) | Growth bulanan positif pasca rilis v1.0 |

---

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Kompleksitas arsitektur terdistribusi bikin mode "lite" jadi berat/susah dipasang | Sediakan image "all-in-one" khusus mode lite yang menyembunyikan kompleksitas (embedded queue, embedded DB) |
| Data time-series membengkak cepat | Retention policy + downsampling otomatis + opsi pakai TimescaleDB/VictoriaMetrics |
| False alert dari 1 region saja | Wajibkan konfirmasi dari ≥2 probe sebelum status "down" final (configurable) |
| Migrasi pengguna existing Uptime Kuma | Sediakan tool import konfigurasi (baca `kuma.db` SQLite → transformasi ke skema SentinelUp) |
| Keamanan credential notifikasi (token bot, webhook) | Enkripsi at-rest + akses API key scoped + audit log |

---

## 14. Autentikasi & Keamanan Endpoint (Detail Komprehensif)

Salah satu pelajaran penting dari Uptime Kuma: **tidak semua endpoint butuh auth yang sama**. Endpoint push/heartbeat sengaja dibuat *tanpa login* (token di URL) supaya gampang dipasang di cron job, sedangkan endpoint manajemen (CRUD monitor, dsb) tetap wajib autentikasi penuh. SentinelUp mengadopsi prinsip ini dan memperkuatnya dengan token rotation, scoped API key, dan audit trail.

### 14.1 Klasifikasi Endpoint & Skema Auth

| Kelompok Endpoint | Contoh | Metode Auth | Alasan Desain |
|---|---|---|---|
| **Push/Heartbeat** | `POST /api/push/:pushToken` | Token unik di URL path, tanpa login | Harus mudah dipanggil dari cron/script tanpa menyimpan credential terpisah |
| **Dashboard interaktif (browser)** | Login web, semua halaman `/app/*` | Session cookie (httpOnly) berisi JWT access token + refresh token | Pengalaman login standar, aman dari XSS (httpOnly), auto-refresh saat expired |
| **REST API publik (automasi/CI-CD/Terraform)** | `POST /api/v1/monitors`, `GET /api/v1/monitors/:id/checks` | API Key (`Authorization: Bearer sk_live_xxx`) dengan **scope granular** | Tidak perlu expose username/password ke pipeline CI/CD; scope membatasi blast radius jika bocor |
| **Realtime/WebSocket** | Socket.io / WS `/realtime` | JWT dikirim saat handshake (`auth: { token }`), diverifikasi sebelum subscribe ke channel org | Mencegah user org A menguping data live org B |
| **Metrics (Prometheus scrape)** | `GET /metrics` | HTTP Basic Auth dengan API Key sebagai password (username diabaikan), ATAU dimatikan sesuai konfigurasi | Memudahkan integrasi Prometheus tanpa OAuth flow, tapi tetap bisa dikunci |
| **Status Page publik** | `GET /status/:slug` | Tanpa auth (jika `is_public=true`), atau password sederhana (jika status page diset privat) | Tujuannya memang untuk dilihat publik/customer |
| **SSO Callback** | `/auth/oidc/callback`, `/auth/saml/acs` | State/nonce validation + signature verification dari IdP | Standar keamanan OIDC/SAML |
| **Webhook masuk (dari monitor pihak ketiga, mis. GitHub Actions trigger)** | `POST /api/v1/webhooks/:webhookId` | HMAC signature di header (`X-Signature`) dicocokkan dengan secret yang disimpan | Mencegah spoofing request dari luar |

### 14.2 Push/Heartbeat Token — Detail

**Karakteristik token:**
- Digenerate otomatis saat monitor tipe `push` dibuat: string random 32+ karakter (base62), disimpan sebagai kolom `push_token` di tabel `monitors` (di-hash dengan SHA-256 di DB, dibandingkan saat request masuk — sama seperti menyimpan password).
- **Token = kunci akses**, siapapun yang tahu URL bisa mengirim heartbeat. Karena itu token dibuat cukup panjang & random agar praktis tidak bisa ditebak (brute-force).
- **Rotation**: admin bisa klik "Regenerate Push URL" kapan saja dari dashboard tanpa perlu hapus/buat ulang monitor — token lama langsung invalid.
- **Rate limit per-token**: default maksimal 1 request per detik per token, untuk mencegah abuse/flooding.
- **Payload yang diterima**: `status` (up/down), `msg` (pesan bebas, disimpan sebagai log), `ping` (opsional, response time dalam ms yang dilaporkan sendiri oleh script).

**Contoh alur pemakaian:**
```bash
#!/bin/bash
# backup-db.sh — dijalankan via cron tiap malam jam 02:00
PUSH_URL="https://sentinelup.example.com/api/push/aZ9kLm2Qx7Wp...(32 char)"

if pg_dump mydb > /backup/db-$(date +%F).sql; then
  curl -fsS "${PUSH_URL}?status=up&msg=Backup+sukses"
else
  curl -fsS "${PUSH_URL}?status=down&msg=Backup+GAGAL,+cek+log"
fi
```

**Perbedaan dengan Uptime Kuma (peningkatan SentinelUp):**
| Aspek | Uptime Kuma | SentinelUp |
|---|---|---|
| Token disimpan | Plaintext di DB | Hashed (SHA-256), tidak bisa dibaca ulang meski DB bocor |
| Rotasi token | Harus hapus & buat ulang monitor | Tombol "Regenerate" 1-klik, histori token lama tercatat di audit log |
| Rate limiting | Tidak ada | Ada, per-token |
| Multi-value alert | Status biner up/down | Bisa kirim custom metric tambahan (`value=`) untuk dashboard, mis. jumlah antrean job |

### 14.3 API Key — Scoped Access

Struktur scope mengikuti pola `resource:action`:

```json
{
  "scopes": [
    "monitors:read",
    "monitors:write",
    "incidents:read",
    "status_pages:manage",
    "notifications:manage"
  ]
}
```

| Scope | Diperbolehkan |
|---|---|
| `monitors:read` | Lihat daftar monitor & histori cek |
| `monitors:write` | Buat/edit/hapus/pause monitor |
| `incidents:read` / `incidents:write` | Baca/tulis incident & update timeline |
| `status_pages:manage` | Kelola status page (buat, custom domain, dst) |
| `notifications:manage` | Kelola kanal notifikasi (berisi kredensial sensitif → scope terpisah agar tidak semua API key bisa lihat/ubah) |
| `audit_logs:read` | Baca audit log (biasanya scope admin-only) |
| `*` (full access) | Setara hak Owner — hanya boleh dibuat oleh Owner org |

**Praktik keamanan API Key:**
- Format: `sk_live_xxxxxxxxxxxxxxxxxxxxxxxx` (prefix membedakan live/test key, memudahkan deteksi kebocoran otomatis mis. via GitHub secret scanning).
- Disimpan sebagai hash (bcrypt/argon2) di kolom `key_hash`, hanya ditampilkan **sekali** saat dibuat.
- Bisa diberi `expires_at` (masa berlaku) dan dicabut kapan saja.
- Setiap pemakaian mencatat `last_used_at` + IP asal, terlihat di dashboard supaya user bisa deteksi anomali.

### 14.4 Autentikasi Dashboard (Login User)

**Alur login password biasa:**
1. `POST /api/v1/auth/login` dengan email + password.
2. Jika `is_2fa_enabled=true`, sistem minta kode TOTP tambahan sebelum sesi dibuat.
3. Server membuat **access token (JWT, umur pendek ±15 menit)** dan **refresh token (umur panjang ±30 hari, disimpan di DB agar bisa dicabut)**.
4. Access token dikirim via httpOnly cookie (browser) atau response body (mobile/PWA) — mencegah pencurian via XSS.
5. Setiap request ke API diverifikasi lewat middleware JWT; saat expired, klien memakai refresh token ke `/api/v1/auth/refresh` untuk dapat access token baru tanpa login ulang.

**Alur SSO (OIDC/SAML) — untuk enterprise:**
1. User klik "Login with SSO" → redirect ke Identity Provider (Okta/Azure AD/Google Workspace).
2. IdP autentikasi user, redirect balik ke `/auth/oidc/callback` dengan authorization code.
3. Backend tukar code dengan token ke IdP, verifikasi signature & claims (email, org domain).
4. Jika domain email cocok dengan domain organisasi yang terdaftar → otomatis buat/link akun user ke organisasi tsb (Just-In-Time provisioning), lalu buat sesi JWT seperti biasa.

**2FA (TOTP):**
- Setup: user scan QR code (`otplib`/`speakeasy`) → simpan `totp_secret` terenkripsi di kolom `users.totp_secret`.
- Setiap login, wajib input 6 digit kode dari authenticator app (Google Authenticator/Authy) selain password.
- Sediakan **recovery codes** (10 kode sekali pakai) untuk jaga-jaga HP hilang.

### 14.5 Keamanan Tambahan Lintas Sistem

- **Enkripsi kredensial notifikasi** (token bot Telegram, webhook Slack, dsb) di kolom `notification_channels.config` — dienkripsi AES-256-GCM di application layer sebelum masuk DB, bukan hanya andalkan enkripsi disk.
- **Audit log untuk semua event auth-sensitif**: `user.login_success`, `user.login_failed`, `api_key.created`, `api_key.revoked`, `push_token.regenerated`, `sso.linked` — semuanya tercatat di tabel `audit_logs` dengan IP address & timestamp.
- **Rate limiting berlapis**: per-IP (mencegah brute force login), per-API-key (mencegah abuse automasi), per-push-token (mencegah flood heartbeat).
- **CORS ketat**: API hanya menerima origin yang terdaftar (dashboard resmi + domain custom status page yang sudah diverifikasi).
- **Row-Level Security (RLS)** PostgreSQL sebagai lapisan pertahanan kedua di level database — meski ada bug di application layer yang lupa filter `organization_id`, RLS tetap mencegah kebocoran data lintas tenant.
- **Secret rotation reminder**: dashboard menampilkan peringatan jika API Key/push token belum pernah dirotasi > 1 tahun.

### 14.6 Tambahan Skema Database untuk Bagian Ini

```sql
-- Tambahan kolom di tabel monitors (untuk tipe push)
ALTER TABLE monitors ADD COLUMN push_token_hash VARCHAR(255);
ALTER TABLE monitors ADD COLUMN push_token_created_at TIMESTAMPTZ;
ALTER TABLE monitors ADD COLUMN push_expected_interval_seconds INTEGER;
ALTER TABLE monitors ADD COLUMN push_grace_period_seconds INTEGER DEFAULT 60;
ALTER TABLE monitors ADD COLUMN push_last_received_at TIMESTAMPTZ;

-- Riwayat token push yang pernah dirotasi (forensik/audit)
CREATE TABLE push_token_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id      UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    old_token_hash  VARCHAR(255),
    rotated_by      UUID REFERENCES users(id),
    rotated_at      TIMESTAMPTZ DEFAULT now()
);

-- Refresh token tersimpan agar bisa dicabut (revoke) sewaktu-waktu
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2FA recovery codes
CREATE TABLE two_factor_recovery_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash       VARCHAR(255) NOT NULL,
    used_at         TIMESTAMPTZ
);
```

### 14.7 Contoh Endpoint Lengkap dengan Header Auth

```
# Push heartbeat — tanpa header auth, token ada di path
GET /api/push/aZ9kLm2Qx7Wp...?status=up&msg=OK&ping=120

# CRUD monitor — pakai API Key
GET /api/v1/monitors
Authorization: Bearer sk_live_4f8a9c...

# Login dashboard
POST /api/v1/auth/login
Content-Type: application/json
{ "email": "user@company.com", "password": "***", "totp": "482913" }

# Refresh session
POST /api/v1/auth/refresh
Cookie: refresh_token=***  (httpOnly)

# Metrics untuk Prometheus
GET /metrics
Authorization: Basic base64(":uk2_actualApiKeyHere")

# Webhook masuk pihak ketiga (mis. trigger dari CI/CD)
POST /api/v1/webhooks/wh_8f3a1c
X-Signature: sha256=3f7a1b9c...   (HMAC dari body pakai webhook secret)
```

---

## 15. Lampiran: Contoh Kontrak API

```
POST   /api/v1/monitors
GET    /api/v1/monitors
GET    /api/v1/monitors/:id
PATCH  /api/v1/monitors/:id
DELETE /api/v1/monitors/:id
GET    /api/v1/monitors/:id/checks?range=24h
POST   /api/v1/monitors/:id/pause
POST   /api/v1/monitors/:id/resume

POST   /api/v1/status-pages
GET    /api/v1/status-pages/:slug          (publik, tanpa auth)

POST   /api/v1/incidents/:id/updates
GET    /api/v1/organizations/:id/audit-logs

GET    /api/v1/metrics                      (format Prometheus, untuk observability)
```

Autentikasi: `Authorization: Bearer <API_KEY>` dengan scope granular (`monitors:read`, `monitors:write`, `status_pages:manage`, dst).

---

**Selesai.** Dokumen ini menjadi acuan awal — silakan direvisi bersama tim engineering/desain sebelum masuk fase development.
