# Hiring Task - Junior Fullstack Developer
## Kasbon Apps
Aplikasi web pencatatan kasbon yang dilengkapi visualisasi real-time dan sistem keamanan **Row Level Security (RLS)** untuk isolasi data multi-tenant.

**Fitur Utama:**
* **Summary Cards**: Ringkasan cepat total piutang (*owed to me*), total utang (*owe*), dan selisih saldo secara real-time.
* **Bar Chart Comparison**: Visualisasi grafik perbandingan total utang vs. piutang secara terukur untuk memudahkan pemantauan.
* **Grouping & Filtering Mode**: Pengelompokan dan pemfilteran data kasbon berdasarkan tipe transaksi (*owe* / *owed to me*) serta pencarian nama pihak terkait (*counterpart*) secara instan dengan *debounced search*.
* **Database Isolation (RLS)**: Proteksi data menggunakan Supabase Row Level Security untuk menjamin data antar-user terisolasi secara mutlak.
* **Auth Protection**: Proteksi *route* halaman dan manajemen sesi pengelola/user menggunakan Next.js Server-side Middleware.
---

## Deploy Vercel

* **Aplikasi Live:** [ https://kasbon-apps-phi.vercel.app/]( https://kasbon-apps-phi.vercel.app/)

---

## Cara Setup & Jalankan di Lokal

### Prasyarat
* **Node.js**: `v18.x` atau versi terbaru
* **Package Manager**: `npm` / `pnpm` / `yarn`
* **Akun Supabase**: (Bisa pakai Free Tier)

### 1. Environment Variables
Buat file `.env.local` di root folder proyek lalu isi kredensial Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=[https://id-project-supabase-kamu.supabase.co](https://id-project-supabase-kamu.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-supabase-kamu
```

### 2. Setup Database & Migrasi (SQL Editor)
Jalankan query SQL berikut di SQL Editor Supabase Dashboard untuk bikin tabel dan aturan RLS-nya:

```sql
-- 1. Create tabel debts
CREATE TABLE public.debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  type VARCHAR(20) CHECK (type IN ('owe', 'owed_to_me')) NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 3. Buat RLS Policies
CREATE POLICY "Users can view their own debts" 
ON public.debts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" 
ON public.debts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
ON public.debts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
ON public.debts FOR DELETE 
USING (auth.uid() = user_id);
```

### 3. Jalankan di Lokal
  Install dependensi dan jalankan server lokalnya:

```Bash
# Install dependensi
npm install

# Jalankan server dev
npm run dev
```
Buka http://localhost:3000 di browser untuk lihat aplikasinya.

---

## Technical Approach
Fokus utama di project ini adalah keamanan data dan performa UI yang tetap smooth. Saya pakai pendekatan defense-in-depth:
1. Next.js Server-side Middleware: Untuk mem-protect route halaman supaya user yang belum login tidak bisa masuk.

2. Supabase Row Level Security (RLS): Untuk mengunci data langsung di level database Postgres (auth.uid() = user_id). Jadi walaupun ada yang mencoba akses REST API pakai Postman atau cURL, data dijamin tidak akan bocor.

3. Debounced Searching: Di sisi client, pencarian/filter data saya beri debounce agar tidak spam request ke API setiap kali user mengetik karakter di input field.
 
---

## Trade-offs & Rencana Improvement
Apabila ada waktu tambahan, ini beberapa poin yang ingin saya polish:

1. Laporan & Fitur Share: Menambahkan opsi export laporan ke format PDF/Excel, dan tombol Share to WhatsApp untuk mengirimkan ringkasan tagihan kasbon secara langsung ke pihak terkait.

2. Rincian/Itemisasi Kasbon: Mengembangkan form input agar dapat di-breakdown per-item dalam satu transaksi kasbon.

3. Notifikasi Pengingat (DueDate Reminder): Fitur notifikasi otomatis jika ada kasbon yang sudah melewati batas waktu pembayaran (overdue).

4. Optimistic UI Updates: Mengimplementasikan React Query / SWR agar UI langsung ter-update secara instan pada saat proses CRUD tanpa menunggu respon server.

---

## Estimasi Waktu Pengerjaan
Total Waktu: ~4 - 6 Jam (dicicil dalam 2 hari)

- Setup DB, Auth & RLS Policy: 1.5 Jam

- Fitur Utama: 2.5 Jam

- UI/UX Polishing & Testing (Postman/Console): 1.5 Jam

- Deployment Vercel & Record Loom: 1 Jam
