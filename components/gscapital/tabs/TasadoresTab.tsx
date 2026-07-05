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
import type { Tasador } from "@/lib/gscapital/types";

const emptyForm: Tasador = {
  id: "",
  empresa: "",
  name: "",
  phone: "",
  email: "",
  zona: "",
  notas: "",
};

export function TasadoresTab() {
  const { tasadores, saveTasador, deleteTasador } = useGSCapital();
  const [form, setForm] = useState<Tasador>(emptyForm);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.empresa.trim() || !form.name.trim()) return;
    await saveTasador({ ...form, id: form.id || createId() });
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tasadores y Peritos</h2>
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Panel title={form.id ? "Editar Tasador" : "Añadir Nuevo Tasador"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Empresa/Entidad"><Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} required /></Field>
            <Field label="Nombre del Tasador"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Teléfono"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Correo Electrónico"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Zona de Cobertura"><Input value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })} /></Field>
            <Field label="Notas/Condiciones"><TextArea rows={4} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></Field>
            <div className="flex gap-2">
              <PrimaryButton type="submit">Guardar</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setForm(emptyForm)}>Limpiar</SecondaryButton>
            </div>
          </form>
        </Panel>

        <Panel>
          {tasadores.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay tasadores en la base de datos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    {["Empresa", "Nombre", "Teléfono", "Email", "Zona", "Notas", "Acciones"].map((h) => (
                      <th key={h} className="border px-2 py-3 text-left dark:border-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasadores.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.empresa}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.name}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.phone || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.email || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.zona || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.notas || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">
                        <button type="button" className="mr-2 text-blue-600" onClick={() => setForm(item)}>Editar</button>
                        <button type="button" className="text-red-600" onClick={() => void deleteTasador(item.id)}>Eliminar</button>
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
