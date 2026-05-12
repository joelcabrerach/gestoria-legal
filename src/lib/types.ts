// ── Database Types ──
// Mirror the Supabase schema ENUMs and table shapes

export type RolUsuario = "administrador" | "cliente";

export type EstadoExpediente =
  | "tasacion"
  | "escritura"
  | "notaria"
  | "cbr"
  | "completado";

export type EstadoHito =
  | "pendiente"
  | "en_progreso"
  | "completado"
  | "bloqueado";

export type TipoDocumento =
  | "escritura"
  | "tasacion"
  | "certificado_dominio"
  | "poder_notarial"
  | "cedula_identidad"
  | "comprobante_pago"
  | "plano"
  | "otro";

export interface Perfil {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  rol: RolUsuario;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expediente {
  id: string;
  titulo: string;
  descripcion: string | null;
  direccion: string;
  ciudad: string | null;
  region: string | null;
  estado: EstadoExpediente;
  progreso: number;
  cliente_id: string;
  administrador_id: string | null;
  fecha_inicio: string;
  fecha_estimada: string | null;
  notas_internas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Documento {
  id: string;
  expediente_id: string;
  nombre_archivo: string;
  url_archivo: string;
  tipo_doc: TipoDocumento;
  tamano_bytes: number | null;
  subido_por: string | null;
  fecha_subida: string;
  created_at: string;
}

export interface Hito {
  id: string;
  expediente_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  estado: EstadoHito;
  fecha_limite: string | null;
  fecha_completado: string | null;
  created_at: string;
  updated_at: string;
}

// ── UI Helper Types ──

export const ESTADO_LABELS: Record<EstadoExpediente, string> = {
  tasacion: "Tasación",
  escritura: "Escritura",
  notaria: "Notaría",
  cbr: "Inscripción CBR",
  completado: "Completado",
};

export const ESTADO_HITO_LABELS: Record<EstadoHito, string> = {
  pendiente: "Pendiente",
  en_progreso: "En Progreso",
  completado: "Completado",
  bloqueado: "Bloqueado",
};

export const TIPO_DOC_LABELS: Record<TipoDocumento, string> = {
  escritura: "Escritura",
  tasacion: "Tasación",
  certificado_dominio: "Certificado de Dominio",
  poder_notarial: "Poder Notarial",
  cedula_identidad: "Cédula de Identidad",
  comprobante_pago: "Comprobante de Pago",
  plano: "Plano",
  otro: "Otro",
};
