"use client";

import { AppHeader } from "@/components/gscapital/layout/AppHeader";
import { TabNavigation } from "@/components/gscapital/layout/TabNavigation";
import { AsesoramientoTab } from "@/components/gscapital/tabs/AsesoramientoTab";
import { ColaboradoresTab } from "@/components/gscapital/tabs/ColaboradoresTab";
import { ConfiguracionTab } from "@/components/gscapital/tabs/ConfiguracionTab";
import { DatabaseTab } from "@/components/gscapital/tabs/DatabaseTab";
import { HipotecaTab } from "@/components/gscapital/tabs/HipotecaTab";
import { InmobiliariosTab } from "@/components/gscapital/tabs/InmobiliariosTab";
import { PrestamoTab } from "@/components/gscapital/tabs/PrestamoTab";
import { TasadoresTab } from "@/components/gscapital/tabs/TasadoresTab";
import {
  GSCapitalProvider,
  useGSCapital,
} from "@/components/gscapital/GSCapitalContext";

function TabContent() {
  const { activeTab, loading } = useGSCapital();

  if (loading) {
    return <p className="py-12 text-center text-gray-500">Cargando datos...</p>;
  }

  return (
    <>
      {activeTab === "asesoramiento" ? <AsesoramientoTab /> : null}
      {activeTab === "hipoteca" ? <HipotecaTab /> : null}
      {activeTab === "prestamo" ? <PrestamoTab /> : null}
      {activeTab === "database" ? <DatabaseTab /> : null}
      {activeTab === "colaboradores" ? <ColaboradoresTab /> : null}
      {activeTab === "inmobiliarios" ? <InmobiliariosTab /> : null}
      {activeTab === "tasadores" ? <TasadoresTab /> : null}
      {activeTab === "configuracion" ? <ConfiguracionTab /> : null}
    </>
  );
}

function GSCapitalShell() {
  const { activeTab, setActiveTab, darkMode, toggleDarkMode } = useGSCapital();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <AppHeader darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <TabContent />
      </main>
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900">
        © {new Date().getFullYear()} GSCAPITAL - Todos los derechos reservados
      </footer>
    </div>
  );
}

export function GSCapitalApp() {
  return (
    <GSCapitalProvider>
      <GSCapitalShell />
    </GSCapitalProvider>
  );
}
