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
import type { Collaborator } from "@/lib/gscapital/types";

const emptyForm: Collaborator = {
  id: "",
  bank: "",
  name: "",
  phone: "",
  email: "",
  office: "",
  conditions: "",
};

export function ColaboradoresTab() {
  const { collaborators, saveCollaborator, deleteCollaborator } = useGSCapital();
  const [form, setForm] = useState<Collaborator>(emptyForm);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.bank.trim() || !form.name.trim()) return;
    await saveCollaborator({
      ...form,
      id: form.id || createId(),
    });
    setForm(emptyForm);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Colaboradores de Entidades Bancarias</h2>
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <Panel title={form.id ? "Editar Colaborador" : "Añadir Nuevo Colaborador"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Banco"><Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} required /></Field>
            <Field label="Nombre"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Teléfono"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Correo Electrónico"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Oficina"><Input value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })} /></Field>
            <Field label="Condiciones"><TextArea rows={4} value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} /></Field>
            <div className="flex gap-2">
              <PrimaryButton type="submit">Guardar</PrimaryButton>
              <SecondaryButton type="button" onClick={() => setForm(emptyForm)}>Limpiar</SecondaryButton>
            </div>
          </form>
        </Panel>

        <Panel>
          {collaborators.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No hay colaboradores en la base de datos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    {["Banco", "Nombre", "Teléfono", "Email", "Oficina", "Condiciones", "Acciones"].map((h) => (
                      <th key={h} className="border px-2 py-3 text-left dark:border-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collaborators.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.bank}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.name}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.phone || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.email || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.office || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">{item.conditions || "-"}</td>
                      <td className="border px-2 py-2 dark:border-gray-600">
                        <button type="button" className="mr-2 text-blue-600" onClick={() => setForm(item)}>Editar</button>
                        <button type="button" className="text-red-600" onClick={() => void deleteCollaborator(item.id)}>Eliminar</button>
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
