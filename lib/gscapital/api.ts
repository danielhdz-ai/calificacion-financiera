import type {
  Client,
  Collaborator,
  Inmobiliario,
  Tasador,
} from "@/lib/gscapital/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Error de conexión con el servidor");
  }
  return response.json() as Promise<T>;
}

async function loadSafe<T>(url: string): Promise<T[]> {
  try {
    return await fetchJson<T[]>(url);
  } catch {
    return [];
  }
}

export async function loadClients(): Promise<Client[]> {
  return loadSafe<Client>("/api/clients");
}

export async function syncClients(clients: Client[]): Promise<void> {
  await fetchJson("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clients }),
  });
}

export async function loadCollaborators(): Promise<Collaborator[]> {
  return loadSafe<Collaborator>("/api/collaborators");
}

export async function syncCollaborators(collaborators: Collaborator[]): Promise<void> {
  await fetchJson("/api/collaborators", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collaborators }),
  });
}

export async function loadInmobiliarios(): Promise<Inmobiliario[]> {
  return loadSafe<Inmobiliario>("/api/inmobiliarios");
}

export async function syncInmobiliarios(inmobiliarios: Inmobiliario[]): Promise<void> {
  await fetchJson("/api/inmobiliarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inmobiliarios }),
  });
}

export async function loadTasadores(): Promise<Tasador[]> {
  return loadSafe<Tasador>("/api/tasadores");
}

export async function syncTasadores(tasadores: Tasador[]): Promise<void> {
  await fetchJson("/api/tasadores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tasadores }),
  });
}

export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
