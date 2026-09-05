import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sesi kamu berakhir, silakan login lagi.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updatePayload: Record<string, unknown> = {};

    if (typeof body.is_settled === 'boolean') {
      updatePayload.settled_at = body.is_settled ? new Date().toISOString() : null;
    }
    if (body.type && ['owed_to_me', 'i_owe'].includes(body.type)) {
      updatePayload.type = body.type;
    }
    if (body.counterpart_name) {
      updatePayload.counterpart_name = body.counterpart_name.trim();
    }
    if (body.amount && typeof body.amount === 'number' && body.amount > 0) {
      updatePayload.amount = Math.floor(body.amount);
    }
    if ('note' in body) {
      if (body.note && body.note.length > 200) {
        return NextResponse.json({ error: 'Catatan maksimal 200 karakter.' }, { status: 400 });
      }
      updatePayload.note = body.note ? body.note.trim() : null;
    }

    const { data, error } = await supabase
      .from('debts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Catatan tidak ditemukan atau gagal diperbarui.' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Format request tidak valid.' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sesi kamu berakhir, silakan login lagi.' }, { status: 401 });
  }

  const { error, count } = await supabase
    .from('debts')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error || count === 0) {
    return NextResponse.json({ error: 'Catatan tidak ditemukan atau gagal dihapus.' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Catatan berhasil dihapus.' });
}