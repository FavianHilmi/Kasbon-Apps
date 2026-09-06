import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { DebtType } from '@/lib/types/debt';

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sesi kamu berakhir, silakan login lagi.' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status'); // 'all' | 'pending' | 'settled'
  const type = searchParams.get('type'); // 'all' | 'owed_to_me' | 'i_owe'

  let query = supabase.from('debts').select('*').order('created_at', { ascending: false });

  if (type && type !== 'all') {
    query = query.eq('type', type as DebtType);
  }

  if (status === 'pending') {
    query = query.is('settled_at', null);
  } else if (status === 'settled') {
    query = query.not('settled_at', 'is', null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Gagal mengambil catatan kasbon.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sesi kamu berakhir, silakan login lagi.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, counterpart_name, amount, due_date, note } = body;

    if (!type || !['owed_to_me', 'i_owe'].includes(type)) {
      return NextResponse.json({ error: 'Tipe catatan tidak valid.' }, { status: 400 });
    }
    if (!counterpart_name || typeof counterpart_name !== 'string' || !counterpart_name.trim()) {
      return NextResponse.json({ error: 'Nama orang wajib diisi.' }, { status: 400 });
    }
    if (!amount || typeof amount !== 'number' || amount <= 1000) {
      return NextResponse.json({ error: 'Jumlah nominal minimal Rp 1.000.' }, { status: 400 });
    }
    if (note && note.length > 200) {
      return NextResponse.json({ error: 'Catatan tidak boleh lebih dari 200 karakter.' }, { status: 400 });
    }

    const cleanDueDate = due_date && String(due_date).trim() !== '' ? due_date : null;
    const cleanNote = note && String(note).trim() !== '' ? note.trim() : null;

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        type,
        counterpart_name: counterpart_name.trim(),
        amount: Math.floor(amount),
        due_date: cleanDueDate,
        note: cleanNote,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Gagal menyimpan catatan baru.' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Format data tidak valid.' }, { status: 400 });
  }
}