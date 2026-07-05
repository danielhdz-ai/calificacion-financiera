import { TABS } from "@/lib/gscapital/constants";
import type { TabId } from "@/lib/gscapital/types";

export function TabNavigation({
  activeTab,
  onChange,
}: {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex overflow-x-auto px-4 py-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
                active
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
