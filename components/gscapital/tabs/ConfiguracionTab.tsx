"use client";

import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import { Panel, PrimaryButton, SecondaryButton } from "@/components/gscapital/ui/Panel";

export function ConfiguracionTab() {
  const { clients, collaborators, tasadores, replaceAllData, refreshAll } =
    useGSCapital();

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify({ clients, collaborators, tasadores }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gscapital-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          clients?: typeof clients;
          collaborators?: typeof collaborators;
          tasadores?: typeof tasadores;
        };
        if (!confirm("¿Importar datos? Esto reemplazará la información actual.")) {
          return;
        }
        await replaceAllData({
          clients: data.clients ?? [],
          collaborators: data.collaborators ?? [],
          tasadores: data.tasadores ?? [],
        });
        alert("Datos importados correctamente.");
      } catch {
        alert("Archivo JSON inválido.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración y Gestión de Datos</h2>
      <Panel>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Exportar Datos</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Guarda una copia de seguridad de clientes, colaboradores y tasadores.
            </p>
            <PrimaryButton type="button" onClick={exportJson}>
              Exportar a JSON
            </PrimaryButton>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">Importar Datos</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Carga datos desde un archivo JSON. Esto reemplazará los datos actuales.
            </p>
            <label className="inline-block">
              <PrimaryButton type="button">Importar desde JSON</PrimaryButton>
              <input type="file" accept=".json" className="hidden" onChange={importJson} />
            </label>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold">Sincronización</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Recarga los datos desde Supabase si trabajas en varios dispositivos.
          </p>
          <SecondaryButton type="button" onClick={() => void refreshAll()}>
            Recargar desde Supabase
          </SecondaryButton>
        </div>
      </Panel>
    </div>
  );
}
