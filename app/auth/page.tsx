"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Chrome,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
type AuthMode = "login" | "signup";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}

// ─── Animation Variants ──────────────────────────────────────────────────────
const panelVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as number[] },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.97,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
};

// ─── Validation ──────────────────────────────────────────────────────────────
function validate(form: FormState, mode: AuthMode): FieldErrors {
  const errors: FieldErrors = {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.email) errors.email = "Email is required.";
  else if (!emailRe.test(form.email)) errors.email = "Enter a valid email.";

  if (!form.password) errors.password = "Password is required.";
  else if (form.password.length < 8)
    errors.password = "Must be at least 8 characters.";
  else if (!/\d/.test(form.password))
    errors.password = "Must contain at least 1 number.";

  if (mode === "signup") {
    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

// ─── Input Field Component ───────────────────────────────────────────────────
interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon: React.ReactNode;
  placeholder: string;
  autoComplete?: string;
  rightElement?: React.ReactNode;
  index: number;
}

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  error,
  icon,
  placeholder,
  autoComplete,
  rightElement,
  index,
}: InputFieldProps) {
  return (
    <motion.div
      custom={index}
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1.5"
    >
      <label
        htmlFor={id}
        className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full pl-10 pr-${rightElement ? "10" : "4"} py-3 rounded-xl bg-white/5 border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? "border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500"
              : "border-white/10 focus:ring-blue-500/30 focus:border-blue-500/50 hover:border-white/20"
          }`}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-rose-400 font-medium"
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Auth Form Component ─────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const initialMode: AuthMode =
    (searchParams.get("mode") as AuthMode) ?? "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const setField = useCallback(
    (field: keyof FormState) => (value: string) => {
      setForm((f) => ({ ...f, [field]: value }));
      setFieldErrors((e) => ({ ...e, [field]: undefined }));
      setGlobalError(null);
    },
    []
  );

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setGlobalError(null);
    setSuccessMessage(null);
    setFieldErrors({});
    setForm({ email: "", password: "", confirmPassword: "", fullName: "" });
  };

  // ── Email / Password Auth ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);

    const errors = validate(form, mode);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            setGlobalError(
              "An account with this email already exists. Log in instead."
            );
          } else {
            setGlobalError(error.message);
          }
        } else {
          setSuccessMessage(
            "Account created! Check your email to confirm your address, then log in."
          );
        }
      } else {
        // login
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("invalid login")) {
            setGlobalError("Incorrect email or password. Please try again.");
          } else {
            setGlobalError(error.message);
          }
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch {
      setGlobalError(
        "Unable to reach the authentication server. Check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    setOauthLoading(true);
    setGlobalError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
        },
      });
      if (error) setGlobalError(error.message);
    } catch {
      setGlobalError("Google sign-in failed. Please try again.");
    } finally {
      setOauthLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-[#020510] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* ── Background ─────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-700/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-md">
        {/* ── Logo ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Compass size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">
              TripCraft{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                AI
              </span>
            </span>
          </a>
        </motion.div>

        {/* ── Auth Panel ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass-strong rounded-3xl p-8 sm:p-10"
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-slate-400">
                {isLogin
                  ? "Sign in to access your saved itineraries."
                  : "Start planning your perfect trip in seconds."}
              </p>
            </div>

            {/* ── Google OAuth Button ── */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {oauthLoading ? (
                <Loader2 size={16} className="animate-spin text-slate-400" />
              ) : (
                <Chrome size={16} className="text-slate-300" />
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 font-medium">
                or with email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full name — signup only */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    key="fullName"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InputField
                      id="fullName"
                      label="Full Name"
                      type="text"
                      value={form.fullName}
                      onChange={setField("fullName")}
                      error={fieldErrors.fullName}
                      icon={<User size={15} />}
                      placeholder="Ali Hassan"
                      autoComplete="name"
                      index={0}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={setField("email")}
                error={fieldErrors.email}
                icon={<Mail size={15} />}
                placeholder="you@example.com"
                autoComplete="email"
                index={1}
              />

              <InputField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={setField("password")}
                error={fieldErrors.password}
                icon={<Lock size={15} />}
                placeholder={isLogin ? "Your password" : "Min. 8 chars + 1 number"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                index={2}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Confirm password — signup only */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <InputField
                      id="confirmPassword"
                      label="Confirm Password"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={setField("confirmPassword")}
                      error={fieldErrors.confirmPassword}
                      icon={<Lock size={15} />}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      index={3}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                          aria-label={showConfirm ? "Hide" : "Show"}
                        >
                          {showConfirm ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password — login only */}
              {isLogin && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Global error banner */}
              <AnimatePresence>
                {globalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{globalError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success banner */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm"
                  >
                    <CheckCircle
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                    />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !!successMessage}
                className="glow-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isLogin ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* ── Switch mode ── */}
            <p className="text-center text-sm text-slate-400 mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLogin ? "Sign up free" : "Log in"}
              </button>
            </p>

            {/* Terms */}
            {!isLogin && (
              <p className="text-center text-xs text-slate-600 mt-4">
                By creating an account you agree to our{" "}
                <span className="text-slate-500 cursor-pointer hover:text-slate-400">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-slate-500 cursor-pointer hover:text-slate-400">
                  Privacy Policy
                </span>
                .
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}