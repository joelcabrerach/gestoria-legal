import Link from "next/link";
import {
  Shield,
  FileText,
  BarChart3,
  ArrowRight,
  Scale,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-midnight flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-midnight-dark tracking-tight">
              Gestoría Legal
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
            <Link href="/precios" className="hover:text-midnight-dark transition-colors">
              Precios
            </Link>
          </nav>
          <Link
            href="/login"
            id="header-login-btn"
            className="px-5 py-2 rounded-lg bg-midnight text-white text-sm font-medium 
                       hover:bg-midnight-light transition-all duration-200 
                       hover:shadow-lg hover:shadow-midnight/20"
          >
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6">
              <Shield className="w-3.5 h-3.5" />
              Plataforma Segura
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-midnight-dark leading-tight mb-6">
              Gestión
              <span className="gradient-text block">Inmobiliaria</span>
              simplificada
            </h1>
            <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
              Seguí el avance de tus trámites en tiempo real. Expedientes,
              documentos y hitos legales, todo en un solo lugar.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                id="hero-cta-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium
                           hover:bg-accent-dark transition-all duration-200 
                           hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
              >
                Acceder al Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-sm text-muted">
                Acceso exclusivo para clientes
              </span>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in stagger-2">
            {[
              {
                icon: FileText,
                title: "Expedientes",
                desc: "Seguimiento completo de cada trámite inmobiliario",
                color: "bg-accent/10 text-accent",
              },
              {
                icon: BarChart3,
                title: "Progreso Real",
                desc: "Barra de avance conectada a hitos reales",
                color: "bg-success/10 text-success",
              },
              {
                icon: Shield,
                title: "Documentos Seguros",
                desc: "Tus archivos protegidos con cifrado",
                color: "bg-warning/10 text-warning",
              },
              {
                icon: Scale,
                title: "Hitos Legales",
                desc: "Desde Notaría hasta inscripción CBR",
                color: "bg-purple-100 text-purple-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border bg-white 
                           hover:shadow-lg hover:shadow-midnight/5 hover:-translate-y-1
                           transition-all duration-300 group"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-midnight-dark mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted">
          <span>© 2026 Gestoría Legal. Todos los derechos reservados.</span>
          <span>Desarrollado por Joel Cabrera Gelsi</span>
        </div>
      </footer>
    </div>
  );
}
