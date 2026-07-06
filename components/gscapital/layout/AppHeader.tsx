import { AGENT_INFO } from "@/lib/gscapital/constants";

export function AppHeader({
  darkMode,
  onToggleDarkMode,
  userEmail,
  onLogout,
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold uppercase text-slate-800 dark:text-white">
            {AGENT_INFO.company}
          </h1>
          <p className="text-sm italic text-slate-500 dark:text-gray-400">
            {AGENT_INFO.name} | tlf: {AGENT_INFO.phone} | email: {AGENT_INFO.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userEmail ? (
            <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:inline">
              {userEmail}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Cambiar tema"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
            >
              Salir
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
