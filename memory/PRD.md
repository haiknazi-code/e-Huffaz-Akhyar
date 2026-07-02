# PRD — e-HUFFAZ AL-AKHYAR

**Date:** Feb 2026

## Original Problem Statement
SISTEM e-HUFFAZ AKHYAR — Quran hafazan (memorization) tracking system for Sekolah Menengah Islam Al-Akhyar. Teachers (guru halaqah) input tasmi' records, view analytics, and generate reports.

## Architecture
- **Backend**: FastAPI + MongoDB (motor async)
- **Frontend**: React 19 + Tailwind + shadcn/ui + recharts + jsPDF
- **Auth**: Shared password (`akhyar2026`) + simple bearer token
- **Student source**: Google Sheets CSV (read-only, in-memory 5-min cache) + DB extras
- **Theme**: Deep Sage Green + Muted Gold ('Outfit'/'DM Sans'/'Amiri')

## User Personas
- Guru Halaqah (Mualim/Mualimah) — primary user, inputs tasmi' records

## Core Features Implemented (Feb 2026)
- Login (shared password)
- Buletin Utama (memo board) — CRUD
- Rekod Harian: 5 halaqahs, student list (CSV+DB), 5 modes tasmi' (Hafazan Baru/Murajaah/Tilawah/Iqra/Amoktha Khatam), Juzuk 1-30 + special surah, IQRA 1-6, results (Mumtaz/Jayyid/Daif/Gagal Hantar/Tidak Hadir), catatan
- Sejarah Tasmi' table with month + mode filter, CSV/PDF export
- Dashboard: pelajar cemerlang, halaqah cemerlang, pencapaian keseluruhan (bar chart), pelajar lemah
- Laporan Halaqah bulanan with PDF export (logo, summary, ulasan guru, disediakan oleh)
- Prestasi Pelajar with daily line charts (recharts)
- Sticky gradient header, Arabic footer (Amiri font)
- Toast notifications (sonner), responsive grid

## API Endpoints
- POST /api/auth/login
- GET /api/halaqahs; GET/POST /api/halaqahs/{id}/students
- GET/POST/DELETE /api/buletin
- GET/POST/DELETE /api/tasmi
- GET /api/analytics/{pending-halaqahs, top-students, top-halaqahs, overall, weak-students, halaqah-report, student-performance}

## Backlog / Next Tasks
- P1: Auth per-user with role separation
- P1: Email/notification for pending halaqahs
- P2: Tahfiz progress over time (cumulative juzuk khatam tracker)
- P2: Mobile-optimized input flow
- P2: WhatsApp share for parents
