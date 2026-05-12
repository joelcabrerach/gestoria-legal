"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Shield, Calendar, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Perfil } from "@/lib/types";

const DEMO_PERFIL: Perfil = {
  id: "demo-user",
  nombre: "Carlos",
  apellido: "Mendoza",
  email: "carlos.mendoza@email.com",
  telefono: "+56 9 1234 5678",
  rol: "cliente",
  avatar_url: null,
  created_at: "2026-01-15T00:00:00Z",
  updated_at: "2026-05-12T00:00:00Z",
};

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadPerfil() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPerfil(DEMO_PERFIL);
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("perfiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setPerfil(data || DEMO_PERFIL);
      } catch {
        setPerfil(DEMO_PERFIL);
      }
      setLoading(false);
    }
    loadPerfil();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSaving(true);

    try {
      const supabase = createClient();
      await supabase
        .from("perfiles")
        .update({
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          telefono: perfil.telefono,
        })
        .eq("id", perfil.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent fail on demo
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-midnight-dark mb-1">
          Mi Perfil
        </h1>
        <p className="text-muted">Administrá tu información personal</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border bg-white p-6 lg:p-8 animate-fade-in">
        {/* Avatar area */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-xl font-bold">
            {perfil.nombre[0]}
            {perfil.apellido ? perfil.apellido[0] : ""}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-midnight-dark">
              {perfil.nombre} {perfil.apellido || ""}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    perfil.rol === "administrador"
                      ? "bg-warning/10 text-warning"
                      : "bg-accent/10 text-accent"
                  }`}
              >
                <Shield className="w-3 h-3" />
                {perfil.rol === "administrador" ? "Administrador" : "Cliente"}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Desde{" "}
                {new Date(perfil.created_at).toLocaleDateString("es-CL", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-midnight-dark mb-2">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={perfil.nombre}
                  onChange={(e) =>
                    setPerfil({ ...perfil, nombre: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-surface
                             text-midnight-dark text-sm
                             focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                             transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-midnight-dark mb-2">
                Apellido
              </label>
              <input
                type="text"
                value={perfil.apellido || ""}
                onChange={(e) =>
                  setPerfil({ ...perfil, apellido: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface
                           text-midnight-dark text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                           transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight-dark mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                value={perfil.email}
                disabled
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-border/30
                           text-muted text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted mt-1">
              El email no se puede modificar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight-dark mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="tel"
                value={perfil.telefono || ""}
                onChange={(e) =>
                  setPerfil({ ...perfil, telefono: e.target.value })
                }
                placeholder="+56 9 1234 5678"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-surface
                           text-midnight-dark text-sm placeholder:text-muted/60
                           focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                           transition-all duration-200"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-midnight text-white text-sm font-medium
                         hover:bg-midnight-light transition-all duration-200
                         hover:shadow-lg hover:shadow-midnight/20
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "¡Guardado!" : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
