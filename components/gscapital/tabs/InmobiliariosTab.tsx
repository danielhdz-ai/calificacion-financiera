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
import type { Inmobiliario } from "@/lib/gscapital/types";

const emptyForm: Inmobiliario = {
  id: "",
  inmobiliaria: "",
  name: "",
  phone: "",
  email: "",
  zona: "",
  notas: "",
};

export function InmobiliariosTab() {
  const { inmobiliarios, saveInmobiliario, deleteInmobiliario } = useGSCapital();
  const [form, setForm] = useState<Inmobiliario>(emptyForm);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.inmobiliaria.trim() || !form.name.trim()) return;
    await saveInmobiliario({ ...form, id: form.id || createId() });
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Colaboradores Inmobiliarios</h2>
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Panel title={form.id ? "Editar Colaborador" : "Añadir Colaborador Inmobiliario"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Inmobiliaria / Agencia">
              <Input value={form.inmobiliaria} onChange={(e) => setForm({ ...form, inmobiliaria: e.target.value })} required />
            </Field>
            <Field label="Nombre del Agente">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Teléfono">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Correo Electrónico">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Zona de Trabajo">
              <Input value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })} />
            </Field>
            <Field label="Notas / Condiciones">
              <TextArea rows={4} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </Field>
            <div className="flex gap-2">
              <PrimaryButton type="submit">Guardar</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setForm(emptyForm)}>Limpiar</SecondaryButton>
            </div>
          </form>
        </Panel>

        <Panel>
          {inmobiliarios.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay colaboradores inmobiliarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    {["Inmobiliaria", "Nombre", "Teléfono", "Email", "Zona", "Notas", "Acciones"].map((h) => (
                      <th key={h} className="border px-2 py-3 text-left dark:border-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inmobiliarios.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.inmobiliaria}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.name}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.phone || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.email || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.zona || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.notas || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">
                        <button type="button" className="mr-2 text-blue-600" onClick={() => setForm(item)}>Editar</button>
                        <button type="button" className="text-red-600" onClick={() => void deleteInmobiliario(item.id)}>Eliminar</button>
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
