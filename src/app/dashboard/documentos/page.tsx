"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
  Upload,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Documento } from "@/lib/types";
import { TIPO_DOC_LABELS } from "@/lib/types";
import UploadModal from "@/components/UploadModal";

// Demo docs
const DEMO_DOCS: Documento[] = [
  {
    id: "d1", expediente_id: "demo-1", nombre_archivo: "Escritura_Providencia.pdf",
    url_archivo: "#", tipo_doc: "escritura", tamano_bytes: 2450000,
    subido_por: null, fecha_subida: "2026-04-25T00:00:00Z", created_at: "",
  },
  {
    id: "d2", expediente_id: "demo-1", nombre_archivo: "Tasacion_Depto_2026.pdf",
    url_archivo: "#", tipo_doc: "tasacion", tamano_bytes: 1230000,
    subido_por: null, fecha_subida: "2026-03-28T00:00:00Z", created_at: "",
  },
  {
    id: "d3", expediente_id: "demo-1", nombre_archivo: "Certificado_Dominio_Vigente.pdf",
    url_archivo: "#", tipo_doc: "certificado_dominio", tamano_bytes: 560000,
    subido_por: null, fecha_subida: "2026-04-12T00:00:00Z", created_at: "",
  },
  {
    id: "d4", expediente_id: "demo-1", nombre_archivo: "Cedula_Identidad_Cliente.pdf",
    url_archivo: "#", tipo_doc: "cedula_identidad", tamano_bytes: 340000,
    subido_por: null, fecha_subida: "2026-03-15T00:00:00Z", created_at: "",
  },
];

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const DOC_COLORS: Record<string, string> = {
  escritura: "bg-accent/10 text-accent",
  tasacion: "bg-success/10 text-success",
  certificado_dominio: "bg-purple-100 text-purple-600",
  poder_notarial: "bg-warning/10 text-warning",
  cedula_identidad: "bg-pink-100 text-pink-600",
  comprobante_pago: "bg-emerald-100 text-emerald-600",
  plano: "bg-cyan-100 text-cyan-600",
  otro: "bg-surface text-muted",
};

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [expedienteId, setExpedienteId] = useState<string>("demo-1");

  async function loadDocs() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setDocs(DEMO_DOCS);
        setLoading(false);
        return;
      }

      // Get the user's first expediente ID for uploads
      const { data: expedientes } = await supabase
        .from("expedientes")
        .select("id")
        .eq("cliente_id", user.id)
        .limit(1);

      if (expedientes && expedientes.length > 0) {
        setExpedienteId(expedientes[0].id);
      }

      // Fetch docs from expedientes belonging to this user
      const { data } = await supabase
        .from("documentos")
        .select("*, expedientes!inner(cliente_id)")
        .eq("expedientes.cliente_id", user.id)
        .order("fecha_subida", { ascending: false });

      setDocs(data || DEMO_DOCS);
    } catch {
      setDocs(DEMO_DOCS);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadDocs();
  }, []);

  const filtered = docs.filter((d) => {
    const matchSearch = d.nombre_archivo.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || d.tipo_doc === filterType;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-midnight-dark mb-1">
            Mis Documentos
          </h1>
          <p className="text-muted">
            Todos los archivos asociados a tus expedientes
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          id="upload-doc-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                     hover:bg-accent-dark transition-all duration-200
                     hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5
                     self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Subir Documento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white
                       text-midnight-dark placeholder:text-muted/60
                       focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                       transition-all duration-200 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-11 pr-8 py-2.5 rounded-xl border border-border bg-white
                       text-midnight-dark text-sm appearance-none cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                       transition-all duration-200"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(TIPO_DOC_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm text-muted animate-fade-in">
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          {filtered.length} documento{filtered.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Upload className="w-4 h-4" />
          {formatBytes(
            filtered.reduce((sum, d) => sum + (d.tamano_bytes || 0), 0)
          )}{" "}
          total
        </span>
      </div>

      {/* Document List */}
      <div className="space-y-3 animate-fade-in">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-border mx-auto mb-4" />
            <h3 className="font-semibold text-midnight-dark mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-muted text-sm mb-6">
              {search || filterType !== "all"
                ? "Probá con otros filtros"
                : "Aún no hay documentos en tu expediente"}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                         hover:bg-accent-dark transition-all duration-200
                         hover:shadow-lg hover:shadow-accent/30"
            >
              <Plus className="w-4 h-4" />
              Subir tu primer documento
            </button>
          </div>
        ) : (
          filtered.map((doc, i) => (
            <div
              key={doc.id}
              className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-white
                          hover:shadow-md hover:shadow-midnight/5 hover:-translate-y-0.5
                          transition-all duration-200 group`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${DOC_COLORS[doc.tipo_doc] || DOC_COLORS.otro}`}
              >
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-midnight-dark truncate">
                  {doc.nombre_archivo}
                </h3>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                  <span>{TIPO_DOC_LABELS[doc.tipo_doc]}</span>
                  <span>•</span>
                  <span>{formatBytes(doc.tamano_bytes)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.fecha_subida).toLocaleDateString("es-CL")}
                  </span>
                </div>
              </div>

              <a
                href={doc.url_archivo}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10
                           transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label={`Descargar ${doc.nombre_archivo}`}
              >
                <Download className="w-4.5 h-4.5" />
              </a>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        expedienteId={expedienteId}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={() => loadDocs()}
      />
    </div>
  );
}
