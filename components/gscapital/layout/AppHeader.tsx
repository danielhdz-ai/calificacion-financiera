import { AGENT_INFO } from "@/lib/gscapital/constants";

export function AppHeader({
  darkMode,
  onToggleDarkMode,
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="container mx-auto flex flex-col items-center justify-between px-4 py-4 md:flex-row">
        <div className="mb-4 text-center md:mb-0 md:text-left">
          <h1 className="text-2xl font-bold uppercase text-slate-800 dark:text-white">
            {AGENT_INFO.company}
          </h1>
          <p className="text-sm lowercase italic text-slate-500 dark:text-gray-400">
            Gestor de Banca Daniel Hernández | tlf: {AGENT_INFO.phone} | email:{" "}
            {AGENT_INFO.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Cambiar tema"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
