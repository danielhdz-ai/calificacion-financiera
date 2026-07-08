import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

async function getAuthContext() {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no configurado", status: 503 as const };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "No autorizado", status: 401 as const };
  }

  return { supabase, user };
}

function createSyncHandlers<T extends { id: string }>(table: string) {
  return {
    async GET(_request: NextRequest) {
      const auth = await getAuthContext();
      if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      const { data, error } = await auth.supabase
        .from(table)
        .select("data")
        .eq("user_id", auth.user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        (data ?? []).map((row: { data: T }) => row.data),
      );
    },

    async POST(request: NextRequest) {
      const auth = await getAuthContext();
      if ("error" in auth) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      const body = (await request.json()) as Record<string, T[]>;
      const incoming = body[table] ?? body.items ?? [];

      if (!Array.isArray(incoming)) {
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
      }

      const rows = incoming.map((item) => ({
        id: item.id,
        user_id: auth.user.id,
        data: item,
      }));

      if (rows.length > 0) {
        const { error: upsertError } = await auth.supabase
          .from(table)
          .upsert(rows, { onConflict: "id" });

        if (upsertError) {
          return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }
      }

      const incomingIds = incoming.map((item) => item.id);
      const { data: existing, error: listError } = await auth.supabase
        .from(table)
        .select("id")
        .eq("user_id", auth.user.id);

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const idsToDelete = (existing ?? [])
        .map((row) => row.id)
        .filter((id) => !incomingIds.includes(id));

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await auth.supabase
          .from(table)
          .delete()
          .in("id", idsToDelete)
          .eq("user_id", auth.user.id);

        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
      }

      return NextResponse.json({ ok: true, count: incoming.length });
    },
  };
}

export const clientsHandlers = createSyncHandlers("clients");
export const collaboratorsHandlers = createSyncHandlers("collaborators");
export const inmobiliariosHandlers = createSyncHandlers("inmobiliarios");
export const notariasHandlers = createSyncHandlers("notarias");
export const tasadoresHandlers = createSyncHandlers("tasadores");
