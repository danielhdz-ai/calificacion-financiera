import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

type EntityRow<T> = {
  id: string;
  data: T;
};

function createSyncHandlers<T extends { id: string }>(table: string) {
  return {
    async GET() {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Supabase no configurado" },
          { status: 503 },
        );
      }

      const supabase = createServerClient();
      const { data, error } = await supabase
        .from(table)
        .select("data")
        .order("updated_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        (data ?? []).map((row: { data: T }) => row.data),
      );
    },

    async POST(request: NextRequest) {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Supabase no configurado" },
          { status: 503 },
        );
      }

      const body = (await request.json()) as Record<string, T[]>;
      const incoming = body[table] ?? body.items ?? [];

      if (!Array.isArray(incoming)) {
        return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
      }

      const supabase = createServerClient();
      const rows = incoming.map((item) => ({ id: item.id, data: item }));

      if (rows.length > 0) {
        const { error: upsertError } = await supabase
          .from(table)
          .upsert(rows, { onConflict: "id" });

        if (upsertError) {
          return NextResponse.json({ error: upsertError.message }, { status: 500 });
        }
      }

      const incomingIds = incoming.map((item) => item.id);
      const { data: existing, error: listError } = await supabase
        .from(table)
        .select("id");

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const idsToDelete = (existing ?? [])
        .map((row) => row.id)
        .filter((id) => !incomingIds.includes(id));

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .in("id", idsToDelete);

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
export const tasadoresHandlers = createSyncHandlers("tasadores");
