"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadClients,
  loadCollaborators,
  loadTasadores,
  saveLocal,
  syncClients,
  syncCollaborators,
  syncTasadores,
} from "@/lib/gscapital/api";
import { createEmptyClient } from "@/lib/gscapital/client-factory";
import type {
  Client,
  Collaborator,
  TabId,
  Tasador,
} from "@/lib/gscapital/types";

type GSCapitalContextValue = {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  clients: Client[];
  currentClient: Client | null;
  setCurrentClient: (client: Client | null) => void;
  collaborators: Collaborator[];
  tasadores: Tasador[];
  loading: boolean;
  syncError: string | null;
  createClient: (name: string) => void;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  saveCollaborator: (collaborator: Collaborator) => Promise<void>;
  deleteCollaborator: (id: string) => Promise<void>;
  saveTasador: (tasador: Tasador) => Promise<void>;
  deleteTasador: (id: string) => Promise<void>;
  replaceAllData: (payload: {
    clients: Client[];
    collaborators: Collaborator[];
    tasadores: Tasador[];
  }) => Promise<void>;
  refreshAll: () => Promise<void>;
};

const GSCapitalContext = createContext<GSCapitalContextValue | null>(null);

export function GSCapitalProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("asesoramiento");
  const [darkMode, setDarkMode] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [tasadores, setTasadores] = useState<Tasador[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const [loadedClients, loadedCollaborators, loadedTasadores] =
        await Promise.all([loadClients(), loadCollaborators(), loadTasadores()]);
      setClients(loadedClients);
      setCollaborators(loadedCollaborators);
      setTasadores(loadedTasadores);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("bdfinanciera_darkMode");
    setDarkMode(storedDarkMode !== "false");
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("bdfinanciera_darkMode", String(darkMode));
  }, [darkMode]);

  const persistClients = useCallback(async (nextClients: Client[]) => {
    setClients(nextClients);
    await syncClients(nextClients);
  }, []);

  const persistCollaborators = useCallback(async (next: Collaborator[]) => {
    setCollaborators(next);
    await syncCollaborators(next);
  }, []);

  const persistTasadores = useCallback(async (next: Tasador[]) => {
    setTasadores(next);
    await syncTasadores(next);
  }, []);

  const createClient = useCallback(
    (name: string) => {
      const client = createEmptyClient(name);
      const next = [...clients, client];
      void persistClients(next).catch((error) =>
        setSyncError(error instanceof Error ? error.message : "Error al guardar"),
      );
      setCurrentClient(client);
    },
    [clients, persistClients],
  );

  const updateClient = useCallback(
    async (client: Client) => {
      const next = clients.some((item) => item.id === client.id)
        ? clients.map((item) => (item.id === client.id ? client : item))
        : [...clients, client];
      await persistClients(next);
      if (currentClient?.id === client.id) {
        setCurrentClient(client);
      }
    },
    [clients, currentClient, persistClients],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const next = clients.filter((client) => client.id !== id);
      await persistClients(next);
      if (currentClient?.id === id) {
        setCurrentClient(null);
      }
    },
    [clients, currentClient, persistClients],
  );

  const saveCollaborator = useCallback(
    async (collaborator: Collaborator) => {
      const next = collaborators.some((item) => item.id === collaborator.id)
        ? collaborators.map((item) =>
            item.id === collaborator.id ? collaborator : item,
          )
        : [...collaborators, collaborator];
      await persistCollaborators(next);
    },
    [collaborators, persistCollaborators],
  );

  const deleteCollaborator = useCallback(
    async (id: string) => {
      await persistCollaborators(collaborators.filter((item) => item.id !== id));
    },
    [collaborators, persistCollaborators],
  );

  const saveTasador = useCallback(
    async (tasador: Tasador) => {
      const next = tasadores.some((item) => item.id === tasador.id)
        ? tasadores.map((item) => (item.id === tasador.id ? tasador : item))
        : [...tasadores, tasador];
      await persistTasadores(next);
    },
    [tasadores, persistTasadores],
  );

  const deleteTasador = useCallback(
    async (id: string) => {
      await persistTasadores(tasadores.filter((item) => item.id !== id));
    },
    [tasadores, persistTasadores],
  );

  const replaceAllData = useCallback(
    async (payload: {
      clients: Client[];
      collaborators: Collaborator[];
      tasadores: Tasador[];
    }) => {
      await Promise.all([
        persistClients(payload.clients),
        persistCollaborators(payload.collaborators),
        persistTasadores(payload.tasadores),
      ]);
      setCurrentClient(null);
    },
    [persistClients, persistCollaborators, persistTasadores],
  );

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      darkMode,
      toggleDarkMode: () => setDarkMode((value) => !value),
      clients,
      currentClient,
      setCurrentClient,
      collaborators,
      tasadores,
      loading,
      syncError,
      createClient,
      updateClient,
      deleteClient,
      saveCollaborator,
      deleteCollaborator,
      saveTasador,
      deleteTasador,
      replaceAllData,
      refreshAll,
    }),
    [
      activeTab,
      darkMode,
      clients,
      currentClient,
      collaborators,
      tasadores,
      loading,
      syncError,
      createClient,
      updateClient,
      deleteClient,
      saveCollaborator,
      deleteCollaborator,
      saveTasador,
      deleteTasador,
      replaceAllData,
      refreshAll,
    ],
  );

  return (
    <GSCapitalContext.Provider value={value}>{children}</GSCapitalContext.Provider>
  );
}

export function useGSCapital() {
  const context = useContext(GSCapitalContext);
  if (!context) {
    throw new Error("useGSCapital debe usarse dentro de GSCapitalProvider");
  }
  return context;
}

export function exportBackupLocally(payload: {
  clients: Client[];
  collaborators: Collaborator[];
  tasadores: Tasador[];
}) {
  saveLocal("bdfinanciera_backup", payload);
}
