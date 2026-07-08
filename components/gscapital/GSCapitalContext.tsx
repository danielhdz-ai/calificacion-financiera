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
  loadInmobiliarios,
  loadNotarias,
  loadTasadores,
  syncClients,
  syncCollaborators,
  syncInmobiliarios,
  syncNotarias,
  syncTasadores,
} from "@/lib/gscapital/api";
import { createEmptyClient } from "@/lib/gscapital/client-factory";
import type { OwnerCount } from "@/lib/gscapital/owners";
import type {
  Client,
  Collaborator,
  Inmobiliario,
  Notaria,
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
  inmobiliarios: Inmobiliario[];
  notarias: Notaria[];
  tasadores: Tasador[];
  loading: boolean;
  createClient: (name: string, ownerCount?: OwnerCount) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  saveCollaborator: (collaborator: Collaborator) => Promise<void>;
  deleteCollaborator: (id: string) => Promise<void>;
  saveInmobiliario: (inmobiliario: Inmobiliario) => Promise<void>;
  deleteInmobiliario: (id: string) => Promise<void>;
  saveNotaria: (notaria: Notaria) => Promise<void>;
  deleteNotaria: (id: string) => Promise<void>;
  saveTasador: (tasador: Tasador) => Promise<void>;
  deleteTasador: (id: string) => Promise<void>;
  replaceAllData: (payload: {
    clients: Client[];
    collaborators: Collaborator[];
    inmobiliarios: Inmobiliario[];
    notarias: Notaria[];
    tasadores: Tasador[];
  }) => Promise<void>;
  refreshAll: () => Promise<void>;
  pendingLoanAmount: number | null;
  setPendingLoanAmount: (amount: number | null) => void;
};

const GSCapitalContext = createContext<GSCapitalContextValue | null>(null);

export function GSCapitalProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("asesoramiento");
  const [darkMode, setDarkMode] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inmobiliarios, setInmobiliarios] = useState<Inmobiliario[]>([]);
  const [notarias, setNotarias] = useState<Notaria[]>([]);
  const [tasadores, setTasadores] = useState<Tasador[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoanAmount, setPendingLoanAmount] = useState<number | null>(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [loadedClients, loadedCollaborators, loadedInmobiliarios, loadedNotarias, loadedTasadores] =
      await Promise.all([
        loadClients(),
        loadCollaborators(),
        loadInmobiliarios(),
        loadNotarias(),
        loadTasadores(),
      ]);
    setClients(loadedClients);
    setCollaborators(loadedCollaborators);
    setInmobiliarios(loadedInmobiliarios);
    setNotarias(loadedNotarias);
    setTasadores(loadedTasadores);
    setLoading(false);
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

  const persistInmobiliarios = useCallback(async (next: Inmobiliario[]) => {
    setInmobiliarios(next);
    await syncInmobiliarios(next);
  }, []);

  const persistNotarias = useCallback(async (next: Notaria[]) => {
    setNotarias(next);
    await syncNotarias(next);
  }, []);

  const persistTasadores = useCallback(async (next: Tasador[]) => {
    setTasadores(next);
    await syncTasadores(next);
  }, []);

  const createClient = useCallback(
    async (name: string, ownerCount: OwnerCount = 1) => {
      const client = createEmptyClient(name, ownerCount);
      const next = [...clients, client];
      await persistClients(next);
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

  const saveInmobiliario = useCallback(
    async (inmobiliario: Inmobiliario) => {
      const next = inmobiliarios.some((item) => item.id === inmobiliario.id)
        ? inmobiliarios.map((item) =>
            item.id === inmobiliario.id ? inmobiliario : item,
          )
        : [...inmobiliarios, inmobiliario];
      await persistInmobiliarios(next);
    },
    [inmobiliarios, persistInmobiliarios],
  );

  const deleteInmobiliario = useCallback(
    async (id: string) => {
      await persistInmobiliarios(inmobiliarios.filter((item) => item.id !== id));
    },
    [inmobiliarios, persistInmobiliarios],
  );

  const saveNotaria = useCallback(
    async (notaria: Notaria) => {
      const next = notarias.some((item) => item.id === notaria.id)
        ? notarias.map((item) => (item.id === notaria.id ? notaria : item))
        : [...notarias, notaria];
      await persistNotarias(next);
    },
    [notarias, persistNotarias],
  );

  const deleteNotaria = useCallback(
    async (id: string) => {
      await persistNotarias(notarias.filter((item) => item.id !== id));
    },
    [notarias, persistNotarias],
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
      inmobiliarios: Inmobiliario[];
      notarias: Notaria[];
      tasadores: Tasador[];
    }) => {
      await Promise.all([
        persistClients(payload.clients),
        persistCollaborators(payload.collaborators),
        persistInmobiliarios(payload.inmobiliarios),
        persistNotarias(payload.notarias),
        persistTasadores(payload.tasadores),
      ]);
      setCurrentClient(null);
    },
    [persistClients, persistCollaborators, persistInmobiliarios, persistNotarias, persistTasadores],
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
      inmobiliarios,
      notarias,
      tasadores,
      loading,
      createClient,
      updateClient,
      deleteClient,
      saveCollaborator,
      deleteCollaborator,
      saveInmobiliario,
      deleteInmobiliario,
      saveNotaria,
      deleteNotaria,
      saveTasador,
      deleteTasador,
      replaceAllData,
      refreshAll,
      pendingLoanAmount,
      setPendingLoanAmount,
    }),
    [
      activeTab,
      darkMode,
      clients,
      currentClient,
      collaborators,
      inmobiliarios,
      notarias,
      tasadores,
      loading,
      createClient,
      updateClient,
      deleteClient,
      saveCollaborator,
      deleteCollaborator,
      saveInmobiliario,
      deleteInmobiliario,
      saveNotaria,
      deleteNotaria,
      saveTasador,
      deleteTasador,
      replaceAllData,
      refreshAll,
      pendingLoanAmount,
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
