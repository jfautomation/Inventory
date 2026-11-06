
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  AlertCircle,
  LoaderCircle,
  UserRound,
} from "lucide-react";

import { login } from "../../services/authService";

type Props = {
  onSuccess: () => void;
};

export default function Login({ onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await login(username.trim(), password);

      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071426] px-4 py-10 sm:px-6">

      {/* Background grid and lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px),
            radial-gradient(circle at 15% 20%, rgba(63,118,237,0.22), transparent 32%),
            radial-gradient(circle at 85% 80%, rgba(14,165,233,0.12), transparent 30%)
          `,
          backgroundSize: "48px 48px, 48px 48px, auto, auto",
        }}
      />

      {/* Decorative lighting */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Login content */}
      <div className="relative z-10 w-full max-w-[440px]">

        {/* Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg shadow-black/20">
            <span className="text-2xl font-bold tracking-tight text-white">
              JF
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-[0.18em] text-white">
            JF AUTOMATION
          </h1>

          <p className="mt-2 text-xs font-medium tracking-[0.22em] text-blue-200/70">
            INVENTORY MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Login card */}
        <section className="rounded-2xl border border-white/60 bg-white p-7 shadow-2xl shadow-black/30 sm:p-9">

          <div className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Sign in to access your JF Automation inventory.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Username or Email
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-[#3F76ED] focus:ring-2 focus:ring-[#3F76ED]/15 disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-[#3F76ED] focus:ring-2 focus:ring-[#3F76ED]/15 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#3F76ED] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-600 hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-[#3F76ED] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </section>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized personnel only.
        </p>

        <p className="mt-2 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} JF Automation Inc.
        </p>
      </div>
    </main>
  );
}
