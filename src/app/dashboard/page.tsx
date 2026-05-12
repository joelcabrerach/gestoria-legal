"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Expediente, Hito, EstadoHito } from "@/lib/types";
import { ESTADO_LABELS, ESTADO_HITO_LABELS } from "@/lib/types";

// ── Hito icon & color by status ──
function hitoVisual(estado: EstadoHito) {
  switch (estado) {
    case "completado":
      return {
        icon: CheckCircle2,
        dotColor: "bg-success",
        textColor: "text-success",
        lineColor: "bg-success",
        bgColor: "bg-success/10",
      };
    case "en_progreso":
      return {
        icon: Clock,
        dotColor: "bg-accent animate-pulse-dot",
        textColor: "text-accent",
        lineColor: "bg-accent/40",
        bgColor: "bg-accent/10",
      };
    case "bloqueado":
      return {
        icon: Lock,
        dotColor: "bg-danger",
        textColor: "text-danger",
        lineColor: "bg-danger/30",
        bgColor: "bg-danger/10",
      };
    default:
      return {
        icon: AlertCircle,
        dotColor: "bg-border",
        textColor: "text-muted",
        lineColor: "bg-border",
        bgColor: "bg-surface",
      };
  }
}

// ── Demo data for preview (used when Supabase isn't configured) ──
const DEMO_EXPEDIENTE: Expediente = {
  id: "demo-1",
  titulo: "Compraventa Depto. Providencia",
  descripcion: "Trámite de compraventa de departamento en calle Los Leones 1234",
  direccion: "Los Leones 1234, Providencia",
  ciudad: "Santiago",
  region: "Metropolitana",
  estado: "notaria",
  progreso: 65,
  cliente_id: "demo-user",
  administrador_id: null,
  fecha_inicio: "2026-03-15",
  fecha_estimada: "2026-06-30",
  notas_internas: null,
  created_at: "2026-03-15T00:00:00Z",
  updated_at: "2026-05-12T00:00:00Z",
};

const DEMO_HITOS: Hito[] = [
  {
    id: "h1", expediente_id: "demo-1", titulo: "Recepción de documentos",
    descripcion: "Recepción y revisión de documentación inicial del cliente",
    orden: 1, estado: "completado", fecha_limite: "2026-03-20",
    fecha_completado: "2026-03-18T00:00:00Z",
    created_at: "", updated_at: "",
  },
  {
    id: "h2", expediente_id: "demo-1", titulo: "Tasación",
    descripcion: "Tasación profesional de la propiedad",
    orden: 2, estado: "completado", fecha_limite: "2026-04-01",
    fecha_completado: "2026-03-28T00:00:00Z",
    created_at: "", updated_at: "",
  },
  {
    id: "h3", expediente_id: "demo-1", titulo: "Estudio de títulos",
    descripcion: "Verificación de la cadena de títulos y gravámenes",
    orden: 3, estado: "completado", fecha_limite: "2026-04-15",
    fecha_completado: "2026-04-12T00:00:00Z",
    created_at: "", updated_at: "",
  },
  {
    id: "h4", expediente_id: "demo-1", titulo: "Borrador escritura",
    descripcion: "Preparación del borrador de escritura pública",
    orden: 4, estado: "completado", fecha_limite: "2026-04-30",
    fecha_completado: "2026-04-25T00:00:00Z",
    created_at: "", updated_at: "",
  },
  {
    id: "h5", expediente_id: "demo-1", titulo: "Firma en Notaría",
    descripcion: "Firma de la escritura ante notario público",
    orden: 5, estado: "en_progreso", fecha_limite: "2026-05-20",
    fecha_completado: null,
    created_at: "", updated_at: "",
  },
  {
    id: "h6", expediente_id: "demo-1", titulo: "Inscripción en CBR",
    descripcion: "Inscripción en el Conservador de Bienes Raíces",
    orden: 6, estado: "pendiente", fecha_limite: "2026-06-15",
    fecha_completado: null,
    created_at: "", updated_at: "",
  },
  {
    id: "h7", expediente_id: "demo-1", titulo: "Entrega final",
    descripcion: "Entrega de copias y cierre del expediente",
    orden: 7, estado: "pendiente", fecha_limite: "2026-06-30",
    fecha_completado: null,
    created_at: "", updated_at: "",
  },
];

export default function DashboardPage() {
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // No auth → show demo
          setExpediente(DEMO_EXPEDIENTE);
          setHitos(DEMO_HITOS);
          setIsDemo(true);
          setLoading(false);
          return;
        }

        // Fetch first active expediente
        const { data: exp } = await supabase
          .from("expedientes")
          .select("*")
          .eq("cliente_id", user.id)
          .neq("estado", "completado")
          .order("fecha_inicio", { ascending: false })
          .limit(1)
          .single();

        if (exp) {
          setExpediente(exp);

          // Fetch hitos for this expediente
          const { data: hitosData } = await supabase
            .from("hitos")
            .select("*")
            .eq("expediente_id", exp.id)
            .order("orden", { ascending: true });

          setHitos(hitosData || []);
        } else {
          // No expedientes → show demo
          setExpediente(DEMO_EXPEDIENTE);
          setHitos(DEMO_HITOS);
          setIsDemo(true);
        }
      } catch {
        // Supabase not configured → show demo
        setExpediente(DEMO_EXPEDIENTE);
        setHitos(DEMO_HITOS);
        setIsDemo(true);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileText className="w-16 h-16 text-border mb-4" />
        <h2 className="text-xl font-semibold text-midnight-dark mb-2">
          Sin expedientes activos
        </h2>
        <p className="text-muted">
          No tenés trámites en curso. Tu administrador creará uno pronto.
        </p>
      </div>
    );
  }

  const completedCount = hitos.filter((h) => h.estado === "completado").length;
  const progressFromHitos =
    hitos.length > 0
      ? Math.round((completedCount / hitos.length) * 100)
      : expediente.progreso;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Demo Banner ── */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>
            <strong>Modo demostración.</strong> Configurá tus variables de
            Supabase en <code className="font-mono">.env.local</code> para ver
            datos reales.
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-midnight-dark mb-1">
          Mis Trámites
        </h1>
        <p className="text-muted">Seguimiento de tu expediente activo</p>
      </div>

      {/* ── Expediente Summary Card ── */}
      <div
        className="rounded-2xl border border-border bg-white p-6 lg:p-8 
                    hover:shadow-lg hover:shadow-midnight/5 transition-shadow duration-300
                    animate-fade-in"
      >
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-midnight-dark">
                {expediente.titulo}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {expediente.direccion}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(expediente.fecha_inicio).toLocaleDateString("es-CL")}
                </span>
              </div>
            </div>
          </div>

          {/* Estado badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                        bg-accent/10 text-accent self-start"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            {ESTADO_LABELS[expediente.estado]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <TrendingUp className="w-3.5 h-3.5" />
              Progreso general
            </span>
            <span className="font-semibold text-midnight-dark">
              {progressFromHitos}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light animate-progress transition-all duration-1000"
              style={{ width: `${progressFromHitos}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>
              {completedCount} de {hitos.length} hitos completados
            </span>
            {expediente.fecha_estimada && (
              <span>
                Estimado:{" "}
                {new Date(expediente.fecha_estimada).toLocaleDateString("es-CL")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline de Hitos ── */}
      <div className="animate-fade-in">
        <h2 className="text-lg font-semibold text-midnight-dark mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Línea de Tiempo
        </h2>

        <div className="relative">
          {hitos.map((hito, index) => {
            const visual = hitoVisual(hito.estado);
            const Icon = visual.icon;
            const isLast = index === hitos.length - 1;

            return (
              <div
                key={hito.id}
                className={`relative flex gap-4 pb-8 animate-fade-in stagger-${Math.min(index + 1, 7)}`}
              >
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${visual.lineColor}`}
                  />
                )}

                {/* Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full ${visual.bgColor} flex items-center justify-center
                                ring-4 ring-white`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${visual.textColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`flex-1 pt-1 pb-2 px-4 rounded-xl -mt-1
                              ${hito.estado === "en_progreso" ? "bg-accent/5 border border-accent/10" : ""}
                              ${hito.estado === "bloqueado" ? "bg-danger/5 border border-danger/10" : ""}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-medium text-sm ${
                        hito.estado === "pendiente"
                          ? "text-muted"
                          : "text-midnight-dark"
                      }`}
                    >
                      {hito.titulo}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${visual.bgColor} ${visual.textColor}`}
                    >
                      {ESTADO_HITO_LABELS[hito.estado]}
                    </span>
                  </div>
                  {hito.descripcion && (
                    <p className="text-xs text-muted leading-relaxed">
                      {hito.descripcion}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                    {hito.fecha_limite && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Límite:{" "}
                        {new Date(hito.fecha_limite).toLocaleDateString("es-CL")}
                      </span>
                    )}
                    {hito.fecha_completado && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        {new Date(hito.fecha_completado).toLocaleDateString(
                          "es-CL"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Action (View Documents) ── */}
      <a
        href="/dashboard/documentos"
        className="flex items-center justify-between p-5 rounded-2xl border border-border bg-white
                   hover:shadow-lg hover:shadow-midnight/5 hover:-translate-y-0.5
                   transition-all duration-300 group animate-fade-in"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-midnight/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
            <FileText className="w-5 h-5 text-midnight group-hover:text-accent transition-colors" />
          </div>
          <div>
            <h3 className="font-medium text-midnight-dark text-sm">
              Ver Documentos del Expediente
            </h3>
            <p className="text-xs text-muted">
              Accedé a escrituras, tasaciones y más
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
      </a>
    </div>
  );
}
