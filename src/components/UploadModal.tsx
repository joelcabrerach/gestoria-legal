"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TipoDocumento } from "@/lib/types";
import { TIPO_DOC_LABELS } from "@/lib/types";

interface UploadModalProps {
  expedienteId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadModal({
  expedienteId,
  isOpen,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>("otro");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  function resetForm() {
    setFile(null);
    setTipoDoc("otro");
    setUploadState("idle");
    setErrorMsg("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleUpload() {
    if (!file) return;

    setUploadState("uploading");
    setErrorMsg("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("Debés iniciar sesión para subir documentos.");
        setUploadState("error");
        return;
      }

      // Create unique file path: expediente_id/timestamp_filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${expedienteId}/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("documentos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        setErrorMsg(
          storageError.message === "new row violates row-level security policy"
            ? "No tenés permisos para subir documentos. Contactá al administrador."
            : `Error al subir: ${storageError.message}`
        );
        setUploadState("error");
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documentos").getPublicUrl(filePath);

      // Insert record in documentos table
      const { error: dbError } = await supabase.from("documentos").insert({
        expediente_id: expedienteId,
        nombre_archivo: file.name,
        url_archivo: publicUrl,
        tipo_doc: tipoDoc,
        tamano_bytes: file.size,
        subido_por: user.id,
      });

      if (dbError) {
        setErrorMsg(
          dbError.message.includes("row-level security")
            ? "No tenés permisos para registrar documentos. Solo administradores pueden hacerlo."
            : `Error al guardar: ${dbError.message}`
        );
        setUploadState("error");
        return;
      }

      setUploadState("success");
      setTimeout(() => {
        handleClose();
        onUploadComplete();
      }, 1500);
    } catch {
      setErrorMsg("Error inesperado. Verificá tu conexión e intentá de nuevo.");
      setUploadState("error");
    }
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-midnight/20 w-full max-w-md animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Upload className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-midnight-dark text-sm">
                Subir Documento
              </h3>
              <p className="text-xs text-muted">PDF, imágenes o Word</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted hover:text-midnight-dark hover:bg-surface transition-all"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Success State */}
          {uploadState === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h4 className="font-semibold text-midnight-dark mb-1">
                ¡Documento subido!
              </h4>
              <p className="text-sm text-muted">
                El archivo se guardó correctamente.
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadState === "error" && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Area */}
          {uploadState !== "success" && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-all duration-200
                  ${
                    dragOver
                      ? "border-accent bg-accent/5 scale-[1.02]"
                      : file
                        ? "border-success/40 bg-success/5"
                        : "border-border hover:border-accent/40 hover:bg-surface"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-midnight-dark truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted/40 mx-auto mb-3" />
                    <p className="text-sm text-midnight-dark font-medium mb-1">
                      Arrastrá un archivo o hacé clic para seleccionar
                    </p>
                    <p className="text-xs text-muted">
                      PDF, PNG, JPG, WEBP o Word — Máx. 50MB
                    </p>
                  </>
                )}
              </div>

              {/* Document Type Select */}
              <div>
                <label className="block text-sm font-medium text-midnight-dark mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={tipoDoc}
                  onChange={(e) =>
                    setTipoDoc(e.target.value as TipoDocumento)
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface
                             text-midnight-dark text-sm appearance-none cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                             transition-all duration-200"
                >
                  {Object.entries(TIPO_DOC_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || uploadState === "uploading"}
                className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm
                           hover:bg-accent-dark transition-all duration-200
                           hover:shadow-lg hover:shadow-accent/30
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                           flex items-center justify-center gap-2"
              >
                {uploadState === "uploading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir Documento
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
