"use client";

import { useState } from "react";
import { Scale, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas. Verificá tu email y contraseña.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) {
      setError("No pudimos enviar el email. Verificá la dirección e intentá de nuevo.");
    } else {
      setResetSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 max-w-md px-12 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/10">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gestoría
            <br />
            <span className="text-accent-light">Legal</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Plataforma de gestión inmobiliaria y legal. Seguí tus trámites en
            tiempo real, desde la tasación hasta la inscripción en el CBR.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "100%", label: "Seguro" },
              { value: "24/7", label: "Acceso" },
              { value: "Real", label: "Tiempo" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-midnight flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-midnight-dark">
              Gestoría Legal
            </span>
          </div>

          {/* ── Reset Password Success ── */}
          {resetSent ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-midnight-dark mb-2">
                ¡Email enviado!
              </h1>
              <p className="text-muted mb-6">
                Revisá tu bandeja de entrada en <strong>{email}</strong>. Te
                enviamos un link para restablecer tu contraseña.
              </p>
              <button
                onClick={() => {
                  setResetMode(false);
                  setResetSent(false);
                  setError(null);
                }}
                className="text-sm text-accent hover:text-accent-dark transition-colors font-medium"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          ) : resetMode ? (
            /* ── Reset Password Form ── */
            <>
              <h1 className="text-2xl font-bold text-midnight-dark mb-2">
                Recuperar contraseña
              </h1>
              <p className="text-muted mb-8">
                Ingresá tu email y te enviaremos un link para restablecerla
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-midnight-dark mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface
                                 text-midnight-dark placeholder:text-muted/60
                                 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                                 transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-accent text-white font-medium
                             hover:bg-accent-dark transition-all duration-200
                             hover:shadow-lg hover:shadow-accent/30
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar Link de Recuperación
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setResetMode(false);
                    setError(null);
                  }}
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </>
          ) : (
            /* ── Login Form ── */
            <>
              <h1 className="text-2xl font-bold text-midnight-dark mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-muted mb-8">
                Ingresá tus credenciales para acceder al portal
              </p>

              {error && (
                <div
                  id="login-error"
                  className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-midnight-dark mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface
                                 text-midnight-dark placeholder:text-muted/60
                                 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                                 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-midnight-dark"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setError(null);
                      }}
                      className="text-xs text-accent hover:text-accent-dark transition-colors font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-surface
                                 text-midnight-dark placeholder:text-muted/60
                                 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                                 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-midnight-dark transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-midnight text-white font-medium
                             hover:bg-midnight-light transition-all duration-200
                             hover:shadow-lg hover:shadow-midnight/20
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <Link
                  href="/"
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
