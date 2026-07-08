"use client";

import { useState } from "react";
import { useGSCapital } from "@/components/gscapital/GSCapitalContext";
import {
  Field,
  Input,
  Panel,
  PrimaryButton,
  SecondaryButton,
  TextArea,
} from "@/components/gscapital/ui/Panel";
import { createId } from "@/lib/gscapital/format";
import type { Notaria } from "@/lib/gscapital/types";

const emptyForm: Notaria = {
  id: "",
  notaria: "",
  name: "",
  phone: "",
  email: "",
  zona: "",
  notas: "",
};

export function NotariasTab() {
  const { notarias, saveNotaria, deleteNotaria } = useGSCapital();
  const [form, setForm] = useState<Notaria>(emptyForm);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.notaria.trim() || !form.name.trim()) return;
    await saveNotaria({ ...form, id: form.id || createId() });
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Colaboradores Notarías</h2>
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Panel title={form.id ? "Editar Colaborador" : "Añadir Colaborador Notaría"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Notaría">
              <Input
                value={form.notaria}
                onChange={(e) => setForm({ ...form, notaria: e.target.value })}
                required
              />
            </Field>
            <Field label="Nombre del Contacto">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Correo Electrónico">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Zona de Trabajo">
              <Input
                value={form.zona}
                onChange={(e) => setForm({ ...form, zona: e.target.value })}
              />
            </Field>
            <Field label="Notas / Condiciones">
              <TextArea
                rows={4}
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </Field>
            <div className="flex gap-2">
              <PrimaryButton type="submit">Guardar</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setForm(emptyForm)}>
                Limpiar
              </SecondaryButton>
            </div>
          </form>
        </Panel>

        <Panel>
          {notarias.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No hay colaboradores notarías registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    {["Notaría", "Nombre", "Teléfono", "Email", "Zona", "Notas", "Acciones"].map(
                      (header) => (
                        <th
                          key={header}
                          className="border px-2 py-3 text-left dark:border-gray-600"
                        >
                          {header}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {notarias.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.notaria}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.name}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.phone || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.email || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.zona || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.notas || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">
                        <button
                          type="button"
                          className="mr-2 text-blue-600"
                          onClick={() => setForm(item)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => void deleteNotaria(item.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
