"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Check,
  X,
  ArrowRight,
  Star,
  Zap,
  Building2,
  Send,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";

const PLANES = [
  {
    nombre: "Básico",
    precio: "Gratis",
    periodo: "",
    descripcion: "Seguimiento en tiempo real de tus trámites activos",
    icon: Zap,
    color: "accent",
    popular: false,
    features: [
      { text: "Ver estado de expedientes", included: true },
      { text: "Timeline de hitos en tiempo real", included: true },
      { text: "Notificaciones por email", included: true },
      { text: "Acceso al portal 24/7", included: true },
      { text: "Subir documentos", included: false },
      { text: "Gestión de múltiples propiedades", included: false },
      { text: "Soporte prioritario", included: false },
    ],
  },
  {
    nombre: "Profesional",
    precio: "$49.990",
    periodo: "/mes",
    descripcion: "Para quienes necesitan gestión documental activa",
    icon: Star,
    color: "accent",
    popular: true,
    features: [
      { text: "Todo del plan Básico", included: true },
      { text: "Subida de documentos ilimitada", included: true },
      { text: "Descarga de escrituras y certificados", included: true },
      { text: "Historial completo de trámites", included: true },
      { text: "Soporte prioritario por email", included: true },
      { text: "Gestión de múltiples propiedades", included: false },
      { text: "Administrador dedicado", included: false },
    ],
  },
  {
    nombre: "Enterprise",
    precio: "$149.990",
    periodo: "/mes",
    descripcion: "Gestión inmobiliaria completa para empresas e inversionistas",
    icon: Building2,
    color: "accent",
    popular: false,
    features: [
      { text: "Todo del plan Profesional", included: true },
      { text: "Gestión ilimitada de propiedades", included: true },
      { text: "Panel de administración completo", included: true },
      { text: "Administrador legal dedicado", included: true },
      { text: "Reportes personalizados", included: true },
      { text: "API de integración", included: true },
      { text: "Soporte telefónico directo", included: true },
    ],
  },
];

export default function PreciosPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [sent, setSent] = useState(false);

  function handleContratar(plan: string) {
    setSelectedPlan(plan);
    setFormData({
      ...formData,
      mensaje: `Hola, me interesa contratar el plan ${plan}.`,
    });
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById("contact-form")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          mensaje: formData.mensaje,
          plan: selectedPlan,
        }),
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setShowForm(false);
          setFormData({ nombre: "", email: "", mensaje: "" });
        }, 5000);
      } else {
        alert("Hubo un error enviando el mensaje. Por favor intentá de nuevo.");
      }
    } catch (error) {
      alert("Error de conexión. Revisá tu internet e intentá de nuevo.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-midnight flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-midnight-dark tracking-tight">
              Gestoría Legal
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-midnight-dark transition-colors">
              Inicio
            </Link>
            <Link
              href="/precios"
              className="text-midnight-dark font-medium"
            >
              Precios
            </Link>
          </nav>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg bg-midnight text-white text-sm font-medium 
                       hover:bg-midnight-light transition-all duration-200 
                       hover:shadow-lg hover:shadow-midnight/20"
          >
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-32 pb-16 text-center px-6">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
            <Star className="w-3.5 h-3.5" />
            Planes flexibles
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-midnight-dark leading-tight mb-4">
            El plan perfecto para
            <span className="gradient-text block mt-1">tu gestión legal</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Elegí el plan que mejor se adapte a tus necesidades. Todos incluyen
            acceso al portal de seguimiento en tiempo real.
          </p>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8">
          {PLANES.map((plan, i) => (
            <div
              key={plan.nombre}
              className={`relative rounded-2xl border p-8 flex flex-col
                          transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                          animate-fade-in stagger-${i + 1}
                          ${
                            plan.popular
                              ? "border-accent bg-white shadow-lg shadow-accent/10 scale-[1.02]"
                              : "border-border bg-white hover:shadow-midnight/5"
                          }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-accent text-white text-xs font-semibold shadow-lg shadow-accent/30">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Icon & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center
                              ${plan.popular ? "bg-accent text-white" : "bg-accent/10 text-accent"}`}
                >
                  <plan.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-midnight-dark">
                  {plan.nombre}
                </h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-midnight-dark">
                  {plan.precio}
                </span>
                {plan.periodo && (
                  <span className="text-muted text-sm">{plan.periodo}</span>
                )}
              </div>

              <p className="text-sm text-muted mb-6 leading-relaxed">
                {plan.descripcion}
              </p>

              {/* CTA */}
              <button
                onClick={() => handleContratar(plan.nombre)}
                id={`plan-${plan.nombre.toLowerCase()}-btn`}
                className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2
                            transition-all duration-200 mb-6
                            ${
                              plan.popular
                                ? "bg-accent text-white hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/30"
                                : "bg-midnight text-white hover:bg-midnight-light hover:shadow-lg hover:shadow-midnight/20"
                            }`}
              >
                Contratar
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className={`flex items-start gap-3 text-sm ${
                      feature.included ? "text-midnight-dark" : "text-muted/50"
                    }`}
                  >
                    {feature.included ? (
                      <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-muted/30 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "" : "line-through"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact Form (appears when "Contratar" is clicked) ── */}
      {showForm && (
        <section
          id="contact-form"
          className="pb-20 px-6 animate-fade-in"
        >
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-midnight-dark">
                    Contratar Plan {selectedPlan}
                  </h3>
                  <p className="text-sm text-muted">
                    Completá el formulario y te contactaremos
                  </p>
                </div>
              </div>

              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="font-semibold text-midnight-dark mb-2">
                    ¡Mensaje enviado!
                  </h4>
                  <p className="text-sm text-muted">
                    Te responderemos a la brevedad.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-dark mb-2">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                        required
                        placeholder="Tu nombre completo"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white
                                   text-midnight-dark text-sm placeholder:text-muted/60
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
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        placeholder="tu@email.com"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white
                                   text-midnight-dark text-sm placeholder:text-muted/60
                                   focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                                   transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-midnight-dark mb-2">
                      Mensaje
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
                      <textarea
                        value={formData.mensaje}
                        onChange={(e) =>
                          setFormData({ ...formData, mensaje: e.target.value })
                        }
                        rows={3}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white
                                   text-midnight-dark text-sm placeholder:text-muted/60
                                   focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                                   transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm
                               hover:bg-accent-dark transition-all duration-200
                               hover:shadow-lg hover:shadow-accent/30
                               flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Consulta
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted">
          <span>© 2026 Gestoría Legal. Todos los derechos reservados.</span>
          <span>Desarrollado por Joel Cabrera Gelsi</span>
        </div>
      </footer>
    </div>
  );
}
