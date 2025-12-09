import React, { useEffect, useMemo, useState } from "react";
import { ListOrdered } from "lucide-react";
import type { InstructionStep, ResolvedSection } from "./types";

interface Props {
  title: string;
  sections: ResolvedSection[];
  tips?: string[];
  notes?: string[];
}

const StructuredInstructions: React.FC<Props> = ({ title, sections, tips, notes }) => {
  const hasTabs = sections.length > 1;
  const [activeKey, setActiveKey] = useState<string>(sections[0]?.key ?? "");

  useEffect(() => {
    // Reset active tab if sections changed
    if (!sections.find((s) => s.key === activeKey)) {
      setActiveKey(sections[0]?.key ?? "");
    }
  }, [sections, activeKey]);

  const activeSection = useMemo(() => {
    return sections.find((s) => s.key === activeKey) ?? sections[0];
  }, [sections, activeKey]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <ListOrdered className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-gray-800 dark:text-white font-semibold">Instruksi Pembayaran — {title}</h3>
      </div>

      {hasTabs ? (
        <div>
          <div
            role="tablist"
            aria-label="Metode Pembayaran"
            className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700"
          >
            {sections.map((sec) => {
              const isActive = sec.key === activeKey;
              return (
                <button
                  key={sec.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${sec.key}`}
                  id={`tab-${sec.key}`}
                  onClick={() => setActiveKey(sec.key)}
                  className={`px-3 py-2 text-sm rounded-t-md border transition-colors cursor-pointer
                    ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-600 border-b-transparent"
                        : "text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {sec.title}
                </button>
              );
            })}
          </div>

          {activeSection && (
            <div
              role="tabpanel"
              id={`panel-${activeSection.key}`}
              aria-labelledby={`tab-${activeSection.key}`}
              className="space-y-2"
            >
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{activeSection.title}</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {activeSection.steps.map((s: InstructionStep) => (
                  <li key={s.step}>{s.text}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.key}>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{sec.title}</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {sec.steps.map((s: InstructionStep) => (
                  <li key={s.step}>{s.text}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {tips?.length ? (
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {notes?.length ? (
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-1">Catatan:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {notes.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default StructuredInstructions;
